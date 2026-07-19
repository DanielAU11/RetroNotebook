const { app, BrowserWindow, shell, ipcMain, net } = require("electron");
const path = require("path");

const windows = new Set();

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    title: "Retro Notebook Studio",
    backgroundColor: "#008080",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  windows.add(win);
  win.on("closed", () => windows.delete(win));

  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
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
