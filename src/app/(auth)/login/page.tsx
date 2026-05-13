'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';

// Password strength helper
const getPasswordStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, bioCompleted } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setError('');
  };

  // Auth Redirect (on mount)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(bioCompleted ? '/journal' : '/bio');
    }
  }, [isLoading, isAuthenticated, bioCompleted, router]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const authData = await authService.login({
        email: loginEmail,
        password: loginPassword,
      });
      login(authData);
      router.push(authData.bioCompleted ? '/journal' : '/bio');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (getPasswordStrength(signupPassword) < 4) {
      setError('Password must have 8+ chars, uppercase, number, and symbol');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authService.signup({
        email: signupEmail,
        password: signupPassword,
      });
      login(data);
      router.push('/bio');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      if (
        msg.includes('409') ||
        msg.toLowerCase().includes('duplicate') ||
        msg.toLowerCase().includes('exists')
      ) {
        setError('An account with this email already exists. Try logging in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) return null;

  const currentScore = getPasswordStrength(signupPassword);
  const hasMissingFieldsError = error === 'Please fill in all fields';
  const hasPasswordStrengthError = error.toLowerCase().includes('password must');
  const hasPasswordMatchError = error.toLowerCase().includes('passwords do not match');
  const hasAccountError = Boolean(error) && !hasMissingFieldsError && !hasPasswordStrengthError && !hasPasswordMatchError;

  return (
    <main className="katha-auth-page">
      <div className="katha-auth-shell">
        <section className="katha-hero" aria-label="KathaLife writing illustration">
          <span className="sparkle sparkle-one">✦</span>
          <span className="sparkle sparkle-two">✦</span>
          <span className="sparkle sparkle-three">✦</span>
          <span className="sparkle sparkle-four">✦</span>
          <svg
            className="hero-illustration"
            viewBox="0 0 320 240"
            fill="none"
            role="img"
            aria-label="Woman sitting cross-legged writing in a journal"
          >
            <ellipse cx="160" cy="215" rx="94" ry="13" fill="rgba(124,111,232,0.18)" />
            <circle cx="159" cy="69" r="25" fill="#A89CF5" />
            <path d="M130 58c8-25 45-31 62-6 9 13 7 30-3 44-9-9-18-14-33-14-16 0-27 6-37 17-7-13-10-27-5-41Z" fill="#3D3580" />
            <path d="M118 104c14-20 68-22 83 0 10 15 6 52-2 77h-78c-10-25-15-61-3-77Z" fill="#5B4FD4" />
            <path d="M117 126c-19 7-34 20-47 39" stroke="#A89CF5" strokeWidth="15" strokeLinecap="round" />
            <path d="M204 128c21 8 36 20 48 38" stroke="#A89CF5" strokeWidth="15" strokeLinecap="round" />
            <path d="M94 181c28-3 47-1 66 15" stroke="#7C6FE8" strokeWidth="18" strokeLinecap="round" />
            <path d="M226 181c-27-3-47-1-66 15" stroke="#7C6FE8" strokeWidth="18" strokeLinecap="round" />
            <rect x="113" y="145" width="94" height="56" rx="8" fill="#EEEAF8" />
            <path d="M160 145v56" stroke="#9B93C4" strokeWidth="2" />
            <path d="M128 161h22M128 174h18M172 161h24M172 174h18" stroke="#5A5480" strokeWidth="3" strokeLinecap="round" />
            <path d="M209 151l18-12" stroke="#4DC8C8" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </section>

        <section className="katha-form-card">
          <header className="katha-heading">
            <h1>
              {activeTab === 'signup' ? 'Create your' : 'Welcome back to'}{' '}
              <span>KathaLife</span>
            </h1>
            <p>
              {activeTab === 'signup'
                ? 'Start your journey of capturing moments and discovering your story.'
                : 'Return to your moments, memories, and story.'}
            </p>
          </header>

          <div className="social-row" aria-label="Social authentication options">
            <button type="button" className="social-button">
              <span className="google-mark">G</span>
              <span>Google</span>
            </button>
            <button type="button" className="social-button">
              <span className="apple-mark">●</span>
              <span>Apple</span>
            </button>
            <button type="button" className="social-button">
              <Mail size={16} />
              <span>Email</span>
            </button>
          </div>

          <div className="email-divider">
            <span>{activeTab === 'signup' ? 'or sign up with email' : 'or sign in with email'}</span>
          </div>

          {hasAccountError && (
            <div className="auth-error-banner">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="auth-form">
              <div className="auth-field">
                <div className={`input-wrap ${hasMissingFieldsError && !loginEmail ? 'has-error' : ''}`}>
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                {hasMissingFieldsError && !loginEmail && (
                  <p className="field-error"><AlertCircle size={13} /> Email is required</p>
                )}
              </div>

              <div className="auth-field">
                <div className={`input-wrap ${hasMissingFieldsError && !loginPassword ? 'has-error' : ''}`}>
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword((s) => !s)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {hasMissingFieldsError && !loginPassword && (
                  <p className="field-error"><AlertCircle size={13} /> Password is required</p>
                )}
                <Link href="/forgot-password" className="forgot-link" style={{ color: '#EEEAF8' }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="primary-cta"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : <span>Sign In</span>}
                {!loading && <Sparkles size={18} />}
              </button>

              <p className="bottom-switch">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => handleTabSwitch('signup')}>
                  Create one
                </button>
              </p>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="auth-form">
              <div className="auth-field">
                <div className="input-wrap">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className={`input-wrap ${hasMissingFieldsError && !signupEmail ? 'has-error' : ''}`}>
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                {hasMissingFieldsError && !signupEmail && (
                  <p className="field-error"><AlertCircle size={13} /> Email is required</p>
                )}
              </div>

              <div className="auth-field">
                <div className={`input-wrap ${hasMissingFieldsError && !signupPassword ? 'has-error' : ''} ${hasPasswordStrengthError ? 'has-error' : ''}`}>
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowSignupPassword((s) => !s)}
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={`password-hint ${currentScore > 0 ? 'is-active' : ''}`}>
                  <Check size={13} /> At least 8 characters
                </p>
                {(hasMissingFieldsError && !signupPassword) || hasPasswordStrengthError ? (
                  <p className="field-error">
                    <AlertCircle size={13} />
                    {hasPasswordStrengthError ? error : 'Password is required'}
                  </p>
                ) : null}
              </div>

              <div className="auth-field">
                <div className={`input-wrap ${hasMissingFieldsError && !confirmPassword ? 'has-error' : ''} ${hasPasswordMatchError ? 'has-error' : ''}`}>
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {hasMissingFieldsError && !confirmPassword && (
                  <p className="field-error"><AlertCircle size={13} /> Confirm your password</p>
                )}
                {hasPasswordMatchError && (
                  <p className="field-error"><AlertCircle size={13} /> {error}</p>
                )}
                {confirmPassword.length > 0 && !hasPasswordMatchError && (
                  <p className={signupPassword === confirmPassword ? 'match-note is-match' : 'match-note is-error'}>
                    {signupPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSignup}
                className="primary-cta"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : <span>Create Account</span>}
                {!loading && <Sparkles size={18} />}
              </button>

              <p className="legal-copy">
                By signing up, you agree to our{' '}
                <Link href="/terms">Terms of Service</Link> and{' '}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>

              <p className="bottom-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => handleTabSwitch('login')}>
                  Sign in
                </button>
              </p>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .katha-auth-page {
          height: 100svh;
          background: #0D0B1A;
          display: flex;
          justify-content: center;
          font-family: var(--font-body);
          overflow: hidden;
        }

        .katha-auth-shell {
          width: 100%;
          max-width: 480px;
          height: 100svh;
          background: #0D0B1A;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .katha-hero {
          position: relative;
          flex: 0 0 clamp(122px, 28svh, 190px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(circle at center, #1C1836 0%, #0D0B1A 72%);
        }

        .sparkle {
          position: absolute;
          font-size: 20px;
          line-height: 1;
          opacity: 0.9;
        }

        .sparkle-one { top: 20%; left: 13%; color: #7C6FE8; }
        .sparkle-two { top: 16%; right: 19%; color: #4DC8C8; font-size: 16px; }
        .sparkle-three { bottom: 22%; left: 21%; color: #4DC8C8; font-size: 14px; }
        .sparkle-four { bottom: 29%; right: 12%; color: #7C6FE8; font-size: 22px; }

        .hero-illustration {
          width: min(70%, 300px);
          max-height: 24svh;
          filter: drop-shadow(0 24px 36px rgba(0,0,0,0.38));
        }

        .katha-form-card {
          flex: 1;
          min-height: 0;
          background: #13102A;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          padding: 26px 24px calc(22px + env(safe-area-inset-bottom));
          overflow: hidden;
        }

        .katha-heading h1 {
          margin: 0;
          color: #EEEAF8;
          font-family: var(--font-body);
          font-size: 28px;
          font-weight: 700;
          line-height: 1.12;
          letter-spacing: 0;
        }

        .katha-heading h1 span {
          color: #EEEAF8;
          font-family: var(--font-display);
          font-size: 32px;
          font-style: italic;
          font-weight: 600;
        }

        .katha-heading p {
          margin: 10px 0 24px;
          color: #9B93C4;
          font-size: 14px;
          line-height: 1.55;
        }

        .social-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .social-button {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 8px;
          border: 1px solid #2A2550;
          border-radius: 12px;
          background: #1C1836;
          color: #EEEAF8;
          font-family: var(--font-body);
          font-size: 14px;
          cursor: pointer;
        }

        .google-mark,
        .apple-mark {
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #EEEAF8;
          font-size: 13px;
          font-weight: 800;
        }

        .apple-mark {
          color: #EEEAF8;
          font-size: 10px;
        }

        .email-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0 18px;
          color: #5A5480;
          font-size: 12px;
        }

        .email-divider::before,
        .email-divider::after {
          content: '';
          height: 1px;
          flex: 1;
          background: #2A2550;
        }

        .auth-error-banner,
        .field-error {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #E86F8A;
        }

        .auth-error-banner {
          margin-bottom: 14px;
          padding: 10px 12px;
          border: 1px solid rgba(232,111,138,0.28);
          border-radius: 12px;
          background: rgba(232,111,138,0.1);
          font-size: 13px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 52px;
          padding: 0 14px;
          border: 1px solid #2A2550;
          border-radius: 12px;
          background: #1C1836;
          color: #9B93C4;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .input-wrap:focus-within {
          border-color: #7C6FE8;
          box-shadow: 0 0 0 3px rgba(124,111,232,0.2);
        }

        .input-wrap.has-error {
          border-color: #E86F8A;
        }

        .field-icon {
          flex: none;
          color: #9B93C4;
        }

        .input-wrap input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #EEEAF8;
          font-family: var(--font-body);
          font-size: 15px;
        }

        .input-wrap input::placeholder {
          color: #5A5480;
        }

        .input-wrap input:-webkit-autofill,
        .input-wrap input:-webkit-autofill:hover,
        .input-wrap input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1C1836 inset;
          -webkit-text-fill-color: #EEEAF8;
          caret-color: #EEEAF8;
          transition: background-color 9999s ease-out;
        }

        .password-toggle {
          flex: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 9999px;
          background: transparent;
          color: #9B93C4;
          cursor: pointer;
        }

        .field-error {
          margin: 0;
          font-size: 12px;
          line-height: 1.35;
        }

        .password-hint,
        .match-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
          color: #5A5480;
          font-size: 12px;
        }

        .password-hint.is-active,
        .match-note.is-match {
          color: #5EC87A;
        }

        .match-note.is-error {
          color: #E86F8A;
        }

        .forgot-link {
          align-self: flex-end;
          color: #EEEAF8 !important;
          font-size: 13px;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .forgot-link:visited,
        .forgot-link:hover,
        .forgot-link:active {
          color: #EEEAF8 !important;
        }

        .primary-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 56px;
          margin-top: 4px;
          border: 0;
          border-radius: 9999px;
          background: #7C6FE8;
          color: #FFFFFF;
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
        }

        .primary-cta:hover:not(:disabled) {
          background: #5B4FD4;
          transform: translateY(-1px);
        }

        .primary-cta:disabled {
          cursor: not-allowed;
          opacity: 0.72;
        }

        .legal-copy,
        .bottom-switch {
          margin: 4px 0 0;
          color: #5A5480;
          text-align: center;
          font-size: 12px;
          line-height: 1.55;
        }

        .legal-copy a {
          color: #EEEAF8;
          text-decoration: none;
        }

        .bottom-switch {
          margin-top: 6px;
          color: #9B93C4;
          font-size: 14px;
        }

        .bottom-switch button {
          border: 0;
          background: transparent;
          color: #EEEAF8;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        @media (min-width: 481px) {
          .katha-auth-page {
            align-items: center;
            padding: 32px;
          }

          .katha-auth-shell {
            height: min(860px, calc(100svh - 64px));
            border: 1px solid #2A2550;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 24px 70px rgba(0,0,0,0.45);
          }
        }

        @media (max-height: 700px) {
          .katha-hero {
            flex-basis: 116px;
          }

          .hero-illustration {
            width: min(62%, 260px);
            max-height: 105px;
          }

          .katha-form-card {
            padding: 22px 20px calc(18px + env(safe-area-inset-bottom));
          }

          .katha-heading h1 {
            font-size: 25px;
          }

          .katha-heading h1 span {
            font-size: 29px;
          }

          .katha-heading p {
            margin-bottom: 18px;
          }

          .email-divider {
            margin: 18px 0 14px;
          }

          .auth-form {
            gap: 10px;
          }

          .input-wrap {
            min-height: 48px;
          }

          .primary-cta {
            min-height: 52px;
          }
        }
      `}</style>
    </main>
  );
}
