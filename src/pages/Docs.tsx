import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const documentationContent: Record<string, Record<string, { title: string; content: JSX.Element | string }>> = {
  'getting-started': {
    'introduction': {
      title: 'Introduction to Superb AI',
      content: (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-slate-700">Welcome to Superb AI!</h2>
          <p className="text-slate-600 leading-relaxed">
            This comprehensive guide is designed to help you navigate and utilize the full potential of the Superb AI platform. Whether you're a new user or looking to explore advanced features, you'll find valuable information here.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Our platform offers a suite of AI-powered tools for writing, research, content generation, and much more. We're constantly innovating to bring you the latest in AI technology.
          </p>
        </div>
      )
    },
    'account-setup': {
      title: 'Setting Up Your Account',
      content: (
        <div className="text-slate-600 leading-relaxed">
          <p>Follow these simple steps to create and configure your Superb AI account:</p>
          <ol className="list-decimal list-inside space-y-2 mt-4 pl-4">
            <li>Navigate to the <Link to="/signup" className="text-purple-600 hover:underline">Sign Up page</Link>.</li>
            <li>Enter your email address and choose a strong password.</li>
            <li>Verify your email address through the link sent to your inbox.</li>
            <li>Complete your profile information.</li>
            <li>Explore the dashboard and familiarize yourself with the layout.</li>
          </ol>
        </div>
      )
    },
    'first-project': {
      title: 'Creating Your First AI Project',
      content: (
        <div className="text-slate-600 leading-relaxed">
          <p>Let's walk through creating your first project with Superb AI:</p>
          <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
            <li>From the dashboard, click on the "New Project" button.</li>
            <li>Select the type of AI agent or tool you want to use (e.g., AI Writer, Image Generator).</li>
            <li>Provide the necessary inputs, such as a topic, keywords, or a description.</li>
            <li>Configure any advanced settings if needed.</li>
            <li>Click "Generate" and watch Superb AI create content for you!</li>
          </ul>
        </div>
      )
    }
  },
  'api-reference': {
    'authentication': {
      title: 'API Authentication',
      content: (
        <div>
          <p className="text-slate-600 leading-relaxed mb-4">
            To use the Superb AI API, you need to authenticate your requests using an API key. You can find your API key in your account settings page.
          </p>
          <h3 className="text-xl font-semibold mb-2 text-slate-700">Request Header:</h3>
          <pre className="bg-slate-800 text-slate-200 p-4 rounded-md overflow-x-auto text-sm">
            <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
          </pre>
        </div>
      )
    },
    'endpoints': {
      title: 'Core API Endpoints',
      content: (
        <div className="text-slate-600 leading-relaxed">
          <p>Details about our main API endpoints for various AI functionalities...</p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li><code>POST /api/v1/generate/text</code> - Generates text based on a prompt.</li>
            <li><code>POST /api/v1/generate/image</code> - Creates an image from a textual description.</li>
            <li><code>GET /api/v1/status</code> - Checks the current status of the API services.</li>
          </ul>
        </div>
      )
    }
  },
  'ai-agents': {
    'it-agent': {
      title: 'Using the AI IT Agent',
      content: 'Comprehensive documentation for configuring and utilizing the AI IT Agent for technical support and system management.'
    },
    'sales-agent': {
      title: 'AI Sales Agent Guide',
      content: 'Learn how to leverage the AI Sales Agent to optimize sales processes, engage leads, and analyze performance.'
    }
  }
};

const DocsPage: React.FC = () => {
  const { categorySlug, articleSlug } = useParams<{ categorySlug?: string; articleSlug?: string }>();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentCategory = categorySlug || Object.keys(documentationContent)[0];
  const currentArticle = articleSlug || Object.keys(documentationContent[currentCategory])[0];
  const articleData = documentationContent[currentCategory]?.[currentArticle] || {
    title: 'Document Not Found',
    content: 'The requested document could not be found. Please select a topic from the sidebar.'
  };

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
    }
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <nav className="space-y-6 py-4">
      <div className="px-4 mb-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search documentation..."
            className="w-full pl-10 text-sm bg-white/60 border-purple-200 focus:border-purple-500 focus:ring-purple-500/50"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>
      {Object.keys(documentationContent).map((catSlug) => (
        <div key={catSlug}>
          <h3 className="px-4 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2.5">
            {catSlug.replace(/-/g, ' ')}
          </h3>
          <ul className="space-y-1">
            {Object.keys(documentationContent[catSlug]).map((artSlug) => {
              const isActive = currentCategory === catSlug && currentArticle === artSlug;
              return (
                <li key={artSlug}>
                  <Link
                    to={`/docs/${catSlug}/${artSlug}`}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ease-in-out group
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg font-semibold border-l-4 border-pink-300 scale-[1.04]'
                        : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700 hover:scale-[1.03]'}
                    `}
                    style={{ boxShadow: isActive ? '0 4px 24px 0 rgba(168,85,247,0.10)' : undefined }}
                  >
                    <span className="transition-colors duration-200">{documentationContent[catSlug][artSlug].title}</span>
                    {isActive && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 ml-2 text-white drop-shadow"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <PageLayout
      bgColor="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
      titleCentered={false}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[calc(100vh-150px)] py-8 md:py-10">
        <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 pr-8">
          <div className="sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto pb-10 bg-white/60 backdrop-blur-lg p-1 rounded-xl border border-slate-200/80 shadow-lg">
            <SidebarContent />
          </div>
        </aside>

        <div className="md:hidden fixed top-[80px] left-4 z-30">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>

        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex animate-fade-in-fast">
            <aside className="w-72 h-full bg-white shadow-xl p-1 overflow-y-auto border-r border-slate-200">
              <SidebarContent />
            </aside>
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="flex-1 bg-black/40 backdrop-blur-sm"
            ></div>
          </div>
        )}

        <article
          ref={contentRef}
          className="flex-grow md:pl-8 prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-800 prose-a:text-purple-600 hover:prose-a:text-purple-700 prose-code:bg-slate-100 prose-code:p-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-pre:bg-slate-800 prose-pre:text-slate-200 prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto"
        >
          <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30 min-h-full">
            <header className="mb-8 pb-4 border-b border-slate-200/80">
              <h1 className="!text-3xl md:!text-4xl font-bold text-slate-800 !mb-2">
                {articleData.title}
              </h1>
              <p className="text-sm text-slate-500">
                In:{' '}
                <Link
                  to={`/docs/${currentCategory}`}
                  className="capitalize hover:underline font-medium"
                >
                  {currentCategory.replace(/-/g, ' ')}
                </Link>
              </p>
            </header>
            <div>
              {typeof articleData.content === 'string' ? (
                <p>{articleData.content}</p>
              ) : (
                articleData.content
              )}
            </div>
          </div>
        </article>
      </div>
    </PageLayout>
  );
};

export default DocsPage; 