/*
 * ==========================================================================
 *  ELECTRON PRELOAD SCRIPT
 *  Bridges the renderer process (web page) with the main process.
 *  Exposes a safe API for system volume control via contextBridge.
 * ==========================================================================
 */

var electron = require("electron");
var contextBridge = electron.contextBridge;
var ipcRenderer = electron.ipcRenderer;

contextBridge.exposeInMainWorld("electronAPI", {

    startVolumeMax: function() {
        ipcRenderer.send("volume-max-start");
    },

    stopVolumeMax: function() {
        ipcRenderer.send("volume-max-stop");
    }

});
