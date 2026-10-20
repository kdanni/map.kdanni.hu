const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('node:path');
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  const win = new BrowserWindow({ width: 1280, height: 850, minWidth: 850, minHeight: 600,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true } });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  const menu = Menu.buildFromTemplate([
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { label: 'Nézet', submenu: [
      { id: 'sidebar', label: 'Oldalsáv megjelenítése', type: 'checkbox', checked: true,
        accelerator: 'CommandOrControl+B',
        click: item => win.webContents.send('sidebar:visibility', item.checked) },
      { type: 'separator' },
      { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' }
    ] },
    { role: 'windowMenu' }
  ]);
  Menu.setApplicationMenu(menu);
  ipcMain.on('sidebar:ready', event => {
    if (event.sender === win.webContents)
      win.webContents.send('sidebar:visibility', menu.getMenuItemById('sidebar').checked);
  });
  win.loadFile(path.join(__dirname, '../dist/index.html'));
});
app.on('window-all-closed', () => app.quit());
