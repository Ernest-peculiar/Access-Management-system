// QRScanner.jsx
import React from "react";
import QRScanner from "./components/QRScanner";

const QRScanner = ({ onScan, onError }) => {
  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "auto" }}>
      <QrReader
        constraints={{ facingMode: "environment" }} // rear camera
        onResult={(result, error) => {
          if (!!result) onScan(result.getText());
          if (!!error) onError(error);
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default QRScanner;
