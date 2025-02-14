import type { JSX } from 'preact';
import { ClHtml, Dis, Font, Mar } from '@strinf/ts/constants/style/ClHtml';
import { getOVTuple } from '@strinf/ts/functions/api/map';
import { filterArrStr } from '@strinf/ts/functions/arr/parse';
import type { DetailsR, OvT, RelT } from '@strinf/ts/interfaces/api/maped';
import { createStrainTitleBar } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import TaxLinkVD, { LinkType } from '@strinf/ts/mvc/vdom/dyn/pass/link/TaxLinkVD';
import BacDiveLinkVD from '@strinf/ts/mvc/vdom/dyn/pass/link/BacDiveLinkVD';
import ArcLinkVD from '@strinf/ts/mvc/vdom/dyn/pass/link/ArcLinkVD';
import type DetailCtrl from '@strinf/ts/mvc/ctrl/DetailCtrl';
import { useContext, useState } from 'preact/hooks';
import type ViewChanInt from '@strinf/ts/interfaces/chan/details';
import { memo } from 'preact/compat';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import type { TTHookG } from '@strinf/ts/interfaces/dom/global';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import type { TT_GL_TYPE, ToolTipHookInt } from '@strinf/ts/interfaces/dom/tooltip';
import LightsVD from '@strinf/ts/mvc/vdom/dyn/misc/StrainStatus';

interface ResProps {
    res: OvT | undefined;
    dCtrl: DetailCtrl | undefined;
    rel: RelT[] | undefined;
}

interface StatusProps {
    dCtrl: DetailCtrl | undefined;
    rel: RelT[] | undefined;
    ttHook: ToolTipHookInt<TT_GL_TYPE>;
}

const HEAD = getOVTuple();
type EleT = number | boolean | string;

function modBacDive(
    filH: (string | JSX.Element)[],
    filD: (EleT | JSX.Element)[],
    bacDive: number | undefined
): void {
    const hid = filH.indexOf(HEAD[3] ?? '');
    if (bacDive !== undefined) {
        filD.splice(hid, 1, <BacDiveLinkVD id={bacDive} />);
    }
}

function modArchive(
    filH: (string | JSX.Element)[],
    filD: (EleT | JSX.Element)[],
    doi: string,
    hook: ToolTipHookInt<TT_GL_TYPE>
): void {
    const hid = filH.indexOf(HEAD[0] ?? '');
    filD.splice(
        hid,
        1,
        <span style={{ 'white-space': 'nowrap' }}>
            {' '}
            <ArcLinkVD doi={doi} hook={hook} />{' '}
        </span>
    );
    filH.splice(hid, 1, <span>{HEAD[0]}</span>);
}

function modName(
    filH: (string | JSX.Element)[],
    filD: (EleT | JSX.Element)[],
    taxon: [string, number | undefined, number | undefined]
): void {
    const [name, lpsnId, ncbiId] = taxon;
    const taxCl = Dis.dIFlex;
    if (name !== '') {
        const taxInd = filH.indexOf(HEAD[2] ?? '');
        const link = [];
        switch (true) {
            case lpsnId !== undefined:
                link.push({ type: LinkType.LPSN, path: String(lpsnId) });
                filD.splice(
                    taxInd,
                    1,
                    <TaxLinkVD name={name} links={link} infCl={taxCl} />
                );
                break;
            case ncbiId !== undefined:
                link.push({ type: LinkType.NCBI, path: String(ncbiId) });
                filD.splice(
                    taxInd,
                    1,
                    <TaxLinkVD name={name} links={link} infCl={taxCl} />
                );
                break;
            default:
                filD.splice(taxInd, 1, <span>{name}</span>);
        }
    }
}

function crUpdater(
    setDat: (res: Map<number, [boolean, boolean]>) => void,
    allIds: number
): ViewChanInt {
    const resCon = new Map<number, [boolean, boolean]>();
    const setter = setDat;
    const limit = allIds;
    return {
        res: (results: DetailsR[]): void => {
            for (const [, cat, , culID] of results) {
                resCon.set(culID, [cat[1] !== '', cat[0] !== '']);
            }
            if (resCon.size >= limit) {
                setter(resCon);
            }
        },
    };
}

function StrainStatus({ rel, dCtrl, ttHook }: StatusProps): JSX.Element | null {
    const [dat, setDat] = useState<Map<number, [boolean, boolean]>>(new Map());
    if (rel === undefined || dCtrl === undefined) {
        return null;
    }
    const miss = rel.filter(([culId]) => !dat.has(culId));
    if (miss.length !== 0) {
        const upd = crUpdater((res: Map<number, [boolean, boolean]>) => {
            setDat(res);
        }, rel.length);
        dCtrl.init(
            upd,
            rel.map(([culID, ,]) => culID)
        );
    }
    return (
        <div className={ClHtml.row}>
            <span className={ClHtml.tit}>Strain status</span>
            <LightsVD dat={dat} miss={miss.length} ttHook={ttHook} />
        </div>
    );
}

const StrainStatusVD = memo(StrainStatus);

function OverviewVD({ res, dCtrl, rel }: ResProps): JSX.Element | null {
    const ctx: TTHookG<TT_GL_TYPE> | undefined = useContext(MainConGl);
    const ttHook = ctx?.getTTHook(TT_ID_SIM);
    if (res === undefined || ttHook === undefined) {
        return null;
    }
    const dataF: EleT[] = [...res.slice(0, 2), res[2][0], ...res.slice(3)] as EleT[];
    const filD: [(string | JSX.Element)[], (EleT | JSX.Element)[]] = filterArrStr(
        HEAD,
        dataF
    );
    modName(filD[0], filD[1], res[2]);
    modBacDive(filD[0], filD[1], res[3]);
    modArchive(filD[0], filD[1], res[4], ttHook);
    const extraCl: string[] = Array(filD[1].length).fill('');
    if (res[3] !== undefined) {
        extraCl.splice(filD[1].length - 1, 1, `${Mar.lNAT} ${Dis.dNone} ${Dis.dBM}`);
    }
    const resTit = createStrainTitleBar<EleT | JSX.Element>(...filD, extraCl);
    if (resTit.length === 0) {
        return null;
    }
    return (
        <div className={ClHtml.titB}>
            <div
                className={`${Font.N18} ${ClHtml.row}
                ${Dis.dIFlex} ${ClHtml.bad}`}
                style={{ 'align-items': 'center' }}
            >
                <b>STRAIN</b>
            </div>
            {resTit[0]}
            <StrainStatusVD dCtrl={dCtrl} rel={rel} ttHook={ttHook} />
            {resTit.slice(1)}
        </div>
    );
}

export default OverviewVD;
