const STORAGE_KEY = "retro-notebook-state-v3";
const LEGACY_STORAGE_KEYS = ["retro-notebook-state-v2", "retro-notebook-state-v1"];
const DAY_MS = 24 * 60 * 60 * 1000;
const NOTEBOOK_COLORS = ["#2566a8", "#347a3a", "#7d4e9f", "#b7791f", "#b54848", "#008080", "#7030a0", "#6b5b2a"];
const SMART_PHRASE_LIMIT = 8;
const DEFAULT_TAG_COLORS = ["#fff7a8", "#cce8ff", "#d9f2d0", "#f7d4d4", "#e8ddff", "#f5dfbd"];
const DATA_CHART_TYPES = {
  chart: [
    ["column", "Column"],
    ["bar", "Bar"],
    ["stackedColumn", "Stacked Column"],
    ["line", "Line"],
    ["area", "Area"],
    ["pie", "Pie"],
    ["doughnut", "Doughnut"],
    ["radar", "Radar"]
  ],
  graph: [
    ["scatter", "Scatter"],
    ["lineGraph", "Line Graph"],
    ["areaGraph", "Area Graph"],
    ["bubble", "Bubble"],
    ["threeDScatter", "3D Scatter"],
    ["threeDLine", "3D Line"]
  ]
};
const PAPER_SIZES = {
  letter: { label: "Letter", width: "8.5in", height: "11in", paddingX: "0.68in", paddingY: "0.55in" },
  a4: { label: "A4", width: "8.27in", height: "11.69in", paddingX: "0.62in", paddingY: "0.55in" },
  legal: { label: "Legal", width: "8.5in", height: "14in", paddingX: "0.68in", paddingY: "0.55in" },
  executive: { label: "Executive", width: "7.25in", height: "10.5in", paddingX: "0.58in", paddingY: "0.48in" },
  index: { label: "Index Card", width: "5in", height: "3in", paddingX: "0.32in", paddingY: "0.24in" }
};
const DEFAULT_PAGE_SETUP = {
  header: "",
  footer: "",
  headerAlign: "left",
  footerAlign: "center",
  pageNumberPosition: "bottom-right",
  pageNumberTotal: false
};
const CITATION_STYLES = ["apa", "mla", "chicago", "vancouver", "ama", "custom"];
const FORMAT_COLORS = [
  "#000000",
  "#808080",
  "#ffffff",
  "#800000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00a000",
  "#00ffff",
  "#0000ff",
  "#000080",
  "#800080",
  "#ff00ff",
  "#fff7a8",
  "#cce8ff",
  "#d9f2d0"
];
const SYMBOL_SETS = {
  symbol: {
    label: "Symbol",
    chars: "ΩβγαλπΔΨσμρ∞™®©§¶†‡•·°±×÷≈≠≤≥√∑∫∂ƒ→←↔↕"
  },
  greek: {
    label: "Greek",
    chars: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω"
  },
  math: {
    label: "Mathematical Operators",
    chars: "∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∵∼≅≈≠≡≤≥⊂⊃⊆⊇⊕⊗⊥⋅⌈⌉⌊⌋"
  },
  arrows: {
    label: "Arrows",
    chars: "←↑→↓↔↕↖↗↘↙↩↪↫↬⇐⇑⇒⇓⇔⇕➜➔➝"
  },
  currency: {
    label: "Currency And Marks",
    chars: "$¢£¤¥€₩₪₹₽₿©®™℠§¶†‡"
  },
  punctuation: {
    label: "Special Characters",
    chars: "—–‘’“”‚„…•·¡¿«»‹›"
  }
};
const QUICK_SYMBOLS = ["β", "γ", "α", "β", "®", "η", "π", "Δ", "γ", "σ", "μ", "ρ", "∞", "™", "°", "≥"];
const COMMON_SPELLING_FIXES = {
  teh: "the",
  adn: "and",
  recieve: "receive",
  seperate: "separate",
  occured: "occurred",
  definately: "definitely",
  accomodate: "accommodate",
  repitition: "repetition",
  hihglight: "highlight",
  highlught: "highlight",
  citaiton: "citation",
  diferrent: "different"
};
const BASE_SPELL_WORDS = `
  a about above acid active add added addition after again against all allows alpha also an analog analogs analysis and any aqueous are artery as at automatically available
  back based be because before beta between bibliography biology blood body both browser build button by calcium can canvas carbon card cards case cell center chart charts
  citation citations class clear clinical column columns common confidence content control copy create current custom data decrease decreases delete dictionary document dose dosing
  drug drugs due dynamic each easy edit editor effect effects equation equations every evidence example exam eye file first flashcard flashcards flow folder font footer for form from
  gamma glaucoma good graph graphs green hard has have header headers help high highlight history hour html hyperlink if image images in increase increases inhibitor inhibitors insert
  interaction internal into journal label labels latex learning left line link list manage math medication menu model monthly move name navy next note notebook notes number numbers
  object obviously of off on one open option options order out outflow page pages paper paste pharmacology phrase phrases pressure preview print prostaglandin quiz recall reference
  references reminder remove repeat repetition review right row rows save scale scan schedule section select selected sentence setup show smart spell spelling study style suggestion
  suggestions superscript table tables tag tags template templates text the their them then there these this time title to toolbar tool tools topic type underline undo unit units url
  use used user users value values view week weekly white with word words workspace write x y z zoom
  person people patient patients student students teacher teachers author authors article articles essay essays sentence sentences paragraph paragraphs increase increased decreasing
  obvious obviously wrong correct correction corrected prostaglandin prostaglandins blocker blockers agonist agonists antagonist antagonists analog analogue analogues medication medications
`.split(/\s+/).filter(Boolean);
const SPELL_WORD_SET = new Set([...BASE_SPELL_WORDS, ...Object.values(COMMON_SPELLING_FIXES)].map((word) => word.toLowerCase()));

const els = {};
let state;
let activeId;
let selectedFolderId;
let reviewQueue = [];
let reviewIndex = 0;
let answerVisible = false;
let saveTimer;
let dialogResolve = null;
let focusedCardEditor = null;
let contextTarget = null;
let contextImageSrc = "";
let contextObject = null;
let contextTableCell = null;
let spellcheckContext = { word: "", suggestions: [], x: 0, y: 0, at: 0, range: null };
let selectedObject = null;
let selectedTableCell = null;
let binderContext = null;
let editingTemplateId = null;
let editingPhraseId = null;
let editingCardId = null;
let selectedCitationId = null;
let phraseRange = null;
let activeRichEditor = null;
let pendingImageTarget = null;
let recognition = null;
let isDictating = false;
const pdfObjectUrls = new Map();
const savedSelections = new WeakMap();
let paginationTimer = null;
let paginatingEditor = false;
let calendarView = "week";
let calendarCursor = "";
let selectedCalendarEventId = null;
let reviewNotebookFilter = "";
let reviewPageFilter = "";
let activePdfId = null;
let pendingPdfFolderId = null;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  state = loadState();
  activeId = state.activeId || state.pages[0]?.id;
  activePdfId = state.activePdfId || null;
  selectedFolderId = activePage()?.folderId || state.folders[0]?.id;
  bindEvents();
  renderAll(true);
  startClock();
  setStatus("Ready. Your notebook is autosaving locally.");
});

function bindElements() {
  [
    "searchInput",
    "searchResults",
    "newFolderIconBtn",
    "newPageIconBtn",
    "deletePageIconBtn",
    "exportIconBtn",
    "printPageBtn",
    "pageList",
    "binderAddPdfBtn",
    "binderRenameBtn",
    "editorWindowTitle",
    "pageTitleInput",
    "tagInput",
    "editor",
    "pdfWorkspace",
    "pdfTitle",
    "pdfRenameBtn",
    "pdfOpenExternalBtn",
    "pdfDeleteBtn",
    "binderPdfPreview",
    "binderPdfEmpty",
    "pdfHighlightPageInput",
    "pdfHighlightColorInput",
    "pdfHighlightTextInput",
    "pdfHighlightNoteInput",
    "pdfAddHighlightBtn",
    "pdfHighlightList",
    "styleSelect",
    "fontSelect",
    "fontSizeSelect",
    "paperSizeSelect",
    "pageSetupIconBtn",
    "pageHeaderInput",
    "pageFooterInput",
    "headerAlignSelect",
    "footerAlignSelect",
    "pageNumberPositionSelect",
    "pageNumberTotalToggle",
    "insertPageBreakBtn",
    "applyPageSetupBtn",
    "openPrintPreviewBtn",
    "pageBreakInfo",
    "equationSelect",
    "findIconBtn",
    "equationIconBtn",
    "symbolIconBtn",
    "tableIconBtn",
    "chartIconBtn",
    "graphIconBtn",
    "drawIconBtn",
    "linkIconBtn",
    "dividerIconBtn",
    "glossaryIconBtn",
    "makeCardIconBtn",
    "textColorBtn",
    "textColorInput",
    "textColorChip",
    "highlightColorBtn",
    "highlightColorInput",
    "highlightColorChip",
    "lineSpacingSelect",
    "dictationBtn",
    "speakTextBtn",
    "spellcheckBtn",
    "dashPageCount",
    "dashWordCount",
    "dashDueCount",
    "dashNotebookCount",
    "notebookDashboard",
    "recentPagesList",
    "calendarPrevBtn",
    "calendarNextBtn",
    "calendarTodayBtn",
    "calendarWeekBtn",
    "calendarMonthBtn",
    "newCalendarEventBtn",
    "calendarRangeLabel",
    "calendarGrid",
    "calendarTitleInput",
    "calendarDateInput",
    "calendarTimeInput",
    "calendarEndTimeInput",
    "calendarTypeSelect",
    "calendarRepeatSelect",
    "calendarRepeatDaysBtn",
    "calendarRepeatDaysSummary",
    "calendarRepeatDaysMenu",
    "calendarRepeatUntilInput",
    "calendarColorInput",
    "calendarNotesInput",
    "saveCalendarEventBtn",
    "deleteCalendarEventBtn",
    "calendarDoneBtn",
    "calendarUpcomingList",
    "wordCount",
    "charCount",
    "cardCount",
    "nextDue",
    "updatedAt",
    "notebookSelect",
    "notebookColorPreview",
    "newNotebookBtn",
    "renameNotebookBtn",
    "notebookColorBtn",
    "deleteNotebookBtn",
    "toolResizeHandle",
    "tagLibrary",
    "newTagBtn",
    "insertTagListBtn",
    "documentType",
    "learningGoal",
    "applyProfileBtn",
    "templateNameInput",
    "templateEditor",
    "customTemplateList",
    "templateSearchInput",
    "newTemplateBtn",
    "captureTemplateBtn",
    "saveTemplateBtn",
    "phraseTriggerInput",
    "phraseExpansionEditor",
    "smartPhraseList",
    "phraseSearchInput",
    "newPhraseBtn",
    "deletePhraseBtn",
    "savePhraseBtn",
    "citationStyleSelect",
    "citationCustomFormatInput",
    "citationTitleInput",
    "citationAuthorsInput",
    "citationYearInput",
    "citationJournalInput",
    "citationDoiInput",
    "citationUrlInput",
    "citationNotesInput",
    "citationAutoBtn",
    "citationPdfBtn",
    "newCitationBtn",
    "saveCitationBtn",
    "deleteCitationBtn",
    "citationList",
    "insertCitationBtn",
    "insertBibliographyBtn",
    "citationPdfPreview",
    "citationPdfEmpty",
    "latexInput",
    "latexNameInput",
    "latexPreview",
    "latexDisplayMode",
    "previewLatexBtn",
    "insertLatexBtn",
    "saveLatexSnippetBtn",
    "latexSnippetList",
    "equationSearchInput",
    "cardFront",
    "cardBack",
    "reverseCardToggle",
    "cardEquationBtn",
    "clozeCardBtn",
    "swapCardBtn",
    "clearCardBtn",
    "makeCardFromSelectionBtn",
    "addCardBtn",
    "pageCards",
    "dueCardList",
    "reviewNotebookSelect",
    "reviewPageSelect",
    "reviewCard",
    "statusText",
    "countText",
    "clockText",
    "appMenu",
    "contextMenu",
    "spellcheckMenuItems",
    "binderContextMenu",
    "colorMenu",
    "symbolMenu",
    "phraseMenu",
    "modalOverlay",
    "dialogTitle",
    "dialogCloseBtn",
    "dialogIcon",
    "dialogMessage",
    "dialogFields",
    "dialogButtons",
    "imageFileInput",
    "citationPdfInput",
    "binderPdfInput",
    "printPreviewOverlay",
    "printPreviewPages",
    "printPreviewSummary",
    "refreshPrintPreviewBtn",
    "systemPrintBtn",
    "cancelPrintPreviewBtn",
    "closePrintPreviewBtn"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  bindToolResizer();
  bindRichEditors();

  document.querySelectorAll("[data-main-tab]").forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      switchMainTab(tab.dataset.mainTab);
    });
  });

  els.newFolderIconBtn.addEventListener("click", createFolder);
  els.newPageIconBtn.addEventListener("click", createPage);
  els.deletePageIconBtn.addEventListener("click", deleteActivePage);
  els.exportIconBtn.addEventListener("click", exportNotebook);
  els.printPageBtn.addEventListener("click", openPrintPreview);
  els.binderAddPdfBtn.addEventListener("click", () => addPdfToFolder(selectedFolderId || firstFolderForNotebook(activeNotebookName())?.id));
  els.binderRenameBtn.addEventListener("click", renameSelectedBinderItem);
  els.binderPdfInput.addEventListener("change", importBinderPdf);
  els.pdfRenameBtn.addEventListener("click", () => renamePdfById(activePdfId));
  els.pdfOpenExternalBtn.addEventListener("click", openActivePdfExternal);
  els.pdfDeleteBtn.addEventListener("click", () => deletePdfById(activePdfId));
  els.pdfAddHighlightBtn.addEventListener("click", addPdfHighlight);
  els.searchInput.addEventListener("input", () => {
    renderBinder();
    renderSearchResults();
    highlightFindTerm(els.searchInput.value);
  });

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => exec(button.dataset.command));
  });
  els.styleSelect.addEventListener("change", () => exec("formatBlock", els.styleSelect.value));
  els.fontSelect.addEventListener("change", () => exec("fontName", els.fontSelect.value));
  els.fontSizeSelect.addEventListener("change", () => exec("fontSize", els.fontSizeSelect.value));
  els.paperSizeSelect.addEventListener("change", updateActivePaperSize);
  els.pageSetupIconBtn.addEventListener("click", openPageSetupDialog);
  els.applyPageSetupBtn.addEventListener("click", applyPageSetup);
  els.insertPageBreakBtn.addEventListener("click", insertManualPageBreak);
  els.openPrintPreviewBtn.addEventListener("click", openPrintPreview);
  [els.pageHeaderInput, els.pageFooterInput, els.headerAlignSelect, els.footerAlignSelect, els.pageNumberPositionSelect, els.pageNumberTotalToggle].forEach((input) => {
    input.addEventListener("change", applyPageSetup);
  });
  els.textColorBtn.addEventListener("click", () => showColorMenu("text", els.textColorBtn));
  els.highlightColorBtn.addEventListener("click", () => showColorMenu("highlight", els.highlightColorBtn));
  els.textColorInput.addEventListener("input", () => applyTextColor());
  els.highlightColorInput.addEventListener("input", () => applyHighlightColor());
  els.lineSpacingSelect.addEventListener("change", applyLineSpacing);
  els.dictationBtn.addEventListener("click", toggleDictation);
  els.speakTextBtn.addEventListener("click", speakSelection);
  els.spellcheckBtn.addEventListener("click", showSpellcheckHelp);
  els.calendarPrevBtn.addEventListener("click", () => moveCalendar(-1));
  els.calendarNextBtn.addEventListener("click", () => moveCalendar(1));
  els.calendarTodayBtn.addEventListener("click", () => {
    calendarCursor = dateKey(new Date());
    renderCalendar();
  });
  els.calendarWeekBtn.addEventListener("click", () => setCalendarView("week"));
  els.calendarMonthBtn.addEventListener("click", () => setCalendarView("month"));
  els.newCalendarEventBtn.addEventListener("click", () => newCalendarEventDraft("", { clearDate: true }));
  els.saveCalendarEventBtn.addEventListener("click", saveCalendarEvent);
  els.deleteCalendarEventBtn.addEventListener("click", deleteCalendarEvent);
  els.calendarDoneBtn.addEventListener("click", toggleCalendarEventDone);
  els.calendarRepeatSelect.addEventListener("change", updateCalendarRepeatControls);
  els.calendarRepeatDaysBtn.addEventListener("click", (event) => {
    event.preventDefault();
    els.calendarRepeatDaysMenu.hidden = !els.calendarRepeatDaysMenu.hidden;
  });
  els.calendarRepeatDaysMenu.querySelector("[data-repeat-days-all]").addEventListener("click", () => setCalendarRepeatDays([0, 1, 2, 3, 4, 5, 6]));
  els.calendarRepeatDaysMenu.querySelector("[data-repeat-days-clear]").addEventListener("click", () => {
    setCalendarRepeatDays([]);
  });
  els.calendarRepeatDaysMenu.querySelectorAll("[data-repeat-day]").forEach((input) => {
    input.addEventListener("change", updateCalendarRepeatSummary);
  });
  els.reviewNotebookSelect.addEventListener("change", () => {
    reviewNotebookFilter = els.reviewNotebookSelect.value;
    reviewPageFilter = "";
    answerVisible = false;
    reviewIndex = 0;
    renderReviewFilters();
    renderReview();
  });
  els.reviewPageSelect.addEventListener("change", () => {
    reviewPageFilter = els.reviewPageSelect.value;
    answerVisible = false;
    reviewIndex = 0;
    renderReview();
  });

  els.pageTitleInput.addEventListener("input", () => {
    const page = activePage();
    page.title = els.pageTitleInput.value.trim() || "Untitled page";
    page.updatedAt = Date.now();
    queueSave();
    renderChrome();
    renderBinder();
    renderDashboard();
  });

  els.tagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitTagInput();
    }
  });
  els.tagInput.addEventListener("blur", commitTagInput);

  els.newNotebookBtn.addEventListener("click", createNotebook);
  els.notebookSelect.addEventListener("change", () => selectNotebook(els.notebookSelect.value));
  els.renameNotebookBtn.addEventListener("click", renameNotebook);
  els.notebookColorBtn.addEventListener("click", recolorNotebook);
  els.deleteNotebookBtn.addEventListener("click", deleteNotebook);

  els.editor.addEventListener("input", () => {
    if (paginatingEditor) return;
    clearFindMarks();
    const page = loadedEditorPage();
    if (!page) return;
    page.content = cleanRichHtml(els.editor);
    page.plain = cleanRichText(els.editor);
    page.updatedAt = Date.now();
    queueSave();
    scheduleAutoPagination();
    renderStats();
    renderDashboard();
    if (document.querySelector("#citationsPanel.active")) renderCitationManager();
    updatePhraseMenu();
  });
  els.editor.addEventListener("beforeinput", removeAutoPageBreaks);
  els.editor.addEventListener("keyup", updatePhraseMenu);
  els.editor.addEventListener("keydown", handleEditorKeydown);

  els.editor.addEventListener("click", (event) => {
    if (handleImageResize(event)) return;
    handleObjectSelectionClick(event);
    if (event.target.matches(".draw-pad")) event.preventDefault();
    if (event.target.closest("[data-widget-action]")) handleWidgetAction(event);
    if (event.target.closest("[data-graph-rotate]")) handleGraphRotate(event);
  });

  els.findIconBtn.addEventListener("click", focusSearch);
  els.equationIconBtn.addEventListener("click", insertSelectedEquation);
  els.equationSelect.addEventListener("change", loadSelectedEquation);
  els.symbolIconBtn.addEventListener("click", () => showSymbolMenu(els.symbolIconBtn));
  els.tableIconBtn.addEventListener("click", () => insertTable());
  els.chartIconBtn.addEventListener("click", () => insertChart());
  els.graphIconBtn.addEventListener("click", () => insertGraph());
  els.drawIconBtn.addEventListener("click", insertDrawing);
  els.linkIconBtn.addEventListener("click", insertHyperlink);
  els.dividerIconBtn.addEventListener("click", insertDivider);
  els.glossaryIconBtn.addEventListener("click", insertFullGlossary);
  els.makeCardIconBtn.addEventListener("click", makeCardFromSelection);
  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => loadBuiltInTemplate(button.dataset.template));
  });
  els.newTemplateBtn.addEventListener("click", newCustomTemplateDraft);
  els.captureTemplateBtn.addEventListener("click", captureCurrentPageAsTemplate);
  els.saveTemplateBtn.addEventListener("click", saveCustomTemplate);
  els.templateEditor.addEventListener("focus", hidePhraseMenu);
  els.templateEditor.addEventListener("click", (event) => {
    if (handleImageResize(event)) return;
    handleObjectSelectionClick(event);
    if (event.target.closest("[data-widget-action]")) handleWidgetAction(event);
  });
  document.querySelectorAll("[data-template-command]").forEach((button) => {
    button.addEventListener("click", () => withRichEditor(els.templateEditor, () => exec(button.dataset.templateCommand)));
  });
  document.querySelectorAll("[data-template-tool]").forEach((button) => {
    button.addEventListener("click", () => withRichEditor(els.templateEditor, () => handleTemplateInsert(button.dataset.templateTool, button)));
  });

  els.newPhraseBtn.addEventListener("click", newSmartPhraseDraft);
  els.deletePhraseBtn.addEventListener("click", deleteSelectedSmartPhrase);
  els.savePhraseBtn.addEventListener("click", saveSmartPhrase);

  els.citationStyleSelect.addEventListener("change", updateCitationStyle);
  els.citationCustomFormatInput.addEventListener("change", updateCitationStyle);
  els.citationAutoBtn.addEventListener("click", autoFillCitation);
  els.citationPdfBtn.addEventListener("click", () => els.citationPdfInput.click());
  els.citationPdfInput.addEventListener("change", attachCitationPdf);
  els.newCitationBtn.addEventListener("click", newCitationDraft);
  els.saveCitationBtn.addEventListener("click", saveCitation);
  els.deleteCitationBtn.addEventListener("click", deleteSelectedCitation);
  els.insertCitationBtn.addEventListener("click", insertSelectedCitation);
  els.insertBibliographyBtn.addEventListener("click", insertOrUpdateBibliography);

  els.newTagBtn.addEventListener("click", createTag);
  els.insertTagListBtn.addEventListener("click", insertTagList);
  els.applyProfileBtn.addEventListener("click", applyProfile);
  els.previewLatexBtn.addEventListener("click", previewLatex);
  els.insertLatexBtn.addEventListener("click", insertLatexFromWorkspace);
  els.saveLatexSnippetBtn.addEventListener("click", saveLatexSnippet);
  els.latexInput.addEventListener("input", debouncePreviewLatex);
  els.latexDisplayMode.addEventListener("change", previewLatex);
  els.equationSearchInput.addEventListener("input", renderLatexSnippets);
  els.templateSearchInput.addEventListener("input", renderCustomTemplates);
  els.phraseSearchInput.addEventListener("input", renderSmartPhrases);

  els.makeCardFromSelectionBtn.addEventListener("click", makeCardFromSelection);
  els.addCardBtn.addEventListener("click", addManualCard);
  els.cardEquationBtn.addEventListener("click", () => withRichEditor(focusedCardEditor || els.cardFront, insertSelectedEquation));
  els.clozeCardBtn.addEventListener("click", makeClozeFromCardSelection);
  els.swapCardBtn.addEventListener("click", swapCardFaces);
  els.clearCardBtn.addEventListener("click", clearCardDraft);
  [els.cardFront, els.cardBack].forEach((editor) => {
    editor.addEventListener("focus", () => {
      focusedCardEditor = editor;
      activeRichEditor = editor;
    });
  });
  document.querySelectorAll("[data-card-command]").forEach((button) => {
    button.addEventListener("click", () => execCardCommand(button.dataset.cardCommand));
  });
  els.reviewCard.addEventListener("click", () => {
    if (!reviewQueue.length) return;
    answerVisible = !answerVisible;
    renderReview();
  });
  document.querySelectorAll("[data-grade]").forEach((button) => {
    button.addEventListener("click", () => gradeReview(button.dataset.grade));
  });

  els.imageFileInput.addEventListener("change", insertSelectedImageFile);
  els.editor.addEventListener("paste", handleEditorPaste);
  els.templateEditor.addEventListener("paste", handleEditorPaste);
  els.phraseExpansionEditor.addEventListener("paste", handleEditorPaste);
  els.cardFront.addEventListener("paste", handleEditorPaste);
  els.cardBack.addEventListener("paste", handleEditorPaste);

  document.querySelectorAll("[data-menu-name]").forEach((button) => {
    button.addEventListener("click", (event) => showAppMenu(event.currentTarget));
  });
  document.querySelectorAll("[data-context-action]").forEach((button) => {
    button.addEventListener("click", () => runContextAction(button.dataset.contextAction));
  });
  document.querySelectorAll("[data-binder-action]").forEach((button) => {
    button.addEventListener("click", () => runBinderContextAction(button.dataset.binderAction));
  });
  bindSpellcheckBridge();
  document.addEventListener("contextmenu", showContextMenu);
  document.addEventListener("selectionchange", rememberActiveSelection);
  document.addEventListener("click", (event) => {
    if (!els.appMenu.hidden && !els.appMenu.contains(event.target) && !event.target.closest("[data-menu-name]")) hideAppMenu();
    if (!els.contextMenu.contains(event.target)) hideContextMenu();
    if (!els.binderContextMenu.contains(event.target)) hideBinderContextMenu();
    if (!els.colorMenu.contains(event.target) && !event.target.closest("#textColorBtn, #highlightColorBtn")) hideColorMenu();
    if (!els.symbolMenu.contains(event.target) && !event.target.closest("#symbolIconBtn")) hideSymbolMenu();
    if (!els.calendarRepeatDaysMenu.contains(event.target) && !event.target.closest("#calendarRepeatDaysBtn")) els.calendarRepeatDaysMenu.hidden = true;
    if (!els.phraseMenu.contains(event.target) && !els.editor.contains(event.target)) hidePhraseMenu();
    if (!event.target.closest?.(".selectable-object, .context-menu, [data-widget-action]")) clearSelectedObject();
  });

  els.dialogCloseBtn.addEventListener("click", () => closeRetroDialog(null));
  els.modalOverlay.addEventListener("click", (event) => {
    if (event.target === els.modalOverlay) closeRetroDialog(null);
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      openPrintPreview();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && selectedObject?.classList?.contains("image-figure")) {
      event.preventDefault();
      copyImageToClipboard(selectedObject.querySelector("img")?.src || "");
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && currentRichEditor()?.isContentEditable) {
      const pasted = pasteImageFromClipboard(currentRichEditor(), { silentIfEmpty: true });
      if (pasted) {
        event.preventDefault();
        return;
      }
    }
    if ((event.key === "Backspace" || event.key === "Delete") && selectedObject) {
      event.preventDefault();
      deleteSelectedObject();
      return;
    }
    if (event.key === "Escape") {
      if (!els.modalOverlay.hidden) closeRetroDialog(null);
      hideAppMenu();
      clearSelectedObject();
    }
  });

  els.refreshPrintPreviewBtn.addEventListener("click", renderPrintPreview);
  els.systemPrintBtn.addEventListener("click", printActivePage);
  els.cancelPrintPreviewBtn.addEventListener("click", closePrintPreview);
  els.closePrintPreviewBtn.addEventListener("click", closePrintPreview);
  els.printPreviewOverlay.addEventListener("click", (event) => {
    if (event.target === els.printPreviewOverlay) closePrintPreview();
  });
}

function bindRichEditors() {
  [els.editor, els.templateEditor, els.phraseExpansionEditor, els.cardFront, els.cardBack].forEach((editor) => {
    if (!editor) return;
    editor.addEventListener("focus", () => {
      activeRichEditor = editor;
      rememberSelectionForTarget(editor);
    });
    editor.addEventListener("keyup", () => {
      rememberSelectionForTarget(editor);
    });
    editor.addEventListener("input", () => {
      if (editor === els.editor) return;
      renderWidgets();
      typesetMath();
    });
    editor.addEventListener("click", (event) => {
      if (handleImageResize(event)) return;
      handleObjectSelectionClick(event);
      if (event.target.closest("[data-graph-rotate]")) handleGraphRotate(event);
      rememberSelectionForTarget(editor);
    });
    editor.addEventListener("mousemove", handleTableResizeCursor);
    editor.addEventListener("mousedown", startTableResizeIfNeeded);
  });
  activeRichEditor = els.editor;
}

function bindSpellcheckBridge() {
  window.retroNotebook?.spellcheck?.onContext?.((payload) => {
    const incomingWord = String(payload.word || "");
    if (!incomingWord && spellcheckContext.word && Date.now() - spellcheckContext.at < 600) {
      if (!els.contextMenu.hidden) renderSpellcheckMenuItems();
      return;
    }
    const keepRange = spellcheckContext.range
      && incomingWord
      && spellcheckContext.word
      && incomingWord.toLowerCase() === spellcheckContext.word.toLowerCase();
    spellcheckContext = {
      word: incomingWord || spellcheckContext.word || "",
      suggestions: Array.isArray(payload.suggestions) ? payload.suggestions.filter(Boolean).slice(0, 6) : [],
      x: Number(payload.x) || 0,
      y: Number(payload.y) || 0,
      at: Date.now(),
      range: keepRange ? spellcheckContext.range : null
    };
    if (!els.contextMenu.hidden) renderSpellcheckMenuItems();
    if (incomingWord) {
      refreshNativeSpellcheckSuggestions(incomingWord, spellcheckContext.at);
    }
  });
}

async function refreshNativeSpellcheckSuggestions(word, stamp) {
  const result = await window.retroNotebook?.spellcheck?.suggest?.(word);
  if (!result?.word || spellcheckContext.word !== word || spellcheckContext.at !== stamp) return;
  const nativeSuggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
  spellcheckContext.suggestions = unique([...spellcheckContext.suggestions, ...nativeSuggestions, ...spellingSuggestionsFor(word, nativeSuggestions)]).slice(0, 8);
  if (!els.contextMenu.hidden) renderSpellcheckMenuItems();
}

function showSpellcheckHelp() {
  openSpellcheckTool();
}

function legacyDisabledTypingCorrection(editor, event) {
  if (!editor?.isContentEditable) return;
  if (event?.inputType && !["insertText", "insertCompositionText"].includes(event.inputType)) return;
  if (event?.data && !/[\s.,;:!?)]/.test(event.data)) return;
  const selection = window.getSelection();
  if (!selection?.rangeCount || !selection.isCollapsed) return;
  const node = selection.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return;
  const parent = node.parentElement;
  if (parent?.closest("code, pre, a, .latex-chip, .citation-ref, .retro-widget")) return;
  const offset = selection.anchorOffset;
  const before = node.data.slice(0, offset);
  const match = before.match(/(^|[\s([{'"“‘])([A-Za-z]{2,})([\s.,;:!?)]?)$/);
  if (!match) return;
  const typed = match[2];
  const lower = typed.toLowerCase();
  const suggestion = spellingSuggestionsFor(lower)[0];
  const replacement = COMMON_SPELLING_FIXES[lower] || (shouldSuggestClosestSpelling(lower, suggestion) ? suggestion : "");
  if (!replacement || replacement === typed) return;
  const corrected = typed[0] === typed[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
  const start = offset - match[3].length - typed.length;
  node.data = node.data.slice(0, start) + corrected + match[3] + node.data.slice(offset);
  const nextOffset = start + corrected.length + match[3].length;
  const range = document.createRange();
  range.setStart(node, nextOffset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  rememberSelectionForTarget(editor);
  if (editor === els.editor) {
    syncEditorNow();
    scheduleAutoPagination();
  }
}

async function legacyDisabledDictionaryCorrection(editor, event) {
  if (!editor?.isContentEditable) return;
  if (event?.key && !/^(\s|[.,;:!?)]|Spacebar)$/.test(event.key) && event.key !== " ") return;
  const info = wordBeforeCaret(editor);
  if (!info?.word || info.word.length < 5 || isKnownSpelling(info.word)) return;
  const result = await window.retroNotebook?.spellcheck?.suggest?.(info.word);
  if (!result || result.correct) return;
  const suggestion = unique([...(result.suggestions || []), ...spellingSuggestionsFor(info.word, result.suggestions || [])])[0];
  if (!shouldSuggestClosestSpelling(info.word, suggestion)) return;
  try {
    info.range.deleteContents();
    const replacement = info.word[0] === info.word[0].toUpperCase() ? suggestion[0].toUpperCase() + suggestion.slice(1) : suggestion;
    const node = document.createTextNode(replacement);
    info.range.insertNode(node);
    const after = document.createRange();
    after.setStartAfter(node);
    after.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(after);
    rememberSelectionForTarget(editor);
    syncRichEditor(editor);
  } catch {
    // Keep typing uninterrupted if the selection changed while the async dictionary responded.
  }
}

function wordBeforeCaret(editor) {
  const selection = window.getSelection();
  if (!selection?.rangeCount || !selection.isCollapsed) return null;
  const node = selection.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return null;
  if (node.parentElement?.closest("code, pre, a, .latex-chip, .citation-ref, .retro-widget")) return null;
  const offset = selection.anchorOffset;
  const before = node.data.slice(0, offset);
  const match = before.match(/(^|[\s([{'"“‘])([A-Za-z']{2,})([\s.,;:!?)]?)$/);
  if (!match) return null;
  const end = offset - match[3].length;
  const start = end - match[2].length;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return { word: match[2], range };
}

function shouldSuggestClosestSpelling(word, suggestion) {
  if (!suggestion || word.length < 5 || isKnownSpelling(word)) return false;
  if (/^[A-Z]/.test(word) || /[^a-z']/i.test(word)) return false;
  return spellingDistance(word.toLowerCase(), suggestion.toLowerCase()) <= 2;
}

function isKnownSpelling(word) {
  const lower = String(word || "").toLowerCase();
  if (!lower || lower.length < 2) return true;
  if (SPELL_WORD_SET.has(lower)) return true;
  return Array.isArray(state?.customDictionary) && state.customDictionary.includes(lower);
}

function spellingSuggestionsFor(word, nativeSuggestions = []) {
  const lower = String(word || "").toLowerCase().replace(/^[^a-z']+|[^a-z']+$/gi, "");
  if (!lower || isKnownSpelling(lower)) return [];
  const dedoubled = /(.)\1$/i.test(lower) ? lower.slice(0, -1) : "";
  const direct = unique([
    COMMON_SPELLING_FIXES[lower],
    dedoubled && isKnownSpelling(dedoubled) ? dedoubled : ""
  ].filter(Boolean));
  const candidates = new Set([...direct, ...nativeSuggestions, ...SPELL_WORD_SET]);
  const scored = [...candidates]
    .map((candidate) => String(candidate || "").toLowerCase())
    .filter((candidate) => candidate && candidate !== lower && Math.abs(candidate.length - lower.length) <= 4)
    .map((candidate) => ({
      candidate,
      distance: spellingDistance(lower, candidate),
      starts: candidate[0] === lower[0] ? 0 : 1,
      lengthGap: Math.abs(candidate.length - lower.length)
    }))
    .filter((item) => item.distance <= Math.max(2, Math.floor(lower.length / 3)))
    .sort((a, b) => a.distance - b.distance || a.starts - b.starts || a.lengthGap - b.lengthGap || a.candidate.localeCompare(b.candidate))
    .map((item) => item.candidate);
  return unique([...direct, ...nativeSuggestions.map((item) => String(item || "").toLowerCase()), ...scored]).slice(0, 6);
}

function spellingDistance(source, target) {
  const a = String(source || "");
  const b = String(target || "");
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

async function openSpellcheckTool() {
  const editor = currentRichEditor();
  const issues = await collectSpellingIssues(editor);
  dialogResolve = () => {};
  els.dialogTitle.textContent = "Spelling";
  els.dialogMessage.textContent = issues.length
    ? "Select a word, choose a suggestion, then replace it or add the word to your dictionary."
    : "No likely misspellings found in the current workspace.";
  els.dialogIcon.className = "icon95 HelpBook_32x32_4";
  const dialog = els.modalOverlay.querySelector(".retro-dialog");
  dialog.classList.add("has-fields", "spellcheck-dialog");
  dialog.classList.remove("has-multiline", "has-data", "has-symbol", "page-setup-dialog");
  els.dialogFields.innerHTML = `
    <div class="spellcheck-tool">
      <div class="spellcheck-issue-list" data-spell-issues></div>
      <div class="spellcheck-suggestion-panel">
        <strong data-spell-current>${issues[0]?.word || "Ready"}</strong>
        <div class="spellcheck-suggestions" data-spell-suggestions></div>
        <div class="button-row">
          <button type="button" data-spell-tool-action="replace">Replace</button>
          <button type="button" data-spell-tool-action="replaceAll">Replace All</button>
          <button type="button" data-spell-tool-action="add">Add To Dictionary</button>
        </div>
      </div>
      <fieldset>
        <legend>Custom Dictionary</legend>
        <div class="spellcheck-dictionary" data-spell-dictionary></div>
      </fieldset>
    </div>
  `;
  els.dialogButtons.innerHTML = "";
  const close = document.createElement("button");
  close.textContent = "Close";
  close.addEventListener("click", () => closeRetroDialog(true));
  els.dialogButtons.append(close);
  let selectedWord = issues[0]?.word || "";
  let selectedSuggestion = issues[0]?.suggestions[0] || "";

  const render = () => {
    const issueList = els.dialogFields.querySelector("[data-spell-issues]");
    const current = els.dialogFields.querySelector("[data-spell-current]");
    const suggestions = els.dialogFields.querySelector("[data-spell-suggestions]");
    const dictionary = els.dialogFields.querySelector("[data-spell-dictionary]");
    issueList.innerHTML = issues.length
      ? issues.map((issue) => `<button type="button" data-spell-word="${escapeHtml(issue.word)}" class="${issue.word === selectedWord ? "active" : ""}">${escapeHtml(issue.word)}<small>${issue.count}</small></button>`).join("")
      : "<p>No likely misspellings.</p>";
    const issue = issues.find((item) => item.word === selectedWord) || issues[0];
    if (issue && !selectedWord) selectedWord = issue.word;
    if (issue && !selectedSuggestion) selectedSuggestion = issue.suggestions[0] || "";
    current.textContent = issue ? issue.word : "Ready";
    suggestions.innerHTML = issue?.suggestions.length
      ? issue.suggestions.map((suggestion) => `<button type="button" data-spell-suggestion="${escapeHtml(suggestion)}" class="${suggestion === selectedSuggestion ? "active" : ""}">${escapeHtml(suggestion)}</button>`).join("")
      : "<p>No suggestion. Edit manually or add the word if it is correct.</p>";
    dictionary.innerHTML = state.customDictionary.length
      ? state.customDictionary.map((word) => `<button type="button" data-remove-dictionary-word="${escapeHtml(word)}">${escapeHtml(word)} X</button>`).join("")
      : "<p>No custom words yet.</p>";
    issueList.querySelectorAll("[data-spell-word]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedWord = button.dataset.spellWord;
        selectedSuggestion = (issues.find((item) => item.word === selectedWord)?.suggestions || [])[0] || "";
        render();
      });
    });
    suggestions.querySelectorAll("[data-spell-suggestion]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedSuggestion = button.dataset.spellSuggestion;
        render();
      });
    });
    dictionary.querySelectorAll("[data-remove-dictionary-word]").forEach((button) => {
      button.addEventListener("click", () => {
        removeCustomDictionaryWord(button.dataset.removeDictionaryWord);
        render();
      });
    });
  };

  els.dialogFields.querySelector("[data-spell-tool-action='replace']").addEventListener("click", () => {
    if (!selectedWord || !selectedSuggestion) return;
    replaceWordInEditor(editor, selectedWord, selectedSuggestion, false);
    closeRetroDialog(true);
    openSpellcheckTool();
  });
  els.dialogFields.querySelector("[data-spell-tool-action='replaceAll']").addEventListener("click", () => {
    if (!selectedWord || !selectedSuggestion) return;
    replaceWordInEditor(editor, selectedWord, selectedSuggestion, true);
    closeRetroDialog(true);
    openSpellcheckTool();
  });
  els.dialogFields.querySelector("[data-spell-tool-action='add']").addEventListener("click", () => {
    if (!selectedWord) return;
    addCustomDictionaryWord(selectedWord);
    closeRetroDialog(true);
    openSpellcheckTool();
  });

  render();
  els.modalOverlay.hidden = false;
}

async function collectSpellingIssues(editor) {
  if (!editor) return [];
  const counts = new Map();
  textNodesForSpelling(editor).forEach((node) => {
    for (const match of node.nodeValue.matchAll(/[A-Za-z']{2,}/g)) {
      const word = match[0];
      const lower = word.toLowerCase();
      if (isKnownSpelling(lower)) continue;
      const item = counts.get(lower) || { word, lower, count: 0, suggestions: [] };
      item.count += 1;
      counts.set(lower, item);
    }
  });
  const items = [...counts.values()];
  const checked = await window.retroNotebook?.spellcheck?.checkWords?.(items.map((item) => item.word));
  const byWord = new Map((Array.isArray(checked) ? checked : []).map((result) => [String(result.word || "").toLowerCase(), result]));
  return items
    .map((item) => {
      const result = byWord.get(item.lower);
      const nativeSuggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
      return {
        ...item,
        correct: result?.correct === true || isKnownSpelling(item.lower),
        suggestions: unique([...nativeSuggestions, ...spellingSuggestionsFor(item.lower, nativeSuggestions)]).slice(0, 8)
      };
    })
    .filter((item) => !item.correct && (item.suggestions.length || item.lower.length >= 6))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 40);
}

function textNodesForSpelling(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("code, pre, a, .latex-chip, .citation-ref, .retro-widget, script, style")) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function replaceWordInEditor(editor, word, replacement, replaceAll = false) {
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
  let replaced = 0;
  textNodesForSpelling(editor).forEach((node) => {
    if (replaced && !replaceAll) return;
    node.nodeValue = node.nodeValue.replace(pattern, (match) => {
      if (replaced && !replaceAll) return match;
      replaced += 1;
      return match[0] === match[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
    });
  });
  if (replaced) {
    syncRichEditor(editor);
    setStatus(`${replaced} spelling replacement${replaced === 1 ? "" : "s"} made.`);
  }
  return replaced;
}

function addCustomDictionaryWord(word) {
  const lower = String(word || "").toLowerCase().trim();
  if (!lower) return;
  state.customDictionary = unique([...(state.customDictionary || []), lower]).sort();
  saveState();
  window.retroNotebook?.spellcheck?.addToDictionary?.(lower);
  setStatus(`"${lower}" added to custom dictionary.`);
}

function removeCustomDictionaryWord(word) {
  const lower = String(word || "").toLowerCase().trim();
  state.customDictionary = (state.customDictionary || []).filter((item) => item !== lower);
  saveState();
  setStatus(`"${lower}" removed from custom dictionary.`);
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function currentRichEditor() {
  if (activeRichEditor && document.body.contains(activeRichEditor)) return activeRichEditor;
  return els.editor;
}

function withRichEditor(editor, action) {
  const previous = activeRichEditor;
  activeRichEditor = editor || els.editor;
  activeRichEditor.focus();
  try {
    const result = action();
    if (result?.then) {
      return result.finally(() => {
        activeRichEditor = editor || previous || activeRichEditor;
      });
    }
    activeRichEditor = editor || previous || activeRichEditor;
    return result;
  } catch (error) {
    activeRichEditor = previous || activeRichEditor;
    throw error;
  }
}

function richEditorContaining(node) {
  const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  return element?.closest?.("#editor, #templateEditor, #phraseExpansionEditor, #cardFront, #cardBack") || null;
}

function rememberActiveSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const editor = richEditorContaining(selection.anchorNode);
  if (editor) {
    activeRichEditor = editor;
    rememberSelectionForTarget(editor);
  }
}

function rememberSelectionForTarget(target) {
  const selection = window.getSelection();
  if (!target || !selection.rangeCount || !target.contains(selection.anchorNode)) return null;
  const range = selection.getRangeAt(0).cloneRange();
  savedSelections.set(target, range);
  return range;
}

function captureSelectionForTarget(target) {
  const selection = window.getSelection();
  if (target && selection.rangeCount && target.contains(selection.anchorNode)) {
    return rememberSelectionForTarget(target);
  }
  const saved = target ? savedSelections.get(target) : null;
  return saved ? saved.cloneRange() : null;
}

function restoreSelectionForTarget(target, range) {
  if (!target) return;
  target.focus();
  if (!range) {
    placeCaretAtEnd(target);
    return;
  }
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  rememberSelectionForTarget(target);
}

function placeCaretAtEnd(target) {
  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  rememberSelectionForTarget(target);
}

function syncRichEditor(editor) {
  if (editor === els.editor) {
    syncEditorNow();
  } else {
    renderWidgets();
    typesetMath();
  }
}

function objectOwner(node) {
  return node?.closest?.("#editor, #templateEditor, #phraseExpansionEditor, #cardFront, #cardBack") || els.editor;
}

function selectableObjectFromTarget(target) {
  return target.closest?.(".retro-widget, .image-figure, table");
}

function handleObjectSelectionClick(event) {
  const object = selectableObjectFromTarget(event.target);
  if (!object) {
    clearSelectedObject();
    return;
  }
  if (object.tagName === "TABLE") selectedTableCell = event.target.closest("td, th") || selectedTableCell;
  selectObject(object);
}

function selectObject(object) {
  if (!object) return;
  const tableCell = object.tagName === "TABLE" ? selectedTableCell : null;
  clearSelectedObject();
  selectedObject = object;
  if (tableCell && object.contains(tableCell)) selectedTableCell = tableCell;
  selectedObject.classList.add("selectable-object", "selected-object");
  if (selectedObject.classList.contains("image-figure")) ensureImageResizeControls(selectedObject);
  if (selectedObject.tagName === "TABLE") setStatus("Table selected. Right-click a cell to insert/delete rows or columns. Drag cell borders to resize.");
}

function clearSelectedObject() {
  document.querySelectorAll(".image-resize-controls").forEach((controls) => controls.remove());
  if (selectedObject) selectedObject.classList.remove("selected-object");
  selectedObject = null;
  selectedTableCell = null;
}

async function deleteSelectedObject(object = selectedObject) {
  if (!object) return;
  const owner = objectOwner(object);
  const ok = await retroConfirm("Delete Object", `Delete this ${objectLabel(object)}?`, "warning");
  if (!ok) return;
  const next = object.nextElementSibling;
  object.remove();
  if (next?.tagName === "P" && !next.textContent.trim()) next.remove();
  clearSelectedObject();
  syncRichEditor(owner);
  setStatus(`${capitalize(objectLabel(object))} deleted.`);
}

async function editSelectedObject(object = selectedObject) {
  if (!object) {
    setStatus("Select or right-click an object first.");
    return;
  }
  if (object.classList.contains("chart-widget") || object.classList.contains("graph-widget")) {
    await editDataObject(object);
    return;
  }
  if (object.classList.contains("image-figure")) {
    selectObject(object);
    setStatus("Use the image size controls, or right-click to copy/delete.");
    return;
  }
  if (object.tagName === "TABLE") {
    selectObject(object);
    setStatus("Right-click a table cell to insert/delete rows or columns. Drag cell borders to resize.");
  }
}

function runTableAction(action, cell = selectedTableCell) {
  const table = cell?.closest?.("table");
  if (!table) {
    setStatus("Right-click inside a table cell first.");
    return;
  }
  selectedTableCell = cell;
  selectObject(table);
  const owner = objectOwner(table);
  if (action === "tableRowAbove") insertTableRow(cell, "above");
  if (action === "tableRowBelow") insertTableRow(cell, "below");
  if (action === "tableColumnLeft") insertTableColumn(cell, "left");
  if (action === "tableColumnRight") insertTableColumn(cell, "right");
  if (action === "tableDeleteRow") deleteTableRow(cell);
  if (action === "tableDeleteColumn") deleteTableColumn(cell);
  if (action === "tableToggleHeader") toggleTableHeader(table);
  if (action === "tableHeaderColor") {
    pickTableHeaderColor(table);
    return;
  }
  syncRichEditor(owner);
}

async function pickTableHeaderColor(table) {
  const current = table.dataset.headerColor || table.querySelector("th")?.style.backgroundColor || "#d9e8ff";
  const color = await openFormatColorDialog("Table Header Color", "Choose a header row fill color.", normalizeHexColor(current) || "#d9e8ff", "Header");
  if (!color) return;
  applyTableHeaderColor(table, color);
  syncRichEditor(objectOwner(table));
  setStatus("Table header color updated.");
}

function applyTableHeaderColor(table, color) {
  const safeColor = normalizeHexColor(color) || "#d9e8ff";
  table.dataset.headerColor = safeColor;
  const firstRow = table.rows[0];
  if (!firstRow) return;
  [...firstRow.cells].forEach((cell) => {
    cell.style.backgroundColor = safeColor;
  });
}

function insertTableRow(cell, position) {
  const row = cell.closest("tr");
  const table = row.closest("table");
  const referenceCells = [...row.cells];
  const newRow = document.createElement("tr");
  referenceCells.forEach((sourceCell) => {
    const clone = document.createElement(sourceCell.tagName.toLowerCase());
    clone.innerHTML = "&nbsp;";
    clone.style.width = sourceCell.style.width || "";
    clone.style.height = sourceCell.style.height || "";
    newRow.appendChild(clone);
  });
  if (position === "above") row.before(newRow);
  else row.after(newRow);
  if (position === "above" && row.rowIndex === 0) applyTableHeaderColor(table, table.dataset.headerColor || "#d9e8ff");
  selectedTableCell = newRow.cells[Math.min(cell.cellIndex, newRow.cells.length - 1)];
  setStatus(`Table row inserted ${position}.`);
  normalizeTableSections(table);
}

function insertTableColumn(cell, position) {
  const table = cell.closest("table");
  const index = cell.cellIndex + (position === "right" ? 1 : 0);
  [...table.rows].forEach((row) => {
    const reference = row.cells[Math.min(cell.cellIndex, row.cells.length - 1)];
    const newCell = document.createElement(reference?.tagName?.toLowerCase() || "td");
    newCell.innerHTML = "&nbsp;";
    newCell.style.width = reference?.style.width || "";
    if (newCell.tagName === "TH") newCell.style.backgroundColor = table.dataset.headerColor || "#d9e8ff";
    if (index >= row.cells.length) row.appendChild(newCell);
    else row.insertBefore(newCell, row.cells[index]);
  });
  selectedTableCell = table.rows[cell.parentElement.rowIndex]?.cells[index] || cell;
  setStatus(`Table column inserted ${position}.`);
}

function deleteTableRow(cell) {
  const table = cell.closest("table");
  if (table.rows.length <= 1) {
    setStatus("A table needs at least one row.");
    return;
  }
  const row = cell.closest("tr");
  const nextRow = row.nextElementSibling || row.previousElementSibling;
  row.remove();
  selectedTableCell = nextRow?.cells[Math.min(cell.cellIndex, nextRow.cells.length - 1)] || table.rows[0]?.cells[0] || null;
  setStatus("Table row deleted.");
}

function deleteTableColumn(cell) {
  const table = cell.closest("table");
  const index = cell.cellIndex;
  const maxCells = Math.max(...[...table.rows].map((row) => row.cells.length));
  if (maxCells <= 1) {
    setStatus("A table needs at least one column.");
    return;
  }
  [...table.rows].forEach((row) => row.cells[index]?.remove());
  selectedTableCell = table.rows[Math.min(cell.parentElement.rowIndex, table.rows.length - 1)]?.cells[Math.max(0, index - 1)] || null;
  setStatus("Table column deleted.");
}

function toggleTableHeader(table) {
  const firstRow = table.rows[0];
  if (!firstRow) return;
  const hasHeader = [...firstRow.cells].every((cell) => cell.tagName === "TH");
  [...firstRow.cells].forEach((cell) => {
    const replacement = document.createElement(hasHeader ? "td" : "th");
    replacement.innerHTML = cell.innerHTML || "&nbsp;";
    replacement.style.cssText = cell.style.cssText;
    if (!hasHeader) replacement.style.backgroundColor = table.dataset.headerColor || "#d9e8ff";
    cell.replaceWith(replacement);
  });
  setStatus(hasHeader ? "Header row converted to body cells." : "Header row enabled.");
}

function normalizeTableSections(table) {
  if (!table.tBodies.length) {
    const body = document.createElement("tbody");
    [...table.rows].forEach((row) => body.appendChild(row));
    table.appendChild(body);
  }
}

function tableResizeHit(cell, event) {
  const rect = cell.getBoundingClientRect();
  const nearRight = rect.right - event.clientX <= 5;
  const nearBottom = rect.bottom - event.clientY <= 5;
  if (nearRight && rect.width > 12) return "column";
  if (nearBottom && rect.height > 12) return "row";
  return "";
}

function handleTableResizeCursor(event) {
  const cell = event.target.closest?.("td, th");
  const editor = event.currentTarget;
  if (!cell || !editor.contains(cell)) {
    editor.style.cursor = "";
    return;
  }
  const hit = tableResizeHit(cell, event);
  editor.style.cursor = hit === "column" ? "col-resize" : hit === "row" ? "row-resize" : "";
}

function startTableResizeIfNeeded(event) {
  const cell = event.target.closest?.("td, th");
  if (!cell || event.button !== 0) return;
  const mode = tableResizeHit(cell, event);
  if (!mode) return;
  event.preventDefault();
  event.stopPropagation();
  const table = cell.closest("table");
  const owner = objectOwner(table);
  const start = {
    x: event.clientX,
    y: event.clientY,
    width: cell.getBoundingClientRect().width,
    height: cell.getBoundingClientRect().height,
    index: cell.cellIndex,
    row: cell.closest("tr")
  };
  const move = (moveEvent) => {
    if (mode === "column") {
      const width = Math.max(34, start.width + moveEvent.clientX - start.x);
      [...table.rows].forEach((row) => {
        if (row.cells[start.index]) {
          row.cells[start.index].style.width = `${Math.round(width)}px`;
          row.cells[start.index].style.minWidth = `${Math.round(width)}px`;
          row.cells[start.index].style.whiteSpace = "normal";
        }
      });
    } else {
      const height = Math.max(22, start.height + moveEvent.clientY - start.y);
      [...start.row.cells].forEach((rowCell) => {
        rowCell.style.height = "";
        rowCell.style.minHeight = `${Math.round(height)}px`;
        rowCell.style.paddingTop = `${Math.max(4, Math.round((height - 16) / 2))}px`;
        rowCell.style.paddingBottom = `${Math.max(4, Math.round((height - 16) / 2))}px`;
      });
    }
  };
  const end = () => {
    document.removeEventListener("mousemove", move, true);
    document.removeEventListener("mouseup", end, true);
    document.body.classList.remove("resizing-table", "resizing-table-row");
    selectedTableCell = cell;
    selectObject(table);
    syncRichEditor(owner);
    setStatus(mode === "column" ? "Table column resized." : "Table row resized.");
  };
  document.body.classList.add(mode === "row" ? "resizing-table-row" : "resizing-table");
  document.addEventListener("mousemove", move, true);
  document.addEventListener("mouseup", end, true);
}

function ensureImageResizeControls(figure) {
  if (!figure || figure.querySelector(".image-resize-controls")) return;
  const controls = document.createElement("span");
  controls.className = "image-resize-controls";
  controls.contentEditable = "false";
  controls.innerHTML = `
    <button type="button" data-image-size="25">25%</button>
    <button type="button" data-image-size="50">50%</button>
    <button type="button" data-image-size="75">75%</button>
    <button type="button" data-image-size="100">Fit</button>
    <button type="button" data-image-nudge="-10">-</button>
    <button type="button" data-image-nudge="10">+</button>
    <span class="image-resize-handle" data-image-drag-size title="Drag to resize"></span>
  `;
  figure.appendChild(controls);
  controls.querySelector("[data-image-drag-size]")?.addEventListener("pointerdown", startImageResizeDrag);
}

function handleImageResize(event) {
  const button = event.target.closest("[data-image-size], [data-image-nudge]");
  if (!button) return false;
  event.preventDefault();
  event.stopPropagation();
  const figure = button.closest(".image-figure");
  if (!figure) return true;
  const current = Number.parseFloat(figure.dataset.width || figure.style.width) || 100;
  const next = button.dataset.imageSize
    ? Number(button.dataset.imageSize)
    : clamp(current + Number(button.dataset.imageNudge || 0), 15, 100);
  setImageFigureWidth(figure, next);
  selectObject(figure);
  syncRichEditor(objectOwner(figure));
  setStatus(`Image width set to ${next}%.`);
  return true;
}

function setImageFigureWidth(figure, width) {
  const next = clamp(Number(width) || 100, 15, 100);
  figure.dataset.width = String(next);
  figure.style.width = `${next}%`;
}

function startImageResizeDrag(event) {
  const figure = event.target.closest(".image-figure");
  if (!figure) return;
  event.preventDefault();
  event.stopPropagation();
  const parentWidth = figure.parentElement?.clientWidth || figure.closest(".editor-page, .template-editor, .card-editor")?.clientWidth || 1;
  const start = {
    x: event.clientX,
    width: Number.parseFloat(figure.dataset.width || figure.style.width) || 100
  };
  const move = (moveEvent) => {
    moveEvent.preventDefault();
    const deltaPercent = ((moveEvent.clientX - start.x) / parentWidth) * 100;
    setImageFigureWidth(figure, start.width + deltaPercent);
  };
  const end = () => {
    document.removeEventListener("pointermove", move, true);
    document.removeEventListener("pointerup", end, true);
    document.removeEventListener("pointercancel", end, true);
    selectObject(figure);
    syncRichEditor(objectOwner(figure));
    setStatus(`Image width set to ${Math.round(Number.parseFloat(figure.dataset.width || "100"))}%.`);
  };
  document.addEventListener("pointermove", move, true);
  document.addEventListener("pointerup", end, true);
  document.addEventListener("pointercancel", end, true);
}

function objectLabel(object) {
  if (object?.classList?.contains("chart-widget")) return "chart";
  if (object?.classList?.contains("graph-widget")) return "graph";
  if (object?.classList?.contains("draw-widget")) return "drawing";
  if (object?.classList?.contains("image-figure")) return "image";
  if (object?.tagName === "TABLE") return "table";
  return "object";
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function bindToolResizer() {
  const saved = Number(localStorage.getItem("retro-notebook-tools-width"));
  setToolWidth(saved || Math.min(680, Math.max(540, Math.round(window.innerWidth * 0.32))));
  let start = null;
  els.toolResizeHandle.addEventListener("pointerdown", (event) => {
    start = { x: event.clientX, width: toolWidth() };
    els.toolResizeHandle.setPointerCapture(event.pointerId);
    document.body.classList.add("resizing-tools");
  });
  els.toolResizeHandle.addEventListener("pointermove", (event) => {
    if (!start) return;
    setToolWidth(start.width - (event.clientX - start.x));
  });
  els.toolResizeHandle.addEventListener("pointerup", () => {
    if (!start) return;
    localStorage.setItem("retro-notebook-tools-width", String(toolWidth()));
    start = null;
    document.body.classList.remove("resizing-tools");
    renderWidgets();
  });
  els.toolResizeHandle.addEventListener("dblclick", () => {
    localStorage.removeItem("retro-notebook-tools-width");
    setToolWidth(Math.min(680, Math.max(540, Math.round(window.innerWidth * 0.32))));
    renderWidgets();
  });
}

function toolWidth() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--tools-width");
  return Number.parseInt(raw, 10) || 560;
}

function setToolWidth(width) {
  const max = Math.max(360, window.innerWidth - 760);
  const next = clamp(width, 360, Math.min(860, max));
  document.documentElement.style.setProperty("--tools-width", `${next}px`);
}

function loadState() {
  let fromLegacy = false;
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    raw = LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    fromLegacy = Boolean(raw);
  }
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.pages) && parsed.pages.length) {
        const normalized = normalizeState(parsed, { fromLegacy });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return normalizeState(seedState());
}

function normalizeState(nextState, options = {}) {
  if (options.fromLegacy) stripLegacyDemoData(nextState);
  const pageNotebooks = (nextState.pages || []).map((page) => page.notebook).filter(Boolean);
  const storedNotebooks = (nextState.notebooks || []).map((notebook) => (typeof notebook === "string" ? notebook : notebook?.name)).filter(Boolean);
  nextState.notebooks = unique([...storedNotebooks, ...pageNotebooks]);
  if (!nextState.notebooks.length) nextState.notebooks = ["Tutorial"];
  nextState.notebookColors = normalizeNotebookColors(nextState.notebookColors, nextState.notebooks);
  nextState.folders = Array.isArray(nextState.folders) ? nextState.folders : [];
  nextState.folders = nextState.folders.map((folder) => ({ ...folder, favorite: Boolean(folder.favorite) }));

  nextState.notebooks.forEach((notebook) => {
    if (!nextState.folders.some((folder) => folder.notebook === notebook)) {
      nextState.folders.push({ id: uid(), notebook, name: "General", collapsed: false, favorite: false });
    }
  });

  nextState.pages = nextState.pages.map((page) => {
    const notebook = page.notebook || nextState.notebooks[0] || "Tutorial";
    const fallbackFolder = nextState.folders.find((folder) => folder.notebook === notebook);
    return {
      ...page,
      notebook,
      folderId: page.folderId || fallbackFolder?.id,
      tags: Array.isArray(page.tags) ? page.tags : [],
      documentType: page.documentType || page["spe" + "cies"] || "lecture",
      goal: page.goal || "",
      paperSize: paperSizeKey(page.paperSize),
      pageSetup: normalizePageSetup(page.pageSetup),
      favorite: Boolean(page.favorite),
      content: stripStoredPageBreaks(page.content || ""),
      plain: page.plain || "",
      cards: Array.isArray(page.cards)
        ? page.cards.map((card) => ({
            ...card,
            front: card.front || textFromHtml(card.frontHtml || ""),
            back: card.back || textFromHtml(card.backHtml || ""),
            frontHtml: card.frontHtml || escapeHtml(card.front || ""),
            backHtml: card.backHtml || escapeHtml(card.back || "")
          }))
        : []
    };
  });
  nextState.pdfs = Array.isArray(nextState.pdfs)
    ? nextState.pdfs.map(normalizeBinderPdf).map((pdf) => {
        const folder = nextState.folders.find((candidate) => candidate.id === pdf.folderId)
          || nextState.folders.find((candidate) => candidate.notebook === pdf.notebook)
          || nextState.folders[0];
        return { ...pdf, notebook: folder?.notebook || pdf.notebook, folderId: folder?.id || pdf.folderId };
      }).filter((pdf) => pdf.name && pdf.folderId)
    : [];
  if (!nextState.pages.length) return normalizeState(seedState());
  if (!nextState.pages.some((page) => page.id === nextState.activeId)) nextState.activeId = nextState.pages[0].id;
  if (!nextState.pdfs.some((pdf) => pdf.id === nextState.activePdfId)) nextState.activePdfId = "";

  nextState.latexSnippets = Array.isArray(nextState.latexSnippets)
    ? nextState.latexSnippets.map((snippet, index) =>
        normalizeEquationSnippet(snippet, index)
      )
    : [
        { id: uid(), name: "Mass-energy equivalence", latex: "E = mc^2" },
        { id: uid(), name: "Arithmetic series", latex: "\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}" },
        { id: uid(), name: "Definite integral", latex: "\\int_a^b f(x)\\,dx" }
      ];
  nextState.customTemplates = Array.isArray(nextState.customTemplates)
    ? nextState.customTemplates.map(normalizeTemplate).filter((template) => template.name && template.content)
    : defaultCustomTemplates();
  nextState.smartPhrases = Array.isArray(nextState.smartPhrases)
    ? nextState.smartPhrases.map(normalizeSmartPhrase).filter((phrase) => phrase.trigger && phrase.expansion)
    : defaultSmartPhrases();
  nextState.tags = Array.isArray(nextState.tags)
    ? normalizeTags(nextState.tags, nextState.pages)
    : normalizeTags([], nextState.pages);
  nextState.glossaryTerms = Array.isArray(nextState.glossaryTerms)
    ? nextState.glossaryTerms.map(normalizeGlossaryTerm).filter((term) => term.term && term.definition)
    : defaultGlossaryTerms();
  nextState.customDictionary = Array.isArray(nextState.customDictionary)
    ? unique(nextState.customDictionary.map((word) => String(word || "").toLowerCase().trim()).filter(Boolean)).sort()
    : [];
  nextState.citationStyle = CITATION_STYLES.includes(nextState.citationStyle) ? nextState.citationStyle : "apa";
  nextState.citationCustomFormat = nextState.citationCustomFormat || "{authors}. {title}. {journal}. {year}. {doi} {url}";
  nextState.citations = Array.isArray(nextState.citations)
    ? nextState.citations.map(normalizeCitation).filter((citation) => citation.title || citation.authors || citation.url || citation.doi || citation.pdfName || citation.pdfBlobId)
    : [];
  nextState.calendarEvents = Array.isArray(nextState.calendarEvents)
    ? nextState.calendarEvents.map(normalizeCalendarEvent).filter((event) => event.title && event.date)
    : [];
  nextState.activeNotebook = nextState.notebooks.includes(nextState.activeNotebook)
    ? nextState.activeNotebook
    : nextState.pages.find((page) => page.id === nextState.activeId)?.notebook || nextState.notebooks[0];
  upgradeTutorialDemo(nextState);
  return nextState;
}

function upgradeTutorialDemo(nextState) {
  const tutorial = nextState.pages.find((page) => page.title === "Start Here - Retro Notebook Tutorial");
  if (!tutorial) return;
  let citation = nextState.citations.find((item) => item.title === "Retrieval Practice Produces Memory Benefits");
  if (!citation) {
    citation = normalizeCitation({
      id: uid(),
      title: "Retrieval Practice Produces Memory Benefits",
      authors: "Roediger HL; Karpicke JD",
      year: "2006",
      journal: "Psychological Science",
      doi: "10.1111/j.1467-9280.2006.01693.x",
      url: "https://doi.org/10.1111/j.1467-9280.2006.01693.x",
      notes: "Demo reference for the citation manager."
    });
    nextState.citations.push(citation);
  }
  if (!tutorial.content.includes("Citation Manager")) {
    tutorial.content += `<h2>Citation Manager</h2><p>Numeric citation styles insert linked superscripts. The first mention controls bibliography order<span class="citation-ref numeric" contenteditable="false" data-citation-id="${citation.id}"><a href="#${referenceDomId(citation.id)}">1</a></span>.</p><section class="citation-bibliography"><h1>Citations</h1><ol><li id="${referenceDomId(citation.id)}">${escapeHtml(formatCitation(citation, "vancouver", false))}</li></ol></section>`;
  }
  if (!tutorial.content.includes("Print Preview")) {
    tutorial.content += "<h2>Print Preview</h2><p>Use the print button to preview the selected page with automatic page flow, headers, footers, and page numbers.</p>";
  }
  if (!tutorial.content.includes("target=\"_blank\"")) {
    tutorial.content += '<h2>Hyperlink</h2><p><a href="https://github.com/DanielAU11/RetroNotebook" target="_blank" rel="noopener noreferrer">Open the RetroNotebook repository</a>.</p>';
  }
  tutorial.content = tutorial.content.replace(/Spelling And Autocorrect/g, "Spelling");
  if (!tutorial.content.includes("<h2>Spelling</h2>")) {
    tutorial.content += "<h2>Spelling</h2><p>Use the spelling toolbar button to scan the current page, replace one word or all matches, and manage the custom dictionary. Right-click underlined words for the same suggestions in the context menu.</p>";
  }
  if (!tutorial.content.includes("Symbols And Formatting")) {
    tutorial.content += "<h2>Symbols And Formatting</h2><p>The omega button opens a searchable Word-style symbol picker. Text color, highlight color, line spacing, superscript, subscript, headers, footers, and page numbers live in the toolbar and page setup window.</p>";
  }
  if (!tutorial.content.includes("Tables, Images, And PDFs")) {
    tutorial.content += "<h2>Tables, Images, And PDFs</h2><p>Insert tables with Fixed, AutoFit to contents, or AutoFit to page behavior. Right-click cells to add or delete rows and columns, drag borders to resize, paste images into rich editors, and add PDFs to binder folders for preview.</p>";
  }
  if (!tutorial.content.includes("Calendar And Study Tools")) {
    tutorial.content += "<h2>Calendar And Study Tools</h2><p>The Calendar tab supports week and month views, reminders, time ranges, repeat rules, repeat days, and end dates. Flashcards can be reviewed by notebook and page with spaced-repetition grading.</p>";
  }
  if (!tutorial.content.includes("3D Graph Controls")) {
    tutorial.content += "<h2>3D Graph Controls</h2><p>3D graphs can be dragged with the hand cursor, nudged with arrow buttons, zoomed with plus and minus, and recentered with Fit. The Edit button changes variables, colors, labels, axis titles, and data values.</p>";
  }
}

function seedState() {
  const now = Date.now();
  const tutorialFolder = uid();
  const firstId = uid();
  const tutorialCitationId = uid();
  const tutorialChart = {
    title: "Retention Workflow",
    variables: [
      { key: "x", name: "Recall" },
      { key: "y", name: "Confidence" }
    ],
    rows: [
      { label: "Notes", x: 4, y: 3 },
      { label: "Cards", x: 7, y: 6 },
      { label: "Review", x: 9, y: 8 }
    ]
  };
  const tutorialGraph = {
    title: "3D Learning Model",
    variables: [
      { key: "x", name: "Practice" },
      { key: "y", name: "Recall" },
      { key: "z", name: "Confidence" }
    ],
    rows: [
      { label: "Day 1", x: 1, y: 2, z: 1 },
      { label: "Day 3", x: 3, y: 5, z: 4 },
      { label: "Day 7", x: 6, y: 8, z: 7 }
    ]
  };
  return {
    activeId: firstId,
    activeNotebook: "Tutorial",
    notebooks: ["Tutorial"],
    notebookColors: { Tutorial: "#2566a8" },
    folders: [{ id: tutorialFolder, notebook: "Tutorial", name: "Start Here", collapsed: false }],
    pdfs: [],
    customTemplates: defaultCustomTemplates(),
    smartPhrases: defaultSmartPhrases(),
    tags: [
      { id: uid(), name: "tutorial", color: "#fff7a8" },
      { id: uid(), name: "features", color: "#cce8ff" },
      { id: uid(), name: "win98", color: "#d9f2d0" }
    ],
    customDictionary: [],
    glossaryTerms: defaultGlossaryTerms(),
    citationStyle: "vancouver",
    citationCustomFormat: "{authors}. {title}. {journal}. {year}. {doi} {url}",
    calendarEvents: [
      {
        id: uid(),
        title: "Review tutorial flashcard",
        date: dateKey(now),
        time: "09:00",
        endTime: "09:25",
        type: "study",
        repeat: "none",
        color: "#2566a8",
        notes: "Open the Review tab and grade the starter card.",
        done: false,
        createdAt: now,
        updatedAt: now
      }
    ],
    citations: [
      {
        id: tutorialCitationId,
        title: "Retrieval Practice Produces Memory Benefits",
        authors: "Roediger HL; Karpicke JD",
        year: "2006",
        journal: "Psychological Science",
        doi: "10.1111/j.1467-9280.2006.01693.x",
        url: "https://doi.org/10.1111/j.1467-9280.2006.01693.x",
        notes: "Demo reference for the citation manager.",
        pdfName: "",
        pdfDataUrl: "",
        pdfBlobId: ""
      }
    ],
    latexSnippets: [
      { id: uid(), name: "Mass-energy equivalence", latex: "E = mc^2" },
      { id: uid(), name: "Derivative power rule", latex: "\\frac{d}{dx}x^2 = 2x" },
      { id: uid(), name: "Arithmetic series", latex: "\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}" }
    ],
    pages: [
      {
        id: firstId,
        title: "Start Here - Retro Notebook Tutorial",
        notebook: "Tutorial",
        folderId: tutorialFolder,
        tags: ["tutorial", "features", "win98"],
        createdAt: now,
        updatedAt: now,
        documentType: "lecture",
        goal: "Learn the notebook workspace in one tour.",
        paperSize: "letter",
        pageSetup: { ...DEFAULT_PAGE_SETUP, header: "Retro Notebook Tutorial", footer: "Local-first study workspace", pageNumberPosition: "bottom-right" },
        content:
          `<h1>Retro Notebook Tutorial</h1><p>This single notebook is the starter tour. Create colored notebooks from the binder, write rich pages, save equations, insert tables, build editable charts and graphs, capture templates, create flashcards, add hyperlinks, and type /summary or /card to try smartphrases.</p><h2>Equation</h2><p>Saved equations can be named in the LaTeX tab and inserted from the sigma toolbar dropdown: \\[\\frac{d}{dx}x^2 = 2x\\]</p><h2>Tags, Glossary, And Links</h2><p>Use the tag field to type tags separated by commas, insert glossary headings with Heading 3, and add a link like <a href="https://github.com/DanielAU11/RetroNotebook" target="_blank" rel="noopener noreferrer">RetroNotebook on GitHub</a>.</p><h2>Symbols And Formatting</h2><p>The omega button opens a searchable symbol picker. The toolbar also supports custom text color, highlight color, line spacing, superscript, subscript, headers, footers, and page numbers.</p><h2>Spelling</h2><p>Use the spelling toolbar button to scan the current page, replace one word or all matches, and manage the custom dictionary. Right-click underlined words for suggestions.</p><h2>Citation Manager</h2><p>Numeric citation styles insert linked superscripts. This demo source jumps to the matching bibliography entry below<span class="citation-ref numeric" contenteditable="false" data-citation-id="${tutorialCitationId}"><a href="#ref-${tutorialCitationId}">1</a></span>.</p><h2>Editable Table</h2><table><tbody><tr><th>Feature</th><th>Where</th></tr><tr><td>AutoFit table behavior</td><td>Insert Table dialog</td></tr><tr><td>SmartPhrase</td><td>Type / in the page</td></tr></tbody></table><p>Right-click cells to add or delete rows and columns, drag borders to resize, and choose table header color during creation.</p><h2>Editable Chart</h2><div class="retro-widget chart-widget" contenteditable="false" data-chart="${encodeDataSet(tutorialChart)}"><div class="widget-title"><span class="widget-name">Retention Workflow</span></div><canvas class="chart-canvas"></canvas></div><h2>Editable 3D Graph</h2><p>Drag the canvas, use arrow buttons to rotate, plus and minus to zoom, and Fit to recenter. Edit changes variables, colors, labels, axis titles, and data values.</p><div class="retro-widget graph-widget" contenteditable="false" data-graph="${encodeDataSet(tutorialGraph)}"><div class="widget-title"><span class="widget-name">3D Learning Model</span></div><canvas class="graph-canvas"></canvas></div><h2>Tables, Images, And PDFs</h2><p>Paste images into rich editors, resize inserted images, and add PDFs to binder folders for preview.</p><h2>Calendar And Study Tools</h2><p>The Calendar tab supports week and month views, reminders, time ranges, repeat rules, repeat days, and end dates. Flashcards can be reviewed by notebook and page with spaced-repetition grading.</p><h2>Study Loop</h2><ul><li>Select text and create flashcards.</li><li>Review cards with Again, Hard, Good, and Easy.</li><li>Save reusable page layouts in Templates.</li><li>Use Print Preview to see automatic page flow, headers, footers, and page numbers.</li></ul><section class="citation-bibliography"><h1>Citations</h1><ol><li id="ref-${tutorialCitationId}">Roediger HL; Karpicke JD. Retrieval Practice Produces Memory Benefits. Psychological Science. 2006. doi:10.1111/j.1467-9280.2006.01693.x</li></ol></section>`,
        plain: "Retro Notebook Tutorial. Create colored notebooks, rich pages, equations, charts, 3D graphs, templates, citations, hyperlinks, flashcards, and smartphrases.",
        cards: [
          makeCard(
            "What opens the SmartPhrase menu?",
            "Typing a forward slash in the writing page, such as /summary.",
            now - 1000,
            firstId
          )
        ]
      }
    ]
  };
}

function saveState() {
  state.activeId = activeId;
  state.activePdfId = activePdfId || "";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState();
    renderDueCards();
    setStatus("Autosaved " + new Date().toLocaleTimeString());
  }, 250);
}

function renderAll(loadEditor = false) {
  renderChrome();
  renderNotebookOptions();
  renderBinder();
  renderTags();
  if (activePdfId) renderPdfWorkspace();
  else if (loadEditor) loadActivePageIntoEditor();
  renderDashboard();
  renderCalendar();
  renderStats();
  renderPageCards();
  renderDueCards();
  renderLatexSnippets();
  renderEquationSelect();
  renderCustomTemplates();
  renderSmartPhrases();
  renderCitationManager();
  buildReviewQueue();
  renderReview();
  previewLatex();
  scheduleAutoPagination();
  highlightFindTerm(els.searchInput.value);
}

function renderChrome() {
  const pdf = activePdf();
  if (pdf) {
    els.editorWindowTitle.textContent = "PDF";
    return;
  }
  els.editorWindowTitle.textContent = "Page";
}

function renderNotebookOptions() {
  const current = state.activeNotebook || activePage()?.notebook || state.notebooks[0];
  els.notebookSelect.innerHTML = "";
  state.notebooks.forEach((notebook) => {
    const option = document.createElement("option");
    option.value = notebook;
    option.textContent = notebook;
    els.notebookSelect.appendChild(option);
  });
  els.notebookSelect.value = current;
  els.notebookColorPreview.style.backgroundColor = notebookColor(current);
  renderReviewFilters();
}

function renderBinder() {
  const currentNotebook = activeNotebookName();
  const query = els.searchInput.value.trim().toLowerCase();
  const folders = state.folders.filter((folder) => folder.notebook === currentNotebook);
  els.pageList.innerHTML = "";

  folders.forEach((folder) => {
    const folderItem = document.createElement("li");
    folderItem.className = "binder-folder";
    const pages = state.pages
      .filter((page) => page.folderId === folder.id)
      .filter((page) => {
        const haystack = [page.title, page.tags.join(" "), page.plain].join(" ").toLowerCase();
        return !query || haystack.includes(query);
      });
    const pdfs = state.pdfs
      .filter((pdf) => pdf.folderId === folder.id)
      .filter((pdf) => {
        const haystack = [pdf.name, pdf.highlights.map((highlight) => `${highlight.text} ${highlight.note}`).join(" ")].join(" ").toLowerCase();
        return !query || haystack.includes(query);
      });

    const title = document.createElement("div");
    title.className = "binder-folder-title";
    title.innerHTML = `<span class="icon95 ${folder.collapsed ? "Folder_16x16_4" : "FolderOpen_16x16_4"}"></span><span class="favorite-slot">${folder.favorite ? "<span class=\"icon95 Star_16x16_4\"></span>" : ""}</span><span>${escapeHtml(folder.name)}</span><small>${pages.length + pdfs.length}</small>`;
    title.addEventListener("click", () => {
      selectedFolderId = folder.id;
      folder.collapsed = !folder.collapsed;
      saveState();
      renderBinder();
    });
    title.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      renameFolderById(folder.id);
    });
    title.addEventListener("contextmenu", (event) => showBinderContextMenu(event, "folder", folder.id));
    folderItem.appendChild(title);

    if (!folder.collapsed) {
      const list = document.createElement("ul");
      list.className = "binder-pages";
      pages.forEach((page) => list.appendChild(renderPageItem(page)));
      pdfs.forEach((pdf) => list.appendChild(renderPdfItem(pdf)));
      folderItem.appendChild(list);
    }
    els.pageList.appendChild(folderItem);
  });
  renderSearchResults();
}

function renderPageItem(page) {
  const item = document.createElement("li");
  item.className = "page-item" + (!activePdfId && page.id === activeId ? " active" : "");
  item.title = page.goal || "Open page";
  item.innerHTML = `
    <span class="icon95 FileText_16x16_4"></span>
    <span class="favorite-slot">${page.favorite ? "<span class=\"icon95 Star_16x16_4\"></span>" : ""}</span>
    <span>
      <span class="page-title">${escapeHtml(page.title)}</span>
      <span class="page-subtitle">${page.cards.length} cards - ${escapeHtml(page.tags.join(", "))}</span>
    </span>
  `;
  item.addEventListener("click", () => {
    selectedFolderId = page.folderId;
    selectPage(page.id);
    switchMainTab("write");
  });
  item.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    renamePageById(page.id);
  });
  item.addEventListener("contextmenu", (event) => showBinderContextMenu(event, "page", page.id));
  return item;
}

function renderPdfItem(pdf) {
  const item = document.createElement("li");
  item.className = "page-item pdf-item" + (pdf.id === activePdfId ? " active" : "");
  item.title = "Open PDF";
  item.innerHTML = `
    <span class="icon95 FileText_16x16_4"></span>
    <span class="favorite-slot">${pdf.favorite ? "<span class=\"icon95 Star_16x16_4\"></span>" : ""}</span>
    <span>
      <span class="page-title">${escapeHtml(pdf.name)}</span>
      <span class="page-subtitle">${pdf.highlights.length} highlights - PDF</span>
    </span>
  `;
  item.addEventListener("click", () => selectPdf(pdf.id));
  item.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    renamePdfById(pdf.id);
  });
  item.addEventListener("contextmenu", (event) => showBinderContextMenu(event, "pdf", pdf.id));
  return item;
}

function renderTags() {
  els.tagLibrary.innerHTML = "";
  if (!state.tags.length) {
    els.tagLibrary.innerHTML = "<p class=\"fine-print\">No tags yet.</p>";
    return;
  }
  const page = activePage();
  state.tags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag-chip" + (page.tags.includes(tag.name) ? " active" : "");
    chip.style.setProperty("--tag-color", tag.color);
    chip.innerHTML = `<span>${escapeHtml(tag.name)}</span><span data-delete-tag="${escapeHtml(tag.name)}">x</span>`;
    chip.title = "Click to add/remove this tag. Click x to delete it.";
    chip.addEventListener("click", (event) => {
      const deleteTarget = event.target.closest("[data-delete-tag]");
      if (deleteTarget) {
        event.stopPropagation();
        deleteTag(deleteTarget.dataset.deleteTag);
        return;
      }
      togglePageTag(tag.name);
    });
    els.tagLibrary.appendChild(chip);
  });
}

async function renderPdfWorkspace() {
  const pdf = activePdf();
  const pdfMode = Boolean(pdf);
  els.pageTitleInput.parentElement.hidden = pdfMode;
  els.editor.hidden = pdfMode;
  els.pdfWorkspace.hidden = !pdfMode;
  if (!pdf) return;
  els.editorWindowTitle.textContent = "PDF";
  els.pdfTitle.textContent = pdf.name;
  els.binderPdfEmpty.textContent = `Loading "${pdf.name}"...`;
  els.binderPdfPreview.src = "about:blank";
  const blob = await getPdfBlob(pdf.pdfBlobId);
  if (activePdfId !== pdf.id) return;
  if (!blob) {
    els.binderPdfEmpty.textContent = `PDF file missing for "${pdf.name}". Add it again from the binder.`;
    els.binderPdfPreview.parentElement.classList.remove("has-pdf");
  } else {
    if (pdfObjectUrls.has(pdf.pdfBlobId)) URL.revokeObjectURL(pdfObjectUrls.get(pdf.pdfBlobId));
    const objectUrl = URL.createObjectURL(blob);
    pdfObjectUrls.set(pdf.pdfBlobId, objectUrl);
    els.binderPdfPreview.src = objectUrl;
    els.binderPdfPreview.parentElement.classList.add("has-pdf");
  }
  renderPdfHighlights(pdf);
}

function showEditorWorkspace() {
  els.pageTitleInput.parentElement.hidden = false;
  els.editor.hidden = false;
  els.pdfWorkspace.hidden = true;
}

function renderPdfHighlights(pdf = activePdf()) {
  if (!pdf) return;
  els.pdfHighlightList.innerHTML = "";
  if (!pdf.highlights.length) {
    els.pdfHighlightList.innerHTML = "<p class=\"fine-print\">No PDF highlights yet.</p>";
    return;
  }
  pdf.highlights
    .slice()
    .sort((a, b) => (a.page || 1) - (b.page || 1) || a.createdAt - b.createdAt)
    .forEach((highlight) => {
      const row = document.createElement("div");
      row.className = "pdf-highlight-row";
      row.dataset.highlightRow = highlight.id;
      row.style.setProperty("--highlight-color", highlight.color || "#fff36b");
      row.innerHTML = `
        <strong>Page ${highlight.page || 1}: ${escapeHtml(highlight.text || "Highlight")}</strong>
        <small>${escapeHtml(highlight.note || "No note")}</small>
        <button data-delete-pdf-highlight="${highlight.id}">Delete</button>
      `;
      row.querySelector("[data-delete-pdf-highlight]").addEventListener("click", () => deletePdfHighlight(highlight.id));
      els.pdfHighlightList.appendChild(row);
    });
}

function addPdfHighlight() {
  const pdf = activePdf();
  if (!pdf) return;
  const text = els.pdfHighlightTextInput.value.trim();
  const note = els.pdfHighlightNoteInput.value.trim();
  if (!text && !note) {
    setStatus("Add highlighted text or a note first.");
    return;
  }
  pdf.highlights.push({
    id: uid(),
    page: Math.max(1, Number(els.pdfHighlightPageInput.value) || 1),
    color: normalizeHexColor(els.pdfHighlightColorInput.value) || "#fff36b",
    text,
    note,
    createdAt: Date.now()
  });
  pdf.updatedAt = Date.now();
  els.pdfHighlightTextInput.value = "";
  els.pdfHighlightNoteInput.value = "";
  saveState();
  renderPdfHighlights(pdf);
  renderBinder();
  setStatus("PDF highlight saved.");
}

function deletePdfHighlight(id) {
  const pdf = activePdf();
  if (!pdf) return;
  pdf.highlights = pdf.highlights.filter((highlight) => highlight.id !== id);
  pdf.updatedAt = Date.now();
  saveState();
  renderPdfHighlights(pdf);
  renderBinder();
  setStatus("PDF highlight deleted.");
}

function commitTagInput() {
  const page = activePage();
  if (!page) return;
  const tags = parseTagInput(els.tagInput.value);
  page.tags = tags;
  els.tagInput.value = tags.join(", ");
  ensurePageTagsInLibrary(page);
  pruneUnusedTags();
  page.updatedAt = Date.now();
  saveState();
  renderBinder();
  renderTags();
  renderDashboard();
}

function parseTagInput(value) {
  return unique(String(value || "").split(/[,;#\n]+/).map((tag) => tag.trim()).filter(Boolean));
}

function renderSearchResults() {
  const query = els.searchInput.value.trim();
  if (!query) {
    els.searchResults.hidden = true;
    els.searchResults.innerHTML = "";
    return;
  }
  const matches = [
    ...state.pages.map((page) => pageSearchMatch(page, query)).filter(Boolean),
    ...state.pdfs.map((pdf) => pdfSearchMatch(pdf, query)).filter(Boolean)
  ].slice(0, 12);
  els.searchResults.hidden = false;
  if (!matches.length) {
    els.searchResults.innerHTML = "<p class=\"fine-print\">No matches found.</p>";
    return;
  }
  els.searchResults.innerHTML = "";
  matches.forEach((match) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `
      <strong>${escapeHtml(match.title)}</strong>
      <small>${escapeHtml(match.notebook)} - ${escapeHtml(match.reason)}</small>
      <span>${escapeHtml(match.snippet)}</span>
    `;
    button.addEventListener("click", () => {
      if (match.type === "pdf") {
        selectPdf(match.id);
        setStatus(`Found "${query}" in PDF "${match.title}".`);
        return;
      }
      selectPage(match.id);
      switchMainTab("write");
      highlightFindTerm(query);
      setStatus(`Found "${query}" in "${match.title}".`);
    });
    els.searchResults.appendChild(button);
  });
}

function pageSearchMatch(page, query) {
  const needle = query.toLowerCase();
  const fields = [
    { reason: "title", text: page.title },
    { reason: "tags", text: page.tags.join(", ") },
    { reason: "body", text: textFromHtml(page.content || page.plain || "") }
  ];
  const found = fields.find((field) => field.text.toLowerCase().includes(needle));
  if (!found) return null;
  return {
    type: "page",
    id: page.id,
    title: page.title,
    notebook: page.notebook,
    reason: found.reason,
    snippet: snippetAround(found.text, query)
  };
}

function pdfSearchMatch(pdf, query) {
  const needle = query.toLowerCase();
  const highlightText = (pdf.highlights || [])
    .map((highlight) => [highlight.text, highlight.note].filter(Boolean).join(" - "))
    .filter(Boolean)
    .join(" ");
  const fields = [
    { reason: "PDF name", text: pdf.name },
    { reason: "PDF highlights", text: highlightText }
  ];
  const found = fields.find((field) => String(field.text || "").toLowerCase().includes(needle));
  if (!found) return null;
  return {
    type: "pdf",
    id: pdf.id,
    title: pdf.name,
    notebook: pdf.notebook,
    reason: found.reason,
    snippet: snippetAround(found.text, query)
  };
}

function snippetAround(text, query) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  const index = source.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return source.slice(0, 96);
  const start = Math.max(0, index - 36);
  const end = Math.min(source.length, index + query.length + 56);
  return `${start > 0 ? "..." : ""}${source.slice(start, end)}${end < source.length ? "..." : ""}`;
}

function clearFindMarks(root = els.editor) {
  if (!root) return;
  root.querySelectorAll("mark.find-mark").forEach((mark) => {
    const text = document.createTextNode(mark.textContent);
    mark.replaceWith(text);
  });
}

function highlightFindTerm(query) {
  clearFindMarks();
  const term = String(query || "").trim();
  if (!term || term.length < 2) return;
  const walker = document.createTreeWalker(els.editor, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.toLowerCase().includes(term.toLowerCase())) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest("script, style, mark")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const pattern = new RegExp(escapeRegExp(term), "gi");
  nodes.slice(0, 80).forEach((node) => {
    const wrapper = document.createElement("span");
    wrapper.innerHTML = escapeHtml(node.nodeValue).replace(pattern, (match) => `<mark class="find-mark">${escapeHtml(match)}</mark>`);
    node.replaceWith(...wrapper.childNodes);
  });
}

async function createTag() {
  const result = await openTagDialog("New Tag", { name: "", color: nextTagColor() });
  if (!result) return;
  const name = normalizeTagName(result.name);
  if (!name) return;
  if (state.tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
    setStatus(`Tag "${name}" already exists.`);
    return;
  }
  state.tags.push({ id: uid(), name, color: result.color });
  if (!activePage().tags.includes(name)) activePage().tags.push(name);
  els.tagInput.value = activePage().tags.join(", ");
  saveState();
  renderAll(false);
  setStatus(`Tag "${name}" created and added to this page.`);
}

function togglePageTag(name) {
  const page = activePage();
  if (page.tags.includes(name)) {
    page.tags = page.tags.filter((tag) => tag !== name);
  } else {
    page.tags.push(name);
  }
  page.updatedAt = Date.now();
  els.tagInput.value = page.tags.join(", ");
  saveState();
  renderBinder();
  renderTags();
  renderDashboard();
}

function deleteTag(name) {
  const normalized = normalizeTagName(name);
  if (!normalized) return;
  state.tags = state.tags.filter((tag) => tag.name.toLowerCase() !== normalized.toLowerCase());
  state.pages.forEach((page) => {
    page.tags = (page.tags || []).filter((tag) => tag.toLowerCase() !== normalized.toLowerCase());
  });
  els.tagInput.value = activePage().tags.join(", ");
  saveState();
  renderAll(false);
  setStatus(`Tag "${normalized}" deleted.`);
}

function pruneUnusedTags() {
  const used = new Set(state.pages.flatMap((page) => page.tags || []).map((tag) => tag.toLowerCase()));
  state.tags = state.tags.filter((tag) => used.has(tag.name.toLowerCase()));
}

function ensurePageTagsInLibrary(page) {
  page.tags.forEach((rawTag) => {
    const name = normalizeTagName(rawTag);
    if (!name || state.tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) return;
    state.tags.push({ id: uid(), name, color: nextTagColor() });
  });
}

function insertTagList() {
  const page = activePage();
  const tags = page.tags.length ? page.tags : state.tags.map((tag) => tag.name);
  if (!tags.length) {
    setStatus("Create tags first.");
    return;
  }
  const html = `<p class="tag-list-line">${tags.map((tag) => `<span class="page-tag">${escapeHtml(tag)}</span>`).join(" ")}</p>`;
  insertHtml(html);
}

function renderDashboard() {
  const totalWords = state.pages.reduce((sum, page) => sum + wordCountForPage(page), 0);
  const due = dueCards();
  els.dashPageCount.textContent = String(state.pages.length);
  els.dashWordCount.textContent = String(totalWords);
  els.dashDueCount.textContent = String(due.length);
  els.dashNotebookCount.textContent = String(state.notebooks.length);

  els.notebookDashboard.innerHTML = "";
  state.notebooks.forEach((notebook) => {
    const pages = state.pages.filter((page) => page.notebook === notebook);
    if (!pages.length) return;
    const row = document.createElement("div");
    row.className = "dashboard-row";
    const cards = pages.reduce((sum, page) => sum + page.cards.length, 0);
    const dueCount = pages.reduce((sum, page) => sum + dueCountForPage(page), 0);
    row.style.borderLeft = `6px solid ${notebookColor(notebook)}`;
    row.innerHTML = `<strong>${escapeHtml(notebook)}</strong><small>${pages.length} pages - ${cards} cards - ${dueCount} due</small>`;
    row.addEventListener("click", () => selectNotebook(notebook));
    els.notebookDashboard.appendChild(row);
  });

  els.recentPagesList.innerHTML = "";
  state.pages
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)
    .forEach((page) => {
      const row = document.createElement("div");
      row.className = "dashboard-row";
      row.innerHTML = `<strong>${escapeHtml(page.title)}</strong><small>${escapeHtml(page.notebook)} - ${formatDate(page.updatedAt)}</small>`;
      row.addEventListener("click", () => {
        selectPage(page.id);
        switchMainTab("write");
      });
      els.recentPagesList.appendChild(row);
    });
}

function loadActivePageIntoEditor() {
  const page = activePage();
  if (!page) return;
  showEditorWorkspace();
  els.editor.dataset.pageId = page.id;
  els.pageTitleInput.value = page.title;
  els.tagInput.value = page.tags.join(", ");
  els.documentType.value = page.documentType || "lecture";
  els.learningGoal.value = page.goal || "";
  els.paperSizeSelect.value = paperSizeKey(page.paperSize);
  applyPaperSize(page.paperSize);
  loadPageSetupControls(page);
  els.editor.innerHTML = page.content || "";
  renderWidgets();
  scheduleAutoPagination();
  typesetMath();
}

function renderStats() {
  const page = activePage();
  if (!page) return;
  const editorText = els.editor?.dataset.pageId === page.id ? cleanRichText(els.editor) : page.plain || "";
  const words = editorText.trim().split(/\s+/).filter(Boolean).length;
  const chars = editorText.length;
  const next = page.cards.filter((card) => card.due).sort((a, b) => a.due - b.due)[0];
  els.wordCount.textContent = String(words);
  els.charCount.textContent = String(chars);
  els.cardCount.textContent = String(page.cards.length);
  els.nextDue.textContent = next ? formatDate(next.due) : "None";
  els.updatedAt.textContent = formatDate(page.updatedAt);
  const pages = estimateEditorPageCount();
  els.countText.textContent = `${words} words / ${chars} chars / ${pages} page${pages === 1 ? "" : "s"}`;
  updatePageBreakInfo(pages);
}

function renderDueCards() {
  const due = dueCards();
  els.dueCardList.innerHTML = "";
  if (!due.length) {
    els.dueCardList.innerHTML = "<p class=\"fine-print\">No due cards yet.</p>";
    return;
  }
  due.slice(0, 12).forEach(({ card, page }) => {
    const node = document.createElement("div");
    node.className = "study-card";
    node.innerHTML = `<h4>${escapeHtml(page.title)}</h4><p>${cardFaceHtml(card, "front")}</p><small>Due ${formatDate(card.due)}</small>`;
    node.addEventListener("click", () => {
      selectPage(page.id);
      switchMainTab("review");
    });
    els.dueCardList.appendChild(node);
  });
}

function renderCalendar() {
  if (!els.calendarGrid) return;
  calendarCursor ||= dateKey(new Date());
  els.calendarWeekBtn.classList.toggle("active-tool", calendarView === "week");
  els.calendarMonthBtn.classList.toggle("active-tool", calendarView === "month");
  renderCalendarGrid();
  renderCalendarUpcoming();
}

function renderCalendarGrid() {
  els.calendarGrid.innerHTML = "";
  els.calendarGrid.className = `calendar-grid ${calendarView === "month" ? "calendar-month-grid" : "calendar-week-grid"}`;
  if (calendarView === "month") renderCalendarMonth();
  else renderCalendarWeek();
}

function renderCalendarWeek() {
  const start = startOfWeek(parseDateKey(calendarCursor));
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  els.calendarRangeLabel.textContent = `${formatShortDate(days[0])} - ${formatShortDate(days[6])}`;
  days.forEach((day) => {
    const key = dateKey(day);
    const column = document.createElement("section");
    column.className = "calendar-day-column" + (key === dateKey(new Date()) ? " today" : "");
    column.innerHTML = `<header><strong>${weekdayName(day)}</strong><span>${formatShortDate(day)}</span></header>`;
    const list = document.createElement("div");
    list.className = "calendar-event-stack";
    calendarOccurrencesForDate(key).forEach((event) => list.appendChild(calendarEventNode(event, "week")));
    if (!list.children.length) list.innerHTML = "<p class=\"fine-print\">No events</p>";
    column.addEventListener("dblclick", () => newCalendarEventDraft(key));
    column.appendChild(list);
    els.calendarGrid.appendChild(column);
  });
}

function renderCalendarMonth() {
  const cursor = parseDateKey(calendarCursor);
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  els.calendarRangeLabel.textContent = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const head = document.createElement("div");
    head.className = "calendar-month-heading";
    head.textContent = day;
    els.calendarGrid.appendChild(head);
  });
  Array.from({ length: 42 }, (_, index) => addDays(start, index)).forEach((day) => {
    const key = dateKey(day);
    const cell = document.createElement("section");
    cell.className = "calendar-month-cell";
    if (day.getMonth() !== cursor.getMonth()) cell.classList.add("muted");
    if (key === dateKey(new Date())) cell.classList.add("today");
    cell.innerHTML = `<header>${day.getDate()}</header>`;
    const events = calendarOccurrencesForDate(key);
    events.slice(0, 4).forEach((event) => cell.appendChild(calendarEventNode(event, "month")));
    if (events.length > 4) cell.insertAdjacentHTML("beforeend", `<small class="calendar-more">+${events.length - 4} more</small>`);
    cell.addEventListener("dblclick", () => newCalendarEventDraft(key));
    els.calendarGrid.appendChild(cell);
  });
}

function calendarEventNode(event, density = "week") {
  const node = document.createElement("button");
  node.type = "button";
  node.className = `calendar-event-chip ${event.done ? "done" : ""} ${density === "month" ? "compact" : ""}`;
  node.style.setProperty("--event-color", event.color || calendarTypeColor(event.type));
  node.innerHTML = `
    <strong>${event.time ? `${escapeHtml(event.time)} ` : ""}${escapeHtml(event.title)}</strong>
    ${density === "week" ? `<small>${escapeHtml(calendarEventSubtitle(event))}</small>` : ""}
  `;
  node.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();
    loadCalendarEvent(event.id);
  });
  return node;
}

function renderCalendarUpcoming() {
  els.calendarUpcomingList.innerHTML = "";
  const today = dateKey(new Date());
  const upcoming = calendarOccurrencesBetween(today, dateKey(addDays(new Date(), 90)))
    .filter((event) => !event.done)
    .sort(compareCalendarEvents)
    .slice(0, 10);
  if (!upcoming.length) {
    els.calendarUpcomingList.innerHTML = "<p class=\"fine-print\">No upcoming reminders.</p>";
    return;
  }
  upcoming.forEach((event) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "calendar-upcoming-row";
    row.style.setProperty("--event-color", event.color || calendarTypeColor(event.type));
    row.innerHTML = `<strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(formatCalendarEventDate(event))} - ${escapeHtml(calendarEventSubtitle(event))}</small>`;
    row.addEventListener("click", () => loadCalendarEvent(event.id));
    els.calendarUpcomingList.appendChild(row);
  });
}

function setCalendarView(view) {
  calendarView = view === "month" ? "month" : "week";
  renderCalendar();
}

function moveCalendar(direction) {
  const cursor = parseDateKey(calendarCursor || dateKey(new Date()));
  calendarCursor = dateKey(calendarView === "month" ? new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1) : addDays(cursor, direction * 7));
  renderCalendar();
}

function newCalendarEventDraft(date = "", options = {}) {
  selectedCalendarEventId = null;
  const draftDate = options.clearDate ? "" : (date || calendarCursor || dateKey(new Date()));
  els.calendarTitleInput.value = "";
  els.calendarDateInput.value = draftDate;
  els.calendarTimeInput.value = "";
  els.calendarEndTimeInput.value = "";
  els.calendarTypeSelect.value = "reminder";
  els.calendarRepeatSelect.value = "none";
  els.calendarRepeatUntilInput.value = "";
  setCalendarRepeatDays([]);
  updateCalendarRepeatControls();
  els.calendarColorInput.value = calendarTypeColor("reminder");
  els.calendarNotesInput.value = "";
  els.calendarDoneBtn.textContent = "Mark Done";
  els.calendarTitleInput.focus();
}

function loadCalendarEvent(id) {
  const event = state.calendarEvents.find((item) => item.id === id);
  if (!event) return;
  selectedCalendarEventId = id;
  calendarCursor = event.date;
  els.calendarTitleInput.value = event.title;
  els.calendarDateInput.value = event.date;
  els.calendarTimeInput.value = event.time || "";
  els.calendarEndTimeInput.value = event.endTime || "";
  els.calendarTypeSelect.value = event.type || "reminder";
  els.calendarRepeatSelect.value = event.repeat || "none";
  els.calendarRepeatUntilInput.value = event.repeatUntil || "";
  setCalendarRepeatDays(event.repeatDays?.length ? event.repeatDays : [parseDateKey(event.date).getDay()]);
  updateCalendarRepeatControls();
  els.calendarColorInput.value = normalizeHexColor(event.color) || calendarTypeColor(event.type);
  els.calendarNotesInput.value = event.notes || "";
  els.calendarDoneBtn.textContent = event.done ? "Mark Open" : "Mark Done";
  renderCalendar();
}

function saveCalendarEvent() {
  const title = els.calendarTitleInput.value.trim();
  const date = els.calendarDateInput.value;
  if (!title) {
    setStatus("Calendar event needs a title.");
    return;
  }
  if (!date) {
    setStatus("Calendar event needs a date.");
    els.calendarDateInput.focus();
    return;
  }
  const now = Date.now();
  const previous = selectedCalendarEventId ? state.calendarEvents.find((item) => item.id === selectedCalendarEventId) : null;
  const repeat = els.calendarRepeatSelect.value;
  const repeatDays = selectedCalendarRepeatDays();
  const repeatUntil = els.calendarRepeatUntilInput.value;
  if (repeat === "weekly" && !repeatDays.length) {
    setStatus("Choose at least one repeat day for weekly events.");
    els.calendarRepeatDaysBtn.focus();
    return;
  }
  if (needsRepeatEndDate(repeat, repeatDays) && !repeatUntil) {
    setStatus("Choose a repeat-until date for events that happen multiple times per week.");
    els.calendarRepeatUntilInput.focus();
    return;
  }
  if (repeatUntil && repeatUntil < date) {
    setStatus("Repeat-until date must be after the event date.");
    els.calendarRepeatUntilInput.focus();
    return;
  }
  const event = normalizeCalendarEvent({
    id: selectedCalendarEventId || uid(),
    title,
    date,
    time: els.calendarTimeInput.value,
    endTime: els.calendarEndTimeInput.value,
    type: els.calendarTypeSelect.value,
    repeat,
    repeatDays,
    repeatUntil,
    color: els.calendarColorInput.value,
    notes: els.calendarNotesInput.value.trim(),
    done: Boolean(previous?.done),
    createdAt: previous?.createdAt || now,
    updatedAt: now
  });
  const existing = state.calendarEvents.findIndex((item) => item.id === event.id);
  if (existing >= 0) state.calendarEvents.splice(existing, 1, event);
  else state.calendarEvents.push(event);
  selectedCalendarEventId = event.id;
  calendarCursor = event.date;
  saveState();
  renderCalendar();
  setStatus(`Calendar ${event.type} saved.`);
}

async function deleteCalendarEvent() {
  if (!selectedCalendarEventId) {
    setStatus("Select a calendar event first.");
    return;
  }
  const ok = await retroConfirm("Delete Event", "Delete this calendar event or reminder?", "warning");
  if (!ok) return;
  state.calendarEvents = state.calendarEvents.filter((event) => event.id !== selectedCalendarEventId);
  selectedCalendarEventId = null;
  saveState();
  newCalendarEventDraft(calendarCursor || dateKey(new Date()));
  renderCalendar();
  setStatus("Calendar event deleted.");
}

function toggleCalendarEventDone() {
  const event = state.calendarEvents.find((item) => item.id === selectedCalendarEventId);
  if (!event) {
    setStatus("Select a calendar event first.");
    return;
  }
  event.done = !event.done;
  event.updatedAt = Date.now();
  saveState();
  loadCalendarEvent(event.id);
  setStatus(event.done ? "Calendar event marked done." : "Calendar event reopened.");
}

function calendarOccurrencesForDate(key) {
  return state.calendarEvents
    .filter((event) => calendarEventOccursOn(event, key))
    .map((event) => ({ ...event, occurrenceDate: key }))
    .sort(compareCalendarEvents);
}

function selectedCalendarRepeatDays() {
  return [...document.querySelectorAll("[data-repeat-day]:checked")]
    .map((input) => Number(input.dataset.repeatDay))
    .filter((day) => day >= 0 && day <= 6);
}

function setCalendarRepeatDays(days = []) {
  const selected = new Set(days.map(Number));
  document.querySelectorAll("[data-repeat-day]").forEach((input) => {
    input.checked = selected.has(Number(input.dataset.repeatDay));
  });
  updateCalendarRepeatSummary();
}

function updateCalendarRepeatControls() {
  const repeat = els.calendarRepeatSelect.value;
  if (repeat === "none") {
    els.calendarRepeatDaysBtn.disabled = true;
    els.calendarRepeatDaysMenu.hidden = true;
    els.calendarRepeatUntilInput.disabled = true;
    els.calendarRepeatUntilInput.value = "";
  } else {
    els.calendarRepeatDaysBtn.disabled = repeat !== "weekly";
    if (repeat !== "weekly") els.calendarRepeatDaysMenu.hidden = true;
    els.calendarRepeatUntilInput.disabled = false;
    if (repeat === "weekdays") setCalendarRepeatDays([1, 2, 3, 4, 5]);
    if (["daily", "monthly", "yearly"].includes(repeat)) setCalendarRepeatDays([]);
  }
  updateCalendarRepeatSummary();
}

function updateCalendarRepeatSummary() {
  const repeat = els.calendarRepeatSelect?.value || "none";
  const days = selectedCalendarRepeatDays();
  if (!els.calendarRepeatDaysSummary) return;
  if (repeat === "none") {
    els.calendarRepeatDaysSummary.textContent = "No repeat";
  } else if (repeat === "weekly") {
    els.calendarRepeatDaysSummary.textContent = days.length ? days.map(dayNameShort).join(", ") : "Choose days";
  } else if (repeat === "weekdays") {
    els.calendarRepeatDaysSummary.textContent = "Mon-Fri";
  } else {
    els.calendarRepeatDaysSummary.textContent = repeatLabel(repeat);
  }
}

function dayNameShort(day) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] || "";
}

function needsRepeatEndDate(repeat, days) {
  if (repeat === "daily" || repeat === "weekdays") return true;
  if (repeat === "weekly" && days.length > 1) return true;
  return false;
}

function calendarOccurrencesBetween(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const occurrences = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    occurrences.push(...calendarOccurrencesForDate(dateKey(cursor)));
  }
  return occurrences;
}

function renderPageCards() {
  const page = activePage();
  els.pageCards.innerHTML = "";
  if (!page.cards.length) {
    els.pageCards.innerHTML = "<p class=\"fine-print\">This page has no flashcards yet.</p>";
    return;
  }
  page.cards
    .slice()
    .sort((a, b) => a.due - b.due)
    .forEach((card) => {
      const node = document.createElement("div");
      node.className = "note-card";
      node.innerHTML = `
        <h4>${cardFaceHtml(card, "front")}</h4>
        <div>${cardFaceHtml(card, "back")}</div>
        <small>Due ${formatDate(card.due)} - interval ${card.interval || 0}d - ease ${(card.ease || 2.5).toFixed(2)}</small>
        <div class="button-row right">
          <button data-edit-card="${card.id}">Edit</button>
          <button data-delete-card="${card.id}">Delete</button>
        </div>
      `;
      node.querySelector("[data-edit-card]").addEventListener("click", () => loadCardForEdit(card.id));
      node.querySelector("[data-delete-card]").addEventListener("click", () => deleteCard(card.id));
      els.pageCards.appendChild(node);
    });
}

function renderReview() {
  renderReviewFilters();
  buildReviewQueue();
  const item = reviewQueue[reviewIndex];
  if (!item) {
    els.reviewCard.innerHTML = "<div class=\"review-empty\">No cards due in this review scope.</div>";
    return;
  }
  const face = answerVisible ? cardFaceHtml(item.card, "back") : cardFaceHtml(item.card, "front");
  els.reviewCard.innerHTML = `
    <small>${escapeHtml(item.page.notebook)} / ${escapeHtml(item.page.title)} - ${reviewIndex + 1} of ${reviewQueue.length} - click card to ${answerVisible ? "hide" : "show"} answer</small>
    <div class="review-face">${face}</div>
    ${answerVisible ? "<small>Grade your recall below.</small>" : "<small>Think first, then reveal.</small>"}
  `;
}

function renderReviewFilters() {
  if (!els.reviewNotebookSelect || !els.reviewPageSelect) return;
  if (!reviewNotebookFilter || !state.notebooks.includes(reviewNotebookFilter)) reviewNotebookFilter = activeNotebookName();
  const notebookPrevious = els.reviewNotebookSelect.value || reviewNotebookFilter;
  els.reviewNotebookSelect.innerHTML = "";
  state.notebooks.forEach((notebook) => {
    const option = document.createElement("option");
    option.value = notebook;
    option.textContent = notebook;
    els.reviewNotebookSelect.appendChild(option);
  });
  reviewNotebookFilter = state.notebooks.includes(notebookPrevious) ? notebookPrevious : reviewNotebookFilter;
  els.reviewNotebookSelect.value = reviewNotebookFilter;

  const pagePrevious = reviewPageFilter;
  const pages = state.pages.filter((page) => page.notebook === reviewNotebookFilter);
  els.reviewPageSelect.innerHTML = "<option value=\"\">All pages</option>";
  pages.forEach((page) => {
    const due = dueCountForPage(page);
    const option = document.createElement("option");
    option.value = page.id;
    option.textContent = `${page.title}${due ? ` (${due} due)` : ""}`;
    els.reviewPageSelect.appendChild(option);
  });
  reviewPageFilter = pages.some((page) => page.id === pagePrevious) ? pagePrevious : "";
  els.reviewPageSelect.value = reviewPageFilter;
}

function renderLatexSnippets() {
  els.latexSnippetList.innerHTML = "";
  const query = String(els.equationSearchInput?.value || "").trim().toLowerCase();
  const snippets = state.latexSnippets.filter((snippet) => `${snippet.name} ${snippet.latex}`.toLowerCase().includes(query));
  if (!state.latexSnippets.length) {
    els.latexSnippetList.innerHTML = "<p class=\"fine-print\">No saved equations yet.</p>";
    return;
  }
  if (!snippets.length) {
    els.latexSnippetList.innerHTML = "<p class=\"fine-print\">No equations match that search.</p>";
    return;
  }
  snippets.forEach((snippet) => {
    const row = document.createElement("div");
    row.className = "dashboard-row equation-row";
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(snippet.name)}</strong>
        <small>${escapeHtml(snippet.latex)}</small>
      </span>
      <span class="equation-actions">
        <button data-equation-insert="${snippet.id}">Insert</button>
        <button data-equation-delete="${snippet.id}">Delete</button>
      </span>
    `;
    row.addEventListener("click", () => {
      els.latexNameInput.value = snippet.name;
      els.latexInput.value = snippet.latex;
      previewLatex();
    });
    row.querySelector("[data-equation-insert]").addEventListener("click", (event) => {
      event.stopPropagation();
      insertEquationSnippet(snippet.id);
    });
    row.querySelector("[data-equation-delete]").addEventListener("click", async (event) => {
      event.stopPropagation();
      await deleteEquationSnippet(snippet.id);
    });
    els.latexSnippetList.appendChild(row);
  });
}

function renderEquationSelect() {
  const previous = els.equationSelect.value;
  els.equationSelect.innerHTML = "";
  if (!state.latexSnippets.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No equations";
    els.equationSelect.appendChild(option);
    return;
  }
  state.latexSnippets.forEach((snippet) => {
    const option = document.createElement("option");
    option.value = snippet.id;
    option.textContent = `${snippet.name}   ${snippet.latex}`;
    els.equationSelect.appendChild(option);
  });
  if (state.latexSnippets.some((snippet) => snippet.id === previous)) els.equationSelect.value = previous;
}

function buildReviewQueue() {
  const notebook = reviewNotebookFilter || activeNotebookName();
  reviewQueue = dueCards().filter(({ page }) => {
    if (page.notebook !== notebook) return false;
    if (reviewPageFilter && page.id !== reviewPageFilter) return false;
    return true;
  });
  if (reviewIndex >= reviewQueue.length) reviewIndex = 0;
}

function switchMainTab(name) {
  if (name === "write") {
    els.editor.focus();
    return;
  }
  document.querySelectorAll("[data-main-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mainTab === name);
  });
  document.querySelectorAll(".main-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${name}Panel`);
  });
  if (name === "latex") previewLatex();
  if (name === "review") renderReview();
  if (name === "citations") renderCitationManager();
  if (name === "calendar") renderCalendar();
}

function selectNotebook(notebook) {
  syncEditorNow();
  state.activeNotebook = notebook;
  activePdfId = null;
  state.activePdfId = "";
  reviewNotebookFilter = notebook;
  reviewPageFilter = "";
  const folder = firstFolderForNotebook(notebook);
  selectedFolderId = folder?.id;
  const firstPage = state.pages.find((page) => page.notebook === notebook);
  if (firstPage) activeId = firstPage.id;
  saveState();
  renderAll(Boolean(firstPage));
}

function selectPage(id) {
  syncEditorNow();
  activePdfId = null;
  activeId = id;
  state.activePdfId = "";
  state.activeNotebook = activePage()?.notebook || state.activeNotebook;
  reviewNotebookFilter = state.activeNotebook;
  selectedFolderId = activePage()?.folderId || selectedFolderId;
  saveState();
  renderAll(true);
}

function selectPdf(id) {
  syncEditorNow();
  const pdf = state.pdfs.find((candidate) => candidate.id === id);
  if (!pdf) return;
  activePdfId = id;
  state.activePdfId = id;
  state.activeNotebook = pdf.notebook;
  selectedFolderId = pdf.folderId;
  saveState();
  renderAll(false);
  renderPdfWorkspace();
}

async function createFolder() {
  const notebook = activeNotebookName();
  const name = normalizeNotebookName(await retroPrompt("New Folder", "Folder name.", "New Folder"));
  if (!name) return;
  const folder = { id: uid(), notebook, name, collapsed: false, favorite: false };
  state.folders.push(folder);
  selectedFolderId = folder.id;
  saveState();
  renderBinder();
  renderDashboard();
  setStatus(`Folder "${name}" created.`);
}

async function renameFolderById(id) {
  const folder = state.folders.find((candidate) => candidate.id === id);
  if (!folder) return;
  const name = normalizeNotebookName(await retroPrompt("Rename Folder", "Folder name.", folder.name));
  if (!name || name === folder.name) return;
  folder.name = name;
  saveState();
  renderBinder();
  setStatus(`Folder renamed to "${name}".`);
}

async function renamePageById(id) {
  const page = state.pages.find((candidate) => candidate.id === id);
  if (!page) return;
  const title = normalizeNotebookName(await retroPrompt("Rename Page", "Page title.", page.title));
  if (!title || title === page.title) return;
  page.title = title;
  page.updatedAt = Date.now();
  if (page.id === activeId && !activePdfId) els.pageTitleInput.value = title;
  saveState();
  renderAll(false);
  setStatus(`Page renamed to "${title}".`);
}

async function renamePdfById(id) {
  const pdf = state.pdfs.find((candidate) => candidate.id === id);
  if (!pdf) return;
  const name = normalizeNotebookName(await retroPrompt("Rename PDF", "PDF name.", pdf.name));
  if (!name || name === pdf.name) return;
  pdf.name = name;
  pdf.updatedAt = Date.now();
  saveState();
  renderBinder();
  renderPdfWorkspace();
  setStatus(`PDF renamed to "${name}".`);
}

function renameSelectedBinderItem() {
  if (activePdfId) return renamePdfById(activePdfId);
  return renamePageById(activeId);
}

function addPdfToFolder(folderId) {
  const folder = state.folders.find((candidate) => candidate.id === folderId) || firstFolderForNotebook(activeNotebookName());
  pendingPdfFolderId = folder?.id || null;
  if (!pendingPdfFolderId) return;
  els.binderPdfInput.value = "";
  els.binderPdfInput.click();
}

async function importBinderPdf() {
  const file = els.binderPdfInput.files?.[0];
  if (!file) return;
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
    setStatus("Choose a PDF file.");
    return;
  }
  const folder = state.folders.find((candidate) => candidate.id === pendingPdfFolderId) || firstFolderForNotebook(activeNotebookName());
  const id = uid();
  const pdf = normalizeBinderPdf({
    id,
    name: file.name.replace(/\.pdf$/i, ""),
    notebook: folder.notebook,
    folderId: folder.id,
    pdfBlobId: id,
    highlights: [],
    favorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  try {
    await putPdfBlob(pdf.pdfBlobId, file);
  } catch {
    setStatus("PDF storage failed.");
    return;
  }
  state.pdfs.unshift(pdf);
  pendingPdfFolderId = null;
  selectPdf(pdf.id);
  setStatus(`PDF "${pdf.name}" added.`);
}

function createPage() {
  syncEditorNow();
  activePdfId = null;
  state.activePdfId = "";
  const notebook = activeNotebookName();
  const folder = state.folders.find((candidate) => candidate.id === selectedFolderId && candidate.notebook === notebook) || firstFolderForNotebook(notebook);
  const page = makeBlankPage(notebook, folder?.id);
  state.pages.unshift(page);
  activeId = page.id;
  saveState();
  renderAll(true);
  switchMainTab("write");
  els.pageTitleInput.focus();
  els.pageTitleInput.select();
}

function duplicateActivePage() {
  syncEditorNow();
  const page = activePage();
  const copy = JSON.parse(JSON.stringify(page));
  copy.id = uid();
  copy.title = page.title + " Copy";
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.cards = copy.cards.map((card) => ({ ...card, id: uid(), noteId: copy.id }));
  state.pages.unshift(copy);
  activeId = copy.id;
  saveState();
  renderAll(true);
}

async function deleteActivePage() {
  if (activePdfId) {
    await deletePdfById(activePdfId);
    return;
  }
  await deletePageById(activePage()?.id);
}

async function deletePageById(id) {
  if (state.pages.length === 1) {
    setStatus("Keep at least one page in the notebook.");
    return;
  }
  const page = state.pages.find((candidate) => candidate.id === id);
  if (!page) return;
  const ok = await retroConfirm("Delete Page", `Delete "${page.title}" and its flashcards?`, "warning");
  if (!ok) return;
  state.pages = state.pages.filter((candidate) => candidate.id !== page.id);
  if (activeId === page.id) activeId = state.pages[0].id;
  activePdfId = null;
  state.activePdfId = "";
  state.activeNotebook = activePage()?.notebook || state.activeNotebook;
  saveState();
  renderAll(true);
}

async function deleteFolderById(id) {
  const folder = state.folders.find((candidate) => candidate.id === id);
  if (!folder) return;
  const pages = state.pages.filter((page) => page.folderId === id);
  const pdfs = state.pdfs.filter((pdf) => pdf.folderId === id);
  const ok = await retroConfirm("Delete Folder", `Delete folder "${folder.name}" and ${pages.length} page${pages.length === 1 ? "" : "s"} plus ${pdfs.length} PDF${pdfs.length === 1 ? "" : "s"}?`, "warning");
  if (!ok) return;
  state.pages = state.pages.filter((page) => page.folderId !== id);
  state.pdfs = state.pdfs.filter((pdf) => pdf.folderId !== id);
  state.folders = state.folders.filter((candidate) => candidate.id !== id);
  if (!state.folders.some((candidate) => candidate.notebook === folder.notebook)) {
    state.folders.push({ id: uid(), notebook: folder.notebook, name: "General", collapsed: false, favorite: false });
  }
  if (activePdfId && !state.pdfs.some((pdf) => pdf.id === activePdfId)) {
    activePdfId = null;
    state.activePdfId = "";
  }
  if (!state.pages.length) {
    const fallbackFolder = firstFolderForNotebook(folder.notebook) || state.folders[0];
    const page = makeBlankPage(fallbackFolder.notebook, fallbackFolder.id);
    state.pages.push(page);
    activeId = page.id;
  } else if (!state.pages.some((page) => page.id === activeId)) {
    activeId = state.pages[0].id;
  }
  selectedFolderId = activePage()?.folderId || firstFolderForNotebook(activeNotebookName())?.id;
  saveState();
  renderAll(true);
  setStatus(`Folder "${folder.name}" deleted.`);
}

async function deletePdfById(id) {
  const pdf = state.pdfs.find((candidate) => candidate.id === id);
  if (!pdf) return;
  const ok = await retroConfirm("Delete PDF", `Remove "${pdf.name}" from this binder?`, "warning");
  if (!ok) return;
  state.pdfs = state.pdfs.filter((candidate) => candidate.id !== id);
  if (activePdfId === id) {
    activePdfId = null;
    state.activePdfId = "";
  }
  saveState();
  renderAll(true);
  setStatus(`PDF "${pdf.name}" removed.`);
}

function openActivePdfExternal() {
  const pdf = activePdf();
  if (!pdf) return;
  const src = pdfObjectUrls.get(pdf.pdfBlobId) || els.binderPdfPreview.src;
  if (src && src !== "about:blank") {
    window.open(src, "_blank", "noopener");
    setStatus(`Opened "${pdf.name}" in a separate viewer.`);
  }
}

function exec(command, value = null) {
  const target = currentRichEditor();
  target.focus();
  if (["justifyLeft", "justifyCenter", "justifyRight"].includes(command) && applyListAwareAlignment(command, target)) {
    syncRichEditor(target);
    return;
  }
  document.execCommand(command, false, value);
  syncRichEditor(target);
}

function applyListAwareAlignment(command, target) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  const anchor = selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode;
  const list = anchor?.closest?.("ul, ol");
  if (!list || !target.contains(list)) return false;
  list.classList.remove("align-left", "align-center", "align-right");
  list.classList.add(command === "justifyCenter" ? "align-center" : command === "justifyRight" ? "align-right" : "align-left");
  [...list.querySelectorAll("li")].forEach((item) => {
    item.style.textAlign = command === "justifyCenter" ? "center" : command === "justifyRight" ? "right" : "left";
  });
  return true;
}

function applyTextColor() {
  const color = els.textColorInput.value;
  if (!color) return;
  els.textColorChip.style.backgroundColor = color;
  exec("foreColor", color);
}

function applyHighlightColor() {
  const color = els.highlightColorInput.value;
  if (!color) return;
  els.highlightColorChip.style.backgroundColor = color;
  const target = currentRichEditor();
  target.focus();
  document.execCommand("hiliteColor", false, color);
  document.execCommand("backColor", false, color);
  syncRichEditor(target);
}

function showColorMenu(mode, anchor) {
  const colors = mode === "highlight"
    ? ["#fff36b", "#00ff00", "#00ffff", "#ff00ff", "#0000ff", "#ff0000", "#000080", "#008080", "#008000", "#800080", "#800000", "#808000", "#808080", "#c0c0c0", "#000000"]
    : FORMAT_COLORS;
  els.colorMenu.dataset.mode = mode;
  els.colorMenu.innerHTML = `
    <div class="color-menu-row">
      <label>High-contrast only</label>
      <span class="toggle-pill">Off</span>
    </div>
    <div class="color-grid">
      ${colors.map((color) => `<button type="button" data-color="${color}" style="--swatch:${color}" title="${color}"></button>`).join("")}
    </div>
    ${mode === "highlight" ? "<button type=\"button\" data-color=\"transparent\" class=\"color-menu-command\">Stop Highlighting</button>" : "<button type=\"button\" data-color=\"#111111\" class=\"color-menu-command\"><span class=\"auto-color-box\"></span>Automatic</button>"}
    <button type="button" data-color-more class="color-menu-command">More Colors...</button>
  `;
  els.colorMenu.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      applyColorChoice(mode, button.dataset.color);
      hideColorMenu();
    });
  });
  els.colorMenu.querySelector("[data-color-more]").addEventListener("click", () => {
    hideColorMenu();
    (mode === "highlight" ? els.highlightColorInput : els.textColorInput).click();
  });
  const rect = anchor.getBoundingClientRect();
  els.colorMenu.hidden = false;
  els.colorMenu.style.left = `${Math.min(rect.left, window.innerWidth - 238)}px`;
  els.colorMenu.style.top = `${rect.bottom + 2}px`;
}

function hideColorMenu() {
  els.colorMenu.hidden = true;
}

function showSymbolMenu(anchor) {
  const recent = recentSymbols();
  const quick = unique([...recent, ...QUICK_SYMBOLS]).slice(0, 18);
  els.symbolMenu.innerHTML = `
    <div class="symbol-quick-grid">
      ${quick.map((symbol) => `<button type="button" data-symbol="${escapeHtml(symbol)}" title="${escapeHtml(symbolCode(symbol))}">${escapeHtml(symbol)}</button>`).join("")}
    </div>
    <button type="button" data-more-symbols class="symbol-more-command">&Omega; More Symbols...</button>
  `;
  els.symbolMenu.querySelectorAll("[data-symbol]").forEach((button) => {
    button.addEventListener("click", () => insertSymbol(button.dataset.symbol));
  });
  els.symbolMenu.querySelector("[data-more-symbols]").addEventListener("click", () => {
    hideSymbolMenu();
    openSymbolDialog();
  });
  const rect = anchor.getBoundingClientRect();
  els.symbolMenu.hidden = false;
  els.symbolMenu.style.left = `${Math.min(rect.left, window.innerWidth - 170)}px`;
  els.symbolMenu.style.top = `${rect.bottom + 2}px`;
}

function hideSymbolMenu() {
  els.symbolMenu.hidden = true;
}

function insertSymbol(symbol) {
  if (!symbol) return;
  hideSymbolMenu();
  insertHtml(escapeHtml(symbol));
  rememberRecentSymbol(symbol);
  setStatus(`Inserted symbol ${symbol}.`);
}

function recentSymbols() {
  state.recentSymbols = Array.isArray(state.recentSymbols) ? state.recentSymbols.slice(0, 24) : [];
  return state.recentSymbols;
}

function rememberRecentSymbol(symbol) {
  state.recentSymbols = unique([symbol, ...recentSymbols()]).slice(0, 24);
  saveState();
}

function openSymbolDialog() {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    let draft = {
      tab: "symbols",
      set: "symbol",
      query: "",
      selected: recentSymbols()[0] || "Ω"
    };
    els.dialogTitle.textContent = "Symbol";
    els.dialogMessage.textContent = "";
    els.dialogIcon.className = "icon95 Calculator_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-symbol");
    dialog.classList.remove("has-fields", "has-multiline", "has-data", "page-setup-dialog");
    els.dialogFields.innerHTML = "<div class=\"symbol-dialog\"></div>";
    els.dialogButtons.innerHTML = "";
    const root = els.dialogFields.querySelector(".symbol-dialog");

    const render = () => {
      root.innerHTML = symbolDialogHtml(draft);
      root.querySelectorAll("[data-symbol-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          draft.tab = button.dataset.symbolTab;
          if (draft.tab === "special") draft.set = "punctuation";
          render();
        });
      });
      root.querySelector("[data-symbol-set]").addEventListener("change", (event) => {
        draft.set = event.target.value;
        draft.selected = symbolsForDraft(draft)[0] || draft.selected;
        render();
      });
      root.querySelector("[data-symbol-search]").addEventListener("input", (event) => {
        draft.query = event.target.value;
        const caret = event.target.selectionStart || draft.query.length;
        render();
        requestAnimationFrame(() => {
          const search = root.querySelector("[data-symbol-search]");
          search?.focus();
          search?.setSelectionRange(caret, caret);
        });
      });
      root.querySelectorAll("[data-pick-symbol]").forEach((button) => {
        button.addEventListener("click", () => {
          draft.selected = button.dataset.pickSymbol;
          render();
        });
        button.addEventListener("dblclick", () => closeRetroDialog(draft.selected));
      });
      root.querySelector("[data-symbol-code]").addEventListener("change", (event) => {
        const parsed = symbolFromCode(event.target.value);
        if (parsed) {
          draft.selected = parsed;
          render();
        }
      });
    };

    const insert = document.createElement("button");
    insert.textContent = "Insert";
    insert.addEventListener("click", () => closeRetroDialog(draft.selected));
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(insert, cancel);
    render();
    els.modalOverlay.hidden = false;
  }).then((symbol) => {
    els.modalOverlay.querySelector(".retro-dialog")?.classList.remove("has-symbol");
    if (symbol) insertSymbol(symbol);
  });
}

function symbolDialogHtml(draft) {
  const symbols = symbolsForDraft(draft);
  const recent = recentSymbols();
  const selected = draft.selected || symbols[0] || "Ω";
  return `
    <div class="symbol-tabs">
      <button type="button" data-symbol-tab="symbols" class="${draft.tab === "symbols" ? "active" : ""}">Symbols</button>
      <button type="button" data-symbol-tab="special" class="${draft.tab === "special" ? "active" : ""}">Special Characters</button>
    </div>
    <div class="symbol-controls">
      <label>Font</label>
      <select data-symbol-set>
        ${Object.entries(SYMBOL_SETS).map(([key, set]) => `<option value="${key}" ${draft.set === key ? "selected" : ""}>${escapeHtml(set.label)}</option>`).join("")}
      </select>
      <label>Search</label>
      <input data-symbol-search value="${escapeHtml(draft.query)}" placeholder="Greek, arrow, copyright, U+03A9..." />
    </div>
    <div class="symbol-grid-large">
      ${symbols.map((symbol) => `<button type="button" data-pick-symbol="${escapeHtml(symbol)}" class="${symbol === selected ? "active" : ""}" title="${escapeHtml(symbolCode(symbol))}">${escapeHtml(symbol)}</button>`).join("")}
    </div>
    <label>Recently used symbols:</label>
    <div class="symbol-recent-row">
      ${(recent.length ? recent : QUICK_SYMBOLS.slice(0, 12)).map((symbol) => `<button type="button" data-pick-symbol="${escapeHtml(symbol)}">${escapeHtml(symbol)}</button>`).join("")}
    </div>
    <div class="symbol-footer-row">
      <span>Selected: <strong>${escapeHtml(selected)}</strong></span>
      <label>Character code</label>
      <input data-symbol-code value="${escapeHtml(symbolCode(selected))}" />
      <span>from Unicode</span>
    </div>
  `;
}

function symbolsForDraft(draft) {
  const setKey = draft.tab === "special" ? "punctuation" : draft.set;
  const source = [...(SYMBOL_SETS[setKey]?.chars || SYMBOL_SETS.symbol.chars)];
  const query = String(draft.query || "").trim().toLowerCase();
  if (!query) return source;
  const byCode = symbolFromCode(query);
  return source.filter((symbol) => {
    const haystack = `${symbol} ${symbolCode(symbol)} ${symbolAlias(symbol)} ${SYMBOL_SETS[setKey]?.label || ""}`.toLowerCase();
    return haystack.includes(query) || symbol === byCode;
  });
}

function symbolAlias(symbol) {
  return {
    "Ω": "omega ohm symbol",
    "α": "alpha",
    "β": "beta",
    "γ": "gamma",
    "Δ": "delta triangle change",
    "π": "pi",
    "∞": "infinity",
    "≤": "less equal",
    "≥": "greater equal",
    "®": "registered",
    "©": "copyright",
    "™": "trademark",
    "→": "right arrow",
    "←": "left arrow",
    "€": "euro",
    "£": "pound",
    "¥": "yen"
  }[symbol] || "";
}

function symbolCode(symbol) {
  const code = symbol.codePointAt(0) || 0;
  return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
}

function symbolFromCode(value) {
  const clean = String(value || "").trim().replace(/^U\+/i, "").replace(/^0x/i, "");
  if (!/^[0-9a-f]+$/i.test(clean)) return "";
  const code = Number.parseInt(clean, 16);
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

function applyColorChoice(mode, color) {
  if (mode === "highlight") {
    if (color === "transparent") {
      els.highlightColorInput.value = "#ffffff";
      els.highlightColorChip.style.backgroundColor = "#ffffff";
      const target = currentRichEditor();
      target.focus();
      document.execCommand("hiliteColor", false, "transparent");
      document.execCommand("backColor", false, "transparent");
      syncRichEditor(target);
      setStatus("Highlight cleared.");
      return;
    }
    els.highlightColorInput.value = color;
    applyHighlightColor();
  } else {
    els.textColorInput.value = color;
    applyTextColor();
  }
}

function applyLineSpacing() {
  const value = els.lineSpacingSelect.value;
  if (!value) return;
  const selection = window.getSelection();
  const target = currentRichEditor();
  target.focus();
  const node = selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode;
  const block = node?.closest?.("p, li, blockquote, h1, h2, h3, div") || target;
  if (target.contains(block) || block === target) {
    block.style.lineHeight = value;
    syncRichEditor(target);
    setStatus(`Line spacing set to ${value}.`);
  }
}

function setLineSpacing(value) {
  els.lineSpacingSelect.value = value;
  applyLineSpacing();
}

function toggleDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus("Dictation is not available in this Electron runtime.");
    return;
  }
  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.addEventListener("result", (event) => {
      const text = [...event.results].slice(event.resultIndex).map((result) => result[0]?.transcript || "").join(" ").trim();
      if (!text) return;
      insertHtml(`${escapeHtml(text)} `);
      setStatus("Dictation inserted text.");
    });
    recognition.addEventListener("end", () => {
      isDictating = false;
      els.dictationBtn.classList.remove("active-tool");
      setStatus("Dictation stopped.");
    });
    recognition.addEventListener("error", (event) => {
      isDictating = false;
      els.dictationBtn.classList.remove("active-tool");
      setStatus(`Dictation error: ${event.error || "unavailable"}.`);
    });
  }
  if (isDictating) {
    recognition.stop();
    return;
  }
  currentRichEditor().focus();
  try {
    recognition.start();
    isDictating = true;
    els.dictationBtn.classList.add("active-tool");
    setStatus("Dictation listening...");
  } catch {
    setStatus("Dictation could not start.");
  }
}

function speakSelection() {
  if (!window.speechSynthesis) {
    setStatus("Text to speech is not available in this runtime.");
    return;
  }
  const selection = window.getSelection().toString().trim();
  const text = selection || textFromHtml(currentRichEditor().innerHTML || "");
  if (!text) {
    setStatus("Select text or click inside a note to read it aloud.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  setStatus(selection ? "Reading selected text." : "Reading current editor text.");
}

function execCardCommand(command) {
  const target = focusedCardEditor || els.cardFront;
  target.focus();
  if (["justifyLeft", "justifyCenter", "justifyRight"].includes(command) && applyListAwareAlignment(command, target)) {
    syncRichEditor(target);
    return;
  }
  document.execCommand(command, false, null);
  syncRichEditor(target);
}

function insertHtml(html, targetOverride = null) {
  const target = targetOverride || currentRichEditor();
  const range = captureSelectionForTarget(target);
  const scrollTop = target.scrollTop;
  if (target === els.editor) switchMainTab("write");
  restoreSelectionForTarget(target, range);
  document.execCommand("insertHTML", false, html);
  rememberSelectionForTarget(target);
  syncRichEditor(target);
  renderWidgets();
  typesetMath();
  requestAnimationFrame(() => {
    if (document.body.contains(target)) target.scrollTop = scrollTop;
  });
}

function insertSelectedEquation() {
  const id = els.equationSelect.value;
  if (!id) {
    switchMainTab("latex");
    setStatus("Save an equation in the LaTeX workspace first.");
    return;
  }
  insertEquationSnippet(id);
}

function loadSelectedEquation() {
  const snippet = state.latexSnippets.find((item) => item.id === els.equationSelect.value);
  if (!snippet) return;
  els.latexNameInput.value = snippet.name;
  els.latexInput.value = snippet.latex;
  previewLatex();
}

function insertEquationSnippet(id) {
  const snippet = state.latexSnippets.find((item) => item.id === id);
  if (!snippet) return;
  insertEquation(snippet.latex, true);
  setStatus(`Inserted equation "${snippet.name}".`);
}

function insertEquation(latex, display = els.latexDisplayMode.checked) {
  if (!latex) return;
  const html = display ? `<p>\\[${escapeHtml(latex)}\\]</p>` : `<span class="latex-chip">\\(${escapeHtml(latex)}\\)</span>&nbsp;`;
  insertHtml(html);
}

async function insertTable(target = currentRichEditor()) {
  const range = captureSelectionForTarget(target);
  const options = await openInsertTableDialog(target);
  if (!options) return;
  restoreSelectionForTarget(target, range);
  const rows = clamp(options.rows, 1, 24);
  const requestedCols = clamp(options.cols, 1, 12);
  const cols = clamp(requestedCols, 1, maxTableColumnsForTarget(target));
  const headerColor = normalizeHexColor(options.headerColor) || "#d9e8ff";
  const tableStyle = tableStyleForAutoFit(options);
  const cellStyle = options.autoFit === "fixed" && options.fixedWidth ? ` style=\"width:${escapeHtml(options.fixedWidth)};\"` : "";
  let html = `<table data-autofit="${escapeHtml(options.autoFit)}" data-header-color="${headerColor}"${tableStyle}><thead><tr>`;
  for (let c = 1; c <= cols; c += 1) html += `<th${cellStyle ? cellStyle.replace(/"$/, `;background-color:${headerColor};"`) : ` style="background-color:${headerColor};"`}>Header ${c}</th>`;
  html += "</tr></thead><tbody>";
  for (let r = 1; r < rows; r += 1) {
    html += "<tr>";
    for (let c = 1; c <= cols; c += 1) html += `<td${cellStyle}>&nbsp;</td>`;
    html += "</tr>";
  }
  html += "</tbody></table><p></p>";
  insertHtml(html, target);
  if (options.remember) {
    localStorage.setItem("retro-notebook-table-defaults", JSON.stringify(options));
  }
  if (cols < requestedCols) setStatus(`Table limited to ${cols} columns for this page width.`);
}

function openInsertTableDialog(target) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    let defaults = { cols: 3, rows: 3, autoFit: "window", fixedWidth: "Auto", headerColor: "#d9e8ff", remember: false };
    try {
      defaults = { ...defaults, ...JSON.parse(localStorage.getItem("retro-notebook-table-defaults") || "{}") };
    } catch {
      defaults = { ...defaults };
    }
    defaults.cols = clamp(Number(defaults.cols) || 3, 1, maxTableColumnsForTarget(target));
    defaults.rows = clamp(Number(defaults.rows) || 3, 1, 24);
    els.dialogTitle.textContent = "Insert Table";
    els.dialogMessage.textContent = "";
    els.dialogIcon.className = "icon95 FileText_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-fields", "table-dialog");
    dialog.classList.remove("has-multiline", "has-data", "has-symbol", "page-setup-dialog");
    els.dialogFields.innerHTML = `
      <div class="insert-table-dialog">
        <fieldset>
          <legend>Table size</legend>
          <label>Number of columns</label>
          <input data-table-cols type="number" min="1" max="${maxTableColumnsForTarget(target)}" value="${defaults.cols}" />
          <label>Number of rows</label>
          <input data-table-rows type="number" min="1" max="24" value="${defaults.rows}" />
        </fieldset>
        <fieldset>
          <legend>AutoFit behavior</legend>
          <label class="table-fit-option fixed">
            <input type="radio" name="table-fit" value="fixed" ${defaults.autoFit === "fixed" ? "checked" : ""} />
            <span class="table-fit-copy"><strong>Fixed column width</strong><small>Use the width box for each column.</small></span>
            <input data-table-fixed aria-label="Fixed column width" value="${escapeHtml(defaults.fixedWidth || "Auto")}" />
          </label>
          <label class="table-fit-option">
            <input type="radio" name="table-fit" value="content" ${defaults.autoFit === "content" ? "checked" : ""} />
            <span class="table-fit-copy"><strong>AutoFit to contents</strong><small>Table grows to text, up to page width.</small></span>
          </label>
          <label class="table-fit-option">
            <input type="radio" name="table-fit" value="window" ${defaults.autoFit === "window" ? "checked" : ""} />
            <span class="table-fit-copy"><strong>AutoFit to page</strong><small>Columns fill the writing area.</small></span>
          </label>
        </fieldset>
        <fieldset>
          <legend>Design</legend>
          <label>Header color</label>
          <input data-table-header-color type="color" value="${escapeHtml(normalizeHexColor(defaults.headerColor) || "#d9e8ff")}" />
        </fieldset>
        <label><input data-table-remember type="checkbox" ${defaults.remember ? "checked" : ""} /> Remember dimensions for new tables</label>
      </div>
    `;
    els.dialogButtons.innerHTML = "";
    const updateFitControls = () => {
      const selected = els.dialogFields.querySelector("input[name='table-fit']:checked")?.value || "window";
      const fixed = els.dialogFields.querySelector("[data-table-fixed]");
      if (fixed) fixed.disabled = selected !== "fixed";
      els.dialogFields.querySelectorAll(".table-fit-option").forEach((label) => {
        label.classList.toggle("active", label.querySelector("input[type='radio']")?.value === selected);
      });
    };
    els.dialogFields.querySelectorAll("input[name='table-fit']").forEach((radio) => {
      radio.addEventListener("change", updateFitControls);
    });
    updateFitControls();
    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.addEventListener("click", () => {
      const cols = clamp(Number(els.dialogFields.querySelector("[data-table-cols]")?.value) || 3, 1, maxTableColumnsForTarget(target));
      const rows = clamp(Number(els.dialogFields.querySelector("[data-table-rows]")?.value) || 3, 1, 24);
      const autoFit = els.dialogFields.querySelector("input[name='table-fit']:checked")?.value || "window";
      const fixedWidth = normalizeTableWidth(els.dialogFields.querySelector("[data-table-fixed]")?.value);
      const headerColor = normalizeHexColor(els.dialogFields.querySelector("[data-table-header-color]")?.value) || "#d9e8ff";
      const remember = Boolean(els.dialogFields.querySelector("[data-table-remember]")?.checked);
      closeRetroDialog({ cols, rows, autoFit, fixedWidth, headerColor, remember });
    });
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(ok, cancel);
    els.modalOverlay.hidden = false;
  });
}

function tableStyleForAutoFit(options) {
  if (options.autoFit === "window") return " style=\"width:100%;table-layout:fixed;\"";
  if (options.autoFit === "content") return " style=\"width:auto;max-width:100%;table-layout:auto;\"";
  return " style=\"width:auto;max-width:100%;table-layout:fixed;\"";
}

function normalizeTableWidth(value) {
  const raw = String(value || "").trim();
  if (!raw || /^auto$/i.test(raw)) return "";
  if (/^\d+(\.\d+)?(px|%|in|cm|mm|pt)?$/i.test(raw)) return /\D$/.test(raw) ? raw : `${raw}px`;
  return "";
}

function maxTableColumnsForTarget(target) {
  if (target !== els.editor) return 6;
  const page = activePage();
  const size = PAPER_SIZES[paperSizeKey(page?.paperSize)];
  const usable = (cssLengthToPixels(size.width) || 816) - (cssLengthToPixels(size.paddingX) || 64) * 2;
  return clamp(Math.floor(usable / 92), 3, 8);
}

async function insertChart(target = currentRichEditor()) {
  const range = captureSelectionForTarget(target);
  const data = await openDataGridDialog("Chart Builder", defaultDataSet("chart"), "chart");
  if (!data) return;
  restoreSelectionForTarget(target, range);
  const encoded = encodeDataSet(data);
  insertHtml(
    `<div class="retro-widget chart-widget" contenteditable="false" data-chart="${encoded}">${dataWidgetTitleHtml(data)}<canvas class="chart-canvas"></canvas></div><p></p>`,
    target
  );
}

async function insertGraph(target = currentRichEditor()) {
  const range = captureSelectionForTarget(target);
  const data = await openDataGridDialog("Graph Builder", defaultDataSet("graph"), "graph");
  if (!data) return;
  restoreSelectionForTarget(target, range);
  const encoded = encodeDataSet(data);
  insertHtml(
    `<div class="retro-widget graph-widget" contenteditable="false" data-graph="${encoded}">${dataWidgetTitleHtml(data)}<canvas class="graph-canvas"></canvas></div><p></p>`,
    target
  );
}

function insertDrawing() {
  insertHtml(`<div class="retro-widget draw-widget" contenteditable="false"><div class="widget-title">Drawing Pad <span>pen</span>${widgetActions(false)}</div><canvas class="draw-pad"></canvas></div><p></p>`);
}

async function insertHyperlink() {
  const selection = window.getSelection().toString().trim();
  const result = await openHyperlinkDialog(selection);
  if (!result) return;
  const url = normalizeUrl(result.url);
  if (!url) {
    setStatus("Enter a valid web link.");
    return;
  }
  const label = result.text.trim() || url;
  insertHtml(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>&nbsp;`);
  setStatus("Hyperlink inserted.");
}

function insertDivider() {
  insertHtml('<hr class="page-divider" /><p></p>');
  setStatus("Divider inserted.");
}

function insertTemplate(type) {
  insertHtml(builtInTemplates()[type] || builtInTemplates().lecture);
  setStatus("Template inserted.");
}

function loadBuiltInTemplate(type) {
  const templates = builtInTemplates();
  const names = builtInTemplateNames();
  const content = templates[type] || templates.lecture;
  editingTemplateId = null;
  els.templateNameInput.value = names[type] || "Custom Template";
  els.templateEditor.innerHTML = safeHtml(content);
  switchMainTab("insert");
  withRichEditor(els.templateEditor, () => els.templateEditor.focus());
  renderWidgets();
  typesetMath();
  setStatus(`${names[type] || "Template"} loaded for editing.`);
}

async function handleTemplateInsert(action, anchor) {
  if (action === "textColor") {
    showColorMenu("text", anchor || els.textColorBtn);
  } else if (action === "highlight") {
    showColorMenu("highlight", anchor || els.highlightColorBtn);
  } else if (action === "equation") {
    insertSelectedEquation();
  } else if (action === "table") {
    await insertTable(els.templateEditor);
  } else if (action === "chart") {
    await insertChart(els.templateEditor);
  } else if (action === "graph") {
    await insertGraph(els.templateEditor);
  } else if (action === "image") {
    insertImage(els.templateEditor);
  } else if (action === "divider") {
    insertDivider();
  }
}

function insertImage(target = currentRichEditor()) {
  pendingImageTarget = target;
  els.imageFileInput.value = "";
  els.imageFileInput.click();
}

function pasteTextFromClipboard() {
  const text = window.retroNotebook?.clipboard?.readText ? window.retroNotebook.clipboard.readText() : "";
  if (!text) {
    setStatus("Clipboard does not contain text.");
    return;
  }
  document.execCommand("insertText", false, text);
  syncRichEditor(currentRichEditor());
}

function insertSelectedImageFile() {
  const file = els.imageFileInput.files?.[0];
  if (!file) {
    pendingImageTarget = null;
    return;
  }
  if (!file.type.startsWith("image/")) {
    setStatus("Choose an image file.");
    pendingImageTarget = null;
    return;
  }
  const target = pendingImageTarget || currentRichEditor();
  pendingImageTarget = null;
  const reader = new FileReader();
  reader.addEventListener("load", () => insertImageDataUrl(reader.result, file.name, target));
  reader.readAsDataURL(file);
}

function insertImageDataUrl(src, alt = "Inserted image", target = currentRichEditor()) {
  if (!src) return;
  insertHtml(`<figure class="image-figure" contenteditable="false"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" /></figure><p></p>`, target);
  setStatus("Image inserted.");
}

function handleEditorPaste(event) {
  const items = [...(event.clipboardData?.items || [])];
  const imageItem = items.find((item) => item.type.startsWith("image/"));
  if (!imageItem) return;
  const file = imageItem.getAsFile();
  if (!file) return;
  event.preventDefault();
  const target = event.currentTarget;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    insertImageDataUrl(reader.result, "Pasted image", target);
  });
  reader.readAsDataURL(file);
}

function pasteImageFromClipboard(target = currentRichEditor(), options = {}) {
  if (!target?.isContentEditable) {
    setStatus("Click in a note, template, phrase, or flashcard before pasting an image.");
    return false;
  }
  const src = clipboardImageDataUrl();
  if (!src) {
    if (!options.silentIfEmpty) setStatus("Clipboard does not contain an image.");
    return false;
  }
  insertImageDataUrl(src, "Clipboard image", target);
  return true;
}

function clipboardImageDataUrl() {
  const imageData = window.retroNotebook?.clipboard?.readImageDataUrl?.() || "";
  if (imageData) return imageData;
  const text = window.retroNotebook?.clipboard?.readText?.() || "";
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(text.trim()) ? text.trim() : "";
}

function copyImageToClipboard(src) {
  if (!src) {
    setStatus("Right-click or select an inserted image first.");
    return false;
  }
  let copied = false;
  try {
    copied = Boolean(window.retroNotebook?.clipboard?.writeImageDataUrl?.(src));
  } catch {
    copied = false;
  }
  if (!copied && /^data:image\//i.test(src)) {
    window.retroNotebook?.clipboard?.writeText?.(src);
    copied = true;
  }
  setStatus(copied ? "Image copied." : "Could not copy this image.");
  return copied;
}

function renderCustomTemplates() {
  els.customTemplateList.innerHTML = "";
  const query = String(els.templateSearchInput?.value || "").trim().toLowerCase();
  const templates = state.customTemplates.filter((template) => `${template.name} ${textFromHtml(template.content)}`.toLowerCase().includes(query));
  if (!state.customTemplates.length) {
    els.customTemplateList.innerHTML = "<p class=\"fine-print\">No custom templates yet.</p>";
    return;
  }
  if (!templates.length) {
    els.customTemplateList.innerHTML = "<p class=\"fine-print\">No templates match that search.</p>";
    return;
  }
  templates.forEach((template) => {
    const row = document.createElement("div");
    row.className = "dashboard-row template-row";
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(template.name)}</strong>
        <small>${wordCountText(textFromHtml(template.content))}</small>
      </span>
      <span class="equation-actions">
        <button data-template-insert="${template.id}">Insert</button>
        <button data-template-edit="${template.id}">Edit</button>
        <button data-template-delete="${template.id}">Delete</button>
      </span>
    `;
    row.querySelector("[data-template-insert]").addEventListener("click", () => insertCustomTemplate(template.id));
    row.querySelector("[data-template-edit]").addEventListener("click", () => loadCustomTemplate(template.id));
    row.querySelector("[data-template-delete]").addEventListener("click", () => deleteCustomTemplate(template.id));
    els.customTemplateList.appendChild(row);
  });
}

function newCustomTemplateDraft() {
  editingTemplateId = null;
  els.templateNameInput.value = "";
  els.templateEditor.innerHTML = "<h1>Template Title</h1><p></p>";
  els.templateNameInput.focus();
}

function captureCurrentPageAsTemplate() {
  syncEditorNow();
  const page = activePage();
  editingTemplateId = null;
  els.templateNameInput.value = `${page.title} Template`;
  els.templateEditor.innerHTML = safeHtml(page.content || "");
  switchMainTab("insert");
  setStatus("Current page captured as a template draft.");
}

function saveCustomTemplate() {
  const name = normalizeNotebookName(els.templateNameInput.value);
  const content = safeHtml(els.templateEditor.innerHTML);
  if (!name || !textFromHtml(content)) {
    setStatus("Custom templates need a name and body.");
    return;
  }
  const existing = state.customTemplates.find((template) => template.id === editingTemplateId);
  if (existing) {
    existing.name = name;
    existing.content = content;
    existing.updatedAt = Date.now();
  } else {
    editingTemplateId = uid();
    state.customTemplates.unshift({ id: editingTemplateId, name, content, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveState();
  renderCustomTemplates();
  setStatus(`Template "${name}" saved.`);
}

function loadCustomTemplate(id) {
  const template = state.customTemplates.find((item) => item.id === id);
  if (!template) return;
  editingTemplateId = id;
  els.templateNameInput.value = template.name;
  els.templateEditor.innerHTML = safeHtml(template.content);
}

function insertCustomTemplate(id) {
  const template = state.customTemplates.find((item) => item.id === id);
  if (!template) return;
  insertHtml(safeHtml(template.content));
  setStatus(`Template "${template.name}" inserted.`);
}

async function deleteCustomTemplate(id) {
  const template = state.customTemplates.find((item) => item.id === id);
  if (!template) return;
  const ok = await retroConfirm("Delete Template", `Delete custom template "${template.name}"?`, "warning");
  if (!ok) return;
  state.customTemplates = state.customTemplates.filter((item) => item.id !== id);
  if (editingTemplateId === id) newCustomTemplateDraft();
  saveState();
  renderCustomTemplates();
  setStatus(`Template "${template.name}" deleted.`);
}

function previewLatex() {
  const latex = els.latexInput.value.trim();
  if (!latex) {
    els.latexPreview.textContent = "Type an equation to preview it.";
    return;
  }
  const wrapped = els.latexDisplayMode.checked ? `\\[${latex}\\]` : `\\(${latex}\\)`;
  els.latexPreview.textContent = wrapped;
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([els.latexPreview]).catch(() => {
      els.latexPreview.textContent = "Could not render equation.";
    });
  }
}

function debouncePreviewLatex() {
  clearTimeout(debouncePreviewLatex.timer);
  debouncePreviewLatex.timer = setTimeout(previewLatex, 250);
}

function insertLatexFromWorkspace() {
  const latex = els.latexInput.value.trim();
  if (!latex) return;
  insertEquation(latex);
}

function saveLatexSnippet() {
  const latex = els.latexInput.value.trim();
  if (!latex) return;
  const name = normalizeNotebookName(els.latexNameInput.value) || equationNameFromLatex(latex);
  const existing = state.latexSnippets.find((snippet) => snippet.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.latex = latex;
  } else {
    state.latexSnippets.unshift({ id: uid(), name, latex });
  }
  saveState();
  renderLatexSnippets();
  renderEquationSelect();
  els.equationSelect.value = state.latexSnippets.find((snippet) => snippet.name === name)?.id || "";
  setStatus(`Equation "${name}" saved.`);
}

async function deleteEquationSnippet(id) {
  const snippet = state.latexSnippets.find((item) => item.id === id);
  if (!snippet) return;
  const ok = await retroConfirm("Delete Equation", `Delete saved equation "${snippet.name}"?`, "warning");
  if (!ok) return;
  state.latexSnippets = state.latexSnippets.filter((item) => item.id !== id);
  saveState();
  renderLatexSnippets();
  renderEquationSelect();
  setStatus(`Equation "${snippet.name}" deleted.`);
}

async function makeCardFromSelection() {
  switchMainTab("flashcards");
  const selection = selectedHtml();
  if (selection.text) {
    els.cardFront.innerHTML = selection.html;
    els.cardBack.innerHTML = "";
    focusedCardEditor = els.cardBack;
    activeRichEditor = els.cardBack;
    els.cardBack.focus();
    setStatus("Selection staged as a flashcard. Add the answer, then save.");
    return;
  }
  focusedCardEditor = els.cardFront;
  activeRichEditor = els.cardFront;
  els.cardFront.focus();
  setStatus("Type a front and back, then add the flashcard.");
}

function addManualCard() {
  const front = textFromHtml(els.cardFront.innerHTML);
  const back = textFromHtml(els.cardBack.innerHTML);
  if (!front || !back) {
    setStatus("Flashcards need both a front and a back.");
    return;
  }
  if (editingCardId) {
    const page = activePage();
    const card = page.cards.find((item) => item.id === editingCardId);
    if (!card) {
      editingCardId = null;
    } else {
      card.front = front;
      card.back = back;
      card.frontHtml = safeHtml(els.cardFront.innerHTML);
      card.backHtml = safeHtml(els.cardBack.innerHTML);
      card.updatedAt = Date.now();
      page.updatedAt = Date.now();
      saveState();
      clearCardDraft();
      renderAll(false);
      setStatus("Flashcard updated.");
      return;
    }
  }
  addCard(front, back, safeHtml(els.cardFront.innerHTML), safeHtml(els.cardBack.innerHTML), els.reverseCardToggle.checked);
  clearCardDraft();
}

function addCard(front, back, frontHtml = escapeHtml(front), backHtml = escapeHtml(back), addReverse = false) {
  const page = activePage();
  page.cards.push(makeCard(front, back, Date.now(), page.id, frontHtml, backHtml));
  if (addReverse) page.cards.push(makeCard(back, front, Date.now(), page.id, backHtml, frontHtml));
  page.updatedAt = Date.now();
  saveState();
  renderAll(false);
  setStatus(addReverse ? "Flashcards added both ways. They are due now." : "Flashcard added. It is due now.");
}

function makeClozeFromCardSelection() {
  const target = focusedCardEditor || els.cardFront;
  target.focus();
  const selected = window.getSelection().toString().trim();
  if (!selected) {
    setStatus("Select text inside a card face to make a cloze.");
    return;
  }
  document.execCommand("insertText", false, `{{c1::${selected}}}`);
  syncRichEditor(target);
  setStatus("Cloze marker inserted.");
}

function swapCardFaces() {
  const front = els.cardFront.innerHTML;
  els.cardFront.innerHTML = els.cardBack.innerHTML;
  els.cardBack.innerHTML = front;
  focusedCardEditor = els.cardFront;
  activeRichEditor = els.cardFront;
  els.cardFront.focus();
  setStatus("Flashcard front and back swapped.");
}

function clearCardDraft() {
  editingCardId = null;
  els.cardFront.innerHTML = "";
  els.cardBack.innerHTML = "";
  els.reverseCardToggle.checked = false;
  focusedCardEditor = els.cardFront;
  activeRichEditor = els.cardFront;
}

function selectedHtml() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return { text: "", html: "" };
  const text = selection.toString().trim();
  if (!text) return { text: "", html: "" };
  const container = document.createElement("div");
  container.appendChild(selection.getRangeAt(0).cloneContents());
  return { text, html: safeHtml(container.innerHTML || escapeHtml(text)) };
}

function makeCard(front, back, due, noteId, frontHtml = escapeHtml(front), backHtml = escapeHtml(back)) {
  return {
    id: uid(),
    noteId,
    front,
    back,
    frontHtml,
    backHtml,
    createdAt: Date.now(),
    due,
    interval: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
    lastGrade: null
  };
}

function deleteCard(cardId) {
  const page = activePage();
  page.cards = page.cards.filter((card) => card.id !== cardId);
  if (editingCardId === cardId) clearCardDraft();
  page.updatedAt = Date.now();
  saveState();
  renderAll(false);
}

function loadCardForEdit(cardId) {
  const page = activePage();
  const card = page.cards.find((item) => item.id === cardId);
  if (!card) return;
  editingCardId = cardId;
  els.cardFront.innerHTML = cardFaceHtml(card, "front");
  els.cardBack.innerHTML = cardFaceHtml(card, "back");
  els.reverseCardToggle.checked = false;
  switchMainTab("flashcards");
  focusedCardEditor = els.cardFront;
  activeRichEditor = els.cardFront;
  els.cardFront.focus();
  setStatus("Editing flashcard draft. Save to update it.");
}

function gradeReview(grade) {
  const item = reviewQueue[reviewIndex];
  if (!item || !answerVisible) {
    setStatus("Reveal the answer before grading recall.");
    return;
  }
  scheduleCard(item.card, grade);
  item.page.updatedAt = Date.now();
  answerVisible = false;
  saveState();
  buildReviewQueue();
  if (reviewIndex >= reviewQueue.length) reviewIndex = 0;
  renderAll(false);
  setStatus(`Marked ${grade}. Next due ${formatDate(item.card.due)}.`);
}

function scheduleCard(card, grade) {
  const now = Date.now();
  if (grade === "again") {
    card.interval = 0;
    card.ease = Math.max(1.3, (card.ease || 2.5) - 0.2);
    card.lapses = (card.lapses || 0) + 1;
    card.due = now + 10 * 60 * 1000;
  } else if (grade === "hard") {
    card.interval = Math.max(1, Math.ceil((card.interval || 1) * 1.2));
    card.ease = Math.max(1.3, (card.ease || 2.5) - 0.15);
    card.due = now + card.interval * DAY_MS;
  } else if (grade === "good") {
    card.interval = card.reps === 0 ? 1 : Math.ceil((card.interval || 1) * (card.ease || 2.5));
    card.due = now + card.interval * DAY_MS;
  } else {
    card.ease = (card.ease || 2.5) + 0.15;
    card.interval = card.reps === 0 ? 3 : Math.ceil((card.interval || 1) * (card.ease || 2.5) * 1.25);
    card.due = now + card.interval * DAY_MS;
  }
  card.reps = (card.reps || 0) + 1;
  card.lastGrade = grade;
  card.reviewedAt = now;
}

async function createNotebook() {
  const result = await openNotebookDialog("New Notebook", { name: "New Notebook", color: nextNotebookColor() });
  if (!result) return;
  const name = normalizeNotebookName(result.name);
  if (!name) return;
  if (notebookExists(name)) {
    await retroAlert("New Notebook", "A notebook with that name already exists.", "warning");
    return;
  }
  state.notebooks.push(name);
  state.notebookColors[name] = result.color;
  const folder = { id: uid(), notebook: name, name: "General", collapsed: false, favorite: false };
  state.folders.push(folder);
  state.activeNotebook = name;
  selectedFolderId = folder.id;
  const page = makeBlankPage(name, folder.id);
  state.pages.unshift(page);
  activeId = page.id;
  saveState();
  renderAll(true);
  setStatus(`Notebook "${name}" created.`);
}

async function renameNotebook() {
  const current = activeNotebookName();
  const result = await openNotebookDialog("Rename Notebook", { name: current, color: notebookColor(current) });
  if (!result) return;
  const next = normalizeNotebookName(result.name);
  if (!next) return;
  if (next !== current && notebookExists(next)) {
    await retroAlert("Rename Notebook", "A notebook with that name already exists.", "warning");
    return;
  }
  state.notebooks = state.notebooks.map((notebook) => (notebook === current ? next : notebook));
  if (state.activeNotebook === current) state.activeNotebook = next;
  delete state.notebookColors[current];
  state.notebookColors[next] = result.color;
  state.folders.forEach((folder) => {
    if (folder.notebook === current) folder.notebook = next;
  });
  state.pages.forEach((page) => {
    if (page.notebook === current) page.notebook = next;
  });
  saveState();
  renderAll(false);
  setStatus(`Notebook renamed to "${next}".`);
}

async function recolorNotebook() {
  const current = activeNotebookName();
  const result = await openNotebookDialog("Notebook Color", { name: current, color: notebookColor(current), lockName: true });
  if (!result) return;
  state.notebookColors[current] = result.color;
  saveState();
  renderAll(false);
  setStatus(`Notebook "${current}" color updated.`);
}

async function deleteNotebook() {
  const current = activeNotebookName();
  if (state.notebooks.length === 1) {
    setStatus("Keep at least one notebook.");
    return;
  }
  const pageCount = state.pages.filter((page) => page.notebook === current).length;
  const ok = await retroConfirm("Delete Notebook", `Delete notebook "${current}"? Its ${pageCount} pages will move to another notebook.`, "warning");
  if (!ok) return;
  state.notebooks = state.notebooks.filter((notebook) => notebook !== current);
  const fallback = state.notebooks[0];
  state.activeNotebook = fallback;
  delete state.notebookColors[current];
  const fallbackFolder = firstFolderForNotebook(fallback);
  state.pages.forEach((page) => {
    if (page.notebook === current) {
      page.notebook = fallback;
      page.folderId = fallbackFolder?.id;
    }
  });
  state.folders = state.folders.filter((folder) => folder.notebook !== current);
  saveState();
  renderAll(true);
  setStatus(`Notebook "${current}" deleted. Pages moved to "${fallback}".`);
}

function applyProfile() {
  const page = activePage();
  page.documentType = els.documentType.value;
  page.goal = els.learningGoal.value.trim();
  page.updatedAt = Date.now();
  saveState();
  renderAll(false);
  setStatus("Page profile applied.");
}

function paperSizeKey(value) {
  return PAPER_SIZES[value] ? value : "letter";
}

function applyPaperSize(value) {
  const key = paperSizeKey(value);
  const size = PAPER_SIZES[key];
  document.documentElement.style.setProperty("--paper-width", size.width);
  document.documentElement.style.setProperty("--paper-height", size.height);
  document.documentElement.style.setProperty("--paper-padding-x", size.paddingX);
  document.documentElement.style.setProperty("--paper-padding-y", size.paddingY);
  document.body.dataset.paperSize = key;
  updatePrintPageStyle(key);
}

function updatePrintPageStyle(value) {
  const size = PAPER_SIZES[paperSizeKey(value)];
  let style = document.getElementById("printPageStyle");
  if (!style) {
    style = document.createElement("style");
    style.id = "printPageStyle";
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: ${size.width} ${size.height}; margin: 0; }`;
}

function updateActivePaperSize() {
  const page = activePage();
  if (!page) return;
  page.paperSize = paperSizeKey(els.paperSizeSelect.value);
  page.updatedAt = Date.now();
  applyPaperSize(page.paperSize);
  saveState();
  renderWidgets();
  scheduleAutoPagination();
  renderStats();
  setStatus(`Paper size set to ${PAPER_SIZES[page.paperSize].label}.`);
}

function loadPageSetupControls(page) {
  const setup = normalizePageSetup(page?.pageSetup);
  els.pageHeaderInput.value = setup.header;
  els.pageFooterInput.value = setup.footer;
  els.headerAlignSelect.value = setup.headerAlign;
  els.footerAlignSelect.value = setup.footerAlign;
  els.pageNumberPositionSelect.value = setup.pageNumberPosition;
  els.pageNumberTotalToggle.checked = setup.pageNumberTotal;
}

function readPageSetupControls() {
  return normalizePageSetup({
    header: els.pageHeaderInput.value,
    footer: els.pageFooterInput.value,
    headerAlign: els.headerAlignSelect.value,
    footerAlign: els.footerAlignSelect.value,
    pageNumberPosition: els.pageNumberPositionSelect.value,
    pageNumberTotal: els.pageNumberTotalToggle.checked
  });
}

function applyPageSetup() {
  const page = activePage();
  if (!page) return;
  page.pageSetup = readPageSetupControls();
  page.updatedAt = Date.now();
  saveState();
  setStatus("Page setup saved.");
  if (!els.printPreviewOverlay.hidden) renderPrintPreview();
}

function openPageSetupDialog() {
  const page = activePage();
  if (!page) return Promise.resolve(null);
  const setup = normalizePageSetup(page.pageSetup);
  return new Promise((resolve) => {
    dialogResolve = resolve;
    els.dialogTitle.textContent = "Page Setup";
    els.dialogMessage.textContent = "Headers, footers, and page numbers for the selected page.";
    els.dialogIcon.className = "icon95 FileText_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-fields", "page-setup-dialog");
    dialog.classList.remove("has-multiline", "has-data");
    els.dialogFields.innerHTML = `
      <fieldset>
        <legend>Header And Footer</legend>
        <div class="field-row-stacked">
          <label>Header text</label>
          <input data-page-header value="${escapeHtml(setup.header)}" placeholder="Essay title, course, author..." />
        </div>
        <div class="field-row-stacked">
          <label>Footer text</label>
          <input data-page-footer value="${escapeHtml(setup.footer)}" placeholder="Draft note, institution, honor code..." />
        </div>
        <div class="profile-grid">
          <label>Header position</label>
          <select data-header-align>
            ${["left", "center", "right"].map((value) => `<option value="${value}" ${setup.headerAlign === value ? "selected" : ""}>${value === "center" ? "Middle" : value === "left" ? "Left" : "Right"}</option>`).join("")}
          </select>
          <label>Footer position</label>
          <select data-footer-align>
            ${["left", "center", "right"].map((value) => `<option value="${value}" ${setup.footerAlign === value ? "selected" : ""}>${value === "center" ? "Middle" : value === "left" ? "Left" : "Right"}</option>`).join("")}
          </select>
        </div>
      </fieldset>
      <fieldset>
        <legend>Page Numbers</legend>
        <select data-page-number-position>
          ${[
            ["none", "No page numbers"],
            ["top-left", "Top left"],
            ["top-center", "Top middle"],
            ["top-right", "Top right"],
            ["bottom-left", "Bottom left"],
            ["bottom-center", "Bottom middle"],
            ["bottom-right", "Bottom right"]
          ].map(([value, label]) => `<option value="${value}" ${setup.pageNumberPosition === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
        <label class="inline-check"><input data-page-number-total type="checkbox" ${setup.pageNumberTotal ? "checked" : ""} /> Include total pages</label>
      </fieldset>
    `;
    const readDialogSetup = () => normalizePageSetup({
      header: els.dialogFields.querySelector("[data-page-header]").value,
      footer: els.dialogFields.querySelector("[data-page-footer]").value,
      headerAlign: els.dialogFields.querySelector("[data-header-align]").value,
      footerAlign: els.dialogFields.querySelector("[data-footer-align]").value,
      pageNumberPosition: els.dialogFields.querySelector("[data-page-number-position]").value,
      pageNumberTotal: els.dialogFields.querySelector("[data-page-number-total]").checked
    });
    const saveDialogSetup = () => {
      page.pageSetup = readDialogSetup();
      loadPageSetupControls(page);
      page.updatedAt = Date.now();
      saveState();
      if (!els.printPreviewOverlay.hidden) renderPrintPreview();
      return page.pageSetup;
    };
    els.dialogButtons.innerHTML = "";
    const apply = document.createElement("button");
    apply.textContent = "Apply";
    apply.addEventListener("click", () => {
      saveDialogSetup();
      setStatus("Page setup saved.");
      closeRetroDialog(true);
    });
    const preview = document.createElement("button");
    preview.textContent = "Preview";
    preview.addEventListener("click", () => {
      saveDialogSetup();
      closeRetroDialog(true);
      openPrintPreview();
    });
    const clearHeader = document.createElement("button");
    clearHeader.textContent = "Clear Header";
    clearHeader.addEventListener("click", () => {
      els.dialogFields.querySelector("[data-page-header]").value = "";
    });
    const clearFooter = document.createElement("button");
    clearFooter.textContent = "Clear Footer";
    clearFooter.addEventListener("click", () => {
      els.dialogFields.querySelector("[data-page-footer]").value = "";
    });
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(apply, preview, clearHeader, clearFooter, cancel);
    els.modalOverlay.hidden = false;
    setTimeout(() => els.dialogFields.querySelector("[data-page-header]")?.focus(), 0);
  });
}

function insertManualPageBreak() {
  const target = currentRichEditor();
  if (target !== els.editor) {
    insertHtml('<div class="manual-page-break" contenteditable="false" aria-label="Manual page break"></div><p></p>');
    return;
  }
  const selection = window.getSelection();
  const node = selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode;
  const block = node?.closest?.("li")?.closest("ul, ol") || node?.closest?.("p, h1, h2, h3, blockquote, table, .retro-widget, .image-figure") || els.editor.lastElementChild;
  const marker = document.createElement("div");
  marker.className = "manual-page-break";
  marker.contentEditable = "false";
  marker.setAttribute("aria-label", "Manual page break");
  const paragraph = document.createElement("p");
  paragraph.innerHTML = "<br>";
  if (block && block !== els.editor && els.editor.contains(block)) {
    block.insertAdjacentElement("afterend", marker);
    marker.insertAdjacentElement("afterend", paragraph);
  } else {
    els.editor.append(marker, paragraph);
  }
  syncEditorNow();
  setStatus("Manual page break inserted.");
}

function focusSearch() {
  els.searchInput.focus();
  els.searchInput.select();
  renderSearchResults();
}

function openPrintPreview() {
  ensureActivePageLoadedForPrint();
  syncEditorNow();
  applyPageSetup();
  els.printPreviewOverlay.hidden = false;
  renderPrintPreview();
}

function closePrintPreview() {
  els.printPreviewOverlay.hidden = true;
}

function printActivePage() {
  ensureActivePageLoadedForPrint();
  syncEditorNow();
  renderPrintPreview();
  document.body.classList.add("printing");
  clearSelectedObject();
  window.print();
  window.setTimeout(() => document.body.classList.remove("printing"), 1000);
}

function renderPrintPreview() {
  const page = activePage();
  if (!page || !els.printPreviewPages) return;
  ensureActivePageLoadedForPrint();
  syncEditorNow();
  applyPaperSize(page.paperSize);
  renderWidgets();
  els.printPreviewPages.innerHTML = "";
  const setup = normalizePageSetup(page.pageSetup);
  const sourceNodes = printableEditorNodes().map(cloneNodeForPrint);
  if (!sourceNodes.length) sourceNodes.push(document.createElement("p"));
  const groups = groupPageFlowNodes(sourceNodes);
  const pages = [];
  let previewPage = createPreviewPage(pages.length + 1, setup);
  pages.push(previewPage);
  els.printPreviewPages.appendChild(previewPage.shell);
  groups.forEach((group) => {
    appendNodeGroup(previewPage.body, group);
    if (previewPage.body.scrollHeight > previewPage.body.clientHeight + 4 && previewPage.body.childNodes.length > group.length) {
      removeNodeGroup(group);
      previewPage = createPreviewPage(pages.length + 1, setup);
      pages.push(previewPage);
      els.printPreviewPages.appendChild(previewPage.shell);
      appendNodeGroup(previewPage.body, group);
    }
  });
  pages.forEach((entry, index) => updatePreviewPageChrome(entry.shell, index + 1, pages.length, setup));
  els.printPreviewSummary.textContent = `${pages.length} page${pages.length === 1 ? "" : "s"} - ${PAPER_SIZES[paperSizeKey(page.paperSize)].label}`;
  if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([els.printPreviewPages]).catch(() => {});
}

function ensureActivePageLoadedForPrint() {
  const page = activePage();
  if (page && els.editor.dataset.pageId !== page.id) loadActivePageIntoEditor();
}

function printableEditorNodes() {
  return [...els.editor.childNodes].filter((node) => {
    return !(node.nodeType === Node.ELEMENT_NODE && (node.classList.contains("auto-page-break") || node.classList.contains("manual-page-break")));
  });
}

function appendNodeGroup(parent, group) {
  group.forEach((node) => parent.appendChild(node));
}

function removeNodeGroup(group) {
  group.forEach((node) => node.parentNode?.removeChild(node));
}

function groupPageFlowNodes(nodes) {
  const groups = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const group = [node];
    if (isHeadingNode(node)) {
      let cursor = index + 1;
      let capturedSignificantBlock = false;
      while (cursor < nodes.length && !isHeadingNode(nodes[cursor]) && group.length < 4) {
        group.push(nodes[cursor]);
        if (isAnchoringPrintBlock(nodes[cursor])) {
          capturedSignificantBlock = true;
          break;
        }
        cursor += 1;
      }
      if (capturedSignificantBlock) index += group.length - 1;
    }
    groups.push(group);
  }
  return groups;
}

function isHeadingNode(node) {
  return node?.nodeType === Node.ELEMENT_NODE && /^H[1-3]$/.test(node.tagName);
}

function isAnchoringPrintBlock(node) {
  return node?.nodeType === Node.ELEMENT_NODE && (
    node.classList.contains("retro-widget") ||
    node.classList.contains("image-figure") ||
    node.matches("table, ul, ol, blockquote")
  );
}

function cloneNodeForPrint(node) {
  const clone = node.cloneNode(true);
  if (node.nodeType !== Node.ELEMENT_NODE) return clone;
  clone.querySelectorAll?.(".widget-actions, .graph-rotate-actions, .image-resize-controls, .auto-page-break").forEach((actions) => actions.remove());
  const sourceCanvases = node.matches?.("canvas") ? [node] : [...node.querySelectorAll("canvas")];
  const cloneCanvases = clone.matches?.("canvas") ? [clone] : [...clone.querySelectorAll("canvas")];
  sourceCanvases.forEach((canvas, index) => {
    const target = cloneCanvases[index];
    if (!target) return;
    const image = document.createElement("img");
    image.className = `${canvas.className || ""} print-canvas-image`.trim();
    try {
      image.src = canvas.toDataURL("image/png");
    } catch {
      image.alt = "Canvas preview unavailable";
    }
    const rect = canvas.getBoundingClientRect();
    if (rect.height) image.style.height = `${Math.round(rect.height)}px`;
    target.replaceWith(image);
  });
  return clone;
}

function createPreviewPage(pageNumber, setup) {
  const shell = document.createElement("article");
  shell.className = "print-page";
  shell.innerHTML = `
    <div class="print-header"></div>
    <div class="print-page-number"></div>
    <div class="print-body"></div>
    <div class="print-footer"></div>
  `;
  updatePreviewPageChrome(shell, pageNumber, pageNumber, setup);
  return { shell, body: shell.querySelector(".print-body") };
}

function updatePreviewPageChrome(shell, pageNumber, totalPages, setup) {
  const header = shell.querySelector(".print-header");
  const footer = shell.querySelector(".print-footer");
  const number = shell.querySelector(".print-page-number");
  header.textContent = setup.header;
  footer.textContent = setup.footer;
  header.dataset.align = setup.headerAlign;
  footer.dataset.align = setup.footerAlign;
  number.textContent = pageNumberText(pageNumber, totalPages, setup);
  number.dataset.position = setup.pageNumberPosition;
}

function pageNumberText(pageNumber, totalPages, setup) {
  if (setup.pageNumberPosition === "none") return "";
  return setup.pageNumberTotal ? `Page ${pageNumber} of ${totalPages}` : String(pageNumber);
}

function exportNotebook() {
  syncEditorNow();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "retro-notebook-export.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function handleMenu(action) {
  const actions = menuActions();
  await actions[action]?.();
}

function showAppMenu(button) {
  const name = button.dataset.menuName;
  const items = appMenuItems()[name] || [];
  if (!items.length) return;
  document.querySelectorAll("[data-menu-name]").forEach((item) => item.classList.toggle("active", item === button));
  els.appMenu.innerHTML = "";
  items.forEach((item) => {
    if (item.separator) {
      els.appMenu.appendChild(document.createElement("hr"));
      return;
    }
    const node = document.createElement("button");
    node.type = "button";
    node.innerHTML = `<span>${escapeHtml(item.label)}</span>${item.shortcut ? `<small>${escapeHtml(item.shortcut)}</small>` : ""}`;
    node.disabled = Boolean(item.disabled);
    node.addEventListener("click", async () => {
      hideAppMenu();
      await handleMenu(item.action);
    });
    els.appMenu.appendChild(node);
  });
  const rect = button.getBoundingClientRect();
  els.appMenu.hidden = false;
  els.appMenu.style.left = `${Math.min(rect.left, window.innerWidth - 230)}px`;
  els.appMenu.style.top = `${rect.bottom}px`;
}

function hideAppMenu() {
  els.appMenu.hidden = true;
  document.querySelectorAll("[data-menu-name]").forEach((item) => item.classList.remove("active"));
}

function appMenuItems() {
  return {
    file: [
      { label: "New Page", shortcut: "Ctrl+N", action: "newPage" },
      { label: "New Folder", action: "newFolder" },
      { label: "New Notebook", action: "newNotebook" },
      { separator: true },
      { label: "Duplicate Page", action: "duplicatePage" },
      { label: "Delete Page", action: "deletePage" },
      { separator: true },
      { label: "Print Page", shortcut: "Ctrl+P", action: "printPage" },
      { label: "Export Notebook", action: "exportNotebook" }
    ],
    edit: [
      { label: "Undo", shortcut: "Ctrl+Z", action: "undo" },
      { label: "Redo", shortcut: "Ctrl+Y", action: "redo" },
      { separator: true },
      { label: "Cut", shortcut: "Ctrl+X", action: "cut" },
      { label: "Copy", shortcut: "Ctrl+C", action: "copy" },
      { label: "Paste", shortcut: "Ctrl+V", action: "paste" },
      { label: "Paste Image", action: "pasteImage" },
      { separator: true },
      { label: "Select All", shortcut: "Ctrl+A", action: "selectAll" },
      { label: "Find Pages", shortcut: "Ctrl+F", action: "find" }
    ],
    view: [
      { label: "Overview", action: "overview" },
      { label: "Calendar", action: "calendar" },
      { label: "Page Setup", action: "pageSetup" },
      { label: "LaTeX", action: "latex" },
      { label: "Templates", action: "templates" },
      { label: "Phrases", action: "phrases" },
      { label: "Citations", action: "citations" },
      { label: "Cards", action: "cards" },
      { label: "Review", action: "review" },
      { separator: true },
      { label: "Focus Page", action: "focusPage" }
    ],
    insert: [
      { label: "Picture...", action: "insertImage" },
      { label: "Hyperlink...", action: "hyperlink" },
      { label: "Equation", action: "equation" },
      { label: "Symbol...", action: "symbol" },
      { label: "Table", action: "table" },
      { label: "Chart", action: "chart" },
      { label: "3D / Data Graph", action: "graph" },
      { label: "Drawing Pad", action: "drawing" },
      { separator: true },
      { label: "Divider", action: "divider" },
      { label: "Glossary", action: "glossary" },
      { label: "Tag List", action: "tagList" }
    ],
    format: [
      { label: "Bold", shortcut: "Ctrl+B", action: "bold" },
      { label: "Italic", shortcut: "Ctrl+I", action: "italic" },
      { label: "Underline", shortcut: "Ctrl+U", action: "underline" },
      { label: "Strikethrough", action: "strike" },
      { label: "Superscript", action: "superscript" },
      { label: "Subscript", action: "subscript" },
      { separator: true },
      { label: "Text Color...", action: "textColor" },
      { label: "Highlight...", action: "highlight" },
      { label: "Line Spacing 1.0", action: "line1" },
      { label: "Line Spacing 1.5", action: "line15" },
      { label: "Line Spacing 2.0", action: "line2" },
      { separator: true },
      { label: "Heading 1", action: "heading1" },
      { label: "Heading 2", action: "heading2" },
      { label: "Glossary Term", action: "heading3" },
      { label: "Quote", action: "quote" }
    ],
    tools: [
      { label: "LaTeX Workspace", action: "latex" },
      { label: "Template Builder", action: "templates" },
      { label: "SmartPhrases", action: "phrases" },
      { label: "Citation Manager", action: "citations" },
      { label: "Calendar", action: "calendar" },
      { label: "Spelling", action: "spellcheck" },
      { label: "Start Dictation", action: "dictation" },
      { label: "Read Selected Text", action: "speak" },
      { separator: true },
      { label: "Capture Page As Template", action: "captureTemplate" },
      { label: "Apply Page Profile", action: "applyProfile" }
    ],
    table: [
      { label: "Insert Table...", action: "table" },
      { separator: true },
      { label: "Insert Row Above", action: "tableRowAbove" },
      { label: "Insert Row Below", action: "tableRowBelow" },
      { label: "Insert Column Left", action: "tableColumnLeft" },
      { label: "Insert Column Right", action: "tableColumnRight" },
      { label: "Delete Row", action: "tableDeleteRow" },
      { label: "Delete Column", action: "tableDeleteColumn" },
      { label: "Toggle Header Row", action: "tableToggleHeader" },
      { label: "Header Color...", action: "tableHeaderColor" },
      { separator: true },
      { label: "Insert Chart...", action: "chart" },
      { label: "Insert Graph...", action: "graph" }
    ],
    study: [
      { label: "Create Flashcard From Selection", action: "makeCard" },
      { label: "Open Flashcards", action: "cards" },
      { label: "Review Due Cards", action: "review" },
      { label: "Make Cloze In Card", action: "cloze" }
    ],
    help: [
      { label: "Retro Notebook Help", action: "help" },
      { label: "Open Tutorial Notebook", action: "tutorial" }
    ]
  };
}

function menuActions() {
  return {
    newPage: createPage,
    newFolder: createFolder,
    newNotebook: createNotebook,
    duplicatePage: duplicateActivePage,
    deletePage: deleteActivePage,
    printPage: printActivePage,
    exportNotebook,
    undo: () => exec("undo"),
    redo: () => exec("redo"),
    cut: () => document.execCommand("cut"),
    copy: () => document.execCommand("copy"),
    paste: pasteTextFromClipboard,
    pasteImage: pasteImageFromClipboard,
    selectAll: () => document.execCommand("selectAll"),
    find: focusSearch,
    overview: () => switchMainTab("dashboard"),
    calendar: () => switchMainTab("calendar"),
    pageSetup: openPageSetupDialog,
    latex: () => switchMainTab("latex"),
    templates: () => switchMainTab("insert"),
    phrases: () => switchMainTab("phrases"),
    citations: () => switchMainTab("citations"),
    cards: () => switchMainTab("flashcards"),
    review: () => switchMainTab("review"),
    focusPage: () => withRichEditor(els.editor, () => els.editor.focus()),
    insertImage,
    hyperlink: insertHyperlink,
    equation: insertSelectedEquation,
    symbol: openSymbolDialog,
    table: insertTable,
    tableRowAbove: () => runTableAction("tableRowAbove"),
    tableRowBelow: () => runTableAction("tableRowBelow"),
    tableColumnLeft: () => runTableAction("tableColumnLeft"),
    tableColumnRight: () => runTableAction("tableColumnRight"),
    tableDeleteRow: () => runTableAction("tableDeleteRow"),
    tableDeleteColumn: () => runTableAction("tableDeleteColumn"),
    tableToggleHeader: () => runTableAction("tableToggleHeader"),
    tableHeaderColor: () => runTableAction("tableHeaderColor"),
    chart: insertChart,
    graph: insertGraph,
    drawing: insertDrawing,
    divider: insertDivider,
    glossary: insertFullGlossary,
    tagList: insertTagList,
    bold: () => exec("bold"),
    italic: () => exec("italic"),
    underline: () => exec("underline"),
    strike: () => exec("strikeThrough"),
    superscript: () => exec("superscript"),
    subscript: () => exec("subscript"),
    textColor: () => showColorMenu("text", els.textColorBtn),
    highlight: () => showColorMenu("highlight", els.highlightColorBtn),
    line1: () => setLineSpacing("1"),
    line15: () => setLineSpacing("1.5"),
    line2: () => setLineSpacing("2"),
    heading1: () => exec("formatBlock", "h1"),
    heading2: () => exec("formatBlock", "h2"),
    heading3: () => exec("formatBlock", "h3"),
    quote: () => exec("formatBlock", "blockquote"),
    captureTemplate: captureCurrentPageAsTemplate,
    applyProfile,
    spellcheck: showSpellcheckHelp,
    dictation: toggleDictation,
    speak: speakSelection,
    makeCard: makeCardFromSelection,
    cloze: makeClozeFromCardSelection,
    tutorial: () => {
      const page = state.pages.find((item) => item.title.includes("Retro Notebook Tutorial"));
      if (page) {
        selectPage(page.id);
        switchMainTab("dashboard");
      }
    },
    help: () =>
      retroAlert(
        "Retro Notebook Studio",
        "Use the binder for notebooks, folders, and pages. Use the top menus for File, Edit, Insert, Format, Table, Study, and workspace navigation.",
        "info"
      )
  };
}

function renderSmartPhrases() {
  els.smartPhraseList.innerHTML = "";
  const query = String(els.phraseSearchInput?.value || "").trim().toLowerCase().replace(/^\//, "");
  const phrases = state.smartPhrases.filter((phrase) => `${phrase.trigger} ${textFromHtml(phrase.expansion)}`.toLowerCase().includes(query));
  if (!state.smartPhrases.length) {
    els.smartPhraseList.innerHTML = "<p class=\"fine-print\">No smartphrases yet.</p>";
    return;
  }
  if (!phrases.length) {
    els.smartPhraseList.innerHTML = "<p class=\"fine-print\">No smartphrases match that search.</p>";
    return;
  }
  phrases.forEach((phrase) => {
    const row = document.createElement("div");
    row.className = "dashboard-row phrase-row";
    row.innerHTML = `
      <span>
        <strong>/${escapeHtml(phrase.trigger)}</strong>
        <small>${escapeHtml(textFromHtml(phrase.expansion)).slice(0, 90)}</small>
      </span>
      <span class="equation-actions">
        <button data-phrase-load="${phrase.id}">Edit</button>
        <button data-phrase-insert="${phrase.id}">Insert</button>
      </span>
    `;
    row.querySelector("[data-phrase-load]").addEventListener("click", () => loadSmartPhrase(phrase.id));
    row.querySelector("[data-phrase-insert]").addEventListener("click", () => {
      insertHtml(safeHtml(phrase.expansion));
      setStatus(`Inserted /${phrase.trigger}.`);
    });
    els.smartPhraseList.appendChild(row);
  });
}

function newSmartPhraseDraft() {
  editingPhraseId = null;
  els.phraseTriggerInput.value = "/";
  els.phraseExpansionEditor.innerHTML = "<p></p>";
  els.phraseTriggerInput.focus();
}

function loadSmartPhrase(id) {
  const phrase = state.smartPhrases.find((item) => item.id === id);
  if (!phrase) return;
  editingPhraseId = id;
  els.phraseTriggerInput.value = `/${phrase.trigger}`;
  els.phraseExpansionEditor.innerHTML = safeHtml(phrase.expansion);
}

function saveSmartPhrase() {
  const trigger = normalizeSmartPhraseTrigger(els.phraseTriggerInput.value);
  const expansion = safeHtml(els.phraseExpansionEditor.innerHTML);
  if (!trigger || !textFromHtml(expansion)) {
    setStatus("Smartphrases need a trigger and expansion.");
    return;
  }
  const duplicate = state.smartPhrases.find((phrase) => phrase.trigger === trigger && phrase.id !== editingPhraseId);
  if (duplicate) {
    setStatus(`/${trigger} already exists.`);
    return;
  }
  const existing = state.smartPhrases.find((phrase) => phrase.id === editingPhraseId);
  if (existing) {
    existing.trigger = trigger;
    existing.expansion = expansion;
    existing.updatedAt = Date.now();
  } else {
    editingPhraseId = uid();
    state.smartPhrases.unshift({ id: editingPhraseId, trigger, expansion, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveState();
  renderSmartPhrases();
  setStatus(`SmartPhrase /${trigger} saved.`);
}

async function deleteSelectedSmartPhrase() {
  if (!editingPhraseId) {
    setStatus("Select a smartphrase first.");
    return;
  }
  const phrase = state.smartPhrases.find((item) => item.id === editingPhraseId);
  if (!phrase) return;
  const ok = await retroConfirm("Delete SmartPhrase", `Delete /${phrase.trigger}?`, "warning");
  if (!ok) return;
  state.smartPhrases = state.smartPhrases.filter((item) => item.id !== editingPhraseId);
  editingPhraseId = null;
  newSmartPhraseDraft();
  saveState();
  renderSmartPhrases();
  setStatus(`SmartPhrase /${phrase.trigger} deleted.`);
}

function renderCitationManager() {
  if (!els.citationList) return;
  els.citationStyleSelect.value = state.citationStyle || "apa";
  els.citationCustomFormatInput.value = state.citationCustomFormat || "";
  if (!selectedCitationId && state.citations.length) selectedCitationId = state.citations[0].id;
  if (selectedCitationId && !state.citations.some((citation) => citation.id === selectedCitationId)) selectedCitationId = state.citations[0]?.id || null;
  const selected = state.citations.find((citation) => citation.id === selectedCitationId);
  loadCitationDraft(selected || blankCitation());
  els.citationList.innerHTML = "";
  if (!state.citations.length) {
    els.citationList.innerHTML = "<p class=\"fine-print\">No citations yet. Add an article, DOI, link, or PDF.</p>";
    return;
  }
  citationOrderForPage().forEach((citation, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "citation-row" + (citation.id === selectedCitationId ? " active" : "");
    row.innerHTML = `
      <strong>${index + 1}. ${escapeHtml(citation.title || "Untitled source")}</strong>
      <small>${escapeHtml(citation.authors || "Unknown author")} - ${escapeHtml(citation.year || "n.d.")}</small>
      <span>${escapeHtml(formatCitation(citation, state.citationStyle, true))}</span>
      ${citation.pdfName ? `<em>${escapeHtml(citation.pdfName)}</em>` : ""}
    `;
    row.addEventListener("click", () => {
      selectedCitationId = citation.id;
      renderCitationManager();
    });
    els.citationList.appendChild(row);
  });
}

function blankCitation() {
  return { id: "", title: "", authors: "", year: "", journal: "", doi: "", url: "", notes: "", pdfName: "", pdfDataUrl: "", pdfBlobId: "" };
}

function loadCitationDraft(citation) {
  els.citationTitleInput.value = citation.title || "";
  els.citationAuthorsInput.value = citation.authors || "";
  els.citationYearInput.value = citation.year || "";
  els.citationJournalInput.value = citation.journal || "";
  els.citationDoiInput.value = citation.doi || "";
  els.citationUrlInput.value = citation.url || "";
  els.citationNotesInput.value = citation.notes || "";
  els.citationPdfBtn.textContent = citation.pdfName ? `PDF: ${citation.pdfName.slice(0, 22)}` : "Attach PDF";
  renderCitationPdfPreview(citation);
}

async function renderCitationPdfPreview(citation) {
  if (!els.citationPdfPreview || !els.citationPdfEmpty) return;
  const src = citation?.pdfDataUrl || "";
  if (src) {
    els.citationPdfPreview.src = src;
    els.citationPdfPreview.parentElement.classList.add("has-pdf");
    return;
  }
  if (citation?.pdfBlobId) {
    els.citationPdfEmpty.textContent = `Loading "${citation.pdfName || "PDF"}"...`;
    const blob = await getPdfBlob(citation.pdfBlobId);
    if (blob) {
      if (pdfObjectUrls.has(citation.pdfBlobId)) URL.revokeObjectURL(pdfObjectUrls.get(citation.pdfBlobId));
      const objectUrl = URL.createObjectURL(blob);
      pdfObjectUrls.set(citation.pdfBlobId, objectUrl);
      els.citationPdfPreview.src = objectUrl;
      els.citationPdfPreview.parentElement.classList.add("has-pdf");
      return;
    }
  }
  els.citationPdfPreview.src = "about:blank";
  els.citationPdfPreview.parentElement.classList.remove("has-pdf");
  els.citationPdfEmpty.textContent = citation?.pdfName
    ? `Reattach "${citation.pdfName}" to restore the preview.`
    : "Attach a PDF to preview it here.";
}

function readCitationDraft() {
  const current = state.citations.find((citation) => citation.id === selectedCitationId) || blankCitation();
  return normalizeCitation({
    ...current,
    id: current.id || uid(),
    title: els.citationTitleInput.value,
    authors: els.citationAuthorsInput.value,
    year: els.citationYearInput.value,
    journal: els.citationJournalInput.value,
    doi: els.citationDoiInput.value,
    url: els.citationUrlInput.value,
    notes: els.citationNotesInput.value
  });
}

function newCitationDraft() {
  selectedCitationId = null;
  loadCitationDraft(blankCitation());
  els.citationTitleInput.focus();
  setStatus("New citation draft ready.");
}

function saveCitation() {
  const citation = readCitationDraft();
  if (!citation.title && !citation.authors && !citation.url && !citation.doi) {
    setStatus("Add at least a title, author, DOI, or URL.");
    return;
  }
  const index = state.citations.findIndex((item) => item.id === citation.id);
  if (index >= 0) state.citations[index] = citation;
  else state.citations.push(citation);
  selectedCitationId = citation.id;
  saveState();
  renumberCitations();
  renderCitationManager();
  setStatus(`Citation "${citation.title || citation.authors}" saved.`);
}

async function deleteSelectedCitation() {
  if (!selectedCitationId) return;
  const citation = state.citations.find((item) => item.id === selectedCitationId);
  if (!citation) return;
  const ok = await retroConfirm("Delete Citation", `Delete "${citation.title || citation.authors}" from the citation library?`, "warning");
  if (!ok) return;
  state.citations = state.citations.filter((item) => item.id !== selectedCitationId);
  els.editor.querySelectorAll(`[data-citation-id="${CSS.escape(selectedCitationId)}"]`).forEach((node) => node.remove());
  selectedCitationId = state.citations[0]?.id || null;
  saveState();
  renumberCitations();
  renderCitationManager();
  setStatus("Citation deleted.");
}

function updateCitationStyle() {
  state.citationStyle = CITATION_STYLES.includes(els.citationStyleSelect.value) ? els.citationStyleSelect.value : "apa";
  state.citationCustomFormat = els.citationCustomFormatInput.value || "{authors}. {title}. {journal}. {year}. {doi} {url}";
  saveState();
  renumberCitations();
  renderCitationManager();
  setStatus(`Citation style set to ${state.citationStyle.toUpperCase()}.`);
}

async function autoFillCitation() {
  const draft = readCitationDraft();
  const metadata = {};
  const doi = draft.doi || extractDoi(`${draft.url} ${draft.notes} ${draft.title}`);
  if (doi) metadata.doi = doi;
  if (draft.url || doi) {
    setStatus("Fetching citation metadata...");
    const fetched = await fetchCitationMetadata(draft.url, doi);
    Object.assign(metadata, fetched);
  }
  if (draft.pdfDataUrl || draft.pdfName) {
    Object.assign(metadata, inferCitationFromPdf(draft.pdfDataUrl, draft.pdfName));
  }
  if (draft.pdfBlobId && !draft.pdfDataUrl) {
    const blob = await getPdfBlob(draft.pdfBlobId);
    if (blob) Object.assign(metadata, inferCitationFromPdfText(await readFileHeadAsText(blob), draft.pdfName));
  }
  Object.assign(metadata, inferCitationFromUrl(draft.url || metadata.url || ""));
  const merged = mergeCitationMetadata(draft, metadata);
  loadCitationDraft(merged);
  setStatus(Object.keys(metadata).length ? "Citation fields auto-filled. Review and Save when ready." : "No metadata found. Add more fields or check the link.");
}

async function attachCitationPdf() {
  const file = els.citationPdfInput.files?.[0];
  if (!file) return;
  const current = readCitationDraft();
  current.pdfName = file.name;
  current.pdfBlobId = current.pdfBlobId || current.id || uid();
  current.pdfDataUrl = "";
  const text = await readFileHeadAsText(file);
  Object.assign(current, mergeCitationMetadata(current, inferCitationFromPdfText(text, file.name)));
  try {
    await putPdfBlob(current.pdfBlobId, file);
  } catch {
    setStatus("PDF storage failed. The citation was saved without a preview.");
  }
  const index = state.citations.findIndex((item) => item.id === current.id);
  if (index >= 0) state.citations[index] = current;
  else state.citations.push(current);
  selectedCitationId = current.id;
  saveState();
  renderCitationManager();
  setStatus(`Attached "${file.name}" for preview.`);
}

function insertSelectedCitation() {
  const citation = state.citations.find((item) => item.id === selectedCitationId);
  if (!citation) {
    setStatus("Save or select a citation first.");
    return;
  }
  insertHtml(citationRefHtml(citation, "?") + "&nbsp;");
  renumberCitations();
  renderCitationManager();
  setStatus("Citation inserted and reordered.");
}

function insertOrUpdateBibliography() {
  const ordered = citationOrderForPage();
  if (!ordered.length) {
    setStatus("Insert citations in the page first.");
    return;
  }
  els.editor.querySelector(".citation-bibliography")?.remove();
  const entries = ordered.map((citation) => `<li id="${referenceDomId(citation.id)}">${escapeHtml(formatCitation(citation, state.citationStyle, false))}</li>`).join("");
  els.editor.insertAdjacentHTML("beforeend", `<section class="citation-bibliography"><h1>Citations</h1><ol>${entries}</ol></section>`);
  syncEditorNow();
  renderCitationManager();
  setStatus("Bibliography inserted in citation order.");
}

function renumberCitations() {
  const order = citationIdOrderInEditor();
  els.editor.querySelectorAll(".citation-ref[data-citation-id]").forEach((node) => {
    const citation = state.citations.find((item) => item.id === node.dataset.citationId);
    const index = order.indexOf(node.dataset.citationId);
    node.classList.toggle("numeric", usesNumericCitations());
    node.innerHTML = citationInlineHtml(citation, index + 1);
    node.title = citation ? formatCitation(citation, state.citationStyle, true) : "Missing citation";
  });
  const bibliography = els.editor.querySelector(".citation-bibliography");
  if (bibliography?.querySelector("ol")) {
    const entries = citationOrderForPage().map((citation) => `<li id="${referenceDomId(citation.id)}">${escapeHtml(formatCitation(citation, state.citationStyle, false))}</li>`).join("");
    bibliography.querySelector("ol").innerHTML = entries;
  }
  syncEditorNow();
}

function citationIdOrderInEditor() {
  return unique([...els.editor.querySelectorAll(".citation-ref[data-citation-id]")].map((node) => node.dataset.citationId).filter(Boolean));
}

function citationOrderForPage() {
  const byId = new Map(state.citations.map((citation) => [citation.id, citation]));
  const inUse = citationIdOrderInEditor().map((id) => byId.get(id)).filter(Boolean);
  const unused = state.citations.filter((citation) => !inUse.some((item) => item.id === citation.id));
  return [...inUse, ...unused];
}

function citationInlineText(citation, index) {
  if (!citation) return "[?]";
  if (state.citationStyle === "apa" || state.citationStyle === "mla" || state.citationStyle === "chicago") {
    return `(${firstAuthorLastName(citation.authors) || "Source"}, ${citation.year || "n.d."})`;
  }
  return `[${index || "?"}]`;
}

function citationRefHtml(citation, index) {
  const numericClass = usesNumericCitations() ? " numeric" : "";
  return `<span class="citation-ref${numericClass}" contenteditable="false" data-citation-id="${escapeHtml(citation.id)}">${citationInlineHtml(citation, index)}</span>`;
}

function citationInlineHtml(citation, index) {
  if (!citation) return "[?]";
  if (!usesNumericCitations()) return escapeHtml(citationInlineText(citation, index));
  return `<a href="#${referenceDomId(citation.id)}">${escapeHtml(index || "?")}</a>`;
}

function usesNumericCitations() {
  return state.citationStyle === "vancouver" || state.citationStyle === "ama";
}

function referenceDomId(id) {
  return `ref-${String(id || "missing").replace(/[^a-z0-9_-]/gi, "-")}`;
}

function formatCitation(citation, style = "apa", compact = false) {
  const authors = citation.authors || "Unknown author";
  const year = citation.year || "n.d.";
  const title = citation.title || "Untitled source";
  const journal = citation.journal || "Unpublished source";
  const doi = citation.doi ? `doi:${citation.doi}` : "";
  const url = citation.url || "";
  if (style === "mla") return `${authors}. "${title}." ${journal}, ${year}. ${doi || url}`.trim();
  if (style === "chicago") return `${authors}. "${title}." ${journal} (${year}). ${doi || url}`.trim();
  if (style === "vancouver") return `${authors}. ${title}. ${journal}. ${year}. ${doi || url}`.trim();
  if (style === "ama") return `${authors}. ${title}. ${journal}. Published ${year}. ${doi || url}`.trim();
  if (style === "custom") return formatCustomCitation(citation);
  return compact
    ? `${firstAuthorLastName(authors) || authors} (${year}). ${title}.`
    : `${authors} (${year}). ${title}. ${journal}. ${doi || url}`.trim();
}

function formatCustomCitation(citation) {
  const template = state.citationCustomFormat || "{authors}. {title}. {journal}. {year}. {doi} {url}";
  return template
    .replaceAll("{authors}", citation.authors || "Unknown author")
    .replaceAll("{title}", citation.title || "Untitled source")
    .replaceAll("{journal}", citation.journal || "")
    .replaceAll("{year}", citation.year || "n.d.")
    .replaceAll("{doi}", citation.doi || "")
    .replaceAll("{url}", citation.url || "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstAuthorLastName(authors) {
  const first = String(authors || "").split(/[;,]/)[0]?.trim() || "";
  const parts = first.split(/\s+/).filter(Boolean);
  return parts.length ? parts.at(-1).replace(/[.,]/g, "") : "";
}

async function fetchCitationMetadata(url, doi) {
  const metadata = {};
  if (doi) {
    const crossref = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (crossref?.text) Object.assign(metadata, parseCrossrefMetadata(crossref.text));
  }
  const targetUrl = normalizeUrl(url || metadata.url || "");
  if (targetUrl) {
    const response = await fetchText(targetUrl);
    if (response?.text) Object.assign(metadata, parseHtmlCitationMetadata(response.text, response.url || targetUrl));
  }
  return metadata;
}

async function fetchText(url) {
  if (!url) return null;
  if (window.retroNotebook?.citation?.fetchText) {
    const result = await window.retroNotebook.citation.fetchText(url);
    return result?.ok || result?.text ? result : null;
  }
  try {
    const response = await fetch(url);
    return { ok: response.ok, status: response.status, url: response.url, text: await response.text() };
  } catch {
    return null;
  }
}

function parseCrossrefMetadata(text) {
  try {
    const item = JSON.parse(text)?.message || {};
    return {
      title: item.title?.[0] || "",
      authors: (item.author || []).map((author) => [author.given, author.family].filter(Boolean).join(" ")).join("; "),
      year: String(item.issued?.["date-parts"]?.[0]?.[0] || item.published?.["date-parts"]?.[0]?.[0] || ""),
      journal: item["container-title"]?.[0] || item.publisher || "",
      doi: item.DOI || "",
      url: item.URL || ""
    };
  } catch {
    return {};
  }
}

function parseHtmlCitationMetadata(html, fallbackUrl) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const meta = (name) =>
    doc.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[name="${name.toLowerCase()}"], meta[property="${name.toLowerCase()}"]`)?.content?.trim() || "";
  const authors = [...doc.querySelectorAll('meta[name="citation_author"], meta[name="author"], meta[property="article:author"]')]
    .map((node) => node.content?.trim())
    .filter(Boolean);
  const canonical = doc.querySelector('link[rel="canonical"]')?.href || "";
  return {
    title: meta("citation_title") || meta("og:title") || doc.querySelector("title")?.textContent?.replace(/\s+/g, " ").trim() || "",
    authors: authors.join("; "),
    year: yearFromDate(meta("citation_publication_date") || meta("article:published_time") || meta("date") || meta("dc.date")),
    journal: meta("citation_journal_title") || meta("og:site_name") || new URL(fallbackUrl).hostname.replace(/^www\./, ""),
    doi: meta("citation_doi") || extractDoi(html),
    url: meta("og:url") || canonical || fallbackUrl
  };
}

function inferCitationFromPdf(dataUrl, fileName) {
  const metadata = inferCitationFromFilename(fileName);
  const raw = pdfDataUrlToText(dataUrl);
  return inferCitationFromPdfText(raw, fileName, metadata);
}

function inferCitationFromPdfText(raw, fileName, fallback = inferCitationFromFilename(fileName)) {
  if (!raw) return fallback;
  return {
    ...fallback,
    title: pdfInfoValue(raw, "Title") || fallback.title,
    authors: pdfInfoValue(raw, "Author") || fallback.authors,
    year: yearFromDate(pdfInfoValue(raw, "CreationDate")) || fallback.year
  };
}

function inferCitationFromFilename(fileName) {
  const base = String(fileName || "").replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const year = base.match(/\b(19|20)\d{2}\b/)?.[0] || "";
  return { title: base.replace(/\b(19|20)\d{2}\b/g, "").trim(), year };
}

function inferCitationFromUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return {};
  try {
    const parsed = new URL(normalized);
    const last = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "").replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
    return {
      title: last && !/^\d+$/.test(last) ? capitalizeTitle(last) : "",
      journal: parsed.hostname.replace(/^www\./, ""),
      doi: extractDoi(normalized),
      url: normalized
    };
  } catch {
    return {};
  }
}

function mergeCitationMetadata(current, metadata) {
  const merged = { ...current };
  ["title", "authors", "year", "journal", "doi", "url"].forEach((key) => {
    if (!merged[key] && metadata[key]) merged[key] = String(metadata[key]).trim();
  });
  return normalizeCitation(merged);
}

function pdfDataUrlToText(dataUrl) {
  const match = String(dataUrl || "").match(/^data:application\/pdf[^,]*,(.+)$/);
  if (!match) return "";
  try {
    return atob(match[1]).slice(0, 120000);
  } catch {
    return "";
  }
}

function pdfInfoValue(raw, key) {
  const match = raw.match(new RegExp(`/${key}\\s*\\((.*?)\\)`, "s"));
  return match ? match[1].replace(/\\([()\\])/g, "$1").replace(/\s+/g, " ").trim() : "";
}

function readFileHeadAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => resolve(""));
    reader.readAsText(file.slice(0, 512000));
  });
}

function pdfDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("retro-notebook-pdfs", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("pdfs");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putPdfBlob(id, blob) {
  const db = await pdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pdfs", "readwrite");
    tx.objectStore("pdfs").put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPdfBlob(id) {
  if (!id) return null;
  const db = await pdfDb();
  return new Promise((resolve) => {
    const tx = db.transaction("pdfs", "readonly");
    const request = tx.objectStore("pdfs").get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

function extractDoi(value) {
  return String(value || "").match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i)?.[0] || "";
}

function yearFromDate(value) {
  return String(value || "").match(/\b(19|20)\d{2}\b/)?.[0] || "";
}

function capitalizeTitle(value) {
  return String(value || "").replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1));
}

function updatePhraseMenu() {
  if (document.activeElement !== els.editor && !els.editor.contains(document.activeElement)) return hidePhraseMenu();
  const context = slashContext();
  if (!context) return hidePhraseMenu();
  const matches = state.smartPhrases.filter((phrase) => phrase.trigger.startsWith(context.query)).slice(0, SMART_PHRASE_LIMIT);
  if (!matches.length) return hidePhraseMenu();
  phraseRange = context.range;
  els.phraseMenu.innerHTML = "";
  matches.forEach((phrase) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>/${escapeHtml(phrase.trigger)}</strong><small>${escapeHtml(textFromHtml(phrase.expansion)).slice(0, 54)}</small>`;
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      insertSmartPhrase(phrase.id);
    });
    els.phraseMenu.appendChild(button);
  });
  const rect = context.range.getBoundingClientRect();
  els.phraseMenu.hidden = false;
  els.phraseMenu.style.left = `${Math.min(rect.left || 12, window.innerWidth - 250)}px`;
  els.phraseMenu.style.top = `${Math.min((rect.bottom || 80) + 4, window.innerHeight - 180)}px`;
}

function handleEditorKeydown(event) {
  if (["Backspace", "Delete", "Enter", " "].includes(event.key)) removeAutoPageBreaks();
  if (els.phraseMenu.hidden) return;
  if (event.key === "Escape") {
    hidePhraseMenu();
    return;
  }
  if (event.key === "Enter" || event.key === "Tab") {
    const first = els.phraseMenu.querySelector("button");
    if (first) {
      event.preventDefault();
      first.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    }
  }
}

function slashContext() {
  const selection = window.getSelection();
  if (!selection.rangeCount || !selection.isCollapsed || !els.editor.contains(selection.anchorNode)) return null;
  const node = selection.anchorNode;
  if (node.nodeType !== Node.TEXT_NODE) return null;
  const before = node.textContent.slice(0, selection.anchorOffset);
  const match = before.match(/(^|\s)\/([A-Za-z0-9_-]*)$/);
  if (!match) return null;
  const slashIndex = before.length - match[2].length - 1;
  const range = selection.getRangeAt(0).cloneRange();
  range.setStart(node, slashIndex);
  return { query: match[2].toLowerCase(), range };
}

function insertSmartPhrase(id) {
  const phrase = state.smartPhrases.find((item) => item.id === id);
  if (!phrase || !phraseRange) return;
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(phraseRange);
  document.execCommand("insertHTML", false, `${safeHtml(phrase.expansion)} `);
  syncEditorNow();
  hidePhraseMenu();
  setStatus(`Expanded /${phrase.trigger}.`);
}

function hidePhraseMenu() {
  els.phraseMenu.hidden = true;
  phraseRange = null;
}

function insertFullGlossary() {
  const items = collectPageGlossaryItems();
  if (!items.length) {
    setStatus("Add headings or Glossary Term titles first.");
    return;
  }
  els.editor.querySelector(".page-glossary")?.remove();
  const html = `<section class="page-glossary" contenteditable="false"><h1>Glossary</h1><table><tbody>${items
    .map((item) => `<tr><th>${escapeHtml(item.title)}</th><td>${escapeHtml(item.description)}</td></tr>`)
    .join("")}</tbody></table></section><p></p>`;
  els.editor.insertAdjacentHTML("afterbegin", html);
  syncEditorNow();
  setStatus("Glossary inserted.");
}

function collectPageGlossaryItems() {
  return [...els.editor.querySelectorAll("h1, h2, h3")]
    .filter((heading) => !heading.closest(".page-glossary"))
    .map((heading) => {
      const descriptionNode = heading.nextElementSibling && !/^H[1-3]$/.test(heading.nextElementSibling.tagName) ? heading.nextElementSibling : null;
      return {
        title: heading.innerText.trim(),
        description: (descriptionNode?.innerText || "See section in this page.").trim().slice(0, 160)
      };
    })
    .filter((item) => item.title);
}

function showContextMenu(event) {
  const target = editableTarget(event.target);
  if (!target) return;
  event.preventDefault();
  contextTarget = target;
  contextImageSrc = event.target.closest?.(".image-figure img")?.src || "";
  contextObject = selectableObjectFromTarget(event.target);
  contextTableCell = event.target.closest?.("td, th") || null;
  if (contextTableCell) selectedTableCell = contextTableCell;
  if (contextObject) selectObject(contextObject);
  primeSpellcheckContextFromPoint(event);
  els.contextMenu.querySelectorAll(".table-context-action").forEach((item) => {
    item.hidden = !(contextObject?.tagName === "TABLE" && contextTableCell);
  });
  renderSpellcheckMenuItems(event);
  els.contextMenu.hidden = false;
  positionContextMenu(event.clientX, event.clientY);
  setTimeout(() => {
    if (els.contextMenu.hidden) return;
    renderSpellcheckMenuItems();
    positionContextMenu(event.clientX, event.clientY);
  }, 90);
  setTimeout(() => {
    if (els.contextMenu.hidden) return;
    renderSpellcheckMenuItems();
    positionContextMenu(event.clientX, event.clientY);
  }, 320);
  refreshContextSpellcheckSuggestions(event);
}

function primeSpellcheckContextFromPoint(event) {
  const info = wordInfoAtPoint(event.clientX, event.clientY);
  if (!info?.word) return;
  const lower = info.word.toLowerCase();
  const fallbackSuggestions = spellingSuggestionsFor(lower);
  spellcheckContext = {
    word: info.word,
    suggestions: fallbackSuggestions,
    x: event.clientX,
    y: event.clientY,
    at: Date.now(),
    range: info.range
  };
}

async function refreshContextSpellcheckSuggestions(event) {
  const word = spellcheckContext.word;
  if (!word) return;
  const stamp = spellcheckContext.at;
  const result = await window.retroNotebook?.spellcheck?.suggest?.(word);
  if (!result?.word || spellcheckContext.word !== word || spellcheckContext.at !== stamp || els.contextMenu.hidden) return;
  const nativeSuggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
  spellcheckContext.suggestions = unique([...nativeSuggestions, ...spellingSuggestionsFor(word, nativeSuggestions)]).slice(0, 8);
  if (result.correct && !nativeSuggestions.length && !spellingSuggestionsFor(word).length) {
    spellcheckContext.word = "";
  }
  renderSpellcheckMenuItems();
  positionContextMenu(event.clientX, event.clientY);
}

function wordInfoAtPoint(x, y) {
  const sourceRange = document.caretRangeFromPoint
    ? document.caretRangeFromPoint(x, y)
    : (() => {
        const position = document.caretPositionFromPoint?.(x, y);
        if (!position) return null;
        const range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
        return range;
      })();
  const node = sourceRange?.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const editable = editableTarget(node.parentElement);
  if (!editable || node.parentElement?.closest("code, pre, a, .latex-chip, .citation-ref, .retro-widget")) return null;
  const text = node.nodeValue || "";
  let start = sourceRange.startOffset;
  let end = sourceRange.startOffset;
  while (start > 0 && /[A-Za-z']/u.test(text[start - 1])) start -= 1;
  while (end < text.length && /[A-Za-z']/u.test(text[end])) end += 1;
  const word = text.slice(start, end).trim();
  if (word.length < 2) return null;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return { word, range };
}

function positionContextMenu(clientX, clientY) {
  const { innerWidth, innerHeight } = window;
  const width = 178;
  const spellHeight = els.spellcheckMenuItems.hidden ? 0 : Math.min(190, (spellcheckContext.suggestions.length + 2) * 24);
  const height = (contextTableCell ? 330 : 164) + spellHeight;
  els.contextMenu.style.left = `${Math.min(clientX, innerWidth - width - 4)}px`;
  els.contextMenu.style.top = `${Math.min(clientY, innerHeight - height - 4)}px`;
}

function hideContextMenu() {
  els.contextMenu.hidden = true;
  contextImageSrc = "";
  contextObject = null;
  contextTableCell = null;
}

function renderSpellcheckMenuItems(event = null) {
  const closeEnough = !event
    || (Math.abs((spellcheckContext.x || 0) - event.clientX) <= 24 && Math.abs((spellcheckContext.y || 0) - event.clientY) <= 24)
    || Date.now() - spellcheckContext.at < 350;
  const word = closeEnough ? spellcheckContext.word : "";
  if (!word) {
    els.spellcheckMenuItems.hidden = true;
    els.spellcheckMenuItems.innerHTML = "";
    return;
  }
  const mergedSuggestions = spellingSuggestionsFor(word, spellcheckContext.suggestions);
  const suggestions = mergedSuggestions.length
    ? mergedSuggestions.map((suggestion) => `<button type="button" data-spell-replace="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`).join("")
    : "<button type=\"button\" disabled>No spelling suggestions</button>";
  els.spellcheckMenuItems.hidden = false;
  els.spellcheckMenuItems.innerHTML = `
    <button type="button" disabled>Spelling: ${escapeHtml(word)}</button>
    ${suggestions}
    <button type="button" data-context-action="spellAdd">Add "${escapeHtml(word)}" to dictionary</button>
    <button type="button" data-context-action="spellManage">Open spelling tool...</button>
    <hr />
  `;
  els.spellcheckMenuItems.querySelectorAll("[data-spell-replace]").forEach((button) => {
    button.addEventListener("click", async () => {
      await replaceMisspelling(button.dataset.spellReplace);
      hideContextMenu();
    });
  });
  els.spellcheckMenuItems.querySelector("[data-context-action='spellAdd']")?.addEventListener("click", async () => {
    await addWordToDictionary(word);
    hideContextMenu();
  });
  els.spellcheckMenuItems.querySelector("[data-context-action='spellManage']")?.addEventListener("click", () => {
    hideContextMenu();
    openSpellcheckTool();
  });
}

function showBinderContextMenu(event, type, id) {
  event.preventDefault();
  event.stopPropagation();
  binderContext = { type, id };
  const target = binderTarget(type, id);
  const favoriteButton = els.binderContextMenu.querySelector("[data-binder-action='favorite']");
  if (favoriteButton) favoriteButton.textContent = target?.favorite ? "Unfavorite" : "Favorite";
  const newPageButton = els.binderContextMenu.querySelector("[data-binder-action='newPage']");
  if (newPageButton) newPageButton.hidden = type !== "folder";
  const addPdfButton = els.binderContextMenu.querySelector("[data-binder-action='addPdf']");
  if (addPdfButton) addPdfButton.hidden = type !== "folder";
  els.binderContextMenu.hidden = false;
  const { innerWidth, innerHeight } = window;
  els.binderContextMenu.style.left = `${Math.min(event.clientX, innerWidth - 150)}px`;
  els.binderContextMenu.style.top = `${Math.min(event.clientY, innerHeight - 170)}px`;
}

function hideBinderContextMenu() {
  els.binderContextMenu.hidden = true;
  binderContext = null;
}

async function runBinderContextAction(action) {
  if (!binderContext) return;
  const { type, id } = binderContext;
  hideBinderContextMenu();
  if (action === "favorite") {
    const item = binderTarget(type, id);
    if (!item) return;
    item.favorite = !item.favorite;
    saveState();
    renderBinder();
    setStatus(item.favorite ? "Added to favorites." : "Removed from favorites.");
  } else if (action === "rename") {
    if (type === "folder") await renameFolderById(id);
    else if (type === "pdf") await renamePdfById(id);
    else await renamePageById(id);
  } else if (action === "newPage" && type === "folder") {
    selectedFolderId = id;
    createPage();
  } else if (action === "addPdf" && type === "folder") {
    addPdfToFolder(id);
  } else if (action === "delete") {
    if (type === "page") await deletePageById(id);
    else if (type === "pdf") await deletePdfById(id);
    else await deleteFolderById(id);
  }
}

function binderTarget(type, id) {
  if (type === "page") return state.pages.find((page) => page.id === id);
  if (type === "pdf") return state.pdfs.find((pdf) => pdf.id === id);
  return state.folders.find((folder) => folder.id === id);
}

async function runContextAction(action) {
  if (!contextTarget) return;
  contextTarget.focus();
  if (action === "paste") {
    const text = window.retroNotebook?.clipboard?.readText ? window.retroNotebook.clipboard.readText() : "";
    document.execCommand("insertText", false, text);
  } else if (action === "pasteImage") {
    if (!contextTarget.isContentEditable) {
      setStatus("Images can be pasted into rich note areas.");
      hideContextMenu();
      return;
    }
    pasteImageFromClipboard(contextTarget);
  } else if (action === "copy") {
    const selection = window.getSelection().toString();
    if (selection && window.retroNotebook?.clipboard?.writeText) window.retroNotebook.clipboard.writeText(selection);
    document.execCommand("copy");
  } else if (action === "copyImage") {
    copyImageToClipboard(contextImageSrc);
  } else if (action === "link") {
    await insertHyperlink();
  } else if (action === "editObject") {
    await editSelectedObject(contextObject || selectedObject);
  } else if (action === "deleteObject") {
    await deleteSelectedObject(contextObject || selectedObject);
  } else if (action.startsWith("table")) {
    runTableAction(action, contextTableCell);
  } else if (action === "cut") {
    const selection = window.getSelection().toString();
    if (selection && window.retroNotebook?.clipboard?.writeText) window.retroNotebook.clipboard.writeText(selection);
    document.execCommand("cut");
  } else if (action === "selectAll") {
    document.execCommand("selectAll");
  }
  syncRichEditor(contextTarget);
  hideContextMenu();
}

async function replaceMisspelling(suggestion) {
  let ok = spellcheckContext.range ? replaceSpellcheckRange(suggestion) : false;
  if (!ok) ok = await window.retroNotebook?.spellcheck?.replace?.(suggestion);
  setStatus(ok ? `Replaced with "${suggestion}".` : "Could not replace misspelling.");
}

function replaceSpellcheckRange(suggestion) {
  const range = spellcheckContext.range;
  if (!range) return false;
  try {
    const owner = objectOwner(range.commonAncestorContainer?.parentElement || contextTarget);
    range.deleteContents();
    const text = document.createTextNode(String(suggestion || ""));
    range.insertNode(text);
    const selection = window.getSelection();
    const after = document.createRange();
    after.setStartAfter(text);
    after.collapse(true);
    selection.removeAllRanges();
    selection.addRange(after);
    if (owner) {
      rememberSelectionForTarget(owner);
      syncRichEditor(owner);
    }
    return true;
  } catch {
    return false;
  }
}

async function addWordToDictionary(word) {
  addCustomDictionaryWord(word);
  await window.retroNotebook?.spellcheck?.addToDictionary?.(word);
}

function editableTarget(target) {
  const editable = target.closest?.("input, textarea, [contenteditable='true']");
  return editable || null;
}

function activeNotebookName() {
  return state.notebooks.includes(state.activeNotebook) ? state.activeNotebook : activePage()?.notebook || state.notebooks[0] || "Tutorial";
}

function notebookColor(notebook) {
  return state.notebookColors?.[notebook] || NOTEBOOK_COLORS[state.notebooks.indexOf(notebook) % NOTEBOOK_COLORS.length] || NOTEBOOK_COLORS[0];
}

function nextNotebookColor() {
  return NOTEBOOK_COLORS[state.notebooks.length % NOTEBOOK_COLORS.length];
}

function notebookExists(name) {
  return state.notebooks.some((notebook) => notebook.toLowerCase() === name.toLowerCase());
}

function activePage() {
  return state.pages.find((page) => page.id === activeId) || state.pages[0];
}

function activePdf() {
  return state.pdfs?.find((pdf) => pdf.id === activePdfId) || null;
}

function makeBlankPage(notebook, folderId) {
  return {
    id: uid(),
    title: "Untitled page",
    notebook,
    folderId,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    documentType: "lecture",
    goal: "",
    paperSize: "letter",
    pageSetup: normalizePageSetup(),
    favorite: false,
    content: "<h1>Untitled page</h1><p></p>",
    plain: "",
    cards: []
  };
}

function syncEditorNow() {
  const page = loadedEditorPage();
  if (!page || !els.editor) return;
  clearFindMarks();
  page.content = cleanRichHtml(els.editor);
  page.plain = cleanRichText(els.editor);
  page.paperSize = paperSizeKey(els.paperSizeSelect?.value || page.paperSize);
  if (els.pageHeaderInput && page.id === activePage()?.id) page.pageSetup = readPageSetupControls();
  page.updatedAt = Date.now();
  saveState();
  renderStats();
}

function loadedEditorPage() {
  const loadedId = els.editor?.dataset.pageId;
  return state.pages.find((page) => page.id === loadedId) || activePage();
}

function cleanRichHtml(root) {
  const clone = root.cloneNode(true);
  removeTransientEditorNodes(clone);
  return clone.innerHTML;
}

function cleanRichText(root) {
  const clone = root.cloneNode(true);
  removeTransientEditorNodes(clone);
  return clone.innerText || clone.textContent || "";
}

function removeTransientEditorNodes(root) {
  root.querySelectorAll?.(".auto-page-break, .manual-page-break, .image-resize-controls, mark.find-mark").forEach((node) => {
    if (node.matches?.("mark.find-mark")) {
      node.replaceWith(document.createTextNode(node.textContent));
    } else {
      node.remove();
    }
  });
}

function removeAutoPageBreaks() {
  if (!els.editor) return;
  clearTimeout(paginationTimer);
  els.editor.querySelectorAll(".auto-page-break").forEach((node) => node.remove());
}

function stripStoredPageBreaks(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  template.content.querySelectorAll(".manual-page-break, .auto-page-break").forEach((marker) => {
    const next = marker.nextElementSibling;
    marker.remove();
    if (next?.tagName === "P" && !next.textContent.trim() && next.innerHTML.replace(/<br\s*\/?>/gi, "").trim() === "") next.remove();
  });
  return template.innerHTML;
}

function scheduleAutoPagination() {
  if (!els.editor || !document.body.contains(els.editor)) return;
  clearTimeout(paginationTimer);
  paginationTimer = setTimeout(paginateEditor, 220);
}

function paginateEditor() {
  if (!els.editor || paginatingEditor) return;
  paginatingEditor = true;
  try {
    els.editor.querySelectorAll(".auto-page-break").forEach((node) => node.remove());
    const style = getComputedStyle(document.documentElement);
    const pageHeight = cssLengthToPixels(style.getPropertyValue("--paper-height")) || 1056;
    const padY = cssLengthToPixels(style.getPropertyValue("--paper-padding-y")) || 52;
    const usablePageHeight = Math.max(160, pageHeight - padY * 2);
    let nextBreakAt = usablePageHeight;
    const contentTop = els.editor.firstElementChild?.offsetTop || 0;
    const groups = groupPageFlowNodes([...els.editor.children].filter((child) => !child.classList.contains("auto-page-break")));
    groups.forEach((group) => {
      const first = group[0];
      const last = group[group.length - 1];
      if (!first || first === els.editor.firstElementChild) return;
      const bottom = last.offsetTop + last.offsetHeight - contentTop;
      if (bottom <= nextBreakAt) return;
      const marker = document.createElement("div");
      marker.className = "auto-page-break";
      marker.contentEditable = "false";
      marker.setAttribute("aria-label", "Automatic page break");
      first.before(marker);
      nextBreakAt = marker.offsetTop + marker.offsetHeight - contentTop + usablePageHeight;
    });
  } finally {
    paginatingEditor = false;
  }
}

function dueCards() {
  const now = Date.now();
  return state.pages
    .flatMap((page) => page.cards.map((card) => ({ card, page })))
    .filter(({ card }) => card.due <= now)
    .sort((a, b) => a.card.due - b.card.due);
}

function renderWidgets(root = document) {
  root.querySelectorAll(".retro-widget").forEach(ensureWidgetControls);
  root.querySelectorAll(".chart-widget").forEach(renderChartWidget);
  root.querySelectorAll(".graph-widget").forEach(renderGraphWidget);
  root.querySelectorAll(".draw-widget").forEach(renderDrawWidget);
}

function ensureWidgetControls(widget) {
  const title = widget.querySelector(".widget-title");
  if (!title) return;
  const hadActions = title.querySelector(".widget-actions");
  const hadRotation = title.querySelector(".graph-rotate-actions");
  let isRotatableGraph = false;
  if (widget.classList.contains("chart-widget") || widget.classList.contains("graph-widget")) {
    const data = widget.classList.contains("chart-widget")
      ? decodeDataSet(widget.dataset.chart, "chart")
      : decodeDataSet(widget.dataset.graph, "graph");
    isRotatableGraph = widget.classList.contains("graph-widget") && is3DGraphData(data);
    title.innerHTML = dataWidgetTitleInnerHtml(data);
    if (hadRotation && isRotatableGraph) title.appendChild(hadRotation);
    if (hadActions) title.appendChild(hadActions);
  }
  if (!title.querySelector(".widget-actions")) title.insertAdjacentHTML("beforeend", widgetActions(!widget.classList.contains("draw-widget")));
  if (isRotatableGraph && !title.querySelector(".graph-rotate-actions")) {
    const actions = title.querySelector(".widget-actions");
    actions.insertAdjacentHTML("beforebegin", graphRotateActions());
  }
}

function widgetActions(canEdit = true) {
  return `<span class="widget-actions">${canEdit ? "<button type=\"button\" data-widget-action=\"edit\">Edit</button>" : ""}<button type=\"button\" data-widget-action=\"delete\">Delete</button></span>`;
}

function dataWidgetTitleHtml(data) {
  return `<div class="widget-title">${dataWidgetTitleInnerHtml(data)}${widgetActions()}</div>`;
}

function dataWidgetTitleInnerHtml(data) {
  return `<span class="widget-name">${escapeHtml(data.title)}</span>`;
}

function graphRotateActions() {
  return `
    <span class="graph-rotate-actions" aria-label="3D graph rotation">
      <button type="button" data-graph-rotate="left" title="Rotate left">◄</button>
      <button type="button" data-graph-rotate="right" title="Rotate right">►</button>
      <button type="button" data-graph-rotate="up" title="Tilt up">▲</button>
      <button type="button" data-graph-rotate="down" title="Tilt down">▼</button>
      <button type="button" data-graph-rotate="zoomOut" title="Zoom out">-</button>
      <button type="button" data-graph-rotate="zoomIn" title="Zoom in">+</button>
      <button type="button" data-graph-rotate="reset" title="Fit view">Fit</button>
    </span>
  `;
}

async function handleWidgetAction(event) {
  const button = event.target.closest("[data-widget-action]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const widget = button.closest(".retro-widget");
  if (!widget) return;
  const owner = widget.closest("#editor, #templateEditor, #phraseExpansionEditor, #cardFront, #cardBack") || els.editor;

  if (button.dataset.widgetAction === "delete") {
    const ok = await retroConfirm("Delete Object", "Remove this inserted object from the page?", "warning");
    if (!ok) return;
    const next = widget.nextElementSibling;
    widget.remove();
    if (next?.tagName === "P" && !next.textContent.trim()) next.remove();
    syncRichEditor(owner);
    setStatus("Inserted object deleted.");
    return;
  }

  await editDataObject(widget);
}

function handleGraphRotate(event) {
  const button = event.target.closest("[data-graph-rotate]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const widget = button.closest(".graph-widget");
  if (!widget) return;
  const current = graphRotation(widget);
  const step = 0.22;
  const action = button.dataset.graphRotate;
  const next = action === "reset"
    ? { yaw: 0.75, pitch: -0.25, zoom: 0.58 }
    : {
        yaw: current.yaw + (action === "left" ? -step : action === "right" ? step : 0),
        pitch: clamp(current.pitch + (action === "up" ? -step : action === "down" ? step : 0), -0.85, 0.85),
        zoom: clamp(current.zoom * (action === "zoomOut" ? 0.82 : action === "zoomIn" ? 1.18 : 1), 0.3, 1.35)
      };
  widget.dataset.rotation = JSON.stringify(next);
  renderGraphWidget(widget, false);
  syncRichEditor(objectOwner(widget));
}

async function editDataObject(widget) {
  const owner = objectOwner(widget);
  if (widget.classList.contains("chart-widget")) {
    const current = decodeDataSet(widget.dataset.chart, "chart");
    const data = await openDataGridDialog("Edit Chart", current, "chart");
    if (!data) return;
    widget.dataset.chart = encodeDataSet(data);
    updateDataWidgetTitle(widget, data);
    renderChartWidget(widget);
    syncRichEditor(owner);
    setStatus("Chart updated.");
  } else if (widget.classList.contains("graph-widget")) {
    const current = decodeDataSet(widget.dataset.graph, "graph");
    const data = await openDataGridDialog("Edit Graph", current, "graph");
    if (!data) return;
    widget.dataset.graph = encodeDataSet(data);
    updateDataWidgetTitle(widget, data);
    renderGraphWidget(widget);
    syncRichEditor(owner);
    setStatus("Graph updated.");
  }
}

function updateDataWidgetTitle(widget, data) {
  const title = widget.querySelector(".widget-title");
  if (!title) return;
  const actions = title.querySelector(".widget-actions");
  title.innerHTML = dataWidgetTitleInnerHtml(data);
  if (actions) title.appendChild(actions);
}

function renderChartWidget(widget) {
  const data = decodeDataSet(widget.dataset.chart, "chart");
  const canvas = widget.querySelector("canvas");
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    if (widget.offsetParent && !canvas.dataset.renderRetry) {
      canvas.dataset.renderRetry = "true";
      requestAnimationFrame(() => {
        delete canvas.dataset.renderRetry;
        renderChartWidget(widget);
      });
    }
    return;
  }
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  drawChartByType(ctx, data, w, h);
}

function drawChartByType(ctx, data, w, h) {
  if (data.type === "bar") return drawBarChart(ctx, data, w, h);
  if (data.type === "stackedColumn") return drawStackedColumnChart(ctx, data, w, h);
  if (data.type === "line") return drawLineChart(ctx, data, w, h, false);
  if (data.type === "area") return drawLineChart(ctx, data, w, h, true);
  if (data.type === "pie") return drawPieChart(ctx, data, w, h, false);
  if (data.type === "doughnut") return drawPieChart(ctx, data, w, h, true);
  if (data.type === "radar") return drawRadarChart(ctx, data, w, h);
  return drawColumnChart(ctx, data, w, h);
}

function drawColumnChart(ctx, data, w, h) {
  const options = normalizeDataOptions(data.options, "chart", data.variables);
  const layout = chartPlotLayout(w, 56, 24, 52);
  drawAxes(ctx, w, h, layout.left, layout.top, layout.right, layout.bottom);
  const values = data.rows.flatMap((row) => data.variables.map((variable) => numberFromRow(row, variable.key)));
  const max = Math.max(1, ...values);
  drawVerticalValueTicks(ctx, { ...layout, w, h }, max, options);
  const colors = seriesColors(data);
  const plotW = Math.max(80, w - layout.left - layout.right);
  const plotH = Math.max(80, h - layout.top - layout.bottom);
  const groupW = Math.max(32, plotW / Math.max(1, data.rows.length));
  const barW = Math.max(6, Math.min(24, (groupW - 10) / Math.max(1, data.variables.length)));
  data.rows.forEach((row, rowIndex) => {
    const groupX = layout.left + 8 + rowIndex * groupW;
    data.variables.forEach((variable, varIndex) => {
      const value = numberFromRow(row, variable.key);
      const barH = (plotH * value) / max;
      const x = groupX + varIndex * (barW + 2);
      ctx.fillStyle = colors[varIndex % colors.length];
      ctx.fillRect(x, h - layout.bottom - barH, barW, barH);
      if (options.showPointLabels) {
        ctx.fillStyle = "#111";
        ctx.font = "10px MS Sans Serif, Arial";
        ctx.fillText(String(value), x, h - layout.bottom - 4 - barH);
      }
    });
    ctx.fillStyle = "#111";
    ctx.font = "11px MS Sans Serif, Arial";
    drawClampedText(ctx, row.label.slice(0, 12), groupX, h - 26, layout.left, w - layout.right);
  });
  drawChartAxisTitles(ctx, { ...layout, w, h }, options);
  drawLegend(ctx, data.variables, colors, layout.legendX, 14);
}

function drawBarChart(ctx, data, w, h) {
  const options = normalizeDataOptions(data.options, "chart", data.variables);
  const colors = seriesColors(data);
  const values = data.rows.flatMap((row) => data.variables.map((variable) => numberFromRow(row, variable.key)));
  const max = Math.max(1, ...values);
  const left = 92;
  const top = 24;
  const layout = chartPlotLayout(w, left, top, 46);
  const right = layout.right;
  const bottom = layout.bottom;
  const rowH = Math.max(22, (h - top - bottom) / Math.max(1, data.rows.length));
  drawAxes(ctx, w, h, left, top, right, bottom);
  drawHorizontalValueTicks(ctx, { left, top, right, bottom, w, h }, max, options);
  data.rows.forEach((row, rowIndex) => {
    const y = top + rowIndex * rowH + 5;
    data.variables.forEach((variable, varIndex) => {
      const value = numberFromRow(row, variable.key);
      const barH = Math.max(5, (rowH - 8) / data.variables.length - 2);
      const barW = (Math.max(80, w - left - right) * value) / max;
      ctx.fillStyle = colors[varIndex % colors.length];
      ctx.fillRect(left, y + varIndex * (barH + 2), barW, barH);
      if (options.showPointLabels) {
        ctx.fillStyle = "#111";
        ctx.font = "10px MS Sans Serif, Arial";
        drawClampedText(ctx, String(value), left + barW + 4, y + varIndex * (barH + 2) + barH, left, w - right + 18);
      }
    });
    ctx.fillStyle = "#111";
    ctx.font = "11px MS Sans Serif, Arial";
    drawClampedText(ctx, row.label.slice(0, 12), 10, y + 12, 4, left - 4);
  });
  drawChartAxisTitles(ctx, { left, top, right, bottom, w, h }, options);
  drawLegend(ctx, data.variables, colors, layout.legendX, 14);
}

function drawStackedColumnChart(ctx, data, w, h) {
  const options = normalizeDataOptions(data.options, "chart", data.variables);
  const layout = chartPlotLayout(w, 56, 24, 52);
  drawAxes(ctx, w, h, layout.left, layout.top, layout.right, layout.bottom);
  const colors = seriesColors(data);
  const max = Math.max(1, ...data.rows.map((row) => data.variables.reduce((sum, variable) => sum + numberFromRow(row, variable.key), 0)));
  drawVerticalValueTicks(ctx, { ...layout, w, h }, max, options);
  const plotW = Math.max(80, w - layout.left - layout.right);
  const plotH = Math.max(80, h - layout.top - layout.bottom);
  const groupW = Math.max(36, plotW / Math.max(1, data.rows.length));
  const barW = Math.max(14, Math.min(34, groupW - 18));
  data.rows.forEach((row, rowIndex) => {
    const x = layout.left + 10 + rowIndex * groupW;
    let y = h - layout.bottom;
    data.variables.forEach((variable, varIndex) => {
      const value = numberFromRow(row, variable.key);
      const segmentH = (plotH * value) / max;
      y -= segmentH;
      ctx.fillStyle = colors[varIndex % colors.length];
      ctx.fillRect(x, y, barW, segmentH);
    });
    ctx.fillStyle = "#111";
    ctx.font = "11px MS Sans Serif, Arial";
    drawClampedText(ctx, row.label.slice(0, 12), x - 2, h - 26, layout.left, w - layout.right);
  });
  drawChartAxisTitles(ctx, { ...layout, w, h }, options);
  drawLegend(ctx, data.variables, colors, layout.legendX, 14);
}

function drawLineChart(ctx, data, w, h, fillArea) {
  const options = normalizeDataOptions(data.options, "chart", data.variables);
  const colors = seriesColors(data);
  const values = data.rows.flatMap((row) => data.variables.map((variable) => numberFromRow(row, variable.key)));
  const max = Math.max(1, ...values);
  const left = 56;
  const top = 24;
  const bottom = 54;
  const layout = chartPlotLayout(w, left, top, bottom);
  const right = layout.right;
  drawAxes(ctx, w, h, left, top, right, bottom);
  drawVerticalValueTicks(ctx, { left, top, right, bottom, w, h }, max, options);
  data.variables.forEach((variable, varIndex) => {
    const points = data.rows.map((row, rowIndex) => ({
      x: left + ((w - left - right) * rowIndex) / Math.max(1, data.rows.length - 1),
      y: h - bottom - ((h - top - bottom) * numberFromRow(row, variable.key)) / max
    }));
    ctx.strokeStyle = colors[varIndex % colors.length];
    ctx.fillStyle = colors[varIndex % colors.length] + "55";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
    if (fillArea) {
      ctx.lineTo(points.at(-1).x, h - bottom);
      ctx.lineTo(points[0].x, h - bottom);
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();
    points.forEach((point) => {
      ctx.fillStyle = colors[varIndex % colors.length];
      ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
    });
  });
  data.rows.forEach((row, index) => {
    const x = left + ((w - left - right) * index) / Math.max(1, data.rows.length - 1);
    ctx.fillStyle = "#111";
    ctx.font = "11px MS Sans Serif, Arial";
    drawClampedText(ctx, row.label.slice(0, 10), x - 10, h - 27, left, w - right);
  });
  drawChartAxisTitles(ctx, { left, top, right, bottom, w, h }, options);
  drawLegend(ctx, data.variables, colors, layout.legendX, 14);
}

function drawPieChart(ctx, data, w, h, doughnut) {
  const colors = rowColors(data);
  const variable = data.variables[0];
  const total = Math.max(1, data.rows.reduce((sum, row) => sum + Math.max(0, numberFromRow(row, variable.key)), 0));
  const cx = w * 0.38;
  const cy = h * 0.52;
  const radius = Math.min(w, h) * 0.32;
  let start = -Math.PI / 2;
  data.rows.forEach((row, index) => {
    const value = Math.max(0, numberFromRow(row, variable.key));
    const end = start + (Math.PI * 2 * value) / total;
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    start = end;
  });
  if (doughnut) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }
  drawLegend(ctx, data.rows.map((row) => ({ name: row.label })), colors, w - 170, 22);
}

function drawRadarChart(ctx, data, w, h) {
  const colors = seriesColors(data);
  const cx = w * 0.48;
  const cy = h * 0.54;
  const radius = Math.min(w, h) * 0.31;
  const max = Math.max(1, ...data.rows.flatMap((row) => data.variables.map((variable) => numberFromRow(row, variable.key))));
  data.rows.forEach((row, rowIndex) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * rowIndex) / data.rows.length;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.strokeStyle = "#c0c0c0";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.font = "10px MS Sans Serif, Arial";
    ctx.fillText(row.label.slice(0, 10), x, y);
  });
  data.variables.forEach((variable, varIndex) => {
    ctx.strokeStyle = colors[varIndex % colors.length];
    ctx.fillStyle = colors[varIndex % colors.length] + "44";
    ctx.beginPath();
    data.rows.forEach((row, rowIndex) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * rowIndex) / data.rows.length;
      const valueRadius = (radius * numberFromRow(row, variable.key)) / max;
      const x = cx + Math.cos(angle) * valueRadius;
      const y = cy + Math.sin(angle) * valueRadius;
      if (rowIndex) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  drawLegend(ctx, data.variables, colors, w - 150, 14);
}

function renderGraphWidget(widget, resize = true) {
  const data = decodeDataSet(widget.dataset.graph, "graph");
  const canvas = widget.querySelector("canvas") || replaceGraphSvgWithCanvas(widget);
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    if (widget.offsetParent && !canvas.dataset.renderRetry) {
      canvas.dataset.renderRetry = "true";
      requestAnimationFrame(() => {
        delete canvas.dataset.renderRetry;
        renderGraphWidget(widget, resize);
      });
    }
    return;
  }
  const scale = window.devicePixelRatio || 1;
  if (resize) {
    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  if (is3DGraphData(data)) {
    canvas.classList.add("rotatable");
    ensureGraphInteraction(widget, canvas);
    draw3DGraph(ctx, data, w, h, graphRotation(widget));
  } else {
    canvas.classList.remove("rotatable");
    draw2DGraph(ctx, data, w, h, data.type);
  }
}

function is3DGraphData(data) {
  return data.type === "threeDScatter" || data.type === "threeDLine" || (data.variables.length >= 3 && !["scatter", "lineGraph", "areaGraph", "bubble"].includes(data.type));
}

function ensureGraphInteraction(widget, canvas) {
  if (canvas.dataset.rotatable) return;
  let start = null;
  let activePointerId = null;
  const updateRotationFromPointer = (clientX, clientY) => {
    if (!start) return;
    const yaw = start.rotation.yaw + (clientX - start.x) * 0.012;
    const pitch = clamp(start.rotation.pitch + (clientY - start.y) * 0.008, -0.85, 0.85);
    widget.dataset.rotation = JSON.stringify({ yaw, pitch, zoom: start.rotation.zoom });
    renderGraphWidget(widget, false);
  };
  const beginDrag = (event, id) => {
    if (start) return false;
    if (event.target.closest?.("button, input, select, textarea, [data-widget-action], [data-graph-rotate]")) return false;
    if (!is3DGraphData(decodeDataSet(widget.dataset.graph, "graph"))) return false;
    event.preventDefault();
    event.stopPropagation();
    try {
      canvas.setPointerCapture?.(event.pointerId);
    } catch {
      // Some Electron/Chromium builds throw if the pointer is already captured.
    }
    activePointerId = id;
    start = { x: event.clientX, y: event.clientY, rotation: graphRotation(widget) };
    selectObject(widget);
    document.body.classList.add("dragging-graph");
    return true;
  };
  const finishDrag = () => {
    document.body.classList.remove("dragging-graph");
    try {
      if (typeof activePointerId === "number") canvas.releasePointerCapture?.(activePointerId);
    } catch {
      // Capture may already be gone when the pointer leaves the canvas.
    }
    start = null;
    activePointerId = null;
    const owner = widget.closest("#editor, #templateEditor, #phraseExpansionEditor, #cardFront, #cardBack") || els.editor;
    syncRichEditor(owner);
  };
  const move = (event) => {
    if (!start || event.pointerId !== activePointerId) return;
    event.preventDefault();
    event.stopPropagation();
    updateRotationFromPointer(event.clientX, event.clientY);
  };
  const end = (event) => {
    if (!start || event.pointerId !== activePointerId) return;
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointermove", move, true);
    document.removeEventListener("pointerup", end, true);
    window.removeEventListener("pointerup", end, true);
    document.removeEventListener("pointercancel", end, true);
    window.removeEventListener("pointercancel", end, true);
    finishDrag();
  };
  const begin = (event) => {
    if (!beginDrag(event, event.pointerId)) return;
    document.addEventListener("pointermove", move, true);
    window.addEventListener("pointermove", move, true);
    document.addEventListener("pointerup", end, true);
    window.addEventListener("pointerup", end, true);
    document.addEventListener("pointercancel", end, true);
    window.addEventListener("pointercancel", end, true);
  };
  const mouseMove = (event) => {
    if (!start || activePointerId !== "mouse") return;
    event.preventDefault();
    event.stopPropagation();
    updateRotationFromPointer(event.clientX, event.clientY);
  };
  const mouseEnd = (event) => {
    if (!start || activePointerId !== "mouse") return;
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener("mousemove", mouseMove, true);
    window.removeEventListener("mousemove", mouseMove, true);
    document.removeEventListener("mouseup", mouseEnd, true);
    window.removeEventListener("mouseup", mouseEnd, true);
    finishDrag();
  };
  const mouseBegin = (event) => {
    if (event.button !== 0 || !beginDrag(event, "mouse")) return;
    document.addEventListener("mousemove", mouseMove, true);
    window.addEventListener("mousemove", mouseMove, true);
    document.addEventListener("mouseup", mouseEnd, true);
    window.addEventListener("mouseup", mouseEnd, true);
  };
  canvas.addEventListener("pointerdown", begin, true);
  canvas.addEventListener("mousedown", mouseBegin, true);
  widget.addEventListener("pointerdown", begin, true);
  widget.addEventListener("mousedown", mouseBegin, true);
  canvas.title = "Drag to rotate 3D graph";
  widget.title = "Drag to rotate 3D graph";
  canvas.style.touchAction = "none";
  canvas.addEventListener("dragstart", (event) => event.preventDefault());
  canvas.dataset.rotatable = "true";
}

function graphRotation(widget) {
  try {
    return { yaw: 0.75, pitch: -0.25, zoom: 0.58, ...JSON.parse(widget.dataset.rotation || "{}") };
  } catch {
    return { yaw: 0.75, pitch: -0.25, zoom: 0.58 };
  }
}

function renderDrawWidget(widget) {
  const canvas = widget.querySelector("canvas");
  if (!canvas || canvas.dataset.ready) return;
  const ctx = canvas.getContext("2d");
  const scaleCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const image = widget.dataset.image;
    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
    ctx.scale(scale, scale);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    if (image) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = image;
    }
  };
  scaleCanvas();
  let drawing = false;
  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const pos = pointerPos(canvas, event);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const pos = pointerPos(canvas, event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  });
  canvas.addEventListener("pointerup", () => {
    drawing = false;
    widget.dataset.image = canvas.toDataURL("image/png");
    const owner = widget.closest("#editor, #templateEditor, #phraseExpansionEditor, #cardFront, #cardBack") || els.editor;
    syncRichEditor(owner);
  });
  canvas.dataset.ready = "true";
}

function openDataGridDialog(title, initialData, kind) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    let draft = normalizeDataSet(initialData, kind);
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = kind === "graph" ? "Choose a graph type, name X/Y/Z variables, and enter numeric rows." : "Choose a chart type, name up to three series, and enter values by row.";
    els.dialogIcon.className = "icon95 Calculator_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-data");
    dialog.classList.remove("has-fields", "has-multiline");
    els.dialogFields.innerHTML = "<div class=\"data-dialog\"></div>";
    els.dialogButtons.innerHTML = "";
    const root = els.dialogFields.querySelector(".data-dialog");

    const render = () => {
      root.innerHTML = dataDialogHtml(draft, kind);
      root.querySelector("[data-data-type]").addEventListener("change", () => {
        draft = normalizeDataSet(readDataDialog(root, kind), kind);
        render();
      });
      root.querySelector("[data-add-row]").addEventListener("click", () => {
        draft = readDataDialog(root, kind);
        const row = { label: `Row ${draft.rows.length + 1}` };
        draft.variables.forEach((variable) => {
          row[variable.key] = 0;
        });
        draft.rows.push(row);
        render();
      });
      root.querySelector("[data-add-variable]").addEventListener("click", () => {
        draft = readDataDialog(root, kind);
        if (draft.variables.length >= 3) return;
        const key = ["x", "y", "z"][draft.variables.length];
        draft.variables.push({ key, name: key.toUpperCase() });
        draft.rows.forEach((row) => {
          row[key] = 0;
        });
        render();
      });
      root.querySelectorAll("[data-delete-row]").forEach((button) => {
        button.addEventListener("click", () => {
          draft = readDataDialog(root, kind);
          draft.rows.splice(Number(button.dataset.deleteRow), 1);
          if (!draft.rows.length) draft.rows.push(blankDataRow(draft.variables, 1));
          render();
        });
      });
      root.querySelectorAll("[data-delete-variable]").forEach((button) => {
        button.addEventListener("click", () => {
          draft = readDataDialog(root, kind);
          const minVars = minVariablesFor(kind, draft.type);
          if (draft.variables.length <= minVars) return;
          const index = Number(button.dataset.deleteVariable);
          const [removed] = draft.variables.splice(index, 1);
          draft.rows.forEach((row) => delete row[removed.key]);
          draft = normalizeDataSet(draft, kind);
          render();
        });
      });
    };

    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.addEventListener("click", () => closeRetroDialog(readDataDialog(root, kind)));
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(ok, cancel);
    render();
    els.modalOverlay.hidden = false;
  });
}

function dataDialogHtml(data, kind) {
  const minVars = minVariablesFor(kind, data.type);
  const vars = data.variables
    .map(
      (variable, index) => `
        <div class="data-var-row" data-var-row="${index}">
          <span>${variable.key.toUpperCase()}</span>
          <input data-var-name="${index}" value="${escapeHtml(variable.name)}" />
          <input type="color" data-var-color="${index}" value="${escapeHtml(variable.color || chartColors()[index % chartColors().length])}" title="Series color" />
          <button type="button" data-delete-variable="${index}" ${data.variables.length <= minVars ? "disabled" : ""}>X</button>
        </div>
      `
    )
    .join("");
  const headers = data.variables.map((variable) => `<th>${escapeHtml(variable.name || variable.key.toUpperCase())}</th>`).join("");
  const rows = data.rows
    .map(
      (row, rowIndex) => `
        <tr>
          <td contenteditable="true" data-cell="label">${escapeHtml(row.label || `Row ${rowIndex + 1}`)}</td>
          <td><input type="color" data-row-color="${rowIndex}" value="${escapeHtml(row.color || chartColors()[rowIndex % chartColors().length])}" title="Point or slice color" /></td>
          ${data.variables.map((variable) => `<td contenteditable="true" data-cell="${variable.key}">${escapeHtml(numberFromRow(row, variable.key))}</td>`).join("")}
          <td><button type="button" data-delete-row="${rowIndex}">X</button></td>
        </tr>
      `
    )
    .join("");
  return `
    <div class="field-row-stacked">
      <label>${kind === "graph" ? "Graph type" : "Chart type"}</label>
      <select data-data-type>
        ${DATA_CHART_TYPES[kind].map(([value, label]) => `<option value="${value}" ${data.type === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </div>
    <div class="field-row-stacked">
      <label>Title</label>
      <input data-data-title value="${escapeHtml(data.title)}" />
    </div>
    <fieldset class="data-options-grid">
      <legend>Axes And Labels</legend>
      <label>X axis title</label>
      <input data-axis-title="x" value="${escapeHtml(data.options?.xTitle || data.variables[0]?.name || "X")}" />
      <label>Y axis title</label>
      <input data-axis-title="y" value="${escapeHtml(data.options?.yTitle || data.variables[1]?.name || "Value")}" />
      ${kind === "graph" && data.variables[2] ? `<label>Z axis title</label><input data-axis-title="z" value="${escapeHtml(data.options?.zTitle || data.variables[2]?.name || "Z")}" />` : ""}
      <label><input type="checkbox" data-show-ticks ${data.options?.showTicks !== false ? "checked" : ""} /> Show axis numbers</label>
      <label><input type="checkbox" data-show-axis-titles ${data.options?.showAxisTitles !== false ? "checked" : ""} /> Show axis titles</label>
      <label><input type="checkbox" data-show-point-labels ${data.options?.showPointLabels !== false ? "checked" : ""} /> Show point labels</label>
    </fieldset>
    <div class="data-var-grid">${vars}</div>
    <div class="data-grid-shell">
      <table class="data-grid-table">
        <thead><tr><th>Label</th><th>Color</th>${headers}<th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="button-row right">
      <button type="button" data-add-variable ${data.variables.length >= 3 ? "disabled" : ""}>Add Variable</button>
      <button type="button" data-add-row>Add Row</button>
    </div>
  `;
}

function readDataDialog(root, kind) {
  const keys = ["x", "y", "z"];
  const variables = [...root.querySelectorAll("[data-var-name]")].slice(0, 3).map((input, index) => ({
    key: keys[index],
    name: normalizeNotebookName(input.value) || keys[index].toUpperCase(),
    color: normalizeHexColor(root.querySelector(`[data-var-color="${index}"]`)?.value) || chartColors()[index % chartColors().length]
  }));
  const rows = [...root.querySelectorAll(".data-grid-table tbody tr")].map((tr, index) => {
    const row = {
      label: normalizeNotebookName(tr.querySelector("[data-cell='label']")?.innerText) || `Row ${index + 1}`,
      color: normalizeHexColor(tr.querySelector(`[data-row-color="${index}"]`)?.value) || chartColors()[index % chartColors().length]
    };
    variables.forEach((variable) => {
      const text = tr.querySelector(`[data-cell='${variable.key}']`)?.innerText || "0";
      row[variable.key] = Number(text.replace(/,/g, "")) || 0;
    });
    return row;
  });
  const options = {
    xTitle: normalizeNotebookName(root.querySelector("[data-axis-title='x']")?.value),
    yTitle: normalizeNotebookName(root.querySelector("[data-axis-title='y']")?.value),
    zTitle: normalizeNotebookName(root.querySelector("[data-axis-title='z']")?.value),
    showTicks: Boolean(root.querySelector("[data-show-ticks]")?.checked),
    showAxisTitles: Boolean(root.querySelector("[data-show-axis-titles]")?.checked),
    showPointLabels: Boolean(root.querySelector("[data-show-point-labels]")?.checked)
  };
  return normalizeDataSet({ type: root.querySelector("[data-data-type]")?.value, title: normalizeNotebookName(root.querySelector("[data-data-title]")?.value) || "Untitled Data", variables, rows, options }, kind);
}

function defaultDataSet(kind) {
  if (kind === "graph") {
    return {
      type: "threeDScatter",
      title: "Learning Graph",
      variables: [
        { key: "x", name: "Practice" },
        { key: "y", name: "Recall" },
        { key: "z", name: "Confidence" }
      ],
      rows: [
        { label: "Week 1", x: 1, y: 2, z: 1 },
        { label: "Week 2", x: 3, y: 5, z: 4 },
        { label: "Week 3", x: 6, y: 8, z: 7 }
      ],
      options: {
        xTitle: "Practice",
        yTitle: "Recall",
        zTitle: "Confidence",
        showTicks: true,
        showAxisTitles: true,
        showPointLabels: true
      }
    };
  }
  return {
    type: "column",
    title: "Study Chart",
    variables: [
      { key: "x", name: "Recall" },
      { key: "y", name: "Practice" }
    ],
    rows: [
      { label: "Topic A", x: 7, y: 4 },
      { label: "Topic B", x: 5, y: 8 },
      { label: "Topic C", x: 9, y: 6 }
    ],
    options: {
      xTitle: "Topic",
      yTitle: "Value",
      showTicks: true,
      showAxisTitles: true,
      showPointLabels: true
    }
  };
}

function normalizeDataSet(data, kind) {
  const keys = ["x", "y", "z"];
  const allowedTypes = DATA_CHART_TYPES[kind].map(([value]) => value);
  const fallbackType = defaultDataSet(kind).type;
  const type = allowedTypes.includes(data?.type) ? data.type : fallbackType;
  const minVars = minVariablesFor(kind, type);
  const variables = Array.isArray(data?.variables) ? data.variables.slice(0, 3) : defaultDataSet(kind).variables;
  while (variables.length < minVars) {
    const key = keys[variables.length];
    variables.push({ key, name: key.toUpperCase() });
  }
  const normalizedVariables = variables.slice(0, 3).map((variable, index) => ({
    key: keys[index],
    sourceKey: variable.key || keys[index],
    name: normalizeNotebookName(variable.name) || keys[index].toUpperCase(),
    color: normalizeHexColor(variable.color) || chartColors()[index % chartColors().length]
  }));
  const sourceRows = Array.isArray(data?.rows) && data.rows.length ? data.rows : [blankDataRow(normalizedVariables, 1)];
  const rows = sourceRows.map((row, index) => {
    const normalized = {
      label: normalizeNotebookName(row.label) || `Row ${index + 1}`,
      color: normalizeHexColor(row.color) || chartColors()[index % chartColors().length]
    };
    normalizedVariables.forEach((variable) => {
      normalized[variable.key] = numberFromRow(row, variable.sourceKey);
    });
    return normalized;
  });
  return {
    type,
    title: normalizeNotebookName(data?.title) || (kind === "graph" ? "Data Graph" : "Chart"),
    variables: normalizedVariables.map(({ key, name, color }) => ({ key, name, color })),
    rows,
    options: normalizeDataOptions(data?.options, kind, normalizedVariables)
  };
}

function normalizeDataOptions(options = {}, kind, variables = []) {
  const xFallback = kind === "chart" ? "Category" : variables[0]?.name || "X";
  const yFallback = kind === "chart" ? variables[0]?.name || "Value" : variables[1]?.name || "Y";
  const zFallback = variables[2]?.name || "Z";
  return {
    xTitle: normalizeNotebookName(options.xTitle) || xFallback,
    yTitle: normalizeNotebookName(options.yTitle) || yFallback,
    zTitle: normalizeNotebookName(options.zTitle) || zFallback,
    showTicks: options.showTicks !== false,
    showAxisTitles: options.showAxisTitles !== false,
    showPointLabels: options.showPointLabels !== false
  };
}

function minVariablesFor(kind, type) {
  if (kind === "graph" && String(type || "").startsWith("threeD")) return 3;
  return kind === "graph" ? 2 : 1;
}

function blankDataRow(variables, index) {
  const row = { label: `Row ${index}` };
  row.color = chartColors()[(index - 1) % chartColors().length];
  variables.forEach((variable) => {
    row[variable.key] = 0;
  });
  return row;
}

function encodeDataSet(data) {
  return encodeURIComponent(JSON.stringify(data));
}

function decodeDataSet(encoded, kind) {
  if (!encoded) return defaultDataSet(kind);
  const source = decodeURIComponent(encoded);
  try {
    return normalizeDataSet(JSON.parse(source), kind);
  } catch {
    if (kind === "chart") {
      const rows = parseChartData(source);
      return normalizeDataSet(
        {
          title: "Legacy Chart",
          variables: [{ key: "x", name: "Value" }],
          rows: rows.map((row) => ({ label: row.label, x: row.value }))
        },
        kind
      );
    }
    return defaultDataSet(kind);
  }
}

function numberFromRow(row, key) {
  const value = Number(row?.[key]);
  return Number.isFinite(value) ? value : 0;
}

function drawAxes(ctx, w, h, left, top, right, bottom) {
  ctx.strokeStyle = "#808080";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, h - bottom);
  ctx.lineTo(w - right, h - bottom);
  ctx.stroke();
}

function drawClampedText(ctx, text, x, y, minX = 2, maxX = 9999) {
  const value = String(text || "");
  const width = ctx.measureText(value).width;
  ctx.fillText(value, clamp(x, minX, Math.max(minX, maxX - width)), y);
}

function niceTickValue(value) {
  if (Math.abs(value) >= 10 || Number.isInteger(value)) return String(Math.round(value));
  return String(Math.round(value * 10) / 10);
}

function draw2DTicks(ctx, bounds, xMax, yMax, options = {}) {
  if (options.showTicks === false) return;
  const { left, top, right, bottom, w, h } = bounds;
  const plotW = w - left - right;
  const plotH = h - top - bottom;
  ctx.save();
  ctx.font = "10px MS Sans Serif, Arial";
  ctx.fillStyle = "#333";
  ctx.strokeStyle = "#d0d0d0";
  ctx.lineWidth = 1;
  for (let index = 0; index <= 4; index += 1) {
    const ratio = index / 4;
    const x = left + plotW * ratio;
    const y = h - bottom - plotH * ratio;
    ctx.beginPath();
    ctx.moveTo(x, h - bottom);
    ctx.lineTo(x, h - bottom + 4);
    ctx.moveTo(left - 4, y);
    ctx.lineTo(left, y);
    ctx.stroke();
    drawClampedText(ctx, niceTickValue(xMax * ratio), x - 8, h - bottom + 16, left - 8, w - right + 18);
    const yLabel = niceTickValue(yMax * ratio);
    ctx.fillText(yLabel, Math.max(2, left - ctx.measureText(yLabel).width - 8), y + 3);
  }
  ctx.restore();
}

function drawVerticalValueTicks(ctx, bounds, max, options = {}) {
  if (options.showTicks === false) return;
  const { left, top, bottom, w, h } = bounds;
  const plotH = h - top - bottom;
  ctx.save();
  ctx.font = "10px MS Sans Serif, Arial";
  ctx.fillStyle = "#333";
  ctx.strokeStyle = "#d0d0d0";
  for (let index = 0; index <= 4; index += 1) {
    const ratio = index / 4;
    const y = h - bottom - plotH * ratio;
    ctx.beginPath();
    ctx.moveTo(left - 4, y);
    ctx.lineTo(left, y);
    ctx.stroke();
    const label = niceTickValue(max * ratio);
    ctx.fillText(label, Math.max(2, left - ctx.measureText(label).width - 8), y + 3);
  }
  ctx.restore();
}

function drawHorizontalValueTicks(ctx, bounds, max, options = {}) {
  if (options.showTicks === false) return;
  const { left, right, bottom, w, h } = bounds;
  const plotW = w - left - right;
  ctx.save();
  ctx.font = "10px MS Sans Serif, Arial";
  ctx.fillStyle = "#333";
  ctx.strokeStyle = "#d0d0d0";
  for (let index = 0; index <= 4; index += 1) {
    const ratio = index / 4;
    const x = left + plotW * ratio;
    ctx.beginPath();
    ctx.moveTo(x, h - bottom);
    ctx.lineTo(x, h - bottom + 4);
    ctx.stroke();
    drawClampedText(ctx, niceTickValue(max * ratio), x - 8, h - bottom + 15, left - 4, w - right + 16);
  }
  ctx.restore();
}

function drawChartAxisTitles(ctx, bounds, options = {}) {
  if (options.showAxisTitles === false) return;
  const { left, top, right, bottom, w, h } = bounds;
  ctx.save();
  ctx.font = "11px MS Sans Serif, Arial";
  ctx.fillStyle = "#111";
  drawClampedText(ctx, options.xTitle || "Category", left + (w - left - right) / 2 - 22, h - 8, left, w - right + 50);
  ctx.translate(15, top + (h - top - bottom) / 2 + 24);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(options.yTitle || "Value", 0, 0);
  ctx.restore();
}

function chartPlotLayout(w, left = 46, top = 24, bottom = 40) {
  const legendWidth = Math.min(150, Math.max(112, w * 0.24));
  return { left, top, right: legendWidth + 22, bottom, legendX: w - legendWidth - 10, legendWidth };
}

function drawLegend(ctx, variables, colors, x, y) {
  ctx.font = "11px MS Sans Serif, Arial";
  const width = Math.min(156, Math.max(96, ...variables.map((variable) => ctx.measureText(variable.name || "Series").width + 28)));
  const height = variables.length * 16 + 6;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.fillRect(x - 4, y - 4, width, height);
  ctx.strokeStyle = "#c0c0c0";
  ctx.strokeRect(x - 4, y - 4, width, height);
  variables.forEach((variable, index) => {
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y + index * 16, 10, 10);
    ctx.fillStyle = "#111";
    ctx.fillText(variable.name.slice(0, 18), x + 15, y + 9 + index * 16);
  });
  ctx.restore();
}

function chartColors() {
  return ["#2566a8", "#347a3a", "#7d4e9f", "#b7791f", "#b54848", "#008080", "#7030a0", "#6b5b2a"];
}

function seriesColors(data) {
  const fallback = chartColors();
  return data.variables.map((variable, index) => normalizeHexColor(variable.color) || fallback[index % fallback.length]);
}

function rowColors(data) {
  const fallback = chartColors();
  return data.rows.map((row, index) => normalizeHexColor(row.color) || fallback[index % fallback.length]);
}

function chartTypeLabel(type) {
  const all = [...DATA_CHART_TYPES.chart, ...DATA_CHART_TYPES.graph];
  return all.find(([value]) => value === type)?.[1] || "Column";
}

function draw2DGraph(ctx, data, w, h, type = "scatter") {
  const [xVar, yVar] = data.variables;
  const options = normalizeDataOptions(data.options, "graph", data.variables);
  const pointColors = rowColors(data);
  const seriesColor = seriesColors(data)[0] || "#2566a8";
  const points = data.rows.map((row, index) => ({ label: row.label, color: pointColors[index % pointColors.length], x: numberFromRow(row, xVar.key), y: numberFromRow(row, yVar.key) }));
  const xMax = Math.max(1, ...points.map((point) => point.x));
  const yMax = Math.max(1, ...points.map((point) => point.y));
  const left = 62;
  const top = 26;
  const right = 78;
  const bottom = 58;
  drawAxes(ctx, w, h, left, top, right, bottom);
  draw2DTicks(ctx, { left, top, right, bottom, w, h }, xMax, yMax, options);
  const projected = points.map((point) => ({
    ...point,
    sx: left + ((w - left - right) * point.x) / xMax,
    sy: h - bottom - ((h - top - bottom) * point.y) / yMax
  }));
  if (type === "lineGraph" || type === "areaGraph") {
    ctx.strokeStyle = seriesColor;
    ctx.fillStyle = `${seriesColor}55`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    projected.forEach((point, index) => (index ? ctx.lineTo(point.sx, point.sy) : ctx.moveTo(point.sx, point.sy)));
    if (type === "areaGraph") {
      ctx.lineTo(projected.at(-1).sx, h - bottom);
      ctx.lineTo(projected[0].sx, h - bottom);
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();
  }
  projected.forEach((point) => {
    const x = point.sx;
    const y = point.sy;
    const size = type === "bubble" ? clamp(4 + (point.x + point.y) / Math.max(1, xMax + yMax) * 14, 5, 18) : 6;
    ctx.fillStyle = point.color;
    if (type === "bubble") {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.stroke();
    } else {
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    if (options.showPointLabels) {
      ctx.fillStyle = "#111";
      ctx.font = "11px MS Sans Serif, Arial";
      drawClampedText(ctx, point.label.slice(0, 16), x + size + 3, y - 5, left + 2, w - 6);
    }
  });
  if (options.showAxisTitles) {
    ctx.fillStyle = "#111";
    ctx.font = "11px MS Sans Serif, Arial";
    drawClampedText(ctx, options.xTitle || xVar.name, left + (w - left - right) / 2 - 24, h - 14, left, w - right + 50);
    ctx.save();
    ctx.translate(16, top + (h - top - bottom) / 2 + 24);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(options.yTitle || yVar.name, 0, 0);
    ctx.restore();
  }
}

function draw3DGraph(ctx, data, w, h, rotation) {
  const [xVar, yVar, zVar] = data.variables;
  const options = normalizeDataOptions(data.options, "graph", data.variables);
  const pointColors = rowColors(data);
  const seriesColor = seriesColors(data)[0] || "#2566a8";
  const points = data.rows.map((row, index) => ({
    label: row.label,
    color: pointColors[index % pointColors.length],
    x: numberFromRow(row, xVar.key),
    y: numberFromRow(row, yVar.key),
    z: numberFromRow(row, zVar.key)
  }));
  const max = {
    x: Math.max(1, ...points.map((point) => point.x)),
    y: Math.max(1, ...points.map((point) => point.y)),
    z: Math.max(1, ...points.map((point) => point.z))
  };
  const rawProject = (x, y, z) => {
    const yaw = rotation.yaw;
    const pitch = rotation.pitch;
    const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
    const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
    const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
    const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
    return { x: rx, y: -ry, depth };
  };
  const normalizedPoints = points.map((point) => ({
    ...point,
    nx: point.x / max.x,
    ny: point.y / max.y,
    nz: point.z / max.z
  }));
  const rawOrigin = rawProject(0, 0, 0);
  const rawX = rawProject(1, 0, 0);
  const rawY = rawProject(0, 1, 0);
  const rawZ = rawProject(0, 0, 1);
  const rawPoints = normalizedPoints.map((point) => rawProject(point.nx, point.ny, point.nz));
  const rawBounds = [rawOrigin, rawX, rawY, rawZ, ...rawPoints].reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y)
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
  const margin = { left: 64, right: 118, top: 42, bottom: 56 };
  const rawW = Math.max(0.1, rawBounds.maxX - rawBounds.minX);
  const rawH = Math.max(0.1, rawBounds.maxY - rawBounds.minY);
  const fitScale = Math.min((w - margin.left - margin.right) / rawW, (h - margin.top - margin.bottom) / rawH) * 0.72;
  const scale = Math.max(24, Math.min(220, fitScale * clamp(rotation.zoom || 0.58, 0.3, 1.35)));
  let origin = {
    x: margin.left + (w - margin.left - margin.right - rawW * scale) / 2 - rawBounds.minX * scale,
    y: margin.top + (h - margin.top - margin.bottom - rawH * scale) / 2 - rawBounds.minY * scale
  };
  const project = (x, y, z) => {
    const raw = rawProject(x, y, z);
    return { x: origin.x + raw.x * scale, y: origin.y + raw.y * scale, depth: raw.depth };
  };
  let xAxis = project(1, 0, 0);
  let yAxis = project(0, 1, 0);
  let zAxis = project(0, 0, 1);
  let projectedPoints = normalizedPoints
    .map((point) => {
      const projected = project(point.nx, point.ny, point.nz);
      return {
        ...point,
        sx: projected.x,
        sy: projected.y,
        depth: projected.depth
      };
    })
    .sort((a, b) => a.depth - b.depth);
  const screenPoints = [origin, xAxis, yAxis, zAxis, ...projectedPoints.map((point) => ({ x: point.sx, y: point.sy }))];
  const screenBounds = screenPoints.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y)
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
  const targetCenter = {
    x: margin.left + (w - margin.left - margin.right) / 2,
    y: margin.top + (h - margin.top - margin.bottom) / 2
  };
  const offset = {
    x: targetCenter.x - (screenBounds.minX + screenBounds.maxX) / 2,
    y: targetCenter.y - (screenBounds.minY + screenBounds.maxY) / 2
  };
  const movePoint = (point) => ({ ...point, x: point.x + offset.x, y: point.y + offset.y });
  origin = movePoint(origin);
  xAxis = movePoint(xAxis);
  yAxis = movePoint(yAxis);
  zAxis = movePoint(zAxis);
  projectedPoints = projectedPoints.map((point) => ({ ...point, sx: point.sx + offset.x, sy: point.sy + offset.y }));
  ctx.strokeStyle = "#808080";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(xAxis.x, xAxis.y);
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(yAxis.x, yAxis.y);
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(zAxis.x, zAxis.y);
  ctx.stroke();
  ctx.fillStyle = "#111";
  ctx.font = "11px MS Sans Serif, Arial";
  if (options.showAxisTitles) {
    drawClampedText(ctx, options.xTitle || xVar.name, xAxis.x - 35, xAxis.y + 14, 2, w - 2);
    drawClampedText(ctx, options.yTitle || yVar.name, yAxis.x + 6, yAxis.y + 10, 2, w - 2);
    drawClampedText(ctx, options.zTitle || zVar.name, zAxis.x + 4, zAxis.y, 2, w - 2);
  }
  if (options.showTicks) {
    [
      [xAxis, max.x],
      [yAxis, max.y],
      [zAxis, max.z]
    ].forEach(([axis, value]) => {
      drawClampedText(ctx, niceTickValue(value), axis.x - 8, axis.y - 4, 2, w - 2);
    });
  }
  if (data.type === "threeDLine") {
    ctx.strokeStyle = seriesColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    projectedPoints.forEach((point, index) => (index ? ctx.lineTo(point.sx, point.sy) : ctx.moveTo(point.sx, point.sy)));
    ctx.stroke();
  }
  projectedPoints
    .forEach((point) => {
      const size = clamp(6 + point.depth * 5, 4, 13);
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(point.sx, point.sy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.stroke();
      if (options.showPointLabels) {
        ctx.fillStyle = "#111";
        drawClampedText(ctx, point.label.slice(0, 16), point.sx + size + 3, point.sy - 3, 2, w - 2);
      }
    });
}

function replaceGraphSvgWithCanvas(widget) {
  const svg = widget.querySelector("svg");
  const canvas = document.createElement("canvas");
  canvas.className = "graph-canvas";
  if (svg) svg.replaceWith(canvas);
  else widget.appendChild(canvas);
  return canvas;
}

function parseChartData(source) {
  return source
    .split(/\n+/)
    .map((line) => {
      const [label, value] = line.split(",");
      return { label: (label || "Item").trim(), value: Number(value) || 0 };
    })
    .filter((row) => row.label);
}

function typesetMath() {
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([els.editor]).catch(() => setStatus("MathJax could not typeset this equation."));
  }
}

function svgEl(name, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function pointerPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function retroAlert(title, message, icon = "info") {
  return openRetroDialog({ title, message, icon, buttons: [{ label: "OK", value: true, default: true }] });
}

function retroConfirm(title, message, icon = "warning") {
  return openRetroDialog({
    title,
    message,
    icon,
    buttons: [
      { label: "OK", value: true, default: true },
      { label: "Cancel", value: false }
    ]
  });
}

function retroPrompt(title, message, value = "", multiline = false) {
  return openRetroDialog({
    title,
    message,
    icon: "question",
    fields: [{ id: "value", value, multiline }],
    buttons: [
      { label: "OK", value: "submit", default: true },
      { label: "Cancel", value: null }
    ]
  });
}

function openHyperlinkDialog(defaultText = "") {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    els.dialogTitle.textContent = "Insert Hyperlink";
    els.dialogMessage.textContent = "Create a clickable link in the current note.";
    els.dialogIcon.className = "icon95 WebLink_16x16_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-fields");
    dialog.classList.remove("has-multiline", "has-data");
    els.dialogFields.innerHTML = `
      <div class="field-row-stacked">
        <label>Display text</label>
        <input data-link-text value="${escapeHtml(defaultText)}" />
      </div>
      <div class="field-row-stacked">
        <label>Address</label>
        <input data-link-url value="https://" />
      </div>
    `;
    els.dialogButtons.innerHTML = "";
    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.addEventListener("click", () => closeRetroDialog({
      text: els.dialogFields.querySelector("[data-link-text]").value,
      url: els.dialogFields.querySelector("[data-link-url]").value
    }));
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(ok, cancel);
    els.modalOverlay.hidden = false;
    setTimeout(() => {
      const field = els.dialogFields.querySelector(defaultText ? "[data-link-url]" : "[data-link-text]");
      field.focus();
      field.select?.();
    }, 0);
  });
}

function openTagDialog(title, options) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    let selectedColor = options.color || nextTagColor();
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = "Create a reusable page tag.";
    els.dialogIcon.className = "icon95 FileText_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-fields");
    dialog.classList.remove("has-multiline", "has-data");
    els.dialogFields.innerHTML = `
      <div class="field-row-stacked">
        <label>Tag name</label>
        <input data-tag-name value="${escapeHtml(options.name || "")}" />
      </div>
      <div class="color-swatch-grid">
        ${DEFAULT_TAG_COLORS.map((color) => `<button type="button" class="color-swatch" data-color="${color}" style="--swatch:${color}" aria-label="${color}"></button>`).join("")}
      </div>
    `;
    els.dialogFields.querySelectorAll("[data-color]").forEach((button) => {
      button.classList.toggle("active", button.dataset.color === selectedColor);
      button.addEventListener("click", () => {
        selectedColor = button.dataset.color;
        els.dialogFields.querySelectorAll("[data-color]").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
      });
    });
    els.dialogButtons.innerHTML = "";
    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.addEventListener("click", () => {
      const name = els.dialogFields.querySelector("[data-tag-name]").value;
      closeRetroDialog({ name, color: selectedColor });
    });
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(ok, cancel);
    els.modalOverlay.hidden = false;
    setTimeout(() => {
      const field = els.dialogFields.querySelector("[data-tag-name]");
      field.focus();
      field.select?.();
    }, 0);
  });
}

function openNotebookDialog(title, options) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    let selectedColor = options.color || NOTEBOOK_COLORS[0];
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = options.lockName ? "Choose a notebook tab color." : "Name the notebook and choose a tab color.";
    els.dialogIcon.className = "icon95 Folder_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-fields");
    dialog.classList.remove("has-multiline", "has-data");
    els.dialogFields.innerHTML = `
      <div class="field-row-stacked">
        <label>Notebook name</label>
        <input data-notebook-name value="${escapeHtml(options.name || "")}" ${options.lockName ? "disabled" : ""} />
      </div>
      <div class="color-swatch-grid">
        ${NOTEBOOK_COLORS.map((color) => `<button type="button" class="color-swatch" data-color="${color}" style="--swatch:${color}" aria-label="${color}"></button>`).join("")}
      </div>
    `;
    els.dialogFields.querySelectorAll("[data-color]").forEach((button) => {
      button.classList.toggle("active", button.dataset.color === selectedColor);
      button.addEventListener("click", () => {
        selectedColor = button.dataset.color;
        els.dialogFields.querySelectorAll("[data-color]").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
      });
    });
    els.dialogButtons.innerHTML = "";
    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.addEventListener("click", () => {
      const name = els.dialogFields.querySelector("[data-notebook-name]").value;
      closeRetroDialog({ name, color: selectedColor });
    });
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(ok, cancel);
    els.modalOverlay.hidden = false;
    setTimeout(() => {
      const field = els.dialogFields.querySelector("[data-notebook-name]");
      field.focus();
      field.select?.();
    }, 0);
  });
}

function openFormatColorDialog(title, message, currentColor, sampleText) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    let selectedColor = normalizeHexColor(currentColor) || "#111111";
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = message;
    els.dialogIcon.className = "icon95 Brush_32x32_4";
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.add("has-fields");
    dialog.classList.remove("has-multiline", "has-data");
    els.dialogFields.innerHTML = `
      <div class="color-dialog-grid">
        <div class="color-swatch-grid">
          ${FORMAT_COLORS.map((color) => `<button type="button" class="color-swatch" data-color="${color}" style="--swatch:${color}" aria-label="${color}"></button>`).join("")}
        </div>
        <div class="field-row-stacked">
          <label>Custom color</label>
          <input data-format-color value="${escapeHtml(selectedColor)}" maxlength="7" />
        </div>
        <div class="format-color-preview" data-color-preview style="--preview:${selectedColor}">
          ${escapeHtml(sampleText)}
        </div>
      </div>
    `;
    const input = els.dialogFields.querySelector("[data-format-color]");
    const preview = els.dialogFields.querySelector("[data-color-preview]");
    const setSelected = (color) => {
      selectedColor = color;
      input.value = color;
      preview.style.setProperty("--preview", color);
      els.dialogFields.querySelectorAll("[data-color]").forEach((button) => {
        button.classList.toggle("active", button.dataset.color.toLowerCase() === color.toLowerCase());
      });
    };
    els.dialogFields.querySelectorAll("[data-color]").forEach((button) => {
      button.addEventListener("click", () => setSelected(button.dataset.color));
    });
    input.addEventListener("input", () => {
      const color = normalizeHexColor(input.value);
      if (!color) return;
      selectedColor = color;
      preview.style.setProperty("--preview", color);
      els.dialogFields.querySelectorAll("[data-color]").forEach((button) => {
        button.classList.toggle("active", button.dataset.color.toLowerCase() === color.toLowerCase());
      });
    });
    els.dialogButtons.innerHTML = "";
    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.addEventListener("click", () => {
      const color = normalizeHexColor(input.value);
      if (!color) {
        setStatus("Enter a valid color like #1f4e79.");
        input.focus();
        input.select();
        return;
      }
      closeRetroDialog(color);
    });
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeRetroDialog(null));
    els.dialogButtons.append(ok, cancel);
    setSelected(selectedColor);
    els.modalOverlay.hidden = false;
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  });
}

function openRetroDialog({ title, message, icon, fields = [], buttons }) {
  return new Promise((resolve) => {
    dialogResolve = resolve;
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = message;
    els.dialogIcon.className = "icon95 " + dialogIconClass(icon);
    const dialog = els.modalOverlay.querySelector(".retro-dialog");
    dialog.classList.remove("has-data");
    dialog.classList.toggle("has-fields", fields.length > 0);
    dialog.classList.toggle("has-multiline", fields.some((field) => field.multiline));
    els.dialogFields.innerHTML = "";
    els.dialogButtons.innerHTML = "";
    fields.forEach((field) => {
      const input = field.multiline ? document.createElement("textarea") : document.createElement("input");
      input.dataset.dialogField = field.id;
      input.value = field.value || "";
      if (field.multiline) input.rows = 5;
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !field.multiline) {
          event.preventDefault();
          closeRetroDialog(input.value);
        }
      });
      els.dialogFields.appendChild(input);
    });
    buttons.forEach((button) => {
      const node = document.createElement("button");
      node.textContent = button.label;
      node.addEventListener("click", () => {
        if (button.value === "submit") {
          const field = els.dialogFields.querySelector("[data-dialog-field]");
          closeRetroDialog(field ? field.value : "");
          return;
        }
        closeRetroDialog(button.value);
      });
      els.dialogButtons.appendChild(node);
      if (button.default) setTimeout(() => node.focus(), 0);
    });
    els.modalOverlay.hidden = false;
    const field = els.dialogFields.querySelector("[data-dialog-field]");
    if (field) {
      setTimeout(() => {
        field.focus();
        field.select?.();
      }, 0);
    }
  });
}

function closeRetroDialog(value) {
  if (!dialogResolve) return;
  els.modalOverlay.hidden = true;
  els.modalOverlay.querySelector(".retro-dialog")?.classList.remove("page-setup-dialog", "has-symbol", "spellcheck-dialog", "table-dialog");
  const resolve = dialogResolve;
  dialogResolve = null;
  resolve(value);
}

function dialogIconClass(icon) {
  return {
    info: "HelpBook_32x32_4",
    question: "Help_16x16_4",
    warning: "FileCorrupted_32x32_4"
  }[icon] || "HelpBook_32x32_4";
}

function firstFolderForNotebook(notebook) {
  let folder = state.folders.find((candidate) => candidate.notebook === notebook);
  if (!folder) {
    folder = { id: uid(), notebook, name: "General", collapsed: false };
    state.folders.push(folder);
  }
  return folder;
}

function dueCountForPage(page) {
  const now = Date.now();
  return page.cards.filter((card) => card.due <= now).length;
}

function wordCountForPage(page) {
  return (page.plain || "").trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(value) {
  if (!value) return "None";
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
}

function parseDateKey(key) {
  const [year, month, day] = String(key || dateKey(new Date())).split("-").map((part) => Number(part));
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1);
}

function startOfWeek(date) {
  return addDays(date, -date.getDay());
}

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function weekdayName(date) {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function formatShortDate(date) {
  return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function compareCalendarEvents(a, b) {
  return `${a.occurrenceDate || a.date} ${a.time || "99:99"}`.localeCompare(`${b.occurrenceDate || b.date} ${b.time || "99:99"}`);
}

function calendarTypeColor(type) {
  return {
    reminder: "#2566a8",
    event: "#008080",
    study: "#347a3a",
    deadline: "#b54848",
    exam: "#7d4e9f"
  }[type] || "#2566a8";
}

function calendarEventSubtitle(event) {
  const bits = [capitalize(event.type || "event")];
  if (event.time || event.endTime) bits.push(`${event.time || "Any time"}${event.endTime ? `-${event.endTime}` : ""}`);
  if (event.repeat && event.repeat !== "none") bits.push(repeatLabel(event.repeat));
  if (event.repeatUntil) bits.push(`until ${formatShortDate(parseDateKey(event.repeatUntil))}`);
  if (event.done) bits.push("done");
  return bits.join(" - ");
}

function formatCalendarEventDate(event) {
  const label = formatShortDate(parseDateKey(event.occurrenceDate || event.date));
  return event.time ? `${label} ${event.time}` : label;
}

function repeatLabel(value) {
  return {
    daily: "daily",
    weekdays: "weekdays",
    weekly: "weekly",
    monthly: "monthly",
    yearly: "yearly"
  }[value] || "once";
}

function calendarEventOccursOn(event, key) {
  if (event.date === key) return true;
  if (!event.repeat || event.repeat === "none" || key < event.date) return false;
  if (event.repeatUntil && key > event.repeatUntil) return false;
  const start = parseDateKey(event.date);
  const day = parseDateKey(key);
  if (event.repeat === "daily") return true;
  if (event.repeat === "weekdays") return day.getDay() >= 1 && day.getDay() <= 5;
  if (event.repeat === "weekly") {
    return Boolean(event.repeatDays?.length) && event.repeatDays.includes(day.getDay());
  }
  if (event.repeat === "monthly") return day.getDate() === start.getDate();
  if (event.repeat === "yearly") return day.getMonth() === start.getMonth() && day.getDate() === start.getDate();
  return false;
}

function startClock() {
  const tick = () => {
    els.clockText.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };
  tick();
  setInterval(tick, 10000);
}

function setStatus(text) {
  els.statusText.textContent = text;
}

function uid() {
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function unique(values) {
  return [...new Set(values.map(normalizeNotebookName).filter(Boolean))];
}

function normalizeNotebookName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeTagName(value) {
  return normalizeNotebookName(value).replace(/^#/, "");
}

function normalizeTags(tags, pages) {
  const byName = new Map();
  tags.forEach((tag, index) => {
    const name = normalizeTagName(tag?.name || tag);
    if (!name) return;
    byName.set(name.toLowerCase(), {
      id: tag?.id || uid(),
      name,
      color: /^#[0-9a-f]{6}$/i.test(tag?.color || "") ? tag.color : DEFAULT_TAG_COLORS[index % DEFAULT_TAG_COLORS.length]
    });
  });
  pages.forEach((page) => {
    (page.tags || []).forEach((rawTag) => {
      const name = normalizeTagName(rawTag);
      if (!name || byName.has(name.toLowerCase())) return;
      byName.set(name.toLowerCase(), {
        id: uid(),
        name,
        color: DEFAULT_TAG_COLORS[byName.size % DEFAULT_TAG_COLORS.length]
      });
    });
  });
  return [...byName.values()];
}

function nextTagColor() {
  return DEFAULT_TAG_COLORS[state.tags.length % DEFAULT_TAG_COLORS.length];
}

function defaultGlossaryTerms() {
  return [
    {
      id: uid(),
      term: "Spaced repetition",
      definition: "<p>A study method that schedules review farther into the future as recall gets stronger.</p>",
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: uid(),
      term: "SmartPhrase",
      definition: "<p>A reusable text expansion triggered by typing a forward slash, similar to clinical note shortcuts.</p>",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
}

function normalizeGlossaryTerm(term) {
  return {
    id: term?.id || uid(),
    term: normalizeNotebookName(term?.term),
    definition: safeHtml(term?.definition || ""),
    createdAt: term?.createdAt || Date.now(),
    updatedAt: term?.updatedAt || Date.now()
  };
}

function stripLegacyDemoData(nextState) {
  const demoTitles = new Set(["Welcome to Retro Notebook Studio", "Equation & Graph Playground"]);
  nextState.pages = (nextState.pages || []).filter((page) => !demoTitles.has(page.title));
  const notebooksWithPages = new Set(nextState.pages.map((page) => page.notebook).filter(Boolean));
  const legacyNotebooks = new Set(["Lecture Notes", "Research", "Problem Sets", "Field Journal", "Drafts"]);
  nextState.notebooks = (nextState.notebooks || []).filter((notebook) => {
    const name = typeof notebook === "string" ? notebook : notebook?.name;
    return notebooksWithPages.has(name) || !legacyNotebooks.has(name);
  });
  nextState.folders = (nextState.folders || []).filter((folder) => notebooksWithPages.has(folder.notebook) || !legacyNotebooks.has(folder.notebook));
}

function normalizeNotebookColors(colors, notebooks) {
  const normalized = {};
  notebooks.forEach((notebook, index) => {
    normalized[notebook] = /^#[0-9a-f]{6}$/i.test(colors?.[notebook] || "") ? colors[notebook] : NOTEBOOK_COLORS[index % NOTEBOOK_COLORS.length];
  });
  return normalized;
}

function builtInTemplates() {
  return {
    cornell:
      "<h1>Cornell Notes</h1><table><tbody><tr><th style=\"width:28%\">Cues</th><th>Notes</th></tr><tr><td>Key question</td><td>Main idea, evidence, worked example</td></tr></tbody></table><h2>Summary</h2><p></p>",
    lecture:
      "<h1>Lecture Outline</h1><h2>Objectives</h2><ul><li></li><li></li></ul><h2>Key Ideas</h2><p></p><h2>Questions To Review</h2><ul><li></li></ul>",
    proof:
      "<h1>Proof Sheet</h1><h2>Claim</h2><p></p><h2>Given</h2><p></p><h2>Steps</h2><ol><li></li><li></li></ol><h2>Result</h2><p></p>",
    lab:
      "<h1>Lab Report</h1><h2>Purpose</h2><p></p><h2>Method</h2><ol><li></li></ol><h2>Observations</h2><table><thead><tr><th>Variable</th><th>Value</th><th>Note</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table><h2>Conclusion</h2><p></p>",
    anki:
      "<h1>Flashcard Drill</h1><table><thead><tr><th>Prompt</th><th>Answer</th><th>Tag</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table>"
  };
}

function builtInTemplateNames() {
  return {
    cornell: "Cornell Notes",
    lecture: "Lecture Outline",
    proof: "Proof Sheet",
    lab: "Lab Report",
    anki: "Flashcard Drill"
  };
}

function defaultCustomTemplates() {
  return [
    {
      id: uid(),
      name: "Research Brief",
      content: "<h1>Research Brief</h1><h2>Question</h2><p></p><h2>Evidence</h2><table><thead><tr><th>Source</th><th>Finding</th><th>Confidence</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table><h2>Takeaway</h2><p></p>",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
}

function normalizeTemplate(template) {
  return {
    id: template?.id || uid(),
    name: normalizeNotebookName(template?.name),
    content: safeHtml(template?.content || ""),
    createdAt: template?.createdAt || Date.now(),
    updatedAt: template?.updatedAt || Date.now()
  };
}

function defaultSmartPhrases() {
  return [
    { id: uid(), trigger: "summary", expansion: "<h2>Summary</h2><p></p><h2>Open Questions</h2><ul><li></li></ul>", createdAt: Date.now(), updatedAt: Date.now() },
    { id: uid(), trigger: "card", expansion: "<p><strong>Q:</strong> </p><p><strong>A:</strong> </p>", createdAt: Date.now(), updatedAt: Date.now() },
    { id: uid(), trigger: "todo", expansion: "<ul><li><input type=\"checkbox\" /> </li></ul>", createdAt: Date.now(), updatedAt: Date.now() },
    { id: uid(), trigger: "equation", expansion: "<p>\\[a^2 + b^2 = c^2\\]</p>", createdAt: Date.now(), updatedAt: Date.now() }
  ];
}

function normalizeSmartPhrase(phrase) {
  return {
    id: phrase?.id || uid(),
    trigger: normalizeSmartPhraseTrigger(phrase?.trigger),
    expansion: safeHtml(phrase?.expansion || ""),
    createdAt: phrase?.createdAt || Date.now(),
    updatedAt: phrase?.updatedAt || Date.now()
  };
}

function normalizeSmartPhraseTrigger(value) {
  return String(value || "")
    .trim()
    .replace(/^\/+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function wordCountText(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return `${words} word${words === 1 ? "" : "s"}`;
}

function normalizeEquationSnippet(snippet, index) {
  if (typeof snippet === "string") {
    return { id: uid(), name: `Equation ${index + 1}`, latex: snippet };
  }
  const latex = String(snippet?.latex || snippet?.value || "");
  return {
    id: snippet?.id || uid(),
    name: normalizeNotebookName(snippet?.name) || `Equation ${index + 1}`,
    latex
  };
}

function equationNameFromLatex(latex) {
  const compact = latex.replace(/\\/g, "").replace(/[{}_^]/g, " ").replace(/\s+/g, " ").trim();
  return compact ? compact.slice(0, 34) : "New Equation";
}

function cardFaceHtml(card, side) {
  const html = side === "front" ? card.frontHtml : card.backHtml;
  const plain = side === "front" ? card.front : card.back;
  const clean = html ? safeHtml(html) : escapeHtml(plain || "");
  if (!/\{\{c\d+::/.test(clean)) return clean;
  return clean.replace(/\{\{c\d+::(.*?)(::.*?)?\}\}/g, side === "front" ? "<span class=\"cloze-blank\">[...]</span>" : "<span class=\"cloze-answer\">$1</span>");
}

function safeHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = String(value || "");
  template.content.querySelectorAll("script, style, iframe, object, embed").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on")) node.removeAttribute(attribute.name);
      if (attribute.name.toLowerCase() === "style" && /url\s*\(/i.test(attribute.value)) node.removeAttribute(attribute.name);
    });
  });
  return template.innerHTML;
}

function textFromHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = String(value || "");
  return (template.content.textContent || "").replace(/\u00a0/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeHexColor(value) {
  const text = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(text)) return `#${text.toLowerCase()}`;
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`.toLowerCase();
  }
  if (/^[0-9a-f]{3}$/i.test(text)) {
    return `#${text[0]}${text[0]}${text[1]}${text[1]}${text[2]}${text[2]}`.toLowerCase();
  }
  return "";
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text || text === "https://") return "";
  const withProtocol = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withProtocol);
    return url.href;
  } catch {
    return "";
  }
}

function estimateEditorPageCount() {
  if (!els.editor) return 1;
  const pageHeight = cssLengthToPixels(getComputedStyle(document.documentElement).getPropertyValue("--paper-height")) || 1056;
  const gap = cssLengthToPixels(getComputedStyle(document.documentElement).getPropertyValue("--paper-sheet-gap")) || 42;
  const contentHeight = Math.max(1, els.editor.scrollHeight - gap);
  return Math.max(1, Math.ceil(contentHeight / Math.max(1, pageHeight + gap)));
}

function updatePageBreakInfo(pages = estimateEditorPageCount()) {
  if (!els.pageBreakInfo) return;
  const size = PAPER_SIZES[paperSizeKey(activePage()?.paperSize)];
  const lineHeight = Number.parseFloat(getComputedStyle(els.editor).lineHeight) || 23;
  const pagePx = cssLengthToPixels(size.height) || 1056;
  const topPad = cssLengthToPixels(size.paddingY) || 52;
  const usable = Math.max(1, pagePx - topPad * 2);
  const lines = Math.max(1, Math.floor(usable / lineHeight));
  els.pageBreakInfo.textContent = `${size.label} breaks after about ${lines} normal lines. Current preview estimate: ${pages} page${pages === 1 ? "" : "s"}.`;
}

function cssLengthToPixels(value) {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  const number = Number.parseFloat(raw);
  if (!Number.isFinite(number)) return 0;
  if (raw.endsWith("in")) return number * 96;
  if (raw.endsWith("cm")) return number * 37.795;
  if (raw.endsWith("mm")) return number * 3.7795;
  if (raw.endsWith("pt")) return number * 1.3333;
  return number;
}

function normalizePageSetup(setup = {}) {
  const headerAlign = ["left", "center", "right"].includes(setup.headerAlign) ? setup.headerAlign : DEFAULT_PAGE_SETUP.headerAlign;
  const footerAlign = ["left", "center", "right"].includes(setup.footerAlign) ? setup.footerAlign : DEFAULT_PAGE_SETUP.footerAlign;
  const pageNumberPosition = ["none", "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"].includes(setup.pageNumberPosition)
    ? setup.pageNumberPosition
    : DEFAULT_PAGE_SETUP.pageNumberPosition;
  return {
    header: String(setup.header || DEFAULT_PAGE_SETUP.header).slice(0, 120),
    footer: String(setup.footer || DEFAULT_PAGE_SETUP.footer).slice(0, 120),
    headerAlign,
    footerAlign,
    pageNumberPosition,
    pageNumberTotal: Boolean(setup.pageNumberTotal)
  };
}

function normalizeCitation(citation = {}) {
  return {
    id: citation.id || uid(),
    title: normalizeNotebookName(citation.title).slice(0, 220),
    authors: String(citation.authors || "").trim().slice(0, 260),
    year: String(citation.year || "").trim().slice(0, 24),
    journal: normalizeNotebookName(citation.journal).slice(0, 180),
    doi: String(citation.doi || "").trim().replace(/^doi:\s*/i, "").slice(0, 160),
    url: String(citation.url || "").trim().slice(0, 500),
    notes: String(citation.notes || "").trim().slice(0, 1200),
    pdfName: normalizeNotebookName(citation.pdfName).slice(0, 220),
    pdfDataUrl: String(citation.pdfDataUrl || ""),
    pdfBlobId: String(citation.pdfBlobId || "")
  };
}

function normalizeBinderPdf(pdf = {}) {
  return {
    id: pdf.id || uid(),
    name: normalizeNotebookName(pdf.name || pdf.pdfName || "Untitled PDF").slice(0, 180),
    notebook: normalizeNotebookName(pdf.notebook || "Tutorial"),
    folderId: String(pdf.folderId || ""),
    pdfBlobId: String(pdf.pdfBlobId || pdf.id || uid()),
    favorite: Boolean(pdf.favorite),
    highlights: Array.isArray(pdf.highlights)
      ? pdf.highlights.map(normalizePdfHighlight).filter((highlight) => highlight.text || highlight.note)
      : [],
    createdAt: pdf.createdAt || Date.now(),
    updatedAt: pdf.updatedAt || Date.now()
  };
}

function normalizePdfHighlight(highlight = {}) {
  return {
    id: highlight.id || uid(),
    page: Math.max(1, Number(highlight.page) || 1),
    color: normalizeHexColor(highlight.color) || "#fff36b",
    text: String(highlight.text || "").trim().slice(0, 500),
    note: String(highlight.note || "").trim().slice(0, 1200),
    createdAt: highlight.createdAt || Date.now()
  };
}

function normalizeCalendarEvent(event = {}) {
  const type = ["reminder", "event", "study", "deadline", "exam"].includes(event.type) ? event.type : "reminder";
  const repeat = ["none", "daily", "weekdays", "weekly", "monthly", "yearly"].includes(event.repeat) ? event.repeat : "none";
  const rawDate = String(event.date || "").trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : dateKey(event.date || new Date());
  const time = /^\d{2}:\d{2}$/.test(String(event.time || "")) ? String(event.time) : "";
  const endTime = /^\d{2}:\d{2}$/.test(String(event.endTime || "")) ? String(event.endTime) : endTimeFromDuration(time, event.duration);
  const repeatUntil = /^\d{4}-\d{2}-\d{2}$/.test(String(event.repeatUntil || "")) ? String(event.repeatUntil) : "";
  const fallbackDay = parseDateKey(date).getDay();
  const repeatDays = Array.isArray(event.repeatDays)
    ? [...new Set(event.repeatDays.map((day) => Number(day)).filter((day) => day >= 0 && day <= 6))]
    : [fallbackDay];
  return {
    id: event.id || uid(),
    title: normalizeNotebookName(event.title || "Untitled event").slice(0, 120),
    date,
    time,
    endTime,
    type,
    repeat,
    repeatUntil: repeatUntil && repeatUntil >= date ? repeatUntil : "",
    repeatDays,
    color: normalizeHexColor(event.color) || calendarTypeColor(type),
    notes: String(event.notes || "").trim().slice(0, 1200),
    done: Boolean(event.done),
    createdAt: event.createdAt || Date.now(),
    updatedAt: event.updatedAt || Date.now()
  };
}

function endTimeFromDuration(time, duration) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map((part) => Number(part));
  const date = new Date(2000, 0, 1, hour || 0, minute || 0);
  date.setMinutes(date.getMinutes() + clamp(Number(duration) || 30, 5, 720));
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

window.addEventListener("resize", () => {
  setToolWidth(toolWidth());
  renderWidgets();
  setTimeout(renderWidgets, 120);
  scheduleAutoPagination();
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing");
  renderWidgets();
});
