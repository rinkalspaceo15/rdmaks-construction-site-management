import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  HardHat,
  ClipboardList,
  Users,
  Package,
  DollarSign,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Zap,
  Shield,
  ChevronDown,
  Building2,
  Wrench,
  Truck,
  IndianRupee,
  CalendarCheck,
  Sun,
  Lock,
  Eye,
  Server,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

/* ─── Utility components ─── */

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationStart={() => {
        if (!ref.current || !isInView) return;
        const end = target;
        const duration = 2000;
        const startTime = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const val = Math.round(end * progress);
          if (ref.current) ref.current.textContent = val.toLocaleString('en-IN');
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }}
    />
  );
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span ref={ref} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>
      {isInView && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <CountUp target={target} />
          {suffix}
        </motion.span>
      )}
    </motion.span>
  );
}

function FadeIn({ children, delay = 0, direction = 'up' }: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const map = { up: { y: 40, x: 0 }, down: { y: -40, x: 0 }, left: { x: 40, y: 0 }, right: { x: -40, y: 0 } };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...map[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionTag({ text }: { text: string }) {
  return <span className="text-amber-600 text-sm font-semibold tracking-wider uppercase mb-4 block">{text}</span>;
}

/* ─── Data ─── */

const FLOATING_ICONS = [
  { Icon: Building2, x: '10%', y: '20%', size: 32, delay: 0 },
  { Icon: Wrench, x: '85%', y: '15%', size: 28, delay: 0.5 },
  { Icon: Truck, x: '75%', y: '70%', size: 30, delay: 1 },
  { Icon: HardHat, x: '15%', y: '65%', size: 34, delay: 1.5 },
  { Icon: Package, x: '90%', y: '45%', size: 26, delay: 0.8 },
  { Icon: IndianRupee, x: '5%', y: '45%', size: 28, delay: 1.2 },
];

const FEATURES = [
  { icon: <ClipboardList size={28} />, title: 'Site Management', desc: 'Create sites, track status (active/hold/done), see everything organized per project.', gradient: 'from-amber-500 to-orange-600' },
  { icon: <Users size={28} />, title: 'Worker Attendance', desc: 'Mark present/absent/half-day for your whole crew in under a minute. Track overtime too.', gradient: 'from-blue-500 to-cyan-600' },
  { icon: <Package size={28} />, title: 'Material Tracking', desc: 'Log every delivery — cement, steel, bricks. Quantity, rate, vendor, date. Running total always visible.', gradient: 'from-emerald-500 to-teal-600' },
  { icon: <DollarSign size={28} />, title: 'Expense Tracking', desc: 'Categorize every rupee — material, labor, transport, misc. Filter by category. See totals instantly.', gradient: 'from-violet-500 to-purple-600' },
  { icon: <FileText size={28} />, title: 'Daily Reports', desc: 'End-of-day log: weather, work done, issues faced. Your digital site diary — searchable, never lost.', gradient: 'from-rose-500 to-pink-600' },
  { icon: <BarChart3 size={28} />, title: 'Dashboard Overview', desc: 'One screen: total sites, active workers, on-hold projects. The "how are my sites doing?" answer.', gradient: 'from-amber-500 to-yellow-500' },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Sites Managed' },
  { value: 10000, suffix: '+', label: 'Workers Tracked' },
  { value: 50, suffix: ' Lakhs+', label: 'Expenses Logged' },
  { value: 99, suffix: '%', label: 'Uptime' },
];

/* ─── Page ─── */

function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-amber-50 text-gray-900 overflow-hidden">

      {/* ────── Nav ────── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-amber-50/80 backdrop-blur-xl border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-1.5 rounded-lg">
              <HardHat size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SiteManager</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#who" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Who It's For</a>
            <a href="#features" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Features</a>
            <a href="#security" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Security</a>
            <Link to="/app" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40">
              Open App
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ────── Hero ────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-300/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {FLOATING_ICONS.map(({ Icon, x, y, size, delay }, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-400/40 hidden md:block"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
            transition={{
              opacity: { delay: delay + 0.5, duration: 0.5 },
              scale: { delay: delay + 0.5, duration: 0.5 },
              y: { delay: delay + 1, duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          >
            <Zap size={14} className="animate-pulse" />
            Built for Indian Contractors & Builders
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight"
          >
            Your whole site, logged in{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">5 minutes a day</span>
              <motion.span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.2 }} style={{ originX: 0 }} />
            </span>
            <br />
            <span className="text-gray-600 text-3xl sm:text-4xl md:text-5xl font-semibold">Ditch the WhatsApp chaos. Run your sites like a pro.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
            className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Attendance, materials, expenses, daily reports — from your phone, between tasks.
            Works on any phone. Built for real Indian construction workflows.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/app" className="group relative bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 flex items-center gap-2">
              Start Managing Sites
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#who" className="text-gray-700 hover:text-gray-900 px-6 py-4 rounded-xl font-medium border border-gray-300 hover:border-gray-400 transition-all hover:bg-amber-100/50">
              See Who It's For
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown size={24} className="text-gray-400" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ────── Trust Bar ────── */}
      <section className="relative z-10 border-y border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── Who It's For — Two Personas ────── */}
      <section id="who" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Who It's For" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Two Roles. One App.</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Whether you're the person on-site or the one reviewing across all sites — SiteManager fits how you already work.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Supervisor */}
            <FadeIn delay={0.1} direction="right">
              <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 hover:border-amber-300 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/40 rounded-full blur-3xl group-hover:bg-amber-200/60 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <HardHat size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Site Supervisor / Foreman</h3>
                      <p className="text-amber-600 text-sm">On-site daily</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    You're on the ground every morning. Workers show up, materials arrive, expenses happen.
                    You need to record everything <strong className="text-gray-800">fast</strong> — before the next truck pulls in.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: <CalendarCheck size={16} />, task: 'Mark attendance for 20+ workers in under 2 minutes' },
                      { icon: <Truck size={16} />, task: 'Log cement, steel, bricks as deliveries arrive' },
                      { icon: <IndianRupee size={16} />, task: 'Record ₹4,500 JCB rental before you forget' },
                      { icon: <FileText size={16} />, task: 'Write end-of-day report — weather, work done, issues' },
                    ].map((item) => (
                      <div key={item.task} className="flex items-start gap-3">
                        <div className="bg-amber-100 p-1.5 rounded-md text-amber-600 mt-0.5 shrink-0">{item.icon}</div>
                        <span className="text-gray-700 text-sm">{item.task}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Smartphone size={14} />
                      Works on any phone browser — no app install needed
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            {/* Contractor */}
            <FadeIn delay={0.2} direction="left">
              <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 hover:border-blue-300 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl group-hover:bg-blue-200/60 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Contractor / Builder</h3>
                      <p className="text-blue-600 text-sm">Managing 3–10 sites</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    You're running the business. Multiple sites, multiple supervisors, money flowing everywhere.
                    You need the <strong className="text-gray-800">big picture</strong> — without calling 5 people.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: <BarChart3 size={16} />, task: 'Dashboard: all sites, active workers, total expenses' },
                      { icon: <DollarSign size={16} />, task: 'Check per-site expense breakdown — material vs labor vs transport' },
                      { icon: <Users size={16} />, task: 'Review attendance across sites — who showed up where' },
                      { icon: <ClipboardList size={16} />, task: 'Read daily reports from each site without calling anyone' },
                    ].map((item) => (
                      <div key={item.task} className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 mt-0.5 shrink-0">{item.icon}</div>
                        <span className="text-gray-700 text-sm">{item.task}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Eye size={14} />
                      Full visibility without being physically on-site
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ────── Before vs After ────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-100/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Before vs After" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Current Workflow is Broken</h2>
              <p className="text-gray-600 text-lg">Here's what changes when you switch.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Before */}
            <FadeIn delay={0.1} direction="right">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-2 rounded-lg"><XCircle size={20} className="text-red-600" /></div>
                  <h3 className="text-lg font-bold text-red-600">Before — WhatsApp + Excel</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <AlertTriangle size={16} />, text: 'Attendance on paper — lost next day' },
                    { icon: <AlertTriangle size={16} />, text: 'Material bills in pockets — no central record' },
                    { icon: <AlertTriangle size={16} />, text: '"Kitna kharcha hua?" — nobody knows the real number' },
                    { icon: <AlertTriangle size={16} />, text: 'Daily updates buried under memes in WhatsApp group' },
                    { icon: <AlertTriangle size={16} />, text: 'End of month: fight to reconstruct what happened' },
                    { icon: <Clock size={16} />, text: '30+ min/day wasted chasing info across apps' },
                  ].map((item) => (
                    <motion.div key={item.text} whileHover={{ x: 3 }} className="flex items-start gap-3 text-sm text-gray-600 cursor-default">
                      <span className="text-red-500 mt-0.5 shrink-0">{item.icon}</span>
                      {item.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* After */}
            <FadeIn delay={0.2} direction="left">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-2 rounded-lg"><CheckCircle size={20} className="text-emerald-600" /></div>
                  <h3 className="text-lg font-bold text-emerald-600">After — SiteManager</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <CheckCircle size={16} />, text: 'One-tap attendance — present/absent/half-day saved instantly' },
                    { icon: <CheckCircle size={16} />, text: 'Every material entry: name, qty, rate, vendor, date — all tracked' },
                    { icon: <CheckCircle size={16} />, text: 'Real-time expense totals by category — ₹ formatted, always current' },
                    { icon: <CheckCircle size={16} />, text: 'Daily reports with date, weather, summary — searchable forever' },
                    { icon: <CheckCircle size={16} />, text: 'Month-end? Open dashboard. Everything is already there.' },
                    { icon: <Zap size={16} />, text: '5 min/day — log everything from your phone between tasks' },
                  ].map((item) => (
                    <motion.div key={item.text} whileHover={{ x: 3 }} className="flex items-start gap-3 text-sm text-gray-700 cursor-default">
                      <span className="text-emerald-500 mt-0.5 shrink-0">{item.icon}</span>
                      {item.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ────── Features ────── */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Features" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Six Tools. One App. Zero Guesswork.</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Each feature maps to a real task you already do on-site — just faster, organized, and permanent.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative group bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-amber-300 transition-colors overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className={`bg-gradient-to-br ${f.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── How It Works ────── */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="How It Works" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Setup in 10 Minutes. Use Daily.</h2>
              <p className="text-gray-600 text-lg">No training manual. No onboarding call. Just open and start.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Add Your Sites', desc: 'Name, address, start date. One form per project. Takes 30 seconds.', icon: <Building2 size={24} /> },
              { step: '02', title: 'Add Workers', desc: 'Name, role, phone, daily wage. Add once — assign to any site later.', icon: <Users size={24} /> },
              { step: '03', title: 'Daily Operations', desc: 'Attendance, materials, expenses — log from your phone between site visits.', icon: <CalendarCheck size={24} /> },
              { step: '04', title: 'Review & Report', desc: 'Write daily report. Check dashboard. Know exactly where every site stands.', icon: <FileText size={24} /> },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.15}>
                <div className="relative">
                  {i < 3 && <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-amber-300 to-transparent z-0" />}
                  <motion.div whileHover={{ y: -4 }} className="relative z-10 bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-amber-300 transition-colors h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-amber-300 text-3xl font-black">{s.step}</span>
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600">{s.icon}</div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                  </motion.div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── Security & Trust ────── */}
      <section id="security" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-100/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Security & Trust" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Site Data. Protected.</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Unlike WhatsApp where anyone in the group sees everything — SiteManager keeps your business data organized, private, and safe.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Lock size={24} />,
                title: 'Secure Database',
                desc: 'All data stored in PostgreSQL — not in chat messages that anyone can screenshot or forward.',
                gradient: 'from-emerald-500 to-green-600',
              },
              {
                icon: <Server size={24} />,
                title: 'Your Data, Your Server',
                desc: 'Self-hosted — no third-party cloud storing your financial data. You control where it lives.',
                gradient: 'from-blue-500 to-cyan-600',
              },
              {
                icon: <Shield size={24} />,
                title: 'No Data Sharing',
                desc: 'We do not sell, share, or analyze your data. No ads. No tracking. Just your tool.',
                gradient: 'from-violet-500 to-purple-600',
              },
              {
                icon: <Eye size={24} />,
                title: 'Controlled Access',
                desc: 'Only people with the app URL can see your data. Auth layer coming in next release for role-based access.',
                gradient: 'from-amber-500 to-orange-600',
              },
              {
                icon: <CheckCircle size={24} />,
                title: 'Input Validation',
                desc: 'Every form field validated before it hits the database. No garbage data, no SQL injection.',
                gradient: 'from-rose-500 to-pink-600',
              },
              {
                icon: <Clock size={24} />,
                title: 'Reliable Storage',
                desc: 'Data persists in PostgreSQL with UUID keys and foreign key integrity. No accidental data loss.',
                gradient: 'from-sky-500 to-blue-600',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-emerald-300 transition-colors group"
                >
                  <div className={`bg-gradient-to-br ${item.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── App Preview Mock ────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag text="App Preview" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">See It In Action</h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <motion.div whileHover={{ scale: 1.01 }} className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/50 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-md px-3 py-1 text-gray-500 text-xs text-center flex items-center justify-center gap-1.5">
                    <Lock size={10} /> sitemanager.app/app
                  </div>
                </div>
              </div>

              <div className="p-6 flex gap-4">
                <div className="hidden sm:flex flex-col w-16 bg-gray-100 rounded-xl p-2 gap-3 items-center">
                  <div className="bg-amber-100 p-2 rounded-lg"><HardHat size={16} className="text-amber-600" /></div>
                  <div className="bg-gray-200/60 p-2 rounded-lg"><BarChart3 size={16} className="text-gray-400" /></div>
                  <div className="bg-gray-200/60 p-2 rounded-lg"><Building2 size={16} className="text-gray-400" /></div>
                  <div className="bg-gray-200/60 p-2 rounded-lg"><Users size={16} className="text-gray-400" /></div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-gray-200 rounded-lg h-6 w-32" />
                    <div className="bg-amber-200 rounded-lg h-6 w-20" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total Sites', val: '12' },
                      { label: 'Active', val: '8' },
                      { label: 'Workers', val: '47' },
                      { label: 'On Hold', val: '2' },
                    ].map((s) => (
                      <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                      >
                        <div className="text-xl font-bold text-gray-900">{s.val}</div>
                        <div className="text-gray-500 text-xs">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Sunrise Apartments, Andheri', status: 'Active', cls: 'bg-green-100 text-green-700' },
                      { name: 'Green Valley Phase 2, Thane', status: 'Active', cls: 'bg-green-100 text-green-700' },
                      { name: 'Highway Overpass, NH-48', status: 'On Hold', cls: 'bg-yellow-100 text-yellow-700' },
                    ].map((row) => (
                      <div key={row.name} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                        <span className="text-sm text-gray-700">{row.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.cls}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* ────── A Day on Site — Timeline ────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag text="A Day on Site" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">5 Minutes a Day. Everything Logged.</h2>
              <p className="text-gray-600 text-lg">A real supervisor's workflow — from morning roll call to evening report.</p>
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { time: '7:00 AM', action: 'Open app, tap your site', icon: <Building2 size={18} />, detail: 'Sunrise Apartments selected' },
              { time: '7:05 AM', action: 'Mark attendance', icon: <CheckCircle size={18} />, detail: '"Mark All Present" → flip 2 absences. Done.' },
              { time: '10:30 AM', action: 'Material delivery arrives', icon: <Truck size={18} />, detail: '50 bags cement, ₹350/bag, from Ambuja Traders' },
              { time: '1:00 PM', action: 'Log transport expense', icon: <IndianRupee size={18} />, detail: '₹4,500 — JCB rental for foundation work' },
              { time: '6:00 PM', action: 'Write daily report', icon: <FileText size={18} />, detail: 'Cloudy. Completed 2nd floor slab. Rebar delayed.' },
              { time: '6:05 PM', action: 'Done. Site data secure.', icon: <Sun size={18} />, detail: 'Everything logged — accessible from any device' },
            ].map((item, i) => (
              <FadeIn key={item.time} delay={i * 0.08}>
                <motion.div whileHover={{ x: 6 }}
                  className="flex items-center gap-4 bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:border-amber-300 transition-colors group cursor-default"
                >
                  <span className="text-amber-600 text-xs font-mono w-16 shrink-0">{item.time}</span>
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600 group-hover:bg-amber-200 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-900 font-medium text-sm">{item.action}</div>
                    <div className="text-gray-500 text-xs">{item.detail}</div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── Built for India ────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Made for India" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for the Indian Construction Market</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Not a foreign tool with a Rupee symbol slapped on. Designed from the ground up for how Indian sites actually run.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <IndianRupee size={24} />, title: '₹ Indian Formatting', desc: '₹1,50,000 — not ₹150,000. Proper lakhs/crore formatting your accountant expects.', gradient: 'from-emerald-500 to-green-600' },
              { icon: <Smartphone size={24} />, title: 'Phone-First UI', desc: 'Large tap targets, simple forms, works on ₹8,000 phones with slow data. No laptop needed.', gradient: 'from-sky-500 to-blue-600' },
              { icon: <Wrench size={24} />, title: 'Real Roles', desc: 'Mason, electrician, laborer, plumber, painter — roles that match your actual crew.', gradient: 'from-amber-500 to-orange-600' },
              { icon: <Zap size={24} />, title: 'Zero Learning Curve', desc: 'Plain English labels. No jargon. If your supervisor uses WhatsApp, they can use this.', gradient: 'from-violet-500 to-purple-600' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} className="text-center p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-amber-300 transition-colors">
                  <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── CTA ────── */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-white to-amber-50 border border-amber-200 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-amber-200/40">
              <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-3 rounded-2xl w-fit mx-auto mb-6">
                <HardHat size={32} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Build Smarter?</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
                Your sites deserve better than WhatsApp groups and Excel sheets.
                Start tracking — it takes 5 minutes to set up.
              </p>
              <Link to="/app" className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105">
                Open SiteManager Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center justify-center gap-4 mt-6 text-gray-500 text-xs">
                <span className="flex items-center gap-1"><CheckCircle size={12} /> No sign up</span>
                <span className="flex items-center gap-1"><Shield size={12} /> Data stays on your server</span>
                <span className="flex items-center gap-1"><Zap size={12} /> 5 min setup</span>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* ────── Footer ────── */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-1 rounded-md">
              <HardHat size={16} className="text-white" />
            </div>
            <span className="font-semibold">SiteManager</span>
          </div>
          <div className="flex items-center gap-6 text-gray-600 text-sm">
            <a href="#who" className="hover:text-gray-900 transition-colors">Who It's For</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#security" className="hover:text-gray-900 transition-colors">Security</a>
            <Link to="/app" className="hover:text-gray-900 transition-colors">Open App</Link>
          </div>
          <p className="text-gray-500 text-sm">Built for Indian builders & contractors.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
