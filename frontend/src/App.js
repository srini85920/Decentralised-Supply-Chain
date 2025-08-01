import { useEffect, useState } from 'react';
import { ethers, isAddress } from 'ethers';
import AddProduct from './components/AddProduct.jsx';
import UpdateStage from './components/UpdateStage.jsx';
import TransferOwnership from './components/TransferOwnership.jsx';
import TrackProduct from './components/TrackProduct.jsx';
import contractInfo from './SupplyChain.json';
import addressJson from './contractAddress.json';
import QRScanner from './components/QRScanner';
import './App.css';

function cleanAddress(addr) {
  return addr
    .normalize("NFKC")
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s/g, '')
    .trim();
}

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const [raw] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const cleaned = cleanAddress(raw);

        if (!isAddress(cleaned)) {
          alert("❌ Cleaned address is not valid");
          return;
        }

        setAccount(cleaned);

        const signer = await provider.getSigner();
        const sc = new ethers.Contract(addressJson.address, contractInfo.abi, signer);
        setContract(sc);
      } catch (err) {
        console.error("App init error:", err);
        alert("❌ Failed to initialize dApp");
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const [selected] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const cleaned = cleanAddress(selected);

      if (!isAddress(cleaned)) {
        alert("❌ Invalid wallet address");
        return;
      }

      setAccount(cleaned);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Supply Chain dApp</h1>
        {account ? (
          <p className="account">Connected: {account}</p>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        <nav className="tabs">
          <button onClick={() => setActiveTab('add')} className={activeTab === 'add' ? 'active' : ''}>Add Product</button>
          <button onClick={() => setActiveTab('update')} className={activeTab === 'update' ? 'active' : ''}>Update Stage</button>
          <button onClick={() => setActiveTab('transfer')} className={activeTab === 'transfer' ? 'active' : ''}>Transfer Ownership</button>
          <button onClick={() => setActiveTab('track')} className={activeTab === 'track' ? 'active' : ''}>Track Product</button>
          <button onClick={() => setActiveTab('qr')} className={activeTab === 'qr' ? 'active' : ''}>Scan QR</button>
        </nav>
      </header>

      <main>
        {activeTab === 'add' && <AddProduct contract={contract} />}
        {activeTab === 'update' && <UpdateStage contract={contract} account={account} />}
        {activeTab === 'transfer' && <TransferOwnership contract={contract} account={account} />}
        {activeTab === 'track' && <TrackProduct contract={contract} />}
        {activeTab === 'qr' && <QRScanner onScan={(id) => {
          setActiveTab('track');
          setTimeout(() => {
            document.querySelector('input[placeholder="Enter Product ID"]').value = id;
            document.querySelector('button').click();
          }, 300);
        }} />}

      </main>
    </div>
  );
}

export default App;
