# ReqArchitect Chat 🤖

ReqArchitect Chat is an AI-powered business analyst assistant built with Next.js and Google's Gemini models via Genkit. It helps you brainstorm, generate, and refine software requirements through an intuitive conversational interface.

## ✨ Features

- **📝 Conversational Requirement Generation**: Describe your app idea in plain English and get a structured list of requirements. The AI maintains a cumulative list throughout the conversation.
- **🔄 Iterative Refinement**: Continue the conversation to add, remove, or modify requirements based on your feedback.
- **📊 Requirement Classification**: Automatically classify requirements into `functional`, `non-functional`, `domain`, and `inverse` categories.
- **👤 User Story Generation**: Create well-formatted user stories from functional requirements, complete with user personas, features, benefits, and acceptance criteria.
- **🤝 Stakeholder Identification**: Identify potential stakeholders and user roles based on the project requirements to get a better understanding of your target audience.
- **📄 Automated Reporting**: Generate a comprehensive report containing classified requirements, user stories, and stakeholders, which can be viewed on the dashboard and exported as a PDF.
- **📱 Fully Responsive**: A clean and intuitive layout that works on both desktop and mobile devices.
- **🎨 Light/Dark Mode**: Toggle between light and dark themes for your comfort.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI/Generative**: [Google's Gemini](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or another package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/reqarchitect.git
   cd reqarchitect
   ```

2. **Install NPM packages:**
   ```bash
   npm install
   ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the application.

The page will auto-update as you edit the files.

### Genkit Development

This project uses Genkit to manage AI flows. To start the Genkit development server and inspect your flows, run:

```bash
npm run genkit:dev
```

This will start the Genkit UI at [http://localhost:4000](http://localhost:4000).
