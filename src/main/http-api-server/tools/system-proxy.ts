import { BrowserWindow } from 'electron';
import { callRednererBridge } from './core';

export async function setSystemProxy(mainWindow: BrowserWindow, enabled: boolean) {
    await callRednererBridge(mainWindow, 'api-set-system-proxy', enabled);
    return {
        ok: true,
    };
}
