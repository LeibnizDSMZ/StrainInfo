import type { TTSrcTVInt } from '@strinf/ts/interfaces/dom/tooltip';
import type { RefObject } from 'preact';
import { arrow, autoPlacement, computePosition, offset, shift } from '@floating-ui/dom';
import { HIDE } from '@strinf/ts/constants/style/AtHtml';
import onPrError from '@strinf/ts/functions/err/async';
import { isSmallScreen } from '@strinf/ts/functions/misc/screen';

const PLA: { [key: string]: string } = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
};

function ttShow(src: Element, tooltip: HTMLElement, aro: HTMLElement): void {
    tooltip.removeAttribute(HIDE);
    const h = 'offsetHeight' in src ? (src as HTMLElement).offsetHeight : 1;
    const needsDisplay = h > 0;
    computePosition(src, tooltip, {
        placement: 'right-start',
        middleware: [autoPlacement(), offset(8), shift(), arrow({ element: aro })],
    })
        .then(({ x, y, placement, middlewareData }) => {
            if (!needsDisplay) {
                tooltip.setAttribute(HIDE, '');
                return;
            }
            requestAnimationFrame(() => {
                Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
                const [aroX, aroY] = [middlewareData.arrow?.x, middlewareData.arrow?.y];
                const pla = placement.split('-')[0] ?? 'right';
                const stSi = PLA[pla] ?? 'left';
                Object.assign(aro.style, {
                    left: aroX != null ? `${aroX}px` : '',
                    top: aroY != null ? `${aroY}px` : '',
                    right: '',
                    bottom: '',
                    [stSi]: '-4px',
                });
            });
        })
        .catch(onPrError);
}

function hideEv(
    tarC: Element,
    too: HTMLElement,
    hid: string,
    timerSh: number[],
    timerGl: number[],
): () => void {
    const event = () => {
        for (const ele of [...timerGl, ...timerSh]) {
            clearTimeout(ele);
        }
        too.setAttribute(HIDE, '');
    };
    tarC.addEventListener(hid, event);
    return event;
}

function addEvents(
    tarC: Element,
    too: HTMLElement,
    aro: HTMLElement,
    upSel: () => void,
    [timPre, timSho]: [number, number],
): [() => void, string][] {
    const [showEvents, hideEvents] = [
        ['mouseenter', 'focus'],
        ['mouseleave', 'blur'],
    ];
    const timerGl: number[] = [];
    const timerSh: number[] = [];
    const events: [() => void, string][] = [];
    for (const sho of showEvents) {
        const event = () => {
            timerGl.push(
                setTimeout(() => {
                    upSel();
                    timerSh.push(
                        setTimeout(() => {
                            ttShow(tarC, too, aro);
                        }, timSho),
                    );
                }, timPre),
            );
        };
        tarC.addEventListener(sho, event);
        events.push([event, sho]);
    }
    for (const hid of hideEvents) {
        events.push([hideEv(tarC, too, hid, timerSh, timerGl), hid]);
    }
    return events;
}

function assignToolTip<T extends Element>(
    tar_con: [RefObject<T>, TTSrcTVInt],
    upSel: () => void,
    upEve: (eve: [() => void, string, Element][]) => void,
    failCnt: number,
    timeout: [number, number],
): void {
    const [tar, src] = tar_con;
    const tarC = tar.current;
    if (
        tarC !== null
        && src.ttSrc !== undefined
        && src.ttSrc[0].current !== null
        && src.ttSrc[1].current !== null
    ) {
        const srcC = src.ttSrc[0].current;
        const arrowC = src.ttSrc[1].current;
        srcC.setAttribute(HIDE, '');
        const events: [() => void, string, T][] = [];
        for (const eve of addEvents(tarC, srcC, arrowC, upSel, timeout)) {
            events.push([...eve, tarC]);
        }
        upEve(events);
    }
    else if (failCnt < 10) {
        setTimeout(() => {
            crToolTip(tar_con, upSel, upEve, failCnt + 1, timeout);
        }, timeout[0]);
    }
}

function crToolTip<T extends Element>(
    tar_con: [RefObject<T>, TTSrcTVInt],
    upSel: () => void,
    upEve: (eve: [() => void, string, Element][]) => void,
    failCnt = 0,
    timeout: [number, number] = [500, 300],
): void {
    if (!isSmallScreen()) {
        assignToolTip(tar_con, upSel, upEve, failCnt, timeout);
    }
}

export default crToolTip;
