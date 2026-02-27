import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DisabilitySelector from './DisabilitySelctor';
import { authAPI } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheck, faXmark, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

/* ── Email validation ──────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(email) {
  if (!email) return '';
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address';
  return '';
}

/* ── Password strength logic ───────────────────────────────── */
const PW_CRITERIA = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#d1d5db', '#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];

function getStrength(password) {
  if (!password) return 0;
  return PW_CRITERIA.filter((c) => c.test(password)).length;
}

/* ── PasswordStrengthMeter component ───────────────────────── */
function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => getStrength(password), [password]);
  const results = useMemo(() => PW_CRITERIA.map((c) => ({ ...c, pass: c.test(password) })), [password]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2.5">
      {/* 5-segment bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb',
            }}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold tracking-wide transition-colors duration-300"
          style={{ color: STRENGTH_COLORS[strength] }}
        >
          <FontAwesomeIcon icon={faShieldHalved} className="mr-1" />
          {STRENGTH_LABELS[strength]}
        </span>
        <span className="text-[10px] text-gray-400 font-semibold">{strength}/5</span>
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {results.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200"
            style={{ color: c.pass ? '#22c55e' : '#9ca3af' }}
          >
            <FontAwesomeIcon icon={c.pass ? faCheck : faXmark} className="text-[9px]" />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main LoginForm ────────────────────────────────────────── */
export default function LoginForm() {
  const [isRegister, setIsRegister] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', name: '', disability: '' });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /* ── Email blur handler ── */
  const handleEmailBlur = () => {
    setEmailError(validateEmail(form.email));
  };

  /* ── Step 1 submit ── */
  const handleStep1 = (e) => {
    e.preventDefault();

    // Email validation
    const emailErr = validateEmail(form.email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    if (!form.email || !form.password) return setError('Please fill in all fields');
    if (isRegister && !form.name) return setError('Please enter your name');

    // Password strength gate for register
    if (isRegister && getStrength(form.password) < 3) {
      return setError('Password is too weak. Please meet at least 3 criteria.');
    }

    setError('');
    setEmailError('');

    if (!isRegister) {
      handleLogin();
      return;
    }
    setStep(2);
  };

  /* ── Login ── */
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.login({
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ── */
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
          onClick={() => { setIsRegister(true); setStep(1); setError(''); setEmailError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
            ${isRegister ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
        >
          Register
        </button>
        <button
          onClick={() => { setIsRegister(false); setStep(1); setError(''); setEmailError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
            ${!isRegister ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
        >
          Login
        </button>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-4">
          {/* Name (register only) */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); if (emailError) setEmailError(''); }}
              onBlur={handleEmailBlur}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${emailError
                  ? 'border-red-400 focus:ring-red-300 bg-red-50/50'
                  : 'border-gray-300 focus:ring-purple-400'
                }`}
              autoComplete="email"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
              </button>
            </div>

            {/* Password strength meter (register mode only) */}
            {isRegister && <PasswordStrengthMeter password={form.password} />}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 active:scale-[0.98]"
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
          {error && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              {error}
            </p>
          )}
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
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? 'Creating...' : 'Get Started'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}