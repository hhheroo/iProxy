import { BrowserWindow } from 'electron';
import { callRednererBridge } from './core';

export async function setProxyOnLan(mainWindow: BrowserWindow, enabled: boolean) {
    await callRednererBridge(mainWindow, 'api-set-proxy-on-lan', enabled);
    return {
        ok: true,
    };
}
