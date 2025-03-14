import type { JSX } from 'preact';
import ErrType, { ERR_MARK } from '@strinf/ts/constants/type/ErrT';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { trackSearch } from '@strinf/ts/mvc/vdom/fun/mat/track';
import Known404Error from '@strinf/ts/errors/known/404';
import errSty from '@strinf/css/mods/error.module.css';
import Known503Error from '@strinf/ts/errors/known/503';
import { useContext } from 'preact/hooks';
import type { ErrStCon } from '@strinf/ts/interfaces/dom/global';
import { routeUri } from '@strinf/ts/functions/http/http';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { useLocation } from 'preact-iso';

interface ErrorWrProps {
    errT: ErrType | undefined;
    errM: string;
    errFM: string;
    ctx: InValStInt;
}

interface EProps {
    msgM: string;
    msgFM: string;
}

interface E404Prpos {
    msgM: string;
    msgFM: string;
    ctx: InValStInt;
}

function Error500(): JSX.Element {
    return (
        <div className={errSty.err}>
            <h1>500</h1>
            <h2>Internal server error!</h2>
        </div>
    );
}

function Error404({ msgM, msgFM, ctx }: E404Prpos): JSX.Element {
    const res = Known404Error.splitMsg(msgFM);
    let msg = msgM;
    if (res != null) {
        ctx.inVal.map((eleF) => {
            eleF(ERR_MARK);
        });
        const [cat, sea] = res;
        trackSearch(cat, sea, 0, false, 0);
        msg = `Not found! - ${sea}`;
    }
    return (
        <div className={errSty.err}>
            <h1>404</h1>
            <h2>{msg}</h2>
        </div>
    );
}

const DATE_FORMATTER = new Intl.DateTimeFormat(navigator.languages[0] ?? 'de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function Error503({ msgM, msgFM }: EProps): JSX.Element {
    const res = Known503Error.splitMsg(msgFM);
    if (res != null) {
        const [time] = res;
        const timeDate = new Date(time);
        const date = DATE_FORMATTER.format(timeDate);
        const timeL = timeDate.toLocaleTimeString(navigator.languages[0] ?? 'de-DE');
        const msgD = time !== '' ? `Will be up on ${date}` : '';
        const msgT = time !== '' ? `around ${timeL}` : '';
        return (
            <div className={errSty.err}>
                <h2>Currently down for maintenance!</h2>
                <i className={ClHtmlI.wrenchF} style={{ 'font-size': '20rem' }} />
                <p className={errSty.info}>{msgD}</p>
                <p className={errSty.info}>{msgT}</p>
            </div>
        );
    }
    return (
        <div className={errSty.err}>
            <h1>503</h1>
            <h2>{msgM}</h2>
        </div>
    );
}

function ErrorWr({ errM, errFM, errT, ctx }: ErrorWrProps): JSX.Element | null {
    const location = useLocation();
    if (ErrType.E404 === errT) {
        return <Error404 msgM={errM} msgFM={errFM} ctx={ctx} />;
    }
    if (ErrType.E503 === errT) {
        return <Error503 msgM={errM} msgFM={errFM} />;
    }
    if (ErrType.E500 === errT) {
        return <Error500 />;
    }
    setTimeout(() => {
        routeUri(UIApiCon.index, UIApiCon.index, location);
    }, 100);
    return null;
}

function ErrorVD(): JSX.Element | null {
    const ctx: (ErrStCon & InValStInt) | undefined = useContext(MainConGl);
    if (ctx === undefined) {
        return null;
    }
    return (
        <div className={ClHtml.cntCon}>
            <ErrorWr errT={ctx.errT} errFM={ctx.errS[0]} errM={ctx.errS[1]} ctx={ctx} />
        </div>
    );
}

export default ErrorVD;
