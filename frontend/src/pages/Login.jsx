// src/pages/Login.jsx
import { useEffect } from 'react';
import Web3 from 'web3';
import './Login.css';

function Login({ account, setAccount }) {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
      } catch (err) {
        alert('❌ Connection failed. Please try again.');
      }
    } else {
      alert('🦊 MetaMask not detected. Please install it to use this dApp.');
    }
  };

  useEffect(() => {
    document.title = 'Login | Supply Chain dApp';
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔗 Connect to MetaMask</h1>
        <p>To access the Supply Chain Dashboard, connect your Ethereum wallet.</p>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
    </div>
  );
}

export default Login;
