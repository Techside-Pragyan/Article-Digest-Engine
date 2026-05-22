import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '🌌 AI Article Simplifier | Premium Educational SaaS Reader',
  description: 'Simplify difficult academic articles, research papers, news, and technical concepts into student-friendly, beginner-friendly explanations in seconds.',
  keywords: 'AI, Article Simplifier, Research Paper Simplifier, Study Notes, Flashcards, ELI5, Educational AI',
  authors: [{ name: 'Antigravity AI Team' }],
  openGraph: {
    title: 'AI Article Simplifier | Futuristic Educational SaaS Reader',
    description: 'Deconstruct complex jargon, translate structures, and build revision notes with our AI smart teacher tutor.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased text-foreground bg-[#030712] relative min-h-screen overflow-x-hidden">
        {/* Futuristic background glow particles and radial meshes */}
        <div className="fixed inset-0 z-[-10] w-full h-full bg-[#030712]" />
        
        {/* Dynamic mesh glow blobs */}
        <div className="fixed inset-0 z-[-9] w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-purple/15 blur-[120px] animate-float-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-accent-blue/15 blur-[120px] animate-float-medium" />
          <div className="absolute top-[30%] right-[20%] w-[35%] h-[35%] rounded-full bg-accent-pink/10 blur-[100px] animate-pulse-glow" />
        </div>

        {/* Ambient Grid overlay to give the SaaS product look */}
        <div 
          className="fixed inset-0 z-[-8] w-full h-full pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" 
        />

        <AuthProvider>
          <main className="relative min-h-screen flex flex-col justify-between">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
