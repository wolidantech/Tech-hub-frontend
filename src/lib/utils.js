export const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount).replace('NGN', '₦');
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getCourseThumbnailGradient = (thumb) => {
  const map = {
    ai: 'from-violet-600 via-indigo-600 to-blue-700',
    video: 'from-cyan-500 via-blue-600 to-indigo-700',
    design: 'from-fuchsia-500 via-purple-600 to-indigo-600',
    marketing: 'from-orange-500 via-pink-600 to-rose-600',
    mobile: 'from-emerald-500 via-teal-600 to-cyan-600',
    portfolio: 'from-slate-600 via-slate-700 to-slate-900',
    frontend: 'from-blue-600 via-cyan-500 to-teal-500',
    wordpress: 'from-sky-600 via-blue-700 to-indigo-800',
    figma: 'from-purple-600 via-pink-600 to-orange-500',
    excel: 'from-green-600 via-emerald-700 to-teal-700',
    word: 'from-blue-700 via-indigo-800 to-violet-800',
    powerpoint: 'from-orange-600 via-red-600 to-pink-600',
  };
  return map[thumb] || 'from-cyan-500 to-blue-600';
};

export const truncate = (str, n) => str.length > n ? str.slice(0, n) + '...' : str;

/**
 * Copy text to the clipboard in a way that works on Android and iOS.
 *
 * navigator.clipboard is only exposed in a secure context and only while the
 * document is focused, so it is `undefined` or throws on http:// previews,
 * inside WebViews (Instagram/WhatsApp/TikTok in-app browsers, which is where
 * course links actually get shared) and after a file picker closes. A
 * textarea + execCommand fallback still works there, and this never rejects —
 * callers get a boolean and can keep their success toast honest.
 */
export const copyText = async (text) => {
  const value = String(text ?? '');
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    // Keep it out of the layout: an off-screen box can still scroll the page on iOS.
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;background:transparent;';
    document.body.appendChild(ta);
    const active = document.activeElement;
    ta.setSelectionRange(0, value.length); // full selection is what iOS copies
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (active && typeof active.focus === 'function') active.focus({ preventScroll: true });
    return ok;
  } catch {
    return false;
  }
};

/**
 * Share a link the way a phone expects, then degrade to a copy.
 *
 * `navigator.share` exists on Android Chrome and iOS Safari (and is what puts
 * WhatsApp / Instagram / Messages into the flow when a student shares their
 * certificate or portfolio). Desktop browsers mostly do not implement it, so a
 * copy is the fallback rather than a dead button. Returns:
 *   'shared' | 'copied' | 'dismissed' | 'failed'
 */
export const shareOrCopy = async ({ title = '', text = '', url = '' } = {}) => {
  const payload = { title, text, url };
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function'
      && (!navigator.canShare || navigator.canShare(payload))) {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'dismissed'; // the sheet was closed
    }
  }
  return (await copyText(url || text || title)) ? 'copied' : 'failed';
};
