const { contextBridge, clipboard, nativeImage, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("retroNotebook", {
  platform: process.platform,
  versions: process.versions,
  clipboard: {
    readText: () => clipboard.readText(),
    writeText: (text) => clipboard.writeText(String(text || "")),
    readImageDataUrl: () => {
      const image = clipboard.readImage();
      return image.isEmpty() ? "" : image.toDataURL();
    },
    writeImageDataUrl: (dataUrl) => {
      const image = nativeImage.createFromDataURL(String(dataUrl || ""));
      if (image.isEmpty()) return false;
      clipboard.writeImage(image);
      return true;
    }
  },
  citation: {
    fetchText: (url) => ipcRenderer.invoke("citation:fetchText", String(url || ""))
  },
  spellcheck: {
    onContext: (callback) => {
      const listener = (_event, payload) => callback(payload || {});
      ipcRenderer.on("spellcheck:context", listener);
      return () => ipcRenderer.removeListener("spellcheck:context", listener);
    },
    replace: (suggestion) => ipcRenderer.invoke("spellcheck:replace", String(suggestion || "")),
    addToDictionary: (word) => ipcRenderer.invoke("spellcheck:add", String(word || "")),
    suggest: (word) => ipcRenderer.invoke("spellcheck:suggest", String(word || "")),
    checkWords: (words) => ipcRenderer.invoke("spellcheck:checkWords", Array.isArray(words) ? words.map((word) => String(word || "")) : [])
  }
});
