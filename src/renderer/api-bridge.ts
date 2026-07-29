import { ipcRenderer } from 'electron-better-ipc';
import logger from 'electron-log';

import { CoreAPI } from './core-api';
import { getWhistlePort } from './utils';
import { createRule, deleteRule, findRule, listRules, updateRule } from './extensions/rule-editor/rule-service';

/**
 * 主进程里的 HTTP API server 通过这些通道读写渲染进程持有的状态。
 * 结果统一包一层 envelope，避免 handler 抛错时 callMain/callRenderer 挂住。
 */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

interface ApiError extends Error {
    status?: number;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
            settled = true;
            resolve(fallback);
        }, ms);

        promise.then(
            (value) => {
                if (settled) return;
                clearTimeout(timer);
                resolve(value);
            },
            () => {
                if (settled) return;
                clearTimeout(timer);
                resolve(fallback);
            },
        );
    });
}

function waitForEvent<T>(eventName: string, predicate: (payload: T) => boolean, ms: number): Promise<void> {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            CoreAPI.eventEmmitter.off(eventName, handler);
            resolve();
        }, ms);

        function handler(payload: T) {
            if (!predicate(payload)) {
                return;
            }
            clearTimeout(timer);
            CoreAPI.eventEmmitter.off(eventName, handler);
            resolve();
        }

        CoreAPI.eventEmmitter.on(eventName, handler);
    });
}

function isSystemProxyEnabled() {
    // store 里 onlineStatus === 'online' 表示系统代理已开启，见 whistle 扩展的 toggleSystemProxy
    return CoreAPI.store.get('onlineStatus') === 'online';
}

function isProxyOnLan() {
    return Boolean(CoreAPI.store.get('proxyAvailableOnLan'));
}

async function getRuntime() {
    // whistle 还没 ready 时 getWhistlePort 永远不会 resolve
    const httpPort = await withTimeout(getWhistlePort(CoreAPI), 2000, null as number | null);

    return {
        httpPort: httpPort || null,
        // whistle 用 port + 1 作为 socks 端口，见 vendor/whistle-start/index.js
        socksPort: httpPort ? httpPort + 1 : null,
        systemProxyEnabled: isSystemProxyEnabled(),
        proxyOnLan: isProxyOnLan(),
    };
}

async function setSystemProxy(enabled: boolean) {
    if (isSystemProxyEnabled() === enabled) {
        return { systemProxyEnabled: enabled, changed: false };
    }

    const settled = waitForEvent<{ status: string }>(
        'whistle-online-status-change',
        (data) => data.status === (enabled ? 'ready' : 'online'),
        15000,
    );
    CoreAPI.eventEmmitter.emit('iproxy-toggle-system-proxy', enabled);
    await settled;

    return { systemProxyEnabled: isSystemProxyEnabled(), changed: true };
}

async function setProxyOnLan(enabled: boolean) {
    if (isProxyOnLan() === enabled) {
        return { proxyOnLan: enabled, changed: false };
    }

    // 切换局域网可见性会重启 whistle，等到非 loading 的结果再返回
    const settled = waitForEvent<boolean | 'loading'>(
        'iproxy-proxy-on-lan-changed',
        (status) => status !== 'loading',
        30000,
    );
    CoreAPI.eventEmmitter.emit('iproxy-restart-proxy-switch-lan', enabled);
    await settled;

    return { proxyOnLan: isProxyOnLan(), changed: true };
}

function answer<Input, Output>(channel: string, handler: (input: Input) => Output | Promise<Output>) {
    ipcRenderer.answerMain(channel, async (input) => {
        try {
            return { ok: true, data: await handler(input as Input) } as ApiResult<Output>;
        } catch (e) {
            logger.error('[http-api]', channel, e);
            return {
                ok: false,
                error: e instanceof Error ? e.message : String(e),
                status: (e as ApiError)?.status || 500,
            } as ApiResult<Output>;
        }
    });
}

function notFound(id: string): ApiError {
    const error: ApiError = new Error(`rule not found: ${id}`);
    error.status = 404;
    return error;
}

export function initApiBridge() {
    answer('api-get-runtime', getRuntime);

    answer('api-set-system-proxy', (enabled: boolean) => setSystemProxy(!!enabled));
    answer('api-set-proxy-on-lan', (enabled: boolean) => setProxyOnLan(!!enabled));

    answer('api-rules-list', () =>
        listRules().map((rule) => ({
            uuid: rule.uuid,
            name: rule.name,
            enabled: rule.enabled,
        })),
    );

    answer('api-rule-get', (id: string) => {
        const rule = findRule(id);
        if (!rule) {
            throw notFound(id);
        }
        return {
            uuid: rule.uuid,
            name: rule.name,
            enabled: rule.enabled,
            content: rule.content,
        };
    });

    answer('api-rule-create', (input: { name?: string; content?: string; enabled?: boolean }) => createRule(input));

    answer(
        'api-rule-update',
        (input: { id: string; patch: { name?: string; content?: string; enabled?: boolean } }) => {
            if (!findRule(input.id)) {
                throw notFound(input.id);
            }
            return updateRule(input.id, input.patch);
        },
    );

    answer('api-rule-delete', (id: string) => {
        if (!findRule(id)) {
            throw notFound(id);
        }
        deleteRule(id);
        return { uuid: id, deleted: true };
    });

    logger.info('[http-api] renderer bridge ready');
}
