// src/components/TrackProduct.jsx
import { useState } from 'react';
import './TrackProduct.css';

const stageName = [
  'Created',
  'In Production',
  'Ready to Ship',
  'In Transit',
  'Delivered',
  'Completed'
];

function TrackProduct({ contract }) {
  const [queryId, setQueryId] = useState('');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState(null);

  const fetch = async () => {
    if (contract && queryId) {
      try {
        const id = parseInt(queryId.trim());
        const data = await contract.getProduct(id);
        const [detailsRaw, owners] = await contract.getHistory(id);

        const details = detailsRaw.map(detail => {
          return {
            stage: Number(detail.stage),
            location: detail.location,
            action: detail.action,
            timestamp: Number(detail.timestamp)
          };
        });

        setProduct(data);
        setHistory({ details, owners });
      } catch (err) {
        console.error("Track error:", err);
        alert("❌ Invalid Product ID or Product not found.");
      }
    }
  };

  return (
    <div className="track-product-container">
      <h2>Track Product</h2>
      <input
        placeholder="Enter Product ID"
        value={queryId}
        onChange={e => setQueryId(e.target.value)}
      />
      <button onClick={fetch}>Fetch</button>

      {product && (
        <div className="product-info">
          <p><strong>ID:</strong> {product[0].toString()}</p>
          <p><strong>Description:</strong> {product[1]}</p>
          <p><strong>Current Owner:</strong> {product[2]}</p>
          <p><strong>Location:</strong> {product[3]}</p>
          <p><strong>Current Stage:</strong> {stageName[Number(product[4])]}</p>
          <p><strong>Ethical:</strong> {product[5] ? 'Yes' : 'No'}</p>
          <p><strong>Compliant:</strong> {product[6] ? 'Yes' : 'No'}</p>
        </div>
      )}

      {history && (
        <div className="timeline">
          <h3>Product Lifecycle</h3>
          <ul>
            {history.details.map((entry, i) => (
              <li key={i} className="timeline-step">
                <div className="dot" />
                <div className="stage-block">
                  <h4>{stageName[entry.stage]}</h4>
                  <p><strong>Location:</strong> {entry.location}</p>
                  <p><strong>Action:</strong> {entry.action}</p>
                  <p><strong>Timestamp:</strong> {new Date(entry.timestamp * 1000).toLocaleString()}</p>
                  <p><strong>Owner:</strong> {history.owners[i]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TrackProduct;
