const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  onSidebarVisibility(callback) {
    const listener = (_event, visible) => {
      if (typeof visible === 'boolean') callback(visible);
    };
    ipcRenderer.on('sidebar:visibility', listener);
    ipcRenderer.send('sidebar:ready');
    return () => ipcRenderer.removeListener('sidebar:visibility', listener);
  }
});
