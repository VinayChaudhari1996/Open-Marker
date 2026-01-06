
<div align="center">
  <a href="https://github.com/yourusername/open-marker">
    <img src="docs/logo.svg" alt="Open Marker Logo" width="600" height="auto">
  </a>

  <h1 align="center">Open Marker</h1>

  <p align="center">
    <b>Turn natural language into professional architecture diagrams in seconds.</b>
    <br />
    Powered by Google Gemini 3 & React Flow.
  </p>

  <p align="center">
    <a href="#-getting-started"><strong>Get Started »</strong></a>
    <br />
    <br />
    <a href="https://github.com/yourusername/open-marker/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/open-marker/pulls">Request Feature</a>
  </p>
</div>

<br />

<details open>
  <summary><b>Table of Contents</b></summary>
  <ol>
    <li><a href="#-about-the-project">About The Project</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-ai-architecture">AI Architecture</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-usage">Usage</a></li>
    <li><a href="#-license">License</a></li>
  </ol>
</details>

<hr />

## 🚀 About The Project

**Open Marker** is a generative diagramming tool that transforms simple text descriptions into complex, professional software architecture blueprints. 

Traditional diagramming tools require you to drag, drop, and align boxes manually. Open Marker flips this workflow: you act as the *Architect* describing the system, and the AI acts as the *Drafter*, instantly visualizing your thoughts with correct iconography, grouping, and directional flow.

## ✨ Features

*   **⚡ Real-time Streaming**: Diagrams are drafted node-by-node as the AI thinks, providing immediate visual feedback.
*   **🧠 Context Aware**: Understands technical jargon (e.g., "K8s cluster", "Load Balancer", "S3 Bucket") and maps them to appropriate visual components.
*   **🎨 Auto-Styling**: Automatically applies "Liquid Glass" aesthetics, color-coded boundaries, and Lucide icons based on component type.
*   **🌗 Adaptive UI**: A fully responsive interface with a carefully crafted Dark Mode.
*   **📝 Annotation**: Add handwritten-style notes and annotations directly onto the canvas.
*   **💾 Session Management**: Auto-saves your workspaces locally so you never lose a fleeting idea.
*   **🖼️ Export Ready**: Copy high-resolution PNGs directly to your clipboard for use in documentation or presentations.

## 🤖 AI Architecture

Open Marker utilizes a multi-agent system powered by the **Google Gemini 3** series to ensure speed and accuracy.

| Agent Role | Model | Responsibility |
| :--- | :--- | :--- |
| **The Architect** | `gemini-3-flash-preview` | **Core Engine.** Processes natural language, determines topology, and streams the graph structure (Nodes/Edges). Optimized for low latency. |
| **The Stylist** | `gemini-3-flash-preview` | **Iconography.** Analyzes semantic labels (e.g., "Redis") and maps them to the correct Lucide icon component (e.g., `Database`). |
| **The Inspector** | `gemini-3-pro-preview` | **Quality Assurance.** Periodically reviews the graph for disconnected nodes, logical fallacies, or layout optimization opportunities. |

## 🛠️ Tech Stack

*   **Frontend Framework**: [React 19](https://react.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Visual Engine**: [React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) (Auto-layout)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
*   **Generative AI**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these steps to set up Open Marker on your local machine.

### Prerequisites

*   **Node.js**: Version 18 or higher.
*   **npm** or **yarn**: Package manager.
*   **Google AI Studio Key**: You need a valid API key from [Google AI Studio](https://aistudio.google.com/).

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/open-marker.git
    cd open-marker
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory (or rename `.env.example` if available).
    ```bash
    touch .env
    ```
    Add your API key:
    ```env
    # .env
    API_KEY=your_google_gemini_api_key_here
    ```
    *(Note: The application accesses `process.env.API_KEY` via your bundler's injection method).*

4.  **Run Development Server**
    ```bash
    npm start
    # or
    yarn start
    ```

5.  **Access the App**
    Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

## 🎮 Usage

1.  **Describe**: Type a prompt into the sidebar chat.
    *   *Example: "Design a scalable microservices architecture for an E-commerce app using AWS, with a React frontend, API Gateway, Lambda functions, and DynamoDB."*
2.  **Refine**: Double-click any node to edit its label, icon, or description manually.
3.  **Organize**: Drag nodes to adjust the layout if needed (though auto-layout handles most cases).
4.  **Export**: Right-click on the canvas background and select **"Export to Clipboard"** to paste your diagram into Slack, Notion, or Docs.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">
  Built with ❤️ using <a href="https://reactflow.dev">React Flow</a> and <a href="https://deepmind.google/technologies/gemini/">Gemini</a>.
</p>
