/*
 * ==========================================================================
 *  COUNTDOWN HORROR PRANK APPLICATION
 *  Full-featured prank app with device scanning, audio amplification,
 *  flashlight control, vibration, fake downloads, and ransom screen.
 *  Designed for educational/entertainment purposes only.
 * ==========================================================================
 */


/* ==========================================================================
   SECTION 1: CONFIGURATION
   All adjustable settings are centralized here.
   ========================================================================== */

var CONFIG = {
    countdownStart: 10,
    scareDurationSeconds: 60,
    ransomHours: 23,
    ransomMinutes: 59,
    ransomSeconds: 59,
    cardNumber: "4790 9122 0712 0835",
    audioGainValue: 5.0,
    matrixFontSize: 14,
    matrixSpeed: 50,
    matrixOpacity: 0.12,
    typewriterCharDelay: 18,
    scanLineBaseDelay: 400,
    vibratePatternScare: [300, 100, 300, 100, 500],
    vibrateIntervalMs: 1500,
    fullscreenRetryMs: 500,
    downloadProgressSpeed: 180,
    fakeFiles: [
        { name: "trojan_rootkit_v3.2.zip", size: "4.2 MB" },
        { name: "keylogger_stealth.dat", size: "1.8 MB" },
        { name: "system_backdoor.sys", size: "12.6 MB" },
        { name: "crypto_harvester.apk", size: "8.4 MB" },
        { name: "data_exfiltrator.exe", size: "3.1 MB" },
        { name: "cam_stream_relay.bin", size: "6.7 MB" },
        { name: "network_sniffer.dll", size: "2.3 MB" },
        { name: "password_dump.sql", size: "15.9 MB" },
        { name: "screen_capture_daemon.so", size: "5.5 MB" },
        { name: "gps_tracker_silent.jar", size: "3.8 MB" }
    ],
    scanWarnings: [
        "[!] SYSTEM INTEGRITY COMPROMISED",
        "[!] FIREWALL DISABLED",
        "[!] ANTIVIRUS BYPASSED",
        "[!] KERNEL ACCESS OBTAINED",
        "[!] ROOT PRIVILEGES ESCALATED",
        "[!] ALL DEFENSES DOWN"
    ]
};


/* ==========================================================================
   SECTION 2: APPLICATION STATE
   Tracks the current state of the entire application.
   ========================================================================== */

var appState = {
    currentStage: 0,
    totalStages: 7,
    flashlightStream: null,
    audioContext: null,
    gainNode: null,
    audioSource: null,
    batteryData: null,
    locationData: null,
    vibrateLoopId: null,
    matrixAnimationId: null,
    isElectron: false,
    isFullscreen: false,
    scareActive: false,
    ransomActive: false
};


/* ==========================================================================
   SECTION 3: STAGE IDENTIFIERS
   Maps stage index to DOM element IDs.
   ========================================================================== */

var STAGE_IDS = [
    "stage-1",
    "stage-2",
    "stage-3",
    "stage-4",
    "stage-5",
    "stage-6",
    "stage-7"
];


/* ==========================================================================
   SECTION 4: UTILITY FUNCTIONS
   Helper functions used throughout the application.
   ========================================================================== */

function sleep(milliseconds) {
    return new Promise(function(resolve) {
        setTimeout(resolve, milliseconds);
    });
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function generateFakeIMEI() {
    var digits = "";
    var i;
    for (i = 0; i < 15; i++) {
        digits += randomInt(0, 9).toString();
    }
    return digits.substring(0, 4) + "-" +
           digits.substring(4, 8) + "-" +
           digits.substring(8, 12) + "-" +
           digits.substring(12, 15);
}

function generateFakeMAC() {
    var parts = [];
    var i;
    for (i = 0; i < 6; i++) {
        parts.push(randomInt(0, 255).toString(16).toUpperCase().padStart(2, "0"));
    }
    return parts.join(":");
}

function generateFakeSerialNumber() {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var serial = "";
    var i;
    for (i = 0; i < 12; i++) {
        serial += chars.charAt(randomInt(0, chars.length - 1));
    }
    return serial;
}

function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateFakeIPv4() {
    return randomInt(1, 255) + "." +
           randomInt(0, 255) + "." +
           randomInt(0, 255) + "." +
           randomInt(1, 254);
}

function generateFakeIPv6() {
    var parts = [];
    var i;
    for (i = 0; i < 8; i++) {
        parts.push(randomInt(0, 65535).toString(16).padStart(4, "0"));
    }
    return parts.join(":");
}

function padZero(num, len) {
    return String(num).padStart(len || 2, "0");
}

function detectElectron() {
    if (typeof window !== "undefined" && typeof window.electronAPI !== "undefined") {
        appState.isElectron = true;
        return true;
    }
    return false;
}


/* ==========================================================================
   SECTION 5: MATRIX RAIN BACKGROUND
   Creates the iconic Matrix-style falling character animation on a canvas.
   ========================================================================== */

var matrixState = {
    canvas: null,
    ctx: null,
    columns: 0,
    drops: [],
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$%&*(){}[]|/\\<>?!~^#=+-_"
};

function initMatrixCanvas() {
    matrixState.canvas = document.getElementById("matrix-canvas");
    if (!matrixState.canvas) {
        return;
    }
    matrixState.ctx = matrixState.canvas.getContext("2d");

    resizeMatrixCanvas();
    window.addEventListener("resize", resizeMatrixCanvas);

    appState.matrixAnimationId = setInterval(drawMatrixFrame, CONFIG.matrixSpeed);
}

function resizeMatrixCanvas() {
    matrixState.canvas.width = window.innerWidth;
    matrixState.canvas.height = window.innerHeight;

    var oldCols = matrixState.columns;
    matrixState.columns = Math.floor(matrixState.canvas.width / CONFIG.matrixFontSize);

    if (matrixState.columns !== oldCols) {
        var newDrops = [];
        var i;
        for (i = 0; i < matrixState.columns; i++) {
            if (i < matrixState.drops.length) {
                newDrops[i] = matrixState.drops[i];
            } else {
                newDrops[i] = randomInt(0, Math.floor(matrixState.canvas.height / CONFIG.matrixFontSize));
            }
        }
        matrixState.drops = newDrops;
    }
}

function drawMatrixFrame() {
    var ctx = matrixState.ctx;
    var canvas = matrixState.canvas;
    var fontSize = CONFIG.matrixFontSize;
    var chars = matrixState.chars;
    var drops = matrixState.drops;
    var columns = matrixState.columns;

    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + "px monospace";

    var i;
    for (i = 0; i < columns; i++) {
        var charIndex = randomInt(0, chars.length - 1);
        var character = chars.charAt(charIndex);

        var green = 150 + randomInt(0, 105);
        var alpha = randomFloat(0.4, 1.0);
        ctx.fillStyle = "rgba(0, " + green + ", 0, " + alpha + ")";

        var x = i * fontSize;
        var y = drops[i] * fontSize;

        ctx.fillText(character, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}


/* ==========================================================================
   SECTION 6: AUDIO AMPLIFICATION SYSTEM
   Uses Web Audio API to amplify audio output beyond normal browser limits.
   This makes the audio extremely loud through the device speakers.
   ========================================================================== */

function setupAudioAmplification() {
    var audioElement = document.getElementById("audio-scare");
    if (!audioElement) {
        return false;
    }

    try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return false;
        }

        appState.audioContext = new AudioContextClass();
        appState.audioSource = appState.audioContext.createMediaElementSource(audioElement);
        appState.gainNode = appState.audioContext.createGain();

        appState.gainNode.gain.value = CONFIG.audioGainValue;

        appState.audioSource.connect(appState.gainNode);
        appState.gainNode.connect(appState.audioContext.destination);

        return true;
    } catch (err) {
        return false;
    }
}

function playScareAudio() {
    var audioElement = document.getElementById("audio-scare");
    if (!audioElement) {
        return;
    }

    audioElement.volume = 1.0;
    audioElement.loop = true;
    audioElement.currentTime = 0;

    if (appState.audioContext && appState.audioContext.state === "suspended") {
        appState.audioContext.resume();
    }

    var playPromise = audioElement.play();
    if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(function() {
            /* Audio autoplay blocked - continue without audio */
        });
    }

    if (appState.isElectron && window.electronAPI) {
        window.electronAPI.startVolumeMax();
    }
}

function stopScareAudio() {
    var audioElement = document.getElementById("audio-scare");
    if (!audioElement) {
        return;
    }

    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement.loop = false;

    if (appState.isElectron && window.electronAPI) {
        window.electronAPI.stopVolumeMax();
    }
}


/* ==========================================================================
   SECTION 7: FLASHLIGHT CONTROLLER
   Uses the MediaDevices API with torch constraint to control the device
   flashlight. Only works on devices with a rear-facing camera flash.
   ========================================================================== */

function enableFlashlight() {
    var constraints = {
        video: {
            facingMode: "environment",
            advanced: [{ torch: true }]
        }
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return Promise.resolve(false);
    }

    return navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            appState.flashlightStream = stream;
            var track = stream.getVideoTracks()[0];
            if (track) {
                return track.applyConstraints({
                    advanced: [{ torch: true }]
                }).then(function() {
                    return true;
                });
            }
            return false;
        })
        .catch(function() {
            return false;
        });
}

function disableFlashlight() {
    if (appState.flashlightStream) {
        var tracks = appState.flashlightStream.getTracks();
        var i;
        for (i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
        appState.flashlightStream = null;
    }
}


/* ==========================================================================
   SECTION 8: VIBRATION CONTROLLER
   Controls device vibration patterns for haptic feedback during scare.
   ========================================================================== */

function startVibrateLoop() {
    if (!navigator.vibrate) {
        return;
    }

    navigator.vibrate(CONFIG.vibratePatternScare);

    appState.vibrateLoopId = setInterval(function() {
        if (navigator.vibrate) {
            navigator.vibrate(CONFIG.vibratePatternScare);
        }
    }, CONFIG.vibrateIntervalMs);
}

function stopVibrateLoop() {
    if (appState.vibrateLoopId) {
        clearInterval(appState.vibrateLoopId);
        appState.vibrateLoopId = null;
    }

    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
}

function vibrateOnce(duration) {
    if (navigator.vibrate) {
        navigator.vibrate(duration || 100);
    }
}


/* ==========================================================================
   SECTION 9: FULLSCREEN CONTROLLER
   Manages fullscreen mode and prevents easy exit during critical stages.
   ========================================================================== */

function enterFullscreen() {
    var el = document.documentElement;

    try {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
        appState.isFullscreen = true;
    } catch (err) {
        appState.isFullscreen = false;
    }
}

function setupFullscreenPersistence() {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);
}

function onFullscreenChange() {
    var isFS = document.fullscreenElement ||
               document.webkitFullscreenElement ||
               document.mozFullScreenElement ||
               document.msFullscreenElement;

    appState.isFullscreen = !!isFS;

    if (!isFS && appState.ransomActive) {
        setTimeout(function() {
            enterFullscreen();
        }, CONFIG.fullscreenRetryMs);
    }
}


/* ==========================================================================
   SECTION 10: TYPEWRITER EFFECT
   Animates text appearing character by character in terminal-style.
   ========================================================================== */

function typewriterLine(containerElement, text, charDelay) {
    var delay = charDelay || CONFIG.typewriterCharDelay;

    return new Promise(function(resolve) {
        var p = document.createElement("p");
        p.className = "scan-line";

        if (text.indexOf("[!]") >= 0 ||
            text.indexOf("COMPROMISED") >= 0 ||
            text.indexOf("CRITICAL") >= 0 ||
            text.indexOf("EXTRACTED") >= 0 ||
            text.indexOf("WARNING") >= 0 ||
            text.indexOf("VULNERABLE") >= 0) {
            p.classList.add("line-danger");
        }

        containerElement.appendChild(p);

        var index = 0;
        var interval = setInterval(function() {
            if (index < text.length) {
                p.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, delay);
    });
}


/* ==========================================================================
   SECTION 11: STAGE TRANSITION SYSTEM
   Manages visibility transitions between application stages.
   ========================================================================== */

function transitionToStage(targetIndex) {
    if (targetIndex < 0 || targetIndex >= appState.totalStages) {
        return;
    }

    var currentElement = document.getElementById(STAGE_IDS[appState.currentStage]);
    if (currentElement) {
        currentElement.classList.remove("active");
    }

    setTimeout(function() {
        appState.currentStage = targetIndex;
        var targetElement = document.getElementById(STAGE_IDS[targetIndex]);
        if (targetElement) {
            targetElement.classList.add("active");
        }

        STAGE_HANDLERS[targetIndex]();
    }, 600);
}


/* ==========================================================================
   SECTION 12: PERMISSION STAGE (STAGE 1)
   Requests real browser permissions to add realism.
   Camera, Location, Notifications, and fake File access.
   ========================================================================== */

function handlePermissionStage() {
    var btnGrant = document.getElementById("btn-grant");
    if (!btnGrant) {
        return;
    }

    btnGrant.onclick = function() {
        btnGrant.disabled = true;
        btnGrant.textContent = "ACQUIRING ACCESS...";

        requestAllPermissions().then(function() {
            return sleep(800);
        }).then(function() {
            setupAudioAmplification();
            enterFullscreen();
            transitionToStage(1);
        });
    };
}

function requestAllPermissions() {
    return requestCameraPermission()
        .then(function() {
            return sleep(600);
        })
        .then(function() {
            return requestLocationPermission();
        })
        .then(function() {
            return sleep(600);
        })
        .then(function() {
            return requestNotificationPermission();
        })
        .then(function() {
            return sleep(600);
        })
        .then(function() {
            return requestFakeFilePermission();
        });
}

function requestCameraPermission() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updatePermBadge("perm-camera", "BYPASSED", false);
        return Promise.resolve();
    }

    return navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            var tracks = stream.getTracks();
            var i;
            for (i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
            updatePermBadge("perm-camera", "GRANTED", true);
        })
        .catch(function() {
            updatePermBadge("perm-camera", "BYPASSED", false);
        });
}

function requestLocationPermission() {
    if (!navigator.geolocation) {
        updatePermBadge("perm-location", "BYPASSED", false);
        return Promise.resolve();
    }

    return new Promise(function(resolve) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                appState.locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude
                };
                updatePermBadge("perm-location", "GRANTED", true);
                resolve();
            },
            function() {
                updatePermBadge("perm-location", "BYPASSED", false);
                resolve();
            },
            {
                timeout: 6000,
                enableHighAccuracy: false,
                maximumAge: 60000
            }
        );
    });
}

function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
        updatePermBadge("perm-notify", "BYPASSED", false);
        return Promise.resolve();
    }

    return Notification.requestPermission()
        .then(function(result) {
            if (result === "granted") {
                updatePermBadge("perm-notify", "GRANTED", true);
            } else {
                updatePermBadge("perm-notify", "BYPASSED", false);
            }
        })
        .catch(function() {
            updatePermBadge("perm-notify", "BYPASSED", false);
        });
}

function requestFakeFilePermission() {
    return sleep(1200).then(function() {
        updatePermBadge("perm-files", "GRANTED", true);
    });
}

function updatePermBadge(rowId, text, isGranted) {
    var row = document.getElementById(rowId);
    if (!row) {
        return;
    }

    var badge = row.querySelector(".perm-badge");
    if (!badge) {
        return;
    }

    badge.textContent = text;
    badge.setAttribute("data-state", isGranted ? "ok" : "fail");

    if (isGranted) {
        badge.classList.remove("bypassed");
        badge.classList.add("granted");
    } else {
        badge.classList.remove("granted");
        badge.classList.add("bypassed");
    }

    var permRow = row;
    permRow.style.borderColor = isGranted ? "#00ff00" : "#ff6600";
    setTimeout(function() {
        permRow.style.borderColor = "";
    }, 800);
}


/* ==========================================================================
   SECTION 13: DEVICE SCAN STAGE (STAGE 2)
   Collects real device information using browser APIs and displays it
   in a terminal-style typewriter animation with progress tracking.
   ========================================================================== */

function handleScanStage() {
    var terminalOutput = document.getElementById("terminal-output");
    var progressBar = document.getElementById("bar-fill");
    var progressText = document.getElementById("bar-pct");

    if (!terminalOutput || !progressBar || !progressText) {
        return;
    }

    terminalOutput.innerHTML = "";
    progressBar.style.width = "0%";
    progressText.textContent = "0%";

    collectBatteryInfo()
        .then(function() {
            return runDeviceScan(terminalOutput, progressBar, progressText);
        })
        .then(function() {
            return sleep(2000);
        })
        .then(function() {
            transitionToStage(2);
        });
}

function collectBatteryInfo() {
    if (!navigator.getBattery) {
        return Promise.resolve();
    }

    return navigator.getBattery()
        .then(function(battery) {
            appState.batteryData = {
                level: Math.round(battery.level * 100),
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            };
        })
        .catch(function() {
            appState.batteryData = null;
        });
}

function buildScanLines() {
    var bat = appState.batteryData;
    var loc = appState.locationData;

    var batteryLevel = bat ? bat.level : randomInt(12, 94);
    var batteryStatus = bat ? (bat.charging ? "CHARGING" : "DISCHARGING") : "DISCHARGING";
    var gpsLat = loc ? loc.latitude.toFixed(6) : (randomFloat(-90, 90)).toFixed(6);
    var gpsLon = loc ? loc.longitude.toFixed(6) : (randomFloat(-180, 180)).toFixed(6);
    var gpsAcc = loc ? Math.round(loc.accuracy) + "m" : randomInt(3, 50) + "m";

    var cpuCores = navigator.hardwareConcurrency || "UNKNOWN";
    var deviceMemory = navigator.deviceMemory || randomInt(2, 8);
    var connectionType = "UNKNOWN";
    var connectionSpeed = randomInt(5, 100);

    if (navigator.connection) {
        connectionType = (navigator.connection.effectiveType || "4g").toUpperCase();
        connectionSpeed = navigator.connection.downlink || connectionSpeed;
    }

    var screenInfo = screen.width + "x" + screen.height;
    var colorDepth = screen.colorDepth || 24;
    var pixelRatio = window.devicePixelRatio || 1;

    var lines = [
        { text: "> INITIALIZING DEEP SYSTEM SCAN...", delay: 700 },
        { text: "> CONNECTING TO REMOTE SERVER...", delay: 500 },
        { text: "> CONNECTION ESTABLISHED", delay: 400 },
        { text: "> ", delay: 200 },
        { text: "> === DEVICE INFORMATION ===", delay: 500 },
        { text: "> PLATFORM: " + (navigator.platform || "CLASSIFIED"), delay: 400 },
        { text: "> USER_AGENT: " + navigator.userAgent.substring(0, 58) + "...", delay: 350 },
        { text: "> DISPLAY: " + screenInfo + " @ " + colorDepth + "bit (DPR: " + pixelRatio + ")", delay: 400 },
        { text: "> LANGUAGE: " + (navigator.language || "UNKNOWN"), delay: 300 },
        { text: "> TIMEZONE: " + Intl.DateTimeFormat().resolvedOptions().timeZone, delay: 400 },
        { text: "> CPU_CORES: " + cpuCores, delay: 400 },
        { text: "> MEMORY: " + deviceMemory + "GB", delay: 500 },
        { text: "> TOUCH_POINTS: " + (navigator.maxTouchPoints || 0), delay: 300 },
        { text: "> ", delay: 200 },
        { text: "> === NETWORK DATA ===", delay: 500 },
        { text: "> CONNECTION_TYPE: " + connectionType, delay: 400 },
        { text: "> BANDWIDTH: " + connectionSpeed + " Mbps", delay: 400 },
        { text: "> PUBLIC_IP: " + generateFakeIPv4(), delay: 600 },
        { text: "> INTERNAL_IP: 192.168." + randomInt(0, 10) + "." + randomInt(2, 254), delay: 500 },
        { text: "> IPv6: " + generateFakeIPv6(), delay: 400 },
        { text: "> DNS_SERVER: 8.8." + randomInt(4, 8) + "." + randomInt(1, 8), delay: 400 },
        { text: "> PROXY_DETECTED: " + (Math.random() > 0.7 ? "YES" : "NO"), delay: 350 },
        { text: "> VPN_ACTIVE: NO", delay: 300 },
        { text: "> ", delay: 200 },
        { text: "> === HARDWARE IDENTIFIERS ===", delay: 500 },
        { text: "> IMEI: " + generateFakeIMEI(), delay: 600 },
        { text: "> MAC_ADDRESS: " + generateFakeMAC(), delay: 500 },
        { text: "> SERIAL_NUMBER: " + generateFakeSerialNumber(), delay: 500 },
        { text: "> DEVICE_UUID: " + generateUUID(), delay: 400 },
        { text: "> ANDROID_ID: " + generateUUID().replace(/-/g, "").substring(0, 16), delay: 450 },
        { text: "> ", delay: 200 },
        { text: "> === POWER STATUS ===", delay: 500 },
        { text: "> BATTERY_LEVEL: " + batteryLevel + "%", delay: 500 },
        { text: "> CHARGE_STATUS: " + batteryStatus, delay: 400 },
        { text: "> POWER_SOURCE: " + (bat && bat.charging ? "AC_ADAPTER" : "BATTERY"), delay: 350 },
        { text: "> ", delay: 200 },
        { text: "> === LOCATION DATA ===", delay: 500 },
        { text: "> GPS_LATITUDE: " + gpsLat, delay: 500 },
        { text: "> GPS_LONGITUDE: " + gpsLon, delay: 500 },
        { text: "> GPS_ACCURACY: " + gpsAcc, delay: 400 },
        { text: "> GEOFENCE_STATUS: TRACKED", delay: 500 },
        { text: "> ", delay: 200 },
        { text: "> === APPLICATION ANALYSIS ===", delay: 500 },
        { text: "> INSTALLED_APPLICATIONS: " + randomInt(42, 128) + " DETECTED", delay: 600 },
        { text: "> BROWSER_HISTORY_ENTRIES: " + randomInt(800, 5000), delay: 500 },
        { text: "> SAVED_PASSWORDS: " + randomInt(8, 45) + " EXTRACTED", delay: 700 },
        { text: "> STORED_COOKIES: " + randomInt(200, 1500), delay: 500 },
        { text: "> CACHED_IMAGES: " + randomInt(500, 3000), delay: 400 },
        { text: "> AUTOFILL_ENTRIES: " + randomInt(15, 80), delay: 450 },
        { text: "> BOOKMARKS: " + randomInt(20, 200), delay: 350 },
        { text: "> ", delay: 200 },
        { text: "> === SECURITY ASSESSMENT ===", delay: 500 },
        { text: "> OPEN_PORTS: " + randomInt(3, 12) + " FOUND", delay: 500 },
        { text: "> VULNERABILITIES_CRITICAL: " + randomInt(8, 28), delay: 600 },
        { text: "> VULNERABILITIES_HIGH: " + randomInt(12, 40), delay: 500 },
        { text: "> VULNERABILITIES_MEDIUM: " + randomInt(20, 60), delay: 400 },
        { text: "> EXPLOIT_CHAINS: " + randomInt(2, 8) + " AVAILABLE", delay: 600 },
        { text: "> ROOT_ACCESS: OBTAINABLE", delay: 500 },
        { text: "> ENCRYPTION_STATUS: WEAK", delay: 400 },
        { text: "> ", delay: 300 },
        { text: "> SCAN COMPLETE.", delay: 600 },
        { text: "> [!] WARNING: DEVICE IS FULLY COMPROMISED", delay: 800 },
        { text: "> [!] CRITICAL: ALL DATA ACCESSIBLE", delay: 800 },
        { text: "> [!] INITIATING BREACH SEQUENCE...", delay: 900 }
    ];

    return lines;
}

function runDeviceScan(terminal, progressBar, progressText) {
    var scanLines = buildScanLines();
    var totalLines = scanLines.length;
    var lineIndex = 0;

    return processNextScanLine();

    function processNextScanLine() {
        if (lineIndex >= totalLines) {
            return Promise.resolve();
        }

        var currentLine = scanLines[lineIndex];

        return typewriterLine(terminal, currentLine.text)
            .then(function() {
                lineIndex++;

                var progress = Math.round((lineIndex / totalLines) * 100);
                progressBar.style.width = progress + "%";
                progressText.textContent = progress + "%";

                terminal.scrollTop = terminal.scrollHeight;

                return sleep(currentLine.delay);
            })
            .then(function() {
                return processNextScanLine();
            });
    }
}


/* ==========================================================================
   SECTION 14: COUNTDOWN STAGE (STAGE 3)
   Displays a dramatic countdown from 10 to 0 with visual effects,
   vibration on each tick, and urgency indicators.
   ========================================================================== */

function handleCountdownStage() {
    var count = CONFIG.countdownStart;
    var displayElement = document.getElementById("cd-number");
    var stageElement = document.getElementById("stage-3");

    if (!displayElement || !stageElement) {
        return;
    }

    displayElement.textContent = count;
    stageElement.classList.remove("urgent");

    var countdownInterval = setInterval(function() {
        count--;
        displayElement.textContent = count;

        displayElement.classList.add("tick");
        setTimeout(function() {
            displayElement.classList.remove("tick");
        }, 300);

        vibrateOnce(250);

        if (count <= 3) {
            stageElement.classList.add("urgent");
        }

        if (count <= 0) {
            clearInterval(countdownInterval);
            stageElement.classList.remove("urgent");
            transitionToStage(3);
        }
    }, 1000);
}


/* ==========================================================================
   SECTION 15: SCARE STAGE (STAGE 4)
   The main horror experience. Activates flashlight, plays MP3 at maximum
   amplified volume, starts vibration pattern, shows fake system access
   messages with animations. Lasts 60 seconds.
   ========================================================================== */

function handleScareStage() {
    appState.scareActive = true;
    document.body.classList.add("scare-mode");

    enableFlashlight();

    playScareAudio();

    startVibrateLoop();

    revealScareLines().then(function() {
        startScareCountdown();
    });
}

function revealScareLines() {
    var lines = document.querySelectorAll(".scare-line");
    var lineIndex = 0;

    return showNextScareLine();

    function showNextScareLine() {
        if (lineIndex >= lines.length) {
            return Promise.resolve();
        }

        return sleep(900).then(function() {
            lines[lineIndex].classList.add("visible");
            vibrateOnce(150);
            lineIndex++;
            return showNextScareLine();
        });
    }
}

function startScareCountdown() {
    var remaining = CONFIG.scareDurationSeconds;
    var displayElement = document.getElementById("scare-seconds");

    if (!displayElement) {
        return;
    }

    displayElement.textContent = remaining;

    var scareInterval = setInterval(function() {
        remaining--;
        displayElement.textContent = remaining;

        if (remaining <= 0) {
            clearInterval(scareInterval);
            endScareStage();
        }
    }, 1000);
}

function endScareStage() {
    appState.scareActive = false;

    stopScareAudio();
    disableFlashlight();
    stopVibrateLoop();
    document.body.classList.remove("scare-mode");

    transitionToStage(4);
}


/* ==========================================================================
   SECTION 16: VICTORY STAGE (STAGE 5)
   Brief pause showing "You Survived" message with a claim button.
   ========================================================================== */

function handleVictoryStage() {
    var btnClaim = document.getElementById("btn-claim");
    if (!btnClaim) {
        return;
    }

    btnClaim.onclick = function() {
        btnClaim.disabled = true;
        btnClaim.textContent = "PROCESSING...";

        sleep(800).then(function() {
            transitionToStage(5);
        });
    };
}


/* ==========================================================================
   SECTION 17: FAKE DOWNLOAD STAGE (STAGE 6)
   Simulates downloading and installing malicious-looking files.
   Creates actual harmless blob downloads for extra realism.
   Shows scary system warnings after all downloads complete.
   ========================================================================== */

function handleDownloadStage() {
    var listContainer = document.getElementById("dl-list");
    var warningText = document.getElementById("dl-warn");

    if (!listContainer || !warningText) {
        return;
    }

    listContainer.innerHTML = "";
    warningText.textContent = "";

    processAllDownloads(listContainer)
        .then(function() {
            return showSystemWarnings(warningText);
        })
        .then(function() {
            return sleep(2500);
        })
        .then(function() {
            transitionToStage(6);
        });
}

function processAllDownloads(container) {
    var files = CONFIG.fakeFiles;
    var fileIndex = 0;

    return downloadNextFile();

    function downloadNextFile() {
        if (fileIndex >= files.length) {
            return Promise.resolve();
        }

        var file = files[fileIndex];
        fileIndex++;

        return simulateSingleDownload(container, file)
            .then(function() {
                return sleep(300);
            })
            .then(function() {
                return downloadNextFile();
            });
    }
}

function simulateSingleDownload(container, file) {
    var item = document.createElement("div");
    item.className = "dl-item";

    var topRow = document.createElement("div");
    topRow.className = "dl-top";

    var nameSpan = document.createElement("span");
    nameSpan.className = "dl-name";
    nameSpan.textContent = "[>>] " + file.name;

    var sizeSpan = document.createElement("span");
    sizeSpan.className = "dl-size";
    sizeSpan.textContent = file.size;

    topRow.appendChild(nameSpan);
    topRow.appendChild(sizeSpan);

    var barWrap = document.createElement("div");
    barWrap.className = "dl-bar-wrap";

    var bar = document.createElement("div");
    bar.className = "dl-bar";
    barWrap.appendChild(bar);

    var status = document.createElement("span");
    status.className = "dl-status";
    status.textContent = "Downloading...";

    item.appendChild(topRow);
    item.appendChild(barWrap);
    item.appendChild(status);
    container.appendChild(item);

    container.scrollTop = container.scrollHeight;

    return new Promise(function(resolve) {
        var progress = 0;

        var interval = setInterval(function() {
            progress += randomInt(5, 18);

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                bar.style.width = "100%";
                status.textContent = "INSTALLED";
                status.classList.add("done");

                vibrateOnce(100);
                triggerBlobDownload(file.name);

                resolve();
            } else {
                bar.style.width = progress + "%";
                status.textContent = "Downloading... " + progress + "%";
            }
        }, CONFIG.downloadProgressSpeed);
    });
}

function triggerBlobDownload(filename) {
    try {
        var content = "[PRANK FILE] This file is completely harmless.\n";
        content += "Generated by Countdown Prank App.\n";
        content += "Filename: " + filename + "\n";
        content += "Date: " + new Date().toISOString() + "\n";
        content += "This is NOT real malware.\n";

        var blob = new Blob([content], { type: "application/octet-stream" });
        var url = URL.createObjectURL(blob);

        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = "none";

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 1000);
    } catch (err) {
        /* Download blocked by browser - continue silently */
    }
}

function showSystemWarnings(warningElement) {
    var warnings = CONFIG.scanWarnings;
    var warnIndex = 0;

    return displayNextWarning();

    function displayNextWarning() {
        if (warnIndex >= warnings.length) {
            return Promise.resolve();
        }

        return sleep(600).then(function() {
            warningElement.textContent = warnings[warnIndex];
            vibrateOnce(200);
            warnIndex++;
            return displayNextWarning();
        });
    }
}


/* ==========================================================================
   SECTION 18: RANSOM STAGE (STAGE 7)
   Final stage showing fake ransomware screen with encrypted data message.
   Persists in fullscreen mode. Shows countdown timer.
   Sends scary notification if permissions were granted.
   ========================================================================== */

function handleRansomStage() {
    appState.ransomActive = true;
    document.body.classList.add("ransom-mode");

    enterFullscreen();
    setupFullscreenPersistence();

    startRansomCountdown();
    sendScaryNotification();
}

function startRansomCountdown() {
    var hours = CONFIG.ransomHours;
    var minutes = CONFIG.ransomMinutes;
    var seconds = CONFIG.ransomSeconds;

    var displayElement = document.getElementById("ransom-timer");
    if (!displayElement) {
        return;
    }

    displayElement.textContent = formatTime(hours, minutes, seconds);

    setInterval(function() {
        seconds--;

        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }

        if (minutes < 0) {
            minutes = 59;
            hours--;
        }

        if (hours < 0) {
            hours = 0;
            minutes = 0;
            seconds = 0;
        }

        displayElement.textContent = formatTime(hours, minutes, seconds);
    }, 1000);
}

function formatTime(h, m, s) {
    return padZero(h) + ":" + padZero(m) + ":" + padZero(s);
}

function sendScaryNotification() {
    try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            var notif = new Notification("SYSTEM ALERT", {
                body: "Your device has been compromised. All data is being encrypted. Do not ignore this warning.",
                requireInteraction: true,
                silent: false
            });

            setTimeout(function() {
                if (notif) {
                    notif.close();
                }
            }, 15000);
        }
    } catch (err) {
        /* Notification failed - continue silently */
    }
}


/* ==========================================================================
   SECTION 19: STAGE HANDLER REGISTRY
   Maps stage indices to their handler functions.
   ========================================================================== */

var STAGE_HANDLERS = [
    handlePermissionStage,
    handleScanStage,
    handleCountdownStage,
    handleScareStage,
    handleVictoryStage,
    handleDownloadStage,
    handleRansomStage
];


/* ==========================================================================
   SECTION 20: APPLICATION INITIALIZATION
   Entry point that sets up all systems and starts the first stage.
   ========================================================================== */

function initializeApp() {
    detectElectron();
    initMatrixCanvas();

    STAGE_HANDLERS[0]();

    document.addEventListener("keydown", function(e) {
        if (appState.ransomActive) {
            if (e.key === "Escape" || e.key === "F11" ||
                (e.altKey && e.key === "F4") ||
                (e.ctrlKey && e.key === "w") ||
                (e.altKey && e.key === "Tab")) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });

    window.addEventListener("beforeunload", function(e) {
        if (appState.ransomActive) {
            e.preventDefault();
            e.returnValue = "Your data encryption is in progress. Closing may result in permanent data loss.";
            return e.returnValue;
        }
    });

    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

    document.addEventListener("visibilitychange", function() {
        if (document.hidden && appState.ransomActive) {
            sendScaryNotification();
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}
