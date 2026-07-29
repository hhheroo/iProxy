import logger from 'electron-log';
import { BrowserWindow } from 'electron';

import { callRednererBridge } from './core';
import { checkSystemProxyWork } from '../../platform';
import { getIp } from '../../api';
import { APP_VERSION } from '../../const';

interface Runtime {
  httpPort: number | null;
  socksPort: number | null;
  systemProxyEnabled: boolean;
  proxyOnLan: boolean;
}

export async function getInfo(mainWindow: BrowserWindow) {
    const runtime = await callRednererBridge<Runtime>(mainWindow, 'api-get-runtime');
    const { httpPort, socksPort } = runtime;

    let activeInOs = false;

    if (httpPort) {
        try {
            activeInOs = !!(await checkSystemProxyWork('127.0.0.1', httpPort));
        } catch (e) {
            logger.warn('[http-api] checkSystemProxyWork failed', e);
        }
    }

    return {
        systemProxy: {
            enabled: runtime.systemProxyEnabled,
            activeInOs,
        },
        proxyOnLan: runtime.proxyOnLan,
        proxy: {
            httpPort,
            socksPort,
            httpUrl: httpPort ? `http://127.0.0.1:${httpPort}` : null,
            socksUrl: socksPort ? `socks5://127.0.0.1:${socksPort}` : null,
            lanIps: httpPort ? (await getIp()).map((item) => item.address) : [],
        },
        whistle: {
            url: httpPort ? `http://127.0.0.1:${httpPort}` : null,
            // @ts-ignore set in createMainWindow
            username: global.WHISTLE_USERNAME || null,
            // @ts-ignore set in createMainWindow
            password: global.WHISTLE_PASSWORD || null,
        },
        app: {
            version: APP_VERSION,
            pid: process.pid,
        },
    };
}
