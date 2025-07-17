import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "../components/Modals";
import { API_BASE_URL } from "../api";

function InviteGuest({ profileImageUrl, userName }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    purpose: "",
    visitDate: "",
    id: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("You are not authenticated. Please log in.");
          setShowModal(true);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/employee-profiles/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res?.data?.id) {
          setForm((f) => ({ ...f, invited_by: String(res.data.id) }));
        } else {
          throw new Error();
        }
      } catch {
        setError(
          "Could not determine your employee profile ID. Please contact admin."
        );
        setShowModal(true);
      }
    };
    fetchUserId();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setShowModal(false);

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.purpose ||
      !form.visitDate
    ) {
      setError("All fields are required.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (!/^[0-9+\-\s]{7,}$/.test(form.phone)) {
      setError("Please enter a valid phone number.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("token");
      const payload = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        purpose: form.purpose.trim(),
        visit_date: form.visitDate,
        invited_by: form.invited_by ? Number(form.invited_by) : undefined,
      };

      Object.keys(payload).forEach(
        (key) =>
          (payload[key] === undefined || payload[key] === "") &&
          delete payload[key]
      );

      await axios.post(`${API_BASE_URL}/api/guests/`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      setSuccess("Guest invitation submitted successfully!");
      setShowModal(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        purpose: "",
        visitDate: "",
        invited_by: form.invited_by,
      });
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object" && !Array.isArray(data)) {
          const messages = Object.entries(data)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
            )
            .join(" | ");
          setError(messages);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Failed to submit invitation. Please try again.");
        }
      } else {
        setError("Failed to submit invitation. Please try again.");
      }
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-wrapper">
      <style>{`
      .form-wrapper {
  width: 700px;
 
  background: white;
  padding: 40px;
  border-radius: 12px;
 padding-left: 290px;
}

        @media (max-width: 768px) {
          .invite-wrapper {
            width: 100vw;
            height: 100vh;
            
           
            overflow: hidden;
          }

          .mobile-header {
            height: 15vh;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            position: relative;
            z-index: 1;
          }

          .mobile-header-welcome {
            color: white;
            font-size: 1rem;
            font-weight: 500;
          }

          .mobile-header-profile {
            width: 42px;
            height: 42px;
            border-radius: 9999px;
            overflow: hidden;
            border: 2px solid white;
          }

          .mobile-header-profile img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .mobile-header-overflow {
            position: absolute;
            bottom: 0;
            width: 100%;
            z-index: 1;
          }

          .mobile-header-curve {
            width: 100%;
            height: 40px;
          }

          .form-wrapper {
            position: absolute;
            top: 8vh;
            left: 0;
            width: 100vw;
            height: 88vh;
            background-color: white;
            border-radius: 24px 24px 0 0;
            padding: 30px 20px;
            z-index: 2;
            overflow-y: auto;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
          }

          .login-form-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
          }

          .login-input-group {
            position: relative;
          }

          .login-input {
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 8px;
            outline: none;
          }

          .login-input-label {
            position: absolute;
            top: -10px;
            left: 12px;
            background: white;
            padding: 0 4px;
            font-size: 12px;
            color: #666;
          }

          .login-btn {
            background-color: #007bff;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
          }

          .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      `}</style>

      <div className="form-wrapper">
        <div className="login-form-title">Invite Guest</div>
        <form className="login-form" onSubmit={handleSubmit}>
          {["fullName", "email", "phone", "purpose", "visitDate"].map(
            (field) => (
              <div className="login-input-group" key={field}>
                <input
                  className="login-input"
                  type={
                    field === "visitDate"
                      ? "date"
                      : field === "email"
                      ? "email"
                      : "text"
                  }
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">
                  {field.charAt(0).toUpperCase() +
                    field.slice(1).replace("Name", " Name")}
                </span>
              </div>
            )
          )}

          <input
            type="hidden"
            name="invited_by"
            value={form.invited_by || ""}
          />

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {showModal && (error || success) && (
          <Modal
            message={error || success}
            isSuccess={!!success}
            onClose={() => {
              setShowModal(false);
              setError("");
              setSuccess("");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default InviteGuest;
