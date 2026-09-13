// ============================================================
// GLOBAL SKILLS LIBRARY — scalable subject taxonomy.
// Each area lists legitimate disciplines with search keywords and
// (where we teach them today) the course category they map to.
// Areas without published courses render an honest "coming soon /
// request this subject" state — never fake catalog entries.
// ============================================================

export const SKILL_AREAS = [
  {
    area: 'Artificial Intelligence & Data',
    icon: '🤖',
    subjects: [
      { name: 'AI & Content Creation', keywords: ['ai', 'artificial intelligence', 'runway', 'elevenlabs', 'chatgpt', 'prompt'], category: 'AI & Technology' },
      { name: 'Machine Learning', keywords: ['machine learning', 'ml', 'models', 'training', 'python'], category: null },
      { name: 'Deep Learning', keywords: ['deep learning', 'neural networks', 'tensorflow', 'pytorch'], category: null },
      { name: 'Data Science & Analytics', keywords: ['data science', 'data analytics', 'statistics', 'analysis', 'python'], category: 'Microsoft Office' },
      { name: 'Data Visualization', keywords: ['data visualization', 'charts', 'dashboards', 'power bi', 'tableau'], category: null },
    ],
  },
  {
    area: 'Software & Computing',
    icon: '💻',
    subjects: [
      { name: 'Web Development', keywords: ['html', 'css', 'javascript', 'react', 'frontend', 'web'], category: 'Web Development' },
      { name: 'Mobile Development', keywords: ['mobile', 'android', 'ios', 'flutter', 'dart', 'apps'], category: 'Mobile Development' },
      { name: 'Game Development', keywords: ['games', 'unity', 'unreal', 'gamedev'], category: null },
      { name: 'Cybersecurity & Ethical Hacking', keywords: ['security', 'hacking', 'pentest', 'network security'], category: null },
      { name: 'Cloud & DevOps', keywords: ['cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes'], category: null },
      { name: 'Databases', keywords: ['sql', 'databases', 'postgres', 'mysql', 'mongodb'], category: null },
      { name: 'Networking', keywords: ['networking', 'cisco', 'tcp/ip', 'routers'], category: null },
      { name: 'Blockchain & Web3', keywords: ['blockchain', 'web3', 'crypto', 'smart contracts', 'solidity'], category: null },
      { name: 'IoT & Embedded', keywords: ['iot', 'embedded', 'arduino', 'raspberry pi', 'robotics'], category: null },
      { name: 'AR/VR & 3D', keywords: ['ar', 'vr', '3d', 'blender', 'metaverse'], category: null },
      { name: 'Quantum Computing', keywords: ['quantum', 'qubits'], category: null },
    ],
  },
  {
    area: 'Design & Creative',
    icon: '🎨',
    subjects: [
      { name: 'Graphic Design', keywords: ['graphic design', 'canva', 'photoshop', 'illustrator', 'branding'], category: 'Design' },
      { name: 'UI/UX Design', keywords: ['ui', 'ux', 'figma', 'wireframe', 'prototype', 'user experience'], category: 'Design' },
      { name: 'Video Editing & Motion', keywords: ['video editing', 'capcut', 'premiere', 'motion graphics', 'after effects'], category: 'Video & Media' },
      { name: 'Animation & 3D', keywords: ['animation', '3d', 'blender', 'cartoon'], category: null },
      { name: 'Fashion & Beauty Design', keywords: ['fashion', 'beauty', 'styling', 'makeup'], category: null },
    ],
  },
  {
    area: 'Marketing & Business',
    icon: '📈',
    subjects: [
      { name: 'Digital Marketing', keywords: ['marketing', 'social media', 'ads', 'funnels'], category: 'Marketing' },
      { name: 'SEO & Content', keywords: ['seo', 'content', 'copywriting', 'blogging'], category: 'Marketing' },
      { name: 'Entrepreneurship', keywords: ['entrepreneurship', 'startup', 'business', 'freelancing'], category: 'Design' },
      { name: 'Finance & Accounting', keywords: ['finance', 'accounting', 'bookkeeping', 'investing'], category: null },
      { name: 'Project Management', keywords: ['project management', 'agile', 'scrum', 'pmp'], category: null },
      { name: 'Leadership & Communication', keywords: ['leadership', 'communication', 'management', 'public speaking'], category: null },
      { name: 'Sales', keywords: ['sales', 'negotiation', 'crm', 'closing'], category: null },
      { name: 'Human Resources', keywords: ['hr', 'recruitment', 'talent', 'people'], category: null },
    ],
  },
  {
    area: 'Productivity & Career',
    icon: '📊',
    subjects: [
      { name: 'Microsoft Excel & Data', keywords: ['excel', 'spreadsheet', 'pivot', 'formulas'], category: 'Microsoft Office' },
      { name: 'Microsoft Word', keywords: ['word', 'documents', 'cv', 'reports'], category: 'Microsoft Office' },
      { name: 'Microsoft PowerPoint', keywords: ['powerpoint', 'presentations', 'slides', 'pitch'], category: 'Microsoft Office' },
      { name: 'Career & Portfolio', keywords: ['career', 'portfolio', 'cv', 'resume', 'freelance', 'interview'], category: 'Design' },
      { name: 'WordPress & CMS', keywords: ['wordpress', 'cms', 'woocommerce', 'elementor'], category: 'Web Development' },
    ],
  },
  {
    area: 'Science, Health & More',
    icon: '🔬',
    subjects: [
      { name: 'Medicine & Healthcare', keywords: ['medicine', 'nursing', 'healthcare', 'anatomy'], category: null },
      { name: 'Natural Sciences', keywords: ['physics', 'chemistry', 'biology', 'science'], category: null },
      { name: 'Mathematics & Statistics', keywords: ['math', 'mathematics', 'calculus', 'algebra', 'statistics'], category: null },
      { name: 'Languages', keywords: ['english', 'french', 'languages', 'spanish', 'arabic'], category: null },
      { name: 'Psychology', keywords: ['psychology', 'behaviour', 'mental health'], category: null },
      { name: 'Law', keywords: ['law', 'legal', 'contracts'], category: null },
      { name: 'Agriculture', keywords: ['agriculture', 'farming', 'agribusiness'], category: null },
      { name: 'Education & Teaching', keywords: ['education', 'teaching', 'pedagogy'], category: null },
    ],
  },
];

/** Find subjects whose keywords match a query (for global search). */
export function searchSubjects(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const out = [];
  SKILL_AREAS.forEach((area) => area.subjects.forEach((s) => {
    if (s.name.toLowerCase().includes(q) || s.keywords.some((k) => k.includes(q) || q.includes(k))) {
      out.push({ ...s, area: area.area, icon: area.icon });
    }
  }));
  return out.slice(0, 12);
}

/** Map a subject to live courses (by category) — honest: [] when none yet. */
export function coursesForSubject(subject, courses) {
  if (!subject?.category) return [];
  return courses.filter((c) => c.published !== false && !c.archived && c.category === subject.category);
}
