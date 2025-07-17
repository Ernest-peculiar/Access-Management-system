// src/security/AttendanceLog.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "./security.css";

function SecurityAccessLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    person_type: "",
    person_name: "",
    device_serial: "",
    status: "",
    timestamp: "",
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE_URL}/api/access-logs/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError("Failed to fetch logs.");
        }
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) =>
    (filter.person_type === "" || (log.person_type || "").toLowerCase().includes(filter.person_type.toLowerCase())) &&
    (filter.person_name === "" || (log.person_name || "").toLowerCase().includes(filter.person_name.toLowerCase())) &&
    (filter.device_serial === "" || (log.device_serial || "").toLowerCase().includes(filter.device_serial.toLowerCase())) &&
    (filter.status === "" || (log.status || "").toLowerCase().includes(filter.status.toLowerCase())) &&
    (filter.timestamp === "" || (log.timestamp || "").includes(filter.timestamp))
  );

  return (
    <div className="attendance-log-page">
      <h2>Recent Access Logs</h2>

      {loading && <p>Loading logs...</p>}
      {error && <p className="security-scan-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Filter Row */}
          <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontWeight: 500, marginRight: 8, color: "#444" }}>Filter:</span>
            <input
              className="login-input"
              style={{ width: 110 }}
              placeholder="Person Type"
              value={filter.person_type}
              onChange={(e) => setFilter({ ...filter, person_type: e.target.value })}
            />
            <input
              className="login-input"
              style={{ width: 120 }}
              placeholder="Person Name"
              value={filter.person_name}
              onChange={(e) => setFilter({ ...filter, person_name: e.target.value })}
            />
            <input
              className="login-input"
              style={{ width: 130 }}
              placeholder="Device Serial"
              value={filter.device_serial}
              onChange={(e) => setFilter({ ...filter, device_serial: e.target.value })}
            />
            <input
              className="login-input"
              style={{ width: 100 }}
              placeholder="Status"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            />
            <input
              className="login-input"
              style={{ width: 140 }}
              placeholder="Timestamp (YYYY-MM-DD)"
              value={filter.timestamp}
              onChange={(e) => setFilter({ ...filter, timestamp: e.target.value })}
            />
            <button
              className="login-btn"
              style={{ background: "#aaa", fontSize: 14, padding: "6px 16px" }}
              onClick={() =>
                setFilter({
                  person_type: "",
                  person_name: "",
                  device_serial: "",
                  status: "",
                  timestamp: "",
                })
              }
              type="button"
            >
              Clear
            </button>
          </div>

          {filteredLogs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            <table className="log-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Type</th>
                  <th>Device</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.person_name || "N/A"}</td>
                    <td style={{ textTransform: "capitalize" }}>{log.person_type || "N/A"}</td>
                    <td>{log.device_serial || "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{log.status || "—"}</td>
                    <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default SecurityAccessLog;
