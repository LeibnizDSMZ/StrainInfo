import type { DefAttr } from '@strinf/ts/constants/style/AtHtml';
import type { CookieG, WrapperInt } from '@strinf/ts/interfaces/dom/global';
import type { JSX, RefObject, TargetedEvent } from 'preact';
import CONFIG from '@strinf/ts/configs/config';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import ClHtmlSt from '@strinf/ts/constants/stat/ClHtml';
import { FormNames, IDC } from '@strinf/ts/constants/style/Acc';
import {
    ACC_LC,
    ACC_LD,
    ACC_LM,
    ACC_M,
    accInC,
    accInD,
    accInM,
    DD_B,
} from '@strinf/ts/constants/style/AtHtml';
import { ClHtml, Mar, Pad, Tex, Wid } from '@strinf/ts/constants/style/ClHtml';
import {
    getActiveWrapperCookies,
    getAllWrapperCookies,
    setContrast,
    setDyslexia,
    setTransition,
} from '@strinf/ts/functions/cookie/acc';
import { getFormInputCheckValue } from '@strinf/ts/functions/types/html';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { memo } from 'preact/compat';
import { useContext as use, useRef } from 'preact/hooks';

function crFormGr(
    label: string,
    explain: string,
    gId: string,
    InAttr: DefAttr,
    labAttr: DefAttr,
): JSX.Element {
    return (
        <div className={`${ClHtml.cCh} ${Pad.bN5}`}>
            <input id={gId} {...InAttr} />
            <label {...labAttr}>{label}</label>
            <br />
            <small className={Tex.m}>{explain}</small>
        </div>
    );
}

function applyAccChanges(
    event: TargetedEvent<HTMLFormElement>,
    container: RefObject<HTMLDivElement>,
    domain: string,
    ctx: WrapperInt & CookieG,
): void {
    event.preventDefault();
    if (container.current !== null) {
        container.current.classList.remove(ClHtml.show);
    }
    const button = document.getElementById(IDC.menu);
    if (button !== null) {
        button.classList.remove(ClHtml.act);
    }
    if (event.target !== null) {
        setContrast(getFormInputCheckValue(FormNames.con, event.target), domain);
        setTransition(getFormInputCheckValue(FormNames.tra, event.target), domain);
        setDyslexia(getFormInputCheckValue(FormNames.dys, event.target), domain);
    }
    ctx.wrapperRmClass(getAllWrapperCookies());
    ctx.wrapperAddClass(getActiveWrapperCookies());
    for (const cookie of ctx.cookieActive) {
        cookie(getActiveWrapperCookies());
    }
}

function AccForm(props: { cont: RefObject<HTMLDivElement> }): JSX.Element | null {
    const ctx: (WrapperInt & CookieG) | undefined = use(MainConGl);

    if (ctx === undefined) {
        return null;
    }
    const { cont } = props;
    const contT = 'Enhance the contrast of the web page for better readability.';
    const motT = 'Reduce motion and animations on the page.';
    const dysT = 'Use a special font to increase readability for users with dyslexia.';
    return (
        <form
            className={`${ClHtml.cnt} ${ClHtmlSt.mask}`}
            onSubmit={(event) => {
                applyAccChanges(event, cont, CONFIG.frontend.domain, ctx);
            }}
        >
            <div className={ClHtml.formGr}>
                {crFormGr('High contrast', contT, IDC.sCon, accInC(), ACC_LC)}
                {crFormGr('Reduce motion', motT, IDC.sMot, accInM(), ACC_LM)}
                {crFormGr('Dyslexia mode', dysT, IDC.sDys, accInD(), ACC_LD)}
            </div>
            <button
                type="submit"
                className={`${ClHtml.btn} ${ClHtml.pri}`}
                aria-label="Submit"
            >
                Apply
            </button>
        </form>
    );
}

function Accessibility(): JSX.Element {
    const viewRef = useRef<HTMLDivElement>(null);
    const divCl = `${Wid.N250} ${Wid.SM300} ${ClHtml.drDM} ${ClHtml.drDC}`;
    const accCl = `${ClHtml.pri} ${ClHtml.sqr} ${ClHtml.cir} ${Mar.rN10}`;
    return (
        <div className={ClHtml.drD} ref={viewRef}>
            <button
                type="button"
                className={`${ClHtml.btn} ${accCl}`}
                id={IDC.menu}
                {...DD_B}
            >
                <i className={ClHtmlI.per}>
                    <span className={ClHtml.srO}>Accessibility Options</span>
                </i>
            </button>
            <div className={divCl} {...ACC_M}>
                <h6 className={`${ClHtml.head} ${Tex.p}`}>Accessibility</h6>
                <AccForm cont={viewRef} />
            </div>
        </div>
    );
}

const AccVD = memo(Accessibility);

export default AccVD;
