import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-founder',
    bio: 'Former AI researcher at Google with 10+ years of experience in machine learning and natural language processing.',
    imageUrl: 'https://placehold.co/400x400/A78BFA/FFFFFF?text=SC',
    socialLinks: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'Michael Rodriguez',
    role: 'CTO & Co-founder',
    bio: 'Previously led engineering teams at OpenAI and Microsoft, specializing in large language models and AI infrastructure.',
    imageUrl: 'https://placehold.co/400x400/F472B6/FFFFFF?text=MR',
    socialLinks: {
      linkedin: '#',
      github: '#'
    }
  },
  {
    name: 'Emily Thompson',
    role: 'Head of Product',
    bio: 'Product leader with experience at Amazon and Adobe, focused on creating intuitive AI-powered user experiences.',
    imageUrl: 'https://placehold.co/400x400/34D399/FFFFFF?text=ET',
    socialLinks: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    bio: 'Full-stack engineer with expertise in building scalable AI systems and real-time applications.',
    imageUrl: 'https://placehold.co/400x400/60A5FA/FFFFFF?text=DK',
    socialLinks: {
      linkedin: '#',
      github: '#'
    }
  }
];

const AboutPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const contentRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.5,
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }

    if (teamRef.current) {
      gsap.from(teamRef.current.children, {
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.6,
        scrollTrigger: {
          trigger: teamRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
  }, []);

  return (
    <PageLayout
      pageTitle="About Superb AI"
      pageSubtitle="We're on a mission to make AI accessible and beneficial for everyone."
      bgColor="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div ref={contentRef} className="space-y-16">
            <section className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-slate-600">
                    <p>
                      Founded in 2023, Superb AI emerged from a simple yet powerful
                      idea: to make artificial intelligence accessible and beneficial
                      for everyone. Our founders, experienced AI researchers and
                      engineers, witnessed firsthand how AI could transform
                      businesses and lives.
                    </p>
                    <p>
                      What started as a small team of passionate individuals has
                      grown into a diverse group of experts dedicated to pushing the
                      boundaries of what's possible with AI. We believe in creating
                      technology that enhances human potential rather than replacing
                      it.
                    </p>
                    <p>
                      Today, we're proud to serve thousands of customers worldwide,
                      from startups to enterprises, helping them harness the power of
                      AI to achieve their goals.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img
                      src="https://placehold.co/600x600/A78BFA/FFFFFF?text=Our+Story"
                      alt="Our Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -z-10"></div>
                </div>
              </div>
            </section>

            <section className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30">
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                Our Values
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Innovation
                  </h3>
                  <p className="text-slate-600">
                    We constantly push the boundaries of what's possible with AI,
                    exploring new technologies and approaches to solve complex
                    problems.
                  </p>
                </div>
                <div className="bg-white/50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Collaboration
                  </h3>
                  <p className="text-slate-600">
                    We believe in the power of working together, both within our
                    team and with our customers, to achieve extraordinary results.
                  </p>
                </div>
                <div className="bg-white/50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Trust
                  </h3>
                  <p className="text-slate-600">
                    We build our products and relationships on a foundation of trust,
                    ensuring transparency and reliability in everything we do.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                Meet Our Team
              </h2>
              <div
                ref={teamRef}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden group"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="flex space-x-4">
                          {member.socialLinks.linkedin && (
                            <a
                              href={member.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-purple-300 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </a>
                          )}
                          {member.socialLinks.twitter && (
                            <a
                              href={member.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-purple-300 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                            </a>
                          )}
                          {member.socialLinks.github && (
                            <a
                              href={member.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-purple-300 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-purple-600 font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-slate-600 text-sm">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 md:p-10 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">
                  Join Us in Shaping the Future of AI
                </h2>
                <p className="text-lg mb-8 text-white/90">
                  We're always looking for talented individuals who share our passion
                  for AI and innovation. Check out our open positions and join our
                  team.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className={`${isDark ? 'button-gradient-dark' : 'button-gradient-light'} text-white border-0`}
                  asChild
                >
                  <Link to="/careers">View Open Positions</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage; 