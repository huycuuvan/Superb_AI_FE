import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiCode, FiUsers, FiLock, FiGithub, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import Lottie from 'lottie-react';

// Lottie URL Loader Component
const LottieFromURL = ({ src, className, loop = true, autoplay = true }: {
    src: string;
    className: string;
    loop?: boolean;
    autoplay?: boolean;
}) => {
    const [animationData, setAnimationData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnimation = async () => {
            try {
                const response = await fetch(src);
                const data = await response.json();
                setAnimationData(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load Lottie animation:', error);
                setLoading(false);
            }
        };

        loadAnimation();
    }, [src]);

    if (loading) {
        return <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse`}></div>;
    }

    if (!animationData) {
        return <div className={`${className} bg-gradient-to-br from-red-200 to-red-300 rounded-lg flex items-center justify-center text-red-600 text-xs`}>❌</div>;
    }

    return (
        <Lottie
            animationData={animationData}
            className={className}
            loop={loop}
            autoplay={autoplay}
        />
    );
}; 

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

// 3D Cards Carousel Component with enhanced effects
const SwiperCoverflow = ({ agents, isDark, isLoaded }: { 
    agents: Array<{
        title: string;
        description: string;
        bgColor: string;
        icon: React.ReactNode;
    }>;
    isDark: boolean;
    isLoaded: boolean;
}) => {
    const [currentIndex, setCurrentIndex] = useState(2); // Start with middle card active
    const [isAutoplay, setIsAutoplay] = useState(true);

    useEffect(() => {
        if (!isAutoplay) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % agents.length);
        }, 3000);
        
        return () => clearInterval(interval);
    }, [agents.length, isAutoplay]);

    const nextSlide = () => {
        setIsAutoplay(false);
        setCurrentIndex((prev) => (prev + 1) % agents.length);
        setTimeout(() => setIsAutoplay(true), 5000);
    };

    const prevSlide = () => {
        setIsAutoplay(false);
        setCurrentIndex((prev) => (prev - 1 + agents.length) % agents.length);
        setTimeout(() => setIsAutoplay(true), 5000);
    };

    const goToSlide = (index: number) => {
        setIsAutoplay(false);
        setCurrentIndex(index);
        setTimeout(() => setIsAutoplay(true), 5000);
    };

    return (
        <div className="w-full h-[500px] relative overflow-hidden">
            {/* 3D Carousel Container */}
            <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d'
                }}
            >
                {agents.map((agent, index) => {
                    const offset = index - currentIndex;
                    const absOffset = Math.abs(offset);
                    const isActive = index === currentIndex;
                    
                    // Calculate position and transformations
                    const translateX = offset * 200; // Spacing between cards
                    const translateZ = isActive ? 0 : -100 - (absOffset * 50); // Depth
                    const rotateY = offset * 25; // Rotation angle
                    const scale = isActive ? 1.1 : Math.max(0.7, 1 - absOffset * 0.2); // Scale
                    const opacity = absOffset > 2 ? 0 : Math.max(0.3, 1 - absOffset * 0.3); // Opacity
                    
                    return (
                        <div
                            key={index}
                            className={`absolute w-80 h-96 transition-all duration-700 ease-out cursor-pointer ${isActive ? 'z-20' : 'z-10'}`}
                            style={{
                                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                opacity: opacity,
                                transformStyle: 'preserve-3d',
                            }}
                            onClick={() => goToSlide(index)}
                        >
                            <div className={`agent-card w-full h-full ${isDark ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/40' : 'bg-gradient-to-br from-blue-50/95 to-cyan-50/95 border-blue-200/60'} backdrop-blur-xl backdrop-saturate-150 rounded-2xl border p-6 shadow-2xl relative overflow-hidden group transition-all duration-500 ${isActive ? (isDark ? 'shadow-[0_0_25px_rgba(147,51,234,0.6)]' : 'shadow-[0_0_25px_rgba(59,130,246,0.4)]') : (isDark ? 'hover:shadow-[0_0_25px_rgba(147,51,234,0.6)]' : 'hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]') + ' hover:-translate-y-2 hover:scale-105'}`}>
                                {/* Base animated background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? agent.bgColor : 'from-blue-400/20 to-cyan-400/20'} ${isActive ? 'opacity-40' : 'opacity-10 group-hover:opacity-30'} transition-opacity duration-500 rounded-2xl`}></div>
                                
                                {/* Bright glow overlay */}
                                <div className={`absolute -inset-1 bg-gradient-to-br ${isDark ? agent.bgColor : 'from-blue-400/30 to-cyan-400/30'} ${isActive ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'} transition-all duration-500 rounded-xl blur-md`}></div>
                                <div className={`absolute -inset-0.5 bg-gradient-to-br ${isDark ? agent.bgColor : 'from-blue-500/40 to-cyan-500/40'} ${isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'} transition-all duration-500 rounded-lg blur-sm`}></div>
                                
                                {/* Content */}
                                <div className="h-full flex flex-col text-center relative z-20">
                                    {/* Large Animation Icon */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className={`transform transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {agent.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Text Content at Bottom */}
                                    <div className="mt-auto">
                                        <h3 className={`text-lg font-bold mb-2 transition-all duration-500 ${
                                            isDark 
                                                ? (isActive ? 'text-purple-200 drop-shadow-[0_0_3px_rgba(147,51,234,0.8)]' : 'text-white group-hover:text-purple-200 group-hover:drop-shadow-[0_0_3px_rgba(147,51,234,0.8)]')
                                                : (isActive ? 'text-blue-800 drop-shadow-[0_0_3px_rgba(59,130,246,0.6)]' : 'text-slate-800 group-hover:text-blue-800 group-hover:drop-shadow-[0_0_3px_rgba(59,130,246,0.6)]')
                                        }`}>
                                            {agent.title}
                                        </h3>
                                        
                                        <p className={`text-xs leading-relaxed mb-3 transition-all duration-500 ${
                                            isDark 
                                                ? (isActive ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100')
                                                : (isActive ? 'text-slate-700' : 'text-slate-600 group-hover:text-slate-700')
                                        }`}>
                                            {agent.description}
                                        </p>
                                        
                                        {/* Enhanced status indicator */}
                                        <div className="flex items-center justify-center">
                                            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-blue-500'} animate-pulse mr-2 ${isActive ? (isDark ? 'shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'shadow-[0_0_5px_rgba(59,130,246,0.8)]') : (isDark ? 'group-hover:shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'group-hover:shadow-[0_0_5px_rgba(59,130,246,0.8)]')} transition-all duration-500`}></div>
                                            <span className={`text-xs ${
                                                isDark 
                                                    ? (isActive ? 'text-green-300' : 'text-green-400 group-hover:text-green-300')
                                                    : (isActive ? 'text-blue-700' : 'text-blue-600 group-hover:text-blue-700')
                                            } font-semibold transition-all duration-500`}>Try Now</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Shimmer effect */}
                                <div className={`absolute inset-0 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-1000`}>
                                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 ${isActive ? '-translate-x-full' : 'translate-x-full group-hover:-translate-x-full'} transition-transform duration-1000 ease-in-out`}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full ${isDark ? 'bg-slate-800/90 hover:bg-slate-700/90 text-purple-400 border-slate-600/50' : 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-600 border-blue-200/60'} border backdrop-blur-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={nextSlide}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full ${isDark ? 'bg-slate-800/90 hover:bg-slate-700/90 text-purple-400 border-slate-600/50' : 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-600 border-blue-200/60'} border backdrop-blur-lg flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                {agents.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? (isDark ? 'bg-purple-400 shadow-lg shadow-purple-400/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50')
                                : (isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-blue-200 hover:bg-blue-300')
                        }`}
                    />
                ))}
            </div>

            {/* Autoplay indicator */}
            <div className={`absolute top-4 right-4 z-30 ${isAutoplay ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}>
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-blue-500'} animate-pulse`}></div>
            </div>
        </div>
    );
};

// 3D AI Agents Component 
const ScrollableAIAgents = ({ isDark }: { isDark: boolean }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const agents = [
        {
            title: "AI Sales Agent",
            description: "Automate your sales pipeline with intelligent lead scoring",
            bgColor: isDark ? 'from-purple-500 to-violet-600' : 'from-purple-400 to-violet-500',
            icon: (
                <LottieFromURL 
                    src="/animation/sales-service-provided-by-agent.json"
                    className="w-40 h-40"
                    loop={true}
                    autoplay={true}
                />
            )
        },
        {
            title: "AI Marketing Agent", 
            description: "Create compelling campaigns across all channels",
            bgColor: isDark ? 'from-green-500 to-teal-600' : 'from-green-400 to-teal-500',
            icon: (
                <LottieFromURL 
                    src="/animation/customer-care-service.json"
                    className="w-40 h-40"
                    loop={true}
                    autoplay={true}
                />
            )
        },
        {
            title: "AI Support Agent",
            description: "Provide 24/7 customer support with AI precision", 
            bgColor: isDark ? 'from-emerald-500 to-green-600' : 'from-emerald-400 to-green-500',
            icon: (
                <LottieFromURL 
                    src="/animation/customer-care-service copy.json"
                    className="w-44 h-44"
                    loop={true}
                    autoplay={true}
                />
            )
        },
        {
            title: "AI Data Analyst",
            description: "Transform raw data into actionable insights",
            bgColor: isDark ? 'from-yellow-500 to-orange-600' : 'from-yellow-400 to-orange-500',
            icon: (
                <LottieFromURL 
                    src="/animation/trademark-transfer.json"
                    className="w-40 h-40"
                    loop={true}
                    autoplay={true}
                />
            )
        },
        {
            title: "AI Content Creator",
            description: "Generate engaging content for all your platforms",
            bgColor: isDark ? 'from-violet-500 to-purple-600' : 'from-violet-400 to-purple-500',
            icon: (
                <div className={`w-40 h-40 mx-auto rounded-2xl ${isDark ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-violet-400 to-purple-500'} flex items-center justify-center shadow-lg transition-all duration-300`}>
                    <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            )
        },
        {
            title: "AI HR Manager",
            description: "Streamline recruitment and employee management",
            bgColor: isDark ? 'from-pink-500 to-rose-600' : 'from-pink-400 to-rose-500',
            icon: (
                <div className={`w-40 h-40 mx-auto rounded-2xl ${isDark ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-gradient-to-br from-pink-400 to-rose-500'} flex items-center justify-center shadow-lg transition-all duration-300`}>
                    <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            )
        },
    ];

    return (
        <section className={`${isDark ? 'bg-slate-800 text-white' : 'bg-gray-50 text-slate-800'} py-24 relative overflow-hidden`}>
            <div className="container mx-auto px-6 text-center mb-16">
                <AnimatedSection>
                    <div className={`inline-flex items-center ${isDark ? 'bg-slate-700/50 text-purple-300 border-slate-600' : 'bg-purple-100/70 text-purple-700 border-purple-200'} px-4 py-2 rounded-full text-sm font-semibold mb-6 border backdrop-blur-sm`}>
                        <span className={`w-2 h-2 ${isDark ? 'bg-purple-400' : 'bg-purple-500'} rounded-full mr-2 animate-pulse`}></span>
                        EXPLORE OUR AI AGENTS
                    </div>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        AI Built for Every Scenario
                    </h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg max-w-3xl mx-auto mb-8`}>
                        Delegate tasks to specialized AI agents and watch your productivity soar.
                    </p>
                    <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'} text-sm`}>
                        🖱️ Swipe to explore • 👆 Click to interact
                    </p>
                </AnimatedSection>
            </div>

            {/* 3D Swiper Coverflow */}
            <div className="w-full max-w-6xl mx-auto">
                <SwiperCoverflow agents={agents} isDark={isDark} isLoaded={isLoaded} />
            </div>

            {/* Navigation hint */}
            <div className="text-center mt-12">
                <div className={`inline-flex items-center ${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                    <svg className="w-4 h-4 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Swipe to see more agents
                    <svg className="w-4 h-4 ml-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

// Hero Component - Compact & Modern
const Hero = ({ isDark }: { isDark: boolean }) => {
    const aiAgents = [
        { title: "AI Business Analyst", description: "Generate reports from data.", img: isDark ? "https://placehold.co/300x168/0F172A/0EA5E9?text=Analyst&font=raleway" : "https://placehold.co/300x168/EDE9FE/4C1D95?text=Analyst&font=raleway", views: "5M+ reports" },
        { title: "AI Sales Agent", description: "Automate sales funnel.", img: isDark ? "https://placehold.co/300x168/0F172A/0d9488?text=Sales&font=raleway" : "https://placehold.co/300x168/F5D0FE/701A75?text=Sales&font=raleway", views: "3.2M+ deals" },
        { title: "AI Marketing Guru", description: "Multi-channel marketing.", img: isDark ? "https://placehold.co/300x168/0F172A/f59e0b?text=Marketing&font=raleway" : "https://placehold.co/300x168/FEF3C7/92400E?text=Marketing&font=raleway", views: "4.1M+ campaigns" },
        { title: "AI Support", description: "24/7 customer support.", img: isDark ? "https://placehold.co/300x168/0F172A/6d28d9?text=Support&font=raleway" : "https://placehold.co/300x168/E0E7FF/3730A3?text=Support&font=raleway", views: "8.5M+ tickets" },
    ];

  return (
        <section className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} relative overflow-hidden pt-32 pb-20`}>
            <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
                <div className={`absolute top-0 -left-1/4 w-full h-full ${isDark ? 'bg-gradient-radial from-purple-600/15 via-pink-600/15 to-transparent' : 'bg-gradient-radial from-purple-200/40 via-pink-200/40 to-transparent'} rounded-full filter blur-3xl animate-pulse`}></div>
                <div className={`absolute bottom-0 -right-1/4 w-full h-full ${isDark ? 'bg-gradient-radial from-pink-600/15 via-purple-600/15 to-transparent' : 'bg-gradient-radial from-pink-200/40 via-purple-200/40 to-transparent'} rounded-full filter blur-3xl animate-pulse animation-delay-1000`}></div>
      </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left side - Hero Content */}
                    <div className="lg:w-1/2 text-center lg:text-left mt-[4rem]">
                         <AnimatedSection>
                            
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
                                <span className={`${isDark ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-violet-300' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600'} bg-clip-text text-transparent`}>AI Agents</span>
                                <br />
                                <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>& Automation</span>
        </h1>
                            <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed`}>
                                Automate your business with intelligent AI agents. Faster, cheaper, smarter.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mb-10">
                                <Link to="/register" className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-all transform hover:scale-105 w-full sm:w-auto shadow-lg hover:from-purple-700 hover:to-violet-700 hover:shadow-purple-500/25 text-sm sm:text-base">
                                    Get Started - Free
          </Link>
                                <button className={`flex items-center justify-center ${isDark ? 'text-slate-300 hover:text-white border-slate-600 hover:border-purple-400' : 'text-slate-600 hover:text-slate-900 border-gray-300 hover:border-purple-300'} font-medium space-x-2 transition-colors w-full sm:w-auto border px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl backdrop-blur-sm text-sm sm:text-base`}>
                                    <div className={`p-2 rounded-full ${isDark ? 'bg-slate-800/80' : 'bg-purple-50'} transition-colors`}>
                                        <PlayIcon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}/>
        </div>
                                    <span>Watch Demo</span>
                                </button>
              </div>
                             
                        </AnimatedSection>
          </div>

                    {/* Right side - AI Agent Cards */}
                    <div className="lg:w-1/2 w-full">
                        <div className="space-y-4 h-[500px] overflow-hidden [mask-image:_linear-gradient(to_bottom,transparent_0,_black_10%,_black_90%,transparent_100%)]">
                            {/* Row 1 - Scrolling left to right */}
                            <div className="flex space-x-4 animate-scroll-left">
                                {[...aiAgents, ...aiAgents].map((agent, index) => (
                                    <div key={`row1-${index}`} className={`${isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-purple-400/50' : 'bg-white/70 border-gray-200/80 hover:border-purple-300'} backdrop-blur-sm p-4 rounded-xl border transition-all duration-300 min-w-[280px] flex-shrink-0 hover:-translate-y-1 shadow-lg hover:shadow-xl`}>
                                        <img src={agent.img} alt={agent.title} className={`w-full rounded-lg aspect-video object-cover mb-3 ${isDark ? 'shadow-lg' : 'shadow-md'}`} onError={(e) => (e.target as HTMLImageElement).src='https://placehold.co/300x168/0F172A/ffffff?text=Error'}/>
                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} text-base mb-1`}>{agent.title}</h3>
                                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm mb-2`}>{agent.description}</p>
                                        <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'} text-xs font-semibold`}>{agent.views}</p>
        </div>
                                ))}
              </div>
                            
                            {/* Row 2 - Scrolling right to left */}
                            <div className="flex space-x-4 animate-scroll-right">
                                {[...aiAgents.slice().reverse(), ...aiAgents.slice().reverse()].map((agent, index) => (
                                     <div key={`row2-${index}`} className={`${isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-purple-400/50' : 'bg-white/70 border-gray-200/80 hover:border-purple-300'} backdrop-blur-sm p-4 rounded-xl border transition-all duration-300 min-w-[280px] flex-shrink-0 hover:-translate-y-1 shadow-lg hover:shadow-xl`}>
                                        <img src={agent.img} alt={agent.title} className={`w-full rounded-lg aspect-video object-cover mb-3 ${isDark ? 'shadow-lg' : 'shadow-md'}`} onError={(e) => (e.target as HTMLImageElement).src='https://placehold.co/300x168/0F172A/ffffff?text=Error'}/>
                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'} text-base mb-1`}>{agent.title}</h3>
                                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm mb-2`}>{agent.description}</p>
                                        <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'} text-xs font-semibold`}>{agent.views}</p>
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

// Hook to detect which section is in view
const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return activeSection;
};

const LandingPage: React.FC = () => {
  // State để quản lý trạng thái dark/light mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  // State để quản lý trạng thái "dính" của Navbar
  const [isSticky, setIsSticky] = useState(false);
  // State để quản lý mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const activeSection = useActiveSection();

  // Effect để xử lý việc thêm/xóa class 'dark' vào thẻ <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect để xử lý sự kiện cuộn trang cho sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Cleanup function để gỡ bỏ event listener khi component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

                return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/80 text-gray-100' 
        : 'bg-white text-slate-800'
    } relative overflow-hidden`}>
      
      {/* Animated background shapes - improved for both themes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 ${
          isDarkMode ? 'bg-purple-500/10' : 'bg-blue-100/40'
        } rounded-full filter blur-3xl opacity-70 animate-pulse`} style={{animationDelay: '0.2s'}}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 ${
          isDarkMode ? 'bg-slate-700/20' : 'bg-cyan-50/50'
        } rounded-full filter blur-3xl opacity-60 animate-pulse`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/3 right-1/3 w-48 h-48 sm:w-72 sm:h-72 ${
          isDarkMode ? 'bg-purple-600/8' : 'bg-indigo-50/35'
        } rounded-full filter blur-3xl opacity-50 animate-pulse`} style={{animationDelay: '0.5s'}}></div>
        <div className={`absolute bottom-1/2 left-1/3 w-40 h-40 sm:w-60 sm:h-60 ${
          isDarkMode ? 'bg-slate-600/15' : 'bg-blue-50/45'
        } rounded-full filter blur-3xl opacity-45 animate-pulse`} style={{animationDelay: '1.5s'}}></div>
        
        {/* Thêm animations từ JSON files */}
        <div className="absolute top-20 right-10 w-32 h-32 sm:w-48 sm:h-48 opacity-25">
          <LottieFromURL 
            src="/animation/customer-care-service.json"
            className="w-full h-full"
            loop={true}
            autoplay={true}
          />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 sm:w-40 sm:h-40 opacity-20">
          <LottieFromURL 
            src="/animation/sales-service-provided-by-agent.json"
            className="w-full h-full"
            loop={true}
            autoplay={true}
          />
        </div>
        <div className="absolute top-1/2 left-20 w-24 h-24 sm:w-36 sm:h-36 opacity-15">
          <LottieFromURL 
            src="/animation/trademark-transfer.json"
            className="w-full h-full"
            loop={true}
            autoplay={true}
          />
        </div>
                            </div>

      {/* CSS cho 3D effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* 3D Card Effects */
          .agent-card {
            transform-style: preserve-3d;
            will-change: transform;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .agent-card:hover {
            transform: scale(1.05) rotateY(5deg);
            box-shadow: ${isDarkMode 
              ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(147, 51, 234, 0.3)' 
              : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(147, 51, 234, 0.3)'
            };
          }
          
          /* Smooth perspective container */
          [style*="perspective"] {
            transform-style: preserve-3d;
          }
          
          /* Enhanced animations */
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(100%) skewX(-12deg); }
          }
          
          .shimmer {
            animation: shimmer 2s infinite;
          }
        `
      }} />

      {/* Toàn bộ nội dung đặt trong relative để có z-index cao hơn nền */}
      <div className="relative z-10">
        
        {/* ======================= Header / Navbar ======================= */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isSticky 
            ? `py-2 mt-2 rounded-2xl shadow-xl backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-slate-700/30' 
                  : 'bg-white/95 border-gray-100/50'
              } border mx-4 md:mx-auto md:max-w-5xl` 
            : `py-4 rounded-none backdrop-blur-sm border-transparent ${
                isDarkMode 
                  ? 'bg-slate-900/80' 
                  : 'bg-white/70'
              }`
        }`}>
          <div className={`transition-all duration-300 ${
            isSticky ? 'px-6 md:px-8 mx-auto' : 'container mx-auto px-6'
          } flex justify-between items-center`}>
            {/* Logo */}
            <Link to="/" className="font-bold flex items-center space-x-2">
            <div className={`p-2 ${isDarkMode ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-lg shadow-lg`}>
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
              <span className={`${isDarkMode ? 'text-white' : 'text-slate-800'} transition-all duration-300 ${
                isSticky ? 'text-sm sm:text-base font-semibold' : 'text-lg sm:text-2xl font-bold'
              }`}>SuperbAI</span>
            </Link>
            
            {/* Navigation Links - Desktop */}
            <nav className={`hidden md:flex items-center transition-all duration-300 ${
              isSticky ? 'space-x-4' : 'space-x-8'
            }`}>
              {['features', 'pricing', 'testimonials'].map((section) => (
                <a 
                  key={section}
                  href={`#${section}`} 
                  className={`transition-all duration-300 font-medium capitalize relative ${
                    isSticky ? 'text-sm px-3 py-1.5' : 'text-sm px-0 py-0'
                  } ${
                    activeSection === section 
                      ? (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                      : (isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600')
                  } ${
                    activeSection === section && isSticky 
                      ? (isDarkMode ? 'bg-purple-400/10' : 'bg-purple-600/10') + ' rounded-full'
                      : ''
                  }`}
                >
                  {section.replace('-', ' ')}
                </a>
              ))}
            </nav>
            
            {/* Action Buttons */}
            <div className={`flex items-center transition-all duration-300 ${
              isSticky ? 'space-x-2' : 'space-x-4'
            }`}>
                                <button 
                onClick={toggleDarkMode} 
                className={`rounded-full transition-all duration-300 ${
                  isSticky ? 'p-1 sm:p-1.5' : 'p-1.5 sm:p-2'
                } ${
                  isDarkMode 
                    ? 'bg-slate-800/60 text-yellow-400 hover:bg-slate-700/80' 
                    : 'bg-white/60 text-slate-600 hover:bg-white/80'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-slate-700/40' : 'border-white/40'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FiSun size={isSticky ? 16 : 18} /> : <FiMoon size={isSticky ? 16 : 18} />}
                                </button>
              
              <Link 
                to="/login" 
                className={`hidden sm:block transition-all duration-300 font-medium ${
                  isSticky ? 'text-sm' : 'text-sm'
                } ${
                  isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                Log in
              </Link>
              
              <Link 
                to="/register" 
                className={`font-semibold rounded-xl transition-all duration-300 ${
                  isSticky ? 'px-3 py-1.5 text-xs sm:px-4 sm:text-sm' : 'px-4 py-2 text-xs sm:px-5 sm:text-sm'
                } bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-purple-500/25`}
              >
                Get started
              </Link>
              
                            {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden rounded-lg transition-all duration-300 relative ${
                  isSticky ? 'p-1 sm:p-1.5' : 'p-1.5 sm:p-2'
                } ${
                  isDarkMode 
                    ? 'bg-slate-800/60 text-gray-300 hover:bg-slate-700/80' 
                    : 'bg-white/60 text-slate-600 hover:bg-white/80'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-slate-700/40' : 'border-white/40'
                } ${isMobileMenuOpen ? 'scale-110' : 'scale-100'}`}
                aria-label="Toggle menu"
              >
                <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  <FiMenu 
                    size={isSticky ? 16 : 18} 
                    className={`absolute transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <FiX 
                    size={isSticky ? 16 : 18} 
                    className={`absolute transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-75'
                    }`}
                  />
                </div>
              </button>
                            </div>
                        </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 md:hidden z-[60]">
              <div className={`rounded-2xl backdrop-blur-xl border shadow-xl transform transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-slate-700/30' 
                  : 'bg-white/95 border-gray-200/50'
              }`}>
                <nav className="px-4 py-4 space-y-2">
                  {['features', 'pricing', 'testimonials'].map((section) => (
                    <a 
                      key={section}
                      href={`#${section}`} 
                      className={`block px-3 py-2.5 rounded-lg transition-all duration-300 font-medium capitalize text-sm ${
                        activeSection === section 
                          ? (isDarkMode ? 'text-purple-400 bg-purple-400/10' : 'text-purple-600 bg-purple-600/10')
                          : (isDarkMode ? 'text-gray-300 hover:text-purple-400 hover:bg-purple-400/5' : 'text-slate-600 hover:text-purple-600 hover:bg-purple-600/5')
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {section.replace('-', ' ')}
                    </a>
                  ))}
                  
                  {/* Mobile Menu Actions */}
                  <div className="pt-3 border-t border-gray-200/20 space-y-2">
                    <Link 
                      to="/login" 
                      className={`block px-3 py-2.5 rounded-lg transition-all duration-300 font-medium text-center text-sm ${
                        isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100/50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/register" 
                      className="block bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold px-3 py-2.5 rounded-lg transition-all transform hover:scale-105 text-center text-sm hover:from-purple-700 hover:to-violet-700 hover:shadow-purple-500/25"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get started
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
          )}
        </header>

        <main>
          <Hero isDark={isDarkMode} />
          
                    {/* Real Process Showcase Section */}
          <section id="process" className={`${isDarkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-gray-200'} py-24 overflow-hidden border-t`}>
            <div className="container mx-auto px-6">
              <AnimatedSection className="text-center max-w-4xl mx-auto mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">See How AI Agents Work</h2>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} text-xl leading-relaxed`}>
                  Real examples of AI agents creating content, managing social media, and automating your business processes
                </p>
              </AnimatedSection>
              
              <AnimatedSection>
                <div className="space-y-20 max-w-5xl mx-auto">
                  
                  {/* Process 1: Content Creation - Step by Step Visualization */}
                  <div className="flex justify-center">
                    <div className="max-w-xl w-full">
                      <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/40' : 'bg-gradient-to-br from-blue-50/95 to-cyan-50/95 border border-blue-200/60'}`}>
                                                <div className={`h-8 ${isDarkMode ? 'bg-slate-700/80' : 'bg-blue-100/80'} flex items-center px-4`}>
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className={`ml-4 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-blue-800'}`}>AI Fashion Generator</span>
                        </div>
                        <div className="p-6">
                          {/* Step by Step Process */}
                          <div className="space-y-6">
                            {/* Step 1: Input */}
                            <div className="flex items-center gap-6">
                              <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-600'} flex items-center justify-center text-white font-bold shadow-lg`}>1</div>
                              </div>
                              <div className="flex-1">
                                <img 
                                  src="/images/step1.png" 
                                  alt="Original product image"
                                  className="w-32 h-32 object-cover rounded-lg border-2 border-dashed border-gray-300 mx-auto"
                                />
                                <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Upload product image</p>
                              </div>
                              <div className="flex-shrink-0">
                                <svg className={`w-8 h-8 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                            </div>

                                                        {/* Prompt Input */}
                            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-blue-50/80 border-blue-200/60'}`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-blue-800'}`}>AI Prompt:</span>
                              </div>
                              <p className={`text-base ${isDarkMode ? 'text-slate-400' : 'text-blue-700'} italic leading-relaxed`}>
                                "Create a professional model wearing this outfit in a modern studio setting"
                              </p>
                            </div>

                            {/* Step 2 & 3: Results */}
                            <div className="flex items-center gap-6">
                              <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-purple-600' : 'bg-purple-600'} flex items-center justify-center text-white font-bold shadow-lg`}>2</div>
                              </div>
                              <div className="flex gap-6 flex-1 justify-center">
                                <div className="text-center">
                                  <img 
                                    src="/images/step2.png" 
                                    alt="AI generated model 1"
                                    className="w-28 h-28 object-cover rounded-lg shadow-lg"
                                  />
                                  <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-blue-900'}`}>Model A</p>
                                </div>
                                <div className="text-center">
                                  <img 
                                    src="/images/step3.png" 
                                    alt="AI generated model 2"
                                    className="w-28 h-28 object-cover rounded-lg shadow-lg"
                                  />
                                  <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-blue-900'}`}>Model B</p>
                                </div>
                              </div>
                            </div>

                            {/* Processing Status */}
                            <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-blue-700'} space-y-2`}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>✓ Background removal complete</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>✓ AI models generated successfully</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Generating product descriptions...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Process 2: Social Media Automation */}
                  <div className="flex justify-center">
                    <div className="max-w-xl w-full">
                      <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/40' : 'bg-gradient-to-br from-purple-50/95 to-pink-50/95 border border-purple-200/60'}`}>
                        <div className={`h-12 ${isDarkMode ? 'bg-slate-700/80' : 'bg-purple-100/80'} flex items-center px-4`}>
                          <div className="flex items-center gap-2">
                            <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-purple-800'}`}>Social Media Manager</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-purple-50/80'}`}>
                              <div className="flex items-start gap-3">
                                <img 
                                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                                  alt="User"
                                  className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-purple-900'} mb-2`}>Your Brand AI</div>
                                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-purple-900'} mb-3 leading-relaxed`}>
                                    🚀 Just launched our new eco-friendly product line! Made with 100% sustainable materials. 
                                    What's your favorite eco-friendly brand? #Sustainability #EcoFriendly #GreenLiving
                                  </p>
                                  <div className={`flex items-center gap-6 text-sm ${isDarkMode ? 'text-gray-500' : 'text-purple-700'}`}>
                                    <span>💬 24</span>
                                    <span>🔄 156</span>
                                    <span>❤️ 892</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-800'} flex items-center gap-2 px-2`}>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>Posted automatically at optimal time: 2:30 PM</span>
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-800'} flex items-center gap-2 px-2`}>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <span>Scheduling next posts for Instagram & Facebook...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>



                    </div>
                </AnimatedSection>
      </div>
    </section>

          {/* 3D AI Agents Section */}
          <ScrollableAIAgents isDark={isDarkMode} />

          {/* Simple Pricing Section */}
          <section id="pricing" className={`${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-slate-800 border-gray-200'} py-24 overflow-hidden border-t`}>
            <div className="container mx-auto px-6">
              <AnimatedSection className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-lg max-w-3xl mx-auto`}>
                  Start for free and scale as you grow. No hidden fees, no surprises.
                </p>
              </AnimatedSection>
              
              <AnimatedSection>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {/* Startup Plan */}
                  <div className={`p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700/50' 
                      : 'bg-white/60 border-white/40'
                  } hover:shadow-lg`}>
                    <h3 className="text-2xl font-bold mb-2">Startup</h3>
                    <div className="text-4xl font-bold mb-4">$9<span className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>/month</span></div>
                    <ul className="space-y-3 mb-6 text-left">
                      <li className="flex items-center gap-2">✅ 9 active agents simultaneously</li>
                      <li className="flex items-center gap-2">✅ 99 jobs run/month</li>
                      <li className="flex items-center gap-2">✅ 999 tokens</li>
                      <li className="flex items-center gap-2">✅ Community support</li>
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg font-semibold transition-all bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 hover:shadow-purple-500/25 transform hover:scale-105">
                      Get Started
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className={`p-8 rounded-xl border-2 border-purple-500 relative backdrop-blur-sm transition-all duration-300 ${
                    isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50/60'
                  } hover:shadow-2xl`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pro</h3>
                    <div className="text-4xl font-bold mb-4">$39<span className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>/month</span></div>
                    <ul className="space-y-3 mb-6 text-left">
                      <li className="flex items-center gap-2">✅ 39 active agents</li>
                      <li className="flex items-center gap-2">✅ 399 jobs run/month</li>
                      <li className="flex items-center gap-2">✅ 3999 + 999 (bonus) tokens</li>
                      <li className="flex items-center gap-2">✅ Priority support</li>
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105">
                      Start Free Trial
                    </button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className={`p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700/50' 
                      : 'bg-white/60 border-white/40'
                  } hover:shadow-lg`}>
                    <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                    <div className="text-4xl font-bold mb-4">Custom</div>
                    <ul className="space-y-3 mb-6 text-left">
                      <li className="flex items-center gap-2">✅ Unlimited agents</li>
                      <li className="flex items-center gap-2">✅ Unlimited jobs run</li>
                      <li className="flex items-center gap-2">✅ Custom deployment</li>
                      <li className="flex items-center gap-2">✅ Dedicated support</li>
                      <li className="flex items-center gap-2">✅ SLA guarantees</li>
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg font-semibold transition-all bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 hover:shadow-purple-500/25 transform hover:scale-105">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white backdrop-blur-lg shadow-2xl border border-purple-500/30 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Business?</h2>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
                  Join thousands of companies already using SuperbAI to automate their workflows and boost productivity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold px-8 py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all hover:shadow-purple-500/25 transform hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                  <a 
                    href="#" 
                    className="border border-white/30 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Schedule Demo
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

                {/* ======================= Footer ======================= */}
        <footer className={`border-t backdrop-blur-lg ${
          isDarkMode 
            ? 'border-slate-700/50 bg-slate-900/50' 
            : 'border-white/30 bg-white/50'
        }`}>
          <div className="container mx-auto px-6 py-16">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6 mb-12">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 group mb-6">
                  <div className={`p-2 ${isDarkMode ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'} rounded-lg shadow-lg`}>
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>SuperbAI</span>
                </div>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-6 leading-relaxed`}>
                  Create and deploy intelligent AI Agents to automate your business processes. 
                  Save time and increase efficiency with advanced AI technology.
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EmailIcon className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0`} />
                    <a href="mailto:support@xcel.bot" className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                    support@xcel.bot
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0`} />
                    <a href="tel:+84969333515" className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                      +84 969 333 515
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <LocationIcon className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0`} />
                    <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} text-sm`}>
                      Xuân Đỉnh, Bắc Từ Liêm, Hà Nội, Việt Nam
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Product</h3>
                <ul className="space-y-2">
                  {[
                    { name: 'Features', href: '#features' },
                    { name: 'Pricing', href: '#pricing' },
                    { name: 'AI Templates', href: '#' },
                    { name: 'API Documentation', href: '#' },
                    { name: 'Integrations', href: '#' }
                  ].map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Company</h3>
                <ul className="space-y-2">
                  {[
                    { name: 'About Us', href: '#' },
                    { name: 'Careers', href: '#' },
                    { name: 'Blog', href: '#' },
                    { name: 'Press', href: '#' },
                    { name: 'Contact', href: '#' }
                  ].map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Support</h3>
                <ul className="space-y-2">
                  {[
                    { name: 'Help Center', href: '#' },
                    { name: 'Community', href: '#' },
                    { name: 'Tutorials', href: '#' },
                    { name: 'Status Page', href: '#' },
                    { name: 'Bug Reports', href: '#' }
                  ].map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4 text-sm`}>Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/privacy" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors text-sm`}>
                      GDPR
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} rounded-xl p-6 md:p-8 mb-12 border`}>
              <div className="text-center max-w-lg mx-auto">
                <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>
                  Stay Updated
                </h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-6 text-sm md:text-base`}>
                  Get the latest news about new features, AI trends and tips to optimize your business
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-slate-900 placeholder-slate-500'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-purple-500'}`}
                  />
                                      <button className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 text-sm hover:from-purple-700 hover:to-violet-700 hover:shadow-purple-500/25">
                      Subscribe
                    </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className={`${isDarkMode ? 'border-slate-800' : 'border-gray-200'} border-t pt-8`}>
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                  &copy; {new Date().getFullYear()} SuperbAI, Inc. All rights reserved. Made with ❤️ in Vietnam
                </div>
                
                {/* Social Media Links */}
                <div className="flex items-center space-x-6">
                  <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium`}>
                    Connect with us:
                  </span>
                  <div className="flex space-x-4">
                    <a 
                      href="https://facebook.com/superbai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${isDarkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}
                      aria-label="Facebook"
                    >
                      <FacebookIcon className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://zalo.me/superbai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${isDarkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}
                      aria-label="Zalo"
                    >
                      <ZaloIcon className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://twitter.com/superbai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${isDarkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} transition-colors`}
                      aria-label="Twitter"
                    >
                      <TwitterIcon className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://github.com/superbai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-gray-900'} transition-colors`}
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

                        </div>
                            </div>
  );
};

export default LandingPage;
