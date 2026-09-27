import React, { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';

const msalConfig = {
  auth: {
    clientId: "3ffce125-2890-4390-813c-b6c4b3688fca",
    authority: "https://login.microsoftonline.com/consumers",
    redirectUri: "https://budgeting-app-sand.vercel.app"
  }
};

const pca = new PublicClientApplication(msalConfig);

interface FinancialItem {
  id: string;
  Title: string;
  Amount: number;
  Tipe: 'Income' | 'Expense';
  Category: string;
  Date: string;
}

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const LIST_ID = "bf3625cd-a331-41cd-8594-d10c93e4d684";

  const handleLoginAndFetch = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await pca.initialize();
      const loginResponse = await pca.loginPopup({
        scopes: ["User.Read", "Sites.ReadWrite.All", "Notes.Read"]
      });

      setIsLoggedIn(true);

      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, loginResponse.accessToken);
        }
      });

      let res;
      try {
        // Coba endpoint standar sites root
        res = await graphClient
          .api(`/me/sites/root/lists/${LIST_ID}/items?expand=fields`)
          .get();
      } catch (e) {
        // Fallback untuk personal Microsoft List
        res = await graphClient
          .api(`/sites/root/lists/${LIST_ID}/items?expand=fields`)
          .get();
      }

      const listData = (res.value || []).map((item: any) => ({
        id: item.id,
        Title: item.fields?.Title || 'Tanpa Judul',
        Amount: Number(item.fields?.Amount) || 0,
        Tipe: (item.fields?.Tipe === 'Expense' || item.fields?.Tipe === 'Pengeluaran') ? 'Expense' : 'Income',
        Category: item.fields?.Category || '-',
        Date: item.fields?.Date ? new Date(item.fields.Date).toLocaleDateString('id-ID') : '-'
      }));

      setItems(listData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || err?.body?.error?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(angka);
  };

  const totalPemasukan = items
    .filter(i => i.Tipe === 'Income')
    .reduce((acc, i) => acc + i.Amount, 0);

  const totalPengeluaran = items
    .filter(i => i.Tipe === 'Expense')
    .reduce((acc, i) => acc + i.Amount, 0);

  const saldoSisa = totalPemasukan - totalPengeluaran;

  return (
    <div style={{ padding: '24px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2>💰 Financial Tracker (Microsoft Lists)</h2>
        <p style={{ color: '#666' }}>Aplikasi Budgeting Personal dengan React & TSX</p>
      </header>

      {errorMsg && (
        <div style={{ padding: '12px', background: '#ffe6e6', color: '#c62828', borderRadius: '6px', marginBottom: '16px', wordBreak: 'break-word' }}>
          <strong>Error Details:</strong> {errorMsg}
        </div>
      )}

      {!isLoggedIn ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Selamat Datang!</h3>
          <p>Silakan login untuk menghubungkan data Microsoft Lists kamu.</p>
          <button 
            onClick={handleLoginAndFetch}
            disabled={loading}
            style={{ padding: '10px 20px', fontSize: '16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            {loading ? 'Connecting...' : 'Connect Microsoft Account'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#e6fffa', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #00b0ff' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>Total Pemasukan</span>
              <h3 style={{ margin: '8px 0 0', color: '#2e7d32' }}>{formatRupiah(totalPemasukan)}</h3>
            </div>
            
            <div style={{ background: '#ffe6e6', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #ff5252' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>Total Pengeluaran</span>
              <h3 style={{ margin: '8px 0 0', color: '#c62828' }}>{formatRupiah(totalPengeluaran)}</h3>
            </div>

            <div style={{ background: '#e6f0ff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #2979ff' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>Sisa Saldo</span>
              <h3 style={{ margin: '8px 0 0', color: saldoSisa >= 0 ? '#1565c0' : '#c62828' }}>{formatRupiah(saldoSisa)}</h3>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3>Riwayat Keuangan</h3>
            {items.length === 0 ? (
              <p style={{ color: '#888' }}>Belum ada data transaksi atau sedang memuat...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Tanggal</th>
                    <th style={{ padding: '10px' }}>Judul</th>
                    <th style={{ padding: '10px' }}>Kategori</th>
                    <th style={{ padding: '10px' }}>Tipe</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{item.Date}</td>
                      <td style={{ padding: '10px' }}>{item.Title}</td>
                      <td style={{ padding: '10px' }}>{item.Category}</td>
                      <td style={{ padding: '10px' }}>{item.Tipe}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: item.Tipe === 'Income' ? '#2e7d32' : '#c62828' }}>
                        {item.Tipe === 'Income' ? '+' : '-'} {formatRupiah(item.Amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
