// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

function createWindow() {
  // Get the primary display's work area dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Define the window's dimensions for a landscape view
  const windowWidth = 950;
  const windowHeight = 650;

  // Center the window on the screen
  const x = Math.round((width - windowWidth) / 2);
  const y = Math.round((height - windowHeight) / 2);


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x, 
    y: y,
    show: false, // Keep it hidden initially
    frame: true, 
    resizable: true, 
    backgroundColor: '#1e1e1e', 
    webPreferences: {
      webviewTag: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Once the window's content is ready, show the window. This prevents a white flash.
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // When the window is closed, we just hide it instead of destroying it.
  // This makes reopening it much faster.
  mainWindow.on('close', (event) => {
    if (app.quitting) {
        mainWindow = null;
    } else {
        event.preventDefault();
        mainWindow.hide();
    }
  });
}

function createTray() {
  // Use the .png for the tray icon, as it's universally supported and we can resize it.
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(icon);

  const toggleWindow = () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
        createWindow();
        return;
    }
      
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  };

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide Gemini', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.quitting = true;
        app.quit();
    }}
  ]);

  tray.setToolTip('Gemini');
  tray.setContextMenu(contextMenu);
  tray.on('click', toggleWindow);
}

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
          mainWindow.show();
      }
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  app.on('ready', () => {
    createWindow();
    createTray();
    // --- CHANGE IS HERE ---
    // The line that was hiding the dock icon has been removed!
  });
}

// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
