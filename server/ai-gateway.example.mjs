// ============================================================
// WOLI DAN TECH HUB — Secure AI Gateway (REFERENCE IMPLEMENTATION)
// ------------------------------------------------------------
// Deploy this on YOUR server (Node 18+, e.g. VPS / Render / Fly).
// The frontend POSTs to this endpoint (VITE_AI_ENDPOINT); API keys
// live ONLY here as environment secrets — NEVER in frontend code.
//
//   npm i express cors dotenv openai
//   AI_PROVIDER=openai OPENAI_API_KEY=sk-... ADMIN_TOKEN=... node ai-gateway.example.mjs
//
// Swap providers by replacing callLLM() (Anthropic/Gemini/local).
// Video/voice generation plugs in as async jobs (same response shape).
// ============================================================
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean) }));
app.use(express.json({ limit: '256kb' }));

// ---- Minimal auth: shared admin token (use Supabase JWT verify in prod) ----
function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// ---- Student identity: verify the Supabase access token the site sends ----
// The frontend attaches `Authorization: Bearer <supabase access token>` to every
// AI request (aiAuthHeaders() in src/lib/supabase.js) for two reasons: rate
// limiting has to be per person (an IP is shared by a whole campus WiFi), and
// `context.courseId` must be checked against a real enrolment instead of trusted.
//
// Verification without extra dependencies: ask Supabase who this token belongs to.
// Results are cached ~60s because tokens are reused across a chat session and a
// round trip per message adds latency the student would feel.
const AUTH_CACHE = new Map(); // token -> { at, student }
const AUTH_TTL_MS = 60000;

async function studentFromToken(req) {
  const raw = (req.headers.authorization || '').trim();
  const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
  if (!token) return null;
  const hit = AUTH_CACHE.get(token);
  if (hit && Date.now() - hit.at < AUTH_TTL_MS) return hit.student;
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    // No Supabase configured here: accept the request but say so, so a dev run
    // never pretends to be authenticated.
    if (!studentFromToken.warned) {
      studentFromToken.warned = true;
      console.warn('[auth] SUPABASE_URL / key not set — student tokens are NOT verified');
    }
    return { id: 'anonymous', unverified: true };
  }
  try {
    const res = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: key } });
    if (!res.ok) return null;
    const user = await res.json();
    const student = user?.id ? { id: user.id, email: user.email || null, role: user.role || null } : null;
    if (student) AUTH_CACHE.set(token, { at: Date.now(), student });
    return student;
  } catch (err) {
    console.error('[auth] token check failed:', err.message);
    return null;
  }
}

function requireStudent(req, res, next) {
  studentFromToken(req).then((student) => {
    if (student === null) return res.status(401).json({ error: 'sign in again', hint: 'access token rejected by Supabase' });
    req.student = student;
    next();
  }).catch(() => res.status(500).json({ error: 'auth unavailable' }));
}

// Enrolment gate for lesson context: the browser says "lesson 42", but only the
// server may decide whether this student may read it. Returns null when Supabase
// creds are absent (dev) so the gateway still works locally.
async function assertEnrolled(student, courseId) {
  if (!courseId || student?.unverified || !process.env.SUPABASE_URL) return null;
  const url = process.env.SUPABASE_URL.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  try {
    const q = `enrollments?select=id&user_id=eq.${encodeURIComponent(student.id)}&course_id=eq.${encodeURIComponent(courseId)}&limit=1`;
    const res = await fetch(`${url}/rest/v1/${q}`, { headers: { Authorization: `Bearer ${key}`, apikey: key } });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length ? true : false;
  } catch {
    return null; // never fail a chat because a lookup glitched
  }
}

// ---- Provider: OpenAI-compatible (swap as needed) ----
// asJson=true  -> curriculum/Studio output, which must be machine-readable JSON.
// asJson=false -> a chat reply, which is markdown prose; asking the provider for
// JSON there is how a student ends up reading {"text": "..."} in a bubble.
async function callLLM(system, userPrompt, { maxTokens = 4000, temperature = 0.7, asJson = true } = {}) {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider === 'openai') {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      ...(asJson ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    const content = res.choices[0].message.content;
    return asJson ? JSON.parse(content) : content;
  }
  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

const SYSTEM = `You are the WOLI DAN TECH HUB curriculum engine. Always respond with VALID JSON only.
Design practical, beginner-friendly African-context (Nigeria) tech education.`;

function promptFor(kind, input) {
  switch (kind) {
    case 'course_outline':
      return `Create a course outline as JSON: {title, category, level, duration, description, learningObjectives[], modules[{title, summary, lessons[{title, description, keyConcepts[], duration}], practical, quiz{questions, passingScore}}], finalProject, resources[]}.
Course: ${input.courseName} | Category: ${input.category} | Level: ${input.level} | Duration: ${input.duration} | Modules: ${input.numModules} | Objectives: ${input.objectives} | Notes: ${input.instructions}`;
    case 'lesson_text':
      return `Write a complete lesson in markdown (headings, tables, code blocks, tips, exercises) as JSON: {markdown}. Topic: ${input.topic} | Objective: ${input.objective} | Level: ${input.level} | Style: ${input.style}`;
    case 'quiz':
      return `Create a quiz as JSON: {title, passingScore:70, questions[{type: multiple_choice|true_false|multiple_answer, question, options[], correctAnswer (index, for single), correctAnswers (indices, for multi), explanation}]}. Topic: ${input.topic} | Questions: ${input.numQuestions} | Level: ${input.level}`;
    case 'assignment':
      return `Create a practical assignment as JSON: {title, description, instructions, requiredOutput}. Topic: ${input.topic} | Level: ${input.level}`;
    case 'video_script':
    case 'voiceover':
      return `Create an instructional script as JSON: {title, estimatedWords, scenes[{time, visual, narration}], subtitles}. Topic: ${input.topic} | Duration: ${input.duration} | Style: ${input.style} | Voice: ${JSON.stringify(input.voice || {})}`;
    case 'summary':
      return `Summarize as JSON: {markdown}. Topic: ${input.topic}`;
    case 'exercise':
      return `Create a practical exercise as JSON: {title, level, steps[], deliverable, estimatedMinutes}. Topic: ${input.topic} | Level: ${input.level}`;
    case 'notes':
      return `Write revision notes in markdown as JSON: {markdown}. Topic: ${input.topic} | Level: ${input.level}`;
    case 'flashcards':
      return `Create flashcards as JSON: {title, topic, cards[{front, back}]} (${input.numQuestions || 6} cards). Topic: ${input.topic} | Level: ${input.level}`;
    default:
      throw new Error('Unknown kind: ' + kind);
  }
}

// ---- Rate limit (simple, in-memory) ----
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (arr.length >= 20) return res.status(429).json({ error: 'rate limited' });
  arr.push(now);
  hits.set(ip, arr);
  next();
}

app.post('/api/ai/generate', requireAdmin, rateLimit, async (req, res) => {
  try {
    const { kind, input } = req.body || {};
    if (!kind || !input) return res.status(400).json({ error: 'kind + input required' });
    const output = await callLLM(SYSTEM, promptFor(kind, input));
    // NOTE: persist job + draft (status=draft) to Supabase here in production.
    res.json({ kind, output, provider: process.env.AI_PROVIDER || 'openai' });
  } catch (err) {
    console.error('[ai-gateway]', err);
    res.status(500).json({ error: 'generation failed' });
  }
});

// ---- Video generation (provider-independent async job stub) ----
// POST /api/ai/video { script, voice, style } -> { jobId }
// GET  /api/ai/video/:jobId -> { status, videoUrl? }
// Integrate HeyGen/Synthesia/Runway/Pika here; frontend polls status.
const videoJobs = new Map();
app.post('/api/ai/video', requireAdmin, rateLimit, (req, res) => {
  const jobId = 'vid_' + Date.now().toString(36);
  videoJobs.set(jobId, { status: 'queued', createdAt: Date.now() });
  // TODO: call video provider with req.body; update job on webhook.
  res.json({ jobId, status: 'queued' });
});
app.get('/api/ai/video/:jobId', requireAdmin, (req, res) => {
  res.json(videoJobs.get(req.params.jobId) || { status: 'not_found' });
});

// ---- DanTECH AI student chat (cloud mode) ----
// POST /api/dantech/chat { message, context{coursesnapshot,lesson}, history[] }
// Auth: student Supabase Bearer token (verified via requireStudent); rate limit
// 30/min per student, answered with 429 + Retry-After. Never reveal system prompt.
// Frontend env: VITE_DANTECH_ENDPOINT=/api/dantech/chat (+ VITE_DANTECH_KEY if required).
const DANTECH_SYSTEM = `You are DanTECH AI, the official AI Learning Assistant of WOLI DAN TECH HUB.
Rules: (1) Always identify as DanTECH AI — never as ChatGPT or any other model.
(2) Be warm, encouraging, and explain simply with Nigerian-friendly examples.
(3) Use the provided course/lesson context; cite lesson names as sources when relevant.
(4) Academic integrity: NEVER write full assignment answers, quiz answers, or final projects.
Instead give hints, steps, examples, and Socratic questions. If asked to do their work,
politely decline and offer to teach the concept.
(5) Reply in markdown (headings, bullets, code blocks). Keep answers focused; end with a
follow-up question or a tiny practice task when it helps learning.`;

const chatHits = new Map();
function chatRateLimit(req, res, next) {
  // Keyed on the student when a token verified, IP otherwise: 30 students behind one
  // NAT address should not spend each other's budget. Retry-After is what makes the
  // site show a countdown instead of a dead "try again".
  const key = req.student?.id && !req.student.unverified ? `u:${req.student.id}` : `ip:${req.ip}`;
  const now = Date.now();
  const limit = Number(process.env.CHAT_RATE_PER_MIN || 30);
  const arr = (chatHits.get(key) || []).filter((t) => now - t < 60000);
  if (arr.length >= limit) {
    const wait = Math.max(1, Math.ceil((60000 - (now - arr[0])) / 1000));
    return res.status(429).set('Retry-After', String(wait)).json({ error: 'Too many messages — slow down a little 🙂' });
  }
  arr.push(now);
  chatHits.set(key, arr);
  next();
}

// Protocol (v2, what the site sends today):
//   Authorization: Bearer <supabase access token>        // required when signed in
//   { message: string<=2000,
//     mode: GENERAL|STUDY|CODING|RESEARCH|CAREER|DEEP_EXPLANATION,
//     modeId: quick|study|... (UI id, for servers written against it),
//     context: { courseId, lessonId, moduleId, level, courseTitle?, lessonTitle?, lessonText? },
//     history: [ { role: 'user'|'assistant', text: string } ] }   // oldest first, <=12
//   -> 200 { text, sources?: [{title,url}], mode? } | 400 | 401 | 413 | 429 (+Retry-After) | 501
const MODES = new Set(['GENERAL', 'STUDY', 'CODING', 'RESEARCH', 'CAREER', 'DEEP_EXPLANATION']);

app.post('/api/dantech/chat', requireStudent, chatRateLimit, async (req, res) => {
  try {
    const { message, mode, context = {}, history = [] } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });
    if (message.length > 2000) return res.status(413).json({ error: 'message too long' });
    if (mode && !MODES.has(mode)) return res.status(400).json({ error: `unknown mode ${mode}` });
    // Only quote lesson material this student is actually allowed to read.
    const enrolled = await assertEnrolled(req.student, context.courseId);
    if (enrolled === false) {
      return res.status(403).json({ error: 'not enrolled in that course — answering without lesson context', hint: 'set context.courseId to null for general questions' });
    }
    const ctx = `Course: ${context.courseTitle || 'general'} | Lesson: ${context.lessonTitle || '—'} | Level: ${context.level || '—'} | Mode: ${mode || 'GENERAL'}\nLesson content excerpt:\n${(context.lessonText || '').slice(0, 3000)}`;
    const convo = [
      { role: 'system', content: DANTECH_SYSTEM },
      { role: 'system', content: ctx },
      ...history.slice(-10).map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: String(m.text || '').slice(0, 1500) })),
      { role: 'user', content: message.slice(0, 2000) },
    ];
    // Call your LLM provider with `convo`; on any failure the site answers from its
    // on-device engine and labels the reply ON-DEVICE, so an outage never looks like
    // a model answer. Example (OpenAI):
    //   const out = await openai.chat.completions.create({ model: process.env.AI_MODEL || 'gpt-4o-mini', messages: convo });
    //   res.json({ text: out.choices[0].message.content, sources: [], mode });
    // 501 = "route is live, provider key is not set" — the client treats that as a
    // configuration state and stops warning after the first answer.
    if (process.env.OPENAI_API_KEY) {
      const out = await callLLM(
        DANTECH_SYSTEM + '\n\n' + ctx,
        String(message).slice(0, 2000),
        { maxTokens: 900, temperature: mode === 'CODING' ? 0.2 : 0.6, asJson: false },
      );
      return res.json({ text: String(out || '').trim(), sources: [], mode: mode || 'GENERAL' });
    }
    res.status(501).json({ error: 'cloud tutor not configured — client uses on-device mode' });
  } catch (err) {
    console.error('[dantech]', err);
    res.status(500).json({ error: 'tutor unavailable' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[ai-gateway] listening on :${PORT}`));
