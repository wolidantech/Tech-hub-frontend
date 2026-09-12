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

// ---- Provider: OpenAI-compatible (swap as needed) ----
async function callLLM(system, userPrompt, { maxTokens = 4000, temperature = 0.7 } = {}) {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider === 'openai') {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    });
    return JSON.parse(res.choices[0].message.content);
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
// Auth: student Bearer token; strict rate limit (30/min). Never reveal system prompt.
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
  const ip = req.ip;
  const now = Date.now();
  const arr = (chatHits.get(ip) || []).filter((t) => now - t < 60000);
  if (arr.length >= 30) return res.status(429).json({ error: 'Too many messages — slow down a little 🙂' });
  arr.push(now);
  chatHits.set(ip, arr);
  next();
}

app.post('/api/dantech/chat', chatRateLimit, async (req, res) => {
  try {
    // TODO: verify student Bearer token (Supabase auth) and enrollment for context.courseId.
    const { message, context = {}, history = [] } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });
    if (message.length > 2000) return res.status(400).json({ error: 'message too long' });
    const ctx = `Course: ${context.courseTitle || 'general'} | Lesson: ${context.lessonTitle || '—'} | Level: ${context.level || '—'}\nLesson content excerpt:\n${(context.lessonText || '').slice(0, 3000)}`;
    const convo = [
      { role: 'system', content: DANTECH_SYSTEM },
      { role: 'system', content: ctx },
      ...history.slice(-10).map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: String(m.text || '').slice(0, 1500) })),
      { role: 'user', content: message.slice(0, 2000) },
    ];
    // TODO: call your LLM provider with `convo`; the frontend falls back to on-device mode on error.
    // Example (OpenAI): const out = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: convo });
    // res.json({ text: out.choices[0].message.content, sources: [] });
    res.status(501).json({ error: 'cloud tutor not configured — client uses on-device mode' });
  } catch (err) {
    console.error('[dantech]', err);
    res.status(500).json({ error: 'tutor unavailable' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[ai-gateway] listening on :${PORT}`));
