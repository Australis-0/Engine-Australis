const electron = require("electron");

const { app, BrowserWindow } = require("electron");

function create_instance () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 3840,
    height: 2160,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('app.html');

  // open dev tools, optional
  win.webContents.openDevTools();
}

app.on('ready', create_instance);
