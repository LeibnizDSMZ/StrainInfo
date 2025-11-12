import type { ArcT } from '@strinf/ts/interfaces/api/mapped';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { TableProps } from '@strinf/ts/mvc/vdom/dyn/table/Table';
import type { JSX } from 'preact';
import PassAncId from '@strinf/ts/constants/page/pass';
import { Align, ClHtml, Dis, Font } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import { getArcTuple } from '@strinf/ts/functions/api/map';
import { defaultSort, sortDate } from '@strinf/ts/functions/arr/sort';
import { createDate } from '@strinf/ts/functions/parse/date';
import DoiDownloadGrid from '@strinf/ts/mvc/vdom/dyn/pass/link/DoiDownloadGrid';
import TableCon, { SearchWr } from '@strinf/ts/mvc/vdom/dyn/table/Table';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { memo } from 'preact/compat';

interface ResProps {
    res: ArcT[];
}

const TIT = 'Archive';
const ID = PassAncId.arc;

function getAnchorA(ord: number, rel: ArcT[]): AncT {
    if (rel.length > 0) {
        return { [ord]: [ID, TIT] };
    }
    return {};
}

function crDoi(row: ArcT | undefined) {
    if (row === undefined) {
        return null;
    }
    return (
        <span className={Font.norm}>
            <span id={ID} />
            <DoiDownloadGrid doi={row[0]} />
        </span>
    );
}

function crTitle(row: ArcT | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[1]}</span>;
}

function crDate(row: ArcT | undefined): JSX.Element | null {
    if (row === undefined) {
        return null;
    }
    return <span className={Font.norm}>{row[2]}</span>;
}

class ArcTable extends TableCon<ArcT, TableProps<ArcT>> {
    protected override sort(index: number, sort: number): number[] {
        const { view } = this.state;
        const getV = (datPos: number): string => {
            return this.data[datPos]?.[index] ?? '';
        };
        const sDate = (fir: number, sec: number): number =>
            sortDate(sort, getV(fir), getV(sec));
        const sDef = (fir: number, sec: number): number =>
            defaultSort<string>(sort, getV(fir), getV(sec));
        switch (index) {
            case 2:
                view.sort(sDate);
                break;
            default:
                view.sort(sDef);
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
            const [doi, title, date] = val;
            if (
                doi.toLocaleLowerCase().includes(prepFilter) ||
                date.toLocaleLowerCase().includes(prepFilter) ||
                title.toLocaleLowerCase().includes(prepFilter)
            ) {
                return true;
            }
            return false;
        });
    }

    protected override renderTableBody(): JSX.Element {
        return (
            <tbody>
                {this.body.map((val: ArcT | undefined, index) => {
                    return (
                        <tr key={index}>
                            <th>{crDoi(val)}</th>
                            <th>{crTitle(val)}</th>
                            <th>{crDate(val)}</th>
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

ArcTable.contextType = MainConGl;

function modDate(arc: [string, string, string][]): [string, string, string][] {
    return arc.map(([doi, tit, dat]) => [doi, tit, createDate(dat)]);
}

function ArcVD({ res }: ResProps): JSX.Element | null {
    if (res.length === 0) {
        return null;
    }

    return (
        <div id={IdHtmlTour.passArc}>
            <h3 className={ClHtml.titSec}>
                {TIT}
                <span id={ID} />
            </h3>
            <section>
                <ArcTable
                    res={modDate(res)}
                    window={15}
                    head={getArcTuple().map((val, index) => [index, val, true])}
                    tableCl={`${ClHtml.tab}  ${ClHtml.hov}`}
                />
            </section>
        </div>
    );
}

export default memo(ArcVD);
export { getAnchorA };
