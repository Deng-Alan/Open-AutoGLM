"use strict";
const electron = require("electron");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
let mainWindow = null;
let pythonProcess = null;
const getPythonScriptPath = () => {
  const projectRoot = path.join(__dirname, "..", "..");
  return path.join(projectRoot, "main.py");
};
const getConfigPath = () => {
  const userDataPath = electron.app.getPath("userData");
  return path.join(userDataPath, "config.json");
};
const getAppDataPath = () => {
  const userDataPath = electron.app.getPath("userData");
  return path.join(userDataPath, "app-data.json");
};
const loadConfig = () => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (error) {
    console.error("加载配置失败:", error);
  }
  return {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "autoglm-phone",
    apiKey: "",
    maxSteps: 10,
    lang: "cn"
  };
};
const saveConfig = (config) => {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("保存配置失败:", error);
  }
};
const loadAppData = () => {
  try {
    const dataPath = getAppDataPath();
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    }
  } catch (error) {
    console.error("加载应用数据失败:", error);
  }
  return {
    memories: [],
    bannedOperations: [],
    executionRules: []
  };
};
const saveAppData = (data) => {
  try {
    const dataPath = getAppDataPath();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("保存应用数据失败:", error);
  }
};
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: "hiddenInset",
    frame: true,
    backgroundColor: "#0a0a0f",
    show: false
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow == null ? void 0 : mainWindow.show();
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.ipcMain.handle("get-devices", async () => {
  return new Promise((resolve) => {
    const adb = child_process.spawn("adb", ["devices"], { shell: true });
    let output = "";
    adb.stdout.on("data", (data) => {
      output += data.toString();
    });
    adb.on("close", () => {
      const lines = output.split("\n").slice(1);
      const devices = lines.filter((line) => line.trim() && line.includes("	")).map((line) => {
        const [id, status] = line.split("	").map((s) => s.trim());
        return { id, status, type: "adb" };
      });
      resolve(devices);
    });
    adb.on("error", () => {
      resolve([]);
    });
  });
});
electron.ipcMain.handle("get-screenshot", async (_, deviceId) => {
  return new Promise((resolve) => {
    const args = deviceId ? ["-s", deviceId, "exec-out", "screencap", "-p"] : ["exec-out", "screencap", "-p"];
    const adb = child_process.spawn("adb", args, { shell: true });
    const chunks = [];
    adb.stdout.on("data", (data) => {
      chunks.push(data);
    });
    adb.on("close", (code) => {
      if (code === 0 && chunks.length > 0) {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString("base64");
        resolve(`data:image/png;base64,${base64}`);
      } else {
        resolve(null);
      }
    });
    adb.on("error", () => {
      resolve(null);
    });
  });
});
electron.ipcMain.handle("run-task", async (event, task) => {
  const config = loadConfig();
  const scriptPath = getPythonScriptPath();
  return new Promise((resolve, reject) => {
    var _a, _b;
    const args = [
      scriptPath,
      "--base-url",
      config.baseUrl,
      "--model",
      config.model,
      "--apikey",
      config.apiKey,
      "--max-steps",
      config.maxSteps.toString(),
      "--lang",
      config.lang,
      task
    ];
    pythonProcess = child_process.spawn("python", args, {
      shell: true,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });
    (_a = pythonProcess.stdout) == null ? void 0 : _a.on("data", (data) => {
      const message = data.toString();
      mainWindow == null ? void 0 : mainWindow.webContents.send("task-output", { type: "stdout", message });
    });
    (_b = pythonProcess.stderr) == null ? void 0 : _b.on("data", (data) => {
      const message = data.toString();
      mainWindow == null ? void 0 : mainWindow.webContents.send("task-output", { type: "stderr", message });
    });
    pythonProcess.on("close", (code) => {
      pythonProcess = null;
      mainWindow == null ? void 0 : mainWindow.webContents.send("task-complete", { code });
      resolve({ code });
    });
    pythonProcess.on("error", (error) => {
      pythonProcess = null;
      reject(error);
    });
  });
});
electron.ipcMain.handle("stop-task", async () => {
  if (pythonProcess) {
    pythonProcess.kill("SIGTERM");
    pythonProcess = null;
    return true;
  }
  return false;
});
electron.ipcMain.handle("get-config", async () => {
  return loadConfig();
});
electron.ipcMain.handle("save-config", async (_, config) => {
  saveConfig(config);
  return true;
});
electron.ipcMain.handle("check-adb", async () => {
  return new Promise((resolve) => {
    const adb = child_process.spawn("adb", ["version"], { shell: true });
    adb.on("close", (code) => {
      resolve(code === 0);
    });
    adb.on("error", () => {
      resolve(false);
    });
  });
});
electron.ipcMain.handle("get-app-data", async () => {
  return loadAppData();
});
electron.ipcMain.handle("save-app-data", async (_, data) => {
  saveAppData(data);
  return true;
});
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  if (pythonProcess) {
    pythonProcess.kill("SIGTERM");
  }
});
