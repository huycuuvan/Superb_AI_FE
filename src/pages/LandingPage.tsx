import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const LandingPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const animatedTextRef = useRef<HTMLSpanElement>(null);
  
  const words = ["image", "video", "content", "article", "generation", "avatar", "essay"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Animation khi từ cũ biến mất
      gsap.to(animatedTextRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
          // Animation khi từ mới xuất hiện
          gsap.to(animatedTextRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const heroElement = heroRef.current;
    const featuresElement = featuresRef.current;
    
    if (heroElement) {
      heroElement.classList.add("animate-fade-in");
    }
    
    if (featuresElement) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-fade-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(featuresElement);
      
      return () => {
        if (featuresElement) observer.unobserve(featuresElement);
      };
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="fixed w-full bg-white/80 backdrop-blur-sm z-10 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-teampal-500 text-white p-1.5 rounded">
              <span className="font-bold text-sm">TP</span>
            </div>
            <span className="font-bold text-xl">Superb AI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-teampal-500 transition-colors">
              TRANG CHỦ
            </Link>
            <Link to="#features" className="text-sm font-medium hover:text-teampal-500 transition-colors">
              TÍNH NĂNG
            </Link>
            <Link to="#blog" className="text-sm font-medium hover:text-teampal-500 transition-colors">
              BÀI VIẾT
            </Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-teampal-500 transition-colors">
              GIÁ CẢ
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="teampal-button">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 teampal-gradient" ref={heroRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 flex flex-wrap justify-center items-center gap-2">
              <span>The ultimate AI for top-tier</span>
              <span 
                ref={animatedTextRef}
                className="inline-block min-w-[200px] text-teampal-500 transition-all duration-500 ease-in-out text-center"
              >
                {words[currentWordIndex]}
              </span>
              <span>generation.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8">
            ✨ SuperAI là nền tảng AI tiên tiến dành cho mã hóa văn bản, lồng tiếng, nghiên cứu hình ảnh sáng tạo và nhiều ứng dụng vượt trội khác.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-white text-foreground hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              <Link to="#features">
                <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm border-white">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides powerful tools to manage your AI workforce efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 rounded-full bg-teampal-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teampal-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Agent Management</h3>
              <p className="text-muted-foreground">
                Manage your AI agents with ease. Assign tasks, monitor performance, and optimize workflows.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 rounded-full bg-teampal-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teampal-500"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Automation</h3>
              <p className="text-muted-foreground">
                Automate repetitive tasks and increase productivity with our intelligent workflow system.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 rounded-full bg-teampal-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teampal-500"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Get insights into your team's performance with real-time analytics and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Super AI Tools Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Button variant="outline" className="rounded-full px-6 py-2 text-sm mb-8 bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200">
            Các công cụ Super AI phổ biến
          </Button>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Chào đón AI linh hoạt – được xây dựng để đáp ứng mọi nhu cầu của bạn.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-4">
            Tại Superb AI, chúng tôi tin rằng mọi doanh nghiệp đều có thể vận hành hiệu quả và phát triển bền vững .
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-4">
            Chúng tôi không chỉ cung cấp phần mềm, mà mang đến những giải pháp AI ứng dụng thực tiễn, linh hoạt và sát với nhu cầu vận hành thực tế của các doanh nghiệp vừa và nhỏ.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-4">
            Với đội ngũ chuyên gia dày dặn kinh nghiệm trong công nghệ, thương mại điện tử và marketing, Superb AI được thiết kế như một "cánh tay phải" - giúp doanh nghiệp chuyển đổi số dễ dàng mà không cần tái cấu trúc hay tuyển thêm nhân sự kỹ thuật.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Chúng tôi không chỉ triển khai công nghệ - mà còn cùng bạn biến công nghệ thành đòn bẩy vận hành, giúp doanh nghiệp tăng tốc, tiết kiệm chi phí và mở rộng quy mô một cách thông minh.
          </p>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="teampal-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to transform your workflow?
          </h2>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-foreground hover:bg-gray-100">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-teampal-500 text-white p-1.5 rounded">
                  <span className="font-bold text-sm">TP</span>
                </div>
                <span className="font-bold text-xl">Superb AI</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                The next generation AI workforce management platform for businesses of all sizes.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Blog</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Documentation</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Tutorials</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">About</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Careers</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-teampal-500">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} Superb AI. All rights reserved.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-teampal-500">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-teampal-500">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-teampal-500">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
