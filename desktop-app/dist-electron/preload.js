"use strict";
const electron = require("electron");
const electronAPI = {
  // 设备管理
  getDevices: () => electron.ipcRenderer.invoke("get-devices"),
  getScreenshot: (deviceId) => electron.ipcRenderer.invoke("get-screenshot", deviceId),
  checkAdb: () => electron.ipcRenderer.invoke("check-adb"),
  // 任务管理
  runTask: (task) => electron.ipcRenderer.invoke("run-task", task),
  stopTask: () => electron.ipcRenderer.invoke("stop-task"),
  // 配置管理
  getConfig: () => electron.ipcRenderer.invoke("get-config"),
  saveConfig: (config) => electron.ipcRenderer.invoke("save-config", config),
  // 应用数据管理（记忆、规则）
  getAppData: () => electron.ipcRenderer.invoke("get-app-data"),
  saveAppData: (data) => electron.ipcRenderer.invoke("save-app-data", data),
  // 事件监听
  onTaskOutput: (callback) => {
    electron.ipcRenderer.on("task-output", (_, data) => callback(data));
  },
  onTaskComplete: (callback) => {
    electron.ipcRenderer.on("task-complete", (_, data) => callback(data));
  },
  // 移除监听器
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
