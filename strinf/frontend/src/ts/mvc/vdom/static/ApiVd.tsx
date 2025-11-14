import type { ServerStatusJT } from '@strinf/ts/interfaces/api/data';
import type { BreadCrumbsG, CookieS } from '@strinf/ts/interfaces/dom/global';
import type AncT from '@strinf/ts/interfaces/misc/anchor';

import type { ConfLinkT } from '@strinf/ts/interfaces/misc/configs';
import type { JSX } from 'preact';

import type { Dispatch, StateUpdater } from 'preact/hooks';

import drSty from '@strinf/css/mods/dropdown.module.css';
import linkSty from '@strinf/css/mods/link.module.css';
import CONFIG from '@strinf/ts/configs/config';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { CookieValue } from '@strinf/ts/constants/style/Acc';
import { DD_B } from '@strinf/ts/constants/style/AtHtml';
import { ClHtml, Col, DdM, Dis, Mar, Pad, Wid } from '@strinf/ts/constants/style/ClHtml';
import HeadT from '@strinf/ts/constants/type/HeadT';

import Known500Error from '@strinf/ts/errors/known/500';
import Known503Error from '@strinf/ts/errors/known/503';
import getServerStatus from '@strinf/ts/functions/api/status';
import { isDyslexiaSet } from '@strinf/ts/functions/cookie/acc';
import onPrError from '@strinf/ts/functions/err/async';
import { createUrlStr, fetchRetry, getCurFullPath } from '@strinf/ts/functions/http/http';
import { deactivateAllDropdownToggles } from '@strinf/ts/functions/libs/style';
import { hasProp } from '@strinf/ts/functions/types/arr';
import OnPageNavVD, { createNavLinks } from '@strinf/ts/mvc/vdom/dyn/misc/OnPageNav';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import CanonH from '@strinf/ts/mvc/vdom/static/helmet/CanonH';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import Loading from '@strinf/ts/mvc/vdom/static/misc/LoadVD';
import * as yaml from 'js-yaml';
import { memo } from 'preact/compat';
import { useContext as use, useEffect, useState } from 'preact/hooks';
import 'rapidoc';
import '@strinf/css/adhoc/api.css';

async function awaitYaml(resp: Response): Promise<unknown> {
    if (resp.ok) {
        const text = await resp.text();
        return yaml.load(text);
    }
    throw new Known500Error('API could not be loaded');
}

async function getSpec(
    priv: boolean | undefined,
    api: ConfLinkT,
    ver: ApiVer,
): Promise<[unknown, string]> {
    if (priv === undefined || !priv) {
        const spec = fetchRetry(`/api/${ver}/strinf_ex.yaml`).then(async (resp) => {
            return awaitYaml(resp);
        });
        spec.catch((err: unknown): void => {
            throw err;
        });
        return [await spec, createUrlStr(api, '')];
    }
    const res = fetchRetry(`/api/${ver}/strinf_in.yaml`).then(async (resp) => {
        return awaitYaml(resp);
    });
    res.catch((err: unknown): void => {
        throw err;
    });
    return [await res, createUrlStr(api, '')];
}

const ANCHOR_API = 'anchor_api_vd_sc_margin';

function loadApiSpec(
    ctx: BreadCrumbsG | undefined,
    apiS: ApiInitT,
    setApiS: Dispatch<StateUpdater<ApiInitT>>,
): void {
    const crit = new Known500Error('Internal server error!');
    if (ctx?.bread !== undefined && apiS.spec === undefined) {
        for (const actF of ctx.bread) {
            actF(HeadT.API);
        }
        const calB = (res: ServerStatusJT): void => {
            if (res.maintenance.status) {
                throw new Known503Error(
                    'Under maintenance!',
                    res.maintenance.duration,
                    res.maintenance.zone,
                );
            }
            const { ver } = apiS;
            getSpec(res.private, CONFIG.backend, ver)
                .then((resSpec) => {
                    setApiS({ ...apiS, spec: resSpec });
                })
                .catch(onPrError);
        };
        getServerStatus(calB, () => {
            onPrError(crit);
        });
    }
}
/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["rap"] }] */
function amendShadow(rap: HTMLElement): void {
    if ('shadowRoot' in rap && rap.shadowRoot !== null) {
        const shRoot = rap.shadowRoot;
        let styleElem = null;
        let modify = true;
        for (const chEle of shRoot.children) {
            if (chEle.tagName === 'STYLE' && styleElem === null) {
                styleElem = chEle;
            }
            modify = modify && chEle.getAttribute('local-amend') === null;
        }
        if (styleElem !== null && modify) {
            const newStyle = document.createElement('style');
            newStyle.setAttribute('local-amend', 'true');
            newStyle.appendChild(
                document.createTextNode(
                    `#api-info { margin-left: 0 !important;}
                    .${ANCHOR_API} {
                        scroll-margin-top: calc(var(--navbar-bottom-height) + 6rem);
                    }`,
                ),
            );
            shRoot.insertBefore(newStyle, styleElem);
        }
    }
}

function genAnchor(id: string): string {
    return `api_vd_anc_${id}`;
}

function crAnc(tagAnchors: [string, string][]): AncT {
    const anc: AncT = {};
    tagAnchors.forEach((value, index) => {
        anc[index] = [value[1], value[0]];
    });
    return anc;
}

function createAnchor(anchorN: string, div: Element): 1 | 0 {
    const mainCon = div.parentNode?.parentNode ?? null;
    const mainGl = mainCon?.parentNode ?? null;
    if (mainGl !== null && mainGl.querySelector(`span#${anchorN}`) === null) {
        const anchor = document.createElement('span');
        anchor.setAttribute('id', anchorN);
        anchor.setAttribute('class', ANCHOR_API);
        mainGl.insertBefore(anchor, mainCon);
        return 1;
    }
    return 0;
}

function setSectionTags(rap: HTMLElement, anc: (anc: AncT) => void): void {
    const allTags: [string, string][] = [];
    let changedCnt = 0;
    if ('shadowRoot' in rap && rap.shadowRoot !== null) {
        const shRoot = rap.shadowRoot;
        const tagReg = /tag--(.+)/;
        for (const div of shRoot.querySelectorAll('div.tag')) {
            const tId = tagReg.exec(div.id);
            if (tId?.[1] !== undefined) {
                const anchorN = genAnchor(tId[1]);
                allTags.push([tId[1].replaceAll('-', ' '), anchorN]);
                changedCnt += createAnchor(anchorN, div);
            }
        }
    }
    if (changedCnt > 0) {
        anc(crAnc(allTags));
    }
}

function addAnchors(eve: Event, anc: (anc: AncT) => void): void {
    const rap = eve.target;
    if (rap !== null && rap instanceof HTMLElement) {
        setSectionTags(rap, anc);
    }
}

function addStyle(eve: Event): void {
    const rap = eve.target;
    if (rap !== null && rap instanceof HTMLElement) {
        amendShadow(rap);
    }
}

function isRequest(eve: Event): eve is Event & { detail: { request: { url: string } } } {
    if (
        'detail' in eve
        && typeof eve.detail === 'object'
        && eve.detail !== null
        && 'request' in eve.detail
        && typeof eve.detail.request === 'object'
    ) {
        const req = eve.detail.request;
        return req !== null && 'url' in req && typeof req.url === 'string';
    }
    return false;
}

function beforeTry(eve: Event): void {
    if (isRequest(eve)) {
        const req = eve.detail.request;
        const tmpUrl = req.url;
        if (
            tmpUrl.includes('/all/')
            || tmpUrl.includes('/brc/')
            || tmpUrl.includes('/cc/')
        ) {
            req.url = `${tmpUrl}${tmpUrl.includes('?') ? '&' : '?'}short`;
        }
    }
}

enum ApiVer {
    v1 = 'v1',
    v2 = 'v2',
}

function ApiV({
    ver,
    apiS,
    setApiS,
}: {
    ver: ApiVer;
    apiS: ApiT;
    setApiS: (sta: ApiInitT) => void;
}) {
    const eventCall = () => {
        const { ver: curVer } = apiS;
        if (curVer !== ver) {
            deactivateAllDropdownToggles();
            setApiS({ ...apiS, ver, spec: undefined });
        }
    };
    return (
        <button
            type="button"
            className={`${linkSty.cleanbutton} ${Wid.f}`}
            onClick={eventCall}
            onTouchEnd={eventCall}
        >
            <span className={DdM.tl}>API</span>
            <span
                className={DdM.r}
                style={{
                    'font-family': 'monospace',
                    'font-size': '1.4rem',
                }}
            >
                {ver}
            </span>
        </button>
    );
}

interface RapiDocProps {
    apiS: ApiT;
    setApiS: (spec: ApiInitT) => void;
    anc: (anc: AncT) => void;
}

async function loadSpec(docu: Element, specUrl: unknown): Promise<void> {
    if (hasProp('loadSpec', docu) && typeof docu.loadSpec === 'function') {
        await docu.loadSpec(specUrl);
    }
}

function RapDoc({ apiS, setApiS, anc }: RapiDocProps): JSX.Element {
    const {
        spec: [specUrl, serverUrl],
        dys,
    } = apiS;
    useEffect(() => {
        const [docu] = document.getElementsByTagName('rapi-doc');
        docu?.classList.add(Dis.dNone);
        if (docu !== undefined) {
            new Promise((res) => {
                res(loadSpec(docu, specUrl));
            }).catch(onPrError);
        }
        const onSpecLoaded = (eve: Event) => {
            docu?.classList.remove(Dis.dNone);
            addAnchors(eve, anc);
        };
        if (docu !== undefined && docu instanceof HTMLElement) {
            docu.addEventListener('spec-loaded', addStyle);
            docu.addEventListener('before-try', beforeTry);
            docu.addEventListener('spec-loaded', onSpecLoaded);
            amendShadow(docu);
            setSectionTags(docu, anc);
        }
        return () => {
            docu?.removeEventListener('spec-loaded', addStyle);
            docu?.removeEventListener('before-try', beforeTry);
            docu?.removeEventListener('spec-loaded', onSpecLoaded);
        };
    }, [specUrl, anc]);
    const font = dys ? 'OpenDyslexic' : 'Rubik';
    return (
        <div
            className={Col.lN9}
            style={{
                height: '100%',
                overflowX: 'scroll',
            }}
        >
            <rapi-doc
                update-route="false"
                allow-try="true"
                show-curl-before-try="true"
                allow-authentication="false"
                allow-server-selection="false"
                server-url={serverUrl}
                default-api-server={serverUrl}
                render-style="view"
                theme="light"
                font-size="default"
                primary-color="#ecaf00"
                load-fonts="false"
                regular-font={font}
                mono-font={font}
                schema-style="table"
                schema-expand-level="2"
                show-header="false"
                allow-advanced-search="false"
                allow-search="true"
                default-schema-tab="schema"
                // nav
                show-method-in-nav-bar="as-colored-text"
                use-path-in-nav-bar="false"
                nav-bg-color="#464646"
                nav-hover-text-color="#ecaf00"
                nav-item-spacing="relaxed"
                info-description-headings-in-navbar="false"
                style={{
                    minWidth: '600px',
                }}
            >
                <div
                    className={`${ClHtml.drD} ${Pad.N5}`}
                    style={{
                        float: 'right',
                    }}
                >
                    <button
                        aria-label="Search results filters"
                        className={`${ClHtml.btn} ${ClHtml.pri} ${Mar.tN5} `}
                        type="button"
                        {...DD_B}
                    >
                        {' '}
                        <span>
                            <b>Version</b>
                        </span>
                        <i
                            className={`${ClHtmlI.caretDB} ${Mar.lN5}`}
                            aria-hidden="true"
                        >
                        </i>
                    </button>
                    <div
                        className={`${ClHtml.drDM} ${ClHtml.drDC} ${Pad.N0}`}
                        aria-labelledby="API version"
                        style={{
                            'width': '10.8rem',
                            'min-width': '10.8rem',
                        }}
                    >
                        <div className={`${drSty.dropdown} ${DdM.div}`}>
                            <ApiV ver={ApiVer.v1} apiS={apiS} setApiS={setApiS} />
                            <ApiV ver={ApiVer.v2} apiS={apiS} setApiS={setApiS} />
                        </div>
                    </div>
                </div>
            </rapi-doc>
        </div>
    );
}

const RapDocM = memo(RapDoc);

function ApiAnchor({
    apiS,
    setApiS,
}: {
    apiS: ApiT;
    setApiS: (sta: ApiInitT) => void;
}): JSX.Element {
    const [anc, setAnc] = useState<AncT | undefined>();
    return (
        <>
            <RapDocM apiS={apiS} setApiS={setApiS} anc={setAnc} />
            <OnPageNavVD>{createNavLinks(anc)}</OnPageNavVD>
        </>
    );
}

interface ApiInitT {
    spec: [unknown, string] | undefined;
    ver: ApiVer;
    dys: boolean;
}

interface ApiT {
    spec: [unknown, string];
    ver: ApiVer;
    dys: boolean;
}

function ApiVD(): JSX.Element {
    const [apiS, setApiS] = useState<ApiInitT>(() => {
        return {
            spec: undefined,
            ver: ApiVer.v2,
            dys: isDyslexiaSet(),
        };
    });
    const ctx: (BreadCrumbsG & CookieS) | undefined = use(MainConGl);
    loadApiSpec(ctx, apiS, setApiS);
    const { spec } = apiS;
    if (spec === undefined) {
        return <Loading />;
    }
    ctx?.cookieActiveSet('ApiVD', (cookie) => {
        const newDys = cookie.includes(CookieValue.dyslexia);
        const { dys } = apiS;
        if (newDys !== dys) {
            setApiS({ ...apiS, spec: undefined, dys: newDys });
        }
    });
    return (
        <>
            <MetaH
                title="StrainInfo - Web service"
                desc="Documentation for the StrainInfo-API"
            />
            <CanonH href={getCurFullPath()} />
            <div className={ClHtml.row}>
                <ApiAnchor apiS={apiS as ApiT} setApiS={setApiS} />
            </div>
        </>
    );
}
export default ApiVD;
