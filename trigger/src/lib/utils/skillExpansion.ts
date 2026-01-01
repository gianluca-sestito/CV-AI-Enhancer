import type { Skill } from "../types";

/**
 * Maps programming languages and technologies to commonly associated frameworks, tools, and libraries.
 * This helps expand required skills to include related skills that the user might have.
 */
const skillExpansionMap: Record<string, string[]> = {
  // Java ecosystem
  java: ["spring boot", "spring", "maven", "gradle", "junit", "hibernate", "jpa", "jdbc", "servlet", "jsp", "jsf", "struts", "apache tomcat", "jetty"],
  "spring boot": ["spring", "java", "maven", "gradle", "jpa", "hibernate", "rest api", "microservices"],
  spring: ["spring boot", "java", "maven", "gradle", "jpa", "hibernate"],
  
  // JavaScript/TypeScript ecosystem
  javascript: ["react", "vue", "angular", "node.js", "express", "typescript", "jquery", "webpack", "babel", "npm", "yarn"],
  typescript: ["react", "vue", "angular", "node.js", "express", "javascript", "webpack", "babel"],
  react: ["react hooks", "redux", "mobx", "next.js", "gatsby", "javascript", "typescript", "jsx", "webpack", "babel"],
  "react hooks": ["react", "javascript", "typescript"],
  vue: ["vuex", "nuxt.js", "javascript", "typescript", "vue router"],
  angular: ["rxjs", "ngrx", "typescript", "javascript", "angular material"],
  "node.js": ["express", "nest.js", "koa", "javascript", "typescript", "npm", "yarn", "pm2"],
  express: ["node.js", "javascript", "typescript", "rest api", "middleware"],
  
  // Python ecosystem
  python: ["django", "flask", "fastapi", "numpy", "pandas", "matplotlib", "scikit-learn", "tensorflow", "pytorch", "jupyter", "pip", "virtualenv"],
  django: ["python", "django rest framework", "postgresql", "mysql", "sqlite"],
  flask: ["python", "sqlalchemy", "jinja2", "rest api"],
  fastapi: ["python", "pydantic", "uvicorn", "async", "rest api"],
  
  // C# ecosystem
  "c#": [".net", "asp.net", "entity framework", "linq", "asp.net core", "blazor", "wpf", "winforms"],
  ".net": ["c#", "asp.net", "entity framework", "linq", "asp.net core"],
  "asp.net": ["c#", ".net", "entity framework", "mvc", "web api"],
  "asp.net core": ["c#", ".net", "entity framework", "rest api", "microservices"],
  
  // Go ecosystem
  go: ["golang", "gin", "echo", "gorilla", "gorm", "docker", "kubernetes", "microservices"],
  golang: ["go", "gin", "echo", "gorilla", "gorm"],
  
  // Rust ecosystem
  rust: ["cargo", "tokio", "actix", "serde", "wasm", "webassembly"],
  
  // PHP ecosystem
  php: ["laravel", "symfony", "codeigniter", "composer", "mysql", "postgresql"],
  laravel: ["php", "eloquent", "blade", "artisan", "composer"],
  symfony: ["php", "doctrine", "twig", "composer"],
  
  // Ruby ecosystem
  ruby: ["rails", "ruby on rails", "rspec", "bundler", "gem"],
  rails: ["ruby", "ruby on rails", "activerecord", "rspec"],
  "ruby on rails": ["ruby", "rails", "activerecord"],
  
  // Mobile development
  swift: ["ios", "swiftui", "uikit", "xcode", "cocoa pods", "core data"],
  kotlin: ["android", "jetpack compose", "coroutines", "gradle", "android studio"],
  "react native": ["react", "javascript", "typescript", "mobile", "ios", "android"],
  flutter: ["dart", "mobile", "ios", "android"],
  dart: ["flutter", "mobile"],
  
  // Database technologies
  sql: ["mysql", "postgresql", "sqlite", "oracle", "sql server", "mongodb"],
  mysql: ["sql", "php", "laravel", "django"],
  postgresql: ["sql", "django", "rails", "node.js"],
  mongodb: ["nosql", "node.js", "express", "mongoose"],
  
  // DevOps/Cloud
  docker: ["kubernetes", "containerization", "ci/cd", "devops", "docker compose"],
  kubernetes: ["docker", "containerization", "devops", "helm", "istio"],
  aws: ["cloud", "s3", "ec2", "lambda", "rds", "devops"],
  "ci/cd": ["jenkins", "github actions", "gitlab ci", "azure devops", "circleci", "travis ci"],
  
  // Frontend build tools
  webpack: ["javascript", "typescript", "react", "vue", "angular", "babel"],
  vite: ["javascript", "typescript", "react", "vue", "build tool"],
  
  // Testing
  jest: ["javascript", "typescript", "react", "node.js", "testing"],
  cypress: ["javascript", "typescript", "e2e testing", "testing"],
  selenium: ["testing", "automation", "python", "java", "javascript"],
};

/**
 * Normalizes a skill name for matching (lowercase, trim, remove special chars)
 */
function normalizeSkillName(skillName: string): string {
  return skillName.toLowerCase().trim();
}

/**
 * Finds related skills for a given required skill from the user's profile.
 * Returns an array of related skills that the user actually has in their profile.
 * 
 * @param requiredSkill - The skill required by the job description
 * @param userSkills - Array of skills from the user's profile
 * @returns Array of related skills found in the user's profile
 */
export function expandRelatedSkills(
  requiredSkill: string,
  userSkills: Skill[]
): Skill[] {
  const normalizedRequired = normalizeSkillName(requiredSkill);
  const relatedSkillNames = skillExpansionMap[normalizedRequired] || [];
  
  // Create a set of user skill names (normalized) for quick lookup
  const userSkillNames = new Set(
    userSkills.map(skill => normalizeSkillName(skill.name))
  );
  
  // Find related skills that the user actually has
  const foundRelatedSkills: Skill[] = [];
  
  for (const relatedSkillName of relatedSkillNames) {
    // Try to find exact match first
    const exactMatch = userSkills.find(
      skill => normalizeSkillName(skill.name) === relatedSkillName
    );
    
    if (exactMatch) {
      foundRelatedSkills.push(exactMatch);
      continue;
    }
    
    // Try partial match (e.g., "spring boot" matches "Spring Boot Framework")
    const partialMatch = userSkills.find(skill => {
      const normalized = normalizeSkillName(skill.name);
      return normalized.includes(relatedSkillName) || relatedSkillName.includes(normalized);
    });
    
    if (partialMatch) {
      foundRelatedSkills.push(partialMatch);
    }
  }
  
  return foundRelatedSkills;
}

/**
 * Expands multiple required skills and returns all related skills found in the user's profile.
 * 
 * @param requiredSkills - Array of skills required by the job description
 * @param userSkills - Array of skills from the user's profile
 * @returns Array of related skills found in the user's profile (deduplicated)
 */
export function expandAllRelatedSkills(
  requiredSkills: string[],
  userSkills: Skill[]
): Skill[] {
  const foundSkills = new Map<string, Skill>();
  
  for (const requiredSkill of requiredSkills) {
    const related = expandRelatedSkills(requiredSkill, userSkills);
    for (const skill of related) {
      // Use skill ID as key to avoid duplicates
      foundSkills.set(skill.id, skill);
    }
  }
  
  return Array.from(foundSkills.values());
}

