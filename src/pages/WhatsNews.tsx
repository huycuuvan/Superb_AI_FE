import React from 'react';
import { Link } from 'react-router-dom';

const WhatsNews: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
      <header className="w-full py-5 bg-white/80 shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-700">Superb AI</Link>
          <nav className="space-x-6 hidden md:block">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link to="/whats-news" className="text-purple-600 font-semibold">What's News</Link>
            <Link to="/roadmap" className="text-gray-700 hover:text-purple-600 font-medium">Roadmap</Link>
            <Link to="/terms" className="text-gray-700 hover:text-purple-600 font-medium">Terms</Link>
            <Link to="/privacy" className="text-gray-700 hover:text-purple-600 font-medium">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">What's News</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">Stay up to date with the latest features, improvements, and announcements from Superb AI. We're always building something new for you!</p>
        <section className="space-y-8">
          <div className="bg-white/80 rounded-xl shadow p-6 border-l-4 border-purple-400">
            <h2 className="text-2xl font-bold text-purple-700 mb-2">🚀 Superb AI v2.0 Released!</h2>
            <p className="text-gray-700 mb-1">We've launched a major update with a brand new dashboard, improved AI chat, and more integrations. Check it out now!</p>
            <span className="text-xs text-gray-400">June 2024</span>
          </div>
          <div className="bg-white/70 rounded-xl shadow p-6 border-l-4 border-pink-300">
            <h2 className="text-xl font-semibold text-pink-600 mb-2">✨ New: Team Collaboration</h2>
            <p className="text-gray-700 mb-1">Invite your teammates and work together in real time. Collaboration has never been easier.</p>
            <span className="text-xs text-gray-400">May 2024</span>
          </div>
          <div className="bg-white/60 rounded-xl shadow p-6 border-l-4 border-indigo-300">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">🔒 Security Improvements</h2>
            <p className="text-gray-700 mb-1">We've enhanced our security infrastructure to keep your data even safer.</p>
            <span className="text-xs text-gray-400">April 2024</span>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Superb AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WhatsNews; 