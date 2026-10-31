import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Users, ArrowUpRight, Eye, Plus, Search, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
    { label: 'My Listings', value: userStats.myListings, icon: Package, color: 'text-electric-500 bg-electric-50 dark:bg-electric-900/20' },
    { label: 'My Requests', value: userStats.myRequests, icon: ArrowUpRight, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Incoming', value: userStats.incomingRequests, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Total Views', value: userStats.totalViews, icon: Eye, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  ] : [];

  const actionLabels = {
    create_component: 'Listed a component', update_component: 'Updated a listing',
    delete_component: 'Removed a listing', create_request: 'Submitted borrow request',
    approve_request: 'Approved a request', deny_request: 'Denied a request',
    return_item: 'Returned an item', register: 'Joined the platform',
    login: 'Signed in', update_profile: 'Updated profile',
    add_review: 'Left a review', add_to_wishlist: 'Added to wishlist',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening on ComponentHub</p>
        </div>
        <div className="flex gap-2">
          <Link to="/browse" className="btn-secondary text-sm flex items-center gap-1.5"><Search className="w-4 h-4" /> Browse</Link>
          <Link to="/my-listings" state={{ create: true }} className="btn-primary text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Listing</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold animate-count">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid lg:grid-cols-2 gap-5 mb-8">
          {/* Line: requests over time */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Borrow requests over time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.requestsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar: by category */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Components by category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie: listing types */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Listing type distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={charts.byListingType} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name" label={({name}) => name}>
                  {charts.byListingType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Area: platform activity */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Platform activity</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={charts.activityByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Horizontal bar: locations */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Top locations</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.topLocations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut: request status */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Request status breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={charts.requestStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name" label={({name}) => name}>
                  {charts.requestStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-electric-500" /> Recent activity</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activity.slice(0, 15).map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-electric-400 mt-2 shrink-0" />
              <div>
                <span className="font-medium">{a.full_name}</span>{' '}
                <span className="text-gray-500">{actionLabels[a.action] || a.action}</span>
                <div className="text-xs text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
          {activity.length === 0 && <p className="text-gray-400 text-sm">No recent activity</p>}
        </div>
      </div>
    </div>
  );
}
