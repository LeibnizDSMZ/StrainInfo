import scSty from '@strinf/css/mods/scroll.module.css';
import { SIDE_HIDDEN } from '@strinf/ts/constants/style/AtHtml';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';

const LOAD_STATE = {
    enabled: false,
};

function enableLoader(): void {
    LOAD_STATE.enabled = true;
    setTimeout(() => {
        if (LOAD_STATE.enabled) {
            const { body } = document;
            body.classList.add(scSty.disable);
            const [loader] = document.getElementsByClassName(ClHtml.ld);
            if (loader !== undefined) {
                loader.classList.add(ClHtml.show);
            }
        }
    }, 200);
}

function enableScroll(): void {
    document.body.classList.add(ClHtml.sideSM);
}

function disableLoader(): void {
    LOAD_STATE.enabled = false;
    const { body } = document;
    body.classList.remove(scSty.disable);
    const [loader] = document.getElementsByClassName(ClHtml.ld);
    if (loader !== undefined) {
        loader.classList.remove(ClHtml.show);
    }
}

const SIDE_ID = 'side_bar_status_id';

function customToggleSideBar(enable: boolean): void {
    const sideBar = document.getElementById(SIDE_ID);
    let active = false;
    if (document.documentElement.clientWidth > 992) {
        active = Boolean(
            Math.abs(
                Number(!document.body.classList.contains(ClHtml.sideSM)) - Number(enable)
            )
        );
    } else {
        const [pgWr] = document.getElementsByClassName(ClHtml.pgWr);
        active = !(pgWr?.hasAttribute(SIDE_HIDDEN[0]) ?? false);
    }
    if (sideBar != null && active) {
        window.style.toggleSidebar(sideBar);
    }
}

function disableSideBar(): void {
    customToggleSideBar(false);
}

function toggleSideBar(side?: HTMLElement): void {
    window.style.toggleSidebar(side);
}

function deactivateAllDropdownToggles(): void {
    window.style.deactivateAllDropdownToggles();
}

function reInitCStyle(): void {
    [window.style.pageWrapper] = document.getElementsByClassName(ClHtml.pgWr);
    [window.style.stickyAlerts] = document.getElementsByClassName(ClHtml.alSt);
}

export {
    enableScroll,
    disableLoader,
    reInitCStyle,
    disableSideBar,
    toggleSideBar,
    SIDE_ID,
    enableLoader,
    deactivateAllDropdownToggles,
};
