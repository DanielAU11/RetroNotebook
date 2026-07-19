# Retro Notebook Studio

Retro Notebook Studio is a Windows 98-inspired Electron notebook for writing, studying, and building reusable learning material. It combines a classic Word/OneNote-style document editor with notebooks, folders, tags, LaTeX equations, editable charts and graphs, templates, SmartPhrases, and spaced-repetition flashcards.

The interface uses [98.css](https://unpkg.com/98.css) with Windows 98-style icons from `@react95/icons`.

## Features

- Notebook binder with colored notebooks, folders, pages, favorites, tags, and page search.
- Rich document editor with headings, glossary titles, quotes, fonts, text color, highlight color, alignment, lists, checklist items, line spacing, dividers, superscript, and subscript.
- Per-page paper sizes, including Letter, A4, Legal, Executive, and Index Card.
- Printable pages with app chrome hidden and embedded chart/graph controls removed for clean output.
- LaTeX workspace for naming and saving equations, then inserting them from the toolbar.
- Editable tables, charts, and data graphs.
- Chart types include column, bar, stacked column, line, area, pie, doughnut, and radar.
- Graph types include scatter, line graph, area graph, bubble, 3D scatter, and 3D line.
- Interactive 3D graph rotation by dragging the graph canvas.
- Image insertion and paste support.
- Drawing pad insertion for quick sketches.
- Template workspace for built-in and custom editable page templates.
- SmartPhrases that expand from slash commands like `/summary`.
- Flashcard creation from selected text or manual rich-card entry.
- Spaced-repetition review with Again, Hard, Good, and Easy grading.
- Dictation and text-to-speech support when available in the Electron runtime.
- Local autosave through browser storage plus JSON export for backups.

## Install

Install Node.js first. Node 20 or newer is recommended.

```powershell
git clone https://github.com/DanielAU11/RetroNotebook.git
cd RetroNotebook
npm install
```

## Run

```powershell
npm start
```

The app opens as an Electron desktop window.

## Build Notes

This project currently ships as a development Electron app. The `npm run make` script starts the Electron app as well; packaging into a distributable installer can be added later with Electron Forge or Electron Builder.

## How To Use

Create notebooks from the Notebook Binder, choose a notebook color, then create folders and pages inside it. Use the top toolbar and application menus for document editing, inserting equations, tables, charts, graphs, images, dividers, and glossary blocks.

Use the paper-size selector in the formatting toolbar to set the current page size. Page breaks appear as gray bands in the writing surface, and printing uses the selected paper dimensions.

For equations, open the LaTeX tool panel, name an equation, save it, then insert it from the sigma equation dropdown in the toolbar.

For charts and graphs, choose Insert Chart or Insert Graph, name the object, select a type, and edit the spreadsheet-style data grid. Inserted chart and graph widgets can be edited or deleted from their widget controls. Drag 3D graphs to rotate them.

For flashcards, select text in a note and click the flashcard button, or open the Cards panel and write the front and back manually. Review due cards in the Review panel and grade recall using Again, Hard, Good, or Easy.

For SmartPhrases, create a phrase in the Phrases panel and trigger it in the editor by typing `/` followed by the phrase name.

## Data And Backups

Notebook data is autosaved locally in Electron/browser storage. Use the export button or File menu to download a JSON backup of your notebook state.

Because data is local-first, keep periodic exports if you are using Retro Notebook Studio for important work.

## Project Structure

```text
src/
  index.html    App shell and Windows 98-style UI structure
  renderer.js   Notebook state, editor behavior, charts, graphs, flashcards
  styles.css    Retro UI styling, editor layout, print styles
  main.js       Electron main process
  preload.js    Safe clipboard bridge for text and images
```

## Scripts

```powershell
npm start
npm run make
```

## License

MIT
