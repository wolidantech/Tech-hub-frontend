// ============================================================
// DanTECH AI — official AI learning assistant of WOLI DAN TECH HUB
// ------------------------------------------------------------
// Secure architecture:
//   1. If VITE_DANTECH_ENDPOINT is set -> POST { message, context,
//      history } to YOUR backend (keys + RAG live server-side).
//   2. Else -> local lesson-aware engine (offline, zero-cost).
// The local engine retrieves from PUBLISHED course content only
// (mini-RAG over approved lessons) and enforces academic integrity.
// ============================================================

const ENDPOINT = import.meta.env?.VITE_DANTECH_ENDPOINT || '';
export const DANTECH_NAME = 'DanTECH AI';

export function isCloudDanTechEnabled() {
  return Boolean(ENDPOINT);
}

// ---------- Mini-RAG index over approved (published, non-archived) content ----------
export function buildCourseIndex(courses) {
  const docs = [];
  (courses || [])
    .filter((c) => c.published && !c.archived)
    .forEach((c) => {
      (c.curriculum || []).forEach((m, mi) => {
        (m.lessons || []).forEach((l, li) => {
          const text = [l.title, l.textContent || l.content || '', ...(l.subLessons || []).map((s) => `${s.title} ${s.textContent || ''}`)].join('\n');
          docs.push({
            courseId: c.id, courseTitle: c.title, category: c.category, level: c.level,
            moduleId: m.id, moduleTitle: m.title, moduleIndex: mi,
            lessonId: l.id, lessonTitle: l.title, lessonIndex: li,
            text: text.slice(0, 4000),
          });
        });
      });
    });
  return docs;
}

const STOP = new Set('the,a,an,to,of,and,in,is,are,was,were,be,been,for,on,with,that,this,it,as,at,by,from,or,me,my,i,you,your,please,explain,give,what,how,why,when,lesson,topic,course,like'.split(','));
function keywords(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}

export function retrieveDocs(index, query, context = {}, topK = 3) {
  const keys = keywords(query);
  if (!keys.length) return [];
  const scored = index.map((d) => {
    const hay = `${d.lessonTitle} ${d.moduleTitle} ${d.text}`.toLowerCase();
    let score = 0;
    keys.forEach((k) => { if (hay.includes(k)) score += 2; });
    // Prioritize: current lesson > current course > rest
    if (context.lessonId && d.lessonId === context.lessonId) score += 20;
    else if (context.courseId && d.courseId === context.courseId) score += 8;
    return { doc: d, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((x) => x.doc);
}

// ---------- Academic integrity guard ----------
const CHEAT_PATTERNS = [
  'do my assignment', 'do this assignment', 'complete my assignment', 'write my assignment',
  'give me the answer', 'give me answers', 'answers to the quiz', 'quiz answers',
  'do my project for me', 'write my project', 'complete my project for me',
  'write my essay', 'do my homework for me',
];
export function checkIntegrity(message) {
  const m = String(message || '').toLowerCase();
  if (CHEAT_PATTERNS.some((p) => m.includes(p))) {
    return `I can't do that one *for* you — real skills come from practice! 💪\n\nBut I CAN help you succeed:\n- Break the task into small steps\n- Explain the tricky concept\n- Review YOUR attempt and give feedback\n- Give hints and examples\n\nTell me which part you're stuck on, and let's work through it together.`;
  }
  return null;
}

// ---------- Intent detection ----------
function detectIntent(message) {
  const m = String(message || '').toLowerCase();
  if (/\b(test me|quiz me|practice questions|test my knowledge|give me \d+.*questions?)\b/.test(m)) return 'test';
  if (/\b(summar|summary|recap|tldr|tl;dr)\b/.test(m)) return 'summarize';
  if (/\b(flashcards?|flash cards?)\b/.test(m)) return 'flashcards';
  if (/\b(revision notes?|revise|study notes?)\b/.test(m)) return 'notes';
  if (/\b(example|examples|easier example|like i'm a beginner|like i am a beginner|eli5)\b/.test(m)) return 'example';
  if (/\b(exercise|practice|give me.*(task|work)|challenge me)\b/.test(m)) return 'practice';
  if (/\b(debug|error|not working|bug|fix my code|why.*(code|error))\b/.test(m) || /```/.test(m)) return 'debug';
  if (/\b(what.*(next|study)|recommend|what should i (learn|do)|next lesson)\b/.test(m)) return 'next';
  if (/\b(hi|hello|hey|good morning|good afternoon|who are you)\b/.test(m) && m.length < 40) return 'greet';
  return 'explain';
}

function sentences(text, n = 4) {
  const clean = String(text || '').replace(/[#*`>|]/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  return parts.slice(0, n);
}

function extractPhrases(text, n = 6) {
  // naive key-phrase extraction: capitalized + frequent terms from headings
  const heads = [...String(text || '').matchAll(/^#{1,4}\s*(.+)$/gm)].map((m) => m[1].trim());
  const words = keywords(text);
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
  return { heads: heads.slice(0, 5), top };
}

// ---------- Local reply generator ----------
export function generateLocalReply(message, { context = {}, index = [], course = null, lesson = null, nextLesson = null, progress = null } = {}) {
  const blocked = checkIntegrity(message);
  if (blocked) return { text: blocked, sources: [] };

  const intent = detectIntent(message);
  const docs = retrieveDocs(index, message, context, 3);
  const focus = docs[0] || (lesson ? { lessonTitle: lesson.title, text: lesson.textContent || lesson.content || '', courseTitle: course?.title } : null);
  const topic = focus?.lessonTitle || lesson?.title || course?.title || 'this topic';

  if (intent === 'greet') {
    return {
      text: `Hi! I'm ${DANTECH_NAME} 👋\n\nWhat would you like to learn today? I can **explain lessons**, **give examples**, **test you**, **help debug code**, or **summarize** anything you're studying${course ? ` in *${course.title}*` : ''}.\n\nTry one of the suggestions below!`,
      sources: [],
    };
  }

  if (intent === 'test') {
    const count = Math.min(10, Math.max(3, parseInt((message.match(/(\d+)/) || [])[1] || '5', 10)));
    const { heads, top } = extractPhrases(focus?.text || '');
    const qs = [];
    for (let i = 0; i < count; i++) {
      if (heads[i]) qs.push(`${i + 1}. In your own words, explain: **${heads[i]}**`);
      else if (top[i]) qs.push(`${i + 1}. What is **${top[i]}** and why does it matter in ${topic}?`);
      else qs.push(`${i + 1}. Describe one practical thing you can now do with **${topic}**.`);
    }
    return {
      text: `Let's test your knowledge on **${topic}**! 🧠\n\n${qs.join('\n')}\n\nReply with your answers (e.g. "1. ... 2. ...") and I'll mark them with feedback.`,
      sources: docs,
    };
  }

  if (intent === 'flashcards') {
    const { heads, top } = extractPhrases(focus?.text || '');
    const cards = [];
    heads.slice(0, 4).forEach((h, i) => cards.push(`**Card ${i + 1} — Front:** ${h}?\n**Back:** ${sentences(focus?.text || '', 6)[i] || `Key idea from ${topic}. Review the lesson and say it in your own words.`}`));
    top.slice(0, 3).forEach((t, i) => cards.push(`**Card ${heads.length + i + 1} — Front:** Define "${t}"\n**Back:** A key term in ${topic} — check the lesson and write your own definition.`));
    return { text: `Here are your flashcards for **${topic}** 🃏\n\n${cards.slice(0, 6).join('\n\n')}\n\nWant more? Ask me to *"test you"* when you're ready!`, sources: docs };
  }

  if (intent === 'notes') {
    const sents = sentences(focus?.text || '', 6);
    const { heads } = extractPhrases(focus?.text || '');
    return {
      text: `# 📝 Revision Notes: ${topic}\n\n## Key points\n${sents.map((s) => `- ${s}`).join('\n') || `- Review the lesson content for ${topic}`}\n\n## Remember\n${heads.map((h) => `- **${h}**`).join('\n') || '- Core concepts from the lesson'}\n\n> [!TIP] Re-read these before your quiz, then ask me to test you!`,
      sources: docs,
    };
  }

  if (intent === 'summarize') {
    const sents = sentences(focus?.text || '', 4);
    return {
      text: `## 📌 Summary: ${topic}\n\n${sents.map((s) => `- ${s}`).join('\n') || `This covers the essentials of ${topic}. Open the full lesson for details.`}\n\n**In one line:** ${topic} is about applying the core ideas step-by-step until you can produce real work.\n\nWant an **example**, **practice task**, or a **quick test** next?`,
      sources: docs,
    };
  }

  if (intent === 'example') {
    return {
      text: `## 💡 Example: ${topic}\n\nImagine you need to explain this to a friend who is a complete beginner:\n\n1. **The idea:** ${topic} solves a real problem — start with *why* it exists.\n2. **See it:** ${sentences(focus?.text || '', 2)[0] || 'Follow the worked demonstration in your lesson.'}\n3. **Do it:** Try a tiny version yourself right now — small wins build confidence.\n\n**Beginner-friendly takeaway:** Don't memorize — *do*. Open your tool and recreate one small piece from the lesson.\n\nWant a **practice exercise** on this? Just ask!`,
      sources: docs,
    };
  }

  if (intent === 'practice') {
    return {
      text: `## 🛠 Practice: ${topic}\n\nTry this exercise (15–20 mins):\n\n1. **Recreate** — Rebuild the main example from the lesson without looking.\n2. **Modify** — Change one thing (color, text, layout, value) and observe what happens.\n3. **Create** — Make one small original piece using the same technique.\n4. **Check** — Compare with the lesson's quality checklist.\n\nSave your work — it can go into your **portfolio**! 🌟\n\nStuck? Paste what you've tried and I'll give you a **hint** (not the answer 😉).`,
      sources: docs,
    };
  }

  if (intent === 'debug') {
    const hasCode = /```/.test(message);
    const openB = (message.match(/{/g) || []).length, closeB = (message.match(/}/g) || []).length;
    const openP = (message.match(/\(/g) || []).length, closeP = (message.match(/\)/g) || []).length;
    let hints = '';
    if (openB !== closeB) hints += `\n- ⚠️ I see **${openB}** \`{\` but **${closeB}** \`}\` — check for a missing/extra curly brace.`;
    if (openP !== closeP) hints += `\n- ⚠️ I see **${openP}** \`(\` but **${closeP}** \`)\` — check your parentheses.`;
    return {
      text: `## 🐛 Let's debug together\n\n${hasCode ? `I can see your code. Quick scan:${hints || '\n- ✅ Brackets look balanced at a glance.'}` : 'Paste your code in a code block like this:\n\n```\n// your code here\n```\n\nAnd tell me the **error message** you see.'}\n\n**Debug checklist:**\n1. Read the error message slowly — it usually names the line.\n2. Check spelling of names (code is case-sensitive!).\n3. Test small pieces one at a time.\n4. Explain your code to me line by line — I'll spot the issue with you.\n\nWhat error are you seeing?`,
      sources: docs,
    };
  }

  if (intent === 'next') {
    if (nextLesson) {
      return { text: `Based on your progress, study this next 👇\n\n**${nextLesson.moduleTitle ? `${nextLesson.moduleTitle} → ` : ''}${nextLesson.title}**\n\nYou're at **${progress?.progress ?? 0}%** in *${course?.title || 'your course'}* — keep the streak alive! 🔥`, sources: [] };
    }
    return { text: `Great question! Open your course and continue with the next unfinished lesson — your progress is saved automatically. 🎯\n\nIf you tell me which course you're in, I can point you precisely.`, sources: [] };
  }

  // Default: explain using retrieved course material
  const sents = sentences(focus?.text || '', 4);
  return {
    text: `## 📖 ${topic}\n\n${sents.map((s) => s).join(' ') || `Let's break **${topic}** down simply: focus on the core idea first, then the steps, then practice.`}\n\n**Simple version:** Think of it in 3 steps — *understand the idea → watch it done → do it yourself.*\n\n---\n${docs.length ? `📚 *Based on your course: ${docs.map((d) => `**${d.lessonTitle}**`).join(' • ')}*` : '📚 *General guidance — open the lesson for full details.*'}\n\nWant me to **give an example**, **summarize**, or **test you** on this?`,
    sources: docs,
  };
}

// ---------- Cloud call (secure backend) ----------
export async function askCloudDanTech(message, { context, history, signal } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, history: (history || []).slice(-12) }),
      signal: signal || ctrl.signal,
    });
    if (!res.ok) throw new Error(`DanTECH AI backend error (${res.status})`);
    const data = await res.json();
    return { text: data.reply || data.text || '...', sources: data.sources || [] };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Unified ask (cloud first, local fallback) ----------
export async function askDanTech(message, opts = {}) {
  const blocked = checkIntegrity(message);
  if (blocked) return { text: blocked, sources: [], provider: 'guardrail' };
  if (isCloudDanTechEnabled()) {
    try {
      const r = await askCloudDanTech(message, opts);
      return { ...r, provider: 'secure-backend' };
    } catch (err) {
      console.warn('[DanTECH AI] backend failed, using local engine:', err.message);
    }
  }
  return { ...generateLocalReply(message, opts), provider: 'local' };
}

export const SUGGESTED_PROMPTS = [
  'Explain this lesson',
  'Give me an example',
  'Test me',
  'Give me practice',
  'Summarize',
  'Help me understand',
];
