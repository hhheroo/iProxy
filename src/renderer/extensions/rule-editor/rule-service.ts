import { CoreAPI } from '../../core-api';
import { RULE_STORE_KEY } from '../../const';
import { uuidv4 } from '../../utils';

export interface Rule {
    name: string;
    uuid: string;
    content: string;
    enabled: boolean;
    rename?: boolean;
}

export const RULES_CHANGED_EVENT = 'iproxy-rules-changed';

// injected by the weinre extension while remote debugging, not a user rule
export const INTERNAL_RULE_UUID = '[internal-debugger-on]';

export function withNewlineAsEnd(str: string) {
    if (!/\n$/.test(str)) {
        return str + '\n';
    }
    return str;
}

export function listenRulesChangedByExternal(callback: (rules: Rule[]) => void) {
    CoreAPI.eventEmmitter.on(RULES_CHANGED_EVENT, callback);
    return () => CoreAPI.eventEmmitter.off(RULES_CHANGED_EVENT, callback);
}

export function saveRules(rules: Rule[], notifyUI = false) {
    CoreAPI.store.set(RULE_STORE_KEY, rules);
    CoreAPI.eventEmmitter.emit('whistle-save-rule', rules);

    if (notifyUI) {
        CoreAPI.eventEmmitter.emit(RULES_CHANGED_EVENT, rules);
    }
}

export function readRules(): Rule[] {
    return CoreAPI.store.get(RULE_STORE_KEY);
}

export function listRules(): Rule[] {
    return readRules().filter((item) => item.uuid !== INTERNAL_RULE_UUID);
}

export function findRule(id: string): Rule | undefined {
    const rules = listRules();
    return rules.find((item) => item.uuid === id) || rules.find((item) => item.name === id);
}

export function createRule(input: { name?: string; content?: string; enabled?: boolean }): Rule {
    const rule: Rule = {
        name: input.name || 'New Rule',
        uuid: uuidv4(),
        content: withNewlineAsEnd(input.content || '# New Rules'),
        enabled: Boolean(input.enabled),
    };

    saveRules(readRules().concat(rule), true);

    return rule;
}

export function updateRule(id: string, patch: { name?: string; content?: string; enabled?: boolean }): Rule {
    const target = findRule(id);

    if (!target) {
        throw new Error(`rule not found: ${id}`);
    }

    const updated: Rule = {
        ...target,
        ...(patch.name === undefined ? {} : { name: patch.name }),
        ...(patch.content === undefined ? {} : { content: withNewlineAsEnd(patch.content) }),
        ...(patch.enabled === undefined ? {} : { enabled: patch.enabled }),
        rename: false,
    };

    saveRules(
        readRules().map((item) => (item.uuid === target.uuid ? updated : item)),
        true,
    );

    return updated;
}

export function deleteRule(id: string) {
    const target = findRule(id);

    if (!target) {
        throw new Error(`rule not found: ${id}`);
    }

    saveRules(
        readRules().filter((item) => item.uuid !== target.uuid),
        true,
    );
}
