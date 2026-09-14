// Lesson resources — spec 7. Supports PDF / DOC(X) / PPT(X) / images /
// datasets / other files stored in Supabase Storage (signed, expiring URLs —
// never fabricated) plus curated external URLs and videos. Mobile-friendly:
// Open, Download, and Share via the device share sheet where available.
import { useState } from 'react';
import { FileText, BookOpen, Wrench, GraduationCap, Video, ExternalLink, Download, Share2, Loader2, FolderDown, Table2, Code2 } from 'lucide-react';
import { resourceSignedUrl } from '../../lib/store';
import { toast } from 'sonner';

const TYPE_META = {
  pdf: { Icon: FileText, label: 'PDF' },
  document: { Icon: FileText, label: 'DOC' },
  doc: { Icon: FileText, label: 'DOC' },
  docx: { Icon: FileText, label: 'DOCX' },
  ppt: { Icon: BookOpen, label: 'PPT' },
  pptx: { Icon: BookOpen, label: 'PPTX' },
  xls: { Icon: Table2, label: 'XLS' },
  xlsx: { Icon: Table2, label: 'XLSX' },
  dataset: { Icon: Table2, label: 'DATA' },
  image: { Icon: FileText, label: 'IMAGE' },
  photo: { Icon: FileText, label: 'IMAGE' },
  video: { Icon: Video, label: 'VIDEO' },
  article: { Icon: BookOpen, label: 'READ' },
  docs: { Icon: BookOpen, label: 'DOCS' },
  documentation: { Icon: BookOpen, label: 'DOCS' },
  book: { Icon: BookOpen, label: 'BOOK' },
  code: { Icon: Code2, label: 'CODE' },
  template: { Icon: FolderDown, label: 'TEMPLATE' },
  tool: { Icon: Wrench, label: 'TOOL' },
  website: { Icon: ExternalLink, label: 'LINK' },
  link: { Icon: ExternalLink, label: 'LINK' },
  url: { Icon: ExternalLink, label: 'LINK' },
  exercise: { Icon: Wrench, label: 'EXERCISE' },
  file: { Icon: FileText, label: 'FILE' },
};
const metaFor = (r) => TYPE_META[String(r.type || '').toLowerCase()] || TYPE_META.link;
const fmtSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function ResourceList({ resources = [], compact = false }) {
  const [busyId, setBusyId] = useState(null);

  const openStorage = async (r) => {
    setBusyId(r.id || r.title);
    try {
      const url = await resourceSignedUrl(r.storagePath);
      if (!url) { toast.error('This file is not available yet. Please try again later.'); return; }
      // Open in a new tab (works inside in-app browsers on Android/iOS too)
      const win = window.open(url, '_blank', 'noopener');
      if (!win) { window.location.href = url; }
    } catch {
      toast.error('Could not open the file — check your connection and retry.');
    } finally {
      setBusyId(null);
    }
  };

  const download = async (r) => {
    setBusyId(`dl-${r.id || r.title}`);
    try {
      const url = r.storagePath ? await resourceSignedUrl(r.storagePath) : r.url;
      if (!url) { toast.error('This file is not available yet.'); return; }
      const a = document.createElement('a');
      a.href = url;
      a.download = r.title ? `${r.title.replace(/[^\w\- ]+/g, '').trim() || 'resource'}` : 'resource';
      a.rel = 'noopener';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      // iOS Safari ignores `download` for cross-origin URLs: the tap opens
      // the file; users long-press → Share → Save to Files.
      toast.info('Saving… on iPhone: use Share → Save to Files if it opened instead.');
    } finally {
      setBusyId(null);
    }
  };

  const share = async (r, url) => {
    const target = url || r.url;
    if (!target) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: r.title || 'WOLI DAN TECH HUB resource', text: r.description || '', url: target });
      } else {
        await navigator.clipboard.writeText(target);
        toast.success('Link copied to clipboard');
      }
    } catch { /* user dismissed the share sheet */ }
  };

  if (!resources.length) {
    return (
      <div className="glass rounded-2xl p-5 text-sm text-white/45 flex items-center gap-3">
        <FolderDown className="h-5 w-5 text-white/25 shrink-0" />
        No extra resources for this lesson yet — the lesson itself is complete.
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'grid sm:grid-cols-2 gap-3'}>
      {resources.map((r, i) => {
        const { Icon, label } = metaFor(r);
        const sub = r.description || (r.size ? fmtSize(r.size) : '') || (r.url ? safeHost(r.url) : '') || (r.storagePath ? 'Saved in your course library' : '');
        const busyOpen = busyId === (r.id || r.title);
        const busyDl = busyId === `dl-${r.id || r.title}`;
        return (
          <div key={r.id || `${r.title}-${i}`} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{r.title || `Resource ${i + 1}`}</div>
              <div className="text-xs text-white/40 truncate">{sub || label}</div>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 shrink-0">{label}</span>
            <div className="flex items-center gap-1 shrink-0">
              {r.storagePath ? (
                <>
                  <button onClick={() => openStorage(r)} disabled={busyOpen} className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition" title="Open">
                    {busyOpen ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  </button>
                  <button onClick={() => download(r)} disabled={busyDl} className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition" title="Download">
                    {busyDl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </button>
                  <button onClick={() => share(r)} className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition" title="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                </>
              ) : r.url ? (
                <>
                  <button onClick={() => share(r)} className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition" title="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-full bg-white/10 text-xs font-bold hover:bg-white/20 transition flex items-center gap-1">
                    OPEN <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function safeHost(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
