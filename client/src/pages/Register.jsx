import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Sparkles, MapPin, Phone, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', phone: '', location: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const locations = ['Lab 1','Lab 2','Lab 3','Lab 4','Lab 5','Hostel Block A','Hostel Block B','Hostel Block C','Hostel Block D','Hostel Block E','Hostel Block F','Off-campus'];

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to ComponentHub.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const passStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#00C26F]'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-navy-950">
      <div className="w-full max-w-5xl bg-white dark:bg-[#0E243A] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden grid lg:grid-cols-12">
        
        {/* Left Visual & Hero Column */}
        <div className="lg:col-span-5 bg-[#0B1B2B] text-white p-8 sm:p-10 relative flex flex-col justify-between overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00C26F]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Info */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#00C26F] text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00C26F] animate-ping" />
              Join University Network
            </div>
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              Start sharing & <br />
              <span className="text-[#00C26F]">borrowing hardware</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
              Create your free student or faculty account to borrow, list, and trade electronic parts without budget limits.
            </p>
          </div>

          {/* Featured Visual */}
          <div className="relative z-10 my-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 h-48 sm:h-56 group">
              <img 
                src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80" 
                alt="Modern Electronics Laboratory Bench"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/components/bench-psu.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs">
                <div className="flex items-center gap-2 text-[#00C26F] font-bold text-[11px] mb-1">
                  <ShieldCheck className="w-4 h-4" /> Academic Reputation Verified
                </div>
                <p className="text-gray-200 text-[11px] leading-snug">
                  Borrow components safely with peer reviews and automated return reminders.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="relative z-10 pt-4 border-t border-white/10 space-y-2.5 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C26F] shrink-0" />
              <span>Free P2P component borrowing on campus</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C26F] shrink-0" />
              <span>Access calibrated tools in Electronics Lab 1 & 2</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C26F] shrink-0" />
              <span>Build an academic hardware maker reputation</span>
            </div>
          </div>

        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          
          <div className="mb-6">
            <div className="relative w-10 h-10 flex items-center justify-center mb-3">
              <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_12px_rgba(0,194,111,0.4)]">
                <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" className="fill-[#00C26F]" />
              </svg>
              <Zap className="w-5 h-5 text-white fill-white relative z-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              Join the campus component exchange & lab inventory platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="text" 
                    value={form.full_name} 
                    onChange={e => setForm({...form, full_name: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                    placeholder="Kavindu Perera"
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  University Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                    placeholder="student@uor.lk"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                    placeholder="••••••••"
                  />
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColors[passStrength]} transition-all`} style={{width: `${passStrength * 33.3}%`}} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{strengthLabels[passStrength]}</span>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="password" 
                    value={form.confirm} 
                    onChange={e => setForm({...form, confirm: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                    placeholder="077-1234567" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Campus Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <select 
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all"
                  >
                    <option value="">Select campus location</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Bio / Specialization (Optional)
              </label>
              <textarea 
                rows={2} 
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})} 
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07131F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#00C26F] focus:border-transparent transition-all" 
                placeholder="e.g. 3rd year EE student, embedded robotics, IoT & sensor projects..." 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-lab-green w-full py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#00C26F]/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : (
                <>Create Free Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00C26F] font-bold hover:underline">
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
