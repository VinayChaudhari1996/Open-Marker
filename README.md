
<div align="center">
  <a href="https://github.com/yourusername/open-marker">
    <img src="docs/logo.svg" alt="Open Marker Logo" width="600" height="auto">
  </a>

  <h1 align="center">Open Marker</h1>

  <p align="center">
    <b>Turn natural language into professional architecture diagrams in seconds.</b>
    <br />
    <br />
    <a href="https://github.com/yourusername/open-marker/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/open-marker/pulls">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#-what-does-this-solve">About The Project</a></li>
    <li><a href="#-the-multi-agent-engine">How It Works</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-features">Features</a></li>
  </ol>
</details>

<hr />

### 🚀 What does this solve?

Creating software diagrams is usually slow and tedious. You spend more time aligning boxes and finding icons than actually thinking about the architecture.

**Open Marker fixes this:**
1.  **Speed**: Type a sentence, get a diagram.
2.  **Accuracy**: It understands technical concepts (AWS, Databases, APIs).
3.  **Self-Correcting**: It doesn't just generate random nodes; it self-repairs to ensure the diagram makes sense.

---

### 🤖 The Multi-Agent Engine

This isn't just a simple chatbot. Open Marker uses a **Multi-Agent System** where three different AI "employees" work together to build your diagram:

1.  **The Architect** 🏗️
    *   *Role:* Reads your request and drafts the initial raw structure of nodes and edges.
    *   *Model:* Gemini 3 Pro

2.  **The Inspector** 🕵️
    *   *Role:* Reviews the Architect's work. It fixes broken connections, simplifies messy layouts, and ensures the diagram follows logical patterns (Left → Right flow).
    *   *Model:* Gemini 3 Pro

3.  **The Designer** 🎨
    *   *Role:* Looks at the final nodes and selects the perfect icon for each service (e.g., picking the official Postgres logo for a database node).
    *   *Model:* Gemini 2.5 Flash

---

### 🛠️ Tech Stack

*   **Frontend**: React + TypeScript
*   **Visuals**: Tailwind CSS + Shadcn/ui
*   **Diagramming**: React Flow + Dagre (Auto-layout)
*   **AI Models**: Google Gemini API via `@google/genai`
*   **Icons**: Lucide React

---

### ⚡ Getting Started

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/open-marker.git
    cd open-marker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set your API Key**
    Open Marker requires a Google Gemini API key.
    
    *   Create a `.env` file in the root.
    *   Add: `API_KEY=your_google_ai_key_here`

4.  **Run it**
    ```bash
    npm start
    ```

---

### 📸 Features
*   **Interactive Canvas**: Drag, zoom, and pan around your diagram.
*   **Edit Mode**: Double-click any node or edge to change text or colors.
*   **Smart History**: It remembers your previous diagrams so you can switch back.
*   **Export**: Right-click to copy the diagram as a high-quality PNG.
*   **Dark Mode**: Fully supported Apple-style dark theme.

**License**: MIT
