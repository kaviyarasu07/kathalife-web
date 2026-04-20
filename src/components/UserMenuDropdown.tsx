'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type MenuIcon = 'bio' | 'journal' | 'week' | 'logout';

type MenuItem = {
  label: string;
  route: string;
  icon: Exclude<MenuIcon, 'logout'>;
};

type UserMenuDropdownProps = {
  userName: string;
};

const menuItems: MenuItem[] = [
  { label: 'Edit Bio', route: '/bio', icon: 'bio' },
  { label: 'My Journal', route: '/journal', icon: 'journal' },
  { label: 'Weekly View', route: '/week', icon: 'week' },
];

function getDisplayName(userName: string, email: string | null): string {
  return userName.trim() || email || 'KathaLife';
}

function getInitials(value: string): string {
  const compact = value.trim().replace(/\s+/g, '');
  return (compact.slice(0, 2) || 'KL').toUpperCase();
}

function getTodayValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function MenuSvg({ icon, stroke = '#5C3D2E' }: { icon: MenuIcon; stroke?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon === 'bio' && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </>
      )}
      {icon === 'journal' && (
        <>
          <path d="M4 4h16v16H4z" />
          <path d="M8 9h8M8 13h5" />
        </>
      )}
      {icon === 'week' && (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </>
      )}
      {icon === 'logout' && (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </>
      )}
    </svg>
  );
}

export default function UserMenuDropdown({ userName }: UserMenuDropdownProps) {
  const router = useRouter();
  const { email, logout } = useAuth();
  const avatarRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayValue);
  // Prevent hydration mismatch: don't render initials on server
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const displayName = getDisplayName(userName, email);
  const displayEmail = email || (displayName.includes('@') ? displayName : '');
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (event: MouseEvent) => {
      if (
        !dropdownRef.current?.contains(event.target as Node) &&
        !avatarRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const navigateTo = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  const handleDateChange = (dateValue: string) => {
    setSelectedDate(dateValue);

    if (!dateValue) {
      return;
    }

    setIsOpen(false);
    router.push(`/journal?date=${dateValue}`);
  };

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <div className="z-50" style={{ position: 'fixed', left: '12px', top: '9px' }}>
      <button
        ref={avatarRef}
        type="button"
        aria-label="Open user menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-[42px] w-[42px] items-center justify-center rounded-full border-2 border-[#C8860A] bg-[#5C3D2E] text-sm font-medium text-[#FDFAF5] shadow-[0_4px_16px_rgba(92,61,46,0.18)] transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-[#C8860A]/20 [font-family:'Lora',serif]"
      >
        {!mounted ? (
          <div style={{ width: '42px', height: '42px' }} />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="journal-user-dropdown w-[240px] overflow-hidden border border-[#ddd0b3] bg-[#FDFAF5] shadow-[0_8px_32px_rgba(92,61,46,0.13)]"
          style={{
            position: 'absolute',
            left: '0',
            top: '60px',
            borderRadius: '14px',
          }}
        >
          <div
            className="flex items-center gap-3 border-b border-[#e8dfc8] px-4 pb-3 pt-[14px]"
            style={{ background: 'linear-gradient(135deg, #f5ede0 0%, #FDFAF5 100%)' }}
          >
            <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border-2 border-[#C8860A] bg-[#5C3D2E] text-xs font-medium text-[#FDFAF5] shadow-[0_4px_12px_rgba(92,61,46,0.16)] [font-family:'Lora',serif]">
              {mounted ? initials : <div style={{ width: '38px', height: '38px' }} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium leading-5 text-[#3a2216] [font-family:'Lora',serif]">
                {displayName}
              </p>
              <p className="truncate text-[11px] leading-4 text-[#8a6a55] [font-family:'Lora',serif]">
                {displayEmail || 'KathaLife diary'}
              </p>
            </div>
          </div>

          <p className="px-4 pb-1 pt-2.5 text-[10px] uppercase tracking-[1.2px] text-[#b09070] [font-family:'Lora',serif]">
            Your diary
          </p>

          <div className="px-4 pb-2 pt-1">
            <label
              htmlFor="journal-go-to-date"
              className="mb-1.5 flex items-center gap-[10px] text-[13.5px] text-[#5C3D2E] [font-family:'Lora',serif]"
            >
              <MenuSvg icon="week" />
              <span>Go to date</span>
            </label>
            <input
              id="journal-go-to-date"
              type="date"
              value={selectedDate}
              onChange={(event) => handleDateChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-[#ddd0b3] bg-[#fffaf2] px-3 text-[13px] text-[#5C3D2E] outline-none transition-colors duration-[120ms] focus:border-[#C8860A] [font-family:'Lora',serif]"
            />
          </div>

          <div className="my-1 h-px bg-[#e8dfc8]" />

          <div>
            {menuItems.map((item) => (
              <div
                key={item.route}
                role="menuitem"
                tabIndex={0}
                onClick={() => navigateTo(item.route)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigateTo(item.route);
                  }
                }}
                className="group flex cursor-pointer items-center gap-[10px] border-l-[2.5px] border-l-transparent px-4 py-[9px] transition-[background,border-left-color] duration-[120ms] hover:border-l-[#C8860A] hover:bg-[#f5ede0]"
              >
                <MenuSvg icon={item.icon} />
                <span className="text-[13.5px] text-[#5C3D2E] [font-family:'Lora',serif]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="my-1 h-px bg-[#e8dfc8]" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-[10px] border-0 bg-transparent px-4 py-[9px] text-left text-[13.5px] text-[#b04040] transition-colors duration-[120ms] hover:bg-[#fdf0f0] [font-family:'Lora',serif]"
          >
            <MenuSvg icon="logout" stroke="#b04040" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .journal-user-dropdown {
          animation: journalUserDropdownIn 200ms ease both;
        }

        @keyframes journalUserDropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
