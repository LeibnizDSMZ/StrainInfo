import type { DetailsR, OvT, RelT } from '@strinf/ts/interfaces/api/mapped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/details';
import type { TTHookG } from '@strinf/ts/interfaces/dom/global';
import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type DetailCtrl from '@strinf/ts/mvc/ctrl/DetailCtrl';
import type { JSX } from 'preact';
import { ClHtml, Dis, Font, Mar } from '@strinf/ts/constants/style/ClHtml';
import { getOVTuple } from '@strinf/ts/functions/api/map';
import { filterArrStr } from '@strinf/ts/functions/arr/parse';
import LightsVD from '@strinf/ts/mvc/vdom/dyn/misc/StrainStatus';
import ArcLinkVD from '@strinf/ts/mvc/vdom/dyn/pass/link/ArcLinkVD';
import BacDiveLinkVD from '@strinf/ts/mvc/vdom/dyn/pass/link/BacDiveLinkVD';
import TaxLinkVD, { LinkType } from '@strinf/ts/mvc/vdom/dyn/pass/link/TaxLinkVD';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import { createStrainTitleBar } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { memo } from 'preact/compat';
import { useContext as use, useState } from 'preact/hooks';

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
type EleT = number | boolean | string | string[] | JSX.Element;

function modBacDive(
    filH: (string | JSX.Element)[],
    filD: EleT[],
    bacDive: number | undefined,
): void {
    const hid = filH.indexOf(HEAD[3] ?? '');
    if (bacDive !== undefined) {
        filD.splice(hid, 1, <BacDiveLinkVD id={bacDive} />);
    }
}

function modArchive(
    filH: (string | JSX.Element)[],
    filD: EleT[],
    doi: string,
    hook: ToolTipHookInt<TT_GL_TYPE>,
): void {
    const hid = filH.indexOf(HEAD[0] ?? '');
    filD.splice(
        hid,
        1,
        <span style={{ 'white-space': 'nowrap' }}>
            {' '}
            <ArcLinkVD doi={doi} hook={hook} />
            {' '}
        </span>,
    );
    filH.splice(hid, 1, <span>{HEAD[0]}</span>);
}

function modName(
    filH: (string | JSX.Element)[],
    filD: EleT[],
    taxon: [string, number | undefined, number | undefined],
): void {
    const [name, lpsnId, ncbiId] = taxon;
    const taxCl = Dis.dIFlex;
    if (name !== '') {
        const taxInd = filH.indexOf(HEAD[2] ?? '');
        const link = [];
        if (lpsnId !== undefined) {
            link.push({ type: LinkType.LPSN, path: String(lpsnId) });
            filD.splice(taxInd, 1, <TaxLinkVD name={name} links={link} infCl={taxCl} />);
        }
        else if (ncbiId !== undefined) {
            link.push({ type: LinkType.NCBI, path: String(ncbiId) });
            filD.splice(taxInd, 1, <TaxLinkVD name={name} links={link} infCl={taxCl} />);
        }
        else {
            filD.splice(taxInd, 1, <span>{name}</span>);
        }
    }
}

function crUpdater(
    setDat: (res: Map<number, [boolean, boolean, boolean]>) => void,
    allIds: number,
): ViewChanInt {
    const resCon = new Map<number, [boolean, boolean, boolean]>();
    const setter = setDat;
    const limit = allIds;
    return {
        res: (results: DetailsR[]): void => {
            for (const row of results) {
                const [cat, culID, err] = [row[1], row[3], row[21]];
                resCon.set(culID, [cat[1] !== '', cat[0] !== '', cat[6] || err]);
            }
            if (resCon.size >= limit) {
                setter(resCon);
            }
        },
    };
}

function StrainStatus({ rel, dCtrl, ttHook }: StatusProps): JSX.Element | null {
    const [dat, setDat] = useState<Map<number, [boolean, boolean, boolean]>>(
        () => new Map(),
    );
    if (rel === undefined || dCtrl === undefined) {
        return null;
    }
    const miss = rel.filter(([culId]) => !dat.has(culId));
    if (miss.length !== 0) {
        const upd = crUpdater((res: Map<number, [boolean, boolean, boolean]>) => {
            setDat(res);
        }, rel.length);
        dCtrl.init(
            upd,
            rel.map(([culID, ,]) => culID),
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
    const ctx: TTHookG<TT_GL_TYPE> | undefined = use(MainConGl);
    const ttHook = ctx?.getTTHook(TT_ID_SIM);
    if (res === undefined || ttHook === undefined) {
        return null;
    }
    const dataF: EleT[] = [...res.slice(0, 2), res[2][0], ...res.slice(3)] as EleT[];
    const filD = filterArrStr(HEAD, dataF);
    modName(filD[0], filD[1], res[2]);
    modBacDive(filD[0], filD[1], res[3]);
    modArchive(filD[0], filD[1], res[4], ttHook);
    const extraCl: string[] = Array.from({ length: filD[1].length }).fill('') as string[];
    if (res[3] !== undefined) {
        extraCl.splice(filD[1].length - 1, 1, `${Mar.lNAT} ${Dis.dNone} ${Dis.dBM}`);
    }
    const resTit = createStrainTitleBar(...filD, extraCl);
    if (resTit.length === 0) {
        return null;
    }
    return (
        <div
            className={ClHtml.titB}
            style={{
                margin: '-2rem -2rem 0 -2rem',
                width: 'auto',
                backgroundColor: '#fbfbfb',
            }}
        >
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
