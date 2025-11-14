import type { JSX } from 'preact';
import staSty from '@strinf/css/mods/status.module.css';
import FiEn from '@strinf/md/popup/info.mdx';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { ClHtml, Wid } from '@strinf/ts/constants/style/ClHtml';
import { checkFirstCookie, setFirstAgreed } from '@strinf/ts/functions/cookie/banner';
import { memo } from 'preact/compat';
import { useState } from 'preact/hooks';

function crBtn(setAgreed: (val: boolean) => void): JSX.Element {
    return (
        <button
            aria-label="OK"
            type="button"
            className={`${ClHtml.btn} ${ClHtml.pri}`}
            onClick={() => {
                setFirstAgreed();
                setAgreed(true);
            }}
        >
            OK
        </button>
    );
}

function createInfo(
    agreed: boolean,
    setAgreed: (val: boolean) => void,
): JSX.Element | null {
    if (checkFirstCookie() || agreed) {
        return null;
    }
    const clD = `${ClHtml.al} ${ClHtml.show} 
    ${ClHtml.blo} ${Wid.N250} ${Wid.SM500}`;
    const WR = FiEn as (props: { env: JSX.Element }) => JSX.Element;
    return (
        <div className={clD}>
            <div className={ClHtml.con}>
                <WR env={<i className={ClHtmlI.envelope} />} />
                {crBtn(setAgreed)}
            </div>
        </div>
    );
}

function FirInf(): JSX.Element {
    const [agreed, setAgreed] = useState<boolean>(false);
    // TODO remove top when page-wrapper-large is added to digidive
    return (
        <div className={`${ClHtml.alSt} ${staSty.alert}`}>
            {createInfo(agreed, setAgreed)}
        </div>
    );
}

const FirInfVD = memo(FirInf);

export default FirInfVD;
