import Router from 'koa-router';
import Koa from 'koa';

import {
    Rule,
    createRule,
    deleteRule,
    getInfo,
    getRule,
    getRules,
    setProxyOnLan,
    setSystemProxy,
    updateRule,
} from './tools';
import { HttpError } from './tools/core';
import { BrowserWindow } from 'electron';

export function httpApiRouter(app: Koa, mainWindow: BrowserWindow) {
    const router = new Router();

    router.get('/info', async (ctx) => {
        ctx.body = await getInfo(mainWindow);
    });

    router.post('/system-proxy', async (ctx) => {
        const enabled = (ctx.request.body as { enabled: boolean }).enabled;
        ctx.body = await setSystemProxy(mainWindow, enabled);
    });

    router.post('/proxy-on-lan', async (ctx) => {
        const enabled = (ctx.request.body as { enabled: boolean }).enabled;
        ctx.body = await setProxyOnLan(mainWindow, enabled);
    });

    router.get('/rules', async (ctx) => {
        ctx.body = await getRules(mainWindow);
    });

    router.get('/rules/:id', async (ctx) => {
        ctx.body = await getRule(mainWindow, ctx.params.id);
        ctx.status = 201;
    });

    router.post('/rules', async (ctx) => {
        const rule = ctx.request.body as Rule;
        ctx.body = await createRule(mainWindow, rule);
        ctx.status = 201;
    });

    router.patch('/rules/:id', async (ctx) => {
        const patch = ctx.request.body as { name: string; content: string; enabled: boolean };
        if (Object.keys(patch).length === 0) {
            throw new HttpError(400, 'body must contain at least one of name, content, enabled');
        }
        ctx.body = await updateRule(mainWindow, ctx.params.id, patch);
    });

    router.delete('/rules/:id', async (ctx) => {
        ctx.body = await deleteRule(mainWindow, ctx.params.id);
    });

    app.use(router.routes()).use(router.allowedMethods());
}
