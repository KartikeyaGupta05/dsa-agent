const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("agent", {
  run: (data) => ipcRenderer.invoke("run-agent", data),

  browseFile: () =>
    ipcRenderer.invoke("browse-java-file"),

  saveSettings: (data) =>
    ipcRenderer.invoke("save-settings", data),

  getSettings: () =>
    ipcRenderer.invoke("get-settings")
});