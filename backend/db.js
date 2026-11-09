const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Stage Rubric Definitions for CSE Department
const STAGE_RUBRICS = {
  synopsis: {
    maxTotal: 30,
    criteria: [
      { id: 'c1', name: 'Problem Definition & Clarity', maxMarks: 10, description: 'Identification of real-world problem, objective formulation' },
      { id: 'c2', name: 'Literature Survey & Feasibility', maxMarks: 10, description: 'Understanding of related work, technical feasibility' },
      { id: 'c3', name: 'Proposed Methodology & Architecture', maxMarks: 10, description: 'Conceptual block diagram, choice of technologies' }
    ]
  },
  review1: {
    maxTotal: 30,
    criteria: [
      { id: 'c1', name: 'Literature Survey Depth & SRS', maxMarks: 10, description: 'Requirement specification, functional & non-functional requirements' },
      { id: 'c2', name: 'High-Level System Design & UML', maxMarks: 10, description: 'Architecture diagram, DFD, ER / Class diagrams' },
      { id: 'c3', name: 'Presentation & Defense', maxMarks: 10, description: 'Slide quality, team coordination, answering questions' }
    ]
  },
  review2: {
    maxTotal: 40,
    criteria: [
      { id: 'c1', name: 'Module Architecture & Database', maxMarks: 10, description: 'Detailed schema, API specifications, component design' },
      { id: 'c2', name: 'Implementation Progress (~50%)', maxMarks: 15, description: 'Working prototype of core modules, code standards' },
      { id: 'c3', name: 'Demonstration & Technical Rigor', maxMarks: 15, description: 'Live execution, handling edge cases, git commits' }
    ]
  },
  review3: {
    maxTotal: 40,
    criteria: [
      { id: 'c1', name: 'Full System Implementation', maxMarks: 15, description: '100% module integration, frontend-backend connectivity' },
      { id: 'c2', name: 'Verification, Testing & Results', maxMarks: 15, description: 'Test cases, performance benchmarks, accuracy metrics' },
      { id: 'c3', name: 'Viva-Voce & Individual Contribution', maxMarks: 10, description: 'Individual understanding, codebase defense' }
    ]
  },
  final_report: {
    maxTotal: 60,
    criteria: [
      { id: 'c1', name: 'Thesis / Report Quality & Plagiarism', maxMarks: 20, description: 'IEEE formatting, references, similarity < 15%' },
      { id: 'c2', name: 'Final Working Product & Impact', maxMarks: 20, description: 'Deployment, UI/UX polish, societal/industrial utility' },
      { id: 'c3', name: 'Comprehensive Viva & Defense', maxMarks: 20, description: 'Overall technical competence, future scope discussion' }
    ]
  }
};

const STAGE_TEMPLATES = [
  {
    id: 'synopsis',
    order: 1,
    name: 'Synopsis',
    shortName: 'Synopsis',
    description: 'Problem statement, objectives, proposed system architecture & feasibility analysis',
    allowedFileTypes: '.pdf,.doc,.docx',
    status: 'pending_submission',
    unlocked: true,
    submission: null,
    review: null,
    history: []
  },
  {
    id: 'review1',
    order: 2,
    name: 'Review 1 PPT',
    shortName: 'Review 1',
    description: 'Literature survey, SRS documentation, high-level system design & UML diagrams',
    allowedFileTypes: '.ppt,.pptx,.pdf',
    status: 'locked',
    unlocked: false,
    submission: null,
    review: null,
    history: []
  },
  {
    id: 'review2',
    order: 3,
    name: 'Review 2 PPT',
    shortName: 'Review 2',
    description: 'Detailed module implementation, 50% working prototype, DB schema & code review',
    allowedFileTypes: '.ppt,.pptx,.pdf',
    status: 'locked',
    unlocked: false,
    submission: null,
    review: null,
    history: []
  },
  {
    id: 'review3',
    order: 4,
    name: 'Review 3 PPT',
    shortName: 'Review 3',
    description: 'Complete system implementation, test results, performance analysis & demo',
    allowedFileTypes: '.ppt,.pptx,.pdf',
    status: 'locked',
    unlocked: false,
    submission: null,
    review: null,
    history: []
  },
  {
    id: 'final_report',
    order: 5,
    name: 'Final Report',
    shortName: 'Final Thesis',
    description: 'Complete project report (IEEE format), plagiarism clearance certificate & final documentation',
    allowedFileTypes: '.pdf,.zip',
    status: 'locked',
    unlocked: false,
    submission: null,
    review: null,
    history: []
  }
];

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return null;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return null;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

module.exports = {
  DB_FILE,
  UPLOADS_DIR,
  STAGE_RUBRICS,
  STAGE_TEMPLATES,
  readDB,
  writeDB
};

