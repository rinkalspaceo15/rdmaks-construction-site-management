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

/* ─── Icon palette — restrained two-tone system (amber primary, slate secondary) ─── */
const ICON_AMBER = 'from-amber-500 to-amber-600';
const ICON_SLATE = 'from-slate-700 to-slate-900';

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
  { icon: <ClipboardList size={28} />, title: 'Site Management', desc: 'Create sites, track status (active/hold/done), see everything organized per project.', gradient: ICON_AMBER },
  { icon: <Users size={28} />, title: 'Worker Attendance', desc: 'Mark present/absent/half-day for your whole crew in under a minute. Track overtime too.', gradient: ICON_SLATE },
  { icon: <Package size={28} />, title: 'Material Tracking', desc: 'Log every delivery — cement, steel, bricks. Quantity, rate, vendor, date. Running total always visible.', gradient: ICON_AMBER },
  { icon: <DollarSign size={28} />, title: 'Expense Tracking', desc: 'Categorize every rupee — material, labor, transport, misc. Filter by category. See totals instantly.', gradient: ICON_SLATE },
  { icon: <FileText size={28} />, title: 'Daily Reports', desc: 'End-of-day log: weather, work done, issues faced. Your digital site diary — searchable, never lost.', gradient: ICON_AMBER },
  { icon: <BarChart3 size={28} />, title: 'Dashboard Overview', desc: 'One screen: total sites, active workers, on-hold projects. The "how are my sites doing?" answer.', gradient: ICON_SLATE },
  { icon: <IndianRupee size={28} />, title: 'Payroll', desc: 'Wages calculated automatically from attendance — present, half-day and overtime, totalled per worker in ₹. No more Excel wage sheets.', gradient: ICON_AMBER },
];

const STATS = [
  { value: 7, suffix: '', label: 'Tools in one app' },
  { value: 5, suffix: ' min', label: 'A day to stay on top' },
  { value: 100, suffix: '%', label: 'Your data, your server' },
  { value: 0, suffix: '', label: '₹ to start — free' },
];

// Honest competitor comparison — sourced from public info (2026). true=yes, false=no, string=nuance.
const COMPARE_COLS = ['SiteManager', 'WhatsApp + Excel', 'Powerplay', 'Onsite'];
const COMPARE_ROWS: { label: string; vals: (boolean | string)[] }[] = [
  { label: 'Cost to start', vals: ['₹0', '₹0', '₹71,999/yr', '₹36,000/yr'] },
  { label: 'No sign-up / no seat minimum', vals: [true, true, false, false] },
  { label: 'Attendance → wage payroll', vals: [true, false, true, true] },
  { label: 'Works in any phone browser', vals: [true, true, true, true] },
  { label: '₹ Indian number format', vals: [true, 'manual', true, true] },
  { label: 'Central, searchable records', vals: [true, false, true, true] },
];

function CompareCell({ value, highlight }: { value: boolean | string; highlight: boolean }) {
  const base = `px-4 py-3 text-center ${highlight ? 'bg-amber-50/70 font-semibold text-gray-900' : 'text-gray-500'}`;
  let content: React.ReactNode;
  if (value === true) content = <CheckCircle size={18} className="inline text-emerald-500" />;
  else if (value === false) content = <XCircle size={18} className="inline text-gray-300" />;
  else content = value;
  return <td className={base}>{content}</td>;
}

/* ─── Page ─── */

function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">

      {/* ────── Nav ────── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-50/80 backdrop-blur-xl border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-1.5 rounded-lg">
              <HardHat size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SiteManager</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#who" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Who It's For</a>
            <a href="#features" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Features</a>
            <a href="#compare" className="hidden md:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Compare</a>
            <a href="#pricing" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">Pricing</a>
            <a href="#faq" className="hidden md:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">FAQ</a>
            <Link to="/app" className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm">
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
              <span className="relative z-10 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">5 minutes a day</span>
              <motion.span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.2 }} style={{ originX: 0 }} />
            </span>
            <br />
            <span className="text-gray-600 text-3xl sm:text-4xl md:text-5xl font-semibold">Ditch the WhatsApp chaos. Run your sites like a pro.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
            className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Attendance, materials, expenses, payroll and daily reports — from your phone.
            Wages auto-calculated, money in ₹ Indian format, and your data stays on your own server.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/app" className="group relative bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:scale-105 flex items-center gap-2">
              Start Managing Sites
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#who" className="text-gray-700 hover:text-gray-900 px-6 py-4 rounded-xl font-medium border border-gray-300 hover:border-gray-400 transition-all hover:bg-gray-100">
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

      {/* ────── Trust Bar (white) ────── */}
      <section className="relative z-10 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── Who It's For — Two Personas (gray-50) ────── */}
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
                    <div className={`bg-gradient-to-br ${ICON_AMBER} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
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
              <motion.div whileHover={{ y: -4 }} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 hover:border-slate-300 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-200/40 rounded-full blur-3xl group-hover:bg-slate-300/50 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`bg-gradient-to-br ${ICON_SLATE} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Contractor / Builder</h3>
                      <p className="text-slate-600 text-sm">Managing 3–10 sites</p>
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
                        <div className="bg-slate-100 p-1.5 rounded-md text-slate-700 mt-0.5 shrink-0">{item.icon}</div>
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

      {/* ────── Before vs After (white) ────── */}
      <section className="py-20 sm:py-28 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* ────── Features (gray-50) ────── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Features" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Seven Tools. One App. Zero Guesswork.</h2>
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
                  <div className="relative z-10">
                    <div className={`bg-gradient-to-br ${f.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md`}>
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

      {/* ────── How It Works (white) ────── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white border-y border-gray-200">
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
                  <motion.div whileHover={{ y: -4 }} className="relative z-10 bg-gray-50 border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-amber-300 transition-colors h-full">
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

      {/* ────── Security & Trust (gray-50) ────── */}
      <section id="security" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Security & Trust" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Site Data. Protected.</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Your site's money, attendance and reports stay organized, private, and under your control — not scattered across chat messages and spreadsheets.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <Lock size={24} />, title: 'Secure Database', desc: 'All data stored in PostgreSQL — not in chat messages that anyone can screenshot or forward.' },
              { icon: <Server size={24} />, title: 'Your Data, Your Server', desc: 'Self-hosted — no third-party cloud storing your financial data. You control where it lives.' },
              { icon: <Shield size={24} />, title: 'No Data Sharing', desc: 'We do not sell, share, or analyze your data. No ads. No tracking. Just your tool.' },
              { icon: <Eye size={24} />, title: 'Controlled Access', desc: 'Only people with the app URL can see your data. Auth layer coming in next release for role-based access.' },
              { icon: <CheckCircle size={24} />, title: 'Input Validation', desc: 'Every form field validated before it hits the database. No garbage data, no SQL injection.' },
              { icon: <Clock size={24} />, title: 'Reliable Storage', desc: 'Data persists in PostgreSQL with UUID keys and foreign key integrity. No accidental data loss.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-slate-300 transition-colors group"
                >
                  <div className={`bg-gradient-to-br ${ICON_SLATE} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-md`}>
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

      {/* ────── App Preview (white) ────── */}
      <section className="py-20 sm:py-28 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag text="App Preview" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">See It In Action</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Desktop dashboard for the contractor, phone-first screens for the supervisor on-site.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative max-w-4xl mx-auto">
              {/* Browser frame */}
              <motion.div whileHover={{ scale: 1.01 }} className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/60">
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
                    <div className="bg-gray-200/70 p-2 rounded-lg"><BarChart3 size={16} className="text-gray-400" /></div>
                    <div className="bg-gray-200/70 p-2 rounded-lg"><Building2 size={16} className="text-gray-400" /></div>
                    <div className="bg-gray-200/70 p-2 rounded-lg"><Users size={16} className="text-gray-400" /></div>
                    <div className="bg-gray-200/70 p-2 rounded-lg"><IndianRupee size={16} className="text-gray-400" /></div>
                  </div>

                  <div className="flex-1 space-y-4 lg:pr-32">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">Dashboard</div>
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5">Add Site</div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Total Sites', val: '12' },
                        { label: 'Active', val: '8' },
                        { label: 'Workers', val: '47' },
                        { label: 'This month ₹', val: '8.4L' },
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

              {/* Phone frame (overlaps on lg) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="hidden lg:block absolute -bottom-10 -right-2 w-52 z-20"
              >
                <div className="bg-gray-900 rounded-[2.2rem] p-2 shadow-2xl shadow-gray-400/60">
                  <div className="bg-white rounded-[1.8rem] overflow-hidden">
                    <div className="bg-gray-900 text-white text-[11px] font-medium text-center py-2">Attendance · Today</div>
                    <div className="p-3 space-y-2">
                      {[
                        { name: 'Ramesh (mason)', state: 'present', cls: 'bg-green-100 text-green-700' },
                        { name: 'Suresh (laborer)', state: 'present', cls: 'bg-green-100 text-green-700' },
                        { name: 'Imran (electrician)', state: '½ day', cls: 'bg-amber-100 text-amber-700' },
                        { name: 'Vijay (plumber)', state: 'absent', cls: 'bg-red-100 text-red-700' },
                      ].map((w) => (
                        <div key={w.name} className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-700 truncate pr-2">{w.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${w.cls}`}>{w.state}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 pb-3">
                      <div className="bg-gray-900 text-white text-[11px] text-center rounded-lg py-2">Save attendance</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────── A Day on Site — Timeline (gray-50) ────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* ────── Built for India (white) ────── */}
      <section className="py-20 sm:py-28 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              { icon: <IndianRupee size={24} />, title: '₹ Indian Formatting', desc: '₹1,50,000 — not ₹150,000. Proper lakhs/crore formatting your accountant expects.', gradient: ICON_AMBER },
              { icon: <Smartphone size={24} />, title: 'Phone-First UI', desc: 'Large tap targets, simple forms, works on ₹8,000 phones with slow data. No laptop needed.', gradient: ICON_SLATE },
              { icon: <Wrench size={24} />, title: 'Real Roles', desc: 'Mason, electrician, laborer, plumber, painter — roles that match your actual crew.', gradient: ICON_AMBER },
              { icon: <Zap size={24} />, title: 'Zero Learning Curve', desc: 'Plain English labels. No jargon. If your supervisor uses WhatsApp, they can use this.', gradient: ICON_SLATE },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm hover:border-amber-300 transition-colors">
                  <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md`}>
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

      {/* ────── Comparison (gray-50) ────── */}
      <section id="compare" className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag text="How We Compare" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Honest, Side by Side</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We won't pretend to out-feature the big tools — but for a small crew, free and simple wins.
              </p>
            </div>
          </FadeIn>

          <p className="sm:hidden text-center text-gray-400 text-xs mb-2">Swipe the table sideways to compare →</p>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm text-left min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4" />
                    {COMPARE_COLS.map((col, i) => (
                      <th
                        key={col}
                        className={`px-4 py-4 text-center ${i === 0 ? 'bg-amber-50 font-bold text-gray-900 border-x border-amber-200' : 'font-medium text-gray-500'}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{row.label}</td>
                      {row.vals.map((v, i) => (
                        <CompareCell key={i} value={v} highlight={i === 0} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
          <p className="text-center text-gray-500 text-xs mt-6 max-w-2xl mx-auto">
            Competitor details from public sources (2026); prices are list prices and may change. We show where they match us too — no cherry-picking.
          </p>
        </div>
      </section>

      {/* ────── Pricing (white) ────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <SectionTag text="Pricing" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Free While We Build It</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                SiteManager is free during early access — no sign-up, no card. The established tools charge by the year; you start at zero.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* SiteManager — highlighted */}
            <FadeIn delay={0.1}>
              <div className="relative bg-gray-50 border-2 border-amber-400 rounded-2xl p-8 shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">You are here</span>
                <h3 className="text-lg font-bold mb-1">SiteManager</h3>
                <div className="text-4xl font-extrabold mb-1">₹0</div>
                <p className="text-gray-500 text-sm mb-5">Free · early access</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {['All 7 tools included', 'No sign-up, no card', 'Works on any phone', 'Your data, your server'].map((t) => (
                    <li key={t} className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
                <Link to="/app" className="mt-6 block text-center bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  Start free
                </Link>
              </div>
            </FadeIn>

            {/* Powerplay */}
            <FadeIn delay={0.2}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-gray-500">Powerplay</h3>
                <div className="text-4xl font-extrabold mb-1 text-gray-400">₹71,999<span className="text-base font-medium">/yr</span></div>
                <p className="text-gray-400 text-sm mb-5">India's #1 — priced for bigger firms</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  {['Steep annual commitment', 'English only'].map((t) => (
                    <li key={t} className="flex gap-2"><XCircle size={16} className="shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Onsite */}
            <FadeIn delay={0.3}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-1 text-gray-500">Onsite</h3>
                <div className="text-4xl font-extrabold mb-1 text-gray-400">₹36,000<span className="text-base font-medium">/yr</span></div>
                <p className="text-gray-400 text-sm mb-5">3-user minimum to start</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  {['Per-user pricing adds up', 'Minimum seats required'].map((t) => (
                    <li key={t} className="flex gap-2"><XCircle size={16} className="shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>

          <p className="text-center text-gray-500 text-xs mt-8 max-w-2xl mx-auto">
            Competitor prices are public list prices (as of 2026) and may change. Paid plans may arrive later as we add advanced features like GST billing — early users keep early-access perks.
          </p>
        </div>
      </section>

      {/* ────── FAQ (gray-50) ────── */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag text="FAQ" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Questions, Answered</h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {[
              { q: 'Is it really free?', a: 'Yes — free during early access. No sign-up, no credit card. We may add paid plans later as we build advanced features, but early users keep early-access perks.' },
              { q: 'Do I need to install an app?', a: 'No. SiteManager runs in any phone browser — nothing to download. Open the link and start.' },
              { q: 'Does it work offline?', a: 'Not yet — today it needs a connection, but it is lightweight and works on slow 3G/4G. Full offline mode is on our roadmap.' },
              { q: 'Who can see my data?', a: 'Your data lives in your own PostgreSQL database — we never sell or share it. Role-based login is coming; for now anyone with your app link can access it, so share it carefully.' },
              { q: 'Can it calculate worker wages?', a: 'Yes. Payroll adds up wages automatically from attendance — present, half-day and overtime — per worker, in ₹.' },
              { q: 'What languages does it support?', a: 'English today, with Hindi and regional languages coming so on-site supervisors can use it in their own language.' },
            ].map((item, i) => (
              <FadeIn key={item.q} delay={i * 0.05}>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-1.5">{item.q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────── CTA (white) ────── */}
      <section className="py-24 sm:py-32 relative bg-white border-t border-gray-200">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/25 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeIn>
            <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-gray-50 to-amber-50 border border-amber-200 rounded-3xl p-10 sm:p-14 shadow-xl shadow-amber-100/60">
              <div className={`bg-gradient-to-br ${ICON_AMBER} p-3 rounded-2xl w-fit mx-auto mb-6`}>
                <HardHat size={32} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Build Smarter?</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
                Your sites deserve better than WhatsApp groups and Excel sheets.
                Start tracking — it takes 5 minutes to set up.
              </p>
              <Link to="/app" className="group inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:scale-105">
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
      <footer className="border-t border-gray-200 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`bg-gradient-to-br ${ICON_AMBER} p-1 rounded-md`}>
              <HardHat size={16} className="text-white" />
            </div>
            <span className="font-semibold">SiteManager</span>
          </div>
          <div className="flex items-center gap-6 text-gray-600 text-sm">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#compare" className="hover:text-gray-900 transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
            <Link to="/app" className="hover:text-gray-900 transition-colors">Open App</Link>
          </div>
          <p className="text-gray-500 text-sm">Built for Indian builders & contractors.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
