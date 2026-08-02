import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      const redirectTo = location.state?.from || '/admin';
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <img src="/brand/logo-horizontal-dark.png" alt="GlobalNest Study Solution" className="admin-login__logo" />
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="admin-form__field">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>
          <div className="admin-form__field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="admin-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
