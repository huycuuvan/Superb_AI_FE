import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const PlaceholderIcon: React.FC<{ className?: string; path?: string }> = ({ className, path }) => (
  <svg className={`w-6 h-6 ${className || ''}`} fill="currentColor" viewBox="0 0 20 20">
    <path d={path || "M10 3a7 7 0 100 14 7 7 0 000-14zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"} />
  </svg>
);

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!footerRef.current) return;
    const timer = setTimeout(() => {
      if (footerRef.current) {
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

export default Footer; 