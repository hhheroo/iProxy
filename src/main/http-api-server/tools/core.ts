import { BrowserWindow } from 'electron';
import { ipcMain } from 'electron-better-ipc';


export class HttpError extends Error {
  public status: number;

  constructor(status: number, message: string) {
      super(message);
      this.status = status;
  }
}

export type BridgeResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

const RENDERER_TIMEOUT = 35 * 1000;

/**
* 渲染进程持有 whistle 端口、规则和代理开关，这里统一走 IPC 拿。
* 超时是必须的：窗口还没加载完时 callRenderer 会一直挂着。
*/
export async function callRednererBridge<T>(mainWindow: BrowserWindow, channel: string, data?: any): Promise<T> {
  if (!mainWindow || mainWindow.isDestroyed()) {
      throw new HttpError(503, 'renderer is not available');
  }

  const result = await new Promise<BridgeResult<T>>((resolve, reject) => {
      const timer = setTimeout(() => {
          reject(new HttpError(503, `renderer did not answer ${channel} in time`));
      }, RENDERER_TIMEOUT);

      ipcMain.callRenderer(mainWindow, channel, data).then(
          (value) => {
              clearTimeout(timer);
              resolve(value as BridgeResult<T>);
          },
          (e) => {
              clearTimeout(timer);
              reject(e);
          },
      );
  });

  if (!result || typeof result !== 'object' || !('ok' in result)) {
      throw new HttpError(502, `unexpected answer from renderer on ${channel}`);
  }

  if (!result.ok) {
      throw new HttpError(result.status || 500, result.error);
  }

  return result.data;
}
