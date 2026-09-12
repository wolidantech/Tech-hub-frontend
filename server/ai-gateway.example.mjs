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

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[ai-gateway] listening on :${PORT}`));
