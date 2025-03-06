import createSeaCall from '@strinf/ts/functions/links/create_sea';
import { routeUri } from '@strinf/ts/functions/http/http';
import type { LocationHook } from 'preact-iso';

function unFocus(): void {
    const act = document.activeElement;
    if (act instanceof HTMLElement) {
        act.blur();
    }
}
function callSearch(resIn: string | number | string[], location: LocationHook): void {
    routeUri(createSeaCall(resIn), '', location);
}

export { callSearch, unFocus };
