'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';

// Password strength helper
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

export default function ForgotPasswordPage() {
  const router = useRouter();

  // State
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [email, setEmail] = useState('');

  // Step 2
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Refs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle Focus
  useEffect(() => {
    if (step === 1) {
      emailInputRef.current?.focus();
    } else if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  // Handle Resend Cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError('');
      setSuccess('');
    } else {
      router.push('/login');
    }
  };

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await (authService as any).forgotPassword({ email });
      setSuccess('OTP sent! Check your email.');
      setResendCooldown(60);
      
      setTimeout(() => {
        setStep(2);
        setError('');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('No account found with this email');
      } else {
        setError(err?.response?.data?.message || err.message || 'Something went wrong. Try again.');
      }
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
      await (authService as any).forgotPassword({ email });
      setSuccess('A new OTP has been sent.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to resend OTP.');
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
      await (authService as any).resetPassword({
        email,
        otp: otpString,
        newPassword,
        confirmPassword
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Invalid or expired OTP. Please try again.');
      } else {
        setError(err?.response?.data?.message || err.message || 'Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP Handlers
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
    <div className="auth-page">
      <div className="auth-card" style={{ borderTop: '4px solid var(--primary)', maxWidth: '420px', width: '100%', position: 'relative' }}>
        
        {/* Back Arrow */}
        <div 
          onClick={handleBack}
          style={{ position: 'absolute', top: '24px', left: '24px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', transition: 'color 0.2s ease' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ←
        </div>

        {/* Header Section */}
        <div className="auth-logo">
          <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            KathaLife
          </h2>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', height: '2px', backgroundColor: 'var(--border)', left: '50%', right: '50%', width: '40px', transform: 'translateX(-50%)', zIndex: 0 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, marginRight: '40px' }}>
            <div style={{ 
              width: step === 1 ? '10px' : '8px', 
              height: step === 1 ? '10px' : '8px', 
              borderRadius: '50%', 
              backgroundColor: step === 1 ? 'var(--primary)' : 'var(--bg-card)', 
              border: step === 1 ? 'none' : '2px solid var(--primary)',
              margin: '0 auto',
              transition: 'all 0.3s ease'
            }} />
            <span style={{ fontSize: '11px', color: step === 1 ? 'var(--primary)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Email</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
            <div style={{ 
              width: step === 2 ? '10px' : '8px', 
              height: step === 2 ? '10px' : '8px', 
              borderRadius: '50%', 
              backgroundColor: step === 2 ? 'var(--primary)' : 'var(--bg-card)', 
              border: step === 2 ? 'none' : '2px solid var(--border)',
              margin: '0 auto',
              transition: 'all 0.3s ease'
            }} />
            <span style={{ fontSize: '11px', color: step === 2 ? 'var(--primary)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Reset</span>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* -------- STEP 1: EMAIL ENTRY -------- */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Forgot Password?</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Enter your registered email. We&apos;ll send you a 6-digit OTP.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Email address</label>
              <input
                ref={emailInputRef}
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSendOtp}
              className="btn-primary"
              disabled={loading || !email}
            >
              {loading ? <span className="spinner" /> : 'Send OTP'}
            </button>
          </div>
        )}

        {/* -------- STEP 2: OTP + NEW PASSWORD -------- */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Reset Password</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Enter the 6-digit OTP sent to <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{email.length > 20 ? email.substring(0, 20) + '...' : email}</span>
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
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
                  style={{
                    width: '48px', height: '56px', textAlign: 'center', fontSize: '20px', fontWeight: 600,
                    border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`, 
                    borderRadius: '10px',
                    backgroundColor: digit ? 'var(--primary-soft)' : 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none', transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 107, 196, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = digit ? 'var(--primary)' : 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: '6px' }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password Strength Indicator */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
                {[1, 2, 3, 4].map((level) => {
                  let bgColor = '#E5E7EB'; // default gray
                  if (currentScore > 0 && level <= currentScore) {
                    if (currentScore === 1) bgColor = '#C0392B';
                    else if (currentScore === 2) bgColor = '#E67E22';
                    else if (currentScore === 3) bgColor = '#F1C40F';
                    else if (currentScore >= 4) bgColor = '#4A7C59';
                  }
                  return (
                    <div key={level} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: bgColor, transition: 'background-color 0.3s ease' }} />
                  );
                })}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {currentScore > 0 ? strengthLabels[currentScore] : 'Password strength'}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }}>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              {confirmPassword.length > 0 && (
                <span style={{ position: 'absolute', right: '14px', top: '34px', fontSize: '14px', color: newPassword === confirmPassword ? 'var(--success)' : 'var(--error)' }}>
                  {newPassword === confirmPassword ? '✓' : '✗'}
                </span>
              )}
            </div>

            <button onClick={handleResetPassword} className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Didn&apos;t receive OTP?{' '}
              <span 
                onClick={handleResendOtp} 
                className="form-link" 
                style={{ cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', opacity: resendCooldown > 0 ? 0.6 : 1 }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}