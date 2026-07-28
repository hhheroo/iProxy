import type * as monaco from 'monaco-editor';
import { CoreAPI } from '../../../../core-api';
import { EDITOR_THEMES } from '../../../../const';

export function loadThemes(mo: typeof monaco) {
    const themes: (monaco.editor.IStandaloneThemeData & { name: string })[] = CoreAPI.store.get(EDITOR_THEMES) ?? [];

    themes.forEach((el) => {
        mo.editor.defineTheme(el.name, el);
    });
}
