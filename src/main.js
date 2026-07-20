const { app, BrowserWindow, shell, ipcMain, net } = require("electron");
const path = require("path");

const windows = new Set();
const appIconPath = path.join(__dirname, "..", "appicon.ico");

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
    event.sender.session.addWordToSpellCheckerDictionary(value);
    return true;
  } catch {
    return false;
  }
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
