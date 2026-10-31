import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Inbox, ArrowUpRight, XCircle, RotateCcw, Star, Info } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const icons = { request_received: Inbox, request_approved: ArrowUpRight, request_denied: XCircle, item_returned: RotateCcw, new_review: Star, system: Info };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => { setNotifications(r.data.data.notifications); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, is_read: 1 } : notif));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(n => n.map(notif => ({ ...notif, is_read: 1 })));
    toast.success('All marked as read');
  };

  // Group by date
  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1.5"><CheckCheck className="w-4 h-4" /> Mark all read</button>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div> :
        notifications.length === 0 ? (
          <div className="text-center py-20 card"><Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" /><h3 className="font-semibold">No notifications</h3><p className="text-sm text-gray-500 mt-1">You're all caught up</p></div>
        ) : (
          Object.entries(grouped).map(([date, notifs]) => (
            <div key={date} className="mb-6">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{date}</h3>
              <div className="space-y-2">
                {notifs.map(n => {
                  const Icon = icons[n.type] || Info;
                  return (
                    <button key={n.id} onClick={() => markRead(n.id)}
                      className={`card w-full text-left p-4 flex items-start gap-3 transition-all hover:shadow-sm ${!n.is_read ? 'border-l-4 border-l-electric-500' : 'opacity-70'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-electric-50 text-electric-500' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm ${!n.is_read ? 'font-semibold' : ''}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
    </div>
  );
}
