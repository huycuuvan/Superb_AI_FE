import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
      <header className="w-full py-5 bg-white/80 shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-700">Superb AI</Link>
          <nav className="space-x-6 hidden md:block">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link to="/whats-news" className="text-gray-700 hover:text-purple-600 font-medium">What's News</Link>
            <Link to="/roadmap" className="text-gray-700 hover:text-purple-600 font-medium">Roadmap</Link>
            <Link to="/terms" className="text-purple-600 font-semibold">Terms</Link>
            <Link to="/privacy" className="text-gray-700 hover:text-purple-600 font-medium">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Terms of Use</h1>
        <p className="text-lg text-gray-600 mb-10">Please read these terms and conditions carefully before using Superb AI. By accessing or using our service, you agree to be bound by these terms.</p>
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-purple-700 mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-700">By using Superb AI, you agree to comply with and be legally bound by these terms. If you do not agree, please do not use our service.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-pink-600 mb-2">2. User Responsibilities</h2>
            <p className="text-gray-700">You are responsible for your use of the service and for any content you provide. Do not misuse or attempt to disrupt our platform.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-600 mb-2">3. Intellectual Property</h2>
            <p className="text-gray-700">All content, trademarks, and data on this site are the property of Superb AI or its licensors. You may not use our branding without permission.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-700 mb-2">4. Changes to Terms</h2>
            <p className="text-gray-700">We may update these terms from time to time. Continued use of the service means you accept the new terms.</p>
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

export default TermsOfUse; 