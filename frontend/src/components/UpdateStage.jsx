// src/components/UpdateStage.jsx
import { useState } from 'react';
import './UpdateStage.css';

function UpdateStage({ contract }) {
  const [productId, setProductId] = useState('');
  const [stage, setStage] = useState(0);
  const [location, setLocation] = useState('');
  const [action, setAction] = useState('');

  const update = async () => {
    if (!contract || !productId || !location || !action) {
      alert("All fields are required.");
      return;
    }

    try {
      const tx = await contract.updateStage(
        parseInt(productId),
        stage,
        location,
        action
      );
      await tx.wait();
      alert("✅ Stage updated successfully");
      setProductId('');
      setStage(0);
      setLocation('');
      setAction('');
    } catch (err) {
      console.error("Update stage error:", err);
      alert("❌ Failed to update stage.");
    }
  };

  return (
    <div className="update-stage-container">
      <h2>Update Product Stage</h2>
      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={e => setProductId(e.target.value.replace(/\D/g, ''))}
      />
      <select value={stage} onChange={e => setStage(Number(e.target.value))}>
        <option value="0">Created</option>
        <option value="1">In Production</option>
        <option value="2">Ready to Ship</option>
        <option value="3">In Transit</option>
        <option value="4">Delivered</option>
        <option value="5">Completed</option>
      </select>
      <input
        type="text"
        placeholder="Location (e.g., Mumbai, India)"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />
      <textarea
        placeholder="Action performed at this stage"
        value={action}
        onChange={e => setAction(e.target.value)}
      />
      <button onClick={update}>Update Stage</button>
    </div>
  );
}

export default UpdateStage;
