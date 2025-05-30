import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const jobOpenings: JobOpening[] = [
  {
    id: 'senior-ai-engineer',
    title: 'Senior AI Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: "Join our AI engineering team to build and scale our core AI infrastructure and models. You'll work on cutting-edge problems in natural language processing and machine learning.",
    requirements: [
      '5+ years of experience in AI/ML development',
      'Strong background in Python and deep learning frameworks',
      'Experience with large language models and NLP',
      'MS/PhD in Computer Science, AI, or related field',
      'Track record of shipping production AI systems'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      'Professional development budget',
      'Regular team events and retreats'
    ]
  },
  {
    id: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: "Help shape the future of AI-powered products by creating intuitive and beautiful user experiences. You'll work closely with our product and engineering teams to design solutions that make AI accessible to everyone.",
    requirements: [
      '3+ years of product design experience',
      'Strong portfolio showcasing UX/UI work',
      'Experience with design systems and prototyping',
      'Proficiency in Figma and other design tools',
      'Excellent communication and collaboration skills'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Remote work flexibility',
      'Design tools and resources',
      'Annual design conference attendance'
    ]
  },
  {
    id: 'ai-research-scientist',
    title: 'AI Research Scientist',
    department: 'Research',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: "Push the boundaries of AI research by developing novel approaches to natural language understanding and generation. You'll have the opportunity to publish papers and contribute to the broader AI community.",
    requirements: [
      'PhD in Computer Science, AI, or related field',
      'Strong publication record in top AI conferences',
      'Experience with large language models',
      'Proficiency in Python and deep learning frameworks',
      'Passion for advancing AI technology'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Research budget and resources',
      'Conference attendance and speaking opportunities',
      'Collaboration with leading AI researchers'
    ]
  }
];

const CareersPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);

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

    if (jobsRef.current) {
      gsap.from(jobsRef.current.children, {
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.6,
        scrollTrigger: {
          trigger: jobsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
  }, []);

  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || job.department === selectedDepartment;
    const matchesLocation = !selectedLocation || job.location === selectedLocation;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const departments = Array.from(new Set(jobOpenings.map(job => job.department)));
  const locations = Array.from(new Set(jobOpenings.map(job => job.location)));

  return (
    <PageLayout
      pageTitle="Join Our Team"
      pageSubtitle="Help us build the future of AI. We're looking for passionate individuals who want to make a difference."
      bgColor="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div ref={contentRef} className="space-y-16">
            <section className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">
                    Why Join Superb AI?
                  </h2>
                  <div className="space-y-4 text-slate-600">
                    <p>
                      At Superb AI, we're not just building products – we're shaping
                      the future of artificial intelligence. We believe in creating
                      technology that enhances human potential and makes a positive
                      impact on the world.
                    </p>
                    <p>
                      As a member of our team, you'll work alongside brilliant minds,
                      tackle challenging problems, and have the opportunity to grow
                      both professionally and personally.
                    </p>
                    <p>
                      We offer competitive compensation, comprehensive benefits, and a
                      supportive environment where your ideas are valued and your
                      growth is prioritized.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img
                      src="https://placehold.co/600x600/A78BFA/FFFFFF?text=Join+Us"
                      alt="Join Our Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -z-10"></div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl shadow-xl border border-white/30 mb-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Input
                      type="search"
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDepartment('');
                        setSelectedLocation('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>

              <div ref={jobsRef} className="space-y-6">
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-xl border border-white/30 hover:shadow-purple-500/20 transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-purple-600 font-medium">
                            {job.department}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600">{job.location}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600">{job.type}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedJob(job)}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
                      >
                        View Details
                      </Button>
                    </div>
                    <p className="text-slate-600">{job.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {selectedJob && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                          {selectedJob.title}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-purple-600 font-medium">
                            {selectedJob.department}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600">
                            {selectedJob.location}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600">{selectedJob.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">
                          Description
                        </h3>
                        <p className="text-slate-600">{selectedJob.description}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">
                          Requirements
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600">
                          {selectedJob.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">
                          Benefits
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600">
                          {selectedJob.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 border-t border-slate-200">
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 py-6 text-base font-medium"
                          asChild
                        >
                          <Link to={`/apply/${selectedJob.id}`}>
                            Apply for this Position
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 md:p-10 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">
                  Don't See the Right Role?
                </h2>
                <p className="text-lg mb-8 text-white/90">
                  We're always looking for talented individuals to join our team.
                  Even if you don't see a position that matches your skills, we'd
                  love to hear from you.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 border-0"
                  asChild
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CareersPage; 