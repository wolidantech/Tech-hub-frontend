import { useState } from 'react';
import { MessagesSquare, Radio, Star, Pin, Trash2, Plus, X, Video, Bell, Eye } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function CommunityManager() {
  const { user } = useAuth();
  const { courses, enrollments, sendNotificationToUser } = useCourses();
  const {
    posts, comments, togglePinPost, deletePost, addComment, deleteComment, getPostComments,
    liveClasses, createLiveClass, updateLiveClass, deleteLiveClass,
    reviews, moderateReview, deleteReview, audit,
  } = useLMS();
  const [tab, setTab] = useState('discussions');
  const [courseFilter, setCourseFilter] = useState('');
  const [viewPost, setViewPost] = useState(null);
  const [reply, setReply] = useState('');
  const [showLive, setShowLive] = useState(false);
  const [editingLive, setEditingLive] = useState(null);
  const [liveForm, setLiveForm] = useState({ title: '', courseId: '', date: '', time: '', duration: 60, platform: 'Zoom', meetingLink: '', description: '', recordingUrl: '' });

  const courseName = (id) => courses.find((c) => c.id === id)?.title || '—';
  const filteredPosts = posts.filter((p) => !courseFilter || p.courseId === courseFilter);

  const startEditLive = (lc) => {
    setEditingLive(lc.id);
    setLiveForm({ title: lc.title, courseId: lc.courseId || '', date: lc.date, time: lc.time, duration: lc.duration, platform: lc.platform, meetingLink: lc.meetingLink, description: lc.description || '', recordingUrl: lc.recordingUrl || '' });
    setShowLive(true);
  };

  const saveLive = () => {
    if (!liveForm.title.trim() || !liveForm.date || !liveForm.meetingLink.trim()) { toast.error('Title, date and meeting link required'); return; }
    if (!/^https?:\/\//i.test(liveForm.meetingLink)) { toast.error('Meeting link must start with http'); return; }
    if (editingLive) { updateLiveClass(editingLive, liveForm, user); toast.success('Live class updated'); }
    else { createLiveClass({ ...liveForm, duration: Number(liveForm.duration), courseId: liveForm.courseId || null }, user); toast.success('Live class scheduled 🔴'); }
    setShowLive(false); setEditingLive(null);
    setLiveForm({ title: '', courseId: '', date: '', time: '', duration: 60, platform: 'Zoom', meetingLink: '', description: '', recordingUrl: '' });
  };

  const notifyLive = (lc) => {
    const targets = lc.courseId
      ? enrollments.filter((e) => e.courseId === lc.courseId && e.status !== 'removed')
      : enrollments.filter((e) => e.status !== 'removed');
    const unique = [...new Set(targets.map((e) => e.userId))];
    unique.forEach((uid) => sendNotificationToUser(uid, {
      title: `🔴 Live class: ${lc.title}`,
      message: `Join us ${lc.date} at ${lc.time} on ${lc.platform}. Open your course to join.`,
      type: 'live_class', courseId: lc.courseId,
    }));
    toast.success(`Notified ${unique.length} student(s)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="font-bold text-xl flex items-center gap-2"><MessagesSquare className="h-5 w-5 text-amber-300" /> Community & Live</h2>
        <div className="flex gap-2">
          {[{ id: 'discussions', label: `Discussions (${posts.length})`, icon: MessagesSquare }, { id: 'live', label: `Live Classes (${liveClasses.length})`, icon: Radio }, { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${tab === t.id ? 'bg-white text-black' : 'glass text-white/60'}`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'discussions' && (
        <div className="space-y-4">
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="h-10 rounded-full glass px-4 text-sm">
            <option className="bg-[#061236]" value="">All courses</option>
            {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title.slice(0, 40)}</option>)}
          </select>
          {filteredPosts.length === 0 && <div className="glass rounded-2xl p-10 text-center text-sm text-white/40">No discussions yet.</div>}
          {filteredPosts.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">{p.pinned && <Pin className="h-3.5 w-3.5 text-amber-300" />} {p.title}</div>
                  <div className="text-xs text-white/40 mt-1">{p.authorName} • {courseName(p.courseId)} • {getPostComments(p.id).length} replies • {new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setViewPost(p)} className="h-8 px-3 rounded-full glass text-[11px] font-bold flex items-center gap-1"><Eye className="h-3 w-3" /> VIEW</button>
                  <button onClick={() => { togglePinPost(p.id, user); toast.success(p.pinned ? 'Unpinned' : 'Pinned 📌'); }} className="h-8 px-3 rounded-full glass text-[11px] font-bold">{p.pinned ? 'UNPIN' : 'PIN'}</button>
                  <button onClick={() => { if (confirm('Delete this discussion and all replies?')) { deletePost(p.id, user); toast.success('Deleted'); } }} className="h-8 px-3 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'live' && (
        <div className="space-y-4">
          <button onClick={() => setShowLive(true)} className="btn-primary !py-2.5 text-xs gap-2"><Plus className="h-4 w-4" /> SCHEDULE LIVE CLASS</button>
          {liveClasses.length === 0 && <div className="glass rounded-2xl p-10 text-center text-sm text-white/40">No live classes scheduled.</div>}
          {liveClasses.map((lc) => (
            <div key={lc.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="font-bold flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> {lc.title}</div>
                  <div className="text-xs text-white/50 mt-1">{courseName(lc.courseId)} • 📅 {lc.date} {lc.time} • {lc.duration} mins • {lc.platform}</div>
                  <div className="text-xs mt-1"><a href={lc.meetingLink} target="_blank" rel="noreferrer" className="text-cyan-300 underline">Meeting link</a> {lc.recordingUrl && <span className="text-white/40"> • 🎥 Recording added</span>}</div>
                </div>
                <div className="flex gap-1.5 items-start">
                  <button onClick={() => notifyLive(lc)} title="Notify enrolled students" className="h-8 px-3 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center gap-1"><Bell className="h-3 w-3" /> NOTIFY</button>
                  <button onClick={() => startEditLive(lc)} className="h-8 px-3 rounded-full glass text-[11px] font-bold">EDIT</button>
                  <button onClick={() => { if (confirm('Delete this live class?')) { deleteLiveClass(lc.id, user); toast.success('Deleted'); } }} className="h-8 px-3 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}

          {showLive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <div className="w-full max-w-[560px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><Video className="h-5 w-5 text-red-400" /> {editingLive ? 'Edit' : 'Schedule'} Live Class</h3><button onClick={() => { setShowLive(false); setEditingLive(null); }}><X className="h-5 w-5" /></button></div>
                <input value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} placeholder="Class title" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <select value={liveForm.courseId} onChange={(e) => setLiveForm({ ...liveForm, courseId: e.target.value })} className="w-full h-11 rounded-full glass px-4 text-sm">
                  <option className="bg-[#061236]" value="">All students (general session)</option>
                  {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input type="date" value={liveForm.date} onChange={(e) => setLiveForm({ ...liveForm, date: e.target.value })} className="h-11 rounded-full glass px-4 text-sm" />
                  <input type="time" value={liveForm.time} onChange={(e) => setLiveForm({ ...liveForm, time: e.target.value })} className="h-11 rounded-full glass px-4 text-sm" />
                  <input type="number" min="15" value={liveForm.duration} onChange={(e) => setLiveForm({ ...liveForm, duration: e.target.value })} placeholder="Mins" className="h-11 rounded-full glass px-4 text-sm" />
                </div>
                <select value={liveForm.platform} onChange={(e) => setLiveForm({ ...liveForm, platform: e.target.value })} className="w-full h-11 rounded-full glass px-4 text-sm">
                  {['Zoom', 'Google Meet', 'Microsoft Teams', 'YouTube Live', 'WhatsApp', 'Other'].map((p) => <option className="bg-[#061236]" key={p}>{p}</option>)}
                </select>
                <input value={liveForm.meetingLink} onChange={(e) => setLiveForm({ ...liveForm, meetingLink: e.target.value })} placeholder="Meeting link (https://...)" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <input value={liveForm.recordingUrl} onChange={(e) => setLiveForm({ ...liveForm, recordingUrl: e.target.value })} placeholder="Recording URL (add after class)" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <textarea value={liveForm.description} onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })} placeholder="What will you cover?" className="w-full rounded-2xl glass p-4 text-sm h-20" />
                <button onClick={saveLive} className="w-full btn-primary !py-3">{editingLive ? 'SAVE CHANGES' : 'SCHEDULE CLASS 🔴'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 && <div className="glass rounded-2xl p-10 text-center text-sm text-white/40">No reviews yet.</div>}
          {reviews.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-bold text-sm">{'⭐'.repeat(r.rating)} <span className="text-white/50 font-normal">by {r.studentName}</span></div>
                  <div className="text-xs text-white/40 mt-0.5">{courseName(r.courseId)} • {new Date(r.createdAt).toLocaleString()} • <span className={`font-bold ${r.status === 'published' ? 'text-green-300' : 'text-amber-300'}`}>{r.status.toUpperCase()}</span></div>
                  <p className="text-sm text-white/70 mt-1">{r.text}</p>
                </div>
                <div className="flex gap-1.5 items-start">
                  <button onClick={() => { moderateReview(r.id, r.status === 'published' ? 'hidden' : 'published', user); toast.success('Updated'); }} className="h-8 px-3 rounded-full glass text-[11px] font-bold">{r.status === 'published' ? 'HIDE' : 'SHOW'}</button>
                  <button onClick={() => { if (confirm('Delete review?')) { deleteReview(r.id, user); toast.success('Deleted'); } }} className="h-8 px-3 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-[640px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-start"><h3 className="font-bold text-lg">{viewPost.title}</h3><button onClick={() => setViewPost(null)}><X className="h-5 w-5" /></button></div>
            <div className="text-xs text-white/40">{viewPost.authorName} • {courseName(viewPost.courseId)}</div>
            <p className="text-sm text-white/75 whitespace-pre-line">{viewPost.body}</p>
            <div className="space-y-2">
              {getPostComments(viewPost.id).map((c) => (
                <div key={c.id} className="rounded-xl bg-white/[0.04] p-3 text-sm flex justify-between gap-2">
                  <div><span className="font-bold text-xs">{c.authorName}</span> {c.isAdmin && <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-[10px] font-bold">INSTRUCTOR</span>}<div className="text-white/75">{c.body}</div></div>
                  <button onClick={() => { deleteComment(c.id, user); toast.success('Reply deleted'); }} className="text-red-300/60 hover:text-red-300 shrink-0"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply as instructor..." className="flex-1 h-11 rounded-full glass px-4 text-sm" />
              <button onClick={() => { if (!reply.trim()) return; addComment({ postId: viewPost.id, userId: user.id, authorName: user.fullName, body: reply, isAdmin: true }); setReply(''); toast.success('Replied ✓'); }} className="px-5 h-11 rounded-full bg-white text-black font-bold text-sm">REPLY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
