import { useState } from 'react';
import { Megaphone, Send, Bell } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function NotificationManager() {
  const { user, students: roster } = useAuth();
  const { courses, allEnrollments, broadcastNotification, sendNotificationToUser } = useCourses();
  const { announcements, sendAnnouncement, audit } = useLMS();
  const [form, setForm] = useState({ title: '', message: '', courseId: '', targetEmail: '' });
  const [mode, setMode] = useState('broadcast'); // broadcast | course | single

  const students = roster.filter((u) => u.role !== 'admin' && !u.banned);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    try {
      if (mode === 'single') {
        const target = students.find((s) => s.email.toLowerCase() === form.targetEmail.toLowerCase());
        if (!target) {
          toast.error('Student email not found');
          return;
        }
        await sendNotificationToUser(target.id, { title: form.title, message: form.message, type: 'admin_message' });
        audit(user, 'notification.send', 'user', target.id, { title: form.title });
        toast.success(`Notification sent to ${target.fullName}`);
      } else {
        let ids = students.map((s) => s.id);
        let courseId = null;
        if (mode === 'course') {
          if (!form.courseId) {
            toast.error('Select a course');
            return;
          }
          courseId = form.courseId;
          const enrolledIds = new Set(allEnrollments.filter((e) => e.courseId === courseId && e.status !== 'removed').map((e) => e.userId));
          ids = students.filter((s) => enrolledIds.has(s.id)).map((s) => s.id);
        }
        await broadcastNotification(ids, { title: form.title, message: form.message, courseId });
        await sendAnnouncement({ title: form.title, message: form.message, courseId, actor: user });
        audit(user, 'announcement.send', 'announcement', mode, { title: form.title, recipients: ids.length });
        toast.success(`Announcement sent to ${ids.length} students 📣`);
      }
      setForm({ title: '', message: '', courseId: '', targetEmail: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-xl flex items-center gap-2"><Megaphone className="h-5 w-5 text-cyan-300" /> Notifications & Announcements</h2>
        <p className="text-sm text-white/50 mt-1">Send messages to students — they appear in the student dashboard.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-[20px] p-6 space-y-4">
          <div className="flex gap-2">
            {[{ id: 'broadcast', label: 'All Students' }, { id: 'course', label: 'By Course' }, { id: 'single', label: 'Single Student' }].map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className={`px-4 py-2 rounded-full text-xs font-bold ${mode === m.id ? 'bg-white text-black' : 'glass text-white/60'}`}>{m.label}</button>
            ))}
          </div>
          {mode === 'course' && (
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full h-11 rounded-full glass px-4 text-sm">
              <option className="bg-[#061236]" value="">Select course</option>
              {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
          {mode === 'single' && (
            <input value={form.targetEmail} onChange={(e) => setForm({ ...form, targetEmail: e.target.value })} placeholder="Student email address" className="w-full h-11 rounded-full glass px-4 text-sm" />
          )}
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g. New AI Course Released!)" className="w-full h-11 rounded-full glass px-4 text-sm" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message..." className="w-full rounded-2xl glass p-4 text-sm h-28" />
          <button onClick={handleSend} className="w-full btn-primary !py-3"><Send className="h-4 w-4 mr-2" /> SEND {mode === 'single' ? 'NOTIFICATION' : 'ANNOUNCEMENT'}</button>
          <div className="text-[11px] text-white/30">{students.length} students will receive broadcast announcements.</div>
        </div>

        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-amber-300" /> Recent Announcements ({announcements.length})</h3>
          <div className="space-y-3 max-h-[420px] overflow-auto">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="font-bold text-sm">{a.title}</div>
                <div className="text-xs text-white/60 mt-1">{a.message}</div>
                <div className="text-[10px] text-white/30 mt-2">{new Date(a.createdAt).toLocaleString()} {a.courseId ? `• course: ${a.courseId.slice(0, 20)}` : '• all students'}</div>
              </div>
            ))}
            {announcements.length === 0 && <div className="text-sm text-white/40 text-center py-8">No announcements yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
