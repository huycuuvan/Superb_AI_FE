import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import PageLayout from '@/components/shared/PageLayout';
import { Button } from '@/components/ui/button';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  priceId?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for individuals and small teams just getting started with AI.',
    features: [
      '5 AI Agents',
      '10,000 API calls per month',
      'Basic AI models',
      'Email support',
      'Standard response time',
      'Basic analytics',
      'Community access'
    ],
    cta: 'Start Free Trial',
    priceId: 'price_starter'
  },
  {
    name: 'Professional',
    price: '$99',
    description: 'Ideal for growing businesses that need more AI power and features.',
    features: [
      '15 AI Agents',
      '50,000 API calls per month',
      'Advanced AI models',
      'Priority email support',
      'Faster response time',
      'Advanced analytics',
      'API access',
      'Custom integrations'
    ],
    cta: 'Start Free Trial',
    popular: true,
    priceId: 'price_pro'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations requiring maximum AI capabilities and support.',
    features: [
      'Unlimited AI Agents',
      'Unlimited API calls',
      'Premium AI models',
      '24/7 dedicated support',
      'Instant response time',
      'Enterprise analytics',
      'Custom API solutions',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom training'
    ],
    cta: 'Contact Sales',
    priceId: 'price_enterprise'
  }
];

const PricingPage: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
  }, []);

  return (
    <PageLayout
      pageTitle="Simple, Transparent Pricing"
      pageSubtitle="Choose the perfect plan for your needs. All plans include a 14-day free trial."
      bgColor="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 bg-purple-100 rounded-full">
              <span className="text-sm font-medium text-purple-700">
                Save 20% with annual billing
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              All plans include our core AI features. Scale up as your needs grow.
            </p>
          </div>

          <div
            ref={cardsRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
          >
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden ${
                  tier.popular ? 'lg:scale-105 lg:z-10' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center py-1.5 text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-slate-800">
                      {tier.price}
                    </span>
                    {tier.price !== 'Custom' && (
                      <span className="ml-2 text-slate-500">/month</span>
                    )}
                  </div>
                  <p className="text-slate-600 mb-6">{tier.description}</p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2.5 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full py-6 text-base font-medium ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600'
                        : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                    }`}
                    asChild
                  >
                    <Link to={tier.priceId === 'price_enterprise' ? '/contact' : '/signup'}>
                      {tier.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Need a custom solution?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              We offer tailored solutions for enterprises with specific requirements.
              Our team will work with you to create a custom plan that fits your
              needs perfectly.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>

          <div className="mt-20 bg-white/60 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-white/30 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">
                  What happens after my free trial?
                </h4>
                <p className="text-slate-600">
                  After your 14-day free trial, you'll be automatically moved to the
                  plan you selected. You can upgrade, downgrade, or cancel at any
                  time.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">
                  Can I change plans later?
                </h4>
                <p className="text-slate-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes
                  will be reflected in your next billing cycle.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">
                  What payment methods do you accept?
                </h4>
                <p className="text-slate-600">
                  We accept all major credit cards, PayPal, and bank transfers for
                  annual plans. Enterprise customers can also pay via invoice.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">
                  Is there a refund policy?
                </h4>
                <p className="text-slate-600">
                  Yes, we offer a 30-day money-back guarantee. If you're not
                  satisfied, we'll refund your payment in full.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PricingPage; 