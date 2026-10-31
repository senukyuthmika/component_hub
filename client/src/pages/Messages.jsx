import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [convos, setConvos] = useState([]);
  const [activeUser, setActiveUser] = useState(searchParams.get('to') || null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages/conversations').then(r => { setConvos(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeUser) {
      api.get(`/messages/thread/${activeUser}`).then(r => setMessages(r.data.data)).catch(() => {});
    }
  }, [activeUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeUser) return;
    try {
      await api.post('/messages', { receiver_id: parseInt(activeUser), content: newMsg, component_id: searchParams.get('comp') || null });
      setNewMsg('');
      const { data } = await api.get(`/messages/thread/${activeUser}`);
      setMessages(data.data);
    } catch (err) { toast.error('Failed to send'); }
  };

  const deleteMsg = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      setMessages(m => m.filter(msg => msg.id !== id));
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="card flex h-[500px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 dark:border-gray-800 overflow-y-auto hidden sm:block">
          {convos.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No conversations yet</div>
          ) : convos.map(c => (
            <button key={c.other_user_id} onClick={() => setActiveUser(c.other_user_id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${activeUser == c.other_user_id ? 'bg-electric-50/50 dark:bg-electric-900/10' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric-400 to-emerald-400 flex items-center justify-center text-white text-sm font-semibold shrink-0">{c.other_user_name?.charAt(0)}</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.other_user_name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.last_message}</p>
                </div>
                {c.unread_count > 0 && <span className="w-5 h-5 bg-electric-500 text-white text-[10px] rounded-full flex items-center justify-center shrink-0">{c.unread_count}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" /><p className="text-sm">Select a conversation</p></div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm group ${m.sender_id === user.id ? 'bg-electric-500 text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'}`}>
                      {m.component_title && <p className="text-xs opacity-70 mb-1">Re: {m.component_title}</p>}
                      <p>{m.content}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[10px] opacity-60">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {m.sender_id === user.id && <button onClick={() => deleteMsg(m.id)} className="opacity-0 group-hover:opacity-60 transition-opacity"><Trash2 className="w-3 h-3" /></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-gray-800 p-3 flex gap-2">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} className="input-field text-sm" placeholder="Type a message..." />
                <button type="submit" className="btn-primary px-3"><Send className="w-4 h-4" /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
