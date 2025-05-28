import React from 'react';
import { Link } from 'react-router-dom';

const Roadmap: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
      <header className="w-full py-5 bg-white/80 shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-700">Superb AI</Link>
          <nav className="space-x-6 hidden md:block">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link to="/whats-news" className="text-gray-700 hover:text-purple-600 font-medium">What's News</Link>
            <Link to="/roadmap" className="text-purple-600 font-semibold">Roadmap</Link>
            <Link to="/terms" className="text-gray-700 hover:text-purple-600 font-medium">Terms</Link>
            <Link to="/privacy" className="text-gray-700 hover:text-purple-600 font-medium">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Product Roadmap</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">See what's coming next for Superb AI. We're committed to continuous improvement and transparency. Here's what we're working on:</p>
        <section className="relative pl-6">
          <div className="border-l-4 border-purple-300 absolute h-full left-2 top-0"></div>
          <div className="space-y-10">
            <div className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 bg-purple-400 rounded-full border-2 border-white"></div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-purple-700 mb-1">Q3 2024: AI Voice Chatbot</h2>
                <p className="text-gray-700">Launch of real-time AI voice chatbot for websites and apps.</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 bg-pink-400 rounded-full border-2 border-white"></div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-pink-600 mb-1">Q4 2024: API & Integrations</h2>
                <p className="text-gray-700">Public API and integrations with popular tools (Slack, Notion, Zapier...)</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 bg-indigo-400 rounded-full border-2 border-white"></div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-indigo-600 mb-1">2025: Mobile App</h2>
                <p className="text-gray-700">Superb AI mobile app for iOS & Android.</p>
              </div>
            </div>
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

export default Roadmap; 