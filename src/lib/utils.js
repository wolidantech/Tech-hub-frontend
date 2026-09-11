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
