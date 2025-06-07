import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; 
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'; 
import { createAvatar } from '@dicebear/core';
import { openPeeps } from '@dicebear/collection';
import Lottie from "lottie-react"; // Import thư viện Lottie

// Đăng ký plugin GSAP một lần và đảm bảo nó chỉ chạy ở phía client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

// === COMPONENT ICON PLACEHOLDER ===
const PlaceholderIcon: React.FC<{ className?: string; path?: string }> = ({ className, path }) => (
  <svg className={`w-6 h-6 ${className}`} fill="currentColor" viewBox="0 0 20 20">
    <path d={path || "M10 3a7 7 0 100 14 7 7 0 000-14zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"} />
  </svg>
);

// === HEADER ===
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); 
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <header 
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-in-out 
                  ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] py-3' : 'py-4'}`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center text-2xl font-bold text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="mr-2 h-7 w-7 text-purple-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Superb AI</span>
          </Link>
        <nav className="hidden items-center space-x-8 md:flex">
          {['Pricing', 'About', 'Docs', 'Blog'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="group relative text-base font-medium text-gray-600 transition-colors hover:text-purple-600">
              {item}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-base font-medium text-gray-600 transition-colors hover:text-purple-600">Login</Link>
          <Link to="/register" className="group flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">
            Sign Up Free
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="ml-1.5 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
  );
};

// === HERO SECTION ===
const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
    gsap.killTweensOf(".hero-element");

    tl.from(".hero-element", {
      y: 50,
        opacity: 0,
        stagger: 0.15,
      duration: 0.8,
        delay: 0.3 
    }).from(".browser-mockup-element", {
      y: 80,
      scale: 0.9,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out'
    }, "-=0.6");
  }, []);

  return (
    <section ref={heroRef} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50 pt-20 pb-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-purple-200/20 opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-pink-200/20 opacity-50 blur-3xl"></div>
      </div>
      <div className="mt-[100px] container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
        <div className="hero-element mb-6 inline-flex items-center rounded-full bg-white/70 px-4 py-1.5 shadow-sm backdrop-blur-md">
          <span className="relative mr-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <p className="text-sm font-medium text-gray-700">Your AI-Powered Workspace Awaits</p>
        </div>
        <h1 className="hero-element text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block">Build Your AI Workforce,</span>
          <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Lightning Fast.</span>
        </h1>
        <p className="hero-element mx-auto mt-6 max-w-md text-lg text-gray-600 md:max-w-2xl md:text-xl">
          Superb AI is your all-in-one platform to create, manage, and deploy specialized AI agents for writing, research, marketing, and beyond.
        </p>
        <div className="hero-element mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register" className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 sm:w-auto">
            Get Started for Free
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          </Link>
          <a href="#features" className="group flex w-full items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-purple-600 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg sm:w-auto">
            Explore Features
          </a>
        </div>
        <div className="browser-mockup-element relative mx-auto mt-16 max-w-4xl lg:mt-20">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 blur-2xl"></div>
          <div className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-400/10">
            <div className="flex h-9 items-center border-b border-gray-200 bg-gray-100 px-4">
              <div className="flex space-x-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
              </div>
      </div>
            <div className="p-1 sm:p-2">
              <img
                src="/image.png"
            alt="Superb AI Dashboard Preview" 
                className="w-full rounded-md"
            onError={(e) => (e.currentTarget.src = '/image.png')}
          />
        </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// === FEATURES GRID SECTION ===
interface FeatureCardProps {
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  animationDelay?: number;
  avatarSvg?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconBgColor = 'bg-purple-100', iconColor = 'text-purple-600', title, description, animationDelay = 0, avatarSvg }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lottieData, setLottieData] = useState<any>(null);
  useEffect(() => {
    if(!cardRef.current) return;
    gsap.from(cardRef.current, {
        y: 60, opacity: 0, scale: 0.95, duration: 0.7, delay: animationDelay, ease: 'power3.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%', toggleActions: 'play none none none' }
    });
  }, [animationDelay]);

  // Use animated 3D illustration from IconScout for visuals
  const iconScoutLottie = {
    'AI IT Agent': 'https://assets2.lottiefiles.com/packages/lf20_2ks3pjua.json',
    'AI Sales Agent': 'https://assets2.lottiefiles.com/packages/lf20_4kx2q32n.json',
    'AI Marketing Agent': 'https://assets2.lottiefiles.com/packages/lf20_1pxqjqps.json',
    'AI Accountant Agent': 'https://assets2.lottiefiles.com/packages/lf20_4kx2q32n.json',
  };

  useEffect(() => {
    const url = iconScoutLottie[title];
    if (url) {
      fetch(url)
        .then(res => res.json())
        .then(data => setLottieData(data))
        .catch(() => setLottieData(null));
    }
  }, [title]);

  return (
    <div
      ref={cardRef}
      className="group flex h-full flex-col items-center rounded-3xl border border-gray-200/40 bg-white/90 p-8 text-center shadow-xl shadow-gray-400/10 backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-200/30"
    >
      <div className={`mb-7 flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden ${iconColor} transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
        {lottieData ? (
          <Lottie animationData={lottieData} loop={true} style={{ width: 90, height: 90 }} />
        ) : avatarSvg ? (
          <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: avatarSvg }} />
        ) : (
          <PlaceholderIcon className="h-10 w-10" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="mb-3 text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-base leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const FeaturesGridSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
    if (!sectionRef.current) return;
        const elements = sectionRef.current.querySelectorAll(".section-header-element");
        gsap.from(elements, {
            y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }
    });
  }, []);

  const featuresData = [
    { title: 'AI IT Agent', description: 'Provides technical support, troubleshoots issues, and manages IT systems.' },
    { title: 'AI Sales Agent', description: 'Optimizes sales processes, interacts with potential customers, and closes deals effectively.' },
    { title: 'AI Marketing Agent', description: 'Analyzes markets, creates advertising content, and deploys multi-channel marketing campaigns.' },
    { title: 'AI Accountant Agent', description: 'Manages finances, tracks expenses, prepares financial reports, and forecasts budgets.' },
  ];

  return (
    <section ref={sectionRef} id="features" className="py-24 md:py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 text-center sm:px-8 lg:px-16">
        <span className="section-header-element mb-6 inline-block rounded-full bg-purple-100 px-6 py-2 text-base font-semibold uppercase text-purple-700 tracking-wide">
          Popular AI Agents
        </span>
        <h2 className="section-header-element text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          AI Built for Every Scenario
        </h2>
        <p className="section-header-element mx-auto mt-4 max-w-2xl text-xl text-gray-600 mb-12">
          Delegate tasks to specialized AI agents and watch your productivity soar.
        </p>
        <div className="mx-auto mt-12 grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {featuresData.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                animationDelay={index * 0.1}
            />
          ))}
          </div>
        </div>
      </section>
  );
};

// === WAVY FEATURES SECTION ===
interface WavyFeatureItemProps {
  title: string;
  description: string;
  lottieUrl?: string;
  alignLeft?: boolean;
  itemNumber: number;
  actionText?: string;
  actionLink?: string;
}

const WavyFeatureItem: React.FC<WavyFeatureItemProps> = ({ title, description, lottieUrl, alignLeft = true, itemNumber, actionText, actionLink }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (lottieUrl) {
      fetch(lottieUrl)
        .then((response) => response.json())
        .then((data) => setAnimationData(data))
        .catch((error) => console.error("Error fetching Lottie animation:", error));
    }
  }, [lottieUrl]);

  useEffect(() => {
    if(!itemRef.current) return;
    gsap.from(itemRef.current, {
        opacity: 0, y: 80, scale: 0.95, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: itemRef.current, start: 'top 85%', toggleActions: 'play none none none' }
    });
  }, []);

  const textContent = (
    <div className={`md:w-1/2 ${alignLeft ? 'text-left' : 'md:order-2 text-left'}`}>
      <span className="mb-4 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">FEATURE 0{itemNumber}</span>
      <h3 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-gray-600">{description}</p>
        {actionText && (
        <a href={actionLink || '#'} className="group mt-6 inline-flex items-center font-semibold text-purple-600 transition-colors hover:text-purple-800">
                {actionText}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="ml-1.5 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </a>
        )}
    </div>
  );

  const lottieAnimation = (
    <div className={`md:w-1/2 ${alignLeft ? 'md:pl-10' : 'md:pr-10 md:order-1'}`}>
      <div className="group relative mt-8 flex items-center justify-center rounded-2xl bg-purple-50/50 p-4 md:mt-0 aspect-square md:aspect-auto">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ width: '100%', height: '100%', maxWidth: '400px' }}
          />
        ) : (
          <div className="aspect-video w-full bg-gray-200 rounded-xl flex items-center justify-center">
             <p className="text-gray-400">Animation loading...</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={itemRef} className="relative z-10 mx-auto mb-16 max-w-5xl rounded-3xl border border-purple-100/50 bg-white/70 p-6 shadow-xl shadow-purple-200/20 backdrop-blur-xl md:p-10 lg:mb-24">
      <div className={`flex flex-col md:flex-row md:items-center ${alignLeft ? '' : 'md:justify-between'} gap-8 md:gap-0`}>
        {alignLeft ? [textContent, lottieAnimation] : [lottieAnimation, textContent]}
      </div>
    </div>
  );
};

const WavyLineBackground: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!svgRef.current || !pathRef.current) return;
    gsap.set(pathRef.current, { drawSVG: "0% 0%" });

    ScrollTrigger.create({
      trigger: svgRef.current,
      start: "top center",
      end: "bottom center",
      scrub: 1.5,
      onUpdate: self => {
        gsap.to(pathRef.current, { drawSVG: `0% ${self.progress * 100}%`, duration: 0.1, ease: "none" });
      },
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1440 2200" preserveAspectRatio="xMidYMin slice">
        <path
          ref={pathRef}
          d="M -100 250 C 400 100, 300 500, 720 400 S 1140 200, 1540 350 C 1040 600, 1120 800, 720 850 S 320 1000, -100 1050 C 520 1250, 320 1500, 720 1550 S 1120 1700, 1540 1800"
          stroke="url(#wavyPathGradient)" strokeWidth="300" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
         <defs>
            <linearGradient id="wavyPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(192, 132, 252, 0.08)" />
            <stop offset="50%" stopColor="rgba(244, 114, 182, 0.06)" />
            <stop offset="100%" stopColor="rgba(129, 140, 248, 0.08)" />
            </linearGradient>
        </defs>
      </svg>
          </div>
  );
};

const WavyFeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
    if (!sectionRef.current) return;
        const elements = sectionRef.current.querySelectorAll(".section-header-element");
        gsap.from(elements, {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }
    });
  }, []);

  const wavyFeaturesData: WavyFeatureItemProps[] = [
    {
      itemNumber: 1,
      title: "AI IT Agent",
      description: "Your 24/7 technical support specialist. Instantly troubleshoots issues, manages IT systems, and keeps your business running smoothly.",
      lottieUrl: "https://assets2.lottiefiles.com/packages/lf20_4kx2q32n.json",
      alignLeft: true
    },
    {
      itemNumber: 2,
      title: "AI Sales Agent",
      description: "Automates lead generation, follows up with prospects, and closes deals efficiently. Supercharge your sales pipeline with AI precision.",
      lottieUrl: "https://assets2.lottiefiles.com/packages/lf20_1pxqjqps.json",
      alignLeft: false
    },
    {
      itemNumber: 3,
      title: "AI Marketing Agent",
      description: "Plans campaigns, creates content, and analyzes results across channels. Reach your audience and grow your brand with data-driven marketing.",
      lottieUrl: "https://assets7.lottiefiles.com/packages/lf20_2ks3pjua.json",
      alignLeft: true,
      actionText: "See how it works",
      actionLink: "#"
    },
    {
      itemNumber: 4,
      title: "AI Accountant Agent",
      description: "Tracks expenses, manages invoices, and generates financial reports. Stay on top of your business finances with automated accuracy.",
      lottieUrl: "https://assets1.lottiefiles.com/packages/lf20_8wREpI.json",
      alignLeft: false
    },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-24 md:py-32">
      <WavyLineBackground />
      <div className="container relative z-10 mx-auto px-4 sm:px-8 lg:px-16">
        <div className="mb-20 text-center md:mb-24">
          <span className="section-header-element mb-6 inline-block rounded-full bg-pink-100 px-6 py-2 text-base font-semibold uppercase text-pink-700 tracking-wide">
            Unified Superpowers
          </span>
          <h2 className="section-header-element text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Whatever you need done, Superb AI can do.
          </h2>
        </div>
        {wavyFeaturesData.map((feature) => (
          <WavyFeatureItem key={feature.itemNumber} {...feature} />
        ))}
      </div>
    </section>
  );
};

// === PRICING SECTION ===
interface PricingTierProps {
  name: string;
  price: string;
  priceSuffix?: string;
  description?: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  animationDelay?: number;
}

const PricingTierCard: React.FC<PricingTierProps> = ({ name, price, priceSuffix = '/ month', description, features, isPopular, buttonText, animationDelay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(!cardRef.current) return;
    gsap.from(cardRef.current, {
        y: 70, opacity: 0, scale: 0.95, duration: 0.8, delay: animationDelay, ease: 'power3.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%', toggleActions: 'play none none none' }
    });
  }, [animationDelay]);

  return (
    <div
      ref={cardRef}
      className={`relative flex h-full flex-col rounded-2xl p-8 transition-all duration-300 ${
        isPopular ? 'border-2 border-purple-500 bg-gray-900 text-white lg:scale-105 shadow-2xl shadow-purple-500/20' : 'border border-gray-200 bg-white text-gray-800'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold">{name}</h3>
      {description && <p className={`mt-1 text-sm ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>}
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-extrabold tracking-tight">{price}</span>
        {price !== "Free" && <span className={`ml-1 text-base font-medium ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>{priceSuffix}</span>}
      </div>
      <ul className="mt-6 flex-grow space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`mr-2.5 mt-0.5 h-5 w-5 flex-shrink-0 ${isPopular ? 'text-purple-400' : 'text-purple-600'}`}>
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span className={isPopular ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`mt-8 w-full rounded-lg py-3 text-base font-bold transition-all duration-300 hover:scale-105 ${
          isPopular
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isYearly, setIsYearly] = useState(false);
  useEffect(() => {
    if (!sectionRef.current) return;
        const elements = sectionRef.current.querySelectorAll(".section-header-element, .toggle-switch-wrapper");
        gsap.from(elements, {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }
    });
  }, []);

  const tiersData = [
    { name: 'Free', priceMonthly: 'Free', priceYearly: 'Free', description: 'For individuals starting out', features: ['500 AI Words/month', 'Basic AI Models', 'AI Writer & Editor', 'Limited File Uploads'], buttonText: 'Start for Free' },
    { name: 'Premium', priceMonthly: '$18', priceYearly: '$15', isPopular: true, description: 'For professionals & teams', features: ['Everything in Free, plus:', 'Unlimited AI Words', 'Advanced AI Models', 'AI Image Generator', 'AI File Chat & Vision', 'Plagiarism Checker', 'Team Collaboration'], buttonText: 'Choose Premium' },
    { name: 'Ultimate', priceMonthly: '$35', priceYearly: '$29', description: 'For power users & agencies', features: ['Everything in Premium, plus:', 'AI Voice Generation', 'AI Video Tools (Beta)', 'Priority Support', 'API Access', 'Early access to new features'], buttonText: 'Choose Ultimate' },
  ];

  return (
    <section ref={sectionRef} id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
        <h2 className="section-header-element text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Simple, Transparent Pricing
          </h2>
        <p className="section-header-element mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Choose the plan that's right for you. Cancel anytime. No hidden fees.
        </p>

        <div className="toggle-switch-wrapper mt-10 flex items-center justify-center space-x-4">
          <span className={`text-base font-medium transition-colors ${!isYearly ? 'text-purple-600' : 'text-gray-500'}`}>Monthly</span>
          <button
            aria-label="Toggle billing period"
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isYearly ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isYearly ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-base font-medium transition-colors ${isYearly ? 'text-purple-600' : 'text-gray-500'}`}>
            Yearly <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Save 15%</span>
          </span>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiersData.map((tier, index) => (
            <PricingTierCard
              key={tier.name}
              name={tier.name}
              price={isYearly ? tier.priceYearly : tier.priceMonthly}
              priceSuffix={tier.priceMonthly === "Free" ? "" : (isYearly ? '/ month, billed annually' : '/ month')}
              description={tier.description}
              features={tier.features}
              isPopular={tier.isPopular}
              buttonText={tier.buttonText}
              animationDelay={index * 0.15}
            />
          ))}
                </div>
              </div>
    </section>
  );
};

// === FOOTER ===
const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!footerRef.current) return;
        gsap.from(footerRef.current.querySelectorAll(".footer-element"), {
            y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out',
                scrollTrigger: { trigger: footerRef.current, start: "top 95%", toggleActions: "play none none none" }
            });
  }, []);

  const footerLinksData = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Company: ['About Us', 'Blog', 'Careers', 'Brand Kit'],
    Resources: ['Community', 'Contact', 'Privacy Policy', 'Terms of Service'],
    Developers: ['API Docs', 'Status', 'GitHub', 'Open Source'],
  };

  const socialIconsData = [
    { name: 'Twitter', href: '#', iconPath: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.422.724-.665 1.56-.665 2.452 0 1.606.816 3.021 2.062 3.847-.76-.025-1.474-.234-2.102-.576v.075c0 2.244 1.593 4.111 3.704 4.543-.387.105-.796.16-.966.162-.299 0-.59-.029-.874-.081.589 1.839 2.303 3.179 4.337 3.216-1.581 1.238-3.575 1.975-5.746 1.975-.373 0-.74-.022-1.102-.065 2.042 1.319 4.476 2.089 7.084 2.089 8.49 0 13.139-7.039 13.139-13.14 0-.201 0-.402-.013-.602.902-.652 1.684-1.466 2.3-2.389z" },
    { name: 'GitHub', href: '#', iconPath: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
    { name: 'LinkedIn', href: '#', iconPath: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" },
  ];

  return (
    <footer ref={footerRef} className="bg-gray-900 pt-16 pb-8 text-gray-400 sm:pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          <div className="footer-element col-span-2 md:col-span-5 lg:col-span-1">
            <Link to="/" className="mb-4 inline-flex items-center text-xl font-bold text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="mr-2 h-6 w-6 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Superb AI
            </Link>
            <p className="pr-4 text-sm leading-relaxed">
              The All-In-One AI Workspace for accelerated teams.
            </p>
          </div>
          {Object.entries(footerLinksData).map(([category, links]) => (
            <div key={category} className="footer-element">
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}><a href="#" className="text-sm transition-colors hover:text-purple-400">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-element mt-12 border-t border-gray-800 pt-8 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs">&copy; {new Date().getFullYear()} Superb AI. All Rights Reserved.</p>
          <div className="mt-4 flex space-x-5 sm:mt-0 sm:justify-center">
            {socialIconsData.map(social => (
              <a key={social.name} href={social.href} title={social.name} target="_blank" rel="noopener noreferrer" className="text-gray-500 transition-colors hover:text-purple-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d={social.iconPath} clipRule="evenodd" /></svg>
              </a>
            ))}
          </div>
          </div>
        </div>
      </footer>
  );
};

// === MAIN LANDING PAGE COMPONENT ===
const LandingPage: React.FC = () => {
    // Scroll-to-section handler
  useEffect(() => {
        const handleScrollTo = (e: Event) => {
            e.preventDefault();
            const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute('href')?.substring(1);
            const targetElement = targetId ? document.getElementById(targetId) : null;
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        };

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleScrollTo);
    });

    return () => {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.removeEventListener('click', handleScrollTo);
            });
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            gsap.killTweensOf(window);
    };
  }, []);

  return (
        <div className="bg-white font-sans text-gray-800 antialiased">
      <Header />
            <main>
        <HeroSection />
        <FeaturesGridSection />
        <WavyFeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;