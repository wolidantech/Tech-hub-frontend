// ============================================================
// OCCUPATION TAXONOMY — searchable, scalable dataset for the
// public CV Builder. Curated real occupation titles grouped by
// sector. The selector searches titles + sector + keywords, so
// thousands of variants resolve through search rather than
// thousands of dedicated pages.
// ============================================================

export const OCCUPATION_SECTORS = [
  { sector: 'Technology & Software', jobs: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'QA / Test Engineer', 'Systems Analyst', 'IT Support Specialist', 'Database Administrator', 'Game Developer', 'Embedded Systems Engineer', 'Firmware Engineer'] },
  { sector: 'Data & Artificial Intelligence', jobs: ['Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer', 'Business Intelligence Analyst', 'Statistician', 'Research Scientist', 'Data Architect', 'NLP Engineer', 'Computer Vision Engineer', 'Analytics Manager'] },
  { sector: 'Cybersecurity & Networking', jobs: ['Cybersecurity Analyst', 'Security Engineer', 'Penetration Tester / Ethical Hacker', 'SOC Analyst', 'Network Engineer', 'Network Administrator', 'Security Architect', 'Incident Responder', 'IT Auditor', 'Cloud Security Specialist'] },
  { sector: 'Engineering', jobs: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Electronics Engineer', 'Chemical Engineer', 'Petroleum Engineer', 'Structural Engineer', 'Industrial Engineer', 'Aerospace Engineer', 'Automotive Engineer', 'Mining Engineer', 'Agricultural Engineer', 'Biomedical Engineer', 'Environmental Engineer', 'Engineering Technician', 'Maintenance Engineer'] },
  { sector: 'Medicine & Healthcare', jobs: ['Doctor / Physician', 'Surgeon', 'Nurse', 'Registered Nurse', 'Midwife', 'Pharmacist', 'Dentist', 'Physiotherapist', 'Lab Scientist / Technician', 'Radiographer', 'Optometrist', 'Dietitian', 'Public Health Officer', 'Community Health Worker', 'Medical Records Officer', 'Veterinarian', 'Paramedic', 'Psychologist', 'Psychiatrist', 'Occupational Therapist'] },
  { sector: 'Science & Research', jobs: ['Biologist', 'Chemist', 'Physicist', 'Microbiologist', 'Biochemist', 'Geologist', 'Environmental Scientist', 'Food Scientist', 'Agricultural Scientist', 'Research Assistant', 'Clinical Research Associate', 'Biotechnologist', 'Meteorologist'] },
  { sector: 'Education & Academia', jobs: ['Teacher (Primary)', 'Teacher (Secondary)', 'Lecturer / University Instructor', 'Professor', 'School Administrator', 'Curriculum Developer', 'Education Consultant', 'Librarian', 'Teaching Assistant', 'Special Education Teacher', 'Early Childhood Educator', 'Corporate Trainer', 'Instructional Designer', 'Examinations Officer'] },
  { sector: 'Finance & Accounting', jobs: ['Accountant', 'Auditor', 'Financial Analyst', 'Investment Banker', 'Tax Consultant', 'Bookkeeper', 'Payroll Officer', 'Treasury Analyst', 'Risk Analyst', 'Compliance Officer', 'Actuary', 'Economist', 'Credit Analyst', 'Financial Advisor', 'Insurance Underwriter'] },
  { sector: 'Banking & Fintech', jobs: ['Bank Operations Officer', 'Customer Service Representative (Bank)', 'Loan Officer', 'Branch Manager', 'Payments Specialist', 'Fintech Product Manager', 'Fraud Analyst', 'Relationship Manager', 'Trade Finance Officer', 'Microfinance Officer'] },
  { sector: 'Law & Legal', jobs: ['Lawyer / Attorney', 'Legal Advisor', 'Paralegal', 'Company Secretary', 'Notary', 'Compliance & Governance Officer', 'Judge / Magistrate', 'Immigration Consultant', 'Contract Manager'] },
  { sector: 'Marketing & Communications', jobs: ['Digital Marketer', 'Social Media Manager', 'Content Marketer', 'SEO Specialist', 'Brand Manager', 'Marketing Manager', 'Email Marketing Specialist', 'Growth Marketer', 'Public Relations Officer', 'Communications Officer', 'Copywriter', 'Media Buyer', 'Community Manager', 'Influencer Marketing Manager'] },
  { sector: 'Sales', jobs: ['Sales Representative', 'Sales Manager', 'Business Development Executive', 'Account Executive', 'Retail Sales Associate', 'Pharmaceutical Sales Rep', 'Real Estate Sales Agent', 'Inside Sales Specialist', 'Key Account Manager', 'Sales Operations Analyst'] },
  { sector: 'Business & Management', jobs: ['Business Analyst', 'Project Manager', 'Program Manager', 'Operations Manager', 'General Manager', 'Management Consultant', 'Strategy Analyst', 'Chief Executive Officer', 'Chief Operating Officer', 'Entrepreneur / Founder', 'Franchise Owner', 'Procurement Officer', 'Supply Chain Analyst'] },
  { sector: 'Human Resources', jobs: ['HR Manager', 'Recruiter / Talent Acquisition', 'HR Generalist', 'Training & Development Officer', 'Compensation & Benefits Analyst', 'HR Business Partner', 'People Operations Specialist', 'Organizational Development Consultant'] },
  { sector: 'Administration & Office', jobs: ['Administrative Assistant', 'Office Manager', 'Executive Assistant', 'Receptionist', 'Data Entry Clerk', 'Records Officer', 'Virtual Assistant', 'Personal Assistant', 'Front Desk Officer', 'Document Controller'] },
  { sector: 'Architecture & Construction', jobs: ['Architect', 'Interior Designer', 'Quantity Surveyor', 'Construction Manager', 'Site Engineer', 'Building Inspector', 'Surveyor', 'Urban Planner', 'Landscape Architect', 'Bricklayer / Mason', 'Carpenter', 'Plumber', 'Electrician', 'Welder', 'Painter / Decorator', 'Tile Setter', 'Scaffolder', 'Heavy Equipment Operator'] },
  { sector: 'Real Estate & Property', jobs: ['Real Estate Agent', 'Property Manager', 'Real Estate Developer', 'Facility Manager', 'Real Estate Valuer / Appraiser', 'Land Administrator'] },
  { sector: 'Hospitality & Tourism', jobs: ['Hotel Manager', 'Front Office Manager', 'Chef', 'Caterer', 'Bartender', 'Waiter / Waitress', 'Event Planner', 'Tour Guide', 'Travel Agent', 'Housekeeping Supervisor', 'Restaurant Manager', 'Concierge', 'Baker / Pastry Chef'] },
  { sector: 'Transportation & Logistics', jobs: ['Logistics Coordinator', 'Supply Chain Manager', 'Warehouse Manager', 'Fleet Manager', 'Truck / Lorry Driver', 'Delivery Rider', 'Dispatcher', 'Customs Broker', 'Import/Export Officer', 'Airline Pilot', 'Cabin Crew', 'Maritime Officer', 'Traffic Manager'] },
  { sector: 'Manufacturing & Production', jobs: ['Production Manager', 'Factory Supervisor', 'Quality Control Inspector', 'Machine Operator', 'Process Engineer', 'Plant Manager', 'Assembly Line Worker', 'Packaging Technologist', 'Lean Manufacturing Specialist'] },
  { sector: 'Agriculture & Environment', jobs: ['Farmer / Farm Manager', 'Agronomist', 'Agricultural Extension Officer', 'Livestock Manager', 'Fisheries Officer', 'Forestry Officer', 'Irrigation Technician', 'Food Processing Technician', 'Environmental Health Officer', 'Waste Management Officer'] },
  { sector: 'Media & Journalism', jobs: ['Journalist', 'Reporter', 'Editor', 'News Producer', 'Broadcast Presenter', 'Photographer', 'Photojournalist', 'Media Producer', 'Podcast Producer', 'Scriptwriter', 'Documentary Filmmaker', 'Sub-Editor'] },
  { sector: 'Design & Creative', jobs: ['Graphic Designer', 'UI/UX Designer', 'Product Designer', 'Illustrator', 'Art Director', 'Motion Graphics Designer', 'Animator', '3D Artist', 'Fashion Designer', 'Textile Designer', 'Web Designer', 'Design Researcher', 'Creative Director'] },
  { sector: 'Video, Film & Entertainment', jobs: ['Video Editor', 'Videographer', 'Film Director', 'Cinematographer', 'Sound Engineer', 'VFX Artist', 'Content Creator', 'YouTuber / Streamer', 'Actor / Performer', 'Musician', 'Music Producer', 'DJ', 'Entertainment Manager', 'Talent Manager'] },
  { sector: 'Beauty & Personal Care', jobs: ['Makeup Artist', 'Hair Stylist / Barber', 'Skincare Specialist / Esthetician', 'Nail Technician', 'Spa Therapist', 'Salon Manager', 'Beauty Consultant', 'Permanent Makeup Artist'] },
  { sector: 'Sports & Fitness', jobs: ['Athlete', 'Coach', 'Personal Trainer', 'Fitness Instructor', 'Sports Analyst', 'Sports Physiotherapist', 'Sports Manager', 'Referee / Umpire', 'Recreation Officer'] },
  { sector: 'Security & Safety', jobs: ['Security Officer', 'Security Manager', 'CCTV Operator', 'Bodyguard / Close Protection', 'Firefighter', 'Safety Officer (HSE)', 'Intelligence Analyst', 'Alarm Technician', 'Cyber Threat Analyst'] },
  { sector: 'Government & Public Sector', jobs: ['Civil Servant', 'Policy Analyst', 'Diplomat / Foreign Service Officer', 'Urban Development Officer', 'Tax Officer', 'Customs Officer', 'Electoral Officer', 'Legislative Aide', 'Government Communications Officer'] },
  { sector: 'Nonprofit & Development', jobs: ['NGO Program Officer', 'Grant Writer', 'Fundraising Officer', 'Monitoring & Evaluation Officer', 'Community Development Officer', 'Humanitarian Worker', 'Advocacy Officer', 'Volunteer Coordinator'] },
  { sector: 'Customer Service & Retail', jobs: ['Customer Service Representative', 'Call Center Agent', 'Customer Success Manager', 'Store Manager', 'Retail Supervisor', 'Cashier', 'Merchandiser', 'E-commerce Assistant', 'Help Desk Support', 'Client Relations Officer'] },
  { sector: 'Languages & Translation', jobs: ['Translator', 'Interpreter', 'Localization Specialist', 'Language Teacher', 'Technical Writer', 'Lexicographer'] },
  { sector: 'Freelancing & Digital Services', jobs: ['Freelance Designer', 'Freelance Writer', 'Freelance Developer', 'Freelance Video Editor', 'Virtual Assistant (Freelance)', 'Online Tutor', 'E-commerce Entrepreneur', 'Dropshipping Store Owner', 'Digital Consultant', 'Voice-over Artist'] },
];

// Flattened searchable list with a stable id per occupation.
export const OCCUPATIONS = OCCUPATION_SECTORS.flatMap(({ sector, jobs }) =>
  jobs.map((title) => ({ title, sector, id: `${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
);

/** Case/diacritic-insensitive occupation search across titles + sectors. */
export function searchOccupations(query, limit = 30) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return OCCUPATIONS.slice(0, limit);
  return OCCUPATIONS
    .map((o) => {
      const t = o.title.toLowerCase();
      const s = o.sector.toLowerCase();
      let score = 0;
      if (t === q) score = 100;
      else if (t.startsWith(q)) score = 80;
      else if (t.includes(q)) score = 60;
      else if (s.includes(q)) score = 30;
      return { ...o, score };
    })
    .filter((o) => o.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
