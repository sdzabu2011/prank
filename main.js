/*
 * ==========================================================================
 *  ELECTRON MAIN PROCESS
 *  Creates a kiosk-mode fullscreen window. Controls system volume on
 *  Windows via PowerShell by sending Volume Up key events repeatedly.
 *  Blocks Alt+F4, Ctrl+W, and Escape to prevent easy exit.
 *  The app can still be killed via Task Manager (Ctrl+Alt+Delete).
 * ==========================================================================
 */

var electron = require("electron");
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;
var path = require("path");
var child_process = require("child_process");

var mainWindow = null;
var volumeEnforcerInterval = null;


/* ==========================================================================
   WINDOW CREATION
   ========================================================================== */

function createMainWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        kiosk: true,
        resizable: false,
        minimizable: false,
        closable: false,
        movable: false,
        focusable: true,
        titleBarStyle: "hidden",
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    mainWindow.loadFile("index.html");

    mainWindow.on("close", function(event) {
        event.preventDefault();
    });

    mainWindow.on("blur", function() {
        if (mainWindow) {
            mainWindow.focus();
        }
    });

    mainWindow.webContents.on("before-input-event", function(event, input) {
        var shouldBlock = false;

        if (input.alt && input.key === "F4") {
            shouldBlock = true;
        }
        if (input.control && input.key === "w") {
            shouldBlock = true;
        }
        if (input.key === "Escape") {
            shouldBlock = true;
        }
        if (input.control && input.shift && input.key === "I") {
            shouldBlock = true;
        }
        if (input.key === "F12") {
            shouldBlock = true;
        }
        if (input.alt && input.key === "Tab") {
            shouldBlock = true;
        }

        if (shouldBlock) {
            event.preventDefault();
        }
    });
}


/* ==========================================================================
   SYSTEM VOLUME CONTROL (WINDOWS)
   Uses PowerShell COM object to send Volume Up key events.
   Sending VK_VOLUME_UP (0xAF) 50 times guarantees max volume.
   ========================================================================== */

function setSystemVolumeToMax() {
    if (process.platform !== "win32") {
        return;
    }

    var command = 'powershell -WindowStyle Hidden -Command "';
    command += "$wsh = New-Object -ComObject WScript.Shell; ";
    command += "for ($i = 0; $i -lt 50; $i++) { ";
    command += "$wsh.SendKeys([char]0xAF) ";
    command += '}"';

    child_process.exec(command, function(error) {
        if (error) {
            /* Volume control failed - continue silently */
        }
    });
}

function startVolumeEnforcement() {
    setSystemVolumeToMax();

    if (volumeEnforcerInterval) {
        clearInterval(volumeEnforcerInterval);
    }

    volumeEnforcerInterval = setInterval(function() {
        setSystemVolumeToMax();
    }, 3000);
}

function stopVolumeEnforcement() {
    if (volumeEnforcerInterval) {
        clearInterval(volumeEnforcerInterval);
        volumeEnforcerInterval = null;
    }
}


/* ==========================================================================
   IPC HANDLERS
   Communication between renderer process and main process.
   ========================================================================== */

ipcMain.on("volume-max-start", function() {
    startVolumeEnforcement();
});

ipcMain.on("volume-max-stop", function() {
    stopVolumeEnforcement();
});


/* ==========================================================================
   APP LIFECYCLE
   ========================================================================== */

app.whenReady().then(function() {
    createMainWindow();
});

app.on("window-all-closed", function() {
    app.quit();
});

app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
