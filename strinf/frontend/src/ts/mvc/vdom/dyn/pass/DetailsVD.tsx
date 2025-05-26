import type { JSX } from 'preact';
import { ClHtml, Dis, Hei, Mar, Pad, Tex, Wid } from '@strinf/ts/constants/style/ClHtml';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import {
    flattenDetTto1dim,
    getApiToStr,
    getDetTuple,
    mapDetails2DetT,
    wrapDetValues,
} from '@strinf/ts/functions/api/map';
import { filterArrStr } from '@strinf/ts/functions/arr/parse';
import type { DetT, DetailsR, RelT } from '@strinf/ts/interfaces/api/maped';
import { parseVal2Html } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import {
    TooltipWrapper,
    createXColTable,
    createRCulTiles,
    useTooltipForRef,
} from '@strinf/ts/mvc/vdom/fun/tab/pass';
import type { InValInt, InValStInt } from '@strinf/ts/interfaces/dom/inp';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import tilSty from '@strinf/css/mods/tile.module.css';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type {
    DatIdTVInt,
    TTSrcTVInt,
    TT_GL_TYPE,
} from '@strinf/ts/interfaces/dom/tooltip';
import type DetailCtrl from '@strinf/ts/mvc/ctrl/DetailCtrl';
import QApiCon from '@strinf/ts/constants/api/q_api';
import DetSt from '@strinf/ts/mvc/vdom/state/DetSt';
import { trackSearch } from '@strinf/ts/mvc/vdom/fun/mat/track';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { SR_CUL_ID } from '@strinf/ts/constants/api/sea_reg';
import TaxLinkVD, { LinkType } from '@strinf/ts/mvc/vdom/dyn/pass/link/TaxLinkVD';
import CatalogLinkVD from '@strinf/ts/mvc/vdom/dyn/pass/link/CatalogLinkVD';
import icSt from '@strinf/css/mods/icon.module.css';
import logoSt from '@strinf/css/mods/link.module.css';
import scSty from '@strinf/css/mods/scroll.module.css';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import { Component } from 'preact';
import parseCountryCode from '@strinf/ts/functions/parse/country';
import { useRef } from 'preact/hooks';
import { createDate, createDateRKMS } from '@strinf/ts/functions/parse/date';
import LogoRORVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoRORVD';
import { createUrlStr } from '@strinf/ts/functions/http/http';
import ROR_L from '@strinf/ts/constants/links/ror';
import LogoORCIDVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoORCIDVD';
import type { ConfLinkT } from '@strinf/ts/interfaces/misc/configs';
import ORCID_L from '@strinf/ts/constants/links/orcid';

const TIT = 'Deposit details';
const HEAD = getDetTuple();
const ID = 'section_nav_details';

type EleT = number | boolean | string | string[];
function getChildren(parentId: number, rel: RelT[]): [number, string][] {
    const res: [number, string][] = [];
    for (const [culId, culNo, parId] of rel) {
        if (parId === parentId) {
            res.push([culId, culNo]);
        }
    }
    return res;
}

function getRelStrain(toFind: number | null, rel: RelT[]): [number, string][] {
    const res: [number, string][] = [];
    for (const [culId, culNo] of rel) {
        if (culId === toFind) {
            res.push([culId, culNo]);
        }
    }
    return res;
}

function getCurParentId(cur: number, rel: RelT[]): number | null {
    for (const [culId, , parId] of rel) {
        if (culId === cur) {
            return parId ?? null;
        }
    }
    return null;
}

interface HistriProps {
    rel: RelT[];
    cid: number;
    ctx: InValStInt | undefined;
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
}

function createHistEl(
    ctx: InValStInt | undefined,
    ele: [number, string][],
    idInf: [number, boolean, number],
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>
): JSX.Element[] {
    if (ele.length === 0) {
        return [];
    }
    const [curId, last, lKey] = idInf;
    const tiles = createRCulTiles(
        ele,
        (dat: [number, string]) => [dat[0], dat[1], false],
        ctx,
        [ID, curId]
    );
    const tilesEl = tiles.map((til, ind: number) => (
        <TooltipWrapper
            key={`${ind}${lKey}`}
            chi={til[0]}
            srcH={hooks}
            upD={() => {
                if (hooks.data !== undefined) {
                    hooks.data(til[1]);
                }
            }}
        />
    ));
    if (last) {
        return tilesEl;
    }
    const cla = `${Wid.N50} ${Hei.N25} ${icSt.center}`;
    return [
        ...tilesEl,
        <div key={tilesEl.length + lKey} className={cla}>
            <i className={ClHtmlI.caretRB} />
        </div>,
    ];
}

function crShallowHist(
    ctx: InValStInt | undefined,
    curId: number,
    rel: RelT[],
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>
): [string, JSX.Element | EleT, number] {
    const parent = getRelStrain(getCurParentId(curId, rel), rel);
    const res = [];
    const cla = `${ClHtml.tils} ${tilSty.tilestext} ${Mar.tN10} ${Mar.bN5}`;
    let idInf: [number, boolean, number] = [curId, false, res.length];
    if (parent.length > 0) {
        res.push(...createHistEl(ctx, parent, idInf, hooks));
    }
    const children = getChildren(curId, rel);
    const current = getRelStrain(curId, rel);
    idInf = [curId, children.length === 0, res.length];
    res.push(...createHistEl(ctx, current, idInf, hooks));
    idInf = [curId, true, res.length];
    if (children.length > 0) {
        res.push(...createHistEl(ctx, children, idInf, hooks));
    }
    const outTiles = res.length <= 1 ? <div className={Hei.N25}>-</div> : res;
    return [
        'Deposit exchange',
        <div key={0} className={cla}>
            {outTiles}
        </div>,
        6,
    ];
}

function getAnchorD(ord: number, rel: RelT[]): AncT {
    if (rel.length > 0) {
        return { [ord]: [ID, TIT] };
    }
    return {};
}

interface ResProps {
    rel: RelT[];
    ccno: string;
    cid: number;
    hookCul: DatIdTVInt<TT_GL_TYPE> & TTSrcTVInt;
    hookInf: DatIdTVInt<TT_GL_TYPE> & TTSrcTVInt;
    ctx: InValStInt;
    data: DetT | undefined;
}

function modTaxName(
    filH: string[],
    filD: (EleT | JSX.Element)[],
    taxInf: [string, number | undefined, number | undefined]
): void {
    const [name, lpsn, ncbi] = taxInf;
    const hid = filH.indexOf(HEAD[7] ?? '');
    const taxCl = Dis.dIFlex;
    if (name !== '') {
        const links = [];
        if (ncbi !== undefined) {
            links.push({
                type: LinkType.NCBI,
                path: String(ncbi),
            });
        }
        if (lpsn !== undefined) {
            links.push({
                type: LinkType.LPSN,
                path: String(lpsn),
            });
        }
        filD.splice(hid, 1, <TaxLinkVD name={name} links={links} infCl={taxCl} />);
    }
}

interface ROCIDLinkInt {
    children: JSX.Element;
    link: string;
    coreUrl: ConfLinkT;
}

function ROCIDLinkVD({ link, coreUrl, children }: ROCIDLinkInt): JSX.Element | null {
    if (link === '' || link.includes(',')) {
        return null;
    }
    return (
        <a
            className={logoSt.logoattached}
            target="_blank"
            href={createUrlStr(coreUrl, link)}
            rel="noreferrer"
        >
            {children}
        </a>
    );
}

interface ROCIDInt {
    ror: string;
    orcid: string;
}

function ROCIDVD(props: ROCIDInt): JSX.Element {
    const { ror, orcid } = props;
    return (
        <>
            <ROCIDLinkVD link={ror} coreUrl={ROR_L}>
                <LogoRORVD height="22" />
            </ROCIDLinkVD>
            <ROCIDLinkVD link={orcid} coreUrl={ORCID_L}>
                <LogoORCIDVD height="22" />
            </ROCIDLinkVD>
        </>
    );
}

function ROCIDSpanVD(props: ROCIDInt & { text: string | undefined }): JSX.Element {
    const { text, ror, orcid } = props;
    return (
        <div className={Dis.dIFlex}>
            <div>
                {text}
                <ROCIDVD ror={ror} orcid={orcid} />
            </div>
        </div>
    );
}

function ROCIDCatVD(props: ROCIDInt & { name: string; brc_link: string }): JSX.Element {
    const { name, brc_link, ror, orcid } = props;

    return (
        <div className={Dis.dIFlex} style={{ marginRight: 40 }}>
            <CatalogLinkVD text={name} link={brc_link} bold={false}>
                <ROCIDVD ror={ror} orcid={orcid} />
            </CatalogLinkVD>
        </div>
    );
}

function modCatalog(
    filH: string[],
    filD: (EleT | JSX.Element)[],
    cat: [string, string, string, string, string, string]
): void {
    const catInd = filH.indexOf(HEAD[0] ?? '');
    const brcInd = filH.indexOf(HEAD[1] ?? '');
    const ccInd = filH.indexOf(HEAD[2] ?? '');
    let [cat_link, code, name, country, brc_link, ror] = cat;
    brc_link = cat_link == '' ? brc_link : '';
    if (code !== '') {
        filD.splice(catInd, 1, <CatalogLinkVD text={code} link={cat_link} bold />);
    }
    if (name !== '') {
        filD.splice(
            brcInd,
            1,
            <ROCIDCatVD ror={ror} orcid="" name={name} brc_link={brc_link} />
        );
    }
    if (country !== '') {
        filD.splice(ccInd, 1, <span>{parseCountryCode(country)}</span>);
    }
}

function modSiCu(filH: string[], filD: (EleT | JSX.Element)[], siCu: number): void {
    const hid = filH.indexOf(HEAD[4] ?? '');
    if (siCu > 0) {
        filD.splice(hid, 1, `${IdAcrTagCon.depId} ${siCu}`);
    }
}

function modSampleSource(
    filH: string[],
    filD: (EleT | JSX.Element)[],
    src: string
): void {
    const hid = filH.indexOf(HEAD[15] ?? '');
    if (src !== '') {
        filD.splice(hid, 1, <span>{parseCountryCode(src)}</span>);
    }
}

function modDates(
    filH: string[],
    filD: (EleT | JSX.Element)[],
    tid: string,
    date: string
): void {
    const hid = filH.indexOf(tid);
    if (date !== '') {
        filD.splice(hid, 1, createDate(date));
    }
}
function crW(wid: number): { width: string } {
    return {
        width: `${wid}%`,
    };
}

function modSampleDate(filH: string[], filD: (EleT | JSX.Element)[], date: string): void {
    const hid = filH.indexOf(HEAD[14] ?? '');
    if (date !== '') {
        filD.splice(hid, 1, createDateRKMS(date));
    }
}

function modOrcid(filH: string[], filD: (EleT | JSX.Element)[], tid: string): void {
    const hid = filH.indexOf(tid);
    const field = filD[hid];
    if (Array.isArray(field) && field[0] !== '') {
        filD.splice(
            hid,
            1,
            <ROCIDSpanVD orcid={field[1] ?? ''} ror="" text={field[0]} />
        );
    } else {
        filD.splice(hid, 1, <span>-</span>);
    }
}

function modRor(filH: string[], filD: (EleT | JSX.Element)[], tid: string): void {
    const hid = filH.indexOf(tid);
    const field = filD[hid];
    if (Array.isArray(field) && field[0] !== '') {
        filD.splice(
            hid,
            1,
            <ROCIDSpanVD ror={field[1] ?? ''} orcid="" text={field[0]} />
        );
    } else {
        filD.splice(hid, 1, <span>-</span>);
    }
}

function DetailsTiles({
    data,
    ctx,
    cid,
    rel,
    hooks,
}: { data: DetT } & HistriProps): JSX.Element {
    const dataF: EleT[] = flattenDetTto1dim(data);
    const filD: [string[], (EleT | JSX.Element)[]] = filterArrStr(HEAD, dataF, '-');
    modTaxName(filD[0], filD[1], data[5]);
    modCatalog(filD[0], filD[1], data[0]);
    modSiCu(filD[0], filD[1], data[2]);
    modSampleSource(filD[0], filD[1], data[13]);
    modDates(filD[0], filD[1], HEAD[12] ?? '', data[10]);
    modSampleDate(filD[0], filD[1], data[12]);
    modOrcid(filD[0], filD[1], HEAD[8] ?? '');
    modRor(filD[0], filD[1], HEAD[9] ?? '');
    modOrcid(filD[0], filD[1], HEAD[16] ?? '');
    modRor(filD[0], filD[1], HEAD[17] ?? '');
    modOrcid(filD[0], filD[1], HEAD[19] ?? '');
    modRor(filD[0], filD[1], HEAD[20] ?? '');
    const details = wrapDetValues(...filD);
    const histri = crShallowHist(ctx, cid, rel, hooks);
    return createXColTable<EleT | JSX.Element>(
        [...details, [histri]],
        (val: EleT | JSX.Element) => parseVal2Html(val),
        [
            <col key={0} span={1} style={crW(20)} />,
            <col key={1} span={1} style={crW(20)} />,
            <col key={2} span={1} style={crW(20)} />,
            <col key={3} span={1} style={crW(20)} />,
            <col key={4} span={1} style={crW(10)} />,
            <col key={5} span={1} style={crW(10)} />,
        ]
    )[0];
}

function crEmptyDetC(): DetT {
    return [
        ['', '', '', '', '', ''],
        '',
        0,
        false,
        false,
        ['', undefined, undefined],
        ['', ''],
        ['', ''],
        undefined,
        '',
        '',
        '',
        '',
        '',
        ['', ''],
        ['', ''],
        '',
        ['', ''],
        ['', ''],
        '',
    ];
}

function Details({ ctx, data, cid, rel, hookCul, hookInf, ccno }: ResProps): JSX.Element {
    let localData = data;
    const ref = useRef<HTMLDivElement>(null);
    localData ??= crEmptyDetC();
    useTooltipForRef(
        ref,
        hookInf,
        () => {
            if (hookInf.data !== undefined) {
                hookInf.data(
                    <p>
                        <b>StrainRegistry</b>: {ccno} | {IdAcrTagCon.depId} {cid}
                    </p>
                );
            }
        },
        [50, 50]
    );
    return (
        <div id={IdHtmlTour.passDet}>
            <h3 className={ClHtml.titSec}>
                {TIT}:<span className={`${Tex.p} ${Pad.lN10}`}>{ccno}</span>
                {localData[3] ? (
                    <span className={`${icSt.tc} ${Tex.s}`}>
                        <span ref={ref}>
                            <i className={ClHtml.strRegT} />
                        </span>
                    </span>
                ) : null}
                <span id={ID} />
            </h3>
            <section>
                <div className={scSty.mobile}>
                    <DetailsTiles
                        data={localData}
                        ctx={ctx}
                        cid={cid}
                        rel={rel}
                        hooks={hookCul}
                    />
                </div>
            </section>
        </div>
    );
}

interface DetailsState {
    res: DetT | undefined;
}

interface DetailsProps {
    rel: RelT[];
    culId: number;
    culDes: string;
    hookCul: DatIdTVInt<TT_GL_TYPE> & TTSrcTVInt;
    hookInf: DatIdTVInt<TT_GL_TYPE> & TTSrcTVInt;
    dCtrl: DetailCtrl;
}

type ResT = [string, number, DetT | undefined];

class DetailsVD extends Component<DetailsProps, DetailsState> {
    private curCulId: number;

    private readonly ctrl: DetailCtrl;

    private readonly modelH: DetSt;

    private loading: boolean;

    private time: number;

    constructor(props: DetailsProps) {
        super(props);
        this.curCulId = 0;
        this.state = { res: undefined };
        this.modelH = new DetSt();
        this.loading = false;
        this.time = Date.now();
        this.ctrl = props.dCtrl;
        this.modelH.resSet((res: DetailsR[]): void => {
            const [cul] = res;
            if (this.loading && cul !== undefined) {
                this.loading = false;
                const mRes = mapDetails2DetT(cul);
                this.updateState(mRes);
                trackSearch(
                    getApiToStr(QApiCon.culAvg),
                    `${mRes[2]}`,
                    1,
                    false,
                    Date.now() - this.time
                );
            }
        });
    }

    public updateState(newState: DetT): void {
        if (newState[2] !== this.curCulId) {
            this.reStartDetails();
        }
        this.setState({ res: newState });
    }

    public override shouldComponentUpdate(): boolean {
        return !this.loading;
    }

    private reStartDetails(): void {
        if (!this.loading) {
            this.loading = true;
            this.time = Date.now();
            const sea: number = this.curCulId;
            this.ctrl.init(this.modelH, [sea]);
        }
    }

    private startDetails(): void {
        this.time = Date.now();
        const sea: number = this.curCulId;
        this.ctrl.init(this.modelH, [sea]);
    }

    private didCulIdChange(culId: number, siCu: string, rel: RelT[]): boolean {
        if (Number.isNaN(culId) || !SR_CUL_ID.test(siCu)) {
            return false;
        }
        if (!rel.some((ele) => ele[0] === culId)) {
            return false;
        }
        const { res } = this.state;
        if (res === undefined) {
            return this.curCulId !== culId;
        }
        return this.curCulId !== culId || this.curCulId !== res[2];
    }

    private updateInVal(ctx: InValInt, id: string, initId: number, init: boolean): void {
        ctx.inValSet(id)((val: string) => {
            const { rel } = this.props;
            const culId = parseInt(
                val.replace(new RegExp(IdAcrTagCon.depId, 'i'), '').replace(/,.*/, ''),
                10
            );
            if (this.didCulIdChange(culId, val, rel)) {
                this.initCtrl(culId);
            }
        });
        if (init && initId > 0) {
            this.initCtrl(initId);
        }
    }

    private initCtrl(id: number): void {
        this.curCulId = id;
        if (!this.loading) {
            this.loading = true;
            this.startDetails();
        }
    }

    public render(): JSX.Element | null {
        const { culId, culDes, rel, hookCul, hookInf } = this.props;
        const { res } = this.state;
        const ctx: InValInt | undefined = this.context;
        if (ctx !== undefined) {
            let resC: ResT = [culDes, culId, undefined];
            if (res !== undefined) {
                resC = [res[1], res[2], res];
            }
            const det = (
                <Details
                    rel={rel}
                    ccno={resC[0]}
                    cid={resC[1]}
                    ctx={ctx}
                    hookCul={hookCul}
                    hookInf={hookInf}
                    data={resC[2]}
                />
            );
            this.updateInVal(ctx, ID + TIT, culId, res === undefined);
            return det;
        }
        return null;
    }
}
DetailsVD.contextType = MainConGl;
export default DetailsVD;
export { getAnchorD };
