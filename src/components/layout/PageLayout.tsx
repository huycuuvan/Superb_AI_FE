import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  bgColor?: string;
  titleCentered?: boolean;
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3 top-0' : 'py-4 top-0 bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">Superb AI</Link>
        <nav className="hidden md:flex items-center space-x-5 lg:space-x-7">
          <Link to="/pricing" className="text-md font-medium text-gray-700 hover:text-purple-600 transition-colors">Pricing</Link>
          <Link to="/about" className="text-md font-medium text-gray-700 hover:text-purple-600 transition-colors">About</Link>
          <Link to="/docs" className="text-md font-medium text-gray-700 hover:text-purple-600 transition-colors">Docs</Link>
          <Link to="/blog" className="text-md font-medium text-gray-700 hover:text-purple-600 transition-colors">Blog</Link>
        </nav>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link to="/login" className="text-md font-medium text-gray-700 hover:text-purple-600 transition-colors">Login</Link>
          <Link to="/signup" className="bg-purple-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center group">
            Sign up
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-1.5 transform transition-transform duration-200 group-hover:translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
};

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  pageTitle, 
  pageSubtitle, 
  bgColor = 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100',
  titleCentered = true 
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current.children, {
        opacity: 0,
        y: -30,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col antialiased font-sans selection:bg-pink-300 selection:text-pink-900 ${bgColor}`}>
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-70">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-pink-300/30 rounded-full filter blur-3xl animate-pulse-slower animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-sky-300/30 rounded-full filter blur-3xl animate-pulse-slow animation-delay-500"></div>
      </div>
      
      <Header />
      
      <main className="flex-grow pt-[76px] md:pt-[88px]">
        {(pageTitle || pageSubtitle) && (
          <section ref={headerRef} className={`py-10 md:py-16 bg-transparent ${titleCentered ? 'text-center' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {pageTitle && <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">{pageTitle}</h1>}
              {pageSubtitle && <p className={`text-lg text-slate-600 max-w-2xl ${titleCentered ? 'mx-auto' : ''}`}>{pageSubtitle}</p>}
            </div>
          </section>
        )}
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default PageLayout; 