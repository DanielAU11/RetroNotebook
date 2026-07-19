const { contextBridge, clipboard, nativeImage } = require("electron");

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
  }
});
