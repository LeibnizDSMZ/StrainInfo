import type { JSX, RefObject, TargetedKeyboardEvent } from 'preact';
import hubSty from '@strinf/css/mods/hub.module.css';
import btnSty from '@strinf/css/mods/icon.module.css';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { hub_dsmz_search } from '@strinf/ts/constants/links/hub_dsmz';
import { Align, ClHtml, Dis, Mar, Wid } from '@strinf/ts/constants/style/ClHtml';
import LogoHubDsmzVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoHubDsmzVD';
import { useRef } from 'preact/hooks';

function actSearch(eve: TargetedKeyboardEvent<HTMLInputElement>): boolean {
    return eve.key === 'Enter' || eve.key === 'Accept' || eve.key === 'Tab';
}

function clickEvent(value: string, eve?: TargetedKeyboardEvent<HTMLInputElement>): void {
    if (eve === undefined || actSearch(eve)) {
        window.location.href = hub_dsmz_search(value);
    }
}

function SeaBtn({ refCon }: { refCon: RefObject<HTMLInputElement> }): JSX.Element {
    const btnCl = `${ClHtml.btn} ${ClHtml.fil} ${ClHtml.pri} ${btnSty.center}`;
    return (
        <div className={ClHtml.igp}>
            <button
                type="button"
                aria-label="Search on DSMZ HUB"
                className={btnCl}
                onClick={() => {
                    if (refCon.current !== null) {
                        clickEvent(refCon.current.value);
                    }
                }}
            >
                <i className={ClHtmlI.search} />
            </button>
        </div>
    );
}

function HubSeaVD(): JSX.Element {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <section
            className={`${ClHtml.sec} ${Dis.dFlex} 
        ${Align.ac} ${hubSty.container}`}
        >
            <div className={hubSty.logoleft}>
                <LogoHubDsmzVD height="100" full={false} />
            </div>
            <div
                className={`${ClHtml.cnt} ${hubSty.inputcon} ${Mar.rNAT}
                ${Dis.dFlex} ${Align.js} ${Align.fc} ${Wid.N200} ${Wid.SM500}`}
            >
                <h1 className={ClHtml.titSec}>Did not find what you were looking for?</h1>
                <div className={`${ClHtml.ig} ${Wid.f}`}>
                    <input
                        ref={ref}
                        type="text"
                        name="search"
                        className={ClHtml.formCtrl}
                        autoComplete="off"
                        placeholder="Search across all DSMZ Digital Diversity databases"
                        onKeyPress={(eve) => {
                            clickEvent(eve.currentTarget.value, eve);
                        }}
                    />
                    <SeaBtn refCon={ref} />
                </div>
            </div>
        </section>
    );
}

export default HubSeaVD;
