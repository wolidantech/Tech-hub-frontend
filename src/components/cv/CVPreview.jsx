// ============================================================
// CV PREVIEW — renders live CV data in 6 professional templates.
// Uses inline styles so screen preview and print output match
// exactly (print CSS in index.css handles the A4 page).
// ============================================================

export const CV_TEMPLATES = [
  { id: 'modern', name: 'Modern', category: 'Technology', accent: '#0891b2', desc: 'Cyan-accented sidebar look for tech & digital roles.' },
  { id: 'corporate', name: 'Corporate', category: 'Corporate', accent: '#1e3a8a', desc: 'Clean, formal layout for business & finance.' },
  { id: 'minimal', name: 'Minimal', category: 'Minimal', accent: '#111827', desc: 'Maximum whitespace, quiet elegance.' },
  { id: 'creative', name: 'Creative', category: 'Creative', accent: '#7c3aed', desc: 'Bold header for designers & creators.' },
  { id: 'executive', name: 'Executive', category: 'Executive', accent: '#0f172a', desc: 'Authoritative serif styling for senior roles.' },
  { id: 'academic', name: 'Academic', category: 'Academic', accent: '#166534', desc: 'Structured CV for education, research & healthcare.' },
];

const P = { fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1f2937' };
const SERIF = { fontFamily: "Georgia, 'Times New Roman', serif" };

const has = (arr) => Array.isArray(arr) && arr.some((x) => x && (typeof x === 'string' ? x.trim() : Object.values(x).some(Boolean)));
const contactLine = (p) => [p.email, p.phone, p.location].filter(Boolean).join('  •  ');
const linkLine = (p) => [p.linkedin, p.portfolio, p.github, p.website].filter(Boolean);

function SectionTitle({ children, accent, style }) {
  return (
    <h3 style={{ fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, color: accent, margin: '18px 0 8px', borderBottom: `1.5px solid ${accent}33`, paddingBottom: 4, ...style }}>
      {children}
    </h3>
  );
}

function Bullets({ items }) {
  const arr = (items || []).map((s) => String(s).trim()).filter(Boolean);
  if (!arr.length) return null;
  return <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 11.5, lineHeight: 1.55 }}>{arr.map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b.replace(/^[-•]\s*/, '')}</li>)}</ul>;
}

function ExperienceBlock({ experience, compact }) {
  if (!has(experience)) return null;
  return experience.filter((e) => e && (e.role || e.company)).map((e, i) => (
    <div key={i} style={{ marginBottom: compact ? 8 : 12, breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: 12.5 }}>{e.role || 'Role'}{e.company ? <span style={{ fontWeight: 400 }}> — {e.company}</span> : ''}</div>
        <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div>
      </div>
      {e.location && <div style={{ fontSize: 10.5, color: '#6b7280' }}>{e.location}</div>}
      {e.description && <p style={{ margin: '4px 0 0', fontSize: 11.5, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{e.description}</p>}
    </div>
  ));
}

function EducationBlock({ education }) {
  if (!has(education)) return null;
  return education.filter((e) => e && (e.degree || e.school)).map((e, i) => (
    <div key={i} style={{ marginBottom: 8, breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 600, fontSize: 12 }}>{e.degree}{e.school ? <span style={{ fontWeight: 400 }}> — {e.school}</span> : ''}</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{e.year}</div>
      </div>
      {e.details && <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{e.details}</div>}
    </div>
  ));
}

function SimpleRows({ items }) {
  const arr = (items || []).map((s) => String(s).trim()).filter(Boolean);
  if (!arr.length) return null;
  return <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, lineHeight: 1.6 }}>{arr.map((b, i) => <li key={i}>{b}</li>)}</ul>;
}

function ProjectsBlock({ projects }) {
  if (!has(projects)) return null;
  return projects.filter((p) => p && p.name).map((p, i) => (
    <div key={i} style={{ marginBottom: 7, breakInside: 'avoid' }}>
      <div style={{ fontWeight: 600, fontSize: 12 }}>{p.name}{p.link ? <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 10.5 }}> — {p.link}</span> : ''}</div>
      {p.description && <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>{p.description}</div>}
    </div>
  ));
}

function CertBlock({ certs }) {
  if (!has(certs)) return null;
  return certs.filter((c) => c && c.name).map((c, i) => (
    <div key={i} style={{ fontSize: 11.5, marginBottom: 3 }}>
      <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}
    </div>
  ));
}

function LangBlock({ languages }) {
  if (!has(languages)) return null;
  return <div style={{ fontSize: 11.5, lineHeight: 1.7 }}>{languages.filter((l) => l && l.name).map((l) => `${l.name}${l.level ? ` — ${l.level}` : ''}`).join('   •   ')}</div>;
}

function VolunteerBlock({ volunteer }) {
  if (!has(volunteer)) return null;
  return volunteer.filter((v) => v && (v.role || v.org)).map((v, i) => (
    <div key={i} style={{ marginBottom: 6 }}>
      <span style={{ fontWeight: 600, fontSize: 12 }}>{v.role}{v.org ? ` — ${v.org}` : ''}</span>
      {v.description && <div style={{ fontSize: 11.5 }}>{v.description}</div>}
    </div>
  ));
}

function RefsBlock({ references }) {
  if (!has(references)) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {references.filter((r) => r && r.name).map((r, i) => (
        <div key={i} style={{ fontSize: 11.5 }}>
          <div style={{ fontWeight: 600 }}>{r.name}</div>
          <div style={{ color: '#6b7280' }}>{r.role}</div>
          <div style={{ color: '#6b7280' }}>{r.contact}</div>
        </div>
      ))}
    </div>
  );
}

export default function CVPreview({ data, template = 'modern' }) {
  const p = data.personal || {};
  const name = p.fullName || 'Your Name';
  const title = p.title || 'Professional Title';
  const links = linkLine(p);

  // ---------- MODERN: cyan header band + two-column body ----------
  if (template === 'modern') {
    return (
      <div className="cv-page" style={{ ...P }}>
        <div style={{ background: '#083344', color: '#fff', padding: '26px 34px' }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: 0.5 }}>{name}</h1>
          <div style={{ fontSize: 13.5, color: '#67e8f9', fontWeight: 600, marginTop: 3 }}>{title}</div>
          <div style={{ fontSize: 10.5, color: '#bae6fd', marginTop: 8 }}>{contactLine(p)}</div>
          {links.length > 0 && <div style={{ fontSize: 10, color: '#a5f3fc', marginTop: 3, wordBreak: 'break-all' }}>{links.join('  •  ')}</div>}
        </div>
        <div style={{ padding: '20px 34px 30px' }}>
          {data.summary && <><SectionTitle accent="#0891b2">Professional Summary</SectionTitle><p style={{ margin: 0, fontSize: 12, lineHeight: 1.65 }}>{data.summary}</p></>}
          {has(data.experience) && <><SectionTitle accent="#0891b2">Work Experience</SectionTitle><ExperienceBlock experience={data.experience} /></>}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', minWidth: 240 }}>
              {has(data.education) && <><SectionTitle accent="#0891b2">Education</SectionTitle><EducationBlock education={data.education} /></>}
              {has(data.projects) && <><SectionTitle accent="#0891b2">Projects</SectionTitle><ProjectsBlock projects={data.projects} /></>}
              {has(data.volunteer) && <><SectionTitle accent="#0891b2">Volunteer Experience</SectionTitle><VolunteerBlock volunteer={data.volunteer} /></>}
            </div>
            <div style={{ flex: '1 1 220px', minWidth: 200 }}>
              {has(data.skills) && <><SectionTitle accent="#0891b2">Skills</SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{data.skills.map((s) => String(s).trim()).filter(Boolean).map((s, i) => (
                  <span key={i} style={{ fontSize: 10.5, background: '#ecfeff', border: '1px solid #a5f3fc', color: '#155e75', borderRadius: 20, padding: '2.5px 10px' }}>{s}</span>
                ))}</div></>}
              {has(data.certifications) && <><SectionTitle accent="#0891b2">Certifications</SectionTitle><CertBlock certs={data.certifications} /></>}
              {has(data.achievements) && <><SectionTitle accent="#0891b2">Achievements</SectionTitle><SimpleRows items={data.achievements} /></>}
              {has(data.languages) && <><SectionTitle accent="#0891b2">Languages</SectionTitle><LangBlock languages={data.languages} /></>}
            </div>
          </div>
          {has(data.references) && <><SectionTitle accent="#0891b2">References</SectionTitle><RefsBlock references={data.references} /></>}
        </div>
      </div>
    );
  }

  // ---------- CORPORATE: formal single column ----------
  if (template === 'corporate') {
    return (
      <div className="cv-page" style={{ ...P }}>
        <div style={{ padding: '30px 38px 26px', borderBottom: '3px double #1e3a8a', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, color: '#111827', letterSpacing: 2, textTransform: 'uppercase' }}>{name}</h1>
          <div style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 600, marginTop: 4 }}>{title}</div>
          <div style={{ fontSize: 10.5, color: '#4b5563', marginTop: 8 }}>{contactLine(p)}</div>
          {links.length > 0 && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, wordBreak: 'break-all' }}>{links.join('  |  ')}</div>}
        </div>
        <div style={{ padding: '16px 38px 30px' }}>
          {data.summary && <><SectionTitle accent="#1e3a8a">Profile</SectionTitle><p style={{ margin: 0, fontSize: 12, lineHeight: 1.65 }}>{data.summary}</p></>}
          {has(data.experience) && <><SectionTitle accent="#1e3a8a">Professional Experience</SectionTitle><ExperienceBlock experience={data.experience} /></>}
          {has(data.education) && <><SectionTitle accent="#1e3a8a">Education</SectionTitle><EducationBlock education={data.education} /></>}
          {has(data.skills) && <><SectionTitle accent="#1e3a8a">Core Skills</SectionTitle><p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7 }}>{data.skills.map((s) => String(s).trim()).filter(Boolean).join('  •  ')}</p></>}
          {has(data.certifications) && <><SectionTitle accent="#1e3a8a">Certifications</SectionTitle><CertBlock certs={data.certifications} /></>}
          {has(data.projects) && <><SectionTitle accent="#1e3a8a">Key Projects</SectionTitle><ProjectsBlock projects={data.projects} /></>}
          {has(data.achievements) && <><SectionTitle accent="#1e3a8a">Achievements</SectionTitle><SimpleRows items={data.achievements} /></>}
          {has(data.languages) && <><SectionTitle accent="#1e3a8a">Languages</SectionTitle><LangBlock languages={data.languages} /></>}
          {has(data.volunteer) && <><SectionTitle accent="#1e3a8a">Volunteer Experience</SectionTitle><VolunteerBlock volunteer={data.volunteer} /></>}
          {has(data.references) && <><SectionTitle accent="#1e3a8a">References</SectionTitle><RefsBlock references={data.references} /></>}
        </div>
      </div>
    );
  }

  // ---------- MINIMAL: quiet, type-driven ----------
  if (template === 'minimal') {
    return (
      <div className="cv-page" style={{ ...P, color: '#111827' }}>
        <div style={{ padding: '36px 44px 24px' }}>
          <h1 style={{ margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: -0.5 }}>{name}</h1>
          <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{title}</div>
          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 10 }}>{contactLine(p)}{links.length ? `  •  ${links.join('  •  ')}` : ''}</div>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0 0' }} />
        </div>
        <div style={{ padding: '0 44px 34px' }}>
          {data.summary && <p style={{ fontSize: 12, lineHeight: 1.7, color: '#374151' }}>{data.summary}</p>}
          {has(data.experience) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Experience</SectionTitle><ExperienceBlock experience={data.experience} /></>}
          {has(data.education) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Education</SectionTitle><EducationBlock education={data.education} /></>}
          {has(data.skills) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Skills</SectionTitle><p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.8 }}>{data.skills.map((s) => String(s).trim()).filter(Boolean).join(', ')}</p></>}
          {has(data.projects) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Projects</SectionTitle><ProjectsBlock projects={data.projects} /></>}
          {has(data.certifications) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Certifications</SectionTitle><CertBlock certs={data.certifications} /></>}
          {has(data.achievements) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Achievements</SectionTitle><SimpleRows items={data.achievements} /></>}
          {has(data.languages) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Languages</SectionTitle><LangBlock languages={data.languages} /></>}
          {has(data.volunteer) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>Volunteering</SectionTitle><VolunteerBlock volunteer={data.volunteer} /></>}
          {has(data.references) && <><SectionTitle accent="#111827" style={{ borderBottom: 'none', marginBottom: 4 }}>References</SectionTitle><RefsBlock references={data.references} /></>}
        </div>
      </div>
    );
  }

  // ---------- CREATIVE: bold gradient header + accent chips ----------
  if (template === 'creative') {
    return (
      <div className="cv-page" style={{ ...P }}>
        <div style={{ background: 'linear-gradient(120deg,#4c1d95,#7c3aed 55%,#06b6d4)', color: '#fff', padding: '30px 38px' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{name}</h1>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3, color: '#e9d5ff' }}>{title}</div>
          <div style={{ fontSize: 10.5, color: '#ede9fe', marginTop: 10 }}>{contactLine(p)}</div>
          {links.length > 0 && <div style={{ fontSize: 10, color: '#ddd6fe', marginTop: 3, wordBreak: 'break-all' }}>{links.join('  •  ')}</div>}
        </div>
        <div style={{ padding: '20px 38px 30px' }}>
          {data.summary && <p style={{ margin: '0 0 4px', fontSize: 12, lineHeight: 1.65, background: '#faf5ff', borderLeft: '3px solid #7c3aed', padding: '10px 14px', borderRadius: 4 }}>{data.summary}</p>}
          {has(data.skills) && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 2px' }}>{data.skills.map((s) => String(s).trim()).filter(Boolean).map((s, i) => (
            <span key={i} style={{ fontSize: 10.5, background: '#7c3aed', color: '#fff', borderRadius: 20, padding: '3px 12px' }}>{s}</span>
          ))}</div>}
          {has(data.experience) && <><SectionTitle accent="#7c3aed">Experience</SectionTitle><ExperienceBlock experience={data.experience} /></>}
          {has(data.projects) && <><SectionTitle accent="#7c3aed">Projects</SectionTitle><ProjectsBlock projects={data.projects} /></>}
          {has(data.education) && <><SectionTitle accent="#7c3aed">Education</SectionTitle><EducationBlock education={data.education} /></>}
          {has(data.certifications) && <><SectionTitle accent="#7c3aed">Certifications</SectionTitle><CertBlock certs={data.certifications} /></>}
          {has(data.achievements) && <><SectionTitle accent="#7c3aed">Achievements</SectionTitle><SimpleRows items={data.achievements} /></>}
          {has(data.languages) && <><SectionTitle accent="#7c3aed">Languages</SectionTitle><LangBlock languages={data.languages} /></>}
          {has(data.volunteer) && <><SectionTitle accent="#7c3aed">Volunteering</SectionTitle><VolunteerBlock volunteer={data.volunteer} /></>}
          {has(data.references) && <><SectionTitle accent="#7c3aed">References</SectionTitle><RefsBlock references={data.references} /></>}
        </div>
      </div>
    );
  }

  // ---------- EXECUTIVE: serif authority, left rule ----------
  if (template === 'executive') {
    return (
      <div className="cv-page" style={{ ...SERIF, color: '#111827' }}>
        <div style={{ padding: '34px 42px 22px', borderBottom: '2px solid #0f172a' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{name}</h1>
          <div style={{ fontSize: 14, fontStyle: 'italic', color: '#334155', marginTop: 3 }}>{title}</div>
          <div style={{ fontSize: 10.5, color: '#475569', marginTop: 10, fontFamily: P.fontFamily }}>{contactLine(p)}{links.length ? `  |  ${links.join('  |  ')}` : ''}</div>
        </div>
        <div style={{ padding: '14px 42px 32px' }}>
          {data.summary && <p style={{ fontSize: 12.5, lineHeight: 1.7, fontStyle: 'italic', color: '#1f2937' }}>{data.summary}</p>}
          {has(data.experience) && <><SectionTitle accent="#0f172a">Executive Experience</SectionTitle><div style={{ fontFamily: P.fontFamily }}><ExperienceBlock experience={data.experience} /></div></>}
          {has(data.education) && <><SectionTitle accent="#0f172a">Education</SectionTitle><div style={{ fontFamily: P.fontFamily }}><EducationBlock education={data.education} /></div></>}
          {has(data.skills) && <><SectionTitle accent="#0f172a">Areas of Expertise</SectionTitle><p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.8, fontFamily: P.fontFamily }}>{data.skills.map((s) => String(s).trim()).filter(Boolean).join('  •  ')}</p></>}
          {has(data.achievements) && <><SectionTitle accent="#0f172a">Key Achievements</SectionTitle><div style={{ fontFamily: P.fontFamily }}><SimpleRows items={data.achievements} /></div></>}
          {has(data.certifications) && <><SectionTitle accent="#0f172a">Certifications</SectionTitle><div style={{ fontFamily: P.fontFamily }}><CertBlock certs={data.certifications} /></div></>}
          {has(data.projects) && <><SectionTitle accent="#0f172a">Selected Projects</SectionTitle><div style={{ fontFamily: P.fontFamily }}><ProjectsBlock projects={data.projects} /></div></>}
          {has(data.languages) && <><SectionTitle accent="#0f172a">Languages</SectionTitle><div style={{ fontFamily: P.fontFamily }}><LangBlock languages={data.languages} /></div></>}
          {has(data.volunteer) && <><SectionTitle accent="#0f172a">Community Leadership</SectionTitle><div style={{ fontFamily: P.fontFamily }}><VolunteerBlock volunteer={data.volunteer} /></div></>}
          {has(data.references) && <><SectionTitle accent="#0f172a">References</SectionTitle><div style={{ fontFamily: P.fontFamily }}><RefsBlock references={data.references} /></div></>}
        </div>
      </div>
    );
  }

  // ---------- ACADEMIC: structured, education first ----------
  return (
    <div className="cv-page" style={{ ...P }}>
      <div style={{ padding: '28px 40px 20px', borderBottom: '3px solid #166534' }}>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, color: '#14532d' }}>{name}</h1>
        <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginTop: 3 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: '#4b5563', marginTop: 8 }}>{contactLine(p)}</div>
        {links.length > 0 && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, wordBreak: 'break-all' }}>{links.join('  •  ')}</div>}
      </div>
      <div style={{ padding: '14px 40px 30px' }}>
        {data.summary && <><SectionTitle accent="#166534">Profile</SectionTitle><p style={{ margin: 0, fontSize: 12, lineHeight: 1.65 }}>{data.summary}</p></>}
        {has(data.education) && <><SectionTitle accent="#166534">Education & Qualifications</SectionTitle><EducationBlock education={data.education} /></>}
        {has(data.certifications) && <><SectionTitle accent="#166534">Certifications</SectionTitle><CertBlock certs={data.certifications} /></>}
        {has(data.experience) && <><SectionTitle accent="#166534">Professional Experience</SectionTitle><ExperienceBlock experience={data.experience} /></>}
        {has(data.projects) && <><SectionTitle accent="#166534">Research & Projects</SectionTitle><ProjectsBlock projects={data.projects} /></>}
        {has(data.skills) && <><SectionTitle accent="#166534">Skills</SectionTitle><p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7 }}>{data.skills.map((s) => String(s).trim()).filter(Boolean).join('  •  ')}</p></>}
        {has(data.achievements) && <><SectionTitle accent="#166534">Honors & Achievements</SectionTitle><SimpleRows items={data.achievements} /></>}
        {has(data.languages) && <><SectionTitle accent="#166534">Languages</SectionTitle><LangBlock languages={data.languages} /></>}
        {has(data.volunteer) && <><SectionTitle accent="#166534">Service & Volunteering</SectionTitle><VolunteerBlock volunteer={data.volunteer} /></>}
        {has(data.references) && <><SectionTitle accent="#166534">References</SectionTitle><RefsBlock references={data.references} /></>}
      </div>
    </div>
  );
}
