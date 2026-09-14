import { useState } from 'react';
import { Download, ExternalLink, Share2, FileText } from 'lucide-react';

export function resourceUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function Resource({ resource }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const url = resourceUrl(resource.url);
  const title = resource.title || resource.name || 'Untitled resource';
  const download = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = resource.name || new URL(url).pathname.split('/').pop() || title;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch {
      setError('This host could not provide a download. Retry, or use Open and save the file from your browser.');
    } finally { setBusy(false); }
  };
  const share = async () => {
    try { await navigator.share({ title, url }); }
    catch (err) { if (err.name !== 'AbortError') setError('Sharing failed. Use Open to access this resource.'); }
  };
  return <article className="glass rounded-xl p-4 min-w-0 space-y-3">
    <div className="flex gap-3"><FileText className="h-5 w-5 shrink-0 text-cyan-300" /><div className="min-w-0">
      <h4 className="font-bold break-words">{title}</h4>
      <p className="text-xs uppercase text-cyan-300">{resource.type || 'Resource'}</p>
      {resource.description && <p className="text-sm text-white/60">{resource.description}</p>}
    </div></div>
    {url ? <div className="flex flex-wrap gap-3 text-sm">
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 p-2 rounded-lg glass"><ExternalLink size={16} /> Open</a>
      <button disabled={busy} onClick={download} className="inline-flex items-center gap-1 p-2 rounded-lg glass disabled:opacity-50"><Download size={16} />{busy ? 'Downloading…' : error ? 'Retry download' : 'Download'}</button>
      {typeof navigator.share === 'function' && <button onClick={share} className="inline-flex items-center gap-1 p-2 rounded-lg glass"><Share2 size={16} /> Share</button>}
    </div> : <p role="status" className="text-sm text-amber-200">Resource has no valid URL. Contact your instructor.</p>}
    {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
  </article>;
}

export default function LessonResources({ resources = [] }) {
  if (!Array.isArray(resources) || !resources.length) return null;
  return <section aria-label="Lesson resources" className="glass rounded-2xl p-4 sm:p-6 space-y-3">
    <h3 className="font-bold">PDFs & resources</h3>
    <div className="grid sm:grid-cols-2 gap-3">{resources.filter(Boolean).map((resource, index) => <Resource key={`${resource.url || ''}-${index}`} resource={resource} />)}</div>
  </section>;
}
