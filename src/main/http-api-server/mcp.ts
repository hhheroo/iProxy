import { BrowserWindow } from 'electron';
import Koa from 'koa';
import Router from 'koa-router';
import logger from 'electron-log';
import { toNodeHandler, localhostHostValidation, localhostOriginValidation } from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

import { APP_VERSION } from '../const';
import { createRule, deleteRule, getInfo, getRule, getRules, setProxyOnLan, setSystemProxy, updateRule } from './tools';

async function callTool(run: () => Promise<unknown>) {
    try {
        const data = await run();
        return {
            content: [{ type: 'text' as const, text: JSON.stringify(data ?? { ok: true }, null, 2) }],
        };
    } catch (e) {
        return {
            isError: true,
            content: [{ type: 'text' as const, text: e instanceof Error ? e.message : String(e) }],
        };
    }
}

function registerTools(server: McpServer, mainWindow: BrowserWindow) {
    server.registerTool(
        'get-info',
        {
            description:
                'Get iProxy runtime info: system proxy, LAN proxy, ports, whistle credentials, and app version',
            annotations: { readOnlyHint: true },
        },
        async () => callTool(() => getInfo(mainWindow)),
    );

    server.registerTool(
        'set-system-proxy',
        {
            description: 'Enable or disable the OS system proxy pointing at iProxy',
            inputSchema: z.object({
                enabled: z.boolean().describe('Whether to enable the system proxy'),
            }),
        },
        async ({ enabled }) => callTool(() => setSystemProxy(mainWindow, enabled)),
    );

    server.registerTool(
        'set-proxy-on-lan',
        {
            description: 'Enable or disable allowing other devices on the LAN to use this proxy',
            inputSchema: z.object({
                enabled: z.boolean().describe('Whether to allow LAN access to the proxy'),
            }),
        },
        async ({ enabled }) => callTool(() => setProxyOnLan(mainWindow, enabled)),
    );

    server.registerTool(
        'list-rules',
        {
            description: 'List all whistle rules (uuid, name, enabled; content omitted)',
            annotations: { readOnlyHint: true },
        },
        async () => callTool(() => getRules(mainWindow)),
    );

    server.registerTool(
        'get-rule',
        {
            description: 'Get a single whistle rule by id, including its content',
            inputSchema: z.object({
                id: z.string().describe('Rule uuid'),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ id }) => callTool(() => getRule(mainWindow, id)),
    );

    server.registerTool(
        'create-rule',
        {
            description: 'Create a new whistle rule',
            inputSchema: z.object({
                name: z.string().describe('Rule name'),
                content: z.string().describe('Whistle rule content'),
                enabled: z.boolean().optional().describe('Whether the rule is enabled (default true)'),
            }),
        },
        async ({ name, content, enabled }) =>
            callTool(() => createRule(mainWindow, { name, content, enabled: enabled ?? true })),
    );

    server.registerTool(
        'update-rule',
        {
            description: 'Update an existing whistle rule (partial patch)',
            inputSchema: z
                .object({
                    id: z.string().describe('Rule uuid'),
                    name: z.string().optional().describe('New rule name'),
                    content: z.string().optional().describe('New whistle rule content'),
                    enabled: z.boolean().optional().describe('Whether the rule is enabled'),
                })
                .refine((v) => v.name !== undefined || v.content !== undefined || v.enabled !== undefined, {
                    message: 'at least one of name, content, enabled is required',
                }),
        },
        async ({ id, name, content, enabled }) => {
            const patch: { name?: string; content?: string; enabled?: boolean } = {};
            if (name !== undefined) patch.name = name;
            if (content !== undefined) patch.content = content;
            if (enabled !== undefined) patch.enabled = enabled;
            return callTool(() => updateRule(mainWindow, id, patch));
        },
    );

    server.registerTool(
        'delete-rule',
        {
            description: 'Delete a whistle rule by id',
            inputSchema: z.object({
                id: z.string().describe('Rule uuid'),
            }),
            annotations: { destructiveHint: true },
        },
        async ({ id }) => callTool(() => deleteRule(mainWindow, id)),
    );
}

export function mcpRouter(app: Koa, mainWindow: BrowserWindow) {
    const router = new Router();
    const hostValidation = localhostHostValidation();
    const originValidation = localhostOriginValidation();

    const mcpHandler = createMcpHandler(
        () => {
            const server = new McpServer(
                { name: 'iProxy', version: APP_VERSION },
                {
                    instructions:
                        'iProxy is a whistle-based GUI proxy app. Use these tools to inspect runtime info, toggle system/LAN proxy, and manage whistle rules.',
                },
            );
            registerTools(server, mainWindow);
            return server;
        },
        { onerror: (e) => logger.error('[mcp]', e) },
    );

    const handle = toNodeHandler(mcpHandler, { onerror: (e) => logger.error('[mcp] handler', e) });

    app.use(async (ctx, next) => {
        ctx.respond = false;
        if (!hostValidation(ctx.req, ctx.res)) return;
        if (!originValidation(ctx.req, ctx.res)) return;
        ctx.respond = true;
        await next();
    });

    router.all('/mcp', async (ctx) => {
        logger.info('[mcp] request', JSON.stringify(ctx.request.body));
        ctx.respond = false;
        ctx.status = 200
        return await handle(ctx.req, ctx.res, ctx.request.body);
    });

    app.use(router.routes());

    return mcpHandler;
}
