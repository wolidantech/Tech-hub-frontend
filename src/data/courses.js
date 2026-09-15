export const categories = [
  "All",
  "AI & Technology",
  "Design",
  "Video & Media",
  "Marketing",
  "Web Development",
  "Mobile Development",
  "Microsoft Office"
];

// ============================================================
// FULL CURRICULA — each course carries 4 modules × 4 lessons
// (16 lessons) of professional lesson bodies, one curated real
// YouTube video per lesson and curated resources per lesson.
// The per-course content lives in ./curriculum/<slug>.js so it
// stays reviewable and the seed chain stays the single consumer.
// ============================================================
import aiVideoContentCreation from "./curriculum/ai-video-content-creation.js";
import videoEditingWithCapcut from "./curriculum/video-editing-with-capcut.js";
import graphicDesignWithCanva from "./curriculum/graphic-design-with-canva.js";
import digitalMarketing from "./curriculum/digital-marketing.js";
import frontendWebDevelopment from "./curriculum/frontend-web-development.js";
import webDesignWithWordpress from "./curriculum/web-design-with-wordpress.js";
import uiUxDesignWithFigma from "./curriculum/ui-ux-design-with-figma.js";
import microsoftExcel from "./curriculum/microsoft-excel.js";
import microsoftWord from "./curriculum/microsoft-word.js";
import microsoftPowerpoint from "./curriculum/microsoft-powerpoint.js";
import mobileApplicationDevelopment from "./curriculum/mobile-application-development.js";
import portfolioCreation from "./curriculum/portfolio-creation.js";

const CURRICULA = Object.fromEntries(
  [
    aiVideoContentCreation,
    videoEditingWithCapcut,
    graphicDesignWithCanva,
    digitalMarketing,
    frontendWebDevelopment,
    webDesignWithWordpress,
    uiUxDesignWithFigma,
    microsoftExcel,
    microsoftWord,
    microsoftPowerpoint,
    mobileApplicationDevelopment,
    portfolioCreation,
  ].map(({ slug, curriculum }) => [slug, curriculum])
);

/** Normalise a curriculum module for the seed chain: stable ids + explicit type. */
const withIds = (slug, modules) =>
  modules.map((mod, mi) => ({
    id: `${slug}-m${mi + 1}`,
    title: mod.title,
    lessons: mod.lessons.map((lesson, li) => ({
      id: `${slug}-m${mi + 1}-l${li + 1}`,
      title: lesson.title,
      type: lesson.videoUrl ? "video" : "text",
      duration: lesson.duration || "",
      videoUrl: lesson.videoUrl,
      content: lesson.content || "",
      resources: lesson.resources || [],
    })),
  }));

export const coursesData = [
  {
    id: "ai-video-content-creation",
    slug: "ai-video-content-creation",
    title: "AI VIDEO CONTENT CREATION",
    shortDescription: "Master AI tools to create viral videos, ads & social content in minutes",
    description: "Learn how to leverage cutting-edge AI tools for video generation, scripting, voiceovers, and editing. Create professional advertisements and social media content without expensive equipment.",
    longDescription: "This comprehensive course takes you from zero to hero in AI video creation. You'll learn to use the latest AI tools for script writing, image generation, voice cloning, video synthesis, and editing. Perfect for content creators, marketers, and entrepreneurs who want to produce high-quality video content at scale.",
    category: "AI & Technology",
    instructor: "Woli Dan",
    instructorRole: "AI Content Strategist",
    duration: "8 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 15000,
    rating: 4.9,
    students: 234,
    thumbnail: "ai",
    color: "from-violet-600 to-indigo-600",
    whatYouWillLearn: [
      "AI video generation with top tools",
      "AI script writing & storytelling",
      "AI voice generation & cloning",
      "AI image generation for videos",
      "AI video editing automation",
      "Creating advertisements with AI",
      "Creating viral social media content with AI",
      "Monetizing AI video content"
    ]
  },
  {
    id: "video-editing-with-capcut",
    slug: "video-editing-with-capcut",
    title: "VIDEO EDITING WITH CAPCUT",
    shortDescription: "Edit like a pro on your phone & PC - transitions, effects, captions",
    description: "Master CapCut for mobile and desktop. Learn cutting, transitions, effects, auto-captions, and trending editing styles used by top creators.",
    longDescription: "CapCut is the #1 editing tool for creators. This course teaches you everything from basic cuts to advanced effects, keyframes, color grading, and viral TikTok/Reels editing techniques. No laptop needed - start on your phone!",
    category: "Video & Media",
    instructor: "Woli Dan",
    instructorRole: "Video Editor",
    duration: "6 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 12000,
    rating: 4.8,
    students: 312,
    thumbnail: "video",
    color: "from-cyan-500 to-blue-600",
    whatYouWillLearn: [
      "CapCut interface mastery",
      "Cutting & trimming like a pro",
      "Transitions & effects",
      "Auto captions & text animations",
      "Color grading & filters",
      "Sound design & music",
      "Export settings for all platforms",
      "Creating viral short-form content"
    ]
  },
  {
    id: "graphic-design-with-canva",
    slug: "graphic-design-with-canva",
    title: "GRAPHIC DESIGN WITH CANVA",
    shortDescription: "Design stunning graphics, flyers, logos & social posts without Photoshop",
    description: "Learn professional graphic design using Canva. Create flyers, social media designs, logos, presentations, and brand kits that clients will pay for.",
    longDescription: "Canva has democratized design. This course shows you how to create professional-grade designs for businesses, even if you've never designed before. Includes client work templates and monetization strategies.",
    category: "Design",
    instructor: "Woli Dan",
    instructorRole: "Brand Designer",
    duration: "5 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 10000,
    rating: 4.9,
    students: 189,
    thumbnail: "design",
    color: "from-fuchsia-500 to-purple-600",
    whatYouWillLearn: [
      "Canva mastery from scratch",
      "Design principles & typography",
      "Social media design pack",
      "Flyer & poster design",
      "Logo & brand kit creation",
      "Presentation design",
      "Client project workflow",
      "Selling designs online"
    ]
  },
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    title: "DIGITAL MARKETING",
    shortDescription: "Grow any business online - social media, ads, content & sales funnels",
    description: "Complete digital marketing blueprint for Nigerian businesses. Learn social media marketing, content strategy, paid ads, and lead generation.",
    longDescription: "Stop boosting posts randomly. Learn a proven system to get clients online, build a brand, run ads that convert, and turn followers into paying customers. Includes real Nigerian case studies.",
    category: "Marketing",
    instructor: "Woli Dan",
    instructorRole: "Marketing Lead",
    duration: "10 hours",
    lessonsCount: 16,
    level: "Beginner to Intermediate",
    price: 5000,
    originalPrice: 20000,
    rating: 4.7,
    students: 156,
    thumbnail: "marketing",
    color: "from-orange-500 to-pink-600",
    whatYouWillLearn: [
      "Digital marketing fundamentals",
      "Social media growth strategy",
      "Content creation & calendar",
      "Facebook & Instagram Ads",
      "Lead generation & funnels",
      "Copywriting that sells",
      "Analytics & optimization",
      "Monetizing your skills"
    ]
  },
  {
    id: "mobile-application-development",
    slug: "mobile-application-development",
    title: "MOBILE APPLICATION DEVELOPMENT",
    shortDescription: "Build real mobile apps with Flutter & Dart - from zero to Play Store",
    description: "Learn to build real mobile apps for Android and iOS from one codebase with Flutter. From setup to publishing.",
    longDescription: "Build and publish your first mobile app. This hands-on course covers Dart, Flutter UI, state management, APIs, Firebase backends, and shipping to the Play Store — the complete path from beginner to app creator.",
    category: "Mobile Development",
    instructor: "Woli Dan Tech Team",
    instructorRole: "Mobile Developer",
    duration: "15 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 25000,
    rating: 4.8,
    students: 98,
    thumbnail: "mobile",
    color: "from-emerald-500 to-teal-600",
    whatYouWillLearn: [
      "Dart programming fundamentals",
      "Flutter widgets & layouts",
      "State management with Provider",
      "Navigation & forms",
      "APIs, JSON & local storage",
      "Firebase auth & Firestore",
      "Polish, themes & app identity",
      "Publishing to the Play Store"
    ]
  },
  {
    id: "portfolio-creation",
    slug: "portfolio-creation",
    title: "PORTFOLIO CREATION",
    shortDescription: "Build a portfolio that gets you hired - showcase your work like a pro",
    description: "Create a stunning professional portfolio that attracts clients and employers, plus the freelance systems that turn skills into income.",
    longDescription: "Your portfolio is your CV in the digital age. Learn to curate your best work, write compelling case studies, build your online presence, and land your first clients — the complete path from skilled to hired.",
    category: "Design",
    instructor: "Woli Dan",
    instructorRole: "Career Coach",
    duration: "4 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 8000,
    rating: 4.9,
    students: 210,
    thumbnail: "portfolio",
    color: "from-slate-600 to-slate-800",
    whatYouWillLearn: [
      "Portfolio strategy & curation",
      "Case studies that sell",
      "LinkedIn & personal branding",
      "Fiverr & Upwork mastery",
      "Pricing your skills",
      "Proposals & contracts",
      "Landing your first client",
      "Retainers, products & growth"
    ]
  },
  {
    id: "frontend-web-development",
    slug: "frontend-web-development",
    title: "FRONTEND WEB DEVELOPMENT",
    shortDescription: "Learn HTML, CSS, JavaScript & React - build real websites",
    description: "Become a frontend developer. Learn HTML, CSS, JavaScript, and modern frameworks by building real projects.",
    longDescription: "From zero to job-ready. This course takes you through the fundamentals of web development to building responsive, interactive websites with modern tools. Includes 5 portfolio projects.",
    category: "Web Development",
    instructor: "Woli Dan Tech Team",
    instructorRole: "Senior Frontend Engineer",
    duration: "20 hours",
    lessonsCount: 16,
    level: "Beginner to Intermediate",
    price: 5000,
    originalPrice: 30000,
    rating: 4.9,
    students: 167,
    thumbnail: "frontend",
    color: "from-blue-600 to-cyan-500",
    whatYouWillLearn: [
      "HTML5 & semantic markup",
      "CSS3, Flexbox & Grid",
      "Responsive design",
      "JavaScript fundamentals",
      "DOM manipulation",
      "React basics",
      "Git & deployment",
      "Building 5 real projects"
    ]
  },
  {
    id: "web-design-with-wordpress",
    slug: "web-design-with-wordpress",
    title: "WEB DESIGN WITH WORDPRESS",
    shortDescription: "Build professional business websites with WordPress - no coding",
    description: "Learn to build stunning WordPress websites for businesses. Domain, hosting, Elementor, and client delivery.",
    longDescription: "WordPress powers 40% of the web. Learn to build professional websites for clients, charge premium prices, and deliver in days not months. Includes hosting setup and client handover.",
    category: "Web Development",
    instructor: "Woli Dan",
    instructorRole: "WordPress Expert",
    duration: "8 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 15000,
    rating: 4.8,
    students: 143,
    thumbnail: "wordpress",
    color: "from-sky-600 to-blue-700",
    whatYouWillLearn: [
      "WordPress fundamentals",
      "Domain & hosting setup",
      "Elementor page builder",
      "Theme customization",
      "E-commerce with WooCommerce",
      "SEO basics",
      "Security & maintenance",
      "Charging clients & delivery"
    ]
  },
  {
    id: "ui-ux-design-with-figma",
    slug: "ui-ux-design-with-figma",
    title: "UI/UX DESIGN WITH FIGMA",
    shortDescription: "Design beautiful apps & websites in Figma - from wireframe to prototype",
    description: "Master UI/UX design with Figma. Learn user research, wireframing, design systems, and prototyping.",
    longDescription: "UI/UX is one of the highest-paying tech skills. This course teaches you to design user-centered digital products, create design systems, and build interactive prototypes that developers love.",
    category: "Design",
    instructor: "Woli Dan Tech Team",
    instructorRole: "Product Designer",
    duration: "12 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 18000,
    rating: 4.9,
    students: 121,
    thumbnail: "figma",
    color: "from-purple-600 to-pink-600",
    whatYouWillLearn: [
      "UI/UX fundamentals",
      "User research & personas",
      "Wireframing & user flows",
      "Figma mastery",
      "Design systems & components",
      "Prototyping & animations",
      "Usability testing",
      "Portfolio & job prep"
    ]
  },
  {
    id: "microsoft-excel",
    slug: "microsoft-excel",
    title: "MICROSOFT EXCEL",
    shortDescription: "Excel from beginner to advanced - formulas, charts, dashboards",
    description: "Master Microsoft Excel for work and business. Formulas, pivot tables, charts, and dashboards.",
    longDescription: "Excel is still the most demanded office skill. This course takes you from basic spreadsheet skills to advanced data analysis, pivot tables, and interactive dashboards. Essential for any office job.",
    category: "Microsoft Office",
    instructor: "Woli Dan",
    instructorRole: "Data Analyst",
    duration: "6 hours",
    lessonsCount: 16,
    level: "Beginner to Advanced",
    price: 5000,
    originalPrice: 10000,
    rating: 4.8,
    students: 267,
    thumbnail: "excel",
    color: "from-green-600 to-emerald-700",
    whatYouWillLearn: [
      "Excel interface & basics",
      "Formulas & functions",
      "Data formatting & validation",
      "Charts & visualization",
      "Pivot tables & analysis",
      "Conditional formatting",
      "Dashboards & reports",
      "Shortcuts & productivity"
    ]
  },
  {
    id: "microsoft-word",
    slug: "microsoft-word",
    title: "MICROSOFT WORD",
    shortDescription: "Create professional documents, CVs, reports & proposals",
    description: "Master Microsoft Word for professional document creation. CVs, reports, proposals, and formatting.",
    longDescription: "Learn to create polished, professional documents that stand out. From CVs that get interviews to business proposals that win clients, this course covers everything.",
    category: "Microsoft Office",
    instructor: "Woli Dan",
    instructorRole: "Office Productivity Expert",
    duration: "4 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 8000,
    rating: 4.7,
    students: 198,
    thumbnail: "word",
    color: "from-blue-700 to-indigo-800",
    whatYouWillLearn: [
      "Word interface mastery",
      "Professional formatting",
      "Styles & templates",
      "CV & resume creation",
      "Reports & proposals",
      "Tables & graphics",
      "Collaboration & review",
      "Printing & exporting"
    ]
  },
  {
    id: "microsoft-powerpoint",
    slug: "microsoft-powerpoint",
    title: "MICROSOFT POWERPOINT",
    shortDescription: "Design presentations that wow - animations, storytelling & delivery",
    description: "Create stunning presentations that captivate audiences. Design, animation, and delivery mastery.",
    longDescription: "Learn to create presentations that people remember. This course covers slide design principles, storytelling, animations, and delivery techniques for business, school, and pitches.",
    category: "Microsoft Office",
    instructor: "Woli Dan",
    instructorRole: "Presentation Designer",
    duration: "5 hours",
    lessonsCount: 16,
    level: "Beginner",
    price: 5000,
    originalPrice: 8000,
    rating: 4.8,
    students: 176,
    thumbnail: "powerpoint",
    color: "from-orange-600 to-red-600",
    whatYouWillLearn: [
      "PowerPoint interface",
      "Slide design principles",
      "Layouts & master slides",
      "Animations & transitions",
      "Charts & infographics",
      "Storytelling structure",
      "Presenter tools",
      "Export & delivery"
    ]
  }
].map((course) => ({
  ...course,
  curriculum: withIds(course.slug, CURRICULA[course.slug]),
}));

// Kept for backwards compatibility. Every course now ships a complete
// 4-module curriculum from ./curriculum, so there is nothing to enrich;
// the function simply passes courses through untouched.
export const enrichCourses = (courses) => courses;
