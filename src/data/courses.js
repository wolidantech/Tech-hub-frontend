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
    lessonsCount: 24,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Introduction to AI Video Creation",
        lessons: [
          { id: "l1", title: "What is AI Video Creation?", type: "video", duration: "12:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Overview of AI video landscape" },
          { id: "l2", title: "Tools You Need - Free & Paid", type: "text", duration: "08:45", content: "Complete toolkit breakdown..." },
          { id: "l3", title: "Setting Up Your Workspace", type: "video", duration: "15:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      },
      {
        id: "m2",
        title: "AI Script & Voice Mastery",
        lessons: [
          { id: "l4", title: "AI Script Writing with ChatGPT", type: "video", duration: "18:10", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l5", title: "Voice Generation - ElevenLabs & More", type: "video", duration: "22:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l6", title: "Practice: Create Your First Script", type: "text", duration: "10:00", content: "Hands-on exercise..." },
        ]
      },
      {
        id: "m3",
        title: "AI Video Production",
        lessons: [
          { id: "l7", title: "Text-to-Video with Runway & Pika", type: "video", duration: "25:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l8", title: "Image-to-Video Animation", type: "video", duration: "20:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l9", title: "Creating Ads That Convert", type: "video", duration: "19:45", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "video-editing-capcut",
    slug: "video-editing-capcut",
    title: "VIDEO EDITING WITH CAPCUT",
    shortDescription: "Edit like a pro on your phone & PC - transitions, effects, captions",
    description: "Master CapCut for mobile and desktop. Learn cutting, transitions, effects, auto-captions, and trending editing styles used by top creators.",
    longDescription: "CapCut is the #1 editing tool for creators. This course teaches you everything from basic cuts to advanced effects, keyframes, color grading, and viral TikTok/Reels editing techniques. No laptop needed - start on your phone!",
    category: "Video & Media",
    instructor: "Woli Dan",
    instructorRole: "Video Editor",
    duration: "6 hours",
    lessonsCount: 20,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "CapCut Basics",
        lessons: [
          { id: "l1", title: "Getting Started with CapCut", type: "video", duration: "10:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l2", title: "Timeline & Cutting Techniques", type: "video", duration: "14:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l3", title: "Your First Edit", type: "text", duration: "15:00", content: "Practice project..." },
        ]
      },
      {
        id: "m2",
        title: "Advanced Editing",
        lessons: [
          { id: "l4", title: "Transitions & Effects Deep Dive", type: "video", duration: "18:45", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l5", title: "Keyframes & Motion Graphics", type: "video", duration: "20:10", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "graphic-design-canva",
    slug: "graphic-design-canva",
    title: "GRAPHIC DESIGN WITH CANVA",
    shortDescription: "Design stunning graphics, flyers, logos & social posts without Photoshop",
    description: "Learn professional graphic design using Canva. Create flyers, social media designs, logos, presentations, and brand kits that clients will pay for.",
    longDescription: "Canva has democratized design. This course shows you how to create professional-grade designs for businesses, even if you've never designed before. Includes client work templates and monetization strategies.",
    category: "Design",
    instructor: "Woli Dan",
    instructorRole: "Brand Designer",
    duration: "5 hours",
    lessonsCount: 18,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Design Fundamentals",
        lessons: [
          { id: "l1", title: "Design Thinking & Canva Tour", type: "video", duration: "12:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l2", title: "Colors, Fonts & Layout", type: "video", duration: "16:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
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
    lessonsCount: 28,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Marketing Foundations",
        lessons: [
          { id: "l1", title: "The Digital Marketing Ecosystem", type: "video", duration: "14:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "mobile-app-development",
    slug: "mobile-app-development",
    title: "MOBILE APPLICATION DEVELOPMENT",
    shortDescription: "Build real mobile apps with no-code & Flutterflow basics",
    description: "Learn to build functional mobile apps without complex coding. From idea to Play Store.",
    longDescription: "Build your first mobile app in 2 weeks. This beginner-friendly course covers app ideation, UI design, no-code development, and publishing. Perfect for entrepreneurs with app ideas.",
    category: "Mobile Development",
    instructor: "Woli Dan Tech Team",
    instructorRole: "Mobile Developer",
    duration: "15 hours",
    lessonsCount: 32,
    level: "Beginner",
    price: 5000,
    originalPrice: 25000,
    rating: 4.8,
    students: 98,
    thumbnail: "mobile",
    color: "from-emerald-500 to-teal-600",
    whatYouWillLearn: [
      "Mobile app fundamentals",
      "UI/UX for mobile apps",
      "No-code app development",
      "Database & authentication",
      "APIs & integrations",
      "Testing & deployment",
      "Publishing to Play Store",
      "App monetization"
    ],
    curriculum: [
      {
        id: "m1",
        title: "App Foundations",
        lessons: [
          { id: "l1", title: "How Mobile Apps Work", type: "video", duration: "13:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "portfolio-creation",
    slug: "portfolio-creation",
    title: "PORTFOLIO CREATION",
    shortDescription: "Build a portfolio that gets you hired - showcase your work like a pro",
    description: "Create a stunning professional portfolio website that attracts clients and employers. No coding needed.",
    longDescription: "Your portfolio is your CV in the digital age. Learn to curate your best work, write compelling case studies, and build a portfolio site that converts visitors into clients.",
    category: "Design",
    instructor: "Woli Dan",
    instructorRole: "Career Coach",
    duration: "4 hours",
    lessonsCount: 14,
    level: "Beginner",
    price: 5000,
    originalPrice: 8000,
    rating: 4.9,
    students: 210,
    thumbnail: "portfolio",
    color: "from-slate-600 to-slate-800",
    whatYouWillLearn: [
      "Portfolio strategy & structure",
      "Selecting your best work",
      "Case study writing",
      "Building portfolio site",
      "Personal branding",
      "Client attraction",
      "Resume & LinkedIn optimization",
      "Interview preparation"
    ],
    curriculum: [
      {
        id: "m1",
        title: "Portfolio Strategy",
        lessons: [
          { id: "l1", title: "What Makes a Great Portfolio", type: "video", duration: "11:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
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
    lessonsCount: 45,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Web Foundations",
        lessons: [
          { id: "l1", title: "How the Web Works", type: "video", duration: "10:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "l2", title: "HTML Crash Course", type: "video", duration: "45:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "web-design-wordpress",
    slug: "web-design-wordpress",
    title: "WEB DESIGN WITH WORDPRESS",
    shortDescription: "Build professional business websites with WordPress - no coding",
    description: "Learn to build stunning WordPress websites for businesses. Domain, hosting, Elementor, and client delivery.",
    longDescription: "WordPress powers 40% of the web. Learn to build professional websites for clients, charge premium prices, and deliver in days not months. Includes hosting setup and client handover.",
    category: "Web Development",
    instructor: "Woli Dan",
    instructorRole: "WordPress Expert",
    duration: "8 hours",
    lessonsCount: 22,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "WordPress Setup",
        lessons: [
          { id: "l1", title: "Domain, Hosting & Installation", type: "video", duration: "20:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "ui-ux-design-figma",
    slug: "ui-ux-design-figma",
    title: "UI/UX DESIGN WITH FIGMA",
    shortDescription: "Design beautiful apps & websites in Figma - from wireframe to prototype",
    description: "Master UI/UX design with Figma. Learn user research, wireframing, design systems, and prototyping.",
    longDescription: "UI/UX is one of the highest-paying tech skills. This course teaches you to design user-centered digital products, create design systems, and build interactive prototypes that developers love.",
    category: "Design",
    instructor: "Woli Dan Tech Team",
    instructorRole: "Product Designer",
    duration: "12 hours",
    lessonsCount: 26,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "UX Foundations",
        lessons: [
          { id: "l1", title: "What is UI/UX?", type: "video", duration: "12:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  },
  {
    id: "microsoft-excel",
    slug: "microsoft-excel",
    title: "MICROSOFT EXCEL",
    shortDescription: "Excel from beginner to advanced - formulas, charts, dashboards",
    description: "Master Microsoft Excel for work and business. Formulas, pivot tables, charts, and dashboards.",
    longDescription: "Excel is still the most demanded office skill. This course takes you from basic spreadsheet creation to advanced data analysis, pivot tables, and interactive dashboards. Essential for any office job.",
    category: "Microsoft Office",
    instructor: "Woli Dan",
    instructorRole: "Data Analyst",
    duration: "6 hours",
    lessonsCount: 20,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Excel Basics",
        lessons: [
          { id: "l1", title: "Excel Interface & Navigation", type: "video", duration: "10:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
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
    lessonsCount: 15,
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Word Essentials",
        lessons: [
          { id: "l1", title: "Word Interface & First Document", type: "video", duration: "08:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
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
    ],
    curriculum: [
      {
        id: "m1",
        title: "Presentation Design",
        lessons: [
          { id: "l1", title: "The Art of Presentations", type: "video", duration: "09:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        ]
      }
    ]
  }
];

// For demo: ensure all have at least 2 modules with 3 lessons
export const enrichCourses = (courses) => courses.map(c => {
  if (!c.curriculum || c.curriculum.length < 2) {
    return {
      ...c,
      curriculum: [
        {
          id: "m1",
          title: "Getting Started",
          lessons: [
            { id: `${c.id}-l1`, title: `Introduction to ${c.title}`, type: "video", duration: "12:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Welcome to the course!" },
            { id: `${c.id}-l2`, title: "Tools & Setup", type: "text", duration: "08:45", content: "In this lesson, we'll cover all the tools you need to get started with this course. Make sure you have everything installed before proceeding." },
            { id: `${c.id}-l3`, title: "Your First Project", type: "video", duration: "15:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Let's build something together!" },
          ]
        },
        {
          id: "m2",
          title: "Core Concepts",
          lessons: [
            { id: `${c.id}-l4`, title: "Understanding the Fundamentals", type: "video", duration: "18:10", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { id: `${c.id}-l5`, title: "Hands-On Practice", type: "video", duration: "22:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { id: `${c.id}-l6`, title: "Common Mistakes to Avoid", type: "text", duration: "10:00", content: "Here are the top mistakes beginners make and how to avoid them." },
          ]
        },
        {
          id: "m3",
          title: "Advanced Techniques & Monetization",
          lessons: [
            { id: `${c.id}-l7`, title: "Pro Techniques", type: "video", duration: "25:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { id: `${c.id}-l8`, title: "Building Your Portfolio", type: "video", duration: "20:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { id: `${c.id}-l9`, title: "How to Get Clients & Make Money", type: "text", duration: "19:45", content: "Now that you have the skills, let's talk about turning them into income. This lesson covers freelancing platforms, pricing, and client acquisition." },
          ]
        }
      ]
    }
  }
  return c;
});
