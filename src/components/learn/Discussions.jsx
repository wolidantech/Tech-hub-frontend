import { useState, useEffect } from 'react';
import { MessagesSquare, Pin, Send, MessageCircle } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { toast } from 'sonner';

export default function Discussions({ courseId, lessonId = null, user, title = 'Q&A & Discussions' }) {
  const { getCoursePosts, getPostComments, createPost, addComment, ensureCoursePosts, ensurePostComments } = useLMS();
  const [open, setOpen] = useState({});
  const [drafts, setDrafts] = useState({});
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { ensureCoursePosts(courseId).catch(() => {}); }, [courseId, ensureCoursePosts]);

  const posts = getCoursePosts(courseId).filter((p) => !lessonId || !p.lessonId || p.lessonId === lessonId);

  const toggleOpen = (postId) => {
    const next = !open[postId];
    setOpen({ ...open, [postId]: next });
    if (next) ensurePostComments(postId).catch(() => {});
  };

  const handlePost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) { toast.error('Title and details required'); return; }
    try {
      await createPost({ courseId, lessonId, userId: user.id, authorName: user.fullName, title: newPost.title, body: newPost.body });
      setNewPost({ title: '', body: '' });
      setShowForm(false);
      toast.success('Question posted! 🎉');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleComment = async (postId) => {
    const body = (drafts[postId] || '').trim();
    if (!body) return;
    try {
      await addComment({ postId, userId: user.id, authorName: user.fullName, body, isAdmin: user.role === 'admin' });
      setDrafts({ ...drafts, [postId]: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-3xl glass p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-bold flex items-center gap-2"><MessagesSquare className="h-5 w-5 text-amber-300" /> {title} ({posts.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="min-h-11 px-4 rounded-full bg-white text-black font-bold text-xs">ASK A QUESTION</button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <input value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} placeholder="Question title..." className="w-full h-11 rounded-full glass px-4 text-sm" />
          <textarea value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })} placeholder="Describe your question in detail..." className="w-full rounded-2xl glass p-4 text-sm h-24" />
          <button onClick={handlePost} className="btn-primary min-h-11 text-xs">POST QUESTION</button>
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-8 text-sm text-white/40">No discussions yet. Be the first to ask a question! 💬</div>
      )}

      <div className="space-y-3">
        {posts.map((p) => {
          const list = getPostComments(p.id);
          const isOpen = open[p.id];
          return (
            <div key={p.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                  {(p.authorName || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">{p.title}</span>
                    {p.pinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold"><Pin className="h-2.5 w-2.5" /> PINNED</span>}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{p.authorName} • {new Date(p.createdAt).toLocaleString()}</div>
                  <p className="text-sm text-white/70 mt-2 whitespace-pre-line">{p.body}</p>
                  <button onClick={() => toggleOpen(p.id)} className="mt-2 min-h-11 text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" /> {list.length} REPLIES {isOpen ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 sm:ml-12 space-y-2">
                  {list.map((c) => (
                    <div key={c.id} className={`rounded-xl p-3 text-sm ${c.isAdmin ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/[0.03]'}`}>
                      <span className="font-bold text-xs">{c.authorName}</span>
                      {c.isAdmin && <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-500/30 text-[10px] font-bold">INSTRUCTOR</span>}
                      <span className="text-white/30 text-xs ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                      <div className="text-white/75 mt-1 whitespace-pre-line">{c.body}</div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={drafts[p.id] || ''}
                      onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(p.id)}
                      placeholder="Write a reply..."
                      className="flex-1 min-w-0 h-11 rounded-full glass px-4 text-sm"
                    />
                    <button aria-label="Send reply" onClick={() => handleComment(p.id)} className="h-11 w-11 rounded-full bg-white text-black flex items-center justify-center shrink-0"><Send className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
