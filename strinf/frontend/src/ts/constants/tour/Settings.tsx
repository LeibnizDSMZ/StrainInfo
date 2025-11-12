import type { Config, Driver, PopoverDOM } from 'driver.js';
import type { LocationHook } from 'preact-iso';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { ClHtml, Mar, Pad } from '@strinf/ts/constants/style/ClHtml';
import { routeUri } from '@strinf/ts/functions/http/http';
import { enableScroll } from '@strinf/ts/functions/libs/style';
import { render } from 'preact';
import '@strinf/css/adhoc/driver.css';

const TOUR_OPTIONS: Config = {
    animate: false,
    allowClose: true,
    overlayOpacity: 0.5,
    stagePadding: 0,
    stageRadius: 5,
    allowKeyboardControl: true,
    disableActiveInteraction: true,
    popoverClass: `${ClHtml.al} ${Pad.N15}`,
    popoverOffset: 10,
    showProgress: false,
    showButtons: ['next', 'previous', 'close'],
};

function onClose(driver: Driver, location: LocationHook): void {
    routeUri(UIApiCon.manual, '', location);
    driver.destroy();
    enableScroll();
}

function createButtons(
    driver: Driver,
    popover: PopoverDOM,
    [prev, next, done]: [boolean, boolean, boolean],
    location: LocationHook
): void {
    const main = popover.previousButton.parentNode;
    popover.previousButton.remove();
    popover.nextButton.remove();
    popover.closeButton.textContent = '';
    const prevBtn = prev ? (
        <button
            className={`${ClHtml.btn} ${ClHtml.pri} ${ClHtmlI.caretLB}`}
            type="button"
            aria-label="previous"
            onClick={driver.movePrevious}
        />
    ) : null;
    const nextBtn = next ? (
        <button
            className={`${ClHtml.btn} ${ClHtml.pri} ${ClHtmlI.caretRB} ${Mar.lN15}`}
            type="button"
            aria-label="next"
            onClick={driver.moveNext}
        />
    ) : null;
    const doneBtn = done ? (
        <button
            className={`${ClHtml.btn} ${ClHtml.suc} ${Mar.lN15}`}
            type="button"
            aria-label="done"
            onClick={() => {
                driver.destroy();
                routeUri(UIApiCon.manual, '', location);
                enableScroll();
            }}
        >
            Exit
        </button>
    ) : null;
    if (main !== null) {
        render(
            <>
                {prevBtn}
                {nextBtn}
                {doneBtn}
            </>,
            main
        );
    }
}

export { createButtons, onClose, TOUR_OPTIONS };
