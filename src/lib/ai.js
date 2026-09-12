// ============================================================
// WOLI DAN TECH HUB — Modular AI Service
// ------------------------------------------------------------
// Provider-independent architecture:
//
//   generate('course_outline' | 'lesson_text' | 'lesson_script' |
//            'quiz' | 'assignment' | 'video_script' | 'voiceover' |
//            'summary', input, opts)
//
// Resolution order:
//   1. If VITE_AI_ENDPOINT is set -> SecureBackendProvider (POSTs to YOUR
//      server; API keys live ONLY on the server, see server/ai-gateway.example.mjs)
//   2. Else -> LocalTemplateProvider (deterministic, offline, zero-cost).
//
// New providers (OpenAI, Anthropic, Gemini, video/voice vendors) plug in by
// implementing { name, supports(kind), generate(kind, input) }.
// ALL AI output enters the system as DRAFT and requires admin review.
// ============================================================

const REMOTE_ENDPOINT = import.meta.env?.VITE_AI_ENDPOINT || '';

// ---------------- Secure backend provider (no keys in frontend) ----------------
const SecureBackendProvider = {
  name: 'secure-backend',
  supports() { return Boolean(REMOTE_ENDPOINT); },
  async generate(kind, input, opts = {}) {
    const res = await fetch(REMOTE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: JSON.stringify({ kind, input, options: opts }),
    });
    if (!res.ok) throw new Error(`AI backend error (${res.status})`);
    const data = await res.json();
    return normalizeOutput(kind, data.output ?? data, input, 'secure-backend');
  },
};

// ---------------- Local template provider (offline fallback) ----------------
function lessonPlan(topic, i, total) {
  const phases = ['Foundations', 'Core Skills', 'Guided Practice', 'Real-World Application', 'Mastery & Monetization'];
  return phases[Math.min(i, phases.length - 1)] + (total > 5 ? ` ${i + 1}` : '');
}

function buildCourseOutline(input) {
  const { courseName = 'New Course', category = 'General', level = 'Beginner', duration = '8 weeks', numModules = 6, objectives = '', instructions = '' } = input;
  const n = Math.max(2, Math.min(12, Number(numModules) || 6));
  const modules = [];
  for (let i = 0; i < n; i++) {
    const isFirst = i === 0;
    const isLast = i === n - 1;
    const title = isFirst ? `Introduction to ${courseName}` : isLast ? `Final Project: ${courseName} in Action` : `${lessonPlan(courseName, i, n)}: ${courseName} — Part ${i}`;
    const lessons = [];
    const lessonCount = isLast ? 2 : 3;
    for (let j = 0; j < lessonCount; j++) {
      lessons.push({
        title: isLast && j === 1 ? 'Final project submission & review' : `${title} — Lesson ${j + 1}`,
        description: `Practical, ${String(level).toLowerCase()}-friendly lesson covering key concepts with examples and exercises.`,
        keyConcepts: ['Core concept explained simply', 'Worked example', 'Common mistakes to avoid'],
        duration: '12–20 min',
      });
    }
    modules.push({
      title,
      summary: isLast ? 'Apply everything in a portfolio-ready final project.' : `Build ${String(level).toLowerCase()}-level competence step by step.`,
      lessons,
      practical: isLast ? `Complete final project: produce a real-world ${courseName} deliverable and submit it for review.` : `Hands-on exercise: practice this module's skills and save your work for your portfolio.`,
      quiz: { questions: 5, passingScore: 70 },
    });
  }
  return {
    title: courseName,
    category,
    level,
    duration,
    description: `${courseName} is a practical, project-based ${String(level).toLowerCase()} course in ${category}. You will learn by doing — every module ends with practical work, and the course finishes with a portfolio-ready project. ${objectives}`.trim(),
    learningObjectives: [objectives || `Confidently apply ${courseName} skills`, 'Complete real-world practical tasks', 'Build portfolio pieces that attract clients', 'Pass quizzes and the final assessment', ...(instructions ? [`Special focus: ${instructions}`] : [])],
    modules,
    finalProject: `Create a complete, portfolio-ready ${courseName} project demonstrating all core skills.`,
    resources: ['Lesson notes & templates', 'Practice files', 'Recommended free tools', 'Community & support'],
  };
}

function buildLessonText(input) {
  const { topic = 'Lesson', objective = '', level = 'Beginner', style = 'practical' } = input;
  return `# ${topic}\n\n**Level:** ${level} • **Style:** ${style}\n\n${objective ? `> [!NOTE] Learning objective: ${objective}\n\n` : ''}## What you will learn\n\n- The essential ideas behind ${topic}\n- A worked example you can follow along\n- Mistakes beginners make — and how to avoid them\n\n## Step-by-step\n\n1. **Understand the concept** — read the explanation below, then try the mini example.\n2. **Follow the demonstration** — replicate each step in your own tool.\n3. **Practice** — complete the exercise at the end and save your output.\n\n## Key concepts\n\n| Concept | What it means | Why it matters |\n|---|---|---|\n| Foundation | The building block of ${topic} | Everything builds on this |\n| Workflow | The repeatable process | Speed + quality |\n| Quality check | How to verify your work | Client-ready output |\n\n> [!TIP] Save every exercise — they become portfolio pieces.\n\n## Worked example\n\n\`\`\`\nExample: Apply ${topic} to a small real task.\nInput  -> Process -> Polished output.\n\`\`\`\n\n## Exercise\n\nCreate one complete piece using today's lesson and submit it as your practical task.\n\n> [!WARNING] Do not skip the exercise — skills compound through practice.\n`;
}

function buildScript(input, forVideo = false) {
  const { topic = 'Lesson', objective = '', duration = '10 minutes', style = 'beginner-friendly', voice = {} } = input;
  const mins = parseInt(String(duration), 10) || 10;
  const words = mins * 130;
  return {
    title: `${topic} — ${forVideo ? 'Video' : 'Lesson'} Script (${duration})`,
    voice: { gender: voice.gender || 'female', language: voice.language || 'en', speed: voice.speed || 1, style: voice.teachingStyle || style },
    estimatedWords: words,
    scenes: [
      { time: '0:00', visual: 'Title card + hook question', narration: `Welcome! In the next ${duration}, you will master ${topic}. ${objective}` },
      { time: 'Hook', visual: 'Show the end result first', narration: `Here is what you will be able to create by the end of this lesson.` },
      { time: 'Concept', visual: 'Simple diagram / screen demo', narration: `Let's break ${topic} into three simple ideas you can remember forever.` },
      { time: 'Demo', visual: 'Step-by-step screen demonstration', narration: `Watch me do it once — then you will do it with me, step by step.` },
      { time: 'Practice', visual: 'On-screen exercise prompt', narration: `Pause the video and complete the quick exercise. This is where real learning happens.` },
      { time: 'Recap', visual: 'Checklist summary + next lesson teaser', narration: `You did it! You learned ${topic}. In the next lesson we go deeper.` },
    ],
    subtitles: `[00:00] Welcome! Today: ${topic}.\n[01:00] First, the big picture...\n[03:00] Now the step-by-step demo...\n[07:00] Your turn — quick exercise...\n[09:00] Recap and next steps.`,
    captionsNote: 'Auto-generate SRT/VTT from narration during video production.',
  };
}

function buildQuiz(input) {
  const { topic = 'Lesson', numQuestions = 5, level = 'Beginner' } = input;
  const n = Math.max(3, Math.min(20, Number(numQuestions) || 5));
  const questions = [];
  for (let i = 0; i < n; i++) {
    const kind = i % 3;
    if (kind === 0) {
      questions.push({
        type: 'multiple_choice', question: `Which statement best describes a key idea in "${topic}"? (Q${i + 1})`,
        options: ['The core workflow applied correctly', 'Skipping practice and theory', 'Ignoring quality checks', 'Copying without understanding'],
        correctAnswer: 0, explanation: 'Mastery comes from applying the core workflow with practice and quality checks.',
      });
    } else if (kind === 1) {
      questions.push({
        type: 'true_false', question: `True or False: Practice exercises in "${topic}" are optional for ${String(level).toLowerCase()} learners.`,
        options: ['True', 'False'], correctAnswer: 1, explanation: 'Practice is essential — skills compound through doing.',
      });
    } else {
      questions.push({
        type: 'multiple_answer', question: `Select ALL good practices when learning "${topic}".`,
        options: ['Save your work for a portfolio', 'Follow steps in order', 'Skip quality checks', 'Review mistakes'],
        correctAnswers: [0, 1, 3], explanation: 'Save work, follow the process, and review mistakes. Never skip quality checks.',
      });
    }
  }
  return { title: `${topic} — Quiz`, topic, level, passingScore: 70, allowRetake: true, questions };
}

function buildAssignment(input) {
  const { topic = 'Lesson', level = 'Beginner', output = '' } = input;
  return {
    title: `Practical: ${topic}`,
    description: `Apply what you learned in "${topic}" to produce a real, portfolio-worthy output.`,
    instructions: `1. Review the lesson and notes.\n2. Create your own original piece (no copying).\n3. Export in an accepted format (JPG/PNG/PDF/MP4/ZIP/DOCX/PPTX/XLSX).\n4. Upload below with a short note about your process.`,
    requiredOutput: output || `One complete ${topic} deliverable, neatly presented and ready to show a client.`,
    level, maxScore: 100,
  };
}

function buildSummary(input) {
  const { topic = 'Lesson' } = input;
  return `# ${topic} — Summary\n\n- **Big idea:** ${topic} follows a repeatable workflow: learn, demo, practice, polish.\n- **Remember:** save every exercise for your portfolio.\n- **Next:** apply this in the practical task, then take the quiz.\n`;
}

const LocalTemplateProvider = {
  name: 'local-template',
  supports() { return true; },
  async generate(kind, input) {
    // Simulate async job; deterministic offline generation
    await new Promise((r) => setTimeout(r, 600));
    switch (kind) {
      case 'course_outline': return { kind, data: buildCourseOutline(input), provider: 'local-template' };
      case 'lesson_text': return { kind, data: { markdown: buildLessonText(input) }, provider: 'local-template' };
      case 'lesson_script':
      case 'video_script': return { kind, data: buildScript(input, true), provider: 'local-template' };
      case 'voiceover': return { kind, data: buildScript(input, false), provider: 'local-template' };
      case 'quiz': return { kind, data: buildQuiz(input), provider: 'local-template' };
      case 'assignment': return { kind, data: buildAssignment(input), provider: 'local-template' };
      case 'summary': return { kind, data: { markdown: buildSummary(input) }, provider: 'local-template' };
      default: throw new Error(`Unsupported AI kind: ${kind}`);
    }
  },
};

function normalizeOutput(kind, output, input, provider) {
  return { kind, data: output, provider, inputSnapshot: input };
}

const PROVIDERS = [SecureBackendProvider, LocalTemplateProvider];

export function getActiveProviderName() {
  return SecureBackendProvider.supports() ? 'secure-backend' : 'local-template';
}

export function isCloudAIEnabled() {
  return SecureBackendProvider.supports();
}

// Main entry: always returns { kind, data, provider }
export async function generate(kind, input = {}, opts = {}) {
  const provider = PROVIDERS.find((p) => p.supports(kind));
  if (!provider) throw new Error('No AI provider available');
  try {
    return await provider.generate(kind, input, opts);
  } catch (err) {
    // Graceful fallback to local templates if backend fails
    if (provider !== LocalTemplateProvider) {
      console.warn('[AI] backend failed, falling back to local templates:', err.message);
      return LocalTemplateProvider.generate(kind, input);
    }
    throw err;
  }
}

export const AI_KINDS = [
  { id: 'course_outline', label: 'Generate Course', desc: 'Full curriculum: modules, lessons, quizzes, projects' },
  { id: 'lesson_text', label: 'Generate Lesson', desc: 'Complete READ LESSON text with examples' },
  { id: 'quiz', label: 'Generate Quiz', desc: 'Questions, answers & explanations' },
  { id: 'assignment', label: 'Generate Assignment', desc: 'Practical task with instructions' },
  { id: 'video_script', label: 'Video Script', desc: 'Scenes, visuals, narration & subtitles' },
  { id: 'voiceover', label: 'Voiceover Script', desc: 'Narration with voice & style settings' },
  { id: 'summary', label: 'Generate Summary', desc: 'Concise learning recap' },
];
