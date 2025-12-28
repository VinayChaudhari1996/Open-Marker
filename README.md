
<div align="center">
  <a href="https://github.com/yourusername/open-marker">
    <img src="docs/logo.svg" alt="Open Marker Logo" width="600" height="auto">
  </a>

  <h1 align="center">Open Marker</h1>

  <p align="center">
    <b>Turn natural language into professional architecture diagrams in seconds.</b>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#-what-does-this-solve">About The Project</a></li>
    <li><a href="#-the-accelerated-engine">How It Works</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-features">Features</a></li>
  </ol>
</details>

<hr />

### 🚀 What does this solve?

Creating software diagrams is usually slow and tedious. You spend more time aligning boxes and finding icons than actually thinking about the architecture.

**Open Marker fixes this:**
1.  **Lightning Speed**: Leveraging **Gemini 3 Flash**, diagrams are drafted and rendered in real-time.
2.  **Contextual Awareness**: It understands technical concepts (AWS, Databases, APIs) and can even scan URLs for context.
3.  **Visual Polish**: It doesn't just generate boxes; it applies meaningful styles and icons automatically.

---

### ⚡ The Accelerated Engine

We've optimized Open Marker for speed. By removing unnecessary auditing steps and moving to the latest Flash models, we've achieved near-instant diagram generation:

1.  **The Architect** 🏗️
    *   *Role:* Processes your prompt (or a scraped website) and immediately generates a logical graph of nodes and edges.
    *   *Model:* `gemini-3-flash-preview`

2.  **The Stylist** 🎨
    *   *Role:* Scans the final architecture to map each service to its perfect Lucide icon (e.g., selecting the database icon for Redis).
    *   *Model:* `gemini-3-flash-preview`

---

### 🛠️ Tech Stack

*   **Frontend**: React + TypeScript
*   **Visuals**: Tailwind CSS + Shadcn/ui (Liquid glass aesthetic)
*   **Diagramming**: React Flow + Dagre (Auto-layout)
*   **AI Models**: Google Gemini API via `@google/genai`
*   **Icons**: Lucide React
*   **Typography**: Figtree (Clean, modern sans-serif)

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
    
    *   The application looks for `process.env.API_KEY`.
    *   Ensure your environment is configured with a valid key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run it**
    ```bash
    npm start
    ```

---

### 📸 Features
*   **Streaming Diagrams**: Watch the architecture build itself as the AI thinks.
*   **URL Context**: Paste a link to a GitHub repo or a tech blog to diagram its contents.
*   **Interactive Canvas**: Drag, zoom, and pan. Double-click any node or edge to edit labels and descriptions.
*   **Rich Export**: Right-click anywhere on the canvas to "Copy as PNG" to your clipboard.
*   **Note Taking**: Add handwritten-style notes to your diagrams for that "whiteboard" feel.
*   **Dark Mode**: A refined, spatial dark theme that stays easy on the eyes.

**License**: MIT
