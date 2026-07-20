# Retro Notebook Studio

Retro Notebook Studio is a Windows 98-inspired Electron notebook for writing, studying, and building reusable learning material. It combines a classic Word/OneNote-style document editor with notebooks, folders, tags, LaTeX equations, editable charts and graphs, templates, SmartPhrases, and spaced-repetition flashcards.

The interface uses [98.css](https://unpkg.com/98.css) with Windows 98-style icons from `@react95/icons`.

## Features

- Notebook binder with colored notebooks, folders, pages, favorites, tags, and page search.
- Rich document editor with headings, glossary titles, quotes, fonts, text color, highlight color, alignment, bulleted and numbered lists, line spacing, dividers, superscript, and subscript.
- Spellcheck with misspelled-word suggestions and dictionary actions in the Windows 98-style right-click menu.
- Word-style symbol insertion with quick recent symbols, searchable symbol categories, Unicode character codes, and a larger More Symbols dialog.
- Per-page paper sizes, including Letter, A4, Legal, Executive, and Index Card.
- In-app print preview with paper-sized pages, clean print output, and embedded chart/graph controls removed.
- Headers, footers, and page numbers with top-left, top-middle, top-right, bottom-left, bottom-middle, and bottom-right placement.
- Non-printing page guides and manual page-break markers for essay-style drafting.
- LaTeX workspace for naming, previewing, searching, and saving equations, with an external learning link for new LaTeX users.
- Editable tables with a Word-style insert dialog, row/column insert and delete actions, header-row toggling, and drag resizing for rows and columns.
- Editable charts and data graphs with spreadsheet-style data entry and custom series, point, and pie-slice colors.
- Chart types include column, bar, stacked column, line, area, pie, doughnut, and radar.
- Graph types include scatter, line graph, area graph, bubble, 3D scatter, and 3D line.
- Interactive 3D graph rotation by dragging the graph canvas.
- Image insertion and paste support.
- Hyperlink insertion from the toolbar, Insert menu, or right-click menu.
- Drawing pad insertion for quick sketches.
- Template workspace for built-in and custom editable page templates, including template search.
- SmartPhrases that expand from slash commands like `/summary`, including phrase search.
- Flashcard creation from selected text or manual rich-card entry.
- Spaced-repetition review with Again, Hard, Good, and Easy grading.
- Dictation and text-to-speech support when available in the Electron runtime.
- Citation manager inspired by EndNote and Citation Machine for saving article metadata, links, DOI values, PDF attachments, inline citations, and ordered bibliographies.
- Citation Auto Fill can retrieve DOI/Crossref metadata, read common webpage citation meta tags, infer details from URLs, and extract basic embedded PDF title/author/year metadata when available.
- Attached PDFs are stored in local browser storage and can be previewed inside the citation manager, including large PDFs.
- Citation styles include APA, MLA, Chicago, Vancouver, AMA, and a custom template format.
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

Use the paper-size selector in the formatting toolbar to set the current page size. Non-printing page guides appear as labeled dashed rules when content flows past a paper boundary. The Page Setup tool panel lets you add header text, footer text, page numbers, and manual page breaks. A Letter page breaks at roughly 40-45 normal 12 pt lines, depending on formatting, tables, graphs, and images.

Click the print button to open Retro Notebook Studio's in-app print preview. The preview paginates the current note into paper-sized sheets and shows headers, footers, and page numbers before you send it to the system print dialog.

For equations, open the LaTeX tool panel, name an equation, save it, then insert it from the sigma equation dropdown in the toolbar.

For charts and graphs, choose Insert Chart or Insert Graph, name the object, select a type, and edit the spreadsheet-style data grid. Inserted chart and graph widgets can be edited or deleted from their widget controls. Drag 3D graphs to rotate them.

For flashcards, select text in a note and click the flashcard button, or open the Cards panel and write the front and back manually. Review due cards in the Review panel and grade recall using Again, Hard, Good, or Easy.

For SmartPhrases, create a phrase in the Phrases panel and trigger it in the editor by typing `/` followed by the phrase name.

For citations, open the Cite panel, choose a style, save sources with article metadata, DOI values, URLs, notes, and optional PDF attachments, then insert citations into the page. Use Auto Fill to retrieve or infer citation details from a DOI, web link, or PDF. Use Insert / Update Bibliography to generate the citation section in first-use order.

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
