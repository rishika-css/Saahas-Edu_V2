import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DisabilitySelector from './DisabilitySelctor';
import { authAPI } from '../../services/api';

export default function LoginForm() {
  const [isRegister, setIsRegister] = useState(true); // Toggle register/login
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', name: '', disability: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields');
    if (isRegister && !form.name) return setError('Please enter your name');
    setError('');

    // If logging in skip disability step and go straight to API
    if (!isRegister) {
      handleLogin();
      return;
    }
    setStep(2);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.login({
        email: form.email,
        password: form.password,
      });
      // data = { token, user: { id, name, accessibilityProfile } }
      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.disability) return setError('Please select your disability type');
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        accessibilityProfile: {
          disabilityType: form.disability,
          preferences: {
            screenReader: form.disability === 'visual',
            signLanguageOverlays: form.disability === 'hearing',
            simplifiedText: form.disability === 'cognitive',
            hapticFeedback: form.disability === 'motor',
          },
        },
      });
      // data = { token, user }
      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Toggle Register / Login */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => { setIsRegister(true); setStep(1); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
            ${isRegister ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
        >
          Register
        </button>
        <button
          onClick={() => { setIsRegister(false); setStep(1); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
            ${!isRegister ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
        >
          Login
        </button>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Continue →' : 'Login'}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-gray-500 text-center">
            Help us personalize your experience
          </p>
          <DisabilitySelector
            selected={form.disability}
            onChange={(val) => setForm({ ...form, disability: val })}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Get Started'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}