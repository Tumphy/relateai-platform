import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, User, Users, BarChart3, Lightbulb, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative">
      {/* Header/Navigation */}
      <header className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-full.svg"
                width={160}
                height={40}
                alt="RelateAI"
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-neutral-600 hover:text-primary-600">Features</Link>
            <Link href="#howitworks" className="text-neutral-600 hover:text-primary-600">How it works</Link>
            <Link href="#pricing" className="text-neutral-600 hover:text-primary-600">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="hidden md:inline-flex text-sm font-medium text-neutral-700 hover:text-primary-600"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="btn-primary text-sm"
            >
              Get early access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative isolate">
          {/* Background decoration */}
          <div className="absolute inset-x-0 top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-300 to-secondary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
              }}
            />
          </div>

          {/* Hero content */}
          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  Outreach powered by AI. Strategy powered by research.
                </h1>
                <p className="mt-6 text-lg leading-8 text-neutral-600">
                  RelateAI builds account plans, writes emails, and scores prospects like your best SDR would.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/signup"
                    className="rounded-md bg-primary-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-500 transition-all"
                  >
                    Get early access
                  </Link>
                  <button 
                    onClick={() => {
                      // Sample account plan modal logic would go here
                      alert('Sample account plan would show in a modal');
                    }}
                    className="text-base font-semibold leading-6 text-neutral-800 hover:text-primary-600 flex items-center"
                  >
                    See a sample account plan <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hero image/mockup */}
              <div className="mt-16 flow-root sm:mt-24">
                <div className="relative -m-2 rounded-xl bg-neutral-900/5 p-2 ring-1 ring-inset ring-neutral-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src="https://source.unsplash.com/random/1920x1080/?dashboard"
                    alt="App screenshot"
                    width={2432}
                    height={1442}
                    className="rounded-md shadow-2xl ring-1 ring-neutral-900/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem vs Solution Section */}
        <section className="py-24 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">BETTER SALES PROCESS</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                From manual tasks to strategic conversations
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                Stop spending hours on research and cold email templates. RelateAI helps you focus on building relationships while handling the heavy lifting.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                {/* The Problem */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
                  <h3 className="text-lg font-semibold leading-8 text-danger-600 mb-4">The Problem</h3>
                  <ul className="space-y-4">
                    {[
                      'Manual research taking hours per account',
                      'Generic outreach with poor response rates',
                      'No systematic way to prioritize accounts',
                      'Disjointed tracking across tools & channels',
                      'Struggling to identify buying signals'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-x-3">
                        <span className="text-danger-500 flex-none">✕</span>
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The Solution */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
                  <h3 className="text-lg font-semibold leading-8 text-success-600 mb-4">The Solution</h3>
                  <ul className="space-y-4">
                    {[
                      'AI-powered research in minutes not hours',
                      'Personalized outreach at scale that gets replies',
                      'Intelligent scoring based on ICP & signals',
                      'One platform for all engagement channels',
                      'Auto-detect & alert on buying signals'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-x-3">
                        <Check className="h-5 w-5 flex-none text-success-500" />
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="howitworks" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">HOW IT WORKS</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Three steps to better sales outcomes
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                RelateAI combines deep research, strategic planning, and personalized outreach in one seamless workflow.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {[
                  {
                    icon: <User className="h-12 w-12 text-primary-600" />,
                    title: 'Identify your ICP',
                    description: 'Upload your best customers or define your ICP manually. RelateAI creates a matching model to find similar accounts.'
                  },
                  {
                    icon: <Lightbulb className="h-12 w-12 text-primary-600" />,
                    title: 'Create account plans',
                    description: 'AI analyzes signals, events, job openings and builds a MEDDPPICC plan with strategic talking points.'
                  },
                  {
                    icon: <MessageSquare className="h-12 w-12 text-primary-600" />,
                    title: 'Personalize outreach',
                    description: 'Send personalized emails, LinkedIn messages, and sequences based on prospect research and your value prop.'
                  }
                ].map((step, i) => (
                  <div key={i} className="relative p-8 bg-white rounded-2xl shadow-sm border border-neutral-200">
                    <div className="absolute top-0 left-8 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl">
                      {i + 1}
                    </div>
                    <div className="mt-6">
                      <div className="mb-4">{step.icon}</div>
                      <h3 className="text-xl font-semibold leading-7 text-neutral-900">{step.title}</h3>
                      <p className="mt-2 text-base leading-7 text-neutral-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="py-24 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">PLATFORM FEATURES</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Everything you need in one place
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {[
                  {
                    title: 'Account Plan',
                    description: 'Strategic MEDDPPICC framework with auto-populated insights from AI research.',
                    image: 'https://source.unsplash.com/random/800x600/?chart'
                  },
                  {
                    title: 'GPT Messaging',
                    description: 'Personalized outreach with context-aware messaging that drives engagement.',
                    image: 'https://source.unsplash.com/random/800x600/?email'
                  },
                  {
                    title: 'MEDDPPICC Scoring',
                    description: 'Qualify opportunities with the proven MEDDPPICC framework.',
                    image: 'https://source.unsplash.com/random/800x600/?analytics'
                  },
                  {
                    title: 'ICP Scoring',
                    description: 'AI-powered fit scoring matched to your best customers.',
                    image: 'https://source.unsplash.com/random/800x600/?dashboard'
                  }
                ].map((feature, i) => (
                  <div key={i} className="relative overflow-hidden rounded-2xl">
                    <div className="relative h-80">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-neutral-900/0"></div>
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-xl font-semibold leading-7 text-white">{feature.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-100">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">PRICING</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Simple, transparent pricing
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                Choose the plan that works for your needs, with no hidden fees or complicated tiers.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {[
                  {
                    name: 'Free',
                    price: '$0',
                    description: 'Get started with basic features',
                    features: [
                      '5 accounts',
                      '20 AI-powered messages',
                      'Basic ICP scoring',
                      'Account research',
                      'Email integration'
                    ],
                    cta: 'Get started',
                    ctaColor: 'btn-secondary'
                  },
                  {
                    name: 'Pro',
                    price: '$49',
                    period: '/month',
                    description: 'Ideal for individual founders',
                    features: [
                      'Unlimited accounts',
                      '200 AI-powered messages',
                      'Advanced ICP scoring',
                      'MEDDPPICC framework',
                      'LinkedIn integration',
                      'Email sequences',
                      'Automated follow-ups'
                    ],
                    cta: 'Get early access',
                    ctaColor: 'btn-primary',
                    highlight: true
                  },
                  {
                    name: 'Team',
                    price: '$199',
                    period: '/month',
                    description: 'For small sales teams',
                    features: [
                      'Everything in Pro',
                      'Up to 5 team members',
                      'Unlimited AI messages',
                      'Team collaboration',
                      'CRM integrations',
                      'Custom reporting',
                      'Priority support'
                    ],
                    cta: 'Contact us',
                    ctaColor: 'btn-secondary'
                  }
                ].map((plan, i) => (
                  <div key={i} className={`relative p-8 rounded-2xl shadow-sm border ${plan.highlight ? 'border-primary-200 ring-2 ring-primary-500' : 'border-neutral-200'}`}>
                    {plan.highlight && (
                      <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold leading-7 text-neutral-900">{plan.name}</h3>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight text-neutral-900">{plan.price}</span>
                        {plan.period && <span className="text-base text-neutral-600">{plan.period}</span>}
                      </div>
                      <p className="mt-2 text-base text-neutral-600">{plan.description}</p>
                      <ul className="mt-8 space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex gap-x-3">
                            <Check className="h-5 w-5 flex-none text-primary-500" />
                            <span className="text-sm text-neutral-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <a
                          href="#"
                          className={`block w-full text-center py-2 px-3 rounded-md ${plan.ctaColor}`}
                        >
                          {plan.cta}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials/Logos Section */}
        <section className="py-24 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600">TRUSTED BY TEAMS</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Companies love RelateAI
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
              {/* Company logos */}
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-center">
                    <div className="h-12 w-40 bg-neutral-200 rounded opacity-60"></div>
                  </div>
                ))}
              </div>
              
              {/* Testimonial quote */}
              <div className="relative mt-16">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-neutral-50 px-6 text-4xl text-primary-500">"</span>
                </div>
              </div>
              
              <blockquote className="mt-10">
                <div className="mx-auto max-w-3xl text-center text-xl font-medium leading-9 text-neutral-900">
                  <p>
                    "RelateAI has transformed our outreach strategy. We're seeing 3x more responses and our team saves hours every day on research and personalization. The AI-powered account plans help us focus on the right talking points with prospects."
                  </p>
                </div>
                <footer className="mt-8">
                  <div className="md:flex md:items-center md:justify-center">
                    <div className="md:flex-shrink-0">
                      <div className="mx-auto h-10 w-10 rounded-full bg-neutral-300"></div>
                    </div>
                    <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                      <div className="text-base font-medium text-neutral-900">Sarah Johnson</div>
                      <svg className="mx-1 hidden h-5 w-5 text-primary-600 md:block" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 0h3L9 20H6l5-20z" />
                      </svg>
                      <div className="text-base font-medium text-neutral-500">VP of Sales, TechCorp</div>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Footer / CTA Section */}
        <section className="py-16 bg-primary-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your sales process?
              </h2>
              <p className="mt-6 text-lg leading-8 text-primary-100">
                Join the waitlist today and be among the first to experience RelateAI.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/signup"
                  className="rounded-md bg-white px-5 py-3 text-base font-semibold text-primary-600 shadow-sm hover:bg-primary-50 transition-all"
                >
                  Get early access
                </Link>
                <a href="#" className="text-base font-semibold leading-6 text-white flex items-center hover:text-primary-100">
                  Book a demo <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Actual Footer */}
        <footer className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
            <div className="flex justify-center space-x-6 md:order-2">
              {[
                { name: 'Twitter', href: '#' },
                { name: 'LinkedIn', href: '#' },
                { name: 'GitHub', href: '#' },
              ].map((item) => (
                <a key={item.name} href={item.href} className="text-neutral-400 hover:text-neutral-500">
                  <span className="sr-only">{item.name}</span>
                  <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
                </a>
              ))}
            </div>
            <div className="mt-8 md:order-1 md:mt-0">
              <div className="flex items-center justify-center md:justify-start">
                <Image
                  src="/logo.svg"
                  width={40}
                  height={40}
                  alt="RelateAI"
                  className="h-8 w-auto"
                />
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-neutral-500 md:text-left">
                &copy; {new Date().getFullYear()} RelateAI. All rights reserved.
              </p>
              <div className="mt-2 flex justify-center md:justify-start space-x-4">
                <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900">Privacy Policy</a>
                <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900">Terms of Service</a>
                <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}