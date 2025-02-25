import { Component } from 'preact';
import type { JSX } from 'preact';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import LoadT from '@strinf/ts/constants/type/LoadT';
import { getArgs } from '@strinf/ts/functions/api/args';
import type { PassR } from '@strinf/ts/interfaces/api/maped';
import type {
    BreadCrumbsG,
    GlobVersionGet,
    LoadFS,
    LoadSet,
    LoadStMInt,
} from '@strinf/ts/interfaces/dom/global';
import PassCtrl from '@strinf/ts/mvc/ctrl/PassCtrl';
import PassCVD from '@strinf/ts/mvc/vdom/dyn/pass/PassCVD';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import PassSt from '@strinf/ts/mvc/vdom/state/PassSt';
import { trackSearch } from '@strinf/ts/mvc/vdom/fun/mat/track';
import HeadT from '@strinf/ts/constants/type/HeadT';
import OverviewVD from '@strinf/ts/mvc/vdom/dyn/pass/OverviewVD';
import { StatTags } from '@strinf/ts/constants/api/thes_api';
import { Helmet } from 'react-helmet';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import DetailCtrl from '@strinf/ts/mvc/ctrl/DetailCtrl';
import { getCurFullPath, routeUri } from '@strinf/ts/functions/http/http';
import Loading from '@strinf/ts/mvc/vdom/static/misc/LoadVD';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';

type CTX = GlobVersionGet & LoadSet & LoadStMInt & BreadCrumbsG;

interface PassProps {
    id?: string;
    path?: string;
}
interface PassState {
    tab?: PassR;
}

const REG_ARG = new RegExp(`[?&]{1}${IdAcrTagCon.depId}\\s*(\\d+)`, 'gi');
const H_DESC = (sid: number | undefined): string => `
StrainInfo passport depicting all information 
for the strain with the id ${IdAcrTagCon.strId} ${sid ?? 'unknown'}
`;

class PassVD extends Component<PassProps, PassState> {
    private readonly hooks: PassSt;

    private pCtrl?: PassCtrl;

    private dCtrl?: DetailCtrl;

    private load: LoadT;

    private time: number;

    private pageView: boolean;

    constructor(props: PassProps) {
        super(props);
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
                Date.now() - this.time
            );
        });
        this.time = Date.now();
        this.pageView = true;
    }

    public override componentWillUnmount(): void {
        this.hooks.load.map((ele: LoadFS) => {
            ele(LoadT.INI);
        });
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
        return !(tab?.allStrIds.includes(parseInt(nextProps.id, 10)) ?? false);
    }

    public render(): JSX.Element {
        const ctx: CTX | undefined = this.context;
        const { tab } = this.state;
        if (ctx !== undefined) {
            this.initCtrl(ctx);
        }
        if (this.load !== LoadT.FIN) {
            return <Loading />;
        }

        if (tab !== undefined) {
            ctx?.bread.map((actF) => {
                actF(HeadT.PASS);
            });
        }
        const sid = `${IdAcrTagCon.strId} ${String(tab?.overview[0] ?? 'unknown')}`;
        return (
            <>
                <Helmet>
                    <meta name="description" content={H_DESC(tab?.overview[0])} />
                    <title>StrainInfo - {sid}</title>
                    <link rel="canonical" href={getCurFullPath()} />
                </Helmet>
                <OverviewVD res={tab?.overview} dCtrl={this.dCtrl} rel={tab?.relations} />
                <div className={ClHtml.cntCon}>
                    <PassCVD res={tab} dCtrl={this.dCtrl} culId={getArgs(REG_ARG)} />
                </div>
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
        this.dCtrl?.setVersion(ctx.version);
        this.pCtrl?.setVersion(ctx.version);
        if (this.dCtrl === undefined) {
            this.dCtrl = new DetailCtrl(ctx.version);
        }
        if (this.pCtrl === undefined) {
            this.pCtrl = new PassCtrl(ctx.version);
            this.pCtrl.init(this.hooks, parseInt(id ?? '0', 10));
        } else {
            this.pCtrl.init(this.hooks, parseInt(id ?? '0', 10));
        }
    }

    private difSea(): boolean {
        const { id } = this.props;
        if (id === undefined) {
            return false;
        }
        if (parseInt(id, 10) < 1) {
            routeUri(UIApiCon.index, '');
            return false;
        }
        const { tab } = this.state;
        return !(tab?.allStrIds.includes(parseInt(id, 10)) ?? false);
    }

    private initCtrl(ctx: CTX): void {
        ctx.loadSet('PASS')((load: LoadT) => {
            this.load = load;
        });
        this.hooks.setLoad(() => ctx.load);
        if (this.difSea() && this.load !== LoadT.STA) {
            this.load = LoadT.INI;
            this.startPass(ctx);
        }
    }
}

PassVD.contextType = MainConGl;
PassVD.defaultProps = {
    path: '',
    id: '0',
};

export default PassVD;
