import {
    Align,
    ClHtml,
    Dis,
    Font,
    Hei,
    Mar,
    Pad,
    Wid,
} from '@strinf/ts/constants/style/ClHtml';
import { Component } from 'preact';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import onPrError from '@strinf/ts/functions/err/async';
import type { JSX } from 'preact';
import { isSlimScreen } from '@strinf/ts/functions/misc/screen';

interface TableProps<T> {
    res: T[];
    head: [number, string, boolean][];
    window: number;
    tableCl?: string;
}

interface TableState {
    page: number;
    view: number[];
    window: number;
}

interface PageProps {
    sel: number;
    cnt: number;
    page: (sel: number) => void;
}

function getPagArray(sel: number, cnt: number): (number | string)[] {
    const pagination: number[] = [...Array(5).keys()]
        .map((val) => sel + val - 2)
        .filter((val: number) => {
            if (val <= 1 || val >= cnt) {
                return false;
            }
            const dif = val - sel;
            if ((dif >= -1 && dif <= 1) || sel === 1 || sel === cnt) {
                return true;
            }
            return false;
        });
    pagination.splice(0, 0, 1);
    pagination.push(cnt);
    return pagination
        .map((val, index, array) => {
            const nVa = array[index + 1] ?? cnt + 1;
            if (val + 1 !== nVa) {
                return [val, '...'];
            }
            return val;
        })
        .flat();
}

function Pagination({ sel, cnt, page }: PageProps): JSX.Element | null {
    if (sel > cnt || cnt < 2) {
        return null;
    }
    const first = sel === 1 ? ClHtml.dis : '';
    const last = sel === cnt ? ClHtml.dis : '';
    return (
        <div className={ClHtml.pag} style={{ 'user-select': 'none' }}>
            <button
                type="button"
                tabIndex={0}
                aria-label="Previous"
                key="prev"
                onClick={() => {
                    if (sel > 1) {
                        page(sel - 1);
                    }
                }}
                className={`${ClHtml.pBtn} ${first}`}
            >
                &lt;
            </button>
            {getPagArray(sel, cnt).map((val, index) => (
                <button
                    type="button"
                    tabIndex={0}
                    key={index}
                    aria-label={`Pagination: ${index}`}
                    onClick={() => {
                        if (typeof val === 'number') {
                            page(val);
                        }
                    }}
                    className={sel === val ? ClHtml.act : ''}
                >
                    {val}
                </button>
            ))}
            <button
                type="button"
                tabIndex={0}
                aria-label="Next"
                key="next"
                onClick={() => {
                    if (sel < cnt) {
                        page(sel + 1);
                    }
                }}
                className={`${ClHtml.pBtn} ${last}`}
            >
                &gt;
            </button>
        </div>
    );
}

const SEARCH_TABLE_IN_CL = 'strinf-table-search-input';

function SearchWr({
    val,
    set,
}: {
    val: string;
    set: (val: string) => void;
}): JSX.Element {
    return (
        <div className={`${ClHtml.ig} ${Wid.N250} ${SEARCH_TABLE_IN_CL}`}>
            <input
                value={val}
                type="text"
                name="search"
                className={ClHtml.formCtrl}
                autoComplete="off"
                placeholder="search in table"
                onInput={(eve) => {
                    set(eve.currentTarget.value);
                }}
            />
        </div>
    );
}

interface SearchState {
    previous: string;
    next: string;
}

interface FilterState {
    previous: [string | boolean | number, number][];
    next: [string | boolean | number, number][];
}

const LIMIT = 20000;

function packageView(view: number[]): number[][] {
    const pkg: number[][] = [];
    let runPkg: number[] = [];
    let runInd = 0;
    for (const ind of view) {
        if (runInd >= LIMIT) {
            pkg.push(runPkg);
            runPkg = [];
            runInd = 0;
        }
        runPkg.push(ind);
        runInd++;
    }
    if (runInd > 0) {
        pkg.push(runPkg);
    }
    return pkg;
}

abstract class TableCon<T, E extends TableProps<T>> extends Component<E, TableState> {
    protected data: T[];
    protected head: [number, string, boolean][];
    protected sortSt: (-1 | 0 | 1)[];
    protected searchState: SearchState;
    protected filterState: FilterState;
    private ready: boolean;
    private filterBuffer: number[];
    private readonly tableCl: string;

    constructor(props: E) {
        super(props);
        const { res, window, head, tableCl } = props;
        this.data = res;
        this.head = head;
        this.sortSt = head.map(() => 0);
        this.state = { page: 1, view: [...res.keys()], window: window > 1 ? window : 1 };
        this.ready = true;
        this.searchState = { previous: '', next: '' };
        this.filterState = { previous: [], next: [] };
        this.filterBuffer = [];
        this.tableCl = `${ClHtml.tab} ${ClHtml.sm} ${ClHtml.hov}`;
        if (tableCl !== undefined && tableCl != '') {
            this.tableCl = tableCl;
        }
    }

    private updateObjState(): void {
        const { res, head } = this.props;
        const baseChanged =
            this.data.length !== res.length || this.head.length !== head.length;
        this.data = res;
        this.head = head;
        const filterChanged = this.toSearch() || this.toFilter();
        switch (true) {
            case baseChanged:
                this.searchState = { previous: '', next: '' };
                this.setState({ page: 1, view: [...this.data.keys()] });
                break;
            case filterChanged:
                this.runFilter();
                break;
            default:
                this.ready = true;
        }
    }

    private resetSort(): void {
        this.sortSt = this.sortSt.map(() => 0);
    }

    private runSort(index: number): void {
        const sortV = this.sortSt[index] ?? 0;
        let toSort = 0;
        this.resetSort();
        switch (sortV) {
            case 1:
                this.sortSt[index] = -1;
                toSort = -1;
                break;
            case -1:
                this.sortSt[index] = 1;
                toSort = 1;
                break;
            default:
                this.sortSt[index] = 1;
                toSort = 1;
        }
        const [mapIndex] = this.head[index] ?? [index];
        this.setState({ page: 1, view: this.sort(mapIndex, toSort) });
    }

    private toSearch(): boolean {
        return this.searchState.previous !== this.searchState.next;
    }

    private toFilter(): boolean {
        const toFil = this.filterState.previous.length !== this.filterState.next.length;
        let ind = 0;
        for (const [filV, filI] of this.filterState.previous) {
            const valC = this.filterState.next[ind];
            if (valC === undefined) {
                return true;
            }
            const [filVc, filIc] = valC;
            if (filVc !== filV || filI !== filIc) {
                return true;
            }
            ind++;
        }
        return toFil;
    }

    private runSearch(limit: number[], filtered: boolean): void {
        this.filterBuffer = limit;
        const toSea = (this.toSearch() || filtered) && this.searchState.next !== '';
        this.searchState.previous = this.searchState.next;
        const indPkg = packageView(limit);
        if (toSea) {
            const resS: Promise<number[]>[] = [];
            for (const view of indPkg) {
                resS.push(
                    new Promise((resolve) =>
                        setTimeout(() => {
                            resolve(this.search(this.searchState.next, view));
                        }, 10)
                    )
                );
            }
            Promise.all(resS)
                .then((res) => {
                    this.setState({ page: 1, view: res.flat() });
                })
                .catch((err: unknown) => {
                    onPrError(err);
                });
        } else {
            this.setState({ page: 1, view: limit });
        }
    }

    private runFilter(): void {
        this.resetSort();
        const toFil = this.toFilter() && this.filterState.next.length !== 0;
        const toEmpty =
            this.filterBuffer.length === 0 || this.filterState.next.length === 0 || toFil;
        this.filterState.previous = this.filterState.next;
        let limit = toEmpty ? [...this.data.keys()] : this.filterBuffer;
        if (toFil) {
            const indPkg = packageView(limit);
            const resF: Promise<number[]>[] = [];
            for (const view of indPkg) {
                resF.push(
                    new Promise((resolve) =>
                        setTimeout(() => {
                            resolve(this.filter(this.filterState.next, view));
                        }, 10)
                    )
                );
            }
            Promise.all(resF)
                .then((res) => {
                    this.runSearch(res.flat(), true);
                })
                .catch((err: unknown) => {
                    onPrError(err);
                });
        } else {
            this.runSearch(
                limit,
                this.searchState.previous !== '' &&
                    this.filterState.next.length === 0 &&
                    this.filterState.previous.length !== 0
            );
        }
    }

    private paginationAction(selection: number): void {
        if (this.ready) {
            this.ready = false;
            this.setState({ page: selection });
        }
    }

    private sortAction(index: number): void {
        if (this.ready) {
            this.ready = false;
            this.runSort(index);
        }
    }

    protected searchAction(search: string): void {
        this.searchState.next = search;
        if (this.ready) {
            this.ready = false;
            this.runFilter();
        }
    }

    protected filterAction(filter: [string | boolean | number, number][]): void {
        this.filterState.next = filter;
        if (this.ready) {
            this.ready = false;
            this.runFilter();
        }
    }

    protected get body(): (T | undefined)[] {
        const { page, view, window } = this.state;
        const start = (page - 1) * window;
        return view.slice(start, start + window).map((index) => this.data[index]);
    }

    protected createSortElement(index: number, sort: boolean): JSX.Element | null {
        if (!sort) {
            return null;
        }
        const sortV = this.sortSt[index] ?? 0;
        let sortB = <></>;
        switch (sortV) {
            case 1:
                sortB = <i className={ClHtmlI.caretUB}></i>;
                break;
            case -1:
                sortB = <i className={ClHtmlI.caretDB}></i>;
                break;
            default:
                sortB = <i className={ClHtmlI.caretNB}></i>;
        }
        return (
            <span
                className={Pad.lN10}
                onClick={() => {
                    this.sortAction(index);
                }}
            >
                {sortB}
            </span>
        );
    }

    private printEmpty(): JSX.Element | null {
        const { view } = this.state;
        if (view.length === 0) {
            return (
                <tbody>
                    <tr>
                        <th>No results found</th>
                    </tr>
                </tbody>
            );
        }
        return null;
    }

    public render(): JSX.Element | null {
        this.updateObjState();
        return this.renderContainer();
    }

    protected renderInput(): JSX.Element | null {
        return (
            <SearchWr
                val={this.searchState.next}
                set={(sea: string) => {
                    this.searchAction(sea);
                }}
            />
        );
    }

    protected renderPagination(): JSX.Element | null {
        const { page, view, window } = this.state;
        return (
            <Pagination
                sel={page}
                cnt={Math.ceil(view.length / window)}
                page={(sel: number) => {
                    this.paginationAction(sel);
                }}
            />
        );
    }

    protected renderTableHead(): JSX.Element {
        return (
            <thead>
                <tr>
                    {this.head.map((val, index) => (
                        <th key={index}>
                            {val[1]}
                            {this.createSortElement(index, val[2])}
                        </th>
                    ))}
                </tr>
            </thead>
        );
    }

    protected renderWindow(): JSX.Element | null {
        const { window } = this.state;
        let wind = [50, 100, 200];
        if (!wind.includes(window)) {
            wind.push(window);
        }
        wind = wind.sort((fir, sec) => fir - sec).filter((val) => val < this.data.length);
        if (wind.length < 2) {
            return null;
        }
        return (
            <div className={`${Align.fr} ${Align.je} ${Align.ac} ${Dis.dFlex}`}>
                <div>Per page</div>
                <select
                    className={`${ClHtml.formCtrl} ${Mar.lN10} ${Hei.N25}`}
                    style={{ width: '8rem' }}
                    name="Per page"
                    onChange={(val) => {
                        let limit = this.data.length;
                        if (val.currentTarget.value !== 'Show all') {
                            limit = parseInt(val.currentTarget.value);
                        }
                        this.setState({
                            page: 1,
                            window: limit,
                        });
                    }}
                >
                    {wind.map((val, ind) => {
                        let attr = {};
                        if (val === window) {
                            attr = { selected: true, disabled: true };
                        }
                        return (
                            <option key={`perpage${ind}`} value={`${val}`} {...attr}>
                                {val}
                            </option>
                        );
                    })}
                </select>
            </div>
        );
    }

    protected renderTable(): JSX.Element {
        return (
            <div
                className={Wid.f}
                style={{
                    'overflow-x': 'auto',
                    'overflow-y': 'hidden',
                }}
            >
                <table
                    className={this.tableCl}
                    style={{
                        'min-width': 800,
                    }}
                >
                    {this.renderTableHead()}
                    {this.printEmpty()}
                    {this.renderTableBody()}
                </table>
            </div>
        );
    }

    protected renderContainer(): JSX.Element {
        const claB = `${Mar.tN15} ${Dis.dFlex} ${Align.js} ${Align.jb}`;
        const claT = `${Mar.bN10} ${Dis.dFlex} ${Align.js} ${Align.jb}`;
        const claE = `${Mar.bN10} ${Font.N12}`;
        return (
            <div className={`${ClHtml.cnt} ${Mar.lN0} ${Mar.rN0}`}>
                <div className={claE}>{this.renderWindow()}</div>
                <div className={claT}>
                    {this.renderFilter()}
                    {this.renderInput()}
                </div>
                {this.renderTable()}
                <div className={claB}>
                    {this.renderInfo()}
                    {this.renderPagination()}
                </div>
            </div>
        );
    }

    protected renderInfo(): JSX.Element | null {
        const { view, page, window } = this.state;
        if (isSlimScreen()) {
            return null;
        }
        if (view.length <= window) {
            return <div className={Pad.lN10}>Showing {view.length}</div>;
        }
        const start = (page - 1) * window + 1;
        let end = start + window - 1;
        if (end > view.length) {
            end = view.length;
        }
        return (
            <div className={Pad.lN10}>
                Showing {start} to {end} of {view.length}
            </div>
        );
    }
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    protected renderFilter(): JSX.Element | null {
        return null;
    }

    protected abstract renderTableBody(): JSX.Element;

    protected abstract sort(index: number, sort: number): number[];

    protected abstract filter(
        value: [string | number | boolean, number][],
        limit: number[]
    ): number[];

    protected abstract search(value: string, limit: number[]): number[];
}

export default TableCon;
export type { TableProps };
export { SearchWr, SEARCH_TABLE_IN_CL };
