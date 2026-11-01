import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ArrowRight, Search, Shield, Phone, Mail, MapPin, 
  Check, Star, Award, Users, ClipboardList, Scale, Microscope, 
  Send, Sparkles, ChevronRight, Clock, Calendar, Eye, Stethoscope, 
  Cpu, Heart, CheckCircle2, Wrench, Radio, Layers, BatteryCharging
} from 'lucide-react';
import api from '../services/api';
import ComponentImage from '../components/ComponentImage';
import toast from 'react-hot-toast';

// Curated high-res electronics, laboratory, and engineering imagery
const LAB_IMAGES = {
  heroHardware: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
  heroScope: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
  heroCircuit: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  aboutBench: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  case1: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=700&q=80',
  case2: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=700&q=80',
  case3: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=700&q=80',
  stepsCenter: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
  microscope: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  labClean: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
  blog1: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
  blog2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  blog3: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
  avatarStudent: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  avatarLecturer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
};

// Fallback image helper
const fallbackImg = (e, fallback = '/components/electronics.jpg') => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};

// Animated Counter component
function Counter({ end, suffix = '', label }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const target = Number(end) || 0;
    if (!target) {
      setVal(0);
      return;
    }
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
        {val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Hexagonal Icon Wrapper
function HexBadge({ icon: Icon, size = 'w-16 h-16', iconSize = 'w-7 h-7' }) {
  return (
    <div className={`relative ${size} flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_12px_rgba(0,194,111,0.3)]">
        <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#00C26F]" />
      </svg>
      <Icon className={`${iconSize} text-white relative z-10`} />
    </div>
  );
}

// Dark Navy Hexagon Badge for Stats
function NavyHexBadge({ icon: Icon }) {
  return (
    <div className="relative w-14 h-16 flex items-center justify-center shrink-0 mx-auto mb-3">
      <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-md">
        <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#0B1B2B]" />
      </svg>
      <Icon className="w-6 h-6 text-white relative z-10" />
    </div>
  );
}

export default function Landing() {
  const [stats, setStats] = useState({ totalComponents: 79, totalUsers: 27, totalBorrowed: 48 });
  const [featured, setFeatured] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => {
        if (r.data?.data) {
          setStats({
            totalComponents: r.data.data.totalComponents || 79,
            totalUsers: r.data.data.totalUsers || 27,
            totalBorrowed: r.data.data.totalBorrowed || 48
          });
        }
      })
      .catch(() => {});

    api.get('/components?limit=6&sort=views&order=desc')
      .then(r => setFeatured(r.data?.data?.components || []))
      .catch(() => {});
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.message) {
      toast.error('Please enter your email and message');
      return;
    }
    toast.success('Thank you! Your inquiry has been sent to our campus lab desk.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error('Please enter a valid university email');
      return;
    }
    toast.success('Subscribed successfully to component updates!');
    setNewsletterEmail('');
  };

  return (
    <div className="bg-white dark:bg-navy-950 text-gray-900 dark:text-gray-100 overflow-x-hidden selection:bg-[#00C26F] selection:text-white">
      
      {/* =========================================================================
          1. HERO SECTION (Dark Navy with Slanted Green Backdrop & Hex Mosaic)
         ========================================================================= */}
      <section id="hero" className="relative bg-[#0B1B2B] text-white pt-12 pb-28 lg:pt-20 lg:pb-36 overflow-hidden">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#00C26F]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Slanted Green Geometric Accent Shape on Right Edge */}
        <div 
          className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-[#00C26F] pointer-events-none z-0 opacity-95"
          style={{ clipPath: 'polygon(38% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 max-w-2xl">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00C26F] text-xs font-semibold mb-6 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00C26F] animate-ping" />
                Campus P2P Component Exchange & Lab Inventory
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                High quality lab & <br />
                component exchange
              </h1>

              {/* Bullet Points with Green Circles */}
              <ul className="mt-8 space-y-3.5 text-gray-200 text-sm sm:text-base font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C26F] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#07131F] stroke-[3]" />
                  </div>
                  <span>Verified microcontrollers, sensors and lab testing gear</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C26F] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#07131F] stroke-[3]" />
                  </div>
                  <span>Peer-to-peer lending, rental, trading and free campus giveaways</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00C26F] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#07131F] stroke-[3]" />
                  </div>
                  <span>Built for engineering students across university labs</span>
                </li>
              </ul>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link 
                  to="/register" 
                  className="btn-lab-green text-base px-8 py-3.5 font-bold shadow-lg shadow-[#00C26F]/25 flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  to="/browse" 
                  className="px-6 py-3.5 rounded-lg text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
                >
                  Browse Catalog
                </Link>
              </div>

              {/* Hero Slide Pagination Dots */}
              <div className="mt-12 flex items-center gap-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      heroSlide === idx ? 'w-8 bg-[#00C26F]' : 'w-2.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

            </div>

            {/* Right Hexagonal Visual Collage */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full max-w-[440px] h-[440px] sm:h-[480px]">
                
                {/* Main Large Hexagon: Electronics Engineer / Student with Lab Equipment */}
                <div className="absolute top-0 right-4 sm:right-8 w-64 h-72 sm:w-80 sm:h-88 z-20 group">
                  <div 
                    className="w-full h-full clip-hex overflow-hidden relative shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.4))' }}
                  >
                    <img 
                      src={LAB_IMAGES.heroHardware} 
                      alt="Student Engineer Testing Hardware" 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => fallbackImg(e, '/components/electronics.jpg')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B]/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                  {/* Hexagon Border SVG */}
                  <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full pointer-events-none">
                    <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" fill="none" stroke="#00C26F" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Overlapping Hexagon 2 (Bottom Left): Lab Oscilloscope & Bench Supply */}
                <div className="absolute bottom-2 left-0 sm:left-4 w-44 h-52 sm:w-52 sm:h-60 z-30 group">
                  <div 
                    className="w-full h-full clip-hex overflow-hidden relative shadow-xl transition-transform duration-500 group-hover:scale-105"
                  >
                    <img 
                      src={LAB_IMAGES.heroScope} 
                      alt="Oscilloscope & Test Bench" 
                      className="w-full h-full object-cover"
                      onError={(e) => fallbackImg(e, '/components/bench-psu.jpg')}
                    />
                    <div className="absolute inset-0 bg-[#0B1B2B]/20" />
                  </div>
                  <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full pointer-events-none">
                    <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" fill="none" stroke="#00C26F" strokeWidth="3" />
                  </svg>
                </div>

                {/* Overlapping Hexagon 3 (Bottom Right): FPGA & Dev Board */}
                <div className="absolute bottom-6 right-0 w-32 h-36 sm:w-40 sm:h-44 z-30 hidden sm:block group">
                  <div className="w-full h-full clip-hex overflow-hidden relative shadow-lg">
                    <img 
                      src={LAB_IMAGES.heroCircuit} 
                      alt="Microcontroller & Dev Board" 
                      className="w-full h-full object-cover"
                      onError={(e) => fallbackImg(e, '/components/rpi4.jpg')}
                    />
                  </div>
                  <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full pointer-events-none">
                    <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                  </svg>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FLOATING 4 HARDWARE CATEGORIES & CAMPUS LAB BODIES
         ========================================================================= */}
      <section id="categories" className="relative -mt-16 sm:-mt-20 z-30 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* 4 Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Cpu,
              title: 'Microcontrollers & Dev Boards',
              desc: 'Arduino, ESP32, STM32 Blue Pill, Raspberry Pi 4, and Teensy boards ready for embedded builds.',
            },
            {
              icon: Radio,
              title: 'Sensors & Measurement',
              desc: 'IMU accelerometers, ultrasonic, temperature, barometers, and biomedical sensor modules.',
            },
            {
              icon: Wrench,
              title: 'Lab Tools & Equipment',
              desc: 'Digital oscilloscopes, bench power supplies, multimeters, and soldering rework stations.',
            },
            {
              icon: Zap,
              title: 'ICs & Power Electronics',
              desc: 'Voltage regulators, 555 timers, motor drivers, Li-ion chargers, and buck-boost converters.',
            },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-[#0E243A] rounded-xl p-8 shadow-xl shadow-black/5 border border-gray-100 dark:border-white/5 hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center group"
            >
              <HexBadge icon={item.icon} />
              <h3 className="mt-6 font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-[#00C26F] transition-colors">
                {item.title}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C26F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Campus Engineering Societies & Lab Partners */}
        <div className="mt-14 pb-12 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-6 sm:gap-8 opacity-60 hover:opacity-100 transition-opacity">
          {[
            'IEEE STUDENT BRANCH', 
            'ELECTRONICS LAB 1 & 2', 
            'ROBOTICS CLUB', 
            'CAMPUS MAKERSPACE', 
            'DEPARTMENT FABLAB'
          ].map((partner, i) => (
            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-widest text-gray-500 dark:text-gray-300 uppercase">
              <span className="text-[#00C26F]">⚡</span> {partner}
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          3. ABOUT SECTION: "If the mind is inquiring, the campus is your laboratory"
         ========================================================================= */}
      <section id="about" className="py-24 bg-[#0B1B2B] text-white relative overflow-hidden">
        
        {/* Subtle Molecular / Circuit Background Graphics */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 23v46L40 92 0 69V23z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Photo Composition with "80+ Components" Badge */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[380px] h-[400px]">
                
                {/* Center Hexagon Image */}
                <div className="w-full h-full clip-hex overflow-hidden shadow-2xl relative">
                  <img 
                    src={LAB_IMAGES.aboutBench} 
                    alt="University Electronics Lab Workbench" 
                    className="w-full h-full object-cover"
                    onError={(e) => fallbackImg(e, '/components/multimeter.jpg')}
                  />
                  <div className="absolute inset-0 bg-[#0B1B2B]/20" />
                </div>
                
                <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full pointer-events-none">
                  <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" fill="none" stroke="#00C26F" strokeWidth="2.5" />
                </svg>

                {/* Green Hexagonal Badge: 80+ Components */}
                <div className="absolute -left-4 sm:-left-6 top-1/4 w-32 h-36 z-20 flex flex-col items-center justify-center text-center p-2">
                  <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_16px_rgba(0,194,111,0.5)]">
                    <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#00C26F]" />
                  </svg>
                  <div className="relative z-10 text-white">
                    <span className="text-3xl font-black leading-none block">80+</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider block mt-1 leading-tight">
                      Components <br /> In Inventory
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Information Column */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-[#00C26F] text-xs font-bold tracking-widest uppercase mb-3">
                <span className="w-6 h-0.5 bg-[#00C26F]" /> ABOUT COMPONENTHUB
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                If the mind is inquiring, the campus is your laboratory
              </h2>

              <p className="mt-5 text-gray-300 text-sm sm:text-base leading-relaxed">
                Stop buying expensive electronic components and lab gear you will only use for one semester. ComponentHub connects engineering students to share, lend, rent, and trade microcontrollers, sensors, and tools across campus—saving money and preventing idle hardware waste.
              </p>

              {/* Free Campus Testing Callout Card */}
              <div className="mt-8 bg-[#00C26F] rounded-xl p-5 sm:p-6 text-[#07131F] flex items-start gap-4 shadow-lg shadow-[#00C26F]/20">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white">
                  <Zap className="w-6 h-6 text-[#07131F] fill-[#07131F]" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#07131F]">Free campus lab testing & handover</h3>
                  <p className="text-xs sm:text-sm text-[#07131F]/80 mt-1 font-medium leading-relaxed">
                    Meet at Lab 1, Lab 2, or your hostel. Inspect pinouts and verify component working condition before borrowing with total peace of mind.
                  </p>
                </div>
              </div>

              {/* Checkmarks */}
              <ul className="mt-6 space-y-2.5 text-gray-200 text-sm font-medium">
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#00C26F] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#07131F] stroke-[3]" />
                  </div>
                  <span>Verified pinout specifications & tested working condition</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#00C26F] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#07131F] stroke-[3]" />
                  </div>
                  <span>Real-time borrow request approval with peer reputation reviews</span>
                </li>
              </ul>

              <div className="mt-8">
                <Link to="/browse" className="btn-lab-green inline-flex items-center gap-2 font-bold px-7 py-3">
                  Discover Components <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4. VIBRANT GREEN STATISTICS BAR
         ========================================================================= */}
      <section className="bg-[#00C26F] py-12 sm:py-16 text-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            {/* Stat 1: Users */}
            <div>
              <NavyHexBadge icon={Users} />
              <Counter end={stats.totalUsers || 27} suffix="+" label="Registered Students & Admins" />
            </div>

            {/* Stat 2: Borrows */}
            <div>
              <NavyHexBadge icon={ClipboardList} />
              <Counter end={stats.totalBorrowed || 48} suffix="+" label="Completed Borrow Exchanges" />
            </div>

            {/* Stat 3: Components */}
            <div>
              <NavyHexBadge icon={Cpu} />
              <Counter end={stats.totalComponents || 79} suffix="+" label="Active Components in Inventory" />
            </div>

            {/* Stat 4: Categories */}
            <div>
              <NavyHexBadge icon={Award} />
              <Counter end={10} label="Hardware Categories" />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          5. STUDENT REVIEWS: "See what engineering students are saying"
         ========================================================================= */}
      <section id="reviews" className="py-24 bg-white dark:bg-navy-950 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 text-[#00C26F] text-xs font-bold tracking-widest uppercase mb-2">
              <span className="w-4 h-0.5 bg-[#00C26F]" /> STUDENT REVIEWS <span className="w-4 h-0.5 bg-[#00C26F]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              See what engineering students are saying
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Review 1: Student */}
            <div className="relative bg-gray-50 dark:bg-[#0E243A] rounded-2xl p-8 pt-12 border border-gray-100 dark:border-white/5 shadow-md">
              
              {/* Top Navy Badge with Avatar */}
              <div className="absolute -top-7 left-6 bg-[#0B1B2B] rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg">
                <img 
                  src={LAB_IMAGES.avatarStudent} 
                  alt="Kavindu Perera" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#00C26F]"
                />
                <div className="text-left">
                  <h4 className="font-bold text-sm text-white leading-tight">Kavindu Perera</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">3rd Year EE · Robotics Club Lead</p>
                </div>
              </div>

              {/* Quote Body */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                "ComponentHub saved our autonomous robotics capstone! We needed an STM32 board and an MPU-6050 IMU within hours. Found a verified lender in Hostel Block A and picked it up before the lab submission."
              </p>

              {/* 5 Green Stars */}
              <div className="mt-5 flex items-center gap-1 text-[#00C26F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00C26F]" />
                ))}
              </div>

              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-[#00C26F] clip-hex" />
            </div>

            {/* Review 2: Lecturer / Lab Admin */}
            <div className="relative bg-gray-50 dark:bg-[#0E243A] rounded-2xl p-8 pt-12 border border-gray-100 dark:border-white/5 shadow-md">
              
              {/* Top Navy Badge with Avatar */}
              <div className="absolute -top-7 left-6 bg-[#0B1B2B] rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg">
                <img 
                  src={LAB_IMAGES.avatarLecturer} 
                  alt="Dr. Pradeep Weerasinghe" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#00C26F]"
                />
                <div className="text-left">
                  <h4 className="font-bold text-sm text-white leading-tight">Dr. Pradeep Weerasinghe</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Senior Lecturer & Lab Coordinator</p>
                </div>
              </div>

              {/* Quote Body */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2">
                "Coordinating Lab 1 and Lab 2 equipment through ComponentHub has drastically reduced idle hardware waste. Students take genuine ownership and care of components thanks to peer accountability and reviews."
              </p>

              {/* 5 Green Stars */}
              <div className="mt-5 flex items-center gap-1 text-[#00C26F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00C26F]" />
                ))}
              </div>

              <div className="absolute -right-2 top-1/2 w-4 h-4 bg-[#00C26F] clip-hex" />
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. INVENTORY & LIVE POPULAR COMPONENTS
         ========================================================================= */}
      <section id="inventory" className="py-20 bg-gray-50 dark:bg-[#07131F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-2 text-[#00C26F] text-xs font-bold tracking-widest uppercase mb-2">
              <span className="w-4 h-0.5 bg-[#00C26F]" /> LAB INVENTORY & PROJECTS <span className="w-4 h-0.5 bg-[#00C26F]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Featured components & campus lab equipment
            </h2>
          </div>

          {/* 3 High Quality Project / Equipment Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                img: LAB_IMAGES.case1,
                title: 'Bench Power Supply & Oscilloscope Testing',
                tag: 'Lab Equipment',
                desc: 'Calibrated laboratory instruments available for capstone signal debugging and waveform analysis.',
              },
              {
                img: LAB_IMAGES.case2,
                title: 'Biomedical Sensor Prototyping & Pulse Monitoring',
                tag: 'Biomedical Tech',
                desc: 'MAX30102 pulse oximeter and sensor breakout boards with ready I2C library support for Arduino & ESP32.',
              },
              {
                img: LAB_IMAGES.case3,
                title: 'Autonomous Robotics with Jetson Nano & Motor Drivers',
                tag: 'Embedded AI',
                desc: 'High-performance edge computing kits for computer vision and SLAM rover navigation on campus.',
              },
            ].map((study, idx) => (
              <div 
                key={idx}
                className="group relative rounded-xl overflow-hidden bg-white dark:bg-[#0E243A] shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/5 flex flex-col"
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={study.img} 
                    alt={study.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => fallbackImg(e, '/components/electronics.jpg')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-transparent to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00C26F] text-[#07131F] text-xs font-bold">
                    {study.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#00C26F] transition-colors">
                    {study.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                    {study.desc}
                  </p>
                  <Link to="/browse" className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center text-xs font-semibold text-[#00C26F] gap-1">
                    Browse Equipment <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Active ComponentHub Live Listings */}
          {featured.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Active Verified Components</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Available for immediate campus pickup & lab testing</p>
                </div>
                <Link to="/browse" className="text-[#00C26F] text-sm font-semibold hover:underline flex items-center gap-1">
                  View full catalog <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.slice(0, 6).map((c) => (
                  <Link 
                    key={c.id} 
                    to={`/components/${c.id}`} 
                    className="bg-white dark:bg-[#0E243A] rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:border-[#00C26F]/40 shadow-sm hover:shadow-lg transition-all group"
                  >
                    <ComponentImage component={c} className="h-44 rounded-lg mb-3 group-hover:scale-[1.02] transition-transform" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#00C26F] transition-colors">{c.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{c.category_name || 'Hardware'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'available' 
                          ? 'bg-[#00C26F]/10 text-[#00C26F] border border-[#00C26F]/30' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400">
                      <span>{c.location || 'Campus Lab'}</span>
                      <span className="font-bold text-[#00C26F]">
                        {c.price_per_day ? `Rs. ${c.price_per_day}/day` : 'Free Sharing'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          7. "Borrow and share components in four simple steps"
         ========================================================================= */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 text-[#00C26F] text-xs font-bold tracking-widest uppercase mb-2">
              <span className="w-4 h-0.5 bg-[#00C26F]" /> HOW IT WORKS <span className="w-4 h-0.5 bg-[#00C26F]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Borrow and share components <br className="hidden sm:block" />
              in four simple steps
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Step 1 & 2 (Left) */}
            <div className="lg:col-span-4 space-y-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0E243A] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 text-[#00C26F] font-black shadow-sm">
                  01
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Find Components</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Browse through microcontrollers, sensors, ICs, and lab tools listed by students and campus labs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0E243A] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 text-[#00C26F] font-black shadow-sm">
                  02
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Submit Borrow Request</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Select your required dates, specify your academic project purpose, and request owner approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Center Hexagonal Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-64 h-72 sm:w-72 sm:h-80">
                <div className="w-full h-full clip-hex overflow-hidden shadow-2xl relative">
                  <img 
                    src={LAB_IMAGES.stepsCenter} 
                    alt="Precision Component Inspection" 
                    className="w-full h-full object-cover"
                    onError={(e) => fallbackImg(e, '/components/soldering.jpg')}
                  />
                  <div className="absolute inset-0 bg-[#00C26F]/10 pointer-events-none" />
                </div>
                <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full pointer-events-none">
                  <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" fill="none" stroke="#00C26F" strokeWidth="3" />
                </svg>
              </div>
            </div>

            {/* Step 3 & 4 (Right) */}
            <div className="lg:col-span-4 space-y-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0E243A] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 text-[#00C26F] font-black shadow-sm">
                  03
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Campus Handover</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Meet at the university electronics lab or hostel common room to collect and inspect the hardware.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0E243A] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 text-[#00C26F] font-black shadow-sm">
                  04
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Build, Return & Review</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Complete your project build, safely return the component, and build your campus reputation score.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          8. QUALITY BANNER & "Why engineering students choose ComponentHub"
         ========================================================================= */}
      <section className="py-20 bg-[#0B1B2B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Top Banner Callout */}
          <div className="bg-[#0E243A] rounded-2xl p-8 sm:p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-20 shadow-2xl">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Verified hardware for your university engineering projects
              </h2>
              <p className="text-gray-300 text-sm mt-2 max-w-xl">
                Every component is cataloged with pinout details, condition specs, and location accountability across campus.
              </p>
            </div>
            <Link to="/browse" className="btn-lab-green font-bold text-sm px-6 py-3 shrink-0">
              Explore Inventory
            </Link>
          </div>

          {/* 2 Feature Badges */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex items-center gap-4">
              <HexBadge icon={Users} />
              <div>
                <h3 className="font-bold text-lg text-white">Verified Campus Students & Admins</h3>
                <p className="text-xs text-gray-400 mt-1">Identity-verified peers and academic lab coordinators across engineering departments.</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex items-center gap-4">
              <HexBadge icon={Cpu} />
              <div>
                <h3 className="font-bold text-lg text-white">Tested Working Hardware</h3>
                <p className="text-xs text-gray-400 mt-1">Components are functionally inspected before handover so you never waste project time on burnt ICs.</p>
              </div>
            </div>
          </div>

          {/* Why choose us split */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2 text-[#00C26F] text-xs font-bold tracking-widest uppercase mb-3">
                <span className="w-6 h-0.5 bg-[#00C26F]" /> WHY CHOOSE US
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Why engineering students choose ComponentHub
              </h2>
              <p className="text-gray-300 text-sm mt-4 leading-relaxed">
                We eliminate the bottleneck of ordering parts from overseas or letting expensive lab tools sit idle in cupboards. Innovate faster, collaborate with seniors, and keep your project budgets under control.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Zero equipment waste — reuse components instead of letting them sit in drawers',
                  'Direct peer handover on campus without shipping delays or customs fees',
                  'Complete borrow history with due dates and automated return reminders',
                  'Academic reputation ratings ensuring respectful and reliable exchanges',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-200">
                    <div className="w-5 h-5 rounded-full bg-[#00C26F] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#07131F] stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/browse" className="btn-lab-green font-bold inline-flex items-center gap-2">
                  Explore Full Catalog <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[420px] h-[360px]">
                <div className="w-64 h-72 clip-hex overflow-hidden shadow-2xl absolute top-0 left-4">
                  <img 
                    src={LAB_IMAGES.microscope} 
                    alt="Precision Microscope Inspection" 
                    className="w-full h-full object-cover"
                    onError={(e) => fallbackImg(e, '/components/logic-analyzer.jpg')}
                  />
                </div>
                <div className="w-48 h-56 clip-hex overflow-hidden shadow-2xl absolute bottom-0 right-4 border-2 border-[#00C26F]">
                  <img 
                    src={LAB_IMAGES.labClean} 
                    alt="Clean Lab Electronics Testing" 
                    className="w-full h-full object-cover"
                    onError={(e) => fallbackImg(e, '/components/bench-psu.jpg')}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          9. CONTACT & INQUIRY SECTION ("Campus Lab Desk")
         ========================================================================= */}
      <section id="contact" className="py-24 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Green Info Box & Campus Desk Card */}
            <div className="lg:col-span-5 bg-[#00C26F] rounded-2xl p-8 sm:p-10 text-[#07131F] shadow-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#07131F]/70 block mb-2">CAMPUS LAB DESK</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#07131F] leading-tight">
                Let's build together
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#07131F]/80 leading-relaxed font-medium">
                Need a specific component, lab workbench access, or want to donate surplus hardware to the student network? Reach out to our campus team.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#07131F]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[#07131F]/70">Call Helpline</p>
                    <p className="font-black text-lg text-[#07131F]">077-1234567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#07131F]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[#07131F]/70">Lab Email</p>
                    <p className="font-bold text-sm text-[#07131F]">support@componenthub.lk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#07131F]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[#07131F]/70">Faculty Location</p>
                    <p className="font-bold text-sm text-[#07131F]">Department of Electronic & Telecommunication, Lab 1 & 2</p>
                  </div>
                </div>
              </div>

              {/* Map Illustration Preview */}
              <div className="mt-8 rounded-xl overflow-hidden border-2 border-white/30 h-36 bg-[#07131F]/10 relative flex items-center justify-center text-center p-4">
                <div className="text-xs font-semibold text-[#07131F]">
                  📍 Faculty of Engineering · Electronics Lab Desk <br />
                  <span className="text-[10px] opacity-75">Open Monday – Friday: 8:00 AM – 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Right Contact Form ("Need help or looking for a component?") */}
            <div className="lg:col-span-7 bg-gray-50 dark:bg-[#0E243A] rounded-2xl p-8 sm:p-10 border border-gray-100 dark:border-white/5 shadow-md">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Need help or looking for a component?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Have a question about component testing, borrowing, or listing your own lab equipment?
              </p>

              <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Your Name</label>
                    <input 
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Kavindu Perera"
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#07131F] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:border-[#00C26F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. student@uor.lk"
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#07131F] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:border-[#00C26F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g. Request for Oscilloscope probe or Basys3 FPGA"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#07131F] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:border-[#00C26F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Message *</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us what you need assistance with..."
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#07131F] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:border-[#00C26F]"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-lab-green w-full sm:w-auto font-bold text-sm px-8 py-3.5 shadow-md shadow-[#00C26F]/20 flex items-center justify-center gap-2"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          10. GUIDES & LAB BULLETINS
         ========================================================================= */}
      <section id="guides" className="py-20 bg-gray-50 dark:bg-[#07131F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 text-[#00C26F] text-xs font-bold tracking-widest uppercase mb-2">
              <span className="w-4 h-0.5 bg-[#00C26F]" /> GUIDES & TUTORIALS <span className="w-4 h-0.5 bg-[#00C26F]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Latest electronics guides & lab bulletins
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: LAB_IMAGES.blog1,
                date: 'October 28, 2026',
                category: 'Lab Safety',
                title: 'ESD Protection & Safe Handling of Sensitive MOS ICs',
                desc: 'Essential grounding and anti-static precautions when testing microcontrollers and FPGA boards in Lab 1.',
              },
              {
                img: LAB_IMAGES.blog2,
                date: 'October 24, 2026',
                category: 'Instrumentation',
                title: 'How to Debug PWM Signals Using a Digital Oscilloscope',
                desc: 'A student guide to probing motor driver outputs, measuring duty cycles, and eliminating inductive noise.',
              },
              {
                img: LAB_IMAGES.blog3,
                date: 'October 19, 2026',
                category: 'IoT Prototyping',
                title: 'Low-Power ESP32 Telemetry with LoRa Communication',
                desc: 'Building long-range remote sensing nodes with rechargeable 18650 lithium-ion cells and deep sleep modes.',
              },
            ].map((blog, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-[#0E243A] rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={blog.img} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => fallbackImg(e, '/components/soldering.jpg')}
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00C26F] text-[#07131F] text-xs font-bold">
                    {blog.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#00C26F]" /> {blog.date}
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#00C26F] transition-colors leading-snug">
                    {blog.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                    {blog.desc}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center text-xs font-bold text-[#00C26F] gap-1 group-hover:gap-2 transition-all">
                    Read Guide <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          11. DEEP NAVY COMPONENTHUB COMPREHENSIVE FOOTER
         ========================================================================= */}
      <footer className="bg-[#07131F] text-white pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Top Newsletter & Brand Strip */}
          <div className="pb-16 border-b border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(0,194,111,0.5)]">
                  <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#00C26F]" />
                </svg>
                <Zap className="w-6 h-6 text-white fill-white relative z-10" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white block">
                  ComponentHub
                </span>
                <p className="text-xs text-gray-400">Campus electronics exchange & lab inventory platform</p>
              </div>
            </div>

            {/* Newsletter Input */}
            <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex items-center max-w-md">
              <input 
                type="email" 
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your university email..."
                className="w-full sm:w-80 px-4 py-3 rounded-l-lg bg-[#0E243A] border border-white/10 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00C26F]"
              />
              <button 
                type="submit" 
                className="btn-lab-green rounded-l-none rounded-r-lg font-bold text-sm px-6 py-3 flex items-center gap-1 shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* 4 Footer Columns */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 py-16 border-b border-white/10">
            
            {/* Col 1: About */}
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">About ComponentHub</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                ComponentHub connects engineering undergraduates and laboratory coordinators to share, lend, rent, and trade electronic parts and diagnostic tools across campus without budget limits.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#00C26F] font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Academic Hardware Network Verified
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link to="/browse" className="hover:text-[#00C26F] transition-colors">Browse All Components</Link></li>
                <li><a href="#about" className="hover:text-[#00C26F] transition-colors">About Us</a></li>
                <li><a href="#categories" className="hover:text-[#00C26F] transition-colors">Hardware Categories</a></li>
                <li><a href="#how-it-works" className="hover:text-[#00C26F] transition-colors">How It Works</a></li>
                <li><a href="#inventory" className="hover:text-[#00C26F] transition-colors">Lab Inventory</a></li>
                <li><a href="#reviews" className="hover:text-[#00C26F] transition-colors">Student Reviews</a></li>
                <li><Link to="/register" className="hover:text-[#00C26F] transition-colors">Register as Student</Link></li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Campus Contact</h4>
              <ul className="space-y-3 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#00C26F] shrink-0 mt-0.5" />
                  <span>Faculty of Engineering, Department of Electronic & Telecommunication</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00C26F] shrink-0" />
                  <span>077-1234567 / +94 11 265 0301</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#00C26F] shrink-0" />
                  <span>support@componenthub.lk</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Operating Hours */}
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Lab Operating Hours</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex justify-between">
                  <span>Electronics Lab 1 & 2:</span>
                  <span className="text-white font-medium">8:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Component Handover:</span>
                  <span className="text-white font-medium">9:00 AM - 5:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Online Requests:</span>
                  <span className="text-[#00C26F] font-medium">24/7 Available</span>
                </li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5 text-[11px] text-gray-300">
                Emergency component requests for final year projects available via lab coordinator hotline.
              </div>
            </div>

          </div>

          {/* Copyright Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} ComponentHub. Built by Senuk Yuthmika · EC4307 Web Application Development</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-gray-400 cursor-pointer">Lab Safety Guidelines</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
