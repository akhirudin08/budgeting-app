import React, { useState } from 'react';

// Konfigurasi dari Azure Portal & Microsoft Lists Kamu
const CLIENT_ID = "3ffce125-2890-4390-813c-b6c4b3688fca";
const LIST_ID = "bf3625cd-a331-41cd-8594-d10c93e4d684";

// Interface tipe data sesuai kolom di Microsoft Lists kamu
interface FinancialItem {
  id: string;
  Title: string;
  Amount: number;
  Tipe: 'Pemasukan' | 'Pengeluaran';
  Category: string;
  Date: string;
}

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [items, setItems] = useState<FinancialItem[]>([]);

  // Format Angka ke Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(angka);
  };

  // Kalkulasi Total Pemasukan, Pengeluaran, dan Saldo
  const totalPemasukan = items
    .filter(i => i.Tipe === 'Pemasukan')
    .reduce((acc, i) => acc + (Number(i.Amount) || 0), 0);

  const totalPengeluaran = items
    .filter(i => i.Tipe === 'Pengeluaran')
    .reduce((acc, i) => acc + (Number(i.Amount) || 0), 0);

  const saldoSisa = totalPemasukan - totalPengeluaran;

  return (
    <div style={{ padding: '24px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2>💰 Financial Tracker (Microsoft Lists)</h2>
        <p style={{ color: '#666' }}>Aplikasi Budgeting Personal dengan React & TSX</p>
      </header>

      {!isLoggedIn ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Selamat Datang!</h3>
          <p>Silakan login untuk menghubungkan data Microsoft Lists kamu.</p>
          <button 
            onClick={() => setIsLoggedIn(true)}
            style={{ padding: '10px 20px', fontSize: '16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Connect Microsoft Account
          </button>
        </div>
      ) : (
        <div>
          {/* Dashboard Ringkasan */}
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

          {/* Daftar Transaksi */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3>Riwayat Keuangan</h3>
            {items.length === 0 ? (
              <p style={{ color: '#888' }}>Belum ada data transaksi. Tambahkan data awal dari Microsoft Lists kamu!</p>
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
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: item.Tipe === 'Pemasukan' ? '#2e7d32' : '#c62828' }}>
                        {item.Tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(item.Amount)}
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
