import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Password Reset</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button disabled={loading} type="submit">
          Reset Password
        </button>
      </form>
      <div>
        <Link to="/login">Log In</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
