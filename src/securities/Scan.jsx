import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { API_BASE_URL } from "../api";
import "./security.css";
import Modal from "../components/Modals";

function SecurityScan() {
  const [phase, setPhase] = useState(1); // 1 = person, 2 = device
  const [qrValue, setQrValue] = useState("");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [action, setAction] = useState("in");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);
  const [scannerReady, setScannerReady] = useState(true);

  const personScanned = useRef(false);
  const deviceScanned = useRef(false);
  const lastScanned = useRef(null);


  // Handle scan result
const handleScan = async (value) => {
  if (!value || lastScanned.current === value) return;
  lastScanned.current = value;

  const tokenVal = Cookies.get("token");

  if (phase === 1 && !personScanned.current) {
    personScanned.current = true;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/security/scan/`,
        { qr_value: value },
        { headers: { Authorization: `Bearer ${tokenVal}` } }
      );

      if (res.data.type === "employee" || res.data.type === "guest") {
        setQrValue(value);
        setResult(res.data);
        setPhase(2);
        lastScanned.current = null; // clear for phase 2
      } else {
        throw new Error("Not a valid person QR.");
      }
    } catch (err) {
      const errMsg = err?.response?.data?.detail || "Invalid or expired QR.";
      setError(errMsg);
      setModalMsg(errMsg);
      setModalSuccess(false);
      personScanned.current = false;
    }
  } else if (phase === 2 && !deviceScanned.current) {
    deviceScanned.current = true;
    setDeviceSerial(value);
  }
};

  // Submit to backend
  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const tokenVal = Cookies.get("token");
      const payload = {
        qr_value: qrValue,
        device_serial: deviceSerial || null,
        action,
      };

      const res = await axios.post(`${API_BASE_URL}/api/security/scan/`, payload, {
        headers: { Authorization: `Bearer ${tokenVal}` },
      });

      setResult(res.data);
      setModalMsg(res.data.log || "Scan successful!");
      setModalSuccess(true);
      resetScanState();
    } catch (err) {
      const errMsg = err?.response?.data?.detail || "Scan failed.";
      setError(errMsg);
      setModalMsg(errMsg);
      setModalSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const resetScanState = () => {
  setPhase(1);
  setQrValue("");
  setDeviceSerial("");
  personScanned.current = false;
  deviceScanned.current = false;
  lastScanned.current = null; // Reset the last scanned value
};

  // Stop camera when leaving page
  useEffect(() => {
    setScannerReady(true);
    return () => {
      setScannerReady(false); // disables <QrReader />
    };
  }, []);

  // Camera permission
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true }).catch(() =>
      alert("Camera access denied. Please allow camera permissions.")
    );
  }, []);

  return (
    <div className="security-scan-page">
      <h2>Security QR Scan</h2>

      {/* Modal for success/error */}
      {modalMsg && (
        <Modal
          message={modalMsg}
          onClose={() => setModalMsg("")}
          isSuccess={modalSuccess}
        />
      )}

      <div className="security-qr-reader">
        {scannerReady && (
          <>
            {phase === 1 ? (
              <>
                <p>Step 1: Scan Person QR/Token</p>
                <QrReader
                  constraints={{ facingMode: "environment" }}
                  scanDelay={1000}
                  onResult={(res) => {
                    if (res?.text && !personScanned.current) {
                      handleScan(res.text);
                    }
                  }}
                  containerStyle={{
                    width: "100%",
                    maxWidth: "700px",
                    height: "400px",
                    border: "2px solid #3498db",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                  videoStyle={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div className="scanner-line"></div>
              </>
            ) : (
              <>
                <p>Step 2: Scan Device QR (Optional)</p>
                <QrReader
                  constraints={{ facingMode: "environment" }}
                  scanDelay={800}
                  onResult={(res) => {
                    if (res?.text && !deviceScanned.current) {
                      handleScan(res.text);
                    }
                  }}
                  containerStyle={{
                    width: "100%",
                    maxWidth: "700px",
                    height: "400px",
                    border: "2px solid #2ecc71",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                  videoStyle={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {loading && <p style={{ color: "gray" }}>Validating QR code...</p>}
                <div className="scanner-line"></div>
                <button
                  style={{ marginTop: "20px" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Skip Device & Submit
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Manual fallback */}
      <form onSubmit={handleSubmit} className="security-scan-form">
        <input
          type="text"
          placeholder="QR/Token manually"
          value={qrValue}
          onChange={(e) => setQrValue(e.target.value)}
          disabled={phase !== 1}
        />
        <input
          type="text"
          placeholder="Device Serial (optional)"
          value={deviceSerial}
          onChange={(e) => setDeviceSerial(e.target.value)}
          disabled={phase !== 2}
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="in">Check-In</option>
          <option value="out">Check-Out</option>
        </select>
        <button type="submit" disabled={loading || phase !== 2}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {phase === 2 && (
          <button
            type="button"
            style={{ marginLeft: "10px" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            Skip Device & Submit
          </button>
        )}
      </form>

      {/* Scan results */}
      {error && <div className="security-scan-error">{error}</div>}
      {result && (
        <div className="security-scan-result">
          <h4>{result.type === "device" ? "Device Info" : "Person Info"}</h4>
          <pre
            style={{
              background: "#f8f8f8",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "0.95em",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.person && (
            <>
              <p>
                <strong>Name:</strong> {result.person.full_name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {result.person.email || "N/A"}
              </p>
            </>
          )}
          {result.device && (
            <>
              <p>
                <strong>Device:</strong> {result.device.name}
              </p>
              <p>
                <strong>Serial:</strong> {result.device.serial_number}
              </p>
            </>
          )}
          {result.status && (
            <p>
              <strong>Status:</strong> {result.status}
            </p>
          )}
          {result.log && (
            <p>
              <strong>Log:</strong> {result.log}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SecurityScan;
