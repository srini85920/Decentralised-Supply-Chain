import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ Correct import
import './AddProduct.css';

function AddProduct({ contract }) {
  const [productId, setProductId] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [qrVisible, setQrVisible] = useState(false);

  const submit = async () => {
    if (!contract || !productId || !description || !location) {
      alert("All fields are required.");
      return;
    }

    try {
      const tx = await contract.addProduct(
        parseInt(productId),
        description,
        location
      );
      await tx.wait();
      alert("✅ Product added successfully!");
      setQrVisible(true);
    } catch (err) {
      console.error("Add product error:", err);
      if (err.reason?.includes("Product exists")) {
        alert("❌ Product ID exists. Use a unique one.");
      } else {
        alert("❌ Failed to add product.");
      }
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <input
        type="text"
        placeholder="Enter Product ID"
        value={productId}
        onChange={e => {
          setProductId(e.target.value.replace(/\D/g, ''));
          setQrVisible(false);
        }}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />
      <button onClick={submit}>Add Product</button>

      {qrVisible && (
        <div className="qr-display">
          <h3>Product QR Code:</h3>
          <QRCodeCanvas value={productId} size={180} />
        </div>
      )}
    </div>
  );
}

export default AddProduct;
