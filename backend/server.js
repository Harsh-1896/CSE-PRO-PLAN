const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { DB_FILE, UPLOADS_DIR, STAGE_RUBRICS, STAGE_TEMPLATES, readDB, writeDB } = require('./db');
const { initializeDatabase } = require('./seedData');

const JWT_SECRET = 'cse_proplan_super_secret_jwt_key_2026';
const PORT = process.env.PORT || 5000;

const app = express();

// Initialize DB with seed data if not present
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

// Auth Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// Optional Auth (for public or demo checks)
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }
  next();
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNumber: user.rollNumber || null,
    department: user.department,
    designation: user.designation || null
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    message: 'Login successful',
    token,
    user: tokenPayload
  });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, rollNumber, department, designation, phone } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (role === 'student' && !rollNumber) {
    return res.status(400).json({ error: 'Roll number is required for students' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password,
    role,
    rollNumber: role === 'student' ? rollNumber.toUpperCase() : null,
    department: department || 'Computer Science & Engineering',
    designation: designation || (role === 'guide' ? 'Assistant Professor' : null),
    phone: phone || ''
  };

  db.users.push(newUser);
  writeDB(db);

  const tokenPayload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    rollNumber: newUser.rollNumber,
    department: newUser.department,
    designation: newUser.designation
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: tokenPayload
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// GET /api/guides - List all faculty guides for project selection
app.get('/api/guides', (req, res) => {
  const db = readDB();
  const guides = db.users
    .filter(u => u.role === 'guide')
    .map(g => ({
      id: g.id,
      name: g.name,
      email: g.email,
      designation: g.designation,
      specialization: g.specialization || 'CSE',
      department: g.department
    }));
  res.json(guides);
});

// GET /api/rubrics - Fetch evaluation criteria for all stages
app.get('/api/rubrics', (req, res) => {
  res.json(STAGE_RUBRICS);
});

// -------------------------------------------------------------
// PROJECT ROUTES
// -------------------------------------------------------------

// GET /api/projects - List projects with role-aware filtering
app.get('/api/projects', authenticate, (req, res) => {
  const db = readDB();
  let projects = db.projects || [];
  const { role, id, rollNumber } = req.user;
  const { type, status, guideId, search } = req.query;

  // Filter based on role
  if (role === 'student') {
    projects = projects.filter(p => {
      const isCreator = p.createdBy === id;
      const isTeammate = p.teamMembers && p.teamMembers.some(
        m => (m.email && m.email.toLowerCase() === req.user.email.toLowerCase()) ||
             (rollNumber && m.rollNumber && m.rollNumber.toUpperCase() === rollNumber.toUpperCase())
      );
      return isCreator || isTeammate;
    });
  } else if (role === 'guide') {
    // Guide sees projects assigned to them
    projects = projects.filter(p => p.guideId === id);
  } else if (role === 'coordinator') {
    // Coordinator can see all projects
  }

  // Filter query parameters
  if (type) {
    projects = projects.filter(p => p.type.toLowerCase() === type.toLowerCase());
  }
  if (guideId) {
    projects = projects.filter(p => p.guideId === guideId);
  }
  if (status) {
    projects = projects.filter(p => p.status.toLowerCase().includes(status.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    projects = projects.filter(p =>
      p.title.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s) ||
      p.domain.toLowerCase().includes(s) ||
      (p.guideName && p.guideName.toLowerCase().includes(s)) ||
      (p.teamMembers && p.teamMembers.some(m => m.name.toLowerCase().includes(s) || m.rollNumber.toLowerCase().includes(s)))
    );
  }

  // Compute calculated score metadata for each project
  const enrichedProjects = projects.map(p => enrichProjectScore(p));
  res.json(enrichedProjects);
});

// GET /api/projects/:id - Get detailed project information
app.get('/api/projects/:id', authenticate, (req, res) => {
  const db = readDB();
  const project = db.projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Check authorization
  const { role, id, rollNumber, email } = req.user;
  if (role === 'student') {
    const isCreator = project.createdBy === id;
    const isTeammate = project.teamMembers && project.teamMembers.some(
      m => (m.email && m.email.toLowerCase() === email.toLowerCase()) ||
           (rollNumber && m.rollNumber && m.rollNumber.toUpperCase() === rollNumber.toUpperCase())
    );
    if (!isCreator && !isTeammate) {
      return res.status(403).json({ error: 'Access denied to this project dossier' });
    }
  } else if (role === 'guide') {
    if (project.guideId !== id) {
      // Allow read-only access or check if needed
    }
  }

  res.json(enrichProjectScore(project));
});

// POST /api/projects - Register a new project (Student role)
app.post('/api/projects', authenticate, (req, res) => {
  if (req.user.role !== 'student' && req.user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only students or coordinators can register new projects' });
  }

  const {
    title,
    type, // 'Mini Project' or 'Major Project'
    academicYear,
    semester,
    domain,
    description,
    techStack,
    githubUrl,
    demoUrl,
    guideId,
    teamMembers // array of { rollNumber, name, email }
  } = req.body;

  if (!title || !type || !domain || !teamMembers || teamMembers.length === 0) {
    return res.status(400).json({
      error: 'Please provide all required fields: title, project type, domain, and at least 1 team member.'
    });
  }

  const db = readDB();

  // If a guideId is specified (e.g. by coordinator or preferred), check it; otherwise guide allocation is assigned by Coordinator
  let assignedGuide = null;
  if (guideId) {
    assignedGuide = db.users.find(u => u.id === guideId && u.role === 'guide') || null;
  }

  // Format team members and ensure student creator is included
  const formattedTeam = teamMembers.map((m, idx) => ({
    rollNumber: (m.rollNumber || '').toUpperCase().trim(),
    name: m.name ? m.name.trim() : `Student ${m.rollNumber}`,
    email: m.email ? m.email.trim() : `${m.rollNumber.toLowerCase()}@cse.edu`,
    isLeader: idx === 0 // First student is leader
  }));

  // Ensure registering student is included if they have rollNumber
  if (req.user.rollNumber) {
    const alreadyInTeam = formattedTeam.some(m => m.rollNumber === req.user.rollNumber.toUpperCase());
    if (!alreadyInTeam) {
      formattedTeam.unshift({
        rollNumber: req.user.rollNumber.toUpperCase(),
        name: req.user.name,
        email: req.user.email,
        isLeader: true
      });
      // reset others
      formattedTeam.forEach((m, i) => { if (i > 0) m.isLeader = false; });
    }
  }

  // Prepare 5 sequential stages
  const stages = JSON.parse(JSON.stringify(STAGE_TEMPLATES));
  stages[0].status = 'pending_submission';
  stages[0].unlocked = true;

  // Generate ID e.g. PRJ-2026-004
  const existingCount = db.projects.length;
  const newId = `PRJ-${new Date().getFullYear()}-${String(existingCount + 1).padStart(3, '0')}`;

  const needsGuideAllocation = !assignedGuide;

  const newProject = {
    id: newId,
    title: title.trim(),
    type: type === 'Mini Project' ? 'Mini Project' : 'Major Project',
    academicYear: academicYear || '2025-2026',
    semester: semester || (type === 'Mini Project' ? 'Semester 6' : 'Semester 7'),
    domain: domain.trim(),
    description: description ? description.trim() : '',
    techStack: Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []),
    githubUrl: githubUrl ? githubUrl.trim() : '',
    demoUrl: demoUrl ? demoUrl.trim() : '',
    createdBy: req.user.id,
    teamMembers: formattedTeam,
    guideId: assignedGuide ? assignedGuide.id : null,
    guideName: assignedGuide ? assignedGuide.name : 'Pending Coordinator Allocation',
    guideEmail: assignedGuide ? assignedGuide.email : null,
    guideDesignation: assignedGuide ? (assignedGuide.designation || 'Faculty Guide') : null,
    status: needsGuideAllocation ? 'Awaiting Guide Allocation' : 'Synopsis Pending',
    needsGuideAllocation,
    currentStageIndex: 0,
    stages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.unshift(newProject);
  writeDB(db);

  res.status(201).json({
    message: needsGuideAllocation
      ? 'Project registered successfully! Proposal submitted to Department Coordinator for faculty guide allocation.'
      : 'Project registered successfully!',
    project: enrichProjectScore(newProject)
  });
});

// PUT /api/projects/:id/assign-guide - Reassign or change faculty guide (Coordinator only)
app.put('/api/projects/:id/assign-guide', authenticate, (req, res) => {
  if (req.user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Permission denied. Only the project coordinator can reassign faculty guides.' });
  }

  const { guideId } = req.body;
  if (!guideId) {
    return res.status(400).json({ error: 'Please select a new faculty guide.' });
  }

  const db = readDB();
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const newGuide = db.users.find(u => u.id === guideId && u.role === 'guide');
  if (!newGuide) {
    return res.status(404).json({ error: 'Selected faculty guide was not found in the department directory.' });
  }

  const prevGuideName = project.guideName;

  // Track reassignment history
  if (!project.reassignmentHistory) {
    project.reassignmentHistory = [];
  }
  project.reassignmentHistory.push({
    previousGuideId: project.guideId,
    previousGuideName: project.guideName,
    newGuideId: newGuide.id,
    newGuideName: newGuide.name,
    reassignedBy: req.user.name,
    reassignedAt: new Date().toISOString(),
    resetFromStage: project.stages[project.currentStageIndex]?.name || 'Synopsis'
  });

  // Update guide fields
  project.guideId = newGuide.id;
  project.guideName = newGuide.name;
  project.guideEmail = newGuide.email;
  project.guideDesignation = newGuide.designation || 'Faculty Guide';
  project.needsGuideAllocation = false;

  // Academic Rule: Reset all stage evaluations and progress back to zero (Stage 1: Synopsis)
  const freshStages = JSON.parse(JSON.stringify(STAGE_TEMPLATES));
  freshStages[0].status = 'pending_submission';
  freshStages[0].unlocked = true;
  project.stages = freshStages;
  project.currentStageIndex = 0;
  project.status = 'Synopsis Pending';
  project.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    message: `Faculty guide assigned: ${newGuide.name}. Milestones & evaluations initialized for Stage 1 (Synopsis).`,
    project: enrichProjectScore(project)
  });
});

// -------------------------------------------------------------
// STAGE SUBMISSION ROUTE (Student)
// -------------------------------------------------------------

// POST /api/projects/:id/stages/:stageId/submit
app.post('/api/projects/:id/stages/:stageId/submit', authenticate, upload.single('file'), (req, res) => {
  const db = readDB();
  const project = db.projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Check if faculty guide has been allocated
  if (!project.guideId || project.needsGuideAllocation || project.status === 'Awaiting Guide Allocation') {
    return res.status(400).json({
      error: 'Faculty guide allocation is currently pending by the Department Coordinator. Deliverables can be uploaded once your guide is assigned.'
    });
  }

  // Check stage existence
  const stageIndex = project.stages.findIndex(s => s.id === req.params.stageId);
  if (stageIndex === -1) {
    return res.status(404).json({ error: 'Stage not found' });
  }

  const stage = project.stages[stageIndex];

  // Verify stage is unlocked
  if (!stage.unlocked) {
    return res.status(400).json({ error: 'This stage is currently locked. Complete and get approval for the previous stage first!' });
  }

  // Check if file or existing file or link is provided
  const { notes, githubUrl, demoUrl, externalDocUrl } = req.body;
  if (!req.file && !externalDocUrl && !stage.submission) {
    return res.status(400).json({ error: 'Please upload a file or provide a document link for this stage.' });
  }

  const currentVersion = (stage.submission && stage.submission.version) ? stage.submission.version + 1 : 1;

  // Save previous submission into history if changes were previously requested
  if (stage.submission) {
    if (!stage.history) stage.history = [];
    stage.history.push({
      ...stage.submission,
      previousReview: stage.review,
      archivedAt: new Date().toISOString()
    });
  }

  // Create submission record
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : (stage.submission ? stage.submission.fileUrl : externalDocUrl);
  const fileName = req.file ? req.file.originalname : (stage.submission ? stage.submission.fileName : 'Online Document');
  const fileSize = req.file ? formatBytes(req.file.size) : (stage.submission ? stage.submission.fileSize : 'Cloud Link');

  stage.submission = {
    submittedAt: new Date().toISOString(),
    submittedBy: `${req.user.name} (${req.user.rollNumber || 'Leader'})`,
    fileName,
    fileUrl,
    fileSize,
    links: {
      github: githubUrl || project.githubUrl || '',
      demo: demoUrl || project.demoUrl || '',
      externalDoc: externalDocUrl || ''
    },
    notes: notes || '',
    version: currentVersion
  };

  // Reset stage status to under review
  stage.status = 'submitted';
  stage.review = null; // Cleared until guide reviews the new submission
  project.status = `${stage.name} (Under Review)`;
  project.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    message: `${stage.name} submitted successfully! Your guide has been notified for review.`,
    project: enrichProjectScore(project)
  });
});

// -------------------------------------------------------------
// GUIDE APPROVAL & MARKS ENTRY ROUTE (Guide)
// -------------------------------------------------------------

// POST /api/projects/:id/stages/:stageId/review
app.post('/api/projects/:id/stages/:stageId/review', authenticate, (req, res) => {
  const db = readDB();
  const project = db.projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Coordinator OR the designated faculty supervisor can evaluate submissions and score rubrics
  const isAssignedGuide = req.user.role === 'guide' && project.guideId === req.user.id;
  const isCoordinator = req.user.role === 'coordinator';

  if (!isAssignedGuide && !isCoordinator) {
    return res.status(403).json({
      error: `Evaluation restricted: Only the designated faculty supervisor (${project.guideName}) or the Project Coordinator can evaluate deliverables and grade rubric criteria.`
    });
  }

  const stageIndex = project.stages.findIndex(s => s.id === req.params.stageId);
  if (stageIndex === -1) {
    return res.status(404).json({ error: 'Stage not found' });
  }

  const stage = project.stages[stageIndex];

  // STRICT RULE: Stage CANNOT be reviewed or approved without an actual student submission!
  if (!stage.submission) {
    return res.status(400).json({
      error: 'Cannot evaluate: The student team has not uploaded deliverables for this stage yet! A file must be submitted first.'
    });
  }

  const { decision, comments, criteriaMarks } = req.body;

  if (!decision || (decision !== 'approved' && decision !== 'changes_requested')) {
    return res.status(400).json({ error: 'Decision must be either "approved" or "changes_requested"' });
  }

  if (decision === 'changes_requested' && (!comments || comments.trim().length === 0)) {
    return res.status(400).json({ error: 'Please provide constructive feedback comments explaining why changes are requested.' });
  }

  // Calculate rubric marks if approved or if marks entered
  let marksData = null;
  const rubric = STAGE_RUBRICS[stage.id];

  if (rubric && Array.isArray(criteriaMarks) && criteriaMarks.length > 0) {
    let calculatedTotal = 0;
    const evaluatedCriteria = rubric.criteria.map(c => {
      const match = criteriaMarks.find(m => m.id === c.id);
      const awarded = match && !isNaN(parseFloat(match.awardedMarks)) ? Math.max(0, Math.min(c.maxMarks, parseFloat(match.awardedMarks))) : 0;
      calculatedTotal += awarded;
      return {
        id: c.id,
        name: c.name,
        maxMarks: c.maxMarks,
        awardedMarks: awarded
      };
    });

    const percentage = Math.round((calculatedTotal / rubric.maxTotal) * 1000) / 10;
    marksData = {
      criteria: evaluatedCriteria,
      total: Math.round(calculatedTotal * 10) / 10,
      maxTotal: rubric.maxTotal,
      percentage
    };
  } else if (decision === 'approved' && rubric) {
    // If approved without explicit marks, auto-assign default passing marks or retain
    return res.status(400).json({ error: 'Please enter rubric marks for each criterion before approving the stage.' });
  }

  // Record Review
  stage.review = {
    reviewedAt: new Date().toISOString(),
    reviewedBy: req.user.name,
    decision,
    comments: (comments || '').trim(),
    marks: marksData
  };

  if (decision === 'approved') {
    stage.status = 'approved';

    // UNLOCK NEXT SEQUENTIAL STAGE
    if (stageIndex + 1 < project.stages.length) {
      const nextStage = project.stages[stageIndex + 1];
      nextStage.unlocked = true;
      if (nextStage.status === 'locked') {
        nextStage.status = 'pending_submission';
      }
      project.currentStageIndex = stageIndex + 1;
      project.status = `${nextStage.name} (Unlocked)`;
    } else {
      // Final stage approved!
      project.status = 'Completed';
    }
  } else {
    // Changes Requested
    stage.status = 'changes_requested';
    project.status = `${stage.name} (Changes Requested)`;
  }

  project.updatedAt = new Date().toISOString();
  writeDB(db);

  res.json({
    message: decision === 'approved'
      ? `Stage "${stage.name}" approved! Next stage has been unlocked for the students.`
      : `Revision requested for "${stage.name}". Feedback sent to the student team.`,
    project: enrichProjectScore(project)
  });
});

// -------------------------------------------------------------
// COORDINATOR & ANALYTICS ROUTES
// -------------------------------------------------------------

// GET /api/analytics - Departmental performance statistics
app.get('/api/analytics', authenticate, (req, res) => {
  const db = readDB();
  const projects = db.projects || [];
  const users = db.users || [];

  const totalProjects = projects.length;
  const miniProjects = projects.filter(p => p.type === 'Mini Project').length;
  const majorProjects = projects.filter(p => p.type === 'Major Project').length;

  // Stage distribution
  const stageDistribution = {
    synopsis: 0,
    review1: 0,
    review2: 0,
    review3: 0,
    final_report: 0,
    completed: 0
  };

  projects.forEach(p => {
    if (p.status === 'Completed') {
      stageDistribution.completed++;
    } else {
      const activeStage = p.stages[p.currentStageIndex];
      if (activeStage && stageDistribution[activeStage.id] !== undefined) {
        stageDistribution[activeStage.id]++;
      }
    }
  });

  // Guide workload
  const guideWorkload = {};
  users.filter(u => u.role === 'guide').forEach(g => {
    guideWorkload[g.id] = {
      id: g.id,
      name: g.name,
      designation: g.designation,
      specialization: g.specialization || 'CSE',
      miniCount: 0,
      majorCount: 0,
      totalCount: 0
    };
  });

  projects.forEach(p => {
    if (p.guideId && guideWorkload[p.guideId]) {
      if (p.type === 'Mini Project') guideWorkload[p.guideId].miniCount++;
      else guideWorkload[p.guideId].majorCount++;
      guideWorkload[p.guideId].totalCount++;
    }
  });

  // Calculate marks averages
  let totalEvaluatedProjects = 0;
  let cumulativeScoreSum = 0;

  projects.forEach(p => {
    const enriched = enrichProjectScore(p);
    if (enriched.overallMarks.obtained > 0) {
      cumulativeScoreSum += enriched.overallMarks.percentage;
      totalEvaluatedProjects++;
    }
  });

  const avgDepartmentPercentage = totalEvaluatedProjects > 0
    ? Math.round((cumulativeScoreSum / totalEvaluatedProjects) * 10) / 10
    : 0;

  res.json({
    totalProjects,
    miniProjects,
    majorProjects,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalGuides: users.filter(u => u.role === 'guide').length,
    stageDistribution,
    guideWorkload: Object.values(guideWorkload),
    avgDepartmentPercentage
  });
});

// POST /api/reset-demo - Helper to restore sample data anytime
app.post('/api/reset-demo', (req, res) => {
  const data = initializeDatabase(true);
  res.json({ message: 'Demo data successfully reset to CSE Department default state!', count: data.projects.length });
});

// Helper function to calculate aggregate scores across stages
function enrichProjectScore(project) {
  let totalPossible = 0;
  let totalObtained = 0;
  let stagesCompleted = 0;

  project.stages.forEach(s => {
    const rubric = STAGE_RUBRICS[s.id];
    if (rubric) {
      totalPossible += rubric.maxTotal;
    }
    if (s.status === 'approved' && s.review && s.review.marks) {
      totalObtained += s.review.marks.total;
      stagesCompleted++;
    }
  });

  const percentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 1000) / 10 : 0;

  let grade = 'In Progress';
  if (stagesCompleted === 5) {
    if (percentage >= 90) grade = 'O (Outstanding)';
    else if (percentage >= 80) grade = 'A+ (Excellent)';
    else if (percentage >= 70) grade = 'A (Very Good)';
    else if (percentage >= 60) grade = 'B+ (Good)';
    else if (percentage >= 50) grade = 'B (Above Average)';
    else grade = 'C (Pass)';
  }

  return {
    ...project,
    overallMarks: {
      obtained: Math.round(totalObtained * 10) / 10,
      totalPossible,
      percentage,
      stagesCompleted,
      totalStages: 5,
      grade
    }
  };
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Serve static frontend assets in production if build exists
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`CSE ProjectHub Backend running on port ${PORT}`);
  console.log(`Local API URL: http://localhost:${PORT}/api`);
  console.log(`Uploads URL:   http://localhost:${PORT}/uploads`);
  console.log(`====================================================`);
});

