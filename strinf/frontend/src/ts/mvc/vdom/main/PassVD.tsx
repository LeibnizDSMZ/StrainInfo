import type { PassR } from '@strinf/ts/interfaces/api/mapped';
import type {
    BreadCrumbsG,
    GlobVersionGet,
    LoadSet,
    LoadStMInt,
} from '@strinf/ts/interfaces/dom/global';
import type { JSX } from 'preact';
import type { LocationHook } from 'preact-iso';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { StatTags } from '@strinf/ts/constants/api/thes_api';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import HeadT from '@strinf/ts/constants/type/HeadT';
import LoadT from '@strinf/ts/constants/type/LoadT';
import { getArgs } from '@strinf/ts/functions/api/args';
import { getCurFullPath, routeUri } from '@strinf/ts/functions/http/http';
import DetailCtrl from '@strinf/ts/mvc/ctrl/DetailCtrl';
import PassCtrl from '@strinf/ts/mvc/ctrl/PassCtrl';
import OverviewVD from '@strinf/ts/mvc/vdom/dyn/pass/OverviewVD';
import PassCVD from '@strinf/ts/mvc/vdom/dyn/pass/PassCVD';
import { trackSearch } from '@strinf/ts/mvc/vdom/fun/mat/track';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import PassSt from '@strinf/ts/mvc/vdom/state/PassSt';
import CanonH from '@strinf/ts/mvc/vdom/static/helmet/CanonH';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import Loading from '@strinf/ts/mvc/vdom/static/misc/LoadVD';
import { Component } from 'preact';

type CTX = GlobVersionGet & LoadSet & LoadStMInt & BreadCrumbsG;

interface PassProps {
    id?: string;
    path?: string;
    location: LocationHook;
}
interface PassState {
    tab?: PassR;
}

const REG_ARG = new RegExp(`[?&]{1}${IdAcrTagCon.depId}\\s*(\\d+)`, 'gi');

function buildStrainDesc(
    sid: number | undefined,
    tax: string | undefined,
    ccno: string[],
    type_strain: boolean,
): string {
    const lines: string[] = [
        'A strain passport from the microbial strain database StrainInfo,',
        'providing comprehensive information about the strain.',
    ];

    if (sid !== undefined) {
        lines.push(`Identifier: ${IdAcrTagCon.strId} ${sid}.`);
    }

    if (tax !== undefined) {
        lines.push(`Taxon name: ${tax}.`);
    }

    if (ccno.length > 0) {
        const displayed = ccno.slice(0, 3).join(', ');
        lines.push(`CCNo: ${displayed}.`);
    }
    if (type_strain) {
        lines.push(`This strain is also a TypeStrain.`);
    }
    return lines.join(' ').trim();
}

function createTitle(tab: PassR | undefined): string {
    const sid = `${IdAcrTagCon.strId} ${String(tab?.overview[0] ?? 'unknown')}`;
    const tax = tab?.overview[2][0] ?? 'StrainInfo';
    const title = `${tax} - ${sid}${tab?.overview[1] ? ' - TypeStrain' : ''}`;
    return title;
}

class PassVD extends Component<PassProps, PassState> {
    private readonly hooks: PassSt;

    private pCtrl?: PassCtrl;

    private dCtrl?: DetailCtrl;

    private load: LoadT;

    private time: number;

    private pageView: boolean;

    private readonly location: LocationHook;

    constructor(props: PassProps) {
        super(props);
        const { location } = props;
        this.location = location;
        this.hooks = new PassSt();
        this.load = LoadT.INI;
        this.state = {};
        this.hooks.tabSet((tab: PassR): void => {
            this.setState({ tab });
            trackSearch(
                StatTags.pass_str,
                `${tab.overview[0]}`,
                1,
                this.pView,
                Date.now() - this.time,
            );
        });
        this.time = Date.now();
        this.pageView = true;
    }

    public override componentWillUnmount(): void {
        for (const ele of this.hooks.load) {
            ele(LoadT.INI);
        }
        this.state.tab?.clear();
    }

    public override shouldComponentUpdate(
        ...args: [Readonly<PassProps>, Readonly<PassState>, unknown]
    ): boolean {
        const { tab } = this.state;
        const [nextProps] = args;
        if (tab === undefined && nextProps.id !== undefined) {
            return true;
        }
        if (nextProps.id === undefined) {
            return false;
        }
        return !(tab?.allStrIds.includes(Number.parseInt(nextProps.id, 10)) ?? false);
    }

    public render(): JSX.Element {
        const ctx: CTX | undefined = this.context;
        const { tab } = this.state;
        if (ctx !== undefined) {
            this.initCtrl(ctx, this.location);
        }
        if (this.load !== LoadT.FIN) {
            return <Loading />;
        }
        if (tab !== undefined) {
            for (const actF of ctx?.bread ?? []) {
                actF(HeadT.PASS);
            }
        }
        const title = createTitle(tab);
        return (
            <>
                <MetaH
                    desc={buildStrainDesc(
                        tab?.overview[0],
                        tab?.overview[2][0],
                        tab?.relations.map(val => val[1]) ?? [],
                        tab?.overview[1] ?? false,
                    )}
                    title={title}
                />
                <CanonH href={getCurFullPath()} />
                <OverviewVD res={tab?.overview} dCtrl={this.dCtrl} rel={tab?.relations} />
                <PassCVD res={tab} dCtrl={this.dCtrl} culId={getArgs(REG_ARG)} />
            </>
        );
    }

    private get pView(): boolean {
        const pvB = this.pageView;
        this.pageView = false;
        return pvB;
    }

    private startPass(ctx: LoadStMInt & GlobVersionGet): void {
        this.time = Date.now();
        const { id } = this.props;
        this.dCtrl ??= new DetailCtrl(ctx.version);
        this.dCtrl.setVersion(ctx.version);
        this.pCtrl ??= new PassCtrl(ctx.version);
        this.pCtrl.init(this.hooks, Number.parseInt(id ?? '0', 10));
        this.pCtrl.setVersion(ctx.version);
    }

    private difSea(location: LocationHook): boolean {
        const { id } = this.props;
        if (id === undefined) {
            return false;
        }
        if (Number.parseInt(id, 10) < 1) {
            routeUri(UIApiCon.index, '', location);
            return false;
        }
        const { tab } = this.state;
        return !(tab?.allStrIds.includes(Number.parseInt(id, 10)) ?? false);
    }

    private initCtrl(ctx: CTX, location: LocationHook): void {
        ctx.loadSet('PASS')((load: LoadT) => {
            this.load = load;
        });
        this.hooks.setLoad(() => ctx.load);
        if (this.difSea(location) && this.load !== LoadT.STA) {
            this.load = LoadT.INI;
            this.startPass(ctx);
        }
    }
}

PassVD.contextType = MainConGl;
PassVD.defaultProps = {
    id: '0',
};

export default PassVD;
