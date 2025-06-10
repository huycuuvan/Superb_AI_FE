import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 

// --- ICONS ---

const MenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlayIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const InfoIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const SunIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
    </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7Z"/>
    </svg>
);

const TwitterIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.55v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21c7.34 0 11.35-6.08 11.35-11.35 0-.17 0-.34-.01-.51.78-.57 1.45-1.28 1.99-2.09z"></path>
    </svg>
);

const GithubIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path>
    </svg>
);

const FacebookIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const ZaloIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5l-2.4-2.4c-.3-.3-.3-.8 0-1.1l2.4-2.4c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1L9.9 12.5h4.6c.4 0 .8.4.8.8s-.4.8-.8.8H9.9l1.7 1.7c.3.3.3.8 0 1.1-.1.1-.3.2-.5.2s-.4-.1-.5-.2zm6.1-4.8c-.3.3-.8.3-1.1 0L13.1 9.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l2.4 2.4c.3.3.3.8 0 1.1z"/>
    </svg>
);

const EmailIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const LocationIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Custom hook for detecting when an element is in view
const useInView = (options: IntersectionObserverInit) => {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return [ref, isInView] as const;
};

// Wrapper component for fade-in-up animation on scroll
const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
  return (
        <div 
            ref={ref} 
            className={`${className} transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
            {children}
        </div>
    );
};

// Header Component
const Header = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navLinks = [
        { name: 'Features', href: '#features' }, 
        { name: 'Pricing', href: '#pricing' }, 
        { name: 'Testimonials', href: '#testimonials' }, 
        { name: 'Affiliate', href: '#' }, 
    ];

    const handleScrollTo = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({
            behavior: 'smooth'
        });
        setIsMenuOpen(false);
    };

  return (
        <>
            <header className={`${isDark ? 'bg-slate-900/80 text-white border-slate-700/60' : 'bg-white/80 text-slate-800 border-gray-200/70'} backdrop-blur-lg sticky top-0 z-50 border-b`}>
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3 group relative z-10">
                        <div className={`p-2 ${isDark ? 'bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:shadow-cyan-400/30' : 'bg-gradient-to-br from-purple-600 to-indigo-600 group-hover:shadow-purple-400/30'} rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105`}>
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
                        </div>
                        <span className={`font-bold text-xl ${isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-purple-600'} transition-colors`}>SuperbAI</span>
          </Link>
          
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <a key={link.name} href={link.href} onClick={(e) => handleScrollTo(e, link.href)} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-purple-600'} transition-colors font-medium`}>{link.name}</a>
          ))}
          </nav>

        <div className="flex items-center space-x-4">
                        <button 
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <Link to="/login" className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-purple-600'} transition-colors hidden sm:block font-medium`}>Log in</Link>
                        <Link to="/register" className={`${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-400/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-400/30'} text-white font-semibold px-5 py-2.5 rounded-lg transition-all transform hover:scale-105 shadow-md`}>
                            Try for Free
            </Link>
                        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <CloseIcon className={isDark ? "text-slate-300" : "text-slate-600"} /> : <MenuIcon className={isDark ? "text-slate-300" : "text-slate-600"} />}
                        </button>
          </div>
        </div>
      </header>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 ${isDark ? 'bg-slate-900' : 'bg-white'} z-40 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
                <nav className="flex flex-col items-center justify-center h-full space-y-8">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} onClick={(e) => handleScrollTo(e, link.href)} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-purple-600'} transition-colors text-2xl font-medium`}>{link.name}</a>
                    ))}
                </nav>
            </div>
        </>
    );
};

// Hero Component
const Hero = ({ isDark }: { isDark: boolean }) => {
    const aiAgents = [
        { title: "AI Business Analyst", description: "Generate detailed business reports from raw data.", img: isDark ? "https://placehold.co/300x168/0F172A/0EA5E9?text=Analyst&font=raleway" : "https://placehold.co/300x168/EDE9FE/4C1D95?text=Analyst&font=raleway", views: "5M+ reports generated" },
        { title: "AI Sales Agent", description: "Automate your sales funnel and customer outreach.", img: isDark ? "https://placehold.co/300x168/0F172A/0d9488?text=Sales&font=raleway" : "https://placehold.co/300x168/F5D0FE/701A75?text=Sales&font=raleway", views: "3.2M+ deals closed" },
        { title: "AI Marketing Guru", description: "Craft multi-channel marketing strategies.", img: isDark ? "https://placehold.co/300x168/0F172A/f59e0b?text=Marketing&font=raleway" : "https://placehold.co/300x168/FEF3C7/92400E?text=Marketing&font=raleway", views: "4.1M+ campaigns launched" },
        { title: "AI Content Creator", description: "Produce professional multimedia content in minutes.", img: isDark ? "https://placehold.co/300x168/0F172A/be123c?text=Content&font=raleway" : "https://placehold.co/300x168/FEE2E2/991B1B?text=Content&font=raleway", views: "6.8M+ assets created" },
        { title: "AI Financial Analyst", description: "Analyze financial data and forecast trends.", img: isDark ? "https://placehold.co/300x168/0F172A/16a34a?text=Finance&font=raleway" : "https://placehold.co/300x168/D1FAE5/065F46?text=Finance&font=raleway", views: "2.9M+ analyses performed" },
        { title: "AI Support Specialist", description: "Provide 24/7 customer support with intelligent AI.", img: isDark ? "https://placehold.co/300x168/0F172A/6d28d9?text=Support&font=raleway" : "https://placehold.co/300x168/E0E7FF/3730A3?text=Support&font=raleway", views: "8.5M+ tickets resolved" },
        { title: "AI Data Scientist", description: "Unlock insights with big data and machine learning.", img: isDark ? "https://placehold.co/300x168/0F172A/db2777?text=Data+Sci&font=raleway" : "https://placehold.co/300x168/FCE7F3/9D2670?text=Data+Sci&font=raleway", views: "1.7M+ models trained" },
        { title: "AI HR Manager", description: "Streamline recruitment and HR processes.", img: isDark ? "https://placehold.co/300x168/0F172A/2563eb?text=HR&font=raleway" : "https://placehold.co/300x168/DBEAFE/1E40AF?text=HR&font=raleway", views: "3.4M+ candidates sourced" },
    ];

  return (
        <section className={`${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-800'} relative overflow-hidden`}>
            <div className="absolute inset-0 w-full h-full overflow-hidden opacity-50">
                <div className={`absolute top-0 -left-1/4 w-full h-full ${isDark ? 'bg-gradient-radial from-cyan-500/10 via-blue-600/10 to-transparent' : 'bg-gradient-radial from-purple-200/30 via-indigo-200/30 to-transparent'} rounded-full filter blur-3xl animate-pulse`}></div>
                <div className={`absolute bottom-0 -right-1/4 w-full h-full ${isDark ? 'bg-gradient-radial from-blue-600/10 via-cyan-500/10 to-transparent' : 'bg-gradient-radial from-indigo-200/30 via-purple-200/30 to-transparent'} rounded-full filter blur-3xl animate-pulse animation-delay-1000`}></div>
      </div>

            <div className="container mx-auto px-6 pt-24 pb-28 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left side - Hero Content */}
                    <div className="lg:w-1/2 text-center lg:text-left">
                         <AnimatedSection>
                            <div className={`inline-flex items-center ${isDark ? 'bg-slate-800/50 text-cyan-300 border-slate-700' : 'bg-purple-100/70 text-purple-700 border-purple-200/80'} px-4 py-2 rounded-full text-sm font-semibold mb-6 border`}>
                                <span className={`w-2.5 h-2.5 ${isDark ? 'bg-cyan-400' : 'bg-green-500'} rounded-full mr-3 animate-pulse`}></span>
                                No.1 Platform for AI Agents
        </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                                <span className={`${isDark ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-white' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500'} bg-clip-text text-transparent`}>Viral AI Agents</span>
                                <br />
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>& Automation</span>
        </h1>
                            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed`}>
                                Ideate & automate your business processes faster and cheaper with intelligent, autonomous AI agents.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-5 mb-12">
                                <Link to="/register" className={`${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30'} text-white font-bold px-8 py-3.5 rounded-lg transition-all transform hover:scale-105 w-full sm:w-auto shadow-lg`}>
                                    Get Started - It's Free
          </Link>
                                <button className={`flex items-center justify-center ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} font-semibold space-x-3 transition-colors w-full sm:w-auto group`}>
                                    <div className={`p-3 rounded-full ${isDark ? 'bg-slate-800/80 group-hover:bg-slate-700/80 border-slate-700' : 'bg-gray-200/70 group-hover:bg-gray-300/70 border-gray-300/80'} transition-colors border`}>
                                        <PlayIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-slate-700'}`}/>
        </div>
                                    <span>Watch Demo <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>(90s)</span></span>
                                </button>
              </div>
                             <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} flex items-center justify-center lg:justify-start gap-4`}>
                                <div className="flex -space-x-2 overflow-hidden">
                                    <img className={`inline-block h-8 w-8 rounded-full ring-2 ${isDark ? 'ring-slate-800' : 'ring-white'}`} src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                                    <img className={`inline-block h-8 w-8 rounded-full ring-2 ${isDark ? 'ring-slate-800' : 'ring-white'}`} src="https://images.unsplash.com/photo-1550525811-e586910b323f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                                    <img className={`inline-block h-8 w-8 rounded-full ring-2 ${isDark ? 'ring-slate-800' : 'ring-white'}`} src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
      </div>
                                <p><span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>350k+</span> users trust SuperbAI</p>
        </div>
                        </AnimatedSection>
          </div>

                    {/* Right side - AI Agent Cards */}
                    <div className="lg:w-1/2 w-full">
                        <div className="space-y-4 h-[500px] overflow-hidden [mask-image:_linear-gradient(to_bottom,transparent_0,_black_10%,_black_90%,transparent_100%)]">
                            {/* Row 1 - Scrolling left to right */}
                            <div className="flex space-x-4 animate-scroll-left">
                                {[...aiAgents, ...aiAgents].map((agent, index) => (
                                    <div key={`row1-${index}`} className={`${isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-cyan-400/50' : 'bg-white/70 border-gray-200/80 hover:border-purple-300'} backdrop-blur-sm p-4 rounded-xl border transition-all duration-300 min-w-[280px] flex-shrink-0 hover:-translate-y-1 shadow-lg hover:shadow-xl`}>
                                        <img src={agent.img} alt={agent.title} className={`w-full rounded-lg aspect-video object-cover mb-3 ${isDark ? 'shadow-lg' : 'shadow-md'}`} onError={(e) => (e.target as HTMLImageElement).src='https://placehold.co/300x168/0F172A/ffffff?text=Error'}/>
                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} text-base mb-1`}>{agent.title}</h3>
                                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm mb-2`}>{agent.description}</p>
                                        <p className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-xs font-semibold`}>{agent.views}</p>
        </div>
                                ))}
              </div>
                            
                            {/* Row 2 - Scrolling right to left */}
                            <div className="flex space-x-4 animate-scroll-right">
                                {[...aiAgents.slice().reverse(), ...aiAgents.slice().reverse()].map((agent, index) => (
                                     <div key={`row2-${index}`} className={`${isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-cyan-400/50' : 'bg-white/70 border-gray-200/80 hover:border-purple-300'} backdrop-blur-sm p-4 rounded-xl border transition-all duration-300 min-w-[280px] flex-shrink-0 hover:-translate-y-1 shadow-lg hover:shadow-xl`}>
                                        <img src={agent.img} alt={agent.title} className={`w-full rounded-lg aspect-video object-cover mb-3 ${isDark ? 'shadow-lg' : 'shadow-md'}`} onError={(e) => (e.target as HTMLImageElement).src='https://placehold.co/300x168/0F172A/ffffff?text=Error'}/>
                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} text-base mb-1`}>{agent.title}</h3>
                                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm mb-2`}>{agent.description}</p>
                                        <p className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-xs font-semibold`}>{agent.views}</p>
      </div>
                                ))}
                            </div>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Component
const Features = ({ isDark }: { isDark: boolean }) => {
    return (
        <section id="features" className={`${isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-gray-200'} py-24 overflow-hidden border-t`}>
            <div className="container mx-auto px-6">
                 <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg`}>
                        Transform your business in four simple steps. From idea to full-scale automation, SuperbAI makes it effortless.
                    </p>
                </AnimatedSection>
                
                {/* Step 1 */}
                <AnimatedSection className="mb-24">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 text-center md:text-left">
                            <p className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} font-bold mb-2`}>Step 1: Discover</p>
                            <h3 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Uncover Automation
                                <br />
                                <span className={`${isDark ? 'bg-gradient-to-r from-cyan-400 to-teal-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} bg-clip-text text-transparent`}>Opportunities</span>
                            </h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-6 max-w-md mx-auto md:mx-0`}>
                                Why spend hours brainstorming? Our AI analyzes your workflows to pinpoint the best automation opportunities, saving you time and skyrocketing efficiency.
                            </p>
                            <button className={`mt-8 ${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30'} text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer`}>
                                AI Idea Generator
                            </button>
      </div>
                        <div className="md:w-1/2 w-full">
                            <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 shadow-black/20 hover:bg-slate-800/70 hover:border-slate-600' : 'bg-white/50 border-gray-200 shadow-gray-200/50 hover:bg-white/80 hover:border-gray-300'} backdrop-blur-sm p-6 rounded-xl border shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2`}>
                                <div className={`flex justify-between items-center ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} p-3 rounded-lg mb-8 flex-wrap gap-2`}>
                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Business Automation Ideas</h3>
                                    <div className="flex space-x-2">
                                        <span className={`${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white px-3 py-1 text-sm rounded-md font-semibold`}>Sales</span>
                                        <span className={`${isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-slate-700'} px-3 py-1 text-sm rounded-md`}>Marketing</span>
                                        <span className={`${isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-slate-700'} px-3 py-1 text-sm rounded-md`}>Support</span>
      </div>
    </div>
                                <div className="space-y-3">
                                     <div className={`p-3 ${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/10 hover:shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/20 hover:shadow-purple-500/30'} text-white rounded-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer`}>Automated customer service with 24/7 AI chatbot support.</div>
                                     <div className={`p-3 ${isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/60 hover:text-white' : 'bg-gray-100/70 text-slate-700 hover:bg-gray-200/80 hover:text-slate-800'} rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer`}>Sales pipeline automation with lead scoring and follow-ups.</div>
                                     <div className={`p-3 ${isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/60 hover:text-white' : 'bg-gray-100/70 text-slate-700 hover:bg-gray-200/80 hover:text-slate-800'} rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer`}>Social media content scheduling and performance tracking.</div>
          </div>
        </div>
      </div>
    </div>
                </AnimatedSection>
      
                {/* Step 2 */}
                <AnimatedSection className="mb-24">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="md:w-1/2 text-center md:text-left">
                            <p className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} font-bold mb-2`}>Step 2: Configure</p>
                            <h3 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Setup Requirements &
                                <br />
                                <span className={`${isDark ? 'bg-gradient-to-r from-cyan-400 to-teal-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} bg-clip-text text-transparent`}>Configure Agent</span>
                            </h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-6 max-w-md mx-auto md:mx-0`}>
                                Input your complete requirements, add knowledge bases, create schedules, and configure your AI agent to match your exact business needs.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-8">
                                <button className={`${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm`}>
                                    Add Knowledge
                                </button>
                                <button className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-slate-700'} font-semibold px-4 py-2 rounded-lg transition-all text-sm`}>
                                    Create Schedule
                                </button>
                                <button className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-slate-700'} font-semibold px-4 py-2 rounded-lg transition-all text-sm`}>
                                    Input Requirements
                                </button>
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full">
                            <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600' : 'bg-white/50 border-gray-200 hover:bg-white/80 hover:border-gray-300'} backdrop-blur-sm p-6 rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                                {/* Configuration Interface */}
                                <div className={`${isDark ? 'bg-slate-700/50 hover:bg-slate-700/70' : 'bg-gray-100 hover:bg-gray-200'} p-3 rounded-lg mb-6 transition-all duration-300 hover:shadow-lg cursor-pointer`}>
                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}>Agent Configuration</h3>
                                    <div className="space-y-3">
                                        <div className={`flex justify-between items-center p-2 rounded-md transition-all duration-200 ${isDark ? 'hover:bg-slate-600/30' : 'hover:bg-gray-50'}`}>
                                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm`}>Requirements Input</span>
                                            <span className={`${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'} px-2 py-1 text-xs rounded-md font-semibold`}>Complete</span>
                                        </div>
                                        <div className={`flex justify-between items-center p-2 rounded-md transition-all duration-200 ${isDark ? 'hover:bg-slate-600/30' : 'hover:bg-gray-50'}`}>
                                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm`}>Knowledge Base</span>
                                            <span className={`${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-100 text-purple-700'} px-2 py-1 text-xs rounded-md font-semibold`}>Adding...</span>
                                        </div>
                                        <div className={`flex justify-between items-center p-2 rounded-md transition-all duration-200 ${isDark ? 'hover:bg-slate-600/30' : 'hover:bg-gray-50'}`}>
                                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Schedule Setup</span>
                                            <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-xs`}>Pending</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`${isDark ? 'bg-slate-900/30 hover:bg-slate-900/50' : 'bg-gray-100/50 hover:bg-gray-200/60'} p-4 rounded-lg mb-4 transition-all duration-300 hover:shadow-lg cursor-pointer hover:-translate-y-1`}>
                                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm mb-3 font-semibold`}>
                                        Current Task: Sales Pipeline Automation
                                    </p>
                                    <div className="space-y-2 text-xs">
                                        <div className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'} transition-colors duration-200`}>• Lead scoring algorithm configured</div>
                                        <div className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'} transition-colors duration-200`}>• Email templates uploaded</div>
                                        <div className={`${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'} transition-colors duration-200`}>• CRM integration ready</div>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button className={`flex-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-slate-700 hover:text-slate-800'} px-3 py-2 text-xs rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                                        Upload Files
                                    </button>
                                    <button className={`flex-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-slate-700 hover:text-slate-800'} px-3 py-2 text-xs rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                                        Set Schedule
                                    </button>
      </div>
      </div>
    </div>
                    </div>
                </AnimatedSection>

                {/* Step 3 */}
                <AnimatedSection className="mb-24">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 text-center md:text-left">
                            <p className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} font-bold mb-2`}>Step 3: Monitor</p>
                            <h3 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Review Requirements &
                                <br />
                                <span className={`${isDark ? 'bg-gradient-to-r from-cyan-400 to-teal-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} bg-clip-text text-transparent`}>Track Execution</span>
                            </h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-6 max-w-md mx-auto md:mx-0`}>
                                Monitor your agent's performance in real-time. Review execution status, track results, and optimize workflows as your business grows.
                            </p>
                            <div className="flex space-x-3 mt-8">
                                <button className={`${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm`}>
                                    Deploy
                                </button>
                                <button className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-slate-700'} font-semibold px-4 py-2 rounded-lg transition-all text-sm`}>
                                    Monitor
                                </button>
                                <button className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-slate-700'} font-semibold px-4 py-2 rounded-lg transition-all text-sm`}>
                                    Scale
                                </button>
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full">
                            <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600' : 'bg-white/50 border-gray-200 hover:bg-white/80 hover:border-gray-300'} backdrop-blur-sm p-6 rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                                {/* Monitoring Dashboard */}
                                <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} p-3 rounded-lg mb-6`}>
                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-3`}>Execution Dashboard</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm`}>Agent Status</span>
                                            <span className={`${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'} px-2 py-1 text-xs rounded-md font-semibold`}>Running</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm`}>Tasks Processed</span>
                                            <span className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-sm font-semibold`}>1,247</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm`}>Success Rate</span>
                                            <span className={`${isDark ? 'text-green-400' : 'text-green-600'} text-sm font-semibold`}>98.5%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`${isDark ? 'bg-slate-900/30' : 'bg-gray-100/50'} p-4 rounded-lg mb-4`}>
                                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm mb-3 font-semibold`}>
                                        Recent Activity
                                    </p>
                                    <div className="space-y-2 text-xs">
                                        <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>• Lead qualification completed - 15 qualified leads</div>
                                        <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>• Email sequence sent to 247 prospects</div>
                                        <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>• CRM data synced successfully</div>
          </div>
        </div>
                                
                                <div className="flex space-x-2">
                                    <button className={`flex-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-slate-700 hover:text-slate-800'} px-3 py-2 text-xs rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                                        View Logs
                                    </button>
                                    <button className={`flex-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white' : 'bg-gray-200 hover:bg-gray-300 text-slate-700 hover:text-slate-800'} px-3 py-2 text-xs rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                                        Export Report
                                    </button>
    </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Step 4 */}
                <AnimatedSection className="mb-24">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="md:w-1/2 text-center md:text-left">
                            <p className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} font-bold mb-2`}>Step 4: Complete</p>
                            <h3 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Mission Accomplished &
                                <br />
                                <span className={`${isDark ? 'bg-gradient-to-r from-cyan-400 to-teal-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} bg-clip-text text-transparent`}>Scale Further</span>
                            </h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-6 max-w-md mx-auto md:mx-0`}>
                                Your automation is complete and running smoothly. Now scale to new departments, processes, or create entirely new AI agents for other business needs.
                            </p>
                            <Link to="/register" className={`inline-block mt-8 ${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30'} text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg`}>
                                Start Your Journey
                            </Link>
          </div>
                        <div className="md:w-1/2 w-full">
                            <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600' : 'bg-white/50 border-gray-200 hover:bg-white/80 hover:border-gray-300'} backdrop-blur-sm p-6 rounded-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                                {/* Success Dashboard */}
                                <div className={`${isDark ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/20' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} p-4 rounded-lg mb-6 border`}>
                                    <h3 className={`font-bold ${isDark ? 'text-green-400' : 'text-green-700'} mb-3`}>🎉 Automation Complete!</h3>
                                    <div className="space-y-2">
                                        <div className={`${isDark ? 'text-green-300' : 'text-green-600'} text-sm`}>✅ All requirements fulfilled</div>
                                        <div className={`${isDark ? 'text-green-300' : 'text-green-600'} text-sm`}>✅ Agent deployed successfully</div>
                                        <div className={`${isDark ? 'text-green-300' : 'text-green-600'} text-sm`}>✅ Performance metrics exceeded</div>
      </div>
    </div>
                                
                                <div className={`${isDark ? 'bg-slate-900/30' : 'bg-gray-100/50'} p-4 rounded-lg mb-4`}>
                                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm mb-3 font-semibold`}>
                                        Impact Summary
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-lg font-bold`}>40%</div>
                                            <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs`}>Time Saved</div>
      </div>
                                        <div>
                                            <div className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-lg font-bold`}>85%</div>
                                            <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs`}>Efficiency Boost</div>
    </div>
                                        <div>
                                            <div className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-lg font-bold`}>$25k</div>
                                            <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs`}>Cost Savings</div>
                                        </div>
                                        <div>
                                            <div className={`${isDark ? 'text-cyan-400' : 'text-purple-600'} text-lg font-bold`}>24/7</div>
                                            <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs`}>Uptime</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <button className={`w-full ${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} text-white font-semibold px-4 py-3 rounded-lg transition-all`}>
                                        Create Another Agent
                                    </button>
          </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
          </div>
        </section>
    );
};

import Lottie from 'lottie-react';

// AI Agents Component
const AIAgents = ({ isDark }: { isDark: boolean }) => {
    const agents = [
        {
            title: "AI IT Agent",
            description: "Provides technical support, troubleshoots issues, and manages IT systems.",
            lottieUrl: "https://lottie.host/f1b3b8f5-6e7a-4f8e-9c2d-3a4b5c6d7e8f/KNfAR5dXvA.json",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-orange-400 to-red-500'} flex items-center justify-center shadow-lg`}>
                    <Lottie 
                        animationData={{
                            "v": "5.7.4",
                            "fr": 30,
                            "ip": 0,
                            "op": 60,
                            "w": 100,
                            "h": 100,
                            "nm": "IT Support",
                            "ddd": 0,
                            "assets": [],
                            "layers": [{
                                "ddd": 0,
                                "ind": 1,
                                "ty": 4,
                                "nm": "computer",
                                "sr": 1,
                                "ks": {
                                    "o": {"a": 0, "k": 100},
                                    "r": {"a": 1, "k": [{"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]}, {"t": 59, "s": [360]}]},
                                    "p": {"a": 0, "k": [50, 50, 0]},
                                    "a": {"a": 0, "k": [0, 0, 0]},
                                    "s": {"a": 0, "k": [100, 100, 100]}
                                },
                                "ao": 0,
                                "shapes": [{
                                    "ty": "gr",
                                    "it": [{
                                        "ty": "rc",
                                        "d": 1,
                                        "s": {"a": 0, "k": [40, 30]},
                                        "p": {"a": 0, "k": [0, 0]},
                                        "r": {"a": 0, "k": 4}
                                    }, {
                                        "ty": "fl",
                                        "c": {"a": 0, "k": [1, 1, 1, 1]},
                                        "o": {"a": 0, "k": 100}
                                    }]
                                }],
                                "ip": 0,
                                "op": 60,
                                "st": 0
                            }]
                        }}
                        className="w-8 h-8"
                        loop={true}
                        autoplay={true}
                    />
                </div>
            )
        },
        {
      title: "AI Sales Agent",
            description: "Optimizes sales processes, interacts with potential customers, and closes deals effectively.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 'bg-gradient-to-br from-blue-400 to-cyan-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
            )
        },
        {
      title: "AI Marketing Agent",
            description: "Analyzes markets, creates advertising content, and deploys multi-channel marketing campaigns.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-green-500 to-teal-600' : 'bg-gradient-to-br from-green-400 to-teal-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                </div>
            )
        },
        {
      title: "AI Accountant Agent",
            description: "Manages finances, tracks expenses, prepares financial reports, and forecasts budgets.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-purple-400 to-indigo-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            )
        },
        {
            title: "AI HR Agent",
            description: "Streamlines recruitment processes, manages employee data, and handles HR workflows.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            )
        },
        {
            title: "AI Support Agent",
            description: "Provides 24/7 customer support with intelligent responses and issue resolution.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-emerald-400 to-green-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.458V5m0 14v2.542M21.542 12H19m-14 0H2.458M16.95 7.05L15.536 8.464M8.464 15.536L7.05 16.95" />
                    </svg>
                </div>
            )
        },
        {
            title: "AI Data Analyst",
            description: "Analyzes complex datasets, generates insights, and creates comprehensive reports.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-yellow-400 to-orange-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )
        },
        {
            title: "AI Content Creator",
            description: "Generates engaging content, writes copy, and creates multimedia materials for marketing.",
            icon: (
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-violet-400 to-purple-500'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            )
        }
  ];

  return (
        <section className={`${isDark ? 'bg-slate-800 text-white' : 'bg-gray-50 text-slate-800'} py-24 relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
                <div className={`absolute top-10 left-1/4 w-32 h-32 ${isDark ? 'bg-cyan-400/10' : 'bg-purple-300/20'} rounded-full filter blur-xl`}></div>
                <div className={`absolute bottom-20 right-1/4 w-48 h-48 ${isDark ? 'bg-blue-400/10' : 'bg-indigo-300/20'} rounded-full filter blur-xl`}></div>
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
                <AnimatedSection className="text-center mb-16">
                    <div className={`inline-flex items-center ${isDark ? 'bg-slate-700/50 text-cyan-300 border-slate-600' : 'bg-purple-100/70 text-purple-700 border-purple-200'} px-4 py-2 rounded-full text-sm font-semibold mb-6 border backdrop-blur-sm`}>
                        <span className={`w-2 h-2 ${isDark ? 'bg-cyan-400' : 'bg-purple-500'} rounded-full mr-2 animate-pulse`}></span>
                        POPULAR AI AGENTS
                    </div>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        AI Built for Every Scenario
          </h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg max-w-3xl mx-auto`}>
                        Delegate tasks to specialized AI agents and watch your productivity soar.
                    </p>
                </AnimatedSection>

                <AnimatedSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {agents.map((agent, index) => (
                            <div 
                                key={index}
                                className={`${isDark 
                                    ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 hover:border-slate-600' 
                                    : 'bg-white/90 border-gray-200/60 hover:bg-white hover:border-purple-300/50 shadow-lg hover:shadow-purple-200/20'
                                } backdrop-blur-sm p-6 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group relative overflow-hidden`}
                            >
                                <div className="text-center">
                                    <div className="transform transition-transform duration-300 group-hover:scale-110">
                                        {agent.icon}
        </div>
                                    <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-purple-600'}`}>
                                        {agent.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'}`}>
                                        {agent.description}
                                    </p>
                                </div>
                                
                                {/* Hover overlay effect */}
                                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : 'bg-gradient-to-br from-purple-500/8 to-indigo-500/8'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>
      </div>
    </section>
  );
};

// Pricing Component
const Pricing = ({ isDark }: { isDark: boolean }) => {
    const plans = [
        { 
            name: 'Essential', 
            price: { monthly: 20, annually: 14 }, 
            description: 'For individuals and small teams starting out.', 
            features: [ 
                { name: '5 AI Agents', included: true },
                { name: '10,000 tasks/month', included: true },
                { name: 'Basic Templates', included: true },
                { name: 'Email Support', included: true },
                { name: 'Custom AI Training', included: false }, 
                { name: 'Advanced Analytics', included: false }, 
                { name: 'API Access', included: false },
                { name: 'Team Collaboration (3 seats)', included: false },
            ], 
            popular: false 
        },
        { 
            name: 'Premium', 
            price: { monthly: 40, annually: 28 }, 
            description: 'For growing businesses that need more power.',
            features: [ 
                { name: '25 AI Agents', included: true },
                { name: '50,000 tasks/month', included: true },
                { name: 'Premium Templates', included: true },
                { name: 'Priority Email & Chat Support', included: true },
                { name: 'Custom AI Training', included: true }, 
                { name: 'Advanced Analytics', included: true }, 
                { name: 'API Access', included: true },
                { name: 'Team Collaboration (10 seats)', included: false },
            ], 
            popular: true 
        },
        { 
            name: 'Ultimate', 
            price: { monthly: 80, annually: 56 }, 
            description: 'For large teams and enterprises scaling up.', 
            features: [ 
                { name: 'Unlimited AI Agents', included: true },
                { name: 'Unlimited tasks', included: true },
                { name: 'All Templates & Features', included: true },
                { name: 'Dedicated Support', included: true },
                { name: 'Custom AI Training', included: true }, 
                { name: 'Advanced Analytics', included: true }, 
                { name: 'API Access', included: true },
                { name: 'Team Collaboration (Unlimited)', included: true },
            ], 
            popular: false 
        },
    ];

    const [billingCycle, setBillingCycle] = useState('annually');

  return (
        <section id="pricing" className={`${isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-gray-50 text-slate-800 border-gray-200'} py-24 overflow-hidden border-t`}>
            <AnimatedSection className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Flexible Pricing for Teams of All Sizes</h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg max-w-2xl mx-auto`}>Choose the perfect plan for your needs. No surprises, cancel anytime.</p>
                
                <div className={`mt-10 inline-flex items-center ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-gray-200'} p-1.5 rounded-lg border shadow-lg`}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 sm:px-6 py-2 rounded-md transition-all text-sm sm:text-base font-semibold ${billingCycle === 'monthly' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white shadow-md text-purple-600') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}
                    >
                        Monthly
                    </button>
      <button
                        onClick={() => setBillingCycle('annually')}
                        className={`px-4 sm:px-6 py-2 rounded-md transition-all relative text-sm sm:text-base font-semibold ${billingCycle === 'annually' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white shadow-md text-purple-600') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}
                    >
                        Annually
                        <span className={`absolute -top-3 -right-3 ${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-indigo-500'} text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase`}>Save 30%</span>
      </button>
    </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`${isDark ? 'bg-slate-800/50 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'} p-8 rounded-2xl text-left flex flex-col transition-all duration-300 border
                            ${plan.popular ? (isDark ? 'border-cyan-400/80 relative scale-105 shadow-2xl shadow-cyan-500/10' : 'border-purple-400/80 relative scale-105 shadow-2xl shadow-purple-500/10') : (isDark ? 'border-slate-700' : 'border-gray-200')}`}>
              
                            {plan.popular && <span className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>Most Popular</span>}

                            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-2 h-12`}>{plan.description}</p>

                            <div className="flex items-baseline mt-6">
                                <span className={`text-5xl font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>${plan.price[billingCycle]}</span>
                                <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} ml-1.5`}>/ month</span>
                                {billingCycle === 'annually' && <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-lg font-semibold line-through ml-4`}>${plan.price.monthly}</span>}
        </div>
                            <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-sm mt-1`}>Billed {billingCycle}</p>
              
                            <ul className="space-y-4 mt-8 flex-grow">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start">
                                        {feature.included 
                                            ? <CheckIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-green-500'} mr-3 flex-shrink-0 mt-0.5`} /> 
                                            : <XIcon className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-red-400'} mr-3 flex-shrink-0 mt-0.5`} />
                                        }
                                        <span className={`${feature.included ? (isDark ? 'text-slate-300' : 'text-slate-700') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>{feature.name}</span>
          </li>
        ))}
      </ul>
              
                            <button className={`w-full mt-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105
                                ${plan.popular 
                                    ? (isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30')
                                    : (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-800 text-white hover:bg-gray-900')}`
                                }>
                                Choose Plan
      </button>
                </div>
          ))}
              </div>
            </AnimatedSection>
    </section>
  );
};

// Footer Component
const Footer = ({ isDark }: { isDark: boolean }) => {
    const footerLinks = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'AI Templates', href: '#' },
            { name: 'API Documentation', href: '#' },
            { name: 'Integrations', href: '#' }
        ],
        company: [
            { name: 'About Us', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Blog', href: '#' },
            { name: 'Press', href: '#' },
            { name: 'Contact', href: '#' }
        ],
        support: [
            { name: 'Help Center', href: '#' },
            { name: 'Community', href: '#' },
            { name: 'Tutorials', href: '#' },
            { name: 'Status Page', href: '#' },
            { name: 'Bug Reports', href: '#' }
        ],
        legal: [
            { name: 'Privacy Policy', href: '#' },
            { name: 'Terms of Service', href: '#' },
            { name: 'Cookie Policy', href: '#' },
            { name: 'GDPR', href: '#' }
        ]
    };

  return (
        <footer className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} border-t`}>
            <div className="container mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6 mb-12">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center space-x-3 group mb-6">
                            <div className={`p-2 ${isDark ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-lg shadow-lg`}>
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
                            </div>
                            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>SuperbAI</span>
            </Link>
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6 leading-relaxed`}>
                            Create and deploy intelligent AI Agents to automate your business processes. 
                            Save time and increase efficiency with advanced AI technology.
                        </p>
                        
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <EmailIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-purple-600'} flex-shrink-0`} />
                                <a href="mailto:support@superbai.com" className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                                    support@superbai.com
                                </a>
          </div>
                            <div className="flex items-center space-x-3">
                                <PhoneIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-purple-600'} flex-shrink-0`} />
                                <a href="tel:+84123456789" className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                                    +84 123 456 789
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <LocationIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-purple-600'} flex-shrink-0`} />
                                <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-sm`}>
                                    Ho Chi Minh City, Vietnam
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Product</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                                        {link.name}
                                    </a>
                                </li>
                ))}
              </ul>
            </div>

                    {/* Company Links */}
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                                        {link.name}
                                    </a>
                                </li>
                ))}
              </ul>
        </div>

                    {/* Support Links */}
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Support</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
        </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-6 md:p-8 mb-12 border`}>
                    <div className="text-center max-w-lg mx-auto">
                        <h3 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
                            Stay Updated
                        </h3>
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6 text-sm md:text-base`}>
                            Get the latest news about new features, AI trends and tips to optimize your business
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={`flex-1 px-4 py-2.5 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-slate-900 placeholder-slate-500'} focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-400' : 'focus:ring-purple-500'}`}
                            />
                            <button className={`${isDark ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} text-white font-semibold px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 text-sm`}>
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className={`${isDark ? 'border-slate-800' : 'border-gray-200'} border-t pt-8`}>
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                            &copy; {new Date().getFullYear()} SuperbAI, Inc. All rights reserved. Made with ❤️ in Vietnam
                        </div>
                        
                        {/* Social Media Links */}
                        <div className="flex items-center space-x-6">
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium`}>
                                Connect with us:
                            </span>
                            <div className="flex space-x-4">
                                <a 
                                    href="https://facebook.com/superbai" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}
                                    aria-label="Facebook"
                                >
                                    <FacebookIcon className="w-5 h-5" />
                                </a>
                                <a 
                                    href="https://zalo.me/superbai" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}
                                    aria-label="Zalo"
                                >
                                    <ZaloIcon className="w-5 h-5" />
                                </a>
                                <a 
                                    href="https://twitter.com/superbai" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}
                                    aria-label="Twitter"
                                >
                                    <TwitterIcon className="w-5 h-5" />
                                </a>
                                <a 
                                    href="https://github.com/superbai" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-gray-900'} transition-colors`}
                                    aria-label="GitHub"
                                >
                                    <GithubIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
          </div>
          </div>
        </div>
      </footer>
  );
}

// Main Landing Page Component with CSS animations
const LandingPage: React.FC = () => {
    const [isDark, setIsDark] = useState(false);
    const toggleTheme = () => setIsDark(!isDark);

  return (
        <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} font-sans antialiased`}>
            <style>{`
                /* Smooth scrolling for anchor links */
                html {
                    scroll-behavior: smooth;
                }

                /* Keyframes for scrolling animation */
                @keyframes scroll-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes scroll-right {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }

                /* Applying animations */
                .animate-scroll-left {
                    animation: scroll-left 45s linear infinite;
                }
                .animate-scroll-right {
                    animation: scroll-right 45s linear infinite;
                }

                /* Animation delay utilities */
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }

                /* Gradient background for hero */
                .bg-gradient-radial {
                    background-image: radial-gradient(circle, var(--tw-gradient-stops));
                }
            `}</style>
            <Header isDark={isDark} toggleTheme={toggleTheme} />
            <main>
                <Hero isDark={isDark} />
                <Features isDark={isDark} />
                <AIAgents isDark={isDark} />
                <Pricing isDark={isDark} />
      </main>
            <Footer isDark={isDark} />
    </div>
  );
};

export default LandingPage;