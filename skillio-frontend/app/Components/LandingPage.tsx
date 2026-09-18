'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, BarChart3, Target, Users, Zap, BrainCircuit, Network, Sparkles, Menu, X } from 'lucide-react';
import { Button, Card } from './Ui/Components';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Adjusted for bigger header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">
      {/* Header */}
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/80 backdrop-blur-xl border-slate-200/60 py-4 shadow-sm supports-[backdrop-filter]:bg-white/60' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">Skillio</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {['Features', 'Solutions', 'Pricing'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="px-5 py-2.5 text-base font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50/80 rounded-full transition-all duration-200"
              >
                {item}
              </button>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-5">
            <button onClick={onLogin} className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </button>
            <Button onClick={onGetStarted} size="lg" className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all text-base px-6 h-11">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 p-4 shadow-xl md:hidden flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
            {['Features', 'Solutions', 'Pricing'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="text-left px-4 py-3 text-lg font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-2"></div>
            <button onClick={onLogin} className="text-left px-4 py-3 text-lg font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Log in</button>
            <Button onClick={onGetStarted} size="lg" className="w-full justify-center py-3 mt-2 text-base">Get Started</Button>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-36 pb-20 lg:pt-52 lg:pb-32 bg-mesh-color">
          
          {/* Background Details */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-dot-grid"></div>
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="animate-fade-in-up mb-8 inline-flex items-center rounded-full border border-primary-200 bg-white/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary-700 shadow-sm hover:bg-white transition-colors cursor-default">
                <span className="mr-2 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                New: AI-Powered Learning Paths
              </div>
              <h1 className="animate-fade-in-up [animation-delay:200ms] text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-8 leading-tight">
                Map Skills. Close Gaps.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600">Measure ROI.</span>
              </h1>
              <p className="animate-fade-in-up [animation-delay:400ms] mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed">
                The all-in-one platform to visualize your team's capabilities, automate training assignments, and prove the business impact of learning.
              </p>
              <div className="animate-fade-in-up [animation-delay:600ms] mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
                <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto min-w-[160px] h-14 text-base gap-2 shadow-xl shadow-primary-500/20 hover:scale-105 transition-all duration-300">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[160px] h-14 text-base bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-300">
                  View Demo
                </Button>
              </div>
              <div className="animate-fade-in-up [animation-delay:800ms] mt-20 border-t border-slate-200/60 pt-10">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6">Trusted by forward-thinking teams</p>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 grayscale opacity-60 items-center justify-items-center">
                  <div className="text-xl font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors cursor-default"><div className="h-6 w-6 bg-slate-400 rounded-full"></div> ACME Corp</div>
                  <div className="text-xl font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors cursor-default"><div className="h-6 w-6 bg-slate-400 rounded-sm"></div> Globex</div>
                  <div className="text-xl font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors cursor-default"><div className="h-6 w-6 bg-slate-400 rotate-45"></div> Soylent</div>
                  <div className="text-xl font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors cursor-default"><div className="h-6 w-6 bg-slate-400 rounded-full border-4 border-slate-200"></div> Initech</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white relative scroll-mt-20">
          {/* Subtle grid accent for this section */}
          <div className="absolute top-0 right-0 -z-10 h-96 w-96 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Platform Capabilities</h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to build a high-performance learning culture.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="p-8 border border-slate-100 bg-slate-50/50 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:bg-white hover:border-primary-100 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300 shadow-sm">
                  <Target className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Precision Mapping</h3>
                <p className="text-slate-600 leading-relaxed">Visualize skill gaps across departments with our AI-driven taxonomy engine that evolves with your business.</p>
              </Card>
              <Card className="p-8 border border-slate-100 bg-slate-50/50 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:bg-white hover:border-indigo-100 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 shadow-sm">
                  <Users className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Personalized Growth</h3>
                <p className="text-slate-600 leading-relaxed">Automatically assign learning paths that adapt to each employee's pace, role, and career aspirations.</p>
              </Card>
              <Card className="p-8 border border-slate-100 bg-slate-50/50 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:bg-white hover:border-sky-100 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-6 group-hover:bg-sky-600 transition-colors duration-300 shadow-sm">
                  <BarChart3 className="h-7 w-7 text-sky-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time ROI</h3>
                <p className="text-slate-600 leading-relaxed">Track the direct impact of training on productivity, project success rates, and employee retention.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-24 bg-mesh-color scroll-mt-20 overflow-hidden relative">
          <div className="absolute inset-0 -z-10 bg-dot-grid opacity-10"></div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
             <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                <div className="mb-12 lg:mb-0">
                  <div className="inline-flex items-center rounded-full bg-primary-100/50 border border-primary-200 px-3 py-1 text-sm font-medium text-primary-700 mb-6">
                    <Sparkles className="h-3.5 w-3.5 mr-2" />
                    Intelligent Automation
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 sm:text-5xl mb-6 leading-tight">
                    Let AI architect your <br/> learning ecosystem.
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Stop manually assigning courses. Skillio's neural engine analyzes code commits, project tickets, and performance reviews to recommend the exact skill a team member needs, right when they need it.
                  </p>
                  
                  <div className="space-y-6 bg-white/60 p-6 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                    {[
                      { title: 'Skill Gap Prediction', desc: 'Forecast future skill needs based on company roadmap.' },
                      { title: 'Automated Curriculum', desc: 'Generate custom learning paths in seconds.' },
                      { title: 'Mentorship Matching', desc: 'Connect juniors with internal experts automatically.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="flex-none pt-1">
                          <div className="h-8 w-8 rounded-full bg-primary-100 group-hover:bg-primary-600 transition-colors flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                          <p className="text-base text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                   {/* Background glow effect for the card */}
                   <div className="absolute -inset-4 bg-gradient-to-r from-primary-200 to-blue-200 rounded-2xl blur-xl opacity-60"></div>
                   
                   <Card className="relative p-6 sm:p-8 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                      
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                             <BrainCircuit className="h-7 w-7 text-primary-600" />
                           </div>
                           <div>
                             <div className="font-bold text-slate-900 text-lg">Skillio AI Architect</div>
                             <div className="text-sm text-slate-500">Processing team data...</div>
                           </div>
                        </div>
                        {/* Status Dots Animation */}
                        <div className="flex gap-2">
                           <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                           <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
                           <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>

                      {/* Visual Data Processing Area */}
                      <div className="relative h-64 mb-8 bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden group">
                         {/* Background Grid Pattern */}
                         <div className="absolute inset-0 bg-ai-grid opacity-50"></div>
                         
                         {/* Central AI Node */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="relative flex items-center justify-center h-16 w-16 bg-white rounded-full shadow-lg border border-primary-100 z-20">
                                <div className="absolute inset-0 rounded-full border-2 border-primary-500 animate-ping opacity-20"></div>
                                <BrainCircuit className="h-8 w-8 text-primary-600" />
                            </div>
                         </div>

                         {/* Orbiting Team Member Nodes (Images) */}
                         {/* Node 1: Top Left */}
                         <div className="absolute top-1/4 left-1/4 animate-pulse-slow z-10">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-primary-50" />
                         </div>
                         
                         {/* Node 2: Bottom Right */}
                         <div className="absolute bottom-1/3 right-1/4 animate-pulse-slow [animation-delay:1s] z-10">
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-primary-50" />
                         </div>

                         {/* Node 3: Top Right */}
                         <div className="absolute top-1/3 right-10 animate-pulse-slow [animation-delay:2s] z-10">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" alt="User" className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-primary-50" />
                         </div>

                         {/* Scanning Beam Effect */}
                         <div className="absolute inset-0 w-full h-[50%] bg-gradient-to-b from-transparent via-primary-400/10 to-transparent border-b border-primary-300/20 animate-scan pointer-events-none z-0"></div>

                         {/* Connecting Lines (SVG Overlay) */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />
                            <line x1="50%" y1="50%" x2="75%" y2="66%" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />
                            <line x1="50%" y1="50%" x2="85%" y2="33%" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />
                         </svg>
                      </div>

                      {/* Insight Alert Box */}
                      <div className="p-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
                        <div className="flex gap-4">
                           <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                              <Network className="h-5 w-5 text-primary-600" />
                           </div>
                           <div>
                             <div className="text-sm font-bold text-primary-900">Insight Detected</div>
                             <div className="text-sm text-primary-700 mt-1 leading-snug">
                               Engineering team is trending 15% low on "System Design" relative to upcoming architecture overhaul.
                             </div>
                           </div>
                        </div>
                      </div>
                   </Card>
                </div>
             </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50 scroll-mt-20 relative">
           <div className="absolute inset-0 bg-dot-grid opacity-20"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-lg text-slate-600">Choose the plan that best fits your team's needs.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Starter */}
              <Card className="p-8 flex flex-col hover:border-primary-300 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 bg-white/80 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900">Starter</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="ml-2 text-slate-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-600">Perfect for small teams just getting started.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['Up to 10 users', 'Basic Skill Mapping', 'Standard Analytics', 'Email Support'].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-600">
                      <div className="mr-3 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                         <Check className="h-3 w-3 text-green-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button onClick={onGetStarted} variant="outline" className="mt-8 w-full font-semibold border-slate-300">Get Started</Button>
              </Card>

              {/* Pro */}
              <Card className="p-8 flex flex-col border-primary-500 ring-2 ring-primary-500 relative shadow-2xl scale-105 z-10 bg-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white shadow-lg uppercase tracking-wide">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold text-slate-900">Growth</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$49</span>
                  <span className="ml-2 text-slate-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-600">For growing companies scaling their workforce.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['Up to 100 users', 'AI Skill Recommendations', 'Advanced Heatmaps', 'Priority Support', 'SSO Integration'].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-600">
                       <div className="mr-3 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                         <Check className="h-3 w-3 text-primary-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button onClick={onGetStarted} className="mt-8 w-full shadow-lg shadow-primary-500/25 font-semibold h-12">Start Free Trial</Button>
              </Card>

              {/* Enterprise */}
              <Card className="p-8 flex flex-col hover:border-primary-300 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 bg-white/80 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                </div>
                <p className="mt-4 text-sm text-slate-600">For large organizations with specific needs.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['Unlimited users', 'Custom Learning Paths', 'API Access', 'Dedicated Success Manager', 'On-premise options'].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-600">
                       <div className="mr-3 h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                         <Check className="h-3 w-3 text-slate-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button onClick={onGetStarted} variant="outline" className="mt-8 w-full font-semibold border-slate-300">Contact Sales</Button>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold text-white">Skillio</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 Skillio Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};