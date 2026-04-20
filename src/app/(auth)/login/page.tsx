'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { BookOpen } from 'lucide-react';
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

// Hardcoded SSR-safe positions for background words
const backgroundWords = [
  { word: 'வாழ்க்கை', x: '5%', y: '10%', size: '24px', opacity: 0.05, rot: '-12deg' },
  { word: 'memories', x: '82%', y: '12%', size: '28px', opacity: 0.08, rot: '15deg' },
  { word: 'ज़िन्दगी', x: '15%', y: '25%', size: '20px', opacity: 0.04, rot: '8deg' },
  { word: 'കഥ', x: '75%', y: '35%', size: '22px', opacity: 0.07, rot: '-20deg' },
  { word: 'కథ', x: '8%', y: '45%', size: '26px', opacity: 0.09, rot: '22deg' },
  { word: 'গল্প', x: '88%', y: '55%', size: '18px', opacity: 0.06, rot: '-5deg' },
  { word: 'love', x: '20%', y: '65%', size: '15px', opacity: 0.05, rot: '10deg' },
  { word: 'ನೆನಪುಗಳು', x: '70%', y: '75%', size: '21px', opacity: 0.08, rot: '-18deg' },
  { word: 'ഇന്നലെ', x: '12%', y: '85%', size: '19px', opacity: 0.04, rot: '5deg' },
  { story: 'story', x: '85%', y: '90%', size: '27px', opacity: 0.09, rot: '-15deg' },
  { word: 'நேற்று', x: '35%', y: '8%', size: '16px', opacity: 0.06, rot: '25deg' },
  { word: 'യാദें', x: '55%', y: '18%', size: '23px', opacity: 0.07, rot: '-8deg' },
  { word: 'life', x: '45%', y: '30%', size: '25px', opacity: 0.05, rot: '12deg' },
  { word: 'ප್ರೀತಿ', x: '65%', y: '42%', size: '14px', opacity: 0.08, rot: '-22deg' },
  { word: 'ഇന്ന്', x: '30%', y: '52%', size: '20px', opacity: 0.04, rot: '18deg' },
  { word: 'আজ', x: '50%', y: '68%', size: '22px', opacity: 0.09, rot: '-10deg' },
  { word: 'yesterday', x: '40%', y: '82%', size: '17px', opacity: 0.05, rot: '20deg' },
  { word: 'కథ', x: '60%', y: '92%', size: '26px', opacity: 0.07, rot: '-25deg' },
  { word: 'அன்பு', x: '25%', y: '15%', size: '18px', opacity: 0.06, rot: '14deg' },
  { word: 'प्यार', x: '68%', y: '28%', size: '24px', opacity: 0.08, rot: '-16deg' },
  { word: 'moments', x: '38%', y: '40%', size: '15px', opacity: 0.04, rot: '24deg' },
  { word: 'ജീവിതം', x: '58%', y: '58%', size: '27px', opacity: 0.09, rot: '-6deg' },
  { word: 'ಸ್ಮೃತಿ', x: '22%', y: '72%', size: '19px', opacity: 0.05, rot: '11deg' },
  { word: 'ভালোবাসা', x: '78%', y: '80%', size: '21px', opacity: 0.07, rot: '-19deg' },
  { word: 'இன்று', x: '48%', y: '95%', size: '13px', opacity: 0.06, rot: '21deg' },
  { word: 'జ్ఞాపకాలు', x: '92%', y: '22%', size: '25px', opacity: 0.08, rot: '-14deg' },
  { word: 'कहानी', x: '18%', y: '32%', size: '16px', opacity: 0.04, rot: '9deg' },
  { word: 'ഓർമ്മകൾ', x: '82%', y: '48%', size: '23px', opacity: 0.09, rot: '-23deg' },
  { word: 'ಜೀವನ', x: '15%', y: '60%', size: '28px', opacity: 0.05, rot: '17deg' },
  { word: 'জীবন', x: '88%', y: '70%', size: '20px', opacity: 0.07, rot: '-7deg' },
  { word: 'today', x: '28%', y: '88%', size: '14px', opacity: 0.06, rot: '22deg' },
  { word: 'நேற்று', x: '72%', y: '96%', size: '22px', opacity: 0.08, rot: '-13deg' },
  { word: 'ప్రేమ', x: '10%', y: '18%', size: '26px', opacity: 0.04, rot: '16deg' },
  { word: 'कल', x: '90%', y: '30%', size: '17px', opacity: 0.09, rot: '-24deg' },
  { word: 'സ്നേഹം', x: '12%', y: '50%', size: '24px', opacity: 0.05, rot: '11deg' },
  { word: 'ನಿನ್ನೆ', x: '95%', y: '65%', size: '19px', opacity: 0.07, rot: '-17deg' },
  { word: 'গতকাল', x: '8%', y: '78%', size: '21px', opacity: 0.06, rot: '23deg' },
  { word: 'life', x: '94%', y: '85%', size: '15px', opacity: 0.08, rot: '-9deg' },
  { word: 'கதை', x: '32%', y: '22%', size: '27px', opacity: 0.04, rot: '19deg' },
  { word: 'నేడు', x: '62%', y: '12%', size: '20px', opacity: 0.09, rot: '-21deg' },
];

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

  // Helpers for Password Strength Meter
  let strengthText = '';
  let strengthColor = '';
  if (currentScore === 0) { strengthText = 'Weak'; strengthColor = '#E8DDD0'; }
  else if (currentScore === 1) { strengthText = 'Weak'; strengthColor = '#C0392B'; }
  else if (currentScore === 2) { strengthText = 'Fair'; strengthColor = '#E67E22'; }
  else if (currentScore === 3) { strengthText = 'Good'; strengthColor = '#F1C40F'; }
  else if (currentScore === 4) { strengthText = 'Strong'; strengthColor = '#2D6A4F'; }

  return (
    <div className="auth-page" style={{ background: 'transparent' }}>
      
      {/* Blurred Diary Words Effect Layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {backgroundWords.map((item, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              fontSize: item.size,
              color: '#5C3D2E',
              opacity: item.opacity,
              fontFamily: 'Georgia, serif',
              transform: `rotate(${item.rot})`,
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            {item.word || item.story}
          </span>
        ))}
      </div>

      {/* Auth Card Foreground */}
      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <BookOpen size={22} color="var(--accent)" />
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            KathaLife
          </span>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px', marginBottom: '28px' }}>
          Your Life, As a Story
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '10px', padding: '4px', marginBottom: '28px', gap: '4px' }}>
          <button 
            onClick={() => handleTabSwitch('login')}
            style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === 'login' ? 'white' : 'transparent',
              color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'login' ? '0 1px 4px rgba(26,18,8,0.10)' : 'none'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => handleTabSwitch('signup')}
            style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === 'signup' ? 'white' : 'transparent',
              color: activeTab === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'signup' ? '0 1px 4px rgba(26,18,8,0.10)' : 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* -------- LOGIN VIEW -------- */}
        {activeTab === 'login' && (
          <div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <Link href="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '13px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : loading ? 'Logging in...' : 'Login →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              New to KathaLife?{' '}
              <span onClick={() => handleTabSwitch('signup')} className="form-link" style={{ cursor: 'pointer' }}>
                Sign up
              </span>
            </div>
          </div>
        )}

        {/* -------- SIGNUP VIEW -------- */}
        {activeTab === 'signup' && (
          <div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Create a strong password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              
              {/* Password Strength Meter */}
              <div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[1, 2, 3, 4].map((level) => {
                    let bgColor = '#E8DDD0'; // score 0 base
                    if (currentScore > 0 && level <= currentScore) {
                      if (currentScore === 1) bgColor = '#C0392B';
                      else if (currentScore === 2) bgColor = '#E67E22';
                      else if (currentScore === 3) bgColor = '#F1C40F';
                      else if (currentScore >= 4) bgColor = '#2D6A4F';
                    }
                    return (
                      <div 
                        key={level} 
                        style={{ height: '3px', flex: 1, borderRadius: '2px', backgroundColor: bgColor, transition: 'background-color 0.3s ease' }} 
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: strengthColor }}>{strengthText}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>8+ chars, uppercase, number, symbol</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword.length > 0 && (
                <div style={{ fontSize: '12px', marginTop: '4px', color: signupPassword === confirmPassword ? 'var(--success)' : 'var(--error)' }}>
                  {signupPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords don\'t match'}
                </div>
              )}
            </div>

            <button
              onClick={handleSignup}
              className="btn-primary"
              style={{ width: '100%', marginTop: '16px', padding: '13px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : loading ? 'Creating account...' : 'Create Account →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <span onClick={() => handleTabSwitch('login')} className="form-link" style={{ cursor: 'pointer' }}>
                Login
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}