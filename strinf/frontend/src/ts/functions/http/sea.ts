import type { LocationHook } from 'preact-iso';
import { routeUri } from '@strinf/ts/functions/http/http';
import createSeaCall from '@strinf/ts/functions/links/create_sea';

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
