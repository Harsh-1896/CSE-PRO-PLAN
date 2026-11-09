# CSE ProPlan — CSE Department Project Tracking & Evaluation System

A modern, full-stack web application designed for Computer Science & Engineering (CSE) academic departments to streamline student project lifecycles for both **Mini Projects** (3rd Year) and **Major Projects** (Final Year), from initial registration to final rubric-based marks evaluation.

---

## 🌟 The 5 Core Requirements Delivered

1. **Role-Based Authentication (3 Roles)**:
   - **Student**: Register project batches, choose guides, add teammates by roll number, upload stage deliverables, track guide feedback and rubric scorecards.
   - **Guide (Faculty)**: Supervise assigned project batches, inspect uploads, Approve or Request Changes with comments, and evaluate rubric criteria with real-time automatic total calculation.
   - **Coordinator (HOD / Project Head)**: Department-wide oversight, pipeline stage funnel analytics, faculty guide workload matrix, master marksheet records, and one-click **CSV Marksheet Export** for university exam branch records.
   - *Includes 1-click Demo Persona shortcuts on the login screen for instant testing without manual typing!*

2. **Project Registration**:
   - Students create new projects with Category (**Mini Project** vs. **Major Project**), Academic Year, Semester, Technical Domain, Title, Scope Abstract, and Tech Stack.
   - Faculty guide selection from department roster.
   - Teammate registration by **Roll Number** (e.g., `21CS045`, `21CS089`) with team leader auto-assignment (up to 4 members per batch).

3. **Stage-Wise Sequential Uploads**:
   - Strictly enforces sequential progression across 5 milestones:
     1. **Stage 1: Synopsis** *(Initially unlocked upon registration)*
     2. **Stage 2: Review 1 PPT** *(Locked until Synopsis is Approved)*
     3. **Stage 3: Review 2 PPT** *(Locked until Review 1 PPT is Approved)*
     4. **Stage 4: Review 3 PPT** *(Locked until Review 2 PPT is Approved)*
     5. **Stage 5: Final Report & Thesis** *(Locked until Review 3 PPT is Approved)*
   - File uploads (PDF, PPTX, DOCX, ZIP) with document previews, file size tracking, submitter notes, and cloud presentation links.

4. **Guide Approval & Revision Flow**:
   - Faculty guides can inspect submitted files and either:
     - **Approve Stage**: Marks the stage as approved, registers rubric scores, and immediately unlocks the subsequent stage.
     - **Request Changes**: Flags the stage with specific required revisions and comments, prompting students to resubmit.
   - Complete audit trail of past versions and reviewer remarks.

5. **Automated Rubric Marks Calculation & Unified Dossier**:
   - Guides enter marks across standardized CSE department evaluation criteria for each stage.
   - **Real-time dynamic calculation**: Total marks, percentage, and letter grade rating (`O`, `A+`, `A`, `B+`) are computed automatically as values are typed.
   - **Unified Project Dossier**: A single comprehensive project page presenting metadata, interactive stage stepper, file downloads, reviewer feedback, consolidated 5-stage scorecards, cumulative grade, and a **Print-Ready Official Dossier** format.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Installation & Running

1. **Install Dependencies** (if not already installed):
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

2. **Start the Application**:
   ```bash
   npm run dev
   ```
   *Or separately:*
   - Backend API: `cd backend && npm start` (runs on `http://localhost:5000`)
   - Frontend UI: `cd frontend && npm run dev` (runs on `http://localhost:3000`)

3. **Open in Browser**:
   Visit [**http://localhost:3000**](http://localhost:3000)

---

## 👥 Pre-configured Demo Accounts

All demo accounts use password: `password123`

| Role | Name | Email / ID | Context |
|---|---|---|---|
| **Student** | Rahul Sharma | `rahul.sharma@cse.edu` (`21CS045`) | Leader of AI Traffic Project (Review 3 Unlocked) |
| **Student** | Ananya Patel | `ananya.patel@cse.edu` (`21CS012`) | Leader of Blockchain Ledger (Review 1 Changes Requested) |
| **Guide** | Dr. Arvind Rao | `dr.rao@cse.edu` | Associate Professor (Assigned to AI Traffic & Drone Projects) |
| **Guide** | Dr. Priya Mehta | `dr.mehta@cse.edu` | Professor (Assigned to Blockchain Ledger) |
| **Coordinator** | Prof. K. Sunitha | `coordinator@cse.edu` | Head Project Coordinator (Master Department Analytics) |

*Tip: You can switch personas instantly using the **Role Switcher** in the top navigation bar at any time.*

---

## 📊 CSE Department Evaluation Rubrics

| Stage | Max Marks | Evaluated Criteria |
|---|---|---|
| **Synopsis** | 30 | Problem Definition (10), Literature Survey & Feasibility (10), Proposed Methodology (10) |
| **Review 1 PPT** | 30 | Literature Survey Depth & SRS (10), High-Level System Design (10), Presentation & Defense (10) |
| **Review 2 PPT** | 40 | Module Architecture & DB (10), Implementation Progress ~50% (15), Technical Demonstration (15) |
| **Review 3 PPT** | 40 | Full System Implementation (15), Verification & Testing (15), Viva-Voce & Contribution (10) |
| **Final Report** | 60 | Thesis Quality & Plagiarism (20), Final Working Product (20), Comprehensive Viva & Defense (20) |
| **Total** | **200** | **Cumulative Degree Score & Grade** |

---

## 🛠️ Tech Stack Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Fetch API with JWT Bearer auth.
- **Backend**: Node.js, Express 4, Multer (multipart file handling), JSON Web Token (JWT), UUID.
- **Database**: Atomic JSON-backed persistence (`backend/data/db.json`) with automated seeding and self-healing.

