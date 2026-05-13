'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, KeyRound, Lock, Mail, RotateCcw, Sparkles } from 'lucide-react';
import { authService } from '@/services/authService';

const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 1) {
      emailInputRef.current?.focus();
    } else {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.forgotPassword({ email });
      setSuccess('OTP sent! Check your email.');
      setResendCooldown(60);

      setTimeout(() => {
        setStep(2);
        setError('');
        setSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.forgotPassword({ email });
      setSuccess('A new OTP has been sent.');
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to resend OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    const score = getPasswordStrength(newPassword);
    if (score < 4) {
      setError('Password must contain at least 8 characters, an uppercase letter, a number, and a special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.resetPassword({
        email,
        otp: otpString,
        newPassword,
        confirmPassword,
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Something went wrong. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const currentScore = getPasswordStrength(newPassword);

  return (
    <main className="forgot-page">
      <div className="forgot-shell">
        <section className="forgot-hero" aria-label="Password recovery illustration">
          <span className="sparkle sparkle-one">✦</span>
          <span className="sparkle sparkle-two">✦</span>
          <span className="sparkle sparkle-three">✦</span>
          <svg className="recovery-illustration" viewBox="0 0 320 220" fill="none" role="img" aria-label="Secure password reset email">
            <ellipse cx="160" cy="196" rx="92" ry="12" fill="rgba(124,111,232,0.18)" />
            <rect x="80" y="68" width="160" height="104" rx="18" fill="#1C1836" stroke="#7C6FE8" strokeWidth="4" />
            <path d="M92 82l68 52 68-52" stroke="#A89CF5" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="160" cy="118" r="31" fill="#3D3580" />
            <path d="M148 113v-10c0-8 5-14 12-14s12 6 12 14v10" stroke="#EEEAF8" strokeWidth="6" strokeLinecap="round" />
            <rect x="141" y="111" width="38" height="31" rx="8" fill="#EEEAF8" />
            <circle cx="160" cy="126" r="4" fill="#5B4FD4" />
            <path d="M160 130v6" stroke="#5B4FD4" strokeWidth="4" strokeLinecap="round" />
            <path d="M235 56l14-14M247 56l-12-12" stroke="#4DC8C8" strokeWidth="5" strokeLinecap="round" />
            <path d="M78 50l8-15 8 15 15 8-15 8-8 15-8-15-15-8 15-8Z" fill="#7C6FE8" opacity="0.9" />
          </svg>
        </section>

        <section className="forgot-card">
          <header className="forgot-heading">
            <h1>{step === 1 ? 'Reset your' : 'Create new'} <span>password</span></h1>
            <p>
              {step === 1
                ? 'Enter your registered email. We will send you a 6-digit OTP.'
                : <>Enter the OTP sent to <strong>{email.length > 20 ? `${email.substring(0, 20)}...` : email}</strong></>}
            </p>
          </header>

          <div className="step-row" aria-label={`Step ${step} of 2`}>
            <span className={step === 1 ? 'is-active' : ''}>Email</span>
            <i />
            <span className={step === 2 ? 'is-active' : ''}>Reset</span>
          </div>

          {error && <div className="message is-error"><AlertCircle size={15} /> {error}</div>}
          {success && <div className="message is-success"><Sparkles size={15} /> {success}</div>}

          {step === 1 && (
            <div className="forgot-form">
              <label className="field-label" htmlFor="reset-email">Email address</label>
              <div className="field-wrap">
                <Mail size={18} />
                <input
                  id="reset-email"
                  ref={emailInputRef}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="button" onClick={handleSendOtp} className="forgot-cta" disabled={loading || !email}>
                {loading ? <span className="spinner" /> : <span>Send OTP</span>}
                {!loading && <KeyRound size={18} />}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="forgot-form">
              <div className="otp-row">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              <label className="field-label" htmlFor="new-password">New Password</label>
              <div className="field-wrap">
                <Lock size={18} />
                <input
                  id="new-password"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="strength">
                {[1, 2, 3, 4].map((level) => (
                  <span key={level} className={level <= currentScore ? 'is-filled' : ''} />
                ))}
              </div>
              <p className="strength-label">{currentScore > 0 ? strengthLabels[currentScore] : 'Password strength'}</p>

              <label className="field-label" htmlFor="confirm-password">Confirm Password</label>
              <div className="field-wrap">
                <Lock size={18} />
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="button" onClick={handleResetPassword} className="forgot-cta" disabled={loading}>
                {loading ? <span className="spinner" /> : <span>Reset Password</span>}
                {!loading && <RotateCcw size={18} />}
              </button>

              <p className="resend-copy">
                Didn&apos;t receive OTP?{' '}
                <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </p>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .forgot-page {
          height: 100svh;
          background: #0D0B1A;
          display: flex;
          justify-content: center;
          overflow: hidden;
          font-family: var(--font-body);
        }

        .forgot-shell {
          width: 100%;
          max-width: 480px;
          height: 100svh;
          background: #0D0B1A;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .forgot-hero {
          position: relative;
          flex: 0 0 clamp(132px, 30svh, 210px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(circle at center, #1C1836 0%, #0D0B1A 72%);
        }

        .sparkle {
          position: absolute;
          line-height: 1;
          opacity: 0.9;
        }

        .sparkle-one { top: 18%; left: 16%; color: #7C6FE8; font-size: 22px; }
        .sparkle-two { top: 24%; right: 14%; color: #4DC8C8; font-size: 15px; }
        .sparkle-three { bottom: 18%; right: 24%; color: #7C6FE8; font-size: 17px; }

        .recovery-illustration {
          width: min(72%, 310px);
          max-height: 26svh;
          filter: drop-shadow(0 24px 36px rgba(0,0,0,0.38));
        }

        .forgot-card {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          background: #13102A;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          padding: 28px 24px calc(22px + env(safe-area-inset-bottom));
        }

        .forgot-heading h1 {
          margin: 0;
          color: #EEEAF8;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.12;
        }

        .forgot-heading h1 span {
          font-family: var(--font-display);
          font-size: 32px;
          font-style: italic;
          color: #EEEAF8;
        }

        .forgot-heading p {
          margin: 10px 0 18px;
          color: #9B93C4;
          font-size: 14px;
          line-height: 1.55;
        }

        .forgot-heading strong {
          color: #EEEAF8;
          font-weight: 700;
        }

        .step-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #5A5480;
          font-size: 12px;
          font-weight: 700;
        }

        .step-row span.is-active {
          color: #EEEAF8;
        }

        .step-row i {
          width: 46px;
          height: 1px;
          background: #2A2550;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
        }

        .message.is-error {
          color: #E86F8A;
          background: rgba(232,111,138,0.1);
          border: 1px solid rgba(232,111,138,0.28);
        }

        .message.is-success {
          color: #5EC87A;
          background: rgba(94,200,122,0.1);
          border: 1px solid rgba(94,200,122,0.28);
        }

        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .field-label {
          color: #9B93C4;
          font-size: 12px;
          font-weight: 700;
        }

        .field-wrap {
          min-height: 52px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border: 1px solid #2A2550;
          border-radius: 12px;
          background: #1C1836;
          color: #9B93C4;
        }

        .field-wrap:focus-within,
        .otp-row input:focus {
          border-color: #7C6FE8;
          box-shadow: 0 0 0 3px rgba(124,111,232,0.2);
        }

        .field-wrap input,
        .otp-row input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #EEEAF8;
          font-family: var(--font-body);
          font-size: 15px;
        }

        .field-wrap input::placeholder {
          color: #5A5480;
        }

        .field-wrap input:-webkit-autofill,
        .field-wrap input:-webkit-autofill:hover,
        .field-wrap input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1C1836 inset;
          -webkit-text-fill-color: #EEEAF8;
          caret-color: #EEEAF8;
          transition: background-color 9999s ease-out;
        }

        .otp-row {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 4px;
        }

        .otp-row input {
          height: 48px;
          text-align: center;
          border: 1px solid #2A2550;
          border-radius: 12px;
          background: #1C1836;
          font-size: 18px;
          font-weight: 700;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .strength {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
        }

        .strength span {
          height: 4px;
          border-radius: 9999px;
          background: #2A2550;
        }

        .strength span.is-filled {
          background: #5EC87A;
        }

        .strength-label {
          margin: -4px 0 2px;
          color: #5A5480;
          text-align: right;
          font-size: 11px;
        }

        .forgot-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 54px;
          margin-top: 4px;
          border: 0;
          border-radius: 9999px;
          background: #7C6FE8;
          color: #FFFFFF;
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .forgot-cta:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .resend-copy {
          margin: 6px 0 0;
          color: #9B93C4;
          text-align: center;
          font-size: 13px;
        }

        .resend-copy button {
          border: 0;
          background: transparent;
          color: #EEEAF8;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .resend-copy button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (min-width: 481px) {
          .forgot-page {
            align-items: center;
            padding: 32px;
          }

          .forgot-shell {
            height: min(860px, calc(100svh - 64px));
            border: 1px solid #2A2550;
            border-radius: 28px;
            box-shadow: 0 24px 70px rgba(0,0,0,0.45);
          }
        }

        @media (max-height: 700px) {
          .forgot-hero {
            flex-basis: 118px;
          }

          .recovery-illustration {
            width: min(62%, 260px);
            max-height: 108px;
          }

          .forgot-card {
            padding: 22px 20px calc(18px + env(safe-area-inset-bottom));
          }

          .forgot-heading h1 {
            font-size: 25px;
          }

          .forgot-heading h1 span {
            font-size: 29px;
          }

          .forgot-heading p {
            margin-bottom: 14px;
          }

          .field-wrap {
            min-height: 48px;
          }

          .forgot-cta {
            min-height: 52px;
          }
        }
      `}</style>
    </main>
  );
}
