# ⚡ FlowForge AI

FlowForge AI is a visual, node-based pipeline editor designed to orchestrate AI workflows using **Google Gemini** models and **Supabase**. Built with React, TypeScript, and React Flow, it provides a premium, responsive glassmorphic interface to drag, drop, connect, and execute LLM-powered pipelines in real time.

---

## 🚀 Key Features

- **Visual Workflow Editor**: Add, drag, connect, and organize nodes dynamically on a responsive canvas powered by [React Flow](https://reactflow.dev/). Includes zooming and auto-fit navigation tools.
- **Custom Nodes**:
  - 📥 **Input Node**: Specify raw source data, custom text, or prompt context.
  - 🤖 **AI Node**: Guide AI output using instructions executed via the Google Gemini API (`gemini-2.5-flash`).
  - 📤 **Output Node**: View real-time AI responses, execution states, or troubleshooting logs.
- **Single-Click Execution**: Instantly run workflows. Connect `Input Node → AI Node → Output Node`, click **Run**, and watch AI responses populate connected nodes.
- **Robust Auto-Save & Sync**: Optimized debounced auto-saving featuring local storage caching and parallel background database synchronizations to [Supabase](https://supabase.com/).
- **Secure Authentication**: Google OAuth login integration combined with database-enforced **Row Level Security (RLS)** policies to keep user data private and isolated.
- **Adaptive Dark Mode**: Sleek dark, light, and system themes with persistent user preferences.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Canvas Library**: [React Flow (v11)](https://reactflow.dev/)
- **AI Integration**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (`gemini-2.5-flash` model)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS & Google OAuth)
- **Styling**: Vanilla CSS (Sleek CSS custom properties, responsive layout, glassmorphic card stylings)

---

## 📂 Project Structure

```text
flowforge-ai/
├── frontend/                 # React frontend application
│   ├── public/               # Static icons and assets
│   ├── src/
│   │   ├── assets/           # UI media assets
│   │   ├── canvas/           # React Flow canvas wrapper
│   │   ├── components/       # Layout parts (Sidebar, TopBar, LandingPage)
│   │   ├── context/          # Auth context and states
│   │   ├── lib/              # Supabase client initializer
│   │   ├── nodes/            # Custom node definitions (Input, AI, Output)
│   │   ├── services/         # API wrappers (Gemini, Supabase Workflow)
│   │   ├── App.tsx           # Application logic, route flow, state machine
│   │   └── main.tsx          # React entry point
│   ├── index.html
│   └── package.json
└── supabase/                 # Database schema definitions
    └── schema.sql            # Workflows database table & RLS policies
```

---

## ⚙️ Installation & Configuration

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A Google AI Studio API key (for Gemini)
- A Supabase Project

### 1. Database Setup
Execute the SQL script in `supabase/schema.sql` within your Supabase project's **SQL Editor**:
1. Creates the `workflows` database table.
2. Configures foreign key constraints referencing `auth.users`.
3. Activates **Row Level Security (RLS)**.
4. Adds security policies allowing users to select, insert, update, or delete only their owned workflows.
5. Configures a Postgres trigger to auto-update the `updated_at` timestamps.

### 2. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy the template environment file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your Supabase credentials and Google Gemini API Key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

### 3. Install Dependencies
Run the package installation:
```bash
npm install
```

---

## 💻 Running the App

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Build for Production
To bundle the frontend for production hosting:
```bash
npm run build
```
The output files will be compiled inside the `dist/` directory.

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.