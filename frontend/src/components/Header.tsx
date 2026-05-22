'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, BookOpen, LayoutDashboard, BrainCircuit, User } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isLinkActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-indigo to-accent-purple flex items-center justify-center shadow-neon-glow transition-transform group-hover:scale-105">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-space group-hover:text-accent-purple transition-colors">
                Article<span className="text-accent-purple font-space">Simplifier</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-colors ${
                isLinkActive('/') 
                  ? 'text-accent-purple bg-accent-purple/5' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide flex items-center space-x-1.5 transition-colors ${
                    isLinkActive('/dashboard')
                      ? 'text-accent-purple bg-accent-purple/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/workspace"
                  className={`px-4 py-2 rounded-xl text-sm font-medium tracking-wide flex items-center space-x-1.5 transition-colors ${
                    isLinkActive('/workspace')
                      ? 'text-accent-purple bg-accent-purple/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Workspace</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Profile Panel / Login Trigger */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Avatar Card */}
                <div className="flex items-center space-x-2 bg-white/5 pl-2 pr-3 py-1 rounded-full border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-accent-purple/20 border border-accent-purple/40"
                  />
                  <span className="hidden sm:inline text-xs font-semibold tracking-wide text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  title="Logout Session"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="neon-button px-5 py-2 rounded-xl text-sm font-semibold tracking-wide text-white flex items-center space-x-1.5"
              >
                <User className="w-4 h-4" />
                <span>Portal Access</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
