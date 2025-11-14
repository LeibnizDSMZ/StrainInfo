import type { SeaR } from '@strinf/ts/interfaces/api/mapped';
import type {
    BreadCrumbsG,
    GlobVersionGet,
    LoadSet,
    LoadStMInt,
    TTHookG,
} from '@strinf/ts/interfaces/dom/global';
import type { TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type { JSX } from 'preact';
import type { LocationHook } from 'preact-iso';
import QApiCon from '@strinf/ts/constants/api/q_api';
import { getSeaApiFPath } from '@strinf/ts/constants/api/thes_api';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import UIArgCon from '@strinf/ts/constants/api/ui_arg';
import HeadT from '@strinf/ts/constants/type/HeadT';
import LoadT from '@strinf/ts/constants/type/LoadT';
import { getArgs } from '@strinf/ts/functions/api/args';
import { getApiToStr } from '@strinf/ts/functions/api/map';
import callPass from '@strinf/ts/functions/http/pass';
import { checkSeaTags } from '@strinf/ts/functions/links/create_sea';
import SeaCtrl from '@strinf/ts/mvc/ctrl/SeaCtrl';
import ProgVD from '@strinf/ts/mvc/vdom/dyn/misc/ProgVD';
import SeaTVD from '@strinf/ts/mvc/vdom/dyn/search/SeaTVD';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import { trackSearch } from '@strinf/ts/mvc/vdom/fun/mat/track';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import SeaSt from '@strinf/ts/mvc/vdom/state/SeaSt';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import HubSeaVD from '@strinf/ts/mvc/vdom/static/HubSeaVD';
import Loading from '@strinf/ts/mvc/vdom/static/misc/LoadVD';
import { Component } from 'preact';

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
function H_DESC(sTerm: string, sApi: string): string {
    return `
StrainInfo results for the search term ${sTerm}.
${getApiToStr(sApi)} was/were used as search queries.
`;
}
interface SEA_PROP {
    location: LocationHook;
    val: string | undefined;
    typ: string | undefined;
}

class SearchVD<T extends SEA_PROP> extends Component<T, SearchState> {
    private time: number;

    private load: LoadT;

    private ctrl?: SeaCtrl;

    private sea: [string, string];

    private readonly location: LocationHook;

    constructor(props: T) {
        super(props);
        const { location } = props;
        this.location = location;
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
        for (const actF of ctx.bread) {
            if (newSea[1] === QApiCon.seaStrAll) {
                actF(HeadT.STRDB);
            }
            else {
                actF(HeadT.SEARCH);
            }
        }
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

    private static parseArgs(val?: string, typ?: string): [string, string] {
        let reqVal = getArgs(REG_PASS);
        const api_p = getSeaApiFPath(typ ?? '');
        if (val !== undefined && val !== '' && api_p !== '') {
            return [val, api_p];
        }
        if (reqVal !== '') {
            return [reqVal, QApiCon.seaStrCulId];
        }
        reqVal = getArgs(REG_SEA);
        let reqApi = getArgs(REG_SEA_API);
        if (reqApi === '') {
            try {
                reqApi = checkSeaTags(reqVal).qApi;
            }
            catch {
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
            (toPassStr !== nextContext.toPassStr
                || toPassCul !== nextContext.toPassCul)
            && nextContext.toPassStr !== ''
        ) {
            callPass(
                nextContext.toPassStr,
                nextContext.toPassCul,
                UIApiCon.index,
                this.location,
            );
            return false;
        }
        return true;
    }

    public override componentWillUnmount(): void {
        for (const ele of this.hooks.load) {
            ele(LoadT.INI);
        }
        this.state.tab.splice(0, this.state.tab.length);
    }

    public render(): JSX.Element | null {
        const ctx: CTX | undefined = this.context;
        const ttHook = ctx?.getTTHook(TT_ID_SIM);
        const { tab } = this.state;
        const { val, typ } = this.props;
        if (ctx !== undefined) {
            this.initCtrl(ctx, SearchVD.parseArgs(val, typ));
        }
        if (this.load !== LoadT.FIN) {
            return (
                <>
                    <ProgVD progSet={this.hooks.progSet} />
                    <Loading />
                </>
            );
        }
        if (ttHook === undefined) {
            return null;
        }
        const [sTerm, sApi] = this.sea;
        return (
            <>
                <MetaH
                    title="StrainInfo - Search"
                    desc={H_DESC(sTerm, sApi)}
                    index={false}
                />
                <SeaTVD res={tab} sea={this.sea} hook={ttHook} />
                <HubSeaVD />
            </>
        );
    }

    private startSea(ctx: LoadStMInt & GlobVersionGet): void {
        this.time = Date.now();
        this.ctrl?.setVersion(ctx.version);
        this.ctrl ??= new SeaCtrl(ctx.version);
        this.ctrl.init(this.hooks, ...this.sea);
    }

    private track(res: number, page_view: boolean): void {
        trackSearch(
            getApiToStr(this.sea[1]),
            decodeURIComponent(this.sea[0]),
            res,
            page_view,
            Date.now() - this.time,
        );
    }

    private difSea(newSea: [string, string]): boolean {
        return newSea[0] !== this.sea[0] || newSea[1] !== this.sea[1];
    }
}

SearchVD.contextType = MainConGl;

export default SearchVD;
