const Internship = require("../models/Internship");
const StudentProfile = require("../models/Studentprofilemodel");
const Application = require("../models/Application");

// ─────────────────────────────────────────────────────────────────────────────
// Helper utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Tokenise a free-text string into lowercase words */
const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

/** Normalise a skill alias to a canonical name */
const SKILL_ALIASES = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  ml: "machine learning",
  ai: "artificial intelligence",
  dl: "deep learning",
  nlp: "natural language processing",
  cv: "computer vision",
  db: "database",
  sql: "sql",
  nosql: "mongodb",
  node: "nodejs",
  "node.js": "nodejs",
  react: "reactjs",
  "react.js": "reactjs",
  angular: "angularjs",
  vue: "vuejs",
  "vue.js": "vuejs",
  css: "css",
  html: "html",
  ds: "data structures",
  algo: "algorithms",
  dsa: "data structures and algorithms",
};

const normalizeSkill = (skill) => {
  const s = skill.toLowerCase().trim();
  return SKILL_ALIASES[s] || s;
};

/** Extract skills from a comma/slash/newline-separated string */
const parseSkills = (text = "") =>
  text
    .split(/[,;\n/|]+/)
    .map((s) => normalizeSkill(s.trim()))
    .filter(Boolean);

/** Domain-to-branch affinity map */
const DOMAIN_BRANCH_MAP = {
  software: ["cse", "cs", "information technology", "it", "mca", "bca", "computer science"],
  webdev: ["cse", "cs", "it", "information technology", "mca"],
  dataanalytics: ["cse", "cs", "it", "mathematics", "statistics", "ece"],
  machinelearning: ["cse", "cs", "it", "mathematics", "ece", "eee"],
  artificialintelligence: ["cse", "cs", "it", "mathematics", "ece"],
  embedded: ["ece", "eee", "electrical", "electronics"],
  hardware: ["ece", "eee", "electrical", "mechanical"],
  mechanical: ["mechanical", "mech", "production", "automobile"],
  civil: ["civil", "structural"],
  marketing: ["mba", "bba", "management", "commerce"],
  design: ["cse", "it", "arts", "design", "fashion"],
  finance: ["commerce", "finance", "economics", "mba", "bba"],
};

/** Keywords that suggest a domain from description / title text */
const DOMAIN_KEYWORDS = {
  software: ["software", "developer", "programming", "coding", "app", "application", "backend", "frontend", "fullstack"],
  webdev: ["web", "html", "css", "javascript", "react", "angular", "vue", "frontend", "backend", "node", "django", "flask"],
  dataanalytics: ["data", "analytics", "analysis", "sql", "excel", "tableau", "power bi", "business intelligence"],
  machinelearning: ["machine learning", "ml", "deep learning", "neural", "sklearn", "tensorflow", "pytorch", "classification", "regression", "model"],
  artificialintelligence: ["artificial intelligence", "ai", "nlp", "computer vision", "generative", "llm", "chatbot"],
  embedded: ["embedded", "firmware", "iot", "arduino", "raspberry", "microcontroller", "rtos"],
  hardware: ["hardware", "circuit", "pcb", "vlsi", "fpga", "electronic"],
  mechanical: ["mechanical", "cad", "solidworks", "autocad", "manufacturing", "production"],
  civil: ["civil", "construction", "structural", "autocad", "revit"],
  marketing: ["marketing", "seo", "social media", "digital marketing", "brand", "content", "campaign"],
  design: ["design", "ui", "ux", "figma", "adobe", "photoshop", "illustrator", "graphic"],
  finance: ["finance", "accounting", "investment", "banking", "audit", "taxation", "fintech"],
};

/** Infer domain from title + description text */
const inferDomain = (text = "") => {
  const lower = text.toLowerCase();
  let best = null;
  let bestCount = 0;
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const count = keywords.filter((kw) => lower.includes(kw)).length;
    if (count > bestCount) { bestCount = count; best = domain; }
  }
  return best;
};

/** Extract minimum GPA requirement from eligibility / description text */
const extractMinGPA = (text = "") => {
  const patterns = [
    /(?:minimum|min\.?|required)?\s*(?:gpa|cgpa)\s*(?:of|:)?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:gpa|cgpa)\s*(?:or|and)?\s*above/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
};

/** Extract minimum year requirement from eligibility text */
const extractMinYear = (text = "") => {
  const m = text.match(/(\d+)(?:st|nd|rd|th)?\s*year\s*(?:or\s*above)?/i);
  return m ? parseInt(m[1]) : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Scoring factors (each returns 0–100)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FACTOR 1: Skills Match — 40 points
 * Tokenises student skills and compares against:
 *   1. internship.requiredSkills (if set)
 *   2. keywords extracted from title + description
 */
const scoreSkills = (studentProfile, internship) => {
  const studentSkills = new Set(parseSkills(studentProfile.skills));

  if (studentSkills.size === 0) return { score: 0, matched: [], missing: [] };

  // Build internship skill set from requiredSkills + description tokens
  const internshipSkillText = [
    internship.requiredSkills || "",
    internship.title,
    internship.description,
  ].join(" ");

  const internshipTokens = tokenize(internshipSkillText);

  // Only keep tokens that look like recognisable techskills (≥2 chars, not stop words)
  const STOP_WORDS = new Set(["the", "and", "for", "with", "that", "this", "are", "from", "will", "must", "have", "should", "can", "experience", "knowledge", "internship", "opportunity", "students", "candidate", "candidates"]);
  const internshipSkills = new Set(
    internshipTokens
      .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
      .map(normalizeSkill)
  );

  if (internshipSkills.size === 0) return { score: 50, matched: [], missing: [] }; // no requirements → neutral

  const matched = [...studentSkills].filter((s) => internshipSkills.has(s));
  const missing = [...internshipSkills].filter((s) => {
    // Only report "missing" for skills we recognise in student dictionary
    const knownSkills = new Set([...parseSkills(studentProfile.skills)]);
    return !knownSkills.has(s) && s.length > 2;
  }).slice(0, 5);

  // Score = matched / total required (capped at 100)
  const relevantRequired = Math.min(internshipSkills.size, 15); // cap denominator
  const rawScore = Math.min((matched.length / Math.max(relevantRequired, 1)) * 100, 100);
  return { score: Math.round(rawScore), matched, missing };
};

/**
 * FACTOR 2: GPA Score — 20 points
 */
const scoreGPA = (studentProfile, internship) => {
  const studentGPA = parseFloat(studentProfile.gpa);
  if (isNaN(studentGPA)) return { score: 0, detail: "GPA not set" };

  const combText = `${internship.eligibility || ""} ${internship.description}`;
  const minGPA = extractMinGPA(combText);

  if (!minGPA) {
    // No GPA requirement — reward higher GPAs slightly
    const bonus = Math.min((studentGPA / 10) * 100, 100);
    return { score: Math.round(bonus), detail: "No minimum GPA required" };
  }

  if (studentGPA >= minGPA) {
    // Reward exceeding the requirement
    const excess = Math.min(((studentGPA - minGPA) / (10 - minGPA)) * 30, 30);
    return { score: Math.round(70 + excess), detail: `Meets minimum GPA of ${minGPA}` };
  }

  // Below required — partial credit
  const ratio = studentGPA / minGPA;
  return { score: Math.round(ratio * 50), detail: `GPA ${studentGPA} below required ${minGPA}` };
};

/**
 * FACTOR 3: Branch Relevance — 15 points
 */
const scoreBranch = (studentProfile, internship) => {
  const studentBranch = (studentProfile.branch || "").toLowerCase();

  // Determine the internship domain (from field or inferred)
  const domainText = `${internship.domain || ""} ${internship.title} ${internship.description}`;
  const domain = (internship.domain || "").toLowerCase().replace(/\s+/g, "") || inferDomain(domainText);

  if (!domain) return { score: 70, detail: "Domain not specified — partial match" };

  const affinityBranches = DOMAIN_BRANCH_MAP[domain] || [];
  const exactMatch = affinityBranches.some((b) => studentBranch.includes(b) || b.includes(studentBranch.substring(0, 3)));

  if (exactMatch) return { score: 100, detail: `${studentProfile.branch} aligns with ${domain} domain` };

  // Partial: check for cross-domain overlap (e.g. ECE can do some data roles)
  const partial = affinityBranches.some((b) =>
    ["ece", "eee"].includes(studentBranch.substring(0, 3)) && ["dataanalytics", "machinelearning"].includes(domain)
  );
  if (partial) return { score: 60, detail: "Adjacent branch — some overlap" };

  return { score: 30, detail: `${internship.domain || domain} prefers different branch` };
};

/**
 * FACTOR 4: Year of Study — 10 points
 */
const scoreYear = (studentProfile, internship) => {
  const studentYear = parseInt(studentProfile.yearOfStudy);
  if (isNaN(studentYear)) return { score: 0, detail: "Year of study not set" };

  const combText = `${internship.eligibility || ""} ${internship.description}`;
  const minYear = extractMinYear(combText);

  if (!minYear) return { score: 80, detail: "No year requirement specified" };
  if (studentYear >= minYear) return { score: 100, detail: `Year ${studentYear} meets requirement` };

  return { score: Math.round((studentYear / minYear) * 60), detail: `${minYear}rd+ year preferred` };
};

/**
 * FACTOR 5: Profile Completeness — 10 points
 */
const scoreProfileCompleteness = (studentProfile) => {
  let score = 40; // base for having a profile at all
  const bonuses = [];

  if (studentProfile.github) { score += 25; bonuses.push("GitHub profile linked"); }
  if (studentProfile.linkedin) { score += 25; bonuses.push("LinkedIn profile linked"); }
  if (studentProfile.resume) { score += 10; bonuses.push("Resume uploaded"); }

  return { score: Math.min(score, 100), bonuses };
};

/**
 * FACTOR 6: Degree Match — 5 points
 */
const scoreDegree = (studentProfile, internship) => {
  const degree = (studentProfile.degree || "").toLowerCase();
  const descLower = `${internship.description} ${internship.eligibility || ""}`.toLowerCase();

  // Most internships are open to any degree — default high score
  if (!descLower.includes("mca") && !descLower.includes("bca") && !descLower.includes("mba")) {
    return { score: 85, detail: "Open to all degrees" };
  }

  const matches = ["b.tech", "be", "btech", "bca", "mca", "mba", "m.tech", "mtech", "bsc", "msc"].filter(
    (d) => degree.includes(d) && descLower.includes(d)
  );

  return {
    score: matches.length > 0 ? 100 : 60,
    detail: matches.length > 0 ? `${studentProfile.degree} is preferred` : "Degree not explicitly required",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main matching function
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  skills: 0.40,
  gpa: 0.20,
  branch: 0.15,
  year: 0.10,
  profile: 0.10,
  degree: 0.05,
};

const matchStudent = (studentProfile, internship) => {
  const skills = scoreSkills(studentProfile, internship);
  const gpa = scoreGPA(studentProfile, internship);
  const branch = scoreBranch(studentProfile, internship);
  const year = scoreYear(studentProfile, internship);
  const profile = scoreProfileCompleteness(studentProfile);
  const degree = scoreDegree(studentProfile, internship);

  const totalScore = Math.round(
    skills.score * WEIGHTS.skills +
    gpa.score * WEIGHTS.gpa +
    branch.score * WEIGHTS.branch +
    year.score * WEIGHTS.year +
    profile.score * WEIGHTS.profile +
    degree.score * WEIGHTS.degree
  );

  // ── Match reasons ────────────────────────────────────────────────────────
  const matchReasons = [];
  if (skills.score >= 60 && skills.matched.length > 0)
    matchReasons.push(`✅ Your skills (${skills.matched.slice(0, 4).join(", ")}) match this role`);
  if (gpa.score >= 70)
    matchReasons.push(`✅ ${gpa.detail}`);
  if (branch.score >= 70)
    matchReasons.push(`✅ ${branch.detail}`);
  if (year.score >= 80)
    matchReasons.push(`✅ ${year.detail}`);
  if (profile.bonuses.length > 0)
    matchReasons.push(`✅ Strong profile: ${profile.bonuses.join(", ")}`);
  if (degree.score >= 85)
    matchReasons.push(`✅ ${degree.detail}`);

  // ── Improvement suggestions ──────────────────────────────────────────────
  const improvements = [];
  if (skills.score < 60) {
    const missingTip = skills.missing.length > 0
      ? `Learn: ${skills.missing.slice(0, 3).join(", ")}`
      : "Add more relevant skills to your profile";
    improvements.push(`💡 Skills gap — ${missingTip}`);
  }
  if (gpa.score < 70 && gpa.detail.includes("below"))
    improvements.push(`💡 GPA improvement needed — ${gpa.detail}`);
  if (branch.score < 60)
    improvements.push(`💡 ${branch.detail} — focus on cross-domain projects`);
  if (!studentProfile.github)
    improvements.push("💡 Add your GitHub profile to boost match score by ~25%");
  if (!studentProfile.linkedin)
    improvements.push("💡 Link your LinkedIn to increase profile completeness");
  if (skills.missing.length > 0 && skills.score >= 60)
    improvements.push(`💡 To further improve: consider adding ${skills.missing.slice(0, 2).join(", ")} to your skill set`);

  // ── Tier ────────────────────────────────────────────────────────────────
  let tier;
  if (totalScore >= 80) tier = "Excellent";
  else if (totalScore >= 60) tier = "Good";
  else if (totalScore >= 40) tier = "Fair";
  else tier = "Low";

  return {
    internship,
    totalScore,
    tier,
    breakdown: {
      skills: { score: skills.score, weight: 40, matched: skills.matched.slice(0, 6), missing: skills.missing.slice(0, 4) },
      gpa: { score: gpa.score, weight: 20, detail: gpa.detail },
      branch: { score: branch.score, weight: 15, detail: branch.detail },
      year: { score: year.score, weight: 10, detail: year.detail },
      profile: { score: profile.score, weight: 10, bonuses: profile.bonuses },
      degree: { score: degree.score, weight: 5, detail: degree.detail },
    },
    matchReasons,
    improvements,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

exports.getRecommendations = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found. Please complete your profile first." });
    }

    const internships = await Internship.find({ status: "Open" }).populate("companyId", "companyName");

    // Fetch already-applied internship IDs to flag them
    const applications = await Application.find({ studentId: req.user.id });
    const appliedIds = new Set(applications.map((a) => String(a.internshipId)));

    const results = internships
      .map((internship) => {
        const match = matchStudent(studentProfile, internship);
        return { ...match, alreadyApplied: appliedIds.has(String(internship._id)) };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    // Profile strength summary
    const profileStrength = {
      hasGitHub: !!studentProfile.github,
      hasLinkedIn: !!studentProfile.linkedin,
      hasResume: !!studentProfile.resume,
      skillCount: parseSkills(studentProfile.skills).length,
      gpa: studentProfile.gpa,
      completenessScore: scoreProfileCompleteness(studentProfile).score,
    };

    res.json({ results, profileStrength, studentProfile });
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ message: err.message });
  }
};
