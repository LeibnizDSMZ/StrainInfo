import type { PubT } from '@strinf/ts/interfaces/api/mapped';
import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { TableProps } from '@strinf/ts/mvc/vdom/dyn/table/Table';
import type { JSX } from 'preact';
import PassAncId from '@strinf/ts/constants/page/pass';
import { Align, ClHtml, Dis, Font } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import { getPubTuple } from '@strinf/ts/functions/api/map';
import { defaultSort, strNumSort } from '@strinf/ts/functions/arr/sort';
import TableCon, { SearchWr } from '@strinf/ts/mvc/vdom/dyn/table/Table';
import formatCultureTT from '@strinf/ts/mvc/vdom/fun/pass/culture';
import { createDoiLink } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { Component } from 'preact';

const TIT = 'Publications';
const ID = PassAncId.pub;

interface TProps {
    res: PubT[];
    detAnc: string;
    hookDep: ToolTipHookInt<TT_GL_TYPE>;
    hookInf: ToolTipHookInt<TT_GL_TYPE>;
}

interface TMinProps {
    res: [string, string, string, string, number][];
}

type Events = [() => void, string, Element][];

function getAnchorP(ord: number, rel: PubT[]): AncT {
    if (rel.length > 0) {
        return { [ord]: [ID, TIT] };
    }
    return {};
}

type MOD_PUB_T = [string, string, [string, number][], string, string, string];
type ELE_T = string | number | [string, number][] | undefined;

interface PubProps extends TableProps<MOD_PUB_T> {
    events?: Events;
    anc?: string;
    cul: boolean;
    hookInf?: ToolTipHookInt<TT_GL_TYPE>;
    hookCul?: ToolTipHookInt<TT_GL_TYPE>;
}

function crTitle(row: MOD_PUB_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{createDoiLink(row[0], row[1])}</span>;
}

function crAuth(row: MOD_PUB_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[3]}</span>;
}

function crPub(row: MOD_PUB_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[4]}</span>;
}

function crYear(row: MOD_PUB_T | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[5]}</span>;
}
class PubTable extends TableCon<MOD_PUB_T, PubProps> {
    private readonly tooltip: [(eve: Events) => void, Events] | undefined;
    private readonly anc: string;
    private readonly cul: boolean;

    constructor(props: PubProps) {
        const { events, anc, cul } = props;
        super({ ...props, tableCl: `${ClHtml.tab}  ${ClHtml.hov}` });
        this.tooltip = undefined;
        if (events !== undefined) {
            const storeEv = (eve: Events) => {
                events.push(...eve);
            };
            this.tooltip = [storeEv, events];
        }
        this.anc = anc ?? 'empty_anc';
        this.cul = cul;
    }

    private crCul(row: MOD_PUB_T | undefined, ctx: InValStInt | undefined) {
        const { hookCul, hookInf } = this.props;
        if (
            row === undefined ||
            ctx === undefined ||
            this.tooltip === undefined ||
            hookCul === undefined ||
            hookInf === undefined
        ) {
            return null;
        }
        return formatCultureTT(this.anc, row[2], [hookCul, hookInf], ctx, this.tooltip);
    }

    protected override sort(index: number, sort: number): number[] {
        const { view } = this.state;
        const getV = (datPos: number): ELE_T => {
            return this.data[datPos]?.[index] ?? '';
        };
        switch (index) {
            case 4:
                view.sort((st1, st2) => strNumSort(sort, getV(st1), getV(st2)));
                break;
            default:
                view.sort((st1, st2) => defaultSort(sort, getV(st1), getV(st2)));
        }
        return view;
    }

    protected override search(filter: string, limit: number[]): number[] {
        const prepFilter = filter.toLocaleLowerCase();
        return limit.filter((ind: number) => {
            const val = this.data[ind];
            if (val === undefined) {
                return false;
            }
            const [, title, desC, aut, pub, year] = val;
            if (
                title.toLocaleLowerCase().includes(prepFilter) ||
                aut.toLocaleLowerCase().includes(prepFilter) ||
                year.toLocaleLowerCase().includes(prepFilter) ||
                pub.toLocaleLowerCase().includes(prepFilter)
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
                {this.body.map((val: MOD_PUB_T | undefined, index) => {
                    return (
                        <tr key={index}>
                            <th>{crTitle(val)}</th>
                            {this.cul ? <th>{this.crCul(val, ctx)}</th> : null}
                            <th>{crAuth(val)}</th>
                            <th>{crPub(val)}</th>
                            <th>{crYear(val)}</th>
                        </tr>
                    );
                })}
            </tbody>
        );
    }

    protected override renderWindow(): JSX.Element | null {
        return null;
    }

    protected override renderInput(): JSX.Element | null {
        return (
            <div className={`${Dis.dFlex} ${Align.js}`}>
                <SearchWr
                    val={this.searchState.next}
                    set={(sea: string) => {
                        this.searchAction(sea);
                    }}
                />
            </div>
        );
    }

    protected override filter(_val: unknown, limit: number[]): number[] {
        return limit;
    }
}

PubTable.contextType = MainConGl;

function prepareHeader(cul: boolean): [number, string, boolean][] {
    const head: [number, string, boolean][] = getPubTuple().map((val, index) => [
        index + 1,
        val,
        index !== 1,
    ]);
    if (!cul) {
        return head.filter((_val, index) => index !== 2);
    }
    return head;
}

class PubVD extends Component<TProps, object> {
    private events: Events;

    constructor(props: TProps) {
        super(props);
        this.events = [];
    }

    public render(): JSX.Element | null {
        this.events = [];
        const { res, detAnc, hookDep: hookCul, hookInf } = this.props;
        if (res.length === 0) {
            return null;
        }
        return (
            <div id={IdHtmlTour.passPub}>
                <h3 className={ClHtml.titSec}>
                    {TIT}
                    <span id={ID} />
                </h3>
                <div>
                    <PubTable
                        events={this.events}
                        res={res.map(
                            (val) => [...val.slice(0, 5), `${val[5]}`] as MOD_PUB_T
                        )}
                        anc={detAnc}
                        cul={true}
                        window={15}
                        head={prepareHeader(true)}
                        hookCul={hookCul}
                        hookInf={hookInf}
                    />
                </div>
            </div>
        );
    }
}

PubVD.contextType = MainConGl;

function PubSimVD({ res }: TMinProps): JSX.Element | null {
    if (res.length === 0) {
        return null;
    }
    return (
        <div>
            <PubTable
                res={res.map((val) => {
                    return [val[0], val[1], [], val[2], val[3], `${val[4]}`];
                })}
                cul={false}
                window={3}
                head={prepareHeader(false)}
            />
        </div>
    );
}

export default PubVD;
export { getAnchorP, PubSimVD };
