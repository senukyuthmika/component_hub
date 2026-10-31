import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, Sun, Moon, Bell, Heart, MessageSquare, ChevronDown, LogOut, User, LayoutDashboard, Settings, Shield, Zap } from 'lucide-react';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => setUnread(r.data.data.unreadCount)).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">ComponentHub</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/browse', label: 'Browse' },
                { to: '/my-listings', label: 'My Listings' },
                { to: '/requests', label: 'Requests' },
              ].map(l => (
                <Link key={l.to} to={l.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.to) ? 'bg-electric-50 dark:bg-electric-900/30 text-electric-600 dark:text-electric-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>{l.label}</Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link to="/wishlist" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:flex">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/messages" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:flex">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link to="/notifications" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
                </Link>

                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-400 to-emerald-400 flex items-center justify-center text-white text-sm font-semibold">
                      {user.full_name?.charAt(0)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 card p-1.5 shadow-xl animate-fade-in">
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                          <p className="font-medium text-sm truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><User className="w-4 h-4" /> Profile</Link>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                        {user.role === 'superadmin' && <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><Shield className="w-4 h-4" /> Admin Panel</Link>}
                        <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 w-full"><LogOut className="w-4 h-4" /> Sign Out</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm hidden sm:block">Register</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && user && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-navy-900 p-3 animate-fade-in">
          {[
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/browse', label: 'Browse', icon: Zap },
            { to: '/my-listings', label: 'My Listings', icon: Settings },
            { to: '/requests', label: 'Requests', icon: MessageSquare },
            { to: '/wishlist', label: 'Wishlist', icon: Heart },
            { to: '/messages', label: 'Messages', icon: MessageSquare },
          ].map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
