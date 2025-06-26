import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import PageLayout from '@/components/shared/PageLayout';
import { Button } from '@/components/ui/button';

interface BlogPostCardProps {
  slug: string;
  title: string;
  snippet: string;
  author: string;
  date: string;
  imageUrl?: string;
  category: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ slug, title, snippet, author, date, imageUrl, category }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    }
  }, []);

  return (
    <div ref={cardRef} className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden flex flex-col border border-white/20 transition-all duration-300 hover:shadow-purple-500/30 hover:scale-[1.02]">
      {imageUrl && (
        <Link to={`/blog/${slug}`} className="block aspect-video overflow-hidden group">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3">
          <span className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
            {category}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-3 leading-tight hover:text-purple-600 transition-colors">
          <Link to={`/blog/${slug}`}>{title}</Link>
        </h3>
        <p className="text-slate-600 text-sm mb-5 flex-grow leading-relaxed">{snippet}</p>
        <div className="text-xs text-slate-500 mt-auto pt-4 border-t border-slate-200/70">
          By <span className="font-medium text-slate-700">{author}</span> &bull; {date}
        </div>
      </div>
    </div>
  );
};

const BlogPage: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.from(sectionRef.current.children, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
  }, []);

  const posts = [
    {
      slug: 'ai-in-education',
      title: 'The Transformative Role of AI in Modern Education',
      snippet: 'Explore how artificial intelligence is reshaping learning experiences and pedagogical approaches across various levels of education globally.',
      author: 'Dr. Eva Rostova',
      date: 'May 28, 2025',
      imageUrl: 'https://placehold.co/600x338/A78BFA/FFFFFF?text=AI+Education',
      category: 'Education & AI'
    },
    {
      slug: 'future-of-work-automation',
      title: 'Future of Work: Navigating the Age of AI Automation',
      snippet: 'Understand the profound impact of AI on diverse industries and how professionals can prepare for the evolving job market demands.',
      author: 'Johnathan K.',
      date: 'May 25, 2025',
      imageUrl: 'https://placehold.co/600x338/F472B6/FFFFFF?text=Future+Work',
      category: 'Future Tech'
    },
    {
      slug: 'ethical-ai-development',
      title: 'Ethical Considerations in AI Development: A Deep Dive',
      snippet: 'A comprehensive examination of the importance of robust ethical frameworks and responsible AI practices in today\'s world.',
      author: 'Aisha Bello',
      date: 'May 20, 2025',
      imageUrl: 'https://placehold.co/600x338/34D399/FFFFFF?text=Ethical+AI',
      category: 'AI Ethics'
    },
    {
      slug: 'getting-started-superb-ai',
      title: 'Getting Started with Superb AI: A Beginner\'s Guide',
      snippet: 'Your step-by-step introductory guide to leveraging the full power of Superb AI for maximum productivity and creativity.',
      author: 'The Superb AI Team',
      date: 'May 15, 2025',
      imageUrl: 'https://placehold.co/600x338/60A5FA/FFFFFF?text=SuperbAI+Guide',
      category: 'Tutorials'
    }
  ];

  const featuredPost = posts[0];

  return (
    <PageLayout
      pageTitle="Superb AI Insights"
      pageSubtitle="Stay updated with the latest news, articles, and thoughts from the forefront of AI innovation."
    >
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {featuredPost && (
            <div ref={sectionRef} className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl grid md:grid-cols-5 gap-6 md:gap-8 items-center border border-white/20">
              <div className="md:col-span-2 aspect-video rounded-lg overflow-hidden shadow-lg">
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-3 text-left">
                <span className="text-purple-600 font-semibold text-sm mb-2 block uppercase tracking-wider">
                  Featured Article
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 hover:text-purple-700 transition-colors">
                  <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{featuredPost.snippet}</p>
                <div className="text-xs text-slate-500 mb-5">
                  By <span className="font-medium text-slate-700">{featuredPost.author}</span> &bull; {featuredPost.date}
                </div>
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:shadow-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 group shadow-lg"
                >
                  Read Full Story
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 ml-1.5 transform transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12 md:mb-16">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {posts.map(post => (
              <BlogPostCard key={post.slug} {...post} />
            ))}
          </div>
          <div className="text-center mt-16">
            <Button
              variant="outline"
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
            >
              Load More Posts
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BlogPage; 