'use client'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  GraduationCap, 
  Sparkles, 
  Target, 
  Users, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Brain,
  Briefcase,
  X
} from "lucide-react";
// import dashboardMockup from "@/assets/dashboard-mockup.png";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const ScrollFadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        {/* Grid Lines - More Visible */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:8rem_8rem]" />
        
        {/* Spray Painted Spots */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-xl fixed w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">InternSpirit</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
              <a href="#benefits" className="text-sm hover:text-primary transition-colors">Benefits</a>
              <a href="#pricing" className="text-sm hover:text-primary transition-colors">Pricing</a>
              <Button variant="hero" size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Aurora Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12rem] max-w-full h-[50rem] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/40 to-primary/30 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-transparent to-accent/20 blur-2xl" style={{ animationDelay: '5s' }} />
        </div>
        
        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Revolutionizing Professional Learning</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Bridge Education to
            <br />
            <span className="text-primary">Real-World Success</span>
          </h1>
          
          <p className="text-sm md:text-base text-muted-foreground/80 max-w-2xl mx-auto mb-8">
            Transform how students and professionals acquire real-world skills through 
            AI-powered workflow simulation. Learn by doing, guided by personalized AI mentors.
          </p>
          
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button variant="hero" size="default" className="gap-2 text-sm">
              Start Learning <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="default" className="text-sm">Watch Demo</Button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/80" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/80" />
              <span>AI-powered mentorship</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/80" />
              <span>Real company workflows</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Mockup */}
      <section className="pb-20 px-6 relative">
        <div className="container mx-auto">
          <ScrollFadeIn>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-[120px] -z-10 animate-pulse" />
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
              <Card className="p-2 bg-card border-border overflow-hidden">
                <img 
                  src={"/image.png"} 
                  alt="InternSpirit Dashboard Interface" 
                  className="w-full h-auto rounded-lg"
                />
              </Card>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto max-w-4xl">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
                <X className="h-3 w-3 text-destructive" />
                <span className="text-xs text-destructive">The Problem</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Traditional education leaves students <span className="text-muted-foreground">unprepared</span>
              </h2>
            </div>
          </ScrollFadeIn>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ScrollFadeIn delay={100}>
              <Card className="p-6 bg-secondary/50 border-border/50 text-center">
                <div className="text-4xl font-bold text-muted-foreground mb-2">65%</div>
                <p className="text-sm text-muted-foreground">of graduates lack job-ready skills</p>
              </Card>
            </ScrollFadeIn>
            <ScrollFadeIn delay={200}>
              <Card className="p-6 bg-secondary/50 border-border/50 text-center">
                <div className="text-4xl font-bold text-muted-foreground mb-2">2.5x</div>
                <p className="text-sm text-muted-foreground">longer to become productive at work</p>
              </Card>
            </ScrollFadeIn>
            <ScrollFadeIn delay={300}>
              <Card className="p-6 bg-secondary/50 border-border/50 text-center">
                <div className="text-4xl font-bold text-muted-foreground mb-2">40%</div>
                <p className="text-sm text-muted-foreground">quit within first year due to poor fit</p>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="container mx-auto">
          <ScrollFadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary">The Solution</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Learn by doing. <span className="text-primary">Succeed by practicing.</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience authentic company workflows with AI mentorship that adapts to your learning style.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollFadeIn delay={100}>
              <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Mentorship</h3>
                <p className="text-muted-foreground mb-4">
                  Personalized AI mentors guide you through authentic company workflows, 
                  providing real-time feedback and adaptive learning paths.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>24/7 intelligent support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Adaptive learning paths</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Real-time skill assessment</span>
                  </li>
                </ul>
              </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={200}>
              <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real Company Workflows</h3>
                <p className="text-muted-foreground mb-4">
                  Practice with authentic workflows from leading companies across industries, 
                  building skills that employers actually need.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Industry-standard processes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Cross-functional scenarios</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Portfolio-ready projects</span>
                  </li>
                </ul>
              </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={300}>
              <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Outcome-Based Learning</h3>
                <p className="text-muted-foreground mb-4">
                  Track your progress with measurable outcomes that demonstrate real skill 
                  acquisition and career readiness.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Skills-based certification</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Performance analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Career path mapping</span>
                  </li>
                </ul>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Outcome Highlight Section */}
      <section className="py-20 px-6 relative bg-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container mx-auto max-w-5xl relative">
          <ScrollFadeIn>
            <div className="text-center mb-12">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Outcome-Based Learning That <span className="text-primary">Actually Works</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Stop learning theory. Start building skills that matter.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollFadeIn delay={100}>
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Measurable Skill Development</h3>
                    <p className="text-sm text-muted-foreground">
                      Every simulation tracks specific competencies, giving you concrete proof of skill acquisition 
                      that employers recognize and value.
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={200}>
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Career-Ready Portfolio</h3>
                    <p className="text-sm text-muted-foreground">
                      Build a portfolio of real-world projects that showcase your abilities to potential 
                      employers, not just certificates.
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={300}>
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personalized Growth Path</h3>
                    <p className="text-sm text-muted-foreground">
                      AI analyzes your performance and adapts the learning path to focus on areas 
                      where you need the most growth.
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={400}>
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Instant Application</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply what you learn immediately in realistic scenarios, ensuring knowledge 
                      translates directly to workplace success.
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-secondary/30 relative">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="container mx-auto relative">
          <ScrollFadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why learners actually <span className="text-primary">switch.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Built for speed & results. Everything else just... isn't.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                InternSpirit
              </h3>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">AI-powered simulation</p>
                  <p className="text-sm text-muted-foreground">Learn by doing with real workflows</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Immediate skill application</p>
                  <p className="text-sm text-muted-foreground">Practice makes perfect</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Personalized learning</p>
                  <p className="text-sm text-muted-foreground">AI adapts to your pace</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Industry-relevant skills</p>
                  <p className="text-sm text-muted-foreground">Employer-verified competencies</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Career-ready outcomes</p>
                  <p className="text-sm text-muted-foreground">Build your professional portfolio</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-muted-foreground">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                Traditional Learning
              </h3>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border opacity-60">
                <div className="h-5 w-5 flex-shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Limited real-world practice</p>
                  <p className="text-sm text-muted-foreground">Theoretical knowledge only</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border opacity-60">
                <div className="h-5 w-5 flex-shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Generic curriculum</p>
                  <p className="text-sm text-muted-foreground">One-size-fits-all approach</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border opacity-60">
                <div className="h-5 w-5 flex-shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Delayed feedback</p>
                  <p className="text-sm text-muted-foreground">Wait for instructor review</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border opacity-60">
                <div className="h-5 w-5 flex-shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Outdated content</p>
                  <p className="text-sm text-muted-foreground">Disconnected from industry</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border opacity-60">
                <div className="h-5 w-5 flex-shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Theory-heavy approach</p>
                  <p className="text-sm text-muted-foreground">Limited practical application</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 relative">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
        <div className="container mx-auto relative">
          <ScrollFadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h2>
              <p className="text-lg text-muted-foreground">
                Start today for free. Upgrade as you progress to unlock advanced features.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ScrollFadeIn delay={100}>
              <Card className="p-8 bg-card border-border">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Starter</h3>
                <p className="text-sm text-muted-foreground">Perfect for exploring</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">3 workflow simulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic AI mentor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Get started</Button>
            </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={200}>
              <Card className="p-8 bg-card border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  POPULAR
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Professional</h3>
                <p className="text-sm text-muted-foreground">For serious learners</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited simulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced AI mentor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Skills certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <Button variant="hero" className="w-full">Get started</Button>
            </Card>
            </ScrollFadeIn>

            <ScrollFadeIn delay={300}>
              <Card className="p-8 bg-card border-border">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <p className="text-sm text-muted-foreground">For organizations</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Team management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contact sales</Button>
            </Card>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="container mx-auto relative">
          <ScrollFadeIn>
            <Card className="p-12 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to transform your learning?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are building real-world skills and 
                accelerating their careers with InternSpirit.
              </p>
              <Button variant="hero" size="lg" className="gap-2">
                Start for Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Card>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold">InternSpirit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing professional learning through AI-powered workflow simulation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Use Cases</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 InternSpirit. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
