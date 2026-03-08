# Software Docs Package

This folder contains submission-ready software engineering documentation for the Student Helper backend.

## Files
- `SRS.md`
  - IEEE-style Software Requirements Specification
  - Covers scope, modules, functional and non-functional requirements
- `CLASS_DIAGRAM.md`
  - Mermaid UML class diagram of entities and key backend architecture
  - Includes controllers, services, repositories, and major relationships
- `USE_CASES.md`
  - Actor-wise use case specification
  - Organized by Student, Broker, Hostel Admin, and System Services

## How to Export Diagrams for Submission

### Option 1: VS Code Mermaid Preview
1. Open `software-docs/CLASS_DIAGRAM.md`.
2. Use Markdown preview (`Ctrl+Shift+V`).
3. Use a Mermaid/Markdown export extension to save as PNG/PDF.

### Option 2: Mermaid Live Editor
1. Copy the Mermaid block from `CLASS_DIAGRAM.md`.
2. Open https://mermaid.live.
3. Paste and render diagram.
4. Export as PNG or SVG.

### Option 3: PDF Submission Bundle
1. Keep these markdown files as source.
2. Export each to PDF (using VS Code Markdown PDF extension or Pandoc).
3. Submit as:
   - `SRS.pdf`
   - `ClassDiagram.pdf`
   - `UseCases.pdf`

## Notes
- Content is aligned with implemented modules under `backend-spring`.
- If APIs/entities change, update these docs before final submission.
