// src/components/QRScanner.jsx
import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QRScanner.css';
import {Html5QrcodeSupportedFormats } from "html5-qrcode";
const stageName = [
  'Created',
  'In Production',
  'Ready to Ship',
  'In Transit',
  'Delivered',
  'Completed'
];

function QRScanner({ contract }) {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const initScanner = async () => {
      const scanner = new Html5Qrcode("reader");
      html5QrCodeRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            const cleanId = decodedText.trim();
            setProductId(cleanId);
            await fetchProduct(cleanId);

            if (html5QrCodeRef.current) {
              html5QrCodeRef.current.stop()
                .then(() => {
                  setScannerReady(false);
                })
                .catch((err) => {
                  console.warn("Stop error (already stopped?):", err.message);
                });
            }
          },
          () => {}
        );
        setScannerReady(true);
      } catch (err) {
        console.error("Scanner init failed:", err);
      }
    };

    initScanner();

    return () => {
      if (html5QrCodeRef.current && scannerReady) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [contract]);
const fetchProduct = async (id) => {
  try {
    const cleanedId = parseInt(id.toString().trim().replace(/[^\d]/g, '')); // 🔥 sanitize!
    if (isNaN(cleanedId)) throw new Error("Invalid scanned value");

    const data = await contract.getProduct(cleanedId);
    const [detailsRaw, owners] = await contract.getHistory(cleanedId);

    const details = detailsRaw.map(detail => ({
      stage: Number(detail.stage),
      location: detail.location,
      action: detail.action,
      timestamp: Number(detail.timestamp)
    }));

    setProduct(data);
    setHistory({ details, owners });
  } catch (err) {
    console.error("Track error:", err);
    alert("❌ Invalid Product ID or Product not found.");
  }
};




const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const dummyDivId = "reader-upload";
  if (!document.getElementById(dummyDivId)) {
    const div = document.createElement("div");
    div.id = dummyDivId;
    div.style.display = "none";
    document.body.appendChild(div);
  }

  const scanner = new Html5Qrcode(dummyDivId, {
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
  });

  try {
    const result = await scanner.scanFile(file, true);
    const cleanId = result.trim();

    if (!/^\d+$/.test(cleanId)) {
      alert("❌ QR code must contain only numeric Product ID.");
      return;
    }

    console.log("QR result:", cleanId);
    setProductId(cleanId);
    await fetchProduct(cleanId);
  } catch (err) {
    console.error("Image scan error:", err);
    alert("❌ Unable to read QR code from image.");
  } finally {
    scanner.clear();
  }
};




  return (
    <div className="qr-scanner-container">
      <h2>QR Scanner</h2>
      <div id="reader" />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="qr-upload"
      />

      {product && (
        <div className="product-info">
          <h3>Product Details</h3>
          <p><strong>ID:</strong> {product[0]}</p>
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
          <h3>Lifecycle History</h3>
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

export default QRScanner;
