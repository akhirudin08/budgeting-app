import React, { useState } from 'react';

// Konfigurasi Client ID dari Azure Portal
const CLIENT_ID = "3ffce125-2890-4390-813c-b6c4b3688fca";

export const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Budgeting App - Personal Microsoft Lists</h1>
      
      {!isLoggedIn ? (
        <button onClick={() => setIsLoggedIn(true)}>
          Login dengan Akun Microsoft
        </button>
      ) : (
        <div>
          <p>Status: Terhubung ke Microsoft Lists</p>
        </div>
      )}
    </div>
  );
};

export default App;
