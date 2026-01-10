# Internly v1 - Internship Tracking Platform

Internly is a powerful, all-in-one platform designed to help students and professionals manage their internship application journey. From tracking applications to logging interview experiences, Internly provides a streamlined workflow and insightful analytics to boost your career prospects.

---

## 🚀 Key Features

- **Centralized Dashboard**: A bird's-eye view of your application status, upcoming tasks, and key metrics.
- **Internship Management**: Detailed tracking of roles, companies, stipends, and application dates.
- **Interview Logging**: Record every interview round, including the mode, outcome, and personal experience notes.
- **Visual Analytics**: Interactive charts and graphs showing your application funnel and progress over time.
- **Chrome Extension**: A powerful companion tool that automatically detects and tracks applications across major platforms.
  - **Automatic Detection**: Supports LinkedIn, Internshala, Greenhouse, Lever, and Workday.
  - **Intelligent Scraper**: Scrapes company names, roles, and job URLs directly from the page.
  - **Auto-Sync**: Background synchronization with the main web dashboard.
  - **Duplicate Prevention**: Smart hashing to ensure no double-counting of applications.
- **Secure Authentication**: Robust user authentication powered by NextAuth.js.

---

## 🛠️ Tech Stack

### Web Application

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Chrome Extension

- **Manifest**: V3
- **Languages**: TypeScript, HTML, CSS
- **Detection Logic**: Custom strategy for internship detail extraction from various career portals.

---

## 📂 Project Structure

### `/my-app` (Web Application)

```text
my-app/
├── prisma/               # Database schema and migrations
├── src/
│   ├── app/              # Next.js App Router (Routes & Layouts)
│   │   ├── (auth)/       # Authentication routes (Login, etc.)
│   │   ├── (dashboard)/  # Main application screens (Dashboard, Analytics, Interviews)
│   │   ├── api/          # Backend API endpoints (Internships, Interviews, Auth)
│   │   └── layout.tsx    # Root layout with providers
│   ├── components/       # Reusable UI components
│   │   ├── analytics/    # Charts and data visualization components
│   │   ├── dashboard/    # Metric cards and summary widgets
│   │   └── internships/  # Forms and lists for application tracking
│   ├── lib/              # Shared logic (Prisma client, Auth options)
│   └── globals.css       # Global styles and Tailwind imports
├── .env.local            # Environment variables (DB URL, Auth secrets)
└── package.json          # Project dependencies and scripts
```

### `/chrome-extension`

```text
chrome-extension/
├── background/           # Service workers for background tasks
├── content/              # Scripts that run on web pages to detect internship info
├── popup/                # Extension UI (Popup menu)
├── scripts/              # Build and utility scripts
└── manifest.json         # Extension configuration
```

---

## 🔄 Website Flow & User Journey

### 1. Onboarding & Authentication

- **Authentication**: Users sign in via the login page. This establishes a secure session using NextAuth.
- **Session Management**: The app uses a custom `Providers` component to wrap the application, ensuring authentication state is available throughout the dashboard.

### 2. The Core Dashboard

- **Analytical Summary**: The home screen provides real-time counts of "Applied", "Interviews", and "Offers".
- **Recent Activity**: A stream of the latest application updates and upcoming follow-ups.

### 3. Application Lifecycle Management

- **Application Log**: The `/applications` page allows users to see a sortable list of all internship entries.
- **Submission Sources**: Applications can come from manual entry within the app OR automatically via the Chrome Extension.
- **Follow-ups**: Integrated date-pickers for setting reminders on when to follow up with recruiters (syncs with the dashboard metrics).

### 4. Interview Suite

- **Interview Logging**: For every application that moves to the interview stage, users can create "Interview Logs".
- **Round Tracking**: Track progress through "Round 1", "Technical Interivew", "HR Round", etc.
- **Experience Repository**: A text-based area for users to write down questions asked and their overall impression, serving as a personal knowledge base for future preparation.

### 5. Data Visualization (Analytics)

- **Status Funnel**: A Pie Chart visualizing the distribution of applications (e.g., 60% Applied, 20% Interview).
- **Activity Over Time**: A Line Chart tracking application frequency to keep the user motivated and consistent.

---

## 🗄️ Data Model

The database is structured to support multi-user isolation with the following core entities:

- **User**: Stores profiles and authentication details.
- **Internship**: Tracks company name, role, stipend, status (Applied, Interview, Offer, etc.), and follow-up dates.
- **InterviewLog**: Connects to internships to track round-by-round progress and feedback.

---

## 🛠️ Setup and Installation

For detailed instructions on setting up the project locally, please refer to:

- [General Setup Guide](SETUP.md)
- [Database Configuration](DATABASE_SETUP.md)
- [Database Troubleshooting](FIX_DATABASE.md)

---

Developed with ❤️ for the student community.
