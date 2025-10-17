import type { SeaR } from '@strinf/ts/interfaces/api/mapped';
import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type { TableProps } from '@strinf/ts/mvc/vdom/dyn/table/Table';
import type { JSX } from 'preact';
import linkSty from '@strinf/css/mods/link.module.css';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import ClHtmlSt from '@strinf/ts/constants/stat/ClHtml';
import { DD_B } from '@strinf/ts/constants/style/AtHtml';
import {
    Align,
    ClHtml,
    Dis,
    Font,
    Mar,
    Pad,
    Tex,
    Wid,
} from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import {
    convertStrainStatusToEnum,
    getApiToStr,
    getSeaResTuple,
} from '@strinf/ts/functions/api/map';
import { defaultSort, numSort } from '@strinf/ts/functions/arr/sort';
import { selectBannerImage } from '@strinf/ts/functions/files/image';
import { getCurFullPathWithArgs } from '@strinf/ts/functions/http/http';
import { isSmallScreen } from '@strinf/ts/functions/misc/screen';
import parseCountryCode from '@strinf/ts/functions/parse/country';
import DownloadBlobVD from '@strinf/ts/mvc/vdom/dyn/misc/DownloadVD';
import { LightsSmVD } from '@strinf/ts/mvc/vdom/dyn/misc/StrainStatus';
import TableCon from '@strinf/ts/mvc/vdom/dyn/table/Table';
import { trackDownload } from '@strinf/ts/mvc/vdom/fun/mat/track';
import {
    createBoolIcon,
    createPassLinkStrain,
    DotTT,
} from '@strinf/ts/mvc/vdom/fun/tab/misc';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { useCallback, useState } from 'preact/hooks';

interface SeaTProps {
    res: SeaR[];
    sea: [string, string];
    hook: ToolTipHookInt<TT_GL_TYPE>;
}

type ELE_T = string | number | boolean | string[] | Uint8Array;
type MOD_SEA_T = [number, string[], string, boolean, Uint8Array, number];
type FILTER_VALUES = [string | number, number][];

interface FilterProps {
    data: MOD_SEA_T[];
    filter: (val: FILTER_VALUES) => void;
}

interface DownloadProps {
    worker: Worker;
    view: number[];
    term: string;
    showBtn?: boolean | undefined;
}

interface OptionsProps {
    opt: FILTER_CON;
    state: FILTER_STATE;
    setSt: (value: FILTER_STATE) => void;
    filter: (val: FILTER_VALUES) => void;
}

interface OptionProps {
    data: Set<string | number> | null;
    sel: string | number;
    empty: string | number;
    title: string;
    onChange: (val: string) => void;
}

interface FILTER_STATE {
    tax: string;
    acr: string;
    typ: number;
    sam: string;
    sta: number;
}

interface FILTER_CON {
    tax: Set<string> | null;
    acr: Set<string> | null;
    sam: Set<string> | null;
    typ: Set<number> | null;
    sta: Set<number> | null;
}

const ACR = /^([A-Z]+)[^A-Z]+(?:[A-Z].*)?$/i;
const NAME = /^([A-Z][a-z]+)[^A-Za-z].*$/;

function createEmptyFilter(): FILTER_STATE {
    return { tax: '', acr: '', sam: '', typ: -1, sta: -1 };
}

function comArrayStr(value: ELE_T, comp: string | number | Uint8Array): boolean {
    if (Array.isArray(value) && typeof comp === 'string') {
        for (const ccno of value) {
            if (ccno.toLowerCase().startsWith(comp)) {
                return true;
            }
        }
    }
    return false;
}

function comCode(value: ELE_T, comp: string | number | Uint8Array): boolean {
    if (value instanceof Uint8Array && comp instanceof Uint8Array) {
        if (value.length !== comp.length) {
            return false;
        }
        for (let ind = 0; ind < value.length; ind++) {
            if (value[ind] !== comp[ind]) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function comString(value: ELE_T, comp: string | number | Uint8Array): boolean {
    return (
        typeof value === 'string'
        && typeof comp === 'string'
        && value.toLowerCase().startsWith(comp)
    );
}

function comNumBool(value: ELE_T, comp: string | number | Uint8Array): boolean {
    return (
        typeof value === 'boolean' && typeof comp === 'number' && comp === Number(value)
    );
}

function comNum(value: ELE_T, comp: string | number | Uint8Array): boolean {
    return typeof value === 'number' && typeof comp === 'number' && comp === value;
}

function compare(
    index: number,
    value: ELE_T,
    comp: string | number | Uint8Array,
): boolean {
    switch (index) {
        case 1:
            return comArrayStr(value, comp);
        case 2:
            return comString(value, comp);
        case 3:
            return comNumBool(value, comp);
        case 4:
            return comCode(value, comp);
        case 5:
            return comNum(value, comp);
        default:
            return value === comp;
    }
}
const ITEM_LIMIT = 15;
const DEC = new TextDecoder();
const ENC = new TextEncoder();

function add2Set<T, E>(data: Set<E>, newV: T, parser: (val: T) => E): void {
    if (
        data.size <= ITEM_LIMIT
        && !(newV === '' || newV === -1 || (newV instanceof Uint8Array && newV.length === 0))
    ) {
        data.add(parser(newV));
    }
}

function checkSetLimit<T>(data: Set<T>): Set<T> | null {
    if (data.size > ITEM_LIMIT) {
        return null;
    }
    return data;
}

function createFilter(data: MOD_SEA_T[]): [FILTER_CON, FILTER_STATE] {
    const [tax, acr, typ, sam, sta] = [
        new Set<string>(),
        new Set<string>(),
        new Set<number>(),
        new Set<string>(),
        new Set<number>(),
    ];
    for (const [, desC, name, typStr, src, status] of data) {
        add2Set(typ, typStr ? 1 : 0, val => val);
        add2Set(sta, status, val => val);
        add2Set(sam, src, val => parseCountryCode(DEC.decode(val)));
        const [, rootName] = NAME.exec(name)?.values() ?? [''];
        add2Set(tax, rootName ?? '', val => val);
        for (const ccno of desC) {
            const [, res] = ACR.exec(ccno)?.values() ?? [''];
            add2Set(acr, res ?? '', val => val);
        }
    }
    return [
        {
            tax: checkSetLimit(tax),
            acr: checkSetLimit(acr),
            typ: checkSetLimit(typ),
            sam: checkSetLimit(sam),
            sta: checkSetLimit(sta),
        },
        createEmptyFilter(),
    ];
}

function checkSelected<T>(val: T, sel: T) {
    if (val !== sel) {
        return {};
    }
    return {
        selected: true,
        disabled: true,
    };
}

function crFilter(state: FILTER_STATE): [string | number, number][] {
    return [
        [state.acr, 1] as [string, number],
        [state.tax, 2] as [string, number],
        [state.typ, 3] as [number, number],
        [state.sam, 4] as [string, number],
        [state.sta, 5] as [number, number],
    ].filter(([val]) => val !== '' && val !== -1);
}

const TYPE_STRAIN = 'Type strain';
const STRAIN_STATUS = 'Strain status';

function crValOut(val: string | number, title: string): string {
    if (title === TYPE_STRAIN && typeof val === 'number') {
        return val > 0 ? 'True' : 'False';
    }
    if (title === STRAIN_STATUS && typeof val === 'number') {
        return convertStrainStatusToEnum(val);
    }
    return String(val);
}

function crDefaultDrDown(
    data: Set<string | number>,
    sel: string | number,
    empty: string | number,
    title: string,
    onChange: (val: string) => void,
): JSX.Element {
    const tid = `${title}-filter`;
    const datCon = Array.from(data.values());
    datCon.sort();
    return (
        <div className={ClHtml.formGr}>
            <label htmlFor={tid}>{title}</label>
            <select
                id={tid}
                className={ClHtml.formCtrl}
                onChange={(val) => {
                    onChange(val.currentTarget.value);
                }}
            >
                <option value={empty} {...checkSelected(empty, sel)}>
                    Show all
                </option>
                {datCon.map((val, ind) => (
                    <option key={`datopt${ind}`} value={val} {...checkSelected(val, sel)}>
                        {crValOut(val, title)}
                    </option>
                ))}
            </select>
        </div>
    );
}

function crInputDrDown({ sel, title, empty, onChange }: OptionProps): JSX.Element {
    const tid = `${title}-filter-input`;
    return (
        <div className={ClHtml.formGr}>
            <label htmlFor={tid}>{title}</label>
            <input
                id={tid}
                placeholder={`search for ${title.toLowerCase()}`}
                value={sel}
                className={ClHtml.formCtrl}
                onChange={(val) => {
                    let inputV = val.currentTarget.value;
                    if (typeof inputV !== 'string' || inputV.length < 1) {
                        inputV = `${empty}`;
                    }
                    onChange(inputV);
                }}
            />
        </div>
    );
}

function OptionsWrapper({ data, sel, title, empty, onChange }: OptionProps): JSX.Element {
    if (data !== null && data.size < 2) {
        return <></>;
    }
    if (data === null) {
        return crInputDrDown({ data, sel, title, empty, onChange });
    }
    return crDefaultDrDown(data, sel, empty, title, onChange);
}

function FilterOptions({ opt, state, setSt, filter }: OptionsProps): JSX.Element {
    return (
        <div className={`${ClHtml.drDM} ${Wid.N300}`} aria-labelledby="Search filter">
            <div className={`${Pad.lN10} ${Pad.rN10}  ${Pad.tN5}`}>
                <OptionsWrapper
                    data={opt.tax}
                    empty=""
                    sel={state.tax}
                    title="Taxonomy"
                    onChange={(val) => {
                        const newSt = { ...state, tax: val };
                        setSt(newSt);
                        filter(crFilter(newSt));
                    }}
                />
                <OptionsWrapper
                    data={opt.acr}
                    empty=""
                    sel={state.acr}
                    title="Designation"
                    onChange={(val) => {
                        const newSt = { ...state, acr: val };
                        setSt(newSt);
                        filter(crFilter(newSt));
                    }}
                />
                <OptionsWrapper
                    data={opt.typ}
                    empty={-1}
                    sel={state.typ}
                    title={TYPE_STRAIN}
                    onChange={(val) => {
                        const newSt = {
                            ...state,
                            typ: Number.parseInt(val, 10),
                        };
                        setSt(newSt);
                        filter(crFilter(newSt));
                    }}
                />
                <OptionsWrapper
                    data={opt.sam}
                    empty=""
                    sel={state.sam}
                    title="Sample country"
                    onChange={(val) => {
                        const newSt = { ...state, sam: val };
                        setSt(newSt);
                        filter(crFilter(newSt));
                    }}
                />
                <OptionsWrapper
                    data={opt.sta}
                    empty={-1}
                    sel={state.sta}
                    title={STRAIN_STATUS}
                    onChange={(val) => {
                        const newSt = {
                            ...state,
                            sta: Number.parseInt(val, 10),
                        };
                        setSt(newSt);
                        filter(crFilter(newSt));
                    }}
                />
            </div>
        </div>
    );
}

function checkEmptyFilter(filOpt: FILTER_CON): boolean {
    for (const val of Object.values(filOpt)) {
        if (val === null || val.size >= 2) {
            return false;
        }
    }
    return true;
}

async function createCSV(
    worker: Worker,
    indices: number[],
    term: string,
): Promise<[string, string]> {
    const workerP = new Promise<[string, string]>((resolve) => {
        let jsonBlob: Blob;
        worker.postMessage({ type: 'request', data: indices });
        worker.onmessage = (eve) => {
            if (typeof eve.data === 'string') {
                jsonBlob = new Blob([eve.data], {
                    type: 'text/plain;charset=utf-8',
                });
                trackDownload(
                    getCurFullPathWithArgs(
                        `view=${indices.length}&results=${eve.data.length}`,
                    ),
                    jsonBlob.size,
                );
            }
            else {
                jsonBlob = new Blob([''], { type: 'text/plain;charset=utf-8' });
            }
            resolve([URL.createObjectURL(jsonBlob), `${term}.csv`]);
        };
    });
    return workerP;
}

function activeLink(
    worker: Worker,
    index: number[],
    term: string,
): (eve: Event) => Promise<[string, string]> {
    const name = term === '' ? 'StrainInfo' : term;
    const callback = async (eve: Event) => {
        eve.stopPropagation();
        return createCSV(worker, index, name);
    };
    return callback;
}

function DownloadBtn({ worker, view, term }: DownloadProps): JSX.Element {
    const btnC = `${ClHtml.btn} ${ClHtml.pri} ${Mar.lN5} ${ClHtmlSt.mask}`;
    return (
        <DownloadBlobVD
            btnC={btnC}
            ico={ClHtmlI.downlF}
            callBack={activeLink(worker, view, term)}
            ancC={linkSty.linkmain}
            label="Save all filtered results"
            emptyLoad={false}
            state={view.length}
            desc="Download"
        />
    );
}

const SEARCH_FILTER_CL = 'strinf-search-table-filter';

function FilterWrapper({ data, filter }: FilterProps): JSX.Element {
    const [filOpt, filSt] = createFilter(data);
    const [filterSt, setFilterSt] = useState<FILTER_STATE>(filSt);
    if (checkEmptyFilter(filOpt)) {
        return <span></span>;
    }
    return (
        <>
            <div className={`${ClHtml.drD} ${SEARCH_FILTER_CL}`}>
                <button
                    aria-label="Search results filters"
                    className={`${ClHtml.btn} ${ClHtml.pri}`}
                    type="button"
                    {...DD_B}
                >
                    <i className={ClHtmlI.filter} aria-hidden="true"></i>
                    <i className={ClHtmlI.caretDB} aria-hidden="true"></i>
                    <span>
                        <b>Search</b>
                    </span>
                </button>
                <FilterOptions
                    opt={filOpt}
                    filter={filter}
                    state={filterSt}
                    setSt={(val) => {
                        setFilterSt(val);
                    }}
                />
            </div>
            <button
                aria-label="Clear all set filters"
                className={`${ClHtml.btn} ${Mar.lN5}`}
                type="button"
                onClick={() => {
                    filter([]);
                    setFilterSt(createEmptyFilter());
                }}
            >
                <i className={ClHtml.unfI} />
            </button>
        </>
    );
}

function SearchFilter({
    data,
    worker,
    filter,
    view,
    term,
    showBtn,
}: FilterProps & DownloadProps): JSX.Element {
    const runFilter = useCallback(
        (filterV: FILTER_VALUES) => {
            filter(filterV);
        },
        [data, filter],
    );
    let download: JSX.Element | null = (
        <DownloadBtn worker={worker} view={view} term={term} />
    );
    if (isSmallScreen() || showBtn === false) {
        download = null;
    }
    return (
        <div>
            <FilterWrapper data={data} filter={runFilter} />
            {download}
        </div>
    );
}

function crStrain(
    row: MOD_SEA_T | undefined,
    ctx: InValStInt | undefined,
): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    const [sid] = row;
    return createPassLinkStrain(String(sid), undefined, ctx);
}

function crDesignation(
    row: MOD_SEA_T | undefined,
    ttH: ToolTipHookInt<TT_GL_TYPE> | undefined,
): JSX.Element | null {
    if (row === undefined || ttH === undefined) {
        return null;
    }
    const main = row[1].slice(0, 2).join(',');
    if (row[1].length < 3) {
        return <span className={Font.norm}>{main}</span>;
    }
    const data = row[1].slice(2).map(ele => ele);
    if (data.length === 0) {
        return null;
    }
    return (
        <span className={Font.norm}>
            {main}
            ,
            <DotTT hook={ttH} data={data} head="Designation" />
        </span>
    );
}

function crTaxa(row: MOD_SEA_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <i className={Font.norm}>{row[2]}</i>;
}

function crTypeStrain(row: MOD_SEA_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return createBoolIcon(row[3]);
}

function crStrainStatus(
    row: MOD_SEA_T | undefined,
    ttH: ToolTipHookInt<TT_GL_TYPE>,
): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return (
        <span className={Font.norm}>
            <LightsSmVD status={convertStrainStatusToEnum(row[5])} ttHook={ttH} />
        </span>
    );
}

function prepCode(codeMap: [string, Uint8Array][], sReg: string): Uint8Array {
    for (const [reg, ccArr] of codeMap) {
        if (reg.startsWith(sReg)) {
            return ccArr;
        }
    }
    return ENC.encode(sReg);
}

interface SeaTableProps extends TableProps<MOD_SEA_T> {
    hook: ToolTipHookInt<TT_GL_TYPE>;
    term: string;
    download?: boolean;
    perPage?: boolean;
}

class SeaTable extends TableCon<MOD_SEA_T, SeaTableProps> {
    private readonly codeMap: [string, Uint8Array][];
    private readonly worker: Worker;

    constructor(props: SeaTableProps) {
        super(props);
        const { res } = props;
        this.worker = new Worker(
            new URL('@strinf/ts/functions/files/worker_si_csv', import.meta.url),
            { type: 'module' },
        );
        this.worker.postMessage({ type: 'init', data: res });
        const uCodes = new Set<string>();
        for (const [, , , , code] of res) {
            uCodes.add(DEC.decode(code));
        }
        this.codeMap = Array.from({ length: uCodes.size });
        let ind = 0;
        for (const code of uCodes) {
            this.codeMap[ind] = [parseCountryCode(code).toLowerCase(), ENC.encode(code)];
            ind++;
        }
    }

    public override componentWillUnmount(): void {
        this.worker.terminate();
        this.codeMap.splice(0, this.codeMap.length);
        super.componentWillUnmount();
    }

    protected override sort(index: number, sort: number): number[] {
        const { view } = this.state;
        const getV = (datPos: number): ELE_T => {
            return this.data[datPos]?.[index] ?? '';
        };
        switch (index) {
            case 0:
            case 5:
                return view.sort((st1, st2) => numSort(sort, getV(st1), getV(st2)));
            default:
                return view.sort((st1, st2) => defaultSort(sort, getV(st1), getV(st2)));
        }
    }

    protected override filter(
        value: [string | number, number][],
        limit: number[],
    ): number[] {
        const filteredRes: number[] = Array.from({ length: limit.length });
        for (const ind of limit) {
            const val = this.data[ind];
            if (val === undefined) {
                continue;
            }
            let toAdd = true;
            for (const [filV, filI] of value) {
                let prepCom: string | number | Uint8Array = filV;
                if (typeof filV === 'string') {
                    prepCom = filV.toLowerCase();
                }
                if (filI === 4 && typeof prepCom === 'string') {
                    prepCom = prepCode(this.codeMap, prepCom);
                }
                if (!compare(filI, val[filI] ?? '', prepCom)) {
                    toAdd = false;
                    break;
                }
            }
            if (toAdd) {
                filteredRes[ind] = ind;
            }
        }
        return filteredRes.filter(val => val >= 0);
    }

    protected override search(_filter: string, limit: number[]): number[] {
        return limit;
    }

    protected override renderTableBody(): JSX.Element {
        const ctx: InValStInt | undefined = this.context;
        const { hook } = this.props;
        return (
            <tbody>
                {this.body.map((val: MOD_SEA_T | undefined, index) => {
                    return (
                        <tr key={index}>
                            <th>{crStrain(val, ctx)}</th>
                            <th>{crDesignation(val, hook)}</th>
                            <th>{crTaxa(val)}</th>
                            <th>{crTypeStrain(val)}</th>
                            <th>{crStrainStatus(val, hook)}</th>
                        </tr>
                    );
                })}
            </tbody>
        );
    }

    protected override renderContainer(): JSX.Element {
        const claB = `${Mar.tN15} ${Dis.dFlex} ${Align.js} ${Align.jb}`;
        const claT = `${Mar.bN10} ${Dis.dFlex} ${Align.js} ${Align.jb}`;
        let perPag = this.renderWindow();
        const { perPage } = this.props;
        if (isSmallScreen() || perPage === false) {
            perPag = null;
        }
        return (
            <div className={`${ClHtml.cnt} ${Mar.lN0} ${Mar.rN0}`}>
                <div className={claT}>
                    {this.renderFilter()}
                    {perPag}
                </div>
                {this.renderTable()}
                <div className={claB}>
                    {this.renderInfo()}
                    {this.renderPagination()}
                </div>
            </div>
        );
    }

    protected override renderFilter(): JSX.Element {
        const { view } = this.state;
        const { term, download } = this.props;
        return (
            <SearchFilter
                worker={this.worker}
                data={this.data}
                view={view}
                term={term}
                filter={(val: FILTER_VALUES) => {
                    this.filterAction(val);
                }}
                showBtn={download}
            />
        );
    }
}

SeaTable.contextType = MainConGl;
const bgSty = {
    'background-size': 'cover',
    'background-position': 'top',
    'background-image':
        'linear-gradient(to right,rgba(27, 27, 27, 0.8),'
        + 'rgba(27, 27, 27, 0.8)), '
        + `url(${selectBannerImage()})`,
};

function SeaTVD({ res, sea, hook }: SeaTProps): JSX.Element | null {
    if (res.length === 0) {
        return null;
    }
    const seaCat = getApiToStr(sea[1]);
    const seaVal = sea[0] !== '' ? `- ${decodeURIComponent(sea[0])}` : '';
    return (
        <section className={ClHtml.sec} style={bgSty}>
            <h1 className={`${Tex.w} ${ClHtml.titSec}`}>
                {seaCat}
                {' '}
                {seaVal}
            </h1>
            <div className={`${ClHtml.box} ${Pad.N15}`} id={IdHtmlTour.seaTab}>
                <SeaTable
                    hook={hook}
                    res={res}
                    window={50}
                    term={decodeURIComponent(sea[0])}
                    head={getSeaResTuple(false).map((val, index) => [
                        index,
                        val,
                        index !== 1
                        && index !== 3
                        && index !== 4
                        && (index !== 2 || res.length <= 400000),
                    ])}
                />
            </div>
        </section>
    );
}

export default SeaTVD;

export { SEARCH_FILTER_CL, SeaTable };
