'use client';

import Link from 'next/link';
import { BookOpen, Mic, Play, Globe, Shield, CalendarDays } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      
      {/* SECTION 1 — Navbar */}
      <header className="navbar" style={{ background: 'white', borderBottom: '1px solid var(--border)', height: '64px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--accent)" />
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em' }}>KathaLife</span>
          </div>
          
          <nav className="navbar-links" style={{ display: 'flex', gap: '32px' }}>
            <a href="#how-it-works" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>How it works</a>
            <a href="#features" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
            <a href="#stories" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Stories</a>
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" className="btn-ghost">
              Login
            </Link>
            <Link href="/login?tab=signup" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* SECTION 2 — Hero */}
        <section style={{ padding: '100px 0 80px', background: 'var(--bg-app)' }}>
          <div className="container hero-grid">
            {/* LEFT COLUMN */}
            <div>
              <div style={{ display: 'inline-block', background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(224,123,57,0.2)', fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '20px' }}>
                ✨ AI-Powered Personal Diary
              </div>
              <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', fontFamily: "Georgia, 'Times New Roman', serif", marginBottom: '20px' }}>
                Your Life,<br/>
                <span style={{ color: 'var(--accent)' }}>As a Story.</span>
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.7, marginBottom: '36px' }}>
                Write your days in any language. Every week, KathaLife weaves them into a beautifully narrated story — in Tamil, Hindi, Telugu, and more.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/login?tab=signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                  Start Your Story — Free
                </Link>
                <a href="#how-it-works" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                  See How It Works
                </a>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '16px' }}>
                No credit card required &nbsp;·&nbsp; Works in 6 Indian languages &nbsp;·&nbsp; Private & encrypted
              </div>
            </div>
            
            {/* RIGHT COLUMN */}
            <div className="hero-visual" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-lg)', transform: 'rotate(1.5deg)', maxWidth: '380px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Tuesday, April 14</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>தமிழ்</span>
              </div>
              <div style={{ fontFamily: "'Patrick Hand', cursive, Georgia, serif", fontSize: '17px', lineHeight: '32px', color: 'var(--text-primary)', backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8DDD0 31px, #E8DDD0 32px)', paddingBottom: '8px' }}>
                Today we visited the old market. The smell of fresh spices reminded me of my grandmother's kitchen...
              </div>
              
              <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, #5C3D2E 0%, #E07B39 100%)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Play size={16} color="white" fill="white" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Weekly Story</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    This week was filled with nostalgic aromas...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — How It Works */}
        <section id="how-it-works" style={{ background: 'white', padding: '96px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: 'var(--text-primary)' }}>
                How KathaLife Works
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                A simple, beautiful ritual to preserve your memories.
              </p>
            </div>

            <div className="steps-grid">
               {/* Step 1 */}
               <div style={{ textAlign: 'center', position: 'relative' }}>
                 <div className="step-connector" />
                 <div style={{ width: '56px', height: '56px', background: 'var(--accent-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 2 }}>
                   <BookOpen size={24} color="var(--accent)" />
                 </div>
                 <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>1. Write or Speak</h3>
                 <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
                   Log your days naturally. Type in your distraction-free diary or simply speak your thoughts aloud.
                 </p>
               </div>

               {/* Step 2 */}
               <div style={{ textAlign: 'center', position: 'relative' }}>
                 <div className="step-connector" />
                 <div style={{ width: '56px', height: '56px', background: 'var(--accent-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 2 }}>
                   <Mic size={24} color="var(--accent)" />
                 </div>
                 <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>2. AI Listens</h3>
                 <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
                   Our empathetic AI pieces together the emotions, people, and places that make your life unique.
                 </p>
               </div>

               {/* Step 3 */}
               <div style={{ textAlign: 'center', position: 'relative' }}>
                 <div style={{ width: '56px', height: '56px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 2, boxShadow: '0 4px 16px rgba(224,123,57,0.4)' }}>
                   <Play size={24} color="white" fill="white" />
                 </div>
                 <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>3. Get Your Story</h3>
                 <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '260px', margin: '0 auto' }}>
                   Every Saturday, receive a beautifully narrated audio chapter of your week in your native language.
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Features */}
        <section id="features" style={{ background: 'var(--bg-app)', padding: '96px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Designed for your peace of mind.
            </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Everything you need. Nothing you don't.
              </p>
            </div>
            
            <div className="features-grid">
              {[
                { icon: Globe, title: "Native Language", desc: "Hear your stories narrated in Tamil, Hindi, Telugu, Malayalam, Kannada and Bengali. It feels like home." },
                { icon: Mic, title: "Voice & Text", desc: "Too tired to type? Just hit record and let your thoughts flow naturally." },
                { icon: CalendarDays, title: "Weekly Ritual", desc: "Build a habit of reflection. Look forward to unlocking your new story every Saturday." },
                { icon: Shield, title: "Deeply Private", desc: "Your memories are yours. Securely encrypted and meant only for your eyes and ears." }
              ].map((feature, idx) => (
                <div key={idx} className="card" style={{ padding: '28px 24px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--accent-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <feature.icon size={20} color="var(--accent)" />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{feature.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — CTA */}
        <section id="stories" style={{ background: 'var(--bg-dark)', padding: '96px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '120px', color: 'rgba(255,255,255,0.05)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
            
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, fontFamily: 'Georgia, serif', color: 'white', lineHeight: 1.1 }}>
              Every week becomes a <br/>
              <span style={{ color: 'var(--accent)' }}>chapter of your life.</span>
            </h2>
            
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', maxWidth: '560px', margin: '20px auto 40px', lineHeight: 1.7 }}>
              Don't let your precious memories fade. KathaLife preserves your emotions, turning fleeting moments into a legacy you can listen to forever.
            </p>
            
            <Link 
              href="/login?tab=signup" 
              className="btn-primary cta-btn"
              style={{ background: 'white', color: 'var(--primary)', padding: '16px 40px', fontSize: '17px' }}
            >
              Create Your Free Account →
            </Link>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '20px' }}>
              <span>✓ Free to start</span>
              <span>✓ No credit card</span>
              <span>✓ Delete anytime</span>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 6 — Footer */}
      <footer style={{ background: 'var(--bg-dark)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 0' }}>
        <div className="container footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--accent)" />
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>KathaLife</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
              &copy; {new Date().getFullYear()} KathaLife. All rights reserved.
            </div>
          </div>
          
          <div className="footer-links" style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy</a>
            <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>Terms</a>
            <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .navbar-links a:hover { color: var(--text-primary) !important; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 64px; }
        .step-connector { position: absolute; top: 28px; left: calc(50% + 36px); right: calc(-50% + 36px); height: 1px; background: var(--border); }
        .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 56px; }
        .cta-btn:hover { background: var(--bg-subtle) !important; }
        .footer-links a:hover { color: rgba(255,255,255,0.7) !important; }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .step-connector { display: none; }
        }
        @media (max-width: 768px) {
          .navbar-links { display: none !important; }
          .steps-grid { grid-template-columns: 1fr; }
          .footer-content { flex-direction: column; gap: 24px; text-align: center; }
          .footer-links { justify-content: center; }
        }
        @media (max-width: 640px) {
          .features-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </>
  );
}