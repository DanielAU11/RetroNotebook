const { app, BrowserWindow, shell, ipcMain, net } = require("electron");
const path = require("path");
const dictionary = require("dictionary-en-us");
const nspell = require("nspell");

const windows = new Set();
const appIconPath = path.join(__dirname, "..", "appicon.ico");
let spellchecker = null;
const spellcheckerReady = new Promise((resolve) => {
  dictionary((error, dict) => {
    if (!error) {
      try {
        spellchecker = nspell(dict);
      } catch {
        spellchecker = null;
      }
    }
    resolve(spellchecker);
  });
});

function normalizedSpellWord(word) {
  return String(word || "").trim().replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
}

async function suggestSpellings(word) {
  const value = normalizedSpellWord(word);
  const checker = await spellcheckerReady;
  if (!value || !checker) return { word: value, correct: true, suggestions: [] };
  return {
    word: value,
    correct: checker.correct(value),
    suggestions: checker.suggest(value).filter(Boolean).slice(0, 8)
  };
}

ipcMain.handle("citation:fetchText", async (_event, rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: "Only http and https links are supported." };
  try {
    const response = await net.fetch(url, { redirect: "follow" });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      text: text.slice(0, 650000)
    };
  } catch (error) {
    return { ok: false, error: error.message || "Could not fetch citation metadata." };
  }
});

ipcMain.handle("spellcheck:replace", (event, suggestion) => {
  const replacement = String(suggestion || "").trim();
  if (!replacement) return false;
  try {
    event.sender.replaceMisspelling(replacement);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("spellcheck:add", (event, word) => {
  const value = String(word || "").trim();
  if (!value) return false;
  try {
    if (spellchecker) spellchecker.add(value);
    event.sender.session.addWordToSpellCheckerDictionary(value);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("spellcheck:suggest", async (_event, word) => suggestSpellings(word));

ipcMain.handle("spellcheck:checkWords", async (_event, words) => {
  const uniqueWords = [...new Set((Array.isArray(words) ? words : []).map(normalizedSpellWord).filter(Boolean).slice(0, 500))];
  const results = await Promise.all(uniqueWords.map(suggestSpellings));
  return results;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    title: "Retro Notebook Studio",
    icon: appIconPath,
    backgroundColor: "#008080",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    }
  });
  windows.add(win);
  win.on("closed", () => windows.delete(win));
  try {
    win.webContents.session.setSpellCheckerLanguages(["en-US"]);
  } catch {
    // Keep startup resilient on platforms where spellchecker languages are managed by the OS.
  }

  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("context-menu", (_event, params) => {
    win.webContents.send("spellcheck:context", {
      word: params.misspelledWord || "",
      suggestions: (params.dictionarySuggestions || []).slice(0, 6),
      x: params.x,
      y: params.y,
      isEditable: Boolean(params.isEditable)
    });
  });
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.retronotebook.studio");
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
