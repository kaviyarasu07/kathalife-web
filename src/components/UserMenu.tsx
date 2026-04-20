'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, LogOut, User } from 'lucide-react';
import { clsx } from 'clsx';
import { authService } from '@/services/authService';

type UserMenuProps = {
  userName: string;
  size?: 'default' | 'large';
  menuAlign?: 'left' | 'right';
};

type MenuActionProps = {
  icon: ReactNode;
  label: string;
  tone?: 'default' | 'danger';
  onSelect: () => void;
};

function getInitial(userName: string): string {
  const trimmed = userName.trim();
  return (trimmed[0] ?? 'U').toUpperCase();
}

function MenuAction({ icon, label, tone = 'default', onSelect }: MenuActionProps) {
  const isDanger = tone === 'danger';

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={clsx(
        'flex w-full appearance-none items-center gap-3 rounded-lg border-0 bg-transparent px-4 py-2.5 text-left text-sm font-medium outline-none transition-all duration-200 [font-family:\'Lora\',serif]',
        isDanger
          ? 'text-[#B42318] hover:bg-red-50 hover:text-[#8A1C13] focus-visible:bg-red-50'
          : 'text-[#3D2B1F] hover:bg-[#F3EEFF] hover:text-[#5B3E8A] focus-visible:bg-[#F3EEFF]',
      )}
    >
      <span
        className={clsx(
          'flex h-8 w-8 flex-none items-center justify-center rounded-lg transition-colors duration-200',
          isDanger ? 'bg-red-50 text-[#B42318]' : 'bg-[#F7F2FF] text-[#6D5796]',
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function UserMenu({
  userName,
  size = 'default',
  menuAlign = 'right',
}: UserMenuProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const displayName = userName.trim() || 'User';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleSignOut = () => {
    authService.logout();
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={clsx(
          'flex cursor-pointer items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-[#F4EDFF] via-[#EADFFF] to-[#D9C7FF] font-semibold text-[#4C3B67] shadow-md shadow-[#5B3E8A]/15 outline-none transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#5B3E8A]/20 focus-visible:ring-2 focus-visible:ring-[#BFA7F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFAF5] [font-family:\'Playfair_Display\',serif]',
          size === 'large' ? 'h-14 w-14 text-2xl' : 'h-11 w-11 text-lg',
        )}
      >
        {getInitial(displayName)}
      </button>

      {isOpen && (
        <div
          role="menu"
          className={clsx(
            'user-menu-panel absolute top-full z-50 mt-3 w-64 rounded-2xl border border-[#EFE7F8] bg-white p-2 shadow-lg shadow-[#4C3B67]/15',
            menuAlign === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right',
          )}
        >
          <div className="border-b border-[#F0EAF7] px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold text-[#2C1810] [font-family:'Playfair_Display',serif]">
              {displayName}
            </p>
            <p className="mt-0.5 text-xs italic text-[#9B8B7A] [font-family:'Lora',serif]">
              Your diary
            </p>
          </div>

          <div className="space-y-1 py-2">
            <MenuAction
              icon={<User size={18} strokeWidth={1.9} />}
              label="Edit Bio"
              onSelect={() => handleNavigate('/bio')}
            />
            <MenuAction
              icon={<BookOpen size={18} strokeWidth={1.9} />}
              label="My Journal"
              onSelect={() => handleNavigate('/journal')}
            />
            <MenuAction
              icon={<CalendarDays size={18} strokeWidth={1.9} />}
              label="Weekly View"
              onSelect={() => handleNavigate('/week')}
            />
          </div>

          <div className="border-t border-[#F0EAF7] pt-2">
            <MenuAction
              icon={<LogOut size={18} strokeWidth={1.9} />}
              label="Sign Out"
              tone="danger"
              onSelect={handleSignOut}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .user-menu-panel {
          animation: userMenuIn 160ms ease-out both;
        }

        @keyframes userMenuIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
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
