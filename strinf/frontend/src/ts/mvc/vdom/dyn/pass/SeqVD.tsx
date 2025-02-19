import { Component } from 'preact';
import type { JSX } from 'preact';
import { memo } from 'preact/compat';
import {
    Align,
    BgCol,
    ClHtml,
    Dis,
    Font,
    Mar,
    Pad,
    Tex,
} from '@strinf/ts/constants/style/ClHtml';
import { getSeqTuple } from '@strinf/ts/functions/api/map';
import { filterArrRowStr } from '@strinf/ts/functions/arr/parse';
import type { SeqT } from '@strinf/ts/interfaces/api/maped';
import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import type { TT_GL_TYPE, ToolTipHookInt } from '@strinf/ts/interfaces/dom/tooltip';
import { createSeqAccLink, createSimpleTiles } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import PassAncId from '@strinf/ts/constants/page/pass';

import tilSty from '@strinf/css/mods/tile.module.css';
import type { TableProps } from '@strinf/ts/mvc/vdom/dyn/table/Table';
import TableCon from '@strinf/ts/mvc/vdom/dyn/table/Table';
import formatCultureTT from '@strinf/ts/mvc/vdom/fun/pass/culture';
import { strNumSort, defaultSort } from '@strinf/ts/functions/arr/sort';
import linkSty from '@strinf/css/mods/link.module.css';
import { isSlimScreen } from '@strinf/ts/functions/misc/screen';

type Events = [() => void, string, Element][];

interface ResProps {
    detAnc: string;
    res: SeqT[];
    hookCul: ToolTipHookInt<TT_GL_TYPE>;
    hookInf: ToolTipHookInt<TT_GL_TYPE>;
}

const TIT = 'Sequences';
const ID = PassAncId.seq;

interface TProps {
    res: SeqT[];
    anc: string;
    hookCul: ToolTipHookInt<TT_GL_TYPE>;
    hookInf: ToolTipHookInt<TT_GL_TYPE>;
}

type MOD_SEQ_T = [string, [string, number][], string, string, string, string];
type ELE_T = string | number | [string, number][] | undefined;

interface SeqProps extends TableProps<MOD_SEQ_T> {
    events: Events;
    anc: string;
    hookCul: ToolTipHookInt<TT_GL_TYPE>;
    hookInf: ToolTipHookInt<TT_GL_TYPE>;
}

function prepareData(res: SeqT[]): [MOD_SEQ_T[], [number, string, boolean][]] {
    const fDat: MOD_SEQ_T[] = res.map(
        (val) => [...val.slice(0, 4), `${val[4]}`, `${val[5] ?? ''}`] as MOD_SEQ_T
    );
    let off = 0;
    const head = getSeqTuple(true).map((val, index): [number, string, boolean] => {
        if (index === 3) {
            off += 1;
        }
        return [index + off, val, index !== 1];
    });
    return [fDat, head];
}

function crAcc(row: MOD_SEQ_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{createSeqAccLink(row[0])}</span>;
}

function crDesc(row: MOD_SEQ_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[2]}</span>;
}

function crLenLvl(row: MOD_SEQ_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[4]}</span>;
}

function crYear(row: MOD_SEQ_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[5]}</span>;
}

function selectActive(data: MOD_SEQ_T[]): SeqTyp {
    const exist = new Set(data.map((val) => val[3]));
    for (const seqT of SEQ_TYPE_ORDER) {
        if (exist.has(seqT)) {
            return seqT;
        }
    }
    return SeqTyp.genome;
}

class SeqTable extends TableCon<MOD_SEQ_T, SeqProps> {
    private readonly tooltip: [(eve: Events) => void, Events];
    private readonly anc: string;
    private active: SeqTyp;
    private readonly exist: Set<string>;

    constructor(props: SeqProps) {
        const { events, anc, res } = props;
        const storeEv = (eve: Events) => {
            events.push(...eve);
        };
        super({ ...props, tableCl: `${ClHtml.tab}  ${ClHtml.hov}` });
        this.active = selectActive(props.res);
        this.tooltip = [storeEv, events];
        this.anc = anc;
        this.filterAction([[this.active, 3]]);
        this.exist = new Set(res.map(([, , , seqT]) => seqT));
    }

    private crCul(row: MOD_SEQ_T | undefined, ctx: InValStInt | undefined) {
        const { hookCul, hookInf } = this.props;
        if (row === undefined || ctx === undefined) {
            return null;
        }
        return formatCultureTT(this.anc, row[1], [hookCul, hookInf], ctx, this.tooltip);
    }

    protected override sort(index: number, sort: number): number[] {
        const { view } = this.state;
        const getV = (datPos: number): ELE_T => {
            return this.data[datPos]?.[index] ?? '';
        };
        const numSort = (st1: number, st2: number): number =>
            strNumSort<ELE_T>(sort, getV(st1), getV(st2));
        const defSort = (st1: number, st2: number): number =>
            defaultSort<ELE_T>(sort, getV(st1), getV(st2));
        switch (index) {
            case 3:
                return view.sort(this.active === SeqTyp.genome ? defSort : numSort);
            case 4:
                return view.sort(numSort);
            default:
                return view.sort(defSort);
        }
    }

    protected override filter(value: [string, number][], limit: number[]): number[] {
        const [filV] = value.slice().pop() ?? [this.active];
        this.active = filV as SeqTyp;
        return limit.filter((ind: number) => {
            const dat = this.data[ind];
            if (dat === undefined) {
                return false;
            }
            return dat[3] === this.active;
        });
    }

    protected override search(filter: string, limit: number[]): number[] {
        const prepFilter = filter.toLocaleLowerCase();
        return limit.filter((ind: number) => {
            const val = this.data[ind];
            if (val === undefined) {
                return false;
            }
            const [acc, desC, , , len, year] = val;
            if (
                acc.toLocaleLowerCase().includes(prepFilter) ||
                len.toLocaleLowerCase().includes(prepFilter) ||
                year.toLocaleLowerCase().includes(prepFilter)
            ) {
                return true;
            }
            for (const [des] of desC) {
                if (des.toLocaleLowerCase().includes(prepFilter)) {
                    return true;
                }
            }
            return false;
        });
    }

    protected override renderTableBody(): JSX.Element {
        const ctx: InValStInt | undefined = this.context;
        return (
            <tbody>
                {this.body.map((val: MOD_SEQ_T | undefined, index) => {
                    return (
                        <tr key={index}>
                            <th>{crAcc(val)}</th>
                            <th>{this.crCul(val, ctx)}</th>
                            <th>{crDesc(val)}</th>
                            <th>{crLenLvl(val)}</th>
                            <th>{crYear(val)}</th>
                        </tr>
                    );
                })}
            </tbody>
        );
    }

    protected override renderFilter(): JSX.Element | null {
        return (
            <SeqTypeFilter
                exist={this.exist}
                active={this.active}
                filter={(val: string) => {
                    this.filterAction([[val, 3]]);
                }}
            />
        );
    }

    protected override renderTableHead(): JSX.Element {
        const cusHead = getSeqTuple(this.active === SeqTyp.genome);
        return (
            <thead>
                <tr>
                    {cusHead.map((val, index) => {
                        const [, , toSort] = this.head[index] ?? [];
                        return (
                            <th key={index}>
                                {val}
                                {this.createSortElement(index, toSort ?? false)}
                            </th>
                        );
                    })}
                </tr>
            </thead>
        );
    }

    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    protected override renderWindow(): JSX.Element | null {
        return null;
    }

    protected override renderContainer(): JSX.Element {
        const claB = `${Mar.tN15} ${Dis.dFlex} ${Align.js} ${Align.jb}`;
        const claT = `${Mar.bN10} ${Dis.dFlex} ${Align.js} ${Align.jb}`;
        const claE = `${Mar.bN10} ${Font.N12}`;
        return (
            <div className={`${ClHtml.cnt} ${Mar.lN0} ${Mar.rN0}`}>
                <div className={claE}>{this.renderWindow()}</div>
                <div className={claT}>
                    {this.renderInput()}
                    {this.renderFilter()}
                </div>
                {this.renderTable()}
                <div className={claB}>
                    {this.renderInfo()}
                    {this.renderPagination()}
                </div>
            </div>
        );
    }
}

SeqTable.contextType = MainConGl;

interface SeqTFilProps {
    active: SeqTyp;
    exist: Set<string>;
    filter: (val: string) => void;
}

const SEQ_THESAURUS: Record<string, string> = {
    genome: 'Genome',
    gene: 'Gene',
    rrnaop: 'rRNA operon',
    patent: 'Patent',
};

enum SeqTyp {
    genome = 'genome',
    gene = 'gene',
    rrnaop = 'rrnaop',
    patent = 'patent',
}

const SEQ_TYPE_ORDER = [SeqTyp.genome, SeqTyp.rrnaop, SeqTyp.gene, SeqTyp.patent];

function createTileClass(active: boolean, empty: boolean): string {
    if (empty) {
        return `${Tex.m} ${BgCol.lMut}`;
    }
    if (active) {
        return `${BgCol.prim} ${Tex.w} ${ClHtml.tLin}`;
    }
    return ClHtml.tLin;
}

class SeqTypeFilter extends Component<SeqTFilProps, object> {
    private active: SeqTyp;
    private exist: Set<string>;
    private filter: (val: string) => void;

    constructor(props: SeqTFilProps) {
        super(props);
        const { active, exist, filter } = props;
        this.active = active;
        this.exist = exist;
        this.filter = filter;
    }

    public updateObjState(): void {
        const { active, exist, filter } = this.props;
        this.active = active;
        this.exist = exist;
        this.filter = filter;
    }

    public wideScreen(): JSX.Element {
        const data = SEQ_TYPE_ORDER;
        const tiles = createSimpleTiles(data, (val: SeqTyp) => [
            SEQ_THESAURUS[val] ?? val,
            createTileClass(val === this.active, !this.exist.has(val)),
        ]).map((val, index): JSX.Element => {
            const localAct = data[index] ?? this.active;
            if (!this.exist.has(data[index] ?? '')) {
                return val;
            }
            return (
                <button
                    className={linkSty.cleanbutton}
                    aria-label="Sequence type"
                    type="button"
                    key={index}
                    onClick={() => {
                        this.filter(localAct);
                    }}
                >
                    {val}
                </button>
            );
        });
        const cla = `${ClHtml.tils} ${Pad.bN10} ${tilSty.tilestext}`;
        return (
            <div className={cla} style={{ 'user-select': 'none' }}>
                {tiles}
            </div>
        );
    }

    private slimScreen(): JSX.Element {
        const data = SEQ_TYPE_ORDER;
        return (
            <div>
                <select
                    className={`${ClHtml.formCtrl} ${Mar.lNAT}`}
                    style={{ width: '14rem' }}
                    onChange={(val) => {
                        this.filter(val.currentTarget.value);
                    }}
                >
                    {data
                        .filter((val) => this.exist.has(val))
                        .map((val, ind) => {
                            let attr = {};
                            const label = SEQ_THESAURUS[val];
                            if (val === this.active) {
                                attr = { selected: true, disabled: true };
                            }
                            return (
                                <option key={`seqtype${ind}`} value={val} {...attr}>
                                    {label}
                                </option>
                            );
                        })}
                </select>
            </div>
        );
    }

    public render(): JSX.Element | null {
        this.updateObjState();
        if (isSlimScreen()) {
            return this.slimScreen();
        }
        return this.wideScreen();
    }
}

class TableSeq extends Component<TProps, object> {
    private events: Events;

    constructor(props: TProps) {
        super(props);
        this.events = [];
    }

    public render(): JSX.Element {
        this.events = [];
        const { res, anc, hookCul, hookInf } = this.props;
        const [data, head] = prepareData(res);
        return (
            <SeqTable
                res={data}
                window={5}
                head={head}
                events={this.events}
                anc={anc}
                hookCul={hookCul}
                hookInf={hookInf}
            />
        );
    }
}

TableSeq.contextType = MainConGl;

function getAnchorS(ord: number, rel: SeqT[]): AncT {
    if (rel.length > 0) {
        return { [ord]: [ID, TIT] };
    }
    return {};
}

function SeqVD(props: ResProps): JSX.Element | null {
    const { res, detAnc, hookCul, hookInf } = props;
    const resF = filterArrRowStr<SeqT>(res, []);
    if (resF.length === 0) {
        return null;
    }
    return (
        <div id={IdHtmlTour.passSeq}>
            <h3 className={ClHtml.titSec}>
                {TIT}
                <span id={ID} />
            </h3>
            <section>
                <TableSeq anc={detAnc} res={resF} hookCul={hookCul} hookInf={hookInf} />
            </section>
        </div>
    );
}

export default memo(SeqVD);
export { getAnchorS };
