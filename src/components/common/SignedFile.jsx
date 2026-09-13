import { useEffect, useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { signedUrl, publicUrl } from '../../lib/supabase';

// Buckets flagged public in migrations (readable without auth).
const PUBLIC_BUCKETS = new Set(['avatars', 'thumbnails']);

/** Resolve a storage path to a viewable URL (public URL for public buckets, signed URL otherwise). */
export function useSignedUrl(bucket, path, expiresIn = 3600) {
  const [url, setUrl] = useState(() => (PUBLIC_BUCKETS.has(bucket) && path ? publicUrl(bucket, path) : null));
  const [loading, setLoading] = useState(Boolean(path) && !PUBLIC_BUCKETS.has(bucket));
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(null); setLoading(false); return; }
    if (PUBLIC_BUCKETS.has(bucket)) { setUrl(publicUrl(bucket, path)); setLoading(false); return; }
    setLoading(true);
    signedUrl(bucket, path, expiresIn).then((u) => {
      if (!alive) return;
      setUrl(u);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [bucket, path, expiresIn]);
  return { url, loading };
}

const isImage = (t, n) => (t || '').startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(n || '');
const isVideo = (t, n) => (t || '').startsWith('video/') || /\.(mp4|webm|mov)$/i.test(n || '');

/**
 * Displays a file stored in a private bucket (receipts, submissions).
 * kind: 'auto' | 'image' | 'video' | 'download'
 */
export default function SignedFile({ bucket, path, fileName, fileType, kind = 'auto', className = '', imgClassName = 'w-full h-auto max-h-[500px] object-contain' }) {
  const { url, loading } = useSignedUrl(bucket, path);
  const name = fileName || String(path || '').split('/').pop() || 'file';

  if (!path) return <div className="text-sm text-white/40">No file attached.</div>;
  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-2 p-8 text-white/50 text-sm ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" /> Loading file…
      </div>
    );
  }
  if (!url) return <div className="text-sm text-red-300">Could not load this file. It may have been removed.</div>;

  const showImage = kind === 'image' || (kind === 'auto' && isImage(fileType, name));
  const showVideo = kind === 'video' || (kind === 'auto' && isVideo(fileType, name));

  if (showImage) return <img src={url} alt={name} loading="lazy" className={imgClassName} />;
  if (showVideo) return <video src={url} controls className={`w-full max-h-[500px] rounded-xl ${className}`} />;

  return (
    <div className={`p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 ${className}`}>
      <FileText className="h-8 w-8 text-cyan-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{name}</div>
        <div className="text-xs text-white/40 mt-0.5">{(fileType || '').split('/').pop()?.toUpperCase() || 'FILE'}</div>
      </div>
      <a href={url} download={name} target="_blank" rel="noreferrer" className="inline-flex px-5 py-2 rounded-full bg-white text-black font-bold text-xs gap-2 shrink-0">
        <Download className="h-4 w-4" /> OPEN / DOWNLOAD
      </a>
    </div>
  );
}
