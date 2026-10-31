import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Mail, Lock, CheckCircle2, ArrowRight, Shield, Cpu, Sparkles, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to ComponentHub!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    toast.success(`Demo credentials loaded for ${demoEmail.split('@')[0]}!`);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-navy-950">
      <div className="w-full max-w-5xl bg-white dark:bg-[#0E243A] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden grid lg:grid-cols-12">
        
        {/* Left Visual & Hero Column (Hidden on small mobile, visible lg+) */}
        <div className="lg:col-span-6 bg-[#0B1B2B] text-white p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00C26F]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#00C26F] text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00C26F] animate-ping" />
              Faculty of Engineering · P2P Hardware Network
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              Share components. <br />
              <span className="text-[#00C26F]">Build lab projects.</span>
            </h2>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed max-w-md">
              Access hundreds of microcontrollers, sensors, oscilloscopes, and testing gear listed by students and campus labs.
            </p>
          </div>

          {/* Featured Visual with Hexagonal Overlay */}
          <div className="relative z-10 my-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-56 sm:h-64 group">
              <img 
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80" 
                alt="Engineering Student at Electronics Workbench"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/components/electronics.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-[#0B1B2B]/30 to-transparent" />
              
              {/* Bottom Quote Pill */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs">
                <p className="text-gray-200 italic leading-snug">
                  "Saved our robotics capstone when we needed an STM32 board and IMU within hours."
                </p>
                <p className="text-[11px] font-bold text-[#00C26F] mt-1">
                  — Kavindu Perera, Robotics Club Lead
                </p>
              </div>

              {/* Hexagon Badge Overlay */}
              <div className="absolute top-3 right-3 w-16 h-18">
                <div className="w-full h-full clip-hex overflow-hidden border border-[#00C26F] shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=300&q=80" 
                    alt="Test Probes"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/components/bench-psu.jpg'; }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Feature Badges */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C26F]" />
              <span>79+ Active Components</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C26F]" />
              <span>Free Campus Handover</span>
            </div>
          </div>

        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          
          {/* Header & Logo */}
          <div className="mb-8">
            <div className="relative w-12 h-12 flex items-center justify-center mb-4">
              <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_12px_rgba(0,194,111,0.4)]">
                <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#00C26F]" />
              </svg>
              <Zap className="w-6 h-6 text-white fill-white relative z-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Sign in to ComponentHub
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
              Access your component exchange & lab inventory account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                  placeholder="student@sliit.lk" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPass ? 'text' : 'password'} 
                  required
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-lab-green w-full py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#00C26F]/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : (
                <>Sign In to Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#00C26F] font-bold hover:underline">
              Create an account
            </Link>
          </p>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00C26F]" /> Instant Demo Sign-in
              </span>
              <span className="text-[11px] text-gray-400">pw: password123</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Superadmin', email: 'admin@componenthub.lk', badge: 'Admin' },
                { label: 'Lab Admin', email: 'lab@componenthub.lk', badge: 'Lab 1 & 2' },
                { label: 'Student', email: 'student@componenthub.lk', badge: 'EE Student' },
              ].map(d => (
                <button 
                  key={d.email} 
                  type="button"
                  onClick={() => handleDemoFill(d.email)}
                  className="text-left p-2.5 rounded-xl bg-gray-50 dark:bg-[#07131F] hover:bg-[#00C26F]/10 border border-gray-200 dark:border-white/5 hover:border-[#00C26F]/40 transition-all group"
                >
                  <p className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-[#00C26F] transition-colors truncate">
                    {d.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                    {d.badge}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
