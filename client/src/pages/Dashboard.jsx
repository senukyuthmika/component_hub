import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, ArrowUpRight, Eye, Plus, Search, Clock, TrendingUp, 
  Sparkles, CheckCircle2, ShieldCheck, MapPin, Cpu, Radio, Wrench, 
  Layers, ArrowRight, Zap, Activity
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '../services/api';

// Modern brand color palette matching the new UI
const BRAND_COLORS = ['#00C26F', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Hexagonal Icon Wrapper
function HexIcon({ icon: Icon, color = '#00C26F' }) {
  return (
    <div className="relative w-11 h-12 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full drop-shadow-sm">
        <polygon points="50,2 98,28 98,87 50,113 2,87 2,28" fill={color} />
      </svg>
      <Icon className="w-5 h-5 text-white relative z-10" />
    </div>
  );
}

// Custom Recharts Tooltip
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1B2B] text-white p-3 rounded-xl border border-white/10 shadow-2xl text-xs">
        <p className="font-bold text-gray-300 mb-1">{label || payload[0]?.name}</p>
        <p className="text-[#00C26F] font-black text-sm">
          {payload[0]?.value} <span className="text-[11px] font-normal text-gray-400">items/actions</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/dashboard/user-stats').then(r => setUserStats(r.data.data)).catch(() => {});
    api.get('/dashboard/charts').then(r => setCharts(r.data.data)).catch(() => {});
    api.get('/dashboard/recent-activity').then(r => setActivity(r.data.data)).catch(() => {});
  }, []);

  const statCards = userStats ? [
    { 
      label: 'My Listings', 
      value: userStats.myListings, 
      icon: Package, 
      color: '#00C26F',
      sub: 'Active on campus',
      link: '/my-listings'
    },
    { 
      label: 'My Requests', 
      value: userStats.myRequests, 
      icon: ArrowUpRight, 
      color: '#0EA5E9',
      sub: 'Outgoing requests',
      link: '/requests'
    },
    { 
      label: 'Pending Incoming', 
      value: userStats.incomingRequests, 
      icon: Clock, 
      color: '#F59E0B',
      sub: userStats.incomingRequests > 0 ? 'Requires review' : 'All clear',
      link: '/requests'
    },
    { 
      label: 'Total Views', 
      value: userStats.totalViews, 
      icon: Eye, 
      color: '#8B5CF6',
      sub: 'Platform reach',
      link: '/my-listings'
    },
  ] : [];

  const actionLabels = {
    create_component: 'Listed a new component', 
    update_component: 'Updated component details',
    delete_component: 'Removed a listing', 
    create_request: 'Submitted a borrow request',
    approve_request: 'Approved a borrow request', 
    deny_request: 'Denied a borrow request',
    return_item: 'Safely returned an item', 
    register: 'Joined the platform',
    login: 'Signed in to ComponentHub', 
    update_profile: 'Updated profile information',
    add_review: 'Left a star review', 
    add_to_wishlist: 'Saved item to wishlist',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* =========================================================================
          1. WELCOME HERO BANNER (Modern Dark Navy with Equipment Image Mask)
         ========================================================================= */}
      <div className="relative rounded-3xl bg-[#0B1B2B] text-white p-6 sm:p-10 border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#00C26F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Backdrop Photo Mask (Engineering Workbench) */}
        <div className="absolute top-0 right-0 w-full sm:w-2/3 h-full opacity-20 sm:opacity-30 pointer-events-none overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80" 
            alt="Electronics Workbench" 
            className="w-full h-full object-cover object-right"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/components/electronics.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B2B] via-[#0B1B2B]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C26F]/20 text-[#00C26F] border border-[#00C26F]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C26F] animate-ping" />
                {user?.role === 'superadmin' ? 'Superadmin' : user?.role === 'lab_admin' ? 'Lab Coordinator' : 'Engineering Student'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs text-gray-300 bg-white/5 border border-white/10 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00C26F]" />
                {user?.location || 'Faculty Lab 1 & 2'}
              </span>
            </div>

            {/* Greeting */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Maker'}! 👋
            </h1>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Manage your active listings, inspect incoming borrow requests, and explore campus inventory across university engineering labs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link 
              to="/browse" 
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#00C26F]" /> Browse Catalog
            </Link>
            <Link 
              to="/my-listings" 
              state={{ create: true }} 
              className="btn-lab-green text-sm px-6 py-3 font-bold shadow-lg shadow-[#00C26F]/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> New Component Listing
            </Link>
          </div>
        </div>

      </div>

      {/* =========================================================================
          2. STAT CARDS ROW (Hexagonal Badges & Modern Card Elevation)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((s, i) => (
          <Link 
            key={i} 
            to={s.link}
            className="bg-white dark:bg-[#0E243A] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <HexIcon icon={s.icon} color={s.color} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-[#00C26F] transition-colors flex items-center gap-1">
                {s.sub} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight animate-count">
              {s.value}
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      {/* =========================================================================
          3. CAMPUS HARDWARE SPOTLIGHT (Rich Imagery Showcase)
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C26F]" /> Campus Lab & Hardware Spotlight
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Quick access to popular university lab equipment & components</p>
          </div>
          <Link to="/browse" className="text-xs font-bold text-[#00C26F] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              title: 'Oscilloscopes & Bench PSUs',
              tag: 'Electronics Lab 1 & 2',
              desc: 'Digital multimeters, signal generators, and bench power supplies available for senior project debugging.',
              img: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
              fallback: '/components/bench-psu.jpg',
              link: '/browse?category=10',
            },
            {
              title: 'Microcontrollers & Dev Boards',
              tag: 'Active Inventory',
              desc: 'Arduino Uno, ESP32-WROOM, STM32 Blue Pill, Raspberry Pi 4, and Teensy boards ready for handover.',
              img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
              fallback: '/components/rpi4.jpg',
              link: '/browse?category=1',
            },
            {
              title: 'Sensors & Measurement Modules',
              tag: 'Campus Ready',
              desc: '6-axis MPU-6050 IMUs, ultrasonic range finders, barometric sensors, and biomedical pulse monitors.',
              img: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
              fallback: '/components/mpu6050.jpg',
              link: '/browse?category=2',
            },
          ].map((item, idx) => (
            <Link 
              key={idx} 
              to={item.link} 
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#0E243A] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="h-36 overflow-hidden relative">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = item.fallback; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B] via-[#0B1B2B]/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#00C26F] text-[#07131F] text-[10px] font-black uppercase tracking-wider">
                  {item.tag}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#00C26F] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center text-xs font-bold text-[#00C26F] gap-1">
                  Explore Equipment <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. 6 RECHARTS CHARTS (Elevated Emerald & Slate Themes)
         ========================================================================= */}
      {charts && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00C26F]" /> Platform Analytics & Exchange Metrics
            </h2>
            <span className="text-xs text-gray-400">Real-time database statistics</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            
            {/* Chart 1: Line (Requests over time) */}
            <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Borrow requests over time</h3>
                <span className="text-xs font-semibold text-[#00C26F] bg-[#00C26F]/10 px-2 py-0.5 rounded">Monthly Volume</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={charts.requestsByMonth}>
                  <defs>
                    <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C26F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C26F" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00C26F" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#00C26F', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, fill: '#00C26F' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Horizontal Bar (Components by category) */}
            <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Components by category</h3>
                <span className="text-xs font-semibold text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-0.5 rounded">Inventory</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={charts.byCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#0EA5E9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Donut (Listing types) */}
            <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Listing type distribution</h3>
                <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">P2P Modes</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie 
                    data={charts.byListingType} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={85} 
                    paddingAngle={3} 
                    dataKey="value" 
                    nameKey="name" 
                    label={({name}) => name}
                  >
                    {charts.byListingType.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 4: Area (Platform activity) */}
            <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Platform activity</h3>
                <span className="text-xs font-semibold text-[#00C26F] bg-[#00C26F]/10 px-2 py-0.5 rounded">All Actions</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={charts.activityByMonth}>
                  <defs>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C26F" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00C26F" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#00C26F" 
                    fill="url(#actGrad)" 
                    strokeWidth={2.5} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 5: Horizontal Bar (Top locations) */}
            <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Top campus locations</h3>
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Labs & Hostels</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={charts.topLocations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 6: Donut (Request status) */}
            <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Request status breakdown</h3>
                <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Status Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie 
                    data={charts.requestStatus} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={85} 
                    paddingAngle={3} 
                    dataKey="value" 
                    nameKey="name" 
                    label={({name}) => name}
                  >
                    {charts.requestStatus.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          5. RECENT ACTIVITY FEED
         ========================================================================= */}
      <div className="bg-white dark:bg-[#0E243A] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00C26F]" /> Recent Platform Activity
          </h3>
          <span className="text-xs text-gray-400">Live community actions</span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {activity.slice(0, 15).map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C26F] to-emerald-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {a.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm">
                  <span className="font-bold text-gray-900 dark:text-white">{a.full_name}</span>{' '}
                  <span className="text-gray-500 dark:text-gray-400">{actionLabels[a.action] || a.action}</span>
                </p>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {activity.length === 0 && <p className="text-gray-400 text-sm">No recent activity recorded yet.</p>}
        </div>
      </div>

    </div>
  );
}
