import { UI_FONT } from './const';
import { CoreAPI } from './core-api';

let uiFont = '';
let uiFontGot = false;

export function setUiFont(body: HTMLElement) {
    if (!uiFontGot) {
        uiFont = CoreAPI.store.get(UI_FONT);
    }

    if (uiFont && body) {
        body.style.fontFamily = uiFont;
    }
}
