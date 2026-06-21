import dotenv from "dotenv";
dotenv.config();
import store from "../src/config/store.js";

import {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} from "electron";

import path from "path";

import { fileURLToPath } from "url";

import { runDsaAgent }
from "../src/agent/dsaAgent.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

function createWindow() {

  const win =
    new BrowserWindow({
      width: 900,
      height: 700,

      webPreferences: {
        preload: path.join(
          __dirname,
          "preload.js"
        )
      }
    });

  win.loadFile(
    path.join(
      __dirname,
      "..",
      "renderer",
      "index.html"
    )
  );

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle(
  "run-agent",
  async (_, data) => {

    return await runDsaAgent(
      data,
      {
        skipGit: false
      }
    );
  }
);

ipcMain.handle(
  "browse-java-file",
  async () => {

    const result =
      await dialog.showOpenDialog({
        properties: ["openFile"],

        filters: [
          {
            name: "Java Files",
            extensions: ["java"]
          }
        ]
      });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  }
);

ipcMain.handle(
  "save-settings",
  async (_, data) => {

    store.set(
      "geminiKey",
      data.geminiKey
    );

    store.set(
      "placementRepoPath",
      data.repoPath
    );

    return true;
  }
);

ipcMain.handle(
  "get-settings",
  async () => {

    return {
      geminiKey:
        store.get("geminiKey", ""),

      repoPath:
        store.get(
          "placementRepoPath",
          ""
        )
    };
  }
);