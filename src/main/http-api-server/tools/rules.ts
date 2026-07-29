import { BrowserWindow } from 'electron';
import { callRednererBridge } from './core';

export type Rule = {
    uuid: string;
    name: string;
    enabled: boolean;
    content: string;
};

export async function getRules(mainWindow: BrowserWindow) {
    return { rules: await callRednererBridge<Omit<Rule, 'content'>[]>(mainWindow, 'api-rules-list') };
}

export async function getRule(mainWindow: BrowserWindow, id: string) {
    return await callRednererBridge<Rule>(mainWindow, 'api-rule-get', id);
}

export async function createRule(mainWindow: BrowserWindow, rule: Omit<Rule, 'uuid'>) {
    return await callRednererBridge<Rule>(mainWindow, 'api-rule-create', rule);
}

export async function updateRule(mainWindow: BrowserWindow, id: string, rule: Partial<Omit<Rule, 'uuid'>>) {
    return await callRednererBridge<Rule>(mainWindow, 'api-rule-update', { id, patch: rule });
}

export async function deleteRule(mainWindow: BrowserWindow, id: string) {
    return await callRednererBridge<void>(mainWindow, 'api-rule-delete', id);
}
