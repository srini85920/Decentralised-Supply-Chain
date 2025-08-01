// src/components/TransferOwnership.jsx
import { useState } from 'react';
import './TransferOwnership.css';

function TransferOwnership({ contract }) {
  const [productId, setProductId] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const transfer = async () => {
    if (!contract || !productId || !newOwner) {
      alert("All fields are required.");
      return;
    }

    try {
      const tx = await contract.transferOwnership(
        parseInt(productId),
        newOwner.trim()
      );
      await tx.wait();
      alert("✅ Ownership transferred successfully!");
      setProductId('');
      setNewOwner('');
    } catch (err) {
      console.error("Transfer ownership error:", err);
      alert("❌ Failed to transfer ownership.");
    }
  };

  return (
    <div className="transfer-ownership-container">
      <h2>Transfer Ownership</h2>
      <input
        type="text"
        placeholder="Product ID (e.g., 12345)"
        value={productId}
        onChange={e => setProductId(e.target.value.replace(/\D/g, ''))}
      />
      <input
        type="text"
        placeholder="New Owner Address (0x...)"
        value={newOwner}
        onChange={e => setNewOwner(e.target.value)}
      />
      <button onClick={transfer}>Transfer Ownership</button>
    </div>
  );
}

export default TransferOwnership;
