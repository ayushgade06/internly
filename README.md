# Internly 🚀

### The Ultimate Internship Tracking & Management System

Internly is a comprehensive, full-stack solution designed to streamline the chaotic process of internship hunting. It combines a high-performance **Next.js Dashboard** with a **Chrome Extension** to provide a seamless bridge between job portals and your personal career tracker.

---

## 🏗️ System Architecture

Internly is split into two primary components that work in tandem:

1.  **Web Application (The Brain)**: A Next.js 16 (App Router) dashboard that manages your database, provides visual analytics, and serves as the central hub for your career data.
2.  **Chrome Extension (The Scout)**: A browser-level tool that monitors job portals (LinkedIn, Internshala, etc.), extracts application details using custom scrapers, and syncs them directly to the web app.

---

## 🌟 Core Modules

### 1. Unified Dashboard

The command center of your internship hunt.

- **Metric Cards**: Instant visibility into "Applications this month", "Pending Interviews", and "Active Offers".
- **Recent Activity**: A merged feed of manual entries and extension-detected applications.
- **Status Funnel**: Real-time tracking of where you are in the application lifecycle.

### 2. Intelligent Tracking (`/applications`)

Managing thousands of applications is impossible manually. Internly handles this via:

- **Source Filtering**: Distinguish between applications you added manually and those tracked automatically by the extension.
- **Follow-up Reminders**: Set follow-up dates to ensure you never miss a recruiter's email.
- **Notes System**: Attach specific details or recruiter contact info to each application.

### 3. Interview Suite (`/interviews`)

The most critical part of the process.

- **Experience Logs**: A dedicated repository to record questions asked, your answers, and the overall "vibe" of the interview.
- **Outcome Tracking**: Mark rounds as "Cleared", "Rejected", or "Pending".
- **Cross-Reference**: Every log is linked to an existing application, providing a complete historical trail.

### 4. Chrome Extension

The "secret sauce" of Internly.

- **Confidence Engine**: Analyzes page metadata, headings, and URLs to detect job postings with 90%+ accuracy.
- **Auto-Extraction**: Pulls Company name, Role, Description, and even Stipend details without you typing a word.
- **One-Click Sync**: Uses a secure token-based bridge to push data from any browser tab to your central database.

---

## 🛠️ Technical Stack

### Backend & Database

- **Framework**: Next.js 16 (Server Components & Actions)
- **Database**: PostgreSQL (hosted on Supabase/Local)
- **ORM**: Prisma 7.x (Type-safe database access)
- **Auth**: NextAuth.js with Google OAuth 2.0 provider

### Frontend

- **Library**: React 19 (using the latest `use` and `Action` patterns)
- **Styling**: Tailwind CSS 4 (Modern, utility-first CSS)
- **Charts**: Recharts (Dynamic SVG-based data visualization)
- **Icons**: Lucide React

### Chrome Extension

- **Manifest**: MV3 (The latest Chrome Extension standard)
- **Language**: Vanilla Javascript (for maximum performance and small bundle size)
- **Communication**: PostMessage API for website-to-extension auth bridging.

---

## 🔄 How the Sync Mechanism Works

Internly uses a custom synchronization bridge:

1.  **Authentication**: When you login to the website, the dashboard provides a "Connect Extension" button.
2.  **Handshake**: The website uses `window.postMessage` to securely send a session token to the extension.
3.  **Storage**: The extension stores this token in `chrome.storage.local`.
4.  **Sync**: When you apply for a job, the extension sends a `POST` request to the `/api/internships/upsert` endpoint with the stored token as a Bearer Authorization header.

---

## 📂 Project Structure

```text
📦 internly
 ┣ 📂 my-app                  # Next.js Web Application
 ┃ ┣ 📂 prisma                # Database Schema & Migrations
 ┃ ┣ 📂 public                # Static Assets
 ┃ ┗ 📂 src
 ┃   ┣ 📂 app
 ┃   ┃ ┣ 📂 (auth)            # Auth Routes
 ┃   ┃ ┣ 📂 (dashboard)       # Protected Dashboard Routes
 ┃   ┃ ┗ 📂 api               # RESTful API Endpoints
 ┃   ┣ 📂 components          # UI Components (Atomic Design)
 ┃   ┃ ┣ 📂 dashboard         # Stats & Charts
 ┃   ┃ ┗ 📂 internships       # Table & Forms
 ┃   ┗ 📂 lib                 # Shared Config (Prisma, Auth)
 ┣ 📂 chrome-extension        # Browser Scout
 ┃ ┣ 📂 background            # Service Worker (Sync Handling)
 ┃ ┣ 📂 content               # Page Scraping & Injection
 ┃ ┣ 📂 popup                 # User Interface
 ┃ ┗ 📜 manifest.json         # Extension Manifest
 ┗ 📂 scripts                 # Utility Scripts (DB health, Env check)
```

---

## 🗄️ Database Schema

The database is built on four core pillars:

1.  **User**: Root of all data. Tracks profiles and identity.
2.  **Internship**: Manually entered or managed application data.
3.  **Application**: Raw data captured via the Chrome Extension (kept separate for de-duplication).
4.  **InterviewLog**: Reflective data for interview preparation.

---

## 🚀 Getting Started

### 1. Web Application

1.  Clone the repository.
2.  Run `npm install` inside `my-app`.
3.  Configure your `.env.local` using `.env.example`.
4.  Run `npx prisma db push` to sync your schema.
5.  Launch with `npm run dev`.

### 2. Chrome Extension

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer Mode** (top-right).
3.  Click **Load Unpacked** and select the `chrome-extension` folder.
4.  Visit your local dashboard and click "Connect Extension" to authorize.

---
