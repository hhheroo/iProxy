import Koa from 'koa';
import serve from 'koa-static';
import { bodyParser } from '@koa/bodyparser';
import path from 'path';
import fs from 'fs-extra';
import getPort from 'get-port';
import logger from 'electron-log';
import { app, BrowserWindow } from 'electron';

import { Server } from 'http';
import { AddressInfo } from 'net';
import { HttpError } from './tools/core';
import { httpApiRouter } from './http';
import { mcpRouter } from './mcp';
import type { McpHttpHandler } from '@modelcontextprotocol/server';

export const HTTP_API_INFO_FILENAME = 'http-api.json';
export const HTTP_API_DEFAULT_PORT = 19283;

export function getHttpApiInfoPath() {
    return path.join(app.getPath('userData'), HTTP_API_INFO_FILENAME);
}

function buildApp(mainWindow: BrowserWindow) {
    const app = new Koa();

    app.use(bodyParser());
    app.use(async (ctx, next) => {
        try {
            logger.info('[http-api] request', ctx.request.url);
            await next();
            logger.info('[http-api] response', ctx.request.url, ctx.res.statusCode);
        } catch (e) {
            const status = e instanceof HttpError ? e.status : 500;
            if (status >= 500) {
                logger.error('[http-api]', e);
            }
            ctx.status = status;
            ctx.body = { error: e instanceof Error ? e.message : String(e) };
        }
    });

    httpApiRouter(app, mainWindow);
    mcpHandler = mcpRouter(app, mainWindow);

    app.use(serve(path.join(__dirname)));

    return app;
}

let server: Server | null = null;
let mcpHandler: McpHttpHandler | null = null;

export async function startHttpApiServer(mainWindow: BrowserWindow) {
    if (!server) {
        const port = await getPort({ port: HTTP_API_DEFAULT_PORT, host: '127.0.0.1' });
        const app = buildApp(mainWindow);

        app.on('error', (e) => {
            logger.error('[http-api] server error', e);
        });

        const infoPath = getHttpApiInfoPath();
        await fs.writeJson(infoPath, { port, pid: process.pid, host: '127.0.0.1' });
        await fs.chmod(infoPath, 0o600);

        logger.info('[http-api] listening on 127.0.0.1:' + port);

        server = app.listen(port);
    }

    return {
        port: (server.address() as AddressInfo).port,
        stop: stopHttpApiServer,
    };
}

async function cleanupHttpApiInfo() {
    try {
        await fs.remove(getHttpApiInfoPath());
    } catch (e) {
        // ignore
    }
}

export async function stopHttpApiServer() {
    try {
        if (mcpHandler) {
            await mcpHandler.close();
            mcpHandler = null;
        }
        if (!server) return;
        await new Promise<void>((resolve) => server!.close(() => resolve()));
        server = null;
        await cleanupHttpApiInfo();
    } catch (e) {
        server = null;
        mcpHandler = null;
        logger.error('[http-api] stop server failed', e);
    }
}
