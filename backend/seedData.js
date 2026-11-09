const { writeDB, STAGE_RUBRICS, STAGE_TEMPLATES } = require('./db');

function generateInitialData() {
  const users = [
    // Coordinator
    {
      id: 'usr_coord_1',
      name: 'Prof. K. Sunitha',
      email: 'coordinator@cse.edu',
      password: 'password123',
      role: 'coordinator',
      department: 'Computer Science & Engineering',
      designation: 'Head Project Coordinator & Professor',
      employeeId: 'CSE-FAC-001',
      phone: '+91 98765 43210'
    },
    // Faculty Guides
    {
      id: 'usr_guide_1',
      name: 'Dr. Arvind Rao',
      email: 'dr.rao@cse.edu',
      password: 'password123',
      role: 'guide',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      specialization: 'Artificial Intelligence, Computer Vision, Edge Computing',
      employeeId: 'CSE-FAC-014',
      phone: '+91 98765 11223'
    },
    {
      id: 'usr_guide_2',
      name: 'Dr. Priya Mehta',
      email: 'dr.mehta@cse.edu',
      password: 'password123',
      role: 'guide',
      department: 'Computer Science & Engineering',
      designation: 'Professor',
      specialization: 'Cybersecurity, Cryptography, Blockchain Technology',
      employeeId: 'CSE-FAC-008',
      phone: '+91 98765 33445'
    },
    {
      id: 'usr_guide_3',
      name: 'Prof. Vikram Das',
      email: 'prof.das@cse.edu',
      password: 'password123',
      role: 'guide',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      specialization: 'Distributed Systems, Cloud Native, IoT',
      employeeId: 'CSE-FAC-021',
      phone: '+91 98765 55667'
    },
    {
      id: 'usr_guide_4',
      name: 'Dr. Sneha Kulkarni',
      email: 'dr.kulkarni@cse.edu',
      password: 'password123',
      role: 'guide',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      specialization: 'Natural Language Processing, Federated Learning',
      employeeId: 'CSE-FAC-019',
      phone: '+91 98765 77889'
    },

    // Students
    {
      id: 'usr_stud_1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@cse.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: '21CS045',
      batch: '2022-2026',
      semester: 'Semester 7',
      phone: '+91 91234 56780'
    },
    {
      id: 'usr_stud_2',
      name: 'Ananya Patel',
      email: 'ananya.patel@cse.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: '21CS012',
      batch: '2022-2026',
      semester: 'Semester 7',
      phone: '+91 91234 56781'
    },
    {
      id: 'usr_stud_3',
      name: 'Rohan Verma',
      email: 'rohan.verma@cse.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: '21CS078',
      batch: '2022-2026',
      semester: 'Semester 7',
      phone: '+91 91234 56782'
    },
    {
      id: 'usr_stud_4',
      name: 'Sneha Nair',
      email: 'sneha.nair@cse.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: '21CS089',
      batch: '2022-2026',
      semester: 'Semester 7',
      phone: '+91 91234 56783'
    },
    {
      id: 'usr_stud_5',
      name: 'Amit Kumar',
      email: 'amit.kumar@cse.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: '21CS015',
      batch: '2022-2026',
      semester: 'Semester 7',
      phone: '+91 91234 56784'
    },
    {
      id: 'usr_stud_6',
      name: 'Kavita Joshi',
      email: 'kavita.joshi@cse.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: '21CS034',
      batch: '2023-2027',
      semester: 'Semester 5',
      phone: '+91 91234 56785'
    }
  ];

  // Helper to clone clean blank stages (no pre-approvals, all stages start locked except Stage 1)
  const getCleanStages = () => {
    const stages = JSON.parse(JSON.stringify(STAGE_TEMPLATES));
    stages[0].status = 'pending_submission';
    stages[0].unlocked = true;
    stages[0].submission = null;
    stages[0].review = null;
    stages[0].history = [];

    for (let i = 1; i < stages.length; i++) {
      stages[i].status = 'locked';
      stages[i].unlocked = false;
      stages[i].submission = null;
      stages[i].review = null;
      stages[i].history = [];
    }
    return stages;
  };

  // Project 1: Rahul Sharma's Project — Fresh Stage 1 (Ready for Upload!)
  // Absolutely nothing is pre-submitted or pre-approved!
  const prj1Stages = getCleanStages();

  // Project 2: Ananya Patel's Project — Fresh Stage 1 (Ready for Upload!)
  // Clean stage 1: Unlocked, waiting for student to upload deliverables
  const prj2Stages = getCleanStages();

  const projects = [
    {
      id: 'PRJ-2026-001',
      title: 'AI-Powered Smart Traffic Optimization using Edge Computing',
      type: 'Major Project',
      academicYear: '2025-2026',
      semester: 'Semester 7',
      domain: 'Artificial Intelligence & Machine Learning',
      description: 'An intelligent real-time traffic signal regulation system deployed on edge AI devices (Raspberry Pi + Google Coral). Utilizes computer vision (YOLOv8) to estimate dynamic vehicle queue lengths and reinforcement learning to adaptively control phase switching.',
      techStack: ['Python', 'YOLOv8', 'OpenCV', 'PyTorch', 'MQTT', 'React', 'FastAPI'],
      githubUrl: 'https://github.com/rahul-cse/smart-traffic-edge-ai',
      demoUrl: 'https://traffic-ai-demo.cse.edu',
      createdBy: 'usr_stud_1',
      teamMembers: [
        { rollNumber: '21CS045', name: 'Rahul Sharma', email: 'rahul.sharma@cse.edu', isLeader: true },
        { rollNumber: '21CS089', name: 'Sneha Nair', email: 'sneha.nair@cse.edu', isLeader: false },
        { rollNumber: '21CS015', name: 'Amit Kumar', email: 'amit.kumar@cse.edu', isLeader: false }
      ],
      guideId: 'usr_guide_1',
      guideName: 'Dr. Arvind Rao',
      guideEmail: 'dr.rao@cse.edu',
      guideDesignation: 'Associate Professor',
      status: 'Synopsis Pending Submission',
      currentStageIndex: 0,
      stages: prj1Stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PRJ-2026-002',
      title: 'Blockchain-Based Verifiable Academic Credential Ledger',
      type: 'Major Project',
      academicYear: '2025-2026',
      semester: 'Semester 7',
      domain: 'Cybersecurity & Cryptography',
      description: 'A tamper-proof credential issuance and instant verification platform built on Ethereum Layer 2. Employs ERC-5192 Soulbound Tokens, Zero-Knowledge proofs for selective grade disclosures, and IPFS metadata anchoring to eradicate diploma fraud.',
      techStack: ['Solidity', 'Hardhat', 'Ethers.js', 'Next.js', 'IPFS', 'TypeScript', 'TailwindCSS'],
      githubUrl: 'https://github.com/ananya-patel/edu-credential-ledger',
      demoUrl: '',
      createdBy: 'usr_stud_2',
      teamMembers: [
        { rollNumber: '21CS012', name: 'Ananya Patel', email: 'ananya.patel@cse.edu', isLeader: true },
        { rollNumber: '21CS078', name: 'Rohan Verma', email: 'rohan.verma@cse.edu', isLeader: false }
      ],
      guideId: 'usr_guide_2',
      guideName: 'Dr. Priya Mehta',
      guideEmail: 'dr.mehta@cse.edu',
      guideDesignation: 'Professor',
      status: 'Synopsis Pending Submission',
      currentStageIndex: 0,
      stages: prj2Stages,
      createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return {
    users,
    projects
  };
}

function initializeDatabase(force = false) {
  const { readDB } = require('./db');
  const existing = readDB();
  if (!existing || force || !existing.projects || existing.projects.length === 0) {
    const data = generateInitialData();
    writeDB(data);
    console.log('Seeded database with clean unreviewed CSE department records.');
    return data;
  }
  return existing;
}

module.exports = {
  generateInitialData,
  initializeDatabase
};
