# Vinayak Tuition Classes 🎓

A modern, responsive, bilingual web application for **Vinayak Tuition Classes**, located in Kalol, Gandhinagar, Gujarat. Built with **Next.js**, **TypeScript**, and **Tailwind CSS**, this platform serves as an interactive hub for students and parents.

---

## 🌟 Features

- **🌐 Multi-Language Support (Bilingual)**: Full English (EN) and Gujarati (GJ) localization with language toggling.
- **📱 Responsive & Interactive UI**: Premium glassmorphic design featuring smooth animations with Framer Motion, a custom glow cursor, and WhatsApp support.
- **📝 Admission Form**: Online admission application form for students of Std. 1 to 12.
- **💬 Testimonials & Reviews**: Direct reviews from students/parents, with a local form to submit new testimonials.
- **📸 Life at Vinayak (Gallery)**: Visual showcase of classroom activities, doubt-solving sessions, and annual events.
- **✨ Progressive Web App (PWA)**: Optimized for mobile viewing, works offline, and installs as an app on users' home screens.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Offline / Mobile Optimization**: `@ducanh2912/next-pwa` (PWA support)

---

## 📂 Project Structure

```text
vinayak-tuition-classes/
├── public/                 # Static assets (images, logos, manifest, service workers)
├── src/
│   ├── app/                # Next.js App Router (pages and layouts)
│   │   ├── gallery/        # Gallery Page
│   │   └── page.tsx        # Homepage
│   ├── components/
│   │   ├── layout/         # Header and Footer
│   │   ├── sections/       # Landing page sections (About, Courses, Admission, etc.)
│   │   └── ui/             # Reusable UI elements (CursorGlow, GlassCard, etc.)
│   └── context/            # Global state (ThemeContext, LanguageContext)
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sumit9094/Vinayak-Tuition-Classes.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "Vinayak Tuition Classes"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Build & Production

To generate a production build:

```bash
npm run build
```

To run the built production version locally:

```bash
npm run start
```
