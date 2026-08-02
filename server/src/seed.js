import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

// Only creates the admin user if none exists yet — never overwrites an
// existing password hash, so this stays safe to run on every server boot
// without undoing a password change made later via Admin > Change Password.
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);
if (!existingAdmin) {
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(
    adminUsername,
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10)
  );
  console.log(`Admin user created: ${adminUsername}`);
} else {
  console.log(`Admin user already exists: ${adminUsername}`);
}

// ---- Site settings ----
const settings = {
  site_title: 'GlobalNest Study Solution',
  meta_description: 'From Australian beaches to Korean tech hubs...GlobalNest makes it happen.',
  tagline: 'Navigating Your Educational Horizon with Integrity',
  footer_tagline: 'Your Pathway to World-Class Education',
  phone: '+880 1XXX-XXXXXX',
  whatsapp: '+880 1XXX-XXXXXX',
  email: 'info@globalneststudy.com',
  address: 'Update this address from Admin > Settings, Dhaka, Bangladesh',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  services_disclaimer: 'Our services provide professional guidance for student admissions and visa processing. While we ensure high standards of accuracy, we do not guarantee visa approval.',
};
const upsertSetting = db.prepare(
  'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);
for (const [k, v] of Object.entries(settings)) upsertSetting.run(k, JSON.stringify(v));

// ---- Hero slides ----
if (db.prepare('SELECT COUNT(*) c FROM hero_slides').get().c === 0) {
  const stmt = db.prepare(
    'INSERT INTO hero_slides (headline, subheadline, image_url, cta_label, cta_link, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)'
  );
  stmt.run('Your dream to study abroad can start here!', 'Navigating Your Educational Horizon with Integrity', '', 'Start Your Journey', '/contact', 1);
  stmt.run('Your Pathway to Higher Study', 'Expert, transparent guidance across seven global destinations', '', 'Explore Destinations', '/services', 2);
}

// ---- About content ----
db.prepare(
  `INSERT INTO about_content (id, mission, vision, intro) VALUES (1, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET mission = excluded.mission, vision = excluded.vision, intro = excluded.intro`
).run(
  'We are dedicated to providing expert, transparent, and personalized guidance that simplifies the complexities of university admissions and visa processing.',
  'We aim to be the leading force in educational and migration consultancy across our destination countries.',
  'We provide elegant and streamlined solutions for students seeking international academic excellence — handling everything from course selection through student visa acquisition across seven destinations, with transparency and student success at our core.'
);

// ---- Core values ----
if (db.prepare('SELECT COUNT(*) c FROM core_values').get().c === 0) {
  const stmt = db.prepare('INSERT INTO core_values (title, description, sort_order) VALUES (?, ?, ?)');
  stmt.run('Honesty Without Borders', 'We believe in complete transparency at every step, giving you honest advice even when it is not what you want to hear.', 1);
  stmt.run('Deep Expertise', 'Our team brings specialized, up-to-date knowledge of admissions and visa requirements across seven countries.', 2);
  stmt.run('Your Story, Your Path', 'Every student journey is unique. We tailor our guidance to your goals, background, and aspirations.', 3);
  stmt.run('Accountability', 'We stand behind our guidance and support you at every stage, from first consultation to post-arrival.', 4);
}

// ---- Why choose us pillars ----
if (db.prepare('SELECT COUNT(*) c FROM why_choose_pillars').get().c === 0) {
  const stmt = db.prepare('INSERT INTO why_choose_pillars (title, headline, description, sort_order) VALUES (?, ?, ?, ?)');
  stmt.run('Value & Transparency', 'Honest Pricing, Real Value', 'No hidden fees, ever. We believe in clear, upfront pricing so you always know exactly what you are paying for.', 1);
  stmt.run('Trust & Proof', 'A Legacy of Success Stories', 'Thousands of successful admissions and visa approvals across our destination countries speak for themselves.', 2);
  stmt.run('Speed & Precision', 'Accuracy That Accelerates Outcomes', 'Meticulous, error-free applications that move through the process faster.', 3);
  stmt.run('Support & Partnership', 'By Your Side, Always', 'Around-the-clock support from your first consultation through your arrival abroad.', 4);
}

// ---- Target countries ----
if (db.prepare('SELECT COUNT(*) c FROM target_countries').get().c === 0) {
  const stmt = db.prepare(
    'INSERT INTO target_countries (name, slug, tagline, highlight, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)'
  );
  stmt.run('Australia', 'australia', 'Top-100 universities & strong post-grad employment', 'Top-100 Universities', '', 1);
  stmt.run('United Kingdom', 'united-kingdom', 'Historic institutions, globally respected degrees', 'World-Renowned Degrees', '', 2);
  stmt.run('New Zealand', 'new-zealand', 'Creative, research-focused education', 'Research-Focused', '', 3);
  stmt.run('Finland', 'finland', 'Free-thinking education system & top quality of life', 'Top Quality of Life', '', 4);
  stmt.run('South Korea', 'south-korea', 'A global innovation leader', 'Innovation Leader', '', 5);
  stmt.run('Malaysia', 'malaysia', 'World-class, affordable degrees', 'Affordable Degrees', '', 6);
  stmt.run('Malta', 'malta', 'English-speaking gateway to Europe', 'Gateway to Europe', '', 7);
}

// ---- Working process steps ----
if (db.prepare('SELECT COUNT(*) c FROM working_process_steps').get().c === 0) {
  const stmt = db.prepare('INSERT INTO working_process_steps (step_number, title, description, sort_order) VALUES (?, ?, ?, ?)');
  stmt.run(1, 'Initial Consultation', 'A free session to understand your goals, academic background, and ideal destination.', 1);
  stmt.run(2, 'Action Orientation', 'We prepare your application, documentation, and Statement of Purpose with precision.', 2);
  stmt.run(3, 'Submission and Support', 'We lodge your application and visa file, briefing you every step of the way to your departure.', 3);
}

// ---- Testimonials (placeholder sample data — replace with real success stories from Admin) ----
if (db.prepare('SELECT COUNT(*) c FROM testimonials').get().c === 0) {
  const stmt = db.prepare('INSERT INTO testimonials (name, quote, country, image_url, sort_order) VALUES (?, ?, ?, ?, ?)');
  stmt.run('Sample Student', 'Replace this with a real success story from Admin > Testimonials. GlobalNest guided me through every step of my visa application.', 'Australia', '', 1);
  stmt.run('Sample Student', 'Replace this with a real success story from Admin > Testimonials. The team was transparent and responsive throughout.', 'Malta', '', 2);
}

// ---- Blog (placeholder starter post) ----
if (db.prepare('SELECT COUNT(*) c FROM blog_posts').get().c === 0) {
  db.prepare(
    `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, is_published, published_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`
  ).run(
    'Welcome to the GlobalNest Blog',
    'welcome-to-the-globalnest-blog',
    'Weekly updates on scholarships, visa policy changes, and student lifestyle guidance — edit or delete this post from Admin > Blog.',
    'This is a placeholder post. Use the Admin panel to publish weekly updates covering scholarships, visa policy changes, and student lifestyle guidance for our seven destination countries.',
    '',
    'GlobalNest Team'
  );
}

// ---- Country services ----
const countryServices = [
  {
    country_name: 'Australia',
    slug: 'australia',
    page_title: 'Australian Student Visa (Subclass 500) | GlobalNest Study Solution',
    meta_description: 'Expert guidance for the Australian Student Visa Subclass 500 — Genuine Student requirement, financial capacity, and end-to-end application support.',
    hero_tagline: 'Navigating Australian visa requirements can be complex — we make it simple.',
    intro: 'Australia is home to some of the world’s top-100 universities and offers outstanding post-graduate employment pathways. Our team guides you through every requirement of the Subclass 500 Student Visa.',
    why_choose_points: ['Genuine Student (GS) expertise', 'High success rate', 'Full-service partnership model'],
    requirements: [
      { title: 'Confirmation of Enrolment (CoE)', description: 'Official proof of your university acceptance.' },
      { title: 'Genuine Student Requirement', description: 'Replaces the previous GTE statement; requires demonstrating your academic goals, course selection reasoning, and ties to your home country.' },
      { title: 'Financial Capacity', description: 'Proof of funds covering tuition, travel, and 12 months of living expenses.' },
      { title: 'English Language Proficiency', description: 'IELTS, PTE, or equivalent test scores.' },
      { title: 'Health & Character', description: 'Medical examination and police clearance certificate.' },
    ],
    process_steps: [
      { title: 'Career & Course Counseling', description: 'We assess your goals and shortlist the right courses and universities.' },
      { title: 'Admission & CoE Management', description: 'We manage your application through to Confirmation of Enrolment.' },
      { title: 'Strategic Visa File Preparation', description: 'We prepare a compliant, well-evidenced visa file addressing the Genuine Student requirement.' },
      { title: 'Lodgement & Post-Arrival Support', description: 'We lodge your visa and support you through pre-departure and arrival.' },
    ],
    faqs: [
      { q: 'What is the new Genuine Student (GS) requirement?', a: 'It replaces the previous GTE statement and requires you to demonstrate genuine academic intent, appropriate course selection, and ties to your home country.' },
      { q: 'Can I work while studying in Australia?', a: 'Yes — up to 48 hours per fortnight during study periods, and unlimited hours during scheduled course breaks.' },
      { q: 'Can I bring my family with me?', a: 'Family inclusion is possible subject to meeting additional financial requirements.' },
    ],
    processing_time: '', visa_fee: '', tuition_range: '', living_cost: '', extra_notes: '',
  },
  {
    country_name: 'South Korea',
    slug: 'south-korea',
    page_title: 'South Korea Student Visa | GlobalNest Study Solution',
    meta_description: 'Study in South Korea — affordable, globally recognized universities with clear visa file preparation support from GlobalNest.',
    hero_tagline: 'Study in a global innovation leader — affordably.',
    intro: 'South Korea combines high-quality, globally recognized universities with affordable tuition and living costs, plus real pathways to part-time work, a work permit, and permanent residence.',
    why_choose_points: [
      'High-quality globally recognized universities',
      'Affordable tuition versus Western countries',
      'Low accommodation costs',
      'Part-time work opportunities',
      'Work permit and permanent residence pathways',
    ],
    requirements: [
      { title: 'Valid Passport', description: '' },
      { title: 'Certificate of Admission', description: '' },
      { title: 'Birth / Family Certificates', description: '' },
      { title: 'Financial Proof', description: '6-month bank statements' },
      { title: 'Tax Certificates', description: '' },
      { title: 'Guarantor Documentation', description: '' },
      { title: 'Police Clearance', description: '' },
      { title: 'Educational Records', description: '' },
      { title: 'TB Test', description: '' },
      { title: 'English Test Scores', description: '' },
      { title: 'Air Reservation', description: '' },
    ],
    process_steps: [
      { title: 'Career & Course Guidance', description: '' },
      { title: 'University Admission & Acceptance Letter', description: '' },
      { title: 'Comprehensive Visa File Preparation', description: '' },
      { title: 'Visa Lodgement & Post-Arrival Assistance', description: '' },
    ],
    faqs: [],
    processing_time: '', visa_fee: '', tuition_range: '', living_cost: '', extra_notes: '',
  },
  {
    country_name: 'Malaysia',
    slug: 'malaysia',
    page_title: 'Malaysia Student Visa | GlobalNest Study Solution',
    meta_description: 'World-class, affordable degrees in Malaysia — visa requirements, costs, and step-by-step guidance from GlobalNest.',
    hero_tagline: 'World-class degrees, exceptional affordability.',
    intro: 'Malaysia offers internationally recognized degrees at a fraction of Western tuition costs, with a straightforward visa process when your file is prepared correctly.',
    why_choose_points: ['Affordable, globally recognized degrees', 'Fast admission turnaround', 'Straightforward visa process'],
    requirements: [
      { title: 'University Admission & Offer Letter', description: 'Typical turnaround of 2–4 weeks.' },
      { title: 'Financial Proof', description: 'Minimum bank statement of 8–10 lakhs BDT.' },
      { title: 'English Language Proficiency', description: 'IELTS 5.5–6.5, PTE 58–65, TOEFL 60–80, or Duolingo 90–105.' },
      { title: 'Health & Character', description: 'Medical examination and police clearance.' },
      { title: 'Visa File Preparation & Lodgement', description: 'Complete, compliant visa file preparation and submission.' },
    ],
    process_steps: [
      { title: 'Career & Course Counseling', description: '' },
      { title: 'Admission & Offer Letter', description: '' },
      { title: 'Visa File Preparation', description: '' },
      { title: 'Visa Lodgement & Post-Arrival Support', description: '' },
    ],
    faqs: [
      { q: 'Can I work part-time while studying in Malaysia?', a: 'Officially, part-time work is restricted for international students.' },
      { q: 'What is the tuition range?', a: '20,000–70,000 RM for Bachelor’s, and 25,000–80,000 RM for Master’s programs.' },
      { q: 'What are typical living costs?', a: 'Around 1,000–1,200 RM per month on average.' },
      { q: 'Are scholarships available?', a: 'Yes, ranging from 10–70% depending on merit.' },
      { q: 'Can my family join me?', a: 'Family visas are available for spouses and dependents.' },
    ],
    processing_time: '2-4 weeks', visa_fee: 'USD 100', tuition_range: '20,000–70,000 RM (Bachelor’s), 25,000–80,000 RM (Master’s)', living_cost: '1,000–1,200 RM / month', extra_notes: '',
  },
  {
    country_name: 'Malta',
    slug: 'malta',
    page_title: 'Malta Student Visa | GlobalNest Study Solution',
    meta_description: 'Study in Malta, the English-speaking gateway to Europe — visa requirements, costs, and guidance from GlobalNest.',
    hero_tagline: 'Your English-speaking gateway to studying in Europe.',
    intro: 'Malta offers Mediterranean study opportunities with English-taught programs, a clear visa pathway, and strong post-study work options.',
    why_choose_points: ['English-speaking EU destination', 'Mediterranean lifestyle', 'Clear post-study work pathway'],
    requirements: [
      { title: 'University Admission & Offer Letter', description: 'Typical turnaround of 10–20 days.' },
      { title: 'Financial Capacity', description: '€11,500–€14,500 bank statement required.' },
      { title: 'English Language Proficiency', description: 'IELTS 5.5–6.5, PTE 48+, TOEFL 65+, Duolingo 90+; a one-year foundation course is available without IELTS.' },
      { title: 'Health & Character', description: 'Medical examination and police clearance.' },
      { title: 'Visa File Preparation & Lodgement', description: 'Complete, compliant visa file preparation and submission.' },
    ],
    process_steps: [
      { title: 'Career & Course Guidance', description: '' },
      { title: 'Admission & Offer Letter Support', description: '' },
      { title: 'Expert Visa File Preparation', description: '' },
      { title: 'Visa Submission & Post-Arrival Assistance', description: '' },
    ],
    faqs: [
      { q: 'Can I work while studying in Malta?', a: 'Yes, up to 20 hours per week, provided you maintain a minimum of 15 class hours weekly. Typical wages are €8–12/hour.' },
      { q: 'What is the tuition range?', a: '€5,500–€10,500 annually.' },
      { q: 'What are typical living costs?', a: '€300–900 per month.' },
      { q: 'Can my family join me?', a: 'Family visas are available for Master’s students under specific conditions.' },
      { q: 'Are scholarships available?', a: 'Yes, up to 20% based on merit.' },
      { q: 'Can I stay and work after graduating?', a: 'Post-study work permits range from 6 months to 1 year, with pathways to 5-year residence.' },
    ],
    processing_time: '15-40 days', visa_fee: '€100', tuition_range: '€5,500–€10,500 / year', living_cost: '€300–900 / month', extra_notes: '',
  },
  {
    country_name: 'United Kingdom',
    slug: 'united-kingdom',
    page_title: 'UK Student Visa | GlobalNest Study Solution',
    meta_description: 'Study at world-renowned UK institutions — guidance from GlobalNest Study Solution.',
    hero_tagline: 'Detailed guidance for the UK is being finalized by our team.',
    intro: 'Full visa and admission guidance for the United Kingdom is coming soon. Contact us today for personalized support in the meantime.',
    why_choose_points: [], requirements: [], process_steps: [], faqs: [],
    processing_time: '', visa_fee: '', tuition_range: '', living_cost: '', extra_notes: '',
  },
  {
    country_name: 'New Zealand',
    slug: 'new-zealand',
    page_title: 'New Zealand Student Visa | GlobalNest Study Solution',
    meta_description: 'Creative, research-focused education in New Zealand — guidance from GlobalNest Study Solution.',
    hero_tagline: 'Detailed guidance for New Zealand is being finalized by our team.',
    intro: 'Full visa and admission guidance for New Zealand is coming soon. Contact us today for personalized support in the meantime.',
    why_choose_points: [], requirements: [], process_steps: [], faqs: [],
    processing_time: '', visa_fee: '', tuition_range: '', living_cost: '', extra_notes: '',
  },
  {
    country_name: 'Finland',
    slug: 'finland',
    page_title: 'Finland Student Visa | GlobalNest Study Solution',
    meta_description: 'Free-thinking education and top quality of life in Finland — guidance from GlobalNest Study Solution.',
    hero_tagline: 'Detailed guidance for Finland is being finalized by our team.',
    intro: 'Full visa and admission guidance for Finland is coming soon. Contact us today for personalized support in the meantime.',
    why_choose_points: [], requirements: [], process_steps: [], faqs: [],
    processing_time: '', visa_fee: '', tuition_range: '', living_cost: '', extra_notes: '',
  },
];

if (db.prepare('SELECT COUNT(*) c FROM country_services').get().c === 0) {
  const stmt = db.prepare(
    `INSERT INTO country_services
      (country_name, slug, page_title, meta_description, hero_tagline, intro, why_choose_points, requirements, process_steps, faqs, processing_time, visa_fee, tuition_range, living_cost, extra_notes, sort_order, is_published)
     VALUES (@country_name, @slug, @page_title, @meta_description, @hero_tagline, @intro, @why_choose_points, @requirements, @process_steps, @faqs, @processing_time, @visa_fee, @tuition_range, @living_cost, @extra_notes, @sort_order, 1)`
  );
  countryServices.forEach((c, i) => {
    stmt.run({
      ...c,
      why_choose_points: JSON.stringify(c.why_choose_points),
      requirements: JSON.stringify(c.requirements),
      process_steps: JSON.stringify(c.process_steps),
      faqs: JSON.stringify(c.faqs),
      sort_order: i + 1,
    });
  });
}

console.log('Seed complete.');
