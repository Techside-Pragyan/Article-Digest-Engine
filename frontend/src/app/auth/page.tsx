'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/GlassCard';
import { ParticleBg } from '@/components/ParticleBg';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, register, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSandboxActive, setIsSandboxActive] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isLoginTab) {
        // Run login pipeline
        const res = await login(email, password);
        if (res.success) {
          setSuccessMessage('Access granted. Authenticating system protocols...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setErrorMessage(res.message || 'Login attempt rejected. Please check credentials.');
        }
      } else {
        // Run register pipeline
        if (!name.trim()) {
          setErrorMessage('Username/Name is required.');
          setIsSubmitting(false);
          return;
        }
        const res = await register(name, email, password);
        if (res.success) {
          setSuccessMessage('Profile synthesized successfully. Syncing database records...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setErrorMessage('Could not connect to authentication services.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxLaunch = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Direct local mock oauth login bypass
      const mockName = name.trim() || 'Guest Researcher';
      const mockEmail = email.trim() || 'sandbox@simplifier.edu';
      const res = await loginWithGoogle(mockName, mockEmail);
      
      if (res.success) {
        setSuccessMessage('Sandbox mode initialized. Deploying local offline environment...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setErrorMessage('Failed to initiate sandbox bypass.');
      }
    } catch (err) {
      setErrorMessage('Sandbox initialization error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen isLoading={true} message="Initializing system protocols..." />;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <ParticleBg />
      <Header />

      <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE: Futuristic Product Values */}
          <div className="hidden md:flex flex-col space-y-6 text-left pr-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center space-x-2 bg-accent-purple/10 px-3.5 py-1 rounded-full border border-accent-purple/20 mb-4">
                <ShieldCheck className="w-4 h-4 text-accent-purple" />
                <span className="text-xs font-semibold tracking-wide text-accent-purple uppercase font-space">
                  Secure Workspace
                </span>
              </div>
              <h2 className="text-3xl font-extrabold font-space tracking-tight text-white leading-snug">
                Step into the future of<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-indigo via-accent-purple to-accent-pink">
                  Active Comprehension.
                </span>
              </h2>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Connect your workspace to unlock fully persistent summaries, track vocabulary indices, and build 3D flashcard decks customized to your courses.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-4 pt-4 border-t border-white/5"
            >
              <div className="flex space-x-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 text-accent-blue mt-0.5 flex-shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-space">AI Decompression Modules</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Real-time Gemini NLP processing handles biology, economics, physics, and legal texts instantly.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-accent-pink/10 flex items-center justify-center border border-accent-pink/20 text-accent-pink mt-0.5 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-space">Personalized Study Decks</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Generate gamified quizzes with detailed explanations and 3D flipped revision flashcards automatically.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Interactive Login Slider Portal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6 md:p-8 border-white/10 shadow-glass-neon relative">
              
              {/* Tab Slider Header */}
              <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-white/5 mb-6 relative">
                <div className="grid grid-cols-2 w-full relative z-10">
                  <button
                    onClick={() => {
                      setIsLoginTab(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`py-2 text-xs md:text-sm font-bold tracking-wide rounded-lg transition-all ${
                      isLoginTab ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Portal Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsLoginTab(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`py-2 text-xs md:text-sm font-bold tracking-wide rounded-lg transition-all ${
                      !isLoginTab ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
                
                {/* Visual Tab Background Slider */}
                <motion.div
                  className="absolute bottom-1.5 top-1.5 rounded-lg bg-gradient-to-r from-accent-indigo/90 to-accent-purple/90 shadow-glass"
                  layout
                  initial={false}
                  animate={{
                    left: isLoginTab ? '6px' : '50%',
                    right: isLoginTab ? '50%' : '6px',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              </div>

              <h3 className="text-xl font-bold font-space text-white text-center mb-6">
                {isLoginTab ? 'Welcome Back, Scholar' : 'Synthesize Your Profile'}
              </h3>

              {/* Status Indicators */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center space-x-2 text-xs mb-4"
                  >
                    <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-emerald-200 rounded-xl flex items-center space-x-2 text-xs mb-4 animate-pulse"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent-emerald flex-shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {!isLoginTab && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-slate-200 placeholder-slate-600 text-sm"
                        placeholder="Dr. Evelyn Chase"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase block">Academic Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-slate-200 placeholder-slate-600 text-sm"
                      placeholder="evelyn.chase@mit.edu"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase block">Access Password</label>
                    {isLoginTab && (
                      <a href="#" className="text-[10px] text-accent-purple hover:underline">
                        Forgot Access?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-slate-200 placeholder-slate-600 text-sm"
                      placeholder="••••••••••••"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full neon-button py-3 mt-4 rounded-xl text-white font-bold tracking-wide text-sm flex items-center justify-center space-x-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{isLoginTab ? 'Decompress Dashboard' : 'Generate Scholar Profile'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* OFFLINE SANDBOX MOCK BYPASS PORTAL */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-slate-600 text-[10px] uppercase font-bold tracking-wider font-space">
                  Sandbox Testing Flow
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-accent-purple/35 bg-accent-purple/5 flex flex-col space-y-3">
                <div className="flex items-start space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-accent-purple mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 font-space">Offline Local Sandbox</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                      Instantly explore all workspaces, dashboards, 3D flashcards, and quizzes offline. Dummy credentials bypass the active server.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSandboxLaunch}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg border border-accent-purple/30 bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple font-bold tracking-wide text-xs transition-all flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Sandbox Bypass</span>
                </button>
              </div>

            </GlassCard>
          </motion.div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
