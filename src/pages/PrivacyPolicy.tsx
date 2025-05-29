import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
      <header className="w-full py-5 bg-white/80 shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-700">Superb AI</Link>
          <nav className="space-x-6 hidden md:block">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link to="/whats-news" className="text-gray-700 hover:text-purple-600 font-medium">What's News</Link>
            <Link to="/roadmap" className="text-gray-700 hover:text-purple-600 font-medium">Roadmap</Link>
            <Link to="/terms" className="text-gray-700 hover:text-purple-600 font-medium">Terms</Link>
            <Link to="/privacy" className="text-purple-600 font-semibold">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600 mb-10">Your privacy is important to us. This policy explains how Superb AI collects, uses, and protects your information.</p>
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-purple-700 mb-2">1. Information We Collect</h2>
            <p className="text-gray-700">We collect information you provide directly, such as your name, email, and usage data. We may also collect technical data automatically.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-pink-600 mb-2">2. How We Use Information</h2>
            <p className="text-gray-700">We use your information to provide, improve, and personalize our services, and to communicate with you about updates and offers.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-600 mb-2">3. Data Security</h2>
            <p className="text-gray-700">We implement security measures to protect your data. However, no system is 100% secure. Please use strong passwords and protect your account.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-700 mb-2">4. Contact Us</h2>
            <p className="text-gray-700">If you have questions about this policy, contact us at support@superbai.com.</p>
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

export default PrivacyPolicy; 