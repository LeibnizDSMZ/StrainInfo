import { unFocus } from '@strinf/ts/functions/http/sea';
import { disableSideBar } from '@strinf/ts/functions/libs/style';

function defaultRouteBeh(): void {
    unFocus();
    const anchor = window.location.hash;
    if (window.innerWidth < 991) {
        disableSideBar();
    }
    if (anchor === '') {
        window.scroll({ top: 0, left: 0, behavior: 'instant' });
    } else {
        window.location.hash = anchor;
    }
}

export default defaultRouteBeh;
