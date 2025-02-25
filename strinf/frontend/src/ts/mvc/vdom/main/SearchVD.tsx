import type { JSX } from 'preact';
import { Component } from 'preact';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import UIArgCon from '@strinf/ts/constants/api/ui_arg';
import LoadT from '@strinf/ts/constants/type/LoadT';
import { getArgs } from '@strinf/ts/functions/api/args';
import callPass from '@strinf/ts/functions/http/pass';
import type { SeaR } from '@strinf/ts/interfaces/api/maped';
import type {
    LoadStMInt,
    LoadSet,
    LoadFS,
    BreadCrumbsG,
    TTHookG,
    GlobVersionGet,
} from '@strinf/ts/interfaces/dom/global';
import SeaCtrl from '@strinf/ts/mvc/ctrl/SeaCtrl';
import ProgVD from '@strinf/ts/mvc/vdom/dyn/misc/ProgVD';
import SeaTVD from '@strinf/ts/mvc/vdom/dyn/search/SeaTVD';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import SeaSt from '@strinf/ts/mvc/vdom/state/SeaSt';
import { getApiToStr } from '@strinf/ts/functions/api/map';
import { trackSearch } from '@strinf/ts/mvc/vdom/fun/mat/track';
import HeadT from '@strinf/ts/constants/type/HeadT';
import { ClHtml, Pad } from '@strinf/ts/constants/style/ClHtml';
import { Helmet } from 'react-helmet';
import QApiCon from '@strinf/ts/constants/api/q_api';
import { checkSeaTags } from '@strinf/ts/functions/links/create_sea';
import HubSeaVD from '@strinf/ts/mvc/vdom/static/HubSeaVD';
import type { TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import Loading from '@strinf/ts/mvc/vdom/static/misc/LoadVD';

type CTX = GlobVersionGet & LoadSet & LoadStMInt & BreadCrumbsG & TTHookG<TT_GL_TYPE>;
interface SearchState {
    tab: SeaR[];
    toPassStr: string;
    toPassCul: string;
    stage: LoadT;
}

const REG_PASS = new RegExp(`[?&]{1}${UIArgCon.pass}(.+?)(?:&.*$|$)`, 'gi');
const REG_SEA = new RegExp(`[?&]{1}${UIArgCon.search}(.+?)(?:&.*$|$)`, 'gi');
const REG_SEA_API = new RegExp(`[?&]{1}${UIArgCon.qApi}(.+?)(?:&.*$|$)`, 'gi');
const H_DESC = (sTerm: string, sApi: string): string => `
StrainInfo results for the search term ${sTerm}.
${getApiToStr(sApi)} was/were used as search queries.
`;

class SearchVD<T> extends Component<T, SearchState> {
    private time: number;

    private load: LoadT;

    private ctrl?: SeaCtrl;

    private sea: [string, string];

    constructor(props: T) {
        super(props);
        this.hooks = new SeaSt();
        this.load = LoadT.INI;
        this.state = { tab: [], toPassStr: '', toPassCul: '', stage: LoadT.INI };
        this.hooks.tabSet((tab: SeaR[]): void => {
            const { state } = this;
            this.setState({ ...state, tab });
            this.track(tab.length, this.pView);
        });
        this.hooks.toPassSet((str: string, cul: string): void => {
            const { state } = this;
            this.setState({ ...state, toPassStr: str, toPassCul: cul });
            this.track(1, false);
        });
        this.sea = ['', ''];
        this.time = Date.now();
        this.pageView = true;
    }

    private readonly hooks: SeaSt;

    private pageView: boolean;

    private initCtrl(ctx: CTX, newSea: [string, string]): void {
        ctx.bread.map((actF) => {
            if (newSea[1] === QApiCon.seaStrAll) {
                actF(HeadT.STRDB);
            } else {
                actF(HeadT.SEARCH);
            }
        });
        ctx.loadSet('SEARCH')((load: LoadT) => {
            this.load = load;
            const { state } = this;
            this.setState({ ...state, stage: this.load });
        });
        this.hooks.setLoad(() => ctx.load);
        if (this.difSea(newSea)) {
            this.sea = newSea;
            this.load = LoadT.INI;
            this.startSea(ctx);
        }
    }

    private get pView(): boolean {
        const pvB = this.pageView;
        this.pageView = false;
        return pvB;
    }

    private static parseArgs(): [string, string] {
        let reqVal = getArgs(REG_PASS);
        if (reqVal !== '') {
            return [reqVal, QApiCon.seaStrCulId];
        }
        reqVal = getArgs(REG_SEA);
        let reqApi = getArgs(REG_SEA_API);
        if (reqApi === '') {
            try {
                reqApi = checkSeaTags(reqVal).qApi;
            } catch {
                reqApi = QApiCon.seaStrAll;
            }
        }
        return [reqVal, reqApi];
    }

    public override shouldComponentUpdate(
        ...args: [Readonly<T>, Readonly<SearchState>, unknown]
    ): boolean {
        const { toPassStr, toPassCul } = this.state;
        const [, nextContext] = args;
        if (
            (toPassStr !== nextContext.toPassStr ||
                toPassCul !== nextContext.toPassCul) &&
            nextContext.toPassStr !== ''
        ) {
            callPass(nextContext.toPassStr, nextContext.toPassCul, UIApiCon.index);
            return false;
        }
        return true;
    }

    public override componentWillUnmount(): void {
        this.hooks.load.map((ele: LoadFS) => {
            ele(LoadT.INI);
        });
        this.state.tab.splice(0, this.state.tab.length);
    }
    public render(): JSX.Element | null {
        const ctx: CTX | undefined = this.context;
        const ttHook = ctx?.getTTHook(TT_ID_SIM);
        const { tab } = this.state;
        if (ctx !== undefined) {
            this.initCtrl(ctx, SearchVD.parseArgs());
        }
        if (this.load !== LoadT.FIN) {
            return (
                <>
                    <ProgVD progSet={this.hooks.progSet} />
                    <Loading />
                </>
            );
        }
        if (ttHook == undefined) {
            return null;
        }
        const [sTerm, sApi] = this.sea;
        return (
            <>
                <Helmet>
                    <meta name="description" content={H_DESC(sTerm, sApi)} />
                    <meta name="robots" content="noindex" />
                    <title>StrainInfo - Search</title>
                </Helmet>
                <div className={`${ClHtml.cntCon} ${Pad.bN0}`}>
                    <SeaTVD res={tab} sea={this.sea} hook={ttHook} />
                    <HubSeaVD />
                </div>
            </>
        );
    }

    private startSea(ctx: LoadStMInt & GlobVersionGet): void {
        this.time = Date.now();
        this.ctrl?.setVersion(ctx.version);
        if (this.ctrl === undefined) {
            this.ctrl = new SeaCtrl(ctx.version);
            this.ctrl.init(this.hooks, ...this.sea);
        } else {
            this.ctrl.init(this.hooks, ...this.sea);
        }
    }

    private track(res: number, page_view: boolean): void {
        trackSearch(
            getApiToStr(this.sea[1]),
            decodeURIComponent(this.sea[0]),
            res,
            page_view,
            Date.now() - this.time
        );
    }

    private difSea(newSea: [string, string]): boolean {
        return newSea[0] !== this.sea[0] || newSea[1] !== this.sea[1];
    }
}

SearchVD.contextType = MainConGl;
SearchVD.defaultProps = {
    path: '',
};

export default SearchVD;
