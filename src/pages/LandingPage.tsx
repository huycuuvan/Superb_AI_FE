import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; // Hoặc thay thế bằng thẻ <a> nếu không dùng React Router
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'; // QUAN TRỌNG: Cần plugin này từ Club GSAP
import { Button } from '@/components/ui/button';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

// Đăng ký plugin GSAP (thường làm ở file App.tsx hoặc file khởi tạo GSAP của dự án)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

// Placeholder cho Icon (bạn nên thay thế bằng SVG thật hoặc thư viện icon)
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
      setIsScrolled(window.scrollY > 10); // Trigger sớm hơn một chút
    };
    window.addEventListener('scroll', handleScroll);
    // Thiết lập trạng thái ban đầu
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ĐÃ XÓA BANNER JOIN NOW */}
      {/* Main Header */}
      <header 
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out 
                    ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3 top-0' : 'py-4 top-0'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            {/* THAY THẾ BẰNG LOGO SVG HOẶC IMG */}
            Superb AI
          </Link>
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-7">
            <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
            <a href="#about" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">About</a>
            <a href="#affiliates" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">Affiliates</a>
            <a href="#blog" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">Blog</a>
          </nav>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">Login</Link>
            <Link to="/signup" className="bg-purple-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center group">
              Sign up
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-1.5 transform transition-transform duration-200 group-hover:translate-x-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

// === HERO SECTION ===
const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
    // Clear previous animations on this element if any, to prevent conflicts on hot reloads
    gsap.killTweensOf(heroRef.current.querySelectorAll(".hero-plus, h1, .hero-subtitle, .hero-cta, .hero-lovedby"));

    tl.from(heroRef.current.querySelectorAll(".hero-plus"), {
        scale: 0,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        delay: 0.3 // Slight delay for elements to be ready
      })
      .from(heroRef.current.querySelector("h1"), { y: 60, opacity: 0, duration: 0.9 }, "-=0.4")
      .from(heroRef.current.querySelector(".hero-subtitle"), { y: 40, opacity: 0, duration: 0.7 }, "-=0.6")
      .from(heroRef.current.querySelector(".hero-cta"), { scale: 0.7, opacity: 0, duration: 0.6, ease: 'back.out(1.7)' }, "-=0.4")
      .from(heroRef.current.querySelector(".hero-lovedby"), { y: 30, opacity: 0, duration: 0.5 }, "-=0.3");
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-36 sm:pt-40 pb-16 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 overflow-hidden">
      {/* Decorative plus signs - more subtle and varied */}
      <div className="hero-plus absolute top-[20%] left-[15%] w-5 h-5 text-purple-400 opacity-60 transform rotate-12 animate-pulse-slow"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></div>
      <div className="hero-plus absolute top-[30%] right-[20%] w-7 h-7 text-pink-400 opacity-70 transform -rotate-6 animate-pulse-slower"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></div>
      <div className="hero-plus absolute bottom-[35%] left-[25%] w-4 h-4 text-indigo-400 opacity-50 transform rotate-45 animate-pulse-slow delay-200"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></div>
      <div className="hero-plus absolute bottom-[25%] right-[30%] w-6 h-6 text-purple-300 opacity-60 transform rotate-[-30deg] animate-pulse-slower delay-400"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <p className="text-xs sm:text-sm font-medium text-purple-600 mb-2 sm:mb-3 tracking-wider uppercase">COMPLETE YOUR WORK IN MINUTES</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-5 sm:mb-6 leading-tight">
        Your AI Workforce Management Platform<br className="hidden sm:block"/>
          <span className="relative inline-block mx-1">
            every
            <span className="absolute inset-x-0 bottom-0 h-2 sm:h-2.5 md:h-3 bg-purple-200 -z-10 transform translate-y-0.5 sm:translate-y-1"></span>
          </span>
          <span className="text-purple-600">task</span>
        </h1>
        <p className="hero-subtitle text-base sm:text-lg md:text-xl text-gray-600 max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-10">
          Superb AI is your all-in-one AI workspace for writing, research, AI chat, voiceovers, image creation and beyond.
        </p>
        <button className="hero-cta bg-purple-600 text-white px-7 py-3 sm:px-8 sm:py-3.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg flex items-center mx-auto group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          Get Started - It's free
        </button>
      </div>
    </section>
  );
};

// === DASHBOARD PREVIEW SECTION ===
const DashboardPreviewSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelector(".dashboard-image-wrapper"), {
        y: 100,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
        }
    });
     gsap.from(sectionRef.current.querySelectorAll(".trusted-by-text, .trusted-by-logos img, .trusted-by-logos span"), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: sectionRef.current.querySelector(".trusted-by-text"),
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dashboard-image-wrapper max-w-4xl lg:max-w-5xl mx-auto mb-16 md:mb-20">
          <img 
            src={dashboardImageUrl}
            alt="Superb AI Dashboard Preview" 
            className="rounded-xl shadow-2xl border-gray-800 object-cover w-full"
            onError={(e) => (e.currentTarget.src = '/image.png')}
          />
        </div>
        <div className="text-center">
          <p className="trusted-by-text text-gray-500 mb-6 text-sm sm:text-base">
            Trusted by students, startups, universities, NGOs and big corporations across the world
          </p>
          <div className="trusted-by-logos flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-4">
            {/* THAY THẾ BẰNG LOGO THẬT (SVG hoặc PNG trong suốt) */}
            <span className="text-gray-400 font-semibold text-lg sm:text-xl italic">Deloitte.</span>
            <span className="text-gray-400 font-semibold text-lg sm:text-xl italic">Microsoft</span>
            <span className="text-gray-400 font-semibold text-lg sm:text-xl italic">Accenture</span>
            <span className="text-gray-400 font-semibold text-lg sm:text-xl italic">HubSpot</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// === FEATURES GRID SECTION ("Say hello to AI...") ===
interface FeatureCardProps {
  iconPath?: string; 
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  animationDelay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconPath, iconBgColor = 'bg-purple-100', iconColor = 'text-purple-600', title, description, animationDelay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(!cardRef.current) return;
    gsap.from(cardRef.current, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        delay: animationDelay,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
        }
    })
  }, [animationDelay]);

  return (
    <div ref={cardRef} className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200/50 h-full text-left">
      <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center mb-5 ${iconColor}`}>
        <PlaceholderIcon className="w-7 h-7" path={iconPath} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const FeaturesGridSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".section-tag, .section-title-main"), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: sectionRef.current,
        start: "top 80%",
            toggleActions: "play none none none"
        }
    });
  }, []);

  const featuresData = [
    { title: 'AI Article Writer', description: 'Write factually-accurate articles with real-time data that drive traffic. Generate articles 100x faster and boost your SEO with Superb AI.', iconBgColor: 'bg-blue-100', iconColor: 'text-blue-600', iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { title: 'AI Academic Writing', description: 'Nexus makes writing and researching for essays easy, fast, and fun while delivering the best results with Academic Citations.', iconBgColor: 'bg-pink-100', iconColor: 'text-pink-600', iconPath: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.051 0 4.006-.804 5.442-2.202m0 0A8.967 8.967 0 0121 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0015 18c-2.051 0-4.006-.804-5.442-2.202m0 0A8.953 8.953 0 0112 15c-2.051 0-4.006.804-5.442 2.202m5.442-2.202a8.953 8.953 0 005.442-2.202m-5.442 2.202L12 15m0 0L9.558 12.798M15 18a8.967 8.967 0 00-6-14.25m0 14.25a8.967 8.967 0 01-6-14.25m6 14.25v-2.202c0-.39.157-.768.442-1.048M15 18V5.958c0-.39-.157-.768-.442-1.048A8.953 8.953 0 0012 3c-2.051 0-4.006.804-5.442 2.202A8.953 8.953 0 003 7.5c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5c0-1.052-.218-2.054-.617-2.958' },
    { title: 'AI Image Generator', description: 'Create something that has never been seen before. Bring your imagination to life, use our generative AI to create stock images and art.', iconBgColor: 'bg-green-100', iconColor: 'text-green-600', iconPath: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
    { title: 'AI Text to Speech', description: 'With seamless delivery, natural intonation and unrivaled versatility, Superb AI voiceover & text-to-speech is the perfect choice for any project.', iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', iconPath: 'M10.343 3.94c.09-.542.56-1.007 1.052-1.007.492 0 .962.465 1.052 1.007a4.5 4.5 0 01-2.104 0zM6.896 3.94c.09-.542.56-1.007 1.052-1.007.492 0 .962.465 1.052 1.007a4.5 4.5 0 01-2.104 0zM12 12.75a1.5 1.5 0 001.5-1.5v-4.5a1.5 1.5 0 00-3 0v4.5a1.5 1.5 0 001.5 1.5zM12 18.75a.75.75 0 00.75-.75V15.75h-1.5v2.25a.75.75 0 00.75.75zM7.5 12.75a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v4.5a.75.75 0 00.75.75zM16.5 12.75a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v4.5a.75.75 0 00.75.75zM4.875 15H3.375A1.125 1.125 0 012.25 13.875v-1.5A1.125 1.125 0 013.375 11.25h1.5c.094 0 .186.013.274.039a4.501 4.501 0 013.702 0A4.501 4.501 0 0112 11.25c1.232 0 2.375.504 3.151 1.313a4.501 4.501 0 013.702 0c.088-.026.18-.039.274-.039h1.5a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125h-1.5a4.501 4.501 0 01-3.702 0A4.501 4.501 0 0112 15.75c-1.232 0-2.375-.504-3.151-1.313a4.501 4.501 0 01-3.702 0z' },
  ];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="section-tag inline-block bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase">
          Popular Superb AI Tools
        </span>
        <h2 className="section-title-main text-3xl sm:text-4xl font-bold text-gray-900 mb-12 md:mb-16">
          Say hello to AI that is <br className="sm:hidden"/> built for every scenario
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {featuresData.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              title={feature.title} 
              description={feature.description}
              iconPath={feature.iconPath}
              iconBgColor={feature.iconBgColor}
              iconColor={feature.iconColor}
              animationDelay={index * 0.1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// === SUPERCHARGED GENERATIVE AI SECTION ===
const SuperchargedAISection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const elementsToAnimate = sectionRef.current.querySelectorAll(".section-tag, .section-title-main, .section-description, .content-card-wrapper, .video-placeholder-wrapper");
    gsap.from(elementsToAnimate, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
        }
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="section-tag inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase">
          Seamless Content Generation
        </span>
        <h2 className="section-title-main text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Supercharged Generative AI
        </h2>
        <p className="section-description text-gray-600 max-w-xl md:max-w-2xl mx-auto mb-12 md:mb-16">
          Experience the power of Superb AI at your fingertips—intelligent, fast, and ready to transform how you work.
        </p>

        <div className="content-card-wrapper max-w-5xl mx-auto bg-slate-50/70 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200/60">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-left">
              <span className="text-purple-600 font-semibold text-sm mb-1 block">1.</span>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Smarter Writing Companion</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Superb AI's intelligent writing assistant helps you write, edit, and reference with ease. Save valuable time and boost your writing efficiency on your next academic project.
              </p>
              <ul className="space-y-2.5 text-sm">
                {['Paraphrase & Rewrite', 'Unlimited Generation', 'Multilingual Support'].map(item => (
                  <li key={item} className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-500 mr-2.5 flex-shrink-0">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.707a.75.75 0 00-1.06-1.06L9 10.94l-1.798-1.797a.75.75 0 10-1.06 1.06L7.94 12l-1.797 1.797a.75.75 0 101.06 1.06L9 13.06l1.798 1.798a.75.75 0 101.06-1.06L10.06 12l1.797-1.797z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
          </div>
            <div className="video-placeholder-wrapper">
              {/* THAY THẾ BẰNG VIDEO HOẶC HÌNH ẢNH VIDEO THẬT */}
              <div className="aspect-video bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-gray-400">Video Placeholder</p>
                 {/* Icon Play nếu muốn */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white/50">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
  );
};

// === WAVY FEATURES SECTION ===
interface WavyFeatureItemProps {
  title: string;
  description: string;
  imageSrc?: string; // Nguồn ảnh thật
  alignLeft?: boolean;
  animationOrder: number;
  itemNumber: number;
  actionText?: string;
  actionLink?: string;
}

const WavyFeatureItem: React.FC<WavyFeatureItemProps> = ({ title, description, imageSrc, alignLeft = true, itemNumber, actionText, actionLink }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!itemRef.current) return;
    gsap.from(itemRef.current, {
        opacity: 0,
        y: 80,
        scale: 0.95,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: itemRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
        }
    })
  }, []);

  const textContent = (
    <div className={`md:w-1/2 ${alignLeft ? 'text-left' : 'text-left md:text-right md:order-1'}`}>
        <span className="text-purple-600 font-semibold text-sm mb-1 block">{itemNumber}.</span>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        {actionText && (
             <a href={actionLink || '#'} className="mt-4 text-purple-600 font-medium text-sm hover:text-purple-800 group flex items-center transition-colors duration-200 ${alignLeft ? '' : 'md:justify-end'}">
                {actionText}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1.5 transform transition-transform duration-200 group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </a>
        )}
    </div>
  );

  const imageContent = (
    <div className={`md:w-1/2 ${alignLeft ? 'md:pl-6 lg:pl-10' : 'md:pr-6 lg:pr-10'}`}>
      <div className="aspect-video bg-gray-200 rounded-lg shadow-lg flex items-center justify-center mt-6 md:mt-0 overflow-hidden">
        {imageSrc ? (
            <img src={imageSrc} alt={title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = `https://placehold.co/600x338/E0E0E0/B0B0B0?text=Error+Loading`)}/>
        ) : (
            <p className="text-gray-400 p-4 text-center">Image Placeholder for {title}</p>
        )}
      </div>
    </div>
  );

  return (
    <div ref={itemRef} className={`relative z-10 bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200/50 mb-12 md:mb-16 lg:mb-20 max-w-4xl mx-auto ${imageSrc ? 'md:flex md:items-center' : ''}`}>
        {alignLeft ? [textContent, imageContent] : [imageContent, textContent]}
    </div>
  )
}

const WavyLineBackground: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!svgRef.current || !pathRef.current) return;
    gsap.set(pathRef.current, { drawSVG: "0% 0%" });

    ScrollTrigger.create({
      trigger: svgRef.current,
      start: "top center",
      end: "bottom center+=200", // Kéo dài trigger một chút để đảm bảo vẽ hết path
      scrub: 1.2,
      onUpdate: self => {
        gsap.to(pathRef.current, { drawSVG: `${self.progress * 100}%`, duration: 0.1, ease: "none" });
      },
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        ref={svgRef}
        width="100%"
        height="2000px" // Tăng chiều cao để chứa path dài hơn, điều chỉnh nếu cần
        viewBox="0 0 1440 2000" // Điều chỉnh viewBox cho phù hợp
        preserveAspectRatio="xMidYMin slice" 
      >
        {/* THAY THẾ PATH NÀY BẰNG SVG PATH CHI TIẾT CỦA BẠN! */}
        {/* Path này phức tạp hơn, cố gắng mô phỏng đường lượn sóng trong thiết kế */}
        <path
          ref={pathRef}
          d="M -50 250 
             C 200 100, 400 400, 720 300 
             S 1000 100, 1200 280 
             L 1490 350
             C 1200 550, 1000 450, 720 600
             S 400 800, 200 700
             L -50 850
             C 250 1050, 450 950, 720 1150
             S 1000 1300, 1250 1200
             L 1490 1350
             C 1150 1550, 950 1450, 720 1650
             S 350 1900, 150 1750
             L -50 1900
            "
          stroke="url(#wavyPathGradient)"
          strokeWidth="150" // Độ dày lớn để tạo hiệu ứng mờ
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
         <defs>
            <linearGradient id="wavyPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(192, 132, 252, 0.08)" /> {/* purple-300 with low opacity */}
                <stop offset="33%" stopColor="rgba(244, 114, 182, 0.06)" /> {/* pink-400 with low opacity */}
                <stop offset="66%" stopColor="rgba(129, 140, 248, 0.08)" /> {/* indigo-400 with low opacity */}
                <stop offset="100%" stopColor="rgba(165, 180, 252, 0.07)" />{/* indigo-300 with low opacity */}
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
    const titleElements = sectionRef.current.querySelectorAll(".section-tag, .section-title-main, .section-description");
     gsap.from(titleElements, {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", toggleActions: "play none none none" }
    });
  }, []);

  const wavyFeaturesData: WavyFeatureItemProps[] = [
    { itemNumber: 2, title: "Streamline Image Creation", description: "Superb AI Image Editor makes creating and editing visuals seamless with live previews, smart controls, and instant style variations for effortless design.", imageSrc: "https://placehold.co/600x338/A78BFA/FFFFFF?text=Image+Editor", alignLeft: true, animationOrder: 0},
    { itemNumber: 3, title: "Seamless Export Options", description: "Export your work to PDF, MS Word (.docx), or HTML formats with zero loss in formatting or structure.", alignLeft: false, animationOrder: 1}, 
    { itemNumber: 4, title: "Team Collaboration", description: "Collaborate seamlessly in real-time with your team. Add members to your paid plan and share files, chat, and collaborate on documents effortlessly.", alignLeft: true, animationOrder: 2, actionText: "Learn More", actionLink: "#collaboration-details" },
    { itemNumber: 5, title: "AI File Chat", description: "Extract specific information from a PDF, .doc or CSV document. Superb AI now swiftly navigates through the document, providing you with instant insights, summaries, or key data points.", imageSrc: "https://placehold.co/600x338/F472B6/FFFFFF?text=AI+File+Chat", alignLeft: false, animationOrder: 3 },
    { itemNumber: 6, title: "Plagiarism Checker", description: "Superb AI enables you to scan millions of online sources in seconds to detect instances of plagiarism or content duplication, providing corresponding links to the plagiarized content found online.", imageSrc: "https://placehold.co/600x338/34D399/FFFFFF?text=Plagiarism+Check", alignLeft: true, animationOrder: 4 },
    { itemNumber: 7, title: "AI Chatbot", description: "Get instant answers to your questions, no matter the topic. Whether you're trying to book a reservation, get product recommendations, or just chat about the weather, Superb AI is always ready and willing to help.", imageSrc: "https://placehold.co/600x338/60A5FA/FFFFFF?text=AI+Chatbot", alignLeft: false, animationOrder: 5 },
  ];

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 overflow-hidden">
      <WavyLineBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <span className="section-tag inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase">
            UNIFIED SUPERPOWER
          </span>
          <h2 className="section-title-main text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Whatever you need done, <br className="sm:hidden"/> Superb AI can do
          </h2>
          <p className="section-description text-gray-600 text-base sm:text-lg">Turn ideas into AI, lightning fast.</p>
        </div>

        {wavyFeaturesData.map((feature) => (
           <WavyFeatureItem 
            key={feature.itemNumber}
            {...feature}
           />
        ))}
      </div>
    </section>
  );
};

// === AI VOICE CHATBOT SECTION === (Đã định nghĩa ở Part 2)
const AIVoiceChatbotSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const elementsToAnimate = sectionRef.current.querySelectorAll(
      ".section-tag, .section-title-main, .section-description, .feature-list-item, .action-button, .image-placeholder-wrapper, .decorative-blobs div"
    );
    gsap.from(elementsToAnimate, {
      y: 60, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" }
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="decorative-blobs absolute inset-0 pointer-events-none z-0 opacity-70">
        <div className="absolute top-1/4 left-10 w-40 h-40 sm:w-48 sm:h-48 bg-pink-100 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-48 h-48 sm:w-56 sm:h-56 bg-purple-100 rounded-full blur-2xl animate-pulse-slower delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="text-left">
            <span className="section-tag inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase">
              NEW FEATURE
            </span>
            <h2 className="section-title-main text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI Voice Chatbot
            </h2>
            <p className="section-description text-gray-600 mb-6 leading-relaxed">
              Create and deploy lifelike AI voice chatbots for websites with natural conversations, ultra-low latency, and human-like tone and responsiveness for any use case.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                { text: 'Available for team plans only', iconColor: 'text-purple-500' },
                { text: 'Ease of integration', iconColor: 'text-green-500' }
              ].map((item, index) => (
                <li key={index} className="feature-list-item flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${item.iconColor} mr-2.5 flex-shrink-0`}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.707a.75.75 0 00-1.06-1.06L9 10.94l-1.798-1.797a.75.75 0 10-1.06 1.06L7.94 12l-1.797 1.797a.75.75 0 101.06 1.06L9 13.06l1.798 1.798a.75.75 0 101.06-1.06L10.06 12l1.797-1.797z" clipRule="evenodd" />
                  </svg>
                  {item.text}
                </li>
              ))}
            </ul>
            <button className="action-button bg-gray-800 text-white px-6 py-3 sm:px-7 rounded-lg font-medium hover:bg-gray-900 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-base flex items-center group">
              See It In Action
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2 transform transition-transform duration-200 group-hover:translate-x-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>
          </div>
          <div className="image-placeholder-wrapper mt-10 md:mt-0 relative">
            <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-0.5 sm:p-1 rounded-xl shadow-2xl">
              <div className="bg-white p-4 sm:p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img src="https://placehold.co/48x48/1F2937/FFFFFF?text=AI" alt="AI Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 object-cover"/>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Hey, I'm Nexus!</p>
                    <p className="text-xs text-gray-500">Need help? Give me a call.</p>
              </div>
            </div>
                <button className="w-full bg-gray-800 text-white py-2.5 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.051-.996-.148-1.467l-2.16-7.902a2.25 2.25 0 0 0-2.162-1.684h-1.732a2.25 2.25 0 0 0-2.162 1.684l-2.16 7.902A2.25 2.25 0 0 1 5.25 19.5V2.25a2.25 2.25 0 0 0-2.25-2.25H2.25Z" />
                </svg>
                  Start Call
                </button>
              </div>
            </div>
            <div className="decorative-blobs absolute -bottom-12 -right-12 w-28 h-28 sm:w-32 sm:h-32 opacity-30 -z-10 transform rotate-12">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FBCFE8" d="M60.5,-40.1C73.8,-20.9,76.7,7.8,67.3,32.1C57.9,56.4,36.2,76.3,10.5,80.7C-15.1,85.1,-44.7,74,-60.2,52.9C-75.7,31.8,-77.1,0.7,-67.8,-22.9C-58.5,-46.5,-38.5,-62.6,-17.7,-65.5C3.1,-68.4,24.8,-59.2,42.4,-50.2C50.5,-45.1,60.5,-40.1,60.5,-40.1Z" transform="translate(100 100) scale(0.7)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

// === PRICING SECTION === (Đã định nghĩa ở Part 2)
interface PricingTierProps {
  name: string;
  price: string;
  priceSuffix?: string;
  description?: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant?: 'primary' | 'outline';
  animationDelay?: number;
}

const PricingTierCard: React.FC<PricingTierProps> = ({
  name, price, priceSuffix = '/month', description, features, isPopular, buttonText, buttonVariant = 'outline', animationDelay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(!cardRef.current) return;
    gsap.from(cardRef.current, {
        y: 70, opacity: 0, scale: 0.95, duration: 0.8, delay: animationDelay, ease: 'power3.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%', toggleActions: 'play none none none' }
    })
  }, [animationDelay]);

  return (
    <div ref={cardRef} className={`relative p-6 md:p-8 rounded-xl border h-full flex flex-col transition-all duration-300
      ${isPopular ? 'bg-gray-800 text-white border-purple-500 shadow-2xl lg:scale-105' : 'bg-white text-gray-800 border-gray-200 shadow-lg hover:shadow-xl'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          POPULAR
        </div>
      )}
      <h3 className={`text-xl font-semibold mb-1 ${isPopular ? 'text-white' : 'text-gray-800'}`}>{name}</h3>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-gray-800'}`}>{price}</span>
        {price !== "$0" && <span className={`text-sm ml-1 ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>{priceSuffix}</span>}
        {description && <p className={`text-xs mt-1 ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>}
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 mr-2.5 flex-shrink-0 ${isPopular ? 'text-purple-400' : 'text-purple-500'}`}>
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <span className={isPopular ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 mt-auto transform hover:scale-105
        ${isPopular || buttonVariant === 'primary'
          ? `bg-purple-600 text-white hover:bg-purple-700 shadow-md ${isPopular ? 'hover:shadow-purple-400/50' : ''}`
          : `border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 ${isPopular ? 'border-purple-400 text-white hover:bg-purple-500' : ''}`
        }`}>
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
    gsap.from(sectionRef.current.querySelectorAll(".section-title-main, .section-subtitle, .toggle-switch-wrapper"), {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }
    });
  }, []);

  const tiersData = [
    { name: 'Free', price: '$0', description: 'No Credit Card Required', features: ['500 AI Words', 'AI Disguise', 'In-text Citations', 'AI Writer & Editor', 'Limited PDF Uploads', 'AI Images (Basic)', 'Advanced AI Models (Limited)'], buttonText: 'Start for free' },
    { name: 'Premium', priceMonthly: '$18', priceYearly: '$15', isPopular: true, features: ['Everything in free, plus:', 'Unlimited AI Words', 'AI Academic Writer', 'AI Image Generator (Standard)', 'AI File Chat & Vision', 'Plagiarism Checker', 'AI Voiceover', 'AI Video Generator (Basic)'], buttonText: 'Join This Plan', buttonVariant: 'primary' },
    { name: 'Ultimate', priceMonthly: '$35', priceYearly: '$29', features: ['Everything in premium, plus:', 'AI Video Generator (Advanced)', 'AI Voiceover Pro', 'AI Voice Clone', 'AI Voice Isolator', 'Priority Support', 'Analytics and Reporting', 'New Features Early Access'], buttonText: 'Join This Plan' },
  ];

  return (
    <section ref={sectionRef} id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="section-title-main text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Simple Transparent Pricing.
          </h2>
        <p className="section-subtitle text-gray-600 max-w-lg md:max-w-xl mx-auto mb-8 md:mb-12">
          Save up to 30% on annual plans. Cancel Anytime. No hidden fees.
        </p>

        <div className="toggle-switch-wrapper flex justify-center items-center space-x-3 mb-10 md:mb-12">
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-purple-600' : 'text-gray-500'}`}>Monthly</span>
          <button
            aria-label="Toggle billing period"
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${isYearly ? 'bg-purple-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isYearly ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-purple-600' : 'text-gray-500'}`}>
            Yearly <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md ml-1 font-semibold">Save 30%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
          {tiersData.map((tier, index) => (
            <PricingTierCard
              key={tier.name}
              name={tier.name}
              price={isYearly && tier.priceYearly ? tier.priceYearly : (tier.priceMonthly || tier.price)}
              priceSuffix={tier.price === "$0" ? "" : (isYearly ? "/year" : "/month")}
              description={tier.description}
              features={tier.features}
              isPopular={tier.isPopular}
              buttonText={tier.buttonText}
              buttonVariant={tier.buttonVariant as 'primary' | 'outline'}
              animationDelay={index * 0.1}
            />
          ))}
                </div>
              </div>
    </section>
  );
};

// === GLOBAL PRESENCE SECTION === (Đã định nghĩa ở Part 2)
const GlobalPresenceSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const titleElements = sectionRef.current.querySelectorAll(".section-tag, .section-title-main, .section-description");
    const mapImage = sectionRef.current.querySelector(".map-image-container");
    const flags = sectionRef.current.querySelectorAll(".country-flag");
    const ctaButton = sectionRef.current.querySelector(".cta-button");

    gsap.from(titleElements, {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }
    });
    if (mapImage) {
      gsap.from(mapImage, {
          scale: 0.85, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.2,
          scrollTrigger: { trigger: mapImage, start: "top 75%", toggleActions: "play none none none" }
      });
    }
    gsap.from(flags, {
        scale: 0.5, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'back.out(1.7)', delay: 0.5,
        scrollTrigger: { trigger: flags[0] || mapImage, start: "top 70%", toggleActions: "play none none none" }
    });
    if(ctaButton) {
        gsap.from(ctaButton, {
            y: 30, opacity: 0, duration: 0.7, ease: 'back.out(1.7)', delay: 0.7,
            scrollTrigger: { trigger: ctaButton, start: "top 90%", toggleActions: "play none none none" }
        });
    }
  }, []);

  const flagsData = [
    { name: 'USA', position: 'top-[25%] left-[20%]', icon: '🇺🇸' },
    { name: 'Brazil', position: 'bottom-[30%] left-[30%]', icon: '🇧🇷' },
    { name: 'UK', position: 'top-[30%] left-[45%]', icon: '🇬🇧' },
    { name: 'Turkey', position: 'top-[28%] right-[38%]', icon: '🇹🇷' },
    { name: 'India', position: 'bottom-[45%] right-[30%]', icon: '🇮🇳' },
    { name: 'South Africa', position: 'bottom-[20%] left-[52%]', icon: '🇿🇦' },
    { name: 'Japan', position: 'bottom-[40%] right-[15%]', icon: '🇯🇵' },
    { name: 'China', position: 'top-[35%] right-[22%]', icon: '🇨🇳' },
  ];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-10 left-10 w-5 h-5 bg-purple-400/50 rounded-full animate-ping"></div>
        <div className="absolute bottom-10 right-10 w-7 h-7 bg-pink-400/50 rounded-lg transform rotate-45 animate-pulse-slow"></div>
        <div className="absolute top-1/2 -translate-y-1/2 right-20 w-4 h-4 bg-blue-300/50 rounded-sm animate-bounce delay-500"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="section-tag inline-block bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase">
          AVAILABLE WORLDWIDE
        </span>
        <h2 className="section-title-main text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Loved Around the World
        </h2>
        <p className="section-description text-gray-600 max-w-md md:max-w-lg mx-auto mb-12 md:mb-16">
          Use Superb AI whenever and wherever you are.
        </p>

        <div className="map-image-container relative max-w-3xl mx-auto mb-12 md:mb-16">
          {/* THAY THẾ BẰNG ẢNH BẢN ĐỒ SVG CHI TIẾT HƠN */}
          <img 
            src="https://placehold.co/1000x500/F3F4F6/D1D5DB?text=World+Map+Placeholder" 
            alt="World Map" 
            className="w-full h-auto opacity-70"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/1000x500/F3F4F6/D1D5DB?text=Map+Error')}
          />
          {flagsData.map(flag => (
            <div
              key={flag.name}
              className={`country-flag absolute ${flag.position} transform -translate-x-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white rounded-full shadow-lg hover:scale-125 transition-transform duration-200 cursor-pointer`}
              title={flag.name}
            >
              <span className="text-xl sm:text-2xl md:text-3xl">{flag.icon}</span>
            </div>
          ))}
              </div>
              
        <button className="cta-button bg-purple-600 text-white px-7 py-3 sm:px-8 sm:py-3.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 text-base sm:text-lg flex items-center mx-auto group">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-2.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0A11.953 11.953 0 0 0 12 10.5c2.998 0 5.74 1.1 7.843 2.918" />
           </svg>
          Join Us
        </button>
              </div>
    </section>
  );
};

// === FOOTER === (Đã định nghĩa ở Part 2)
const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!footerRef.current) return;
    // Delay animation slightly to ensure page layout is stable
    const timer = setTimeout(() => {
        if (footerRef.current) { // Check again in case component unmounted
            gsap.from(footerRef.current.querySelectorAll(".footer-column, .footer-bottom-text, .footer-social-link"), {
                y: 40, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
                scrollTrigger: { trigger: footerRef.current, start: "top 95%", toggleActions: "play none none none" }
            });
        }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const footerLinksData = {
    Product: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Docs'],
    Company: ['About', 'Blog', 'Careers', 'Customers', 'Brand'],
    Resources: ['Community', 'Contact', 'Privacy Policy', 'Terms of Service'],
    Developers: ['API', 'Status', 'GitHub', 'VS Code Extension']
  };

  const socialIconsData = [
    { name: 'Facebook', href: '#', iconPath: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" },
    { name: 'Twitter', href: '#', iconPath: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.422.724-.665 1.56-.665 2.452 0 1.606.816 3.021 2.062 3.847-.76-.025-1.474-.234-2.102-.576v.075c0 2.244 1.593 4.111 3.704 4.543-.387.105-.796.16-.966.162-.299 0-.59-.029-.874-.081.589 1.839 2.303 3.179 4.337 3.216-1.581 1.238-3.575 1.975-5.746 1.975-.373 0-.74-.022-1.102-.065 2.042 1.319 4.476 2.089 7.084 2.089 8.49 0 13.139-7.039 13.139-13.14 0-.201 0-.402-.013-.602.902-.652 1.684-1.466 2.3-2.389z" },
    { name: 'GitHub', href: '#', iconPath: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
    { name: 'LinkedIn', href: '#', iconPath: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" },
  ];

  return (
    <footer ref={footerRef} className="bg-gray-900 text-gray-400 pt-16 sm:pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          <div className="footer-column col-span-2 md:col-span-3 lg:col-span-1 pr-0 sm:pr-8">
            <Link to="/" className="text-2xl font-bold text-white mb-3 inline-block">
              {/* THAY THẾ BẰNG LOGO THẬT (SVG trắng hoặc sáng màu) */}
              Superb AI
            </Link>
            <p className="text-sm mb-4 leading-relaxed">
              The All-In-One AI Workspace for accelerated teams. Empowering innovation with intelligent automation.
            </p>
            <div className="flex space-x-4">
              {socialIconsData.map(social => (
                <a key={social.name} href={social.href} title={social.name} target="_blank" rel="noopener noreferrer" className="footer-social-link text-gray-500 hover:text-purple-400 transition-colors">
                  <PlaceholderIcon className="w-5 h-5" path={social.iconPath} />
                </a>
              ))}
            </div>
          </div>
          
          {Object.entries(footerLinksData).map(([category, links]) => (
            <div key={category} className="footer-column">
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">{category}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link}><a href="#" className="text-sm hover:text-purple-400 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom-text border-t border-gray-700 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Superb AI. All rights reserved. Crafted with passion by AI enthusiasts.</p>
          </div>
        </div>
      </footer>
  );
};

// === MAIN LANDING PAGE COMPONENT ===
const LandingPage: React.FC = () => {
  useEffect(() => {
    // GSAP defaults for better performance with will-change
    gsap.defaults({
      willChange: "transform, opacity"
    });
    ScrollTrigger.defaults({
      // markers: process.env.NODE_ENV === "development" // Enable markers in dev
    });
    
    const handleScrollToSection = (targetId: string) => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerElement = document.querySelector('header') as HTMLElement;
            const gradientElement = document.querySelector('.bg-gradient-to-r') as HTMLElement;
            const headerHeight = (headerElement?.offsetHeight || 0) + (gradientElement?.offsetHeight || 0);
            gsap.to(window, { duration: 1, scrollTo: { y: targetElement, offsetY: headerHeight + 20 }, ease: 'power2.inOut' });
        }
    };

    const navLinks = document.querySelectorAll('header a[href^="#"]');
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (this: HTMLAnchorElement, e) {
            const hrefAttribute = this.getAttribute('href');
            if (hrefAttribute && hrefAttribute.startsWith("#") && hrefAttribute.length > 1) {
                const targetId = hrefAttribute.substring(1);
                if (document.getElementById(targetId)) { // Check if element exists
                    e.preventDefault();
                    handleScrollToSection(targetId);
                }
            }
        });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf(window); // Kill scroll tweens
    };
  }, []);

  return (
    <div className="bg-white text-gray-800 antialiased font-sans"> {/* Nên định nghĩa font-family chung ở body hoặc html */}
      <Header />
      <main style={{ paddingTop: '76px' }}> {/* Approximate height of fixed header + top banner */}
        <HeroSection />
        <DashboardPreviewSection />
        <FeaturesGridSection />
        <SuperchargedAISection />
        <WavyFeaturesSection />
        <AIVoiceChatbotSection />
        <PricingSection />
        <GlobalPresenceSection />
      </main>
      <Footer />
    </div>
  );
};

const dashboardImageUrl = (typeof window !== 'undefined' && (window as any).dashboardImageUrl) ? (window as any).dashboardImageUrl : '/image.png';

export default LandingPage;
