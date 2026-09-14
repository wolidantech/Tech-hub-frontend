import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Content stays in Supabase. GFM renders nested lists, code, links, images and
// tables without the former regex renderer corrupting fenced code examples.
export function lessonHtml(markdown) {
  const html = marked.parse(String(markdown || ''), { gfm: true, breaks: true, async: false });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['iframe', 'form', 'input', 'button', 'style', 'video', 'audio'],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: false,
  });
}

export default function LessonBody({ markdown }) {
  const html = useMemo(() => lessonHtml(markdown), [markdown]);
  return <div className="lesson-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
