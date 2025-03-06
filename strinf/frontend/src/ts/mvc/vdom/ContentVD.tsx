import { Router, Route, lazy, useLocation } from 'preact-iso';
import { useContext } from 'preact/hooks';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import { trackPageV } from '@strinf/ts/mvc/vdom/fun/mat/track';
import defaultRouteBeh from '@strinf/ts/mvc/vdom/fun/route/default';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import Redirect from '@strinf/ts/mvc/vdom/fun/route/Redirect';
import type { JSX } from 'preact';

const INDEX_VD = lazy(async () => import('@strinf/ts/mvc/vdom/main/IndexVD'));
const CONTACT_VD = lazy(async () => import('@strinf/ts/mvc/vdom/static/ContactVD'));
const DOCS_VD = lazy(async () => import('@strinf/ts/mvc/vdom/static/DocsVD'));
const ERROR_VD = lazy(async () => import('@strinf/ts/mvc/vdom/ErrorVD'));
const PANIC_VD = lazy(async () => import('@strinf/ts/mvc/vdom/PanicVD'));
const SEA_VD = lazy(async () => import('@strinf/ts/mvc/vdom/main/SearchVD'));
const PASS_VD = lazy(async () => import('@strinf/ts/mvc/vdom/main/PassVD'));
const ABOUT_PVD = lazy(async () => import('@strinf/ts/mvc/vdom/static/AboutMainVD'));
const TEAM_VD = lazy(async () => import('@strinf/ts/mvc/vdom/static/TeamVD'));
const STR_REG_VD = lazy(
    async () => import('@strinf/ts/mvc/vdom/static/StrainRegistryVD')
);
const NEWS_VD = lazy(async () => import('@strinf/ts/mvc/vdom/static/NewsVD'));
const IMP_VD = lazy(async () => import('@strinf/ts/mvc/vdom/static/ImprintVD'));
const EMPTY_VD = lazy(async () => import('@strinf/ts/mvc/vdom/EmptyVD'));
const API_VD = lazy(async () => import('@strinf/ts/mvc/vdom/static/ApiVd'));

const PATH_STRAIN = `${UIApiCon.strain}:id`;

function onRouteChange(path: string): void {
    defaultRouteBeh();
    if (
        ![
            PATH_STRAIN,
            UIApiCon.pass.toString(),
            UIApiCon.search.toString(),
            UIApiCon.error.toString(),
        ].includes(path)
    ) {
        trackPageV();
    }
}

function ContentVD({ panic }: { panic: boolean }): JSX.Element | null {
    const ctx: BreadCrumbsG | undefined = useContext(MainConGl);
    const location = useLocation();
    if (ctx === undefined) {
        return null;
    }
    if (panic) {
        return <PANIC_VD />;
    }
    return (
        <Router
            onRouteChange={(path) => {
                onRouteChange(path);
            }}
        >
            <Route path={UIApiCon.error} component={ERROR_VD} />
            <Route path={UIApiCon.index} component={INDEX_VD} />
            <Route path={UIApiCon.indexFull} to={UIApiCon.index} component={Redirect} />
            <Route path={UIApiCon.search} component={SEA_VD} location={location} />
            <Route path={UIApiCon.pass} component={SEA_VD} location={location} />
            <Route path={PATH_STRAIN} component={PASS_VD} location={location} />
            <Route path={UIApiCon.about} component={ABOUT_PVD} />
            <Route path={UIApiCon.contact} component={CONTACT_VD} />
            <Route path={UIApiCon.team} component={TEAM_VD} />
            <Route path={UIApiCon.strReg} component={STR_REG_VD} />
            <Route path={UIApiCon.news} component={NEWS_VD} />
            <Route path={UIApiCon.manual} component={DOCS_VD} />
            <Route path={UIApiCon.imprint} component={IMP_VD} />
            <Route path={UIApiCon.service} component={API_VD} />
            <Route path="/:path*" component={EMPTY_VD} />
        </Router>
    );
}

export default ContentVD;
