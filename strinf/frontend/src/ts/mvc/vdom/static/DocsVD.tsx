import type { JSX } from 'preact';
import { ClHtml, Col, Pad } from '@strinf/ts/constants/style/ClHtml';
import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';

import Doc from '@strinf/md/manual/doc.mdx';
import WebSerPy from '@strinf/md/manual/api_python.mdx';
import Terminology from '@strinf/md/manual/terminology.mdx';
import StrainHier from '@strinf/md/manual/strain_hierarchy.mdx';
import VotingStrIdentity from '@strinf/md/manual/voting_str_identity.mdx';
import StrainStatuses from '@strinf/md/manual/strain_statuses.mdx';
import HeadT from '@strinf/ts/constants/type/HeadT';
import { Container, wrapSectionGen } from '@strinf/ts/mvc/vdom/fun/content/content';
import OnPageNavVD, { createNavLinks } from '@strinf/ts/mvc/vdom/dyn/misc/OnPageNav';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import { createUrlStr, getCurFullPath } from '@strinf/ts/functions/http/http';
import 'highlight.js/styles/monokai.min.css';
import {
    TableWr,
    StrHierUlWr,
    StrHierLiWr,
    OListWr,
} from '@strinf/ts/functions/md/wrapper';
import MainTourVD from '@strinf/ts/mvc/vdom/static/tour/MainTour';
import ApiTourVD from '@strinf/ts/mvc/vdom/static/tour/ApiTour';
import { useContext, useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';
import { Helmet } from 'react-helmet';
import CONFIG from '@strinf/ts/configs/config';
import QApiCon from '@strinf/ts/constants/api/q_api';

function genAnchor(id: number | string): string {
    if (id === IDS.strain) {
        return 'manual_strains_deposits';
    }
    return `manual_vd_anc_${id}`;
}

interface DocsPPT {
    api: string | undefined;
}

enum IDS {
    'webSerPy' = 1,
    'webTour' = 2,
    'webSerTour' = 3,
    'term' = 4,
    'votStrId' = 5,
    'strain' = 6,
    'status' = 7,
}

const REPL_DOM = /{{API_DOMAIN}}\/?/g;
const REPL_DES = /{{API_DES_SEA}}\/?/g;
const REPL_DEP_M = /{{API_DEP_MAX}}\/?/g;

/* eslint-disable complexity */
function correctCode(eleBuf: HTMLSpanElement, api: string): void {
    if (REPL_DOM.test(eleBuf.textContent ?? '')) {
        eleBuf.textContent = eleBuf.textContent?.replaceAll(REPL_DOM, api) ?? '';
    }
    if (REPL_DES.test(eleBuf.textContent ?? '')) {
        eleBuf.textContent =
            eleBuf.textContent?.replaceAll(REPL_DES, QApiCon.seaCulStrDes) ?? '';
    }
    if (REPL_DEP_M.test(eleBuf.textContent ?? '')) {
        eleBuf.textContent =
            eleBuf.textContent?.replaceAll(REPL_DEP_M, QApiCon.culMax) ?? '';
    }
}
/* eslint-enable complexity */

function WebSerPyE(props: DocsPPT): JSX.Element {
    const { api } = props;
    const refCode = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (refCode.current !== null && api !== undefined) {
            let clApi = api;
            if (clApi.endsWith('/')) {
                clApi = clApi.slice(0, -1);
            }
            Array.from(refCode.current.getElementsByTagName('span')).forEach((ele) => {
                const eleBuf = ele;
                correctCode(eleBuf, clApi);
            });
        }
    }, [refCode, api]);
    return (
        <div ref={refCode}>
            <WebSerPy key={IDS.webSerPy} />
        </div>
    );
}

function TerminologyE(): JSX.Element {
    return <Terminology key={IDS.term} components={{ table: TableWr }} />;
}
function StrainHierE(): JSX.Element {
    return (
        <StrainHier key={IDS.strain} components={{ li: StrHierLiWr, ul: StrHierUlWr }} />
    );
}

function VotingStrIdentityE(): JSX.Element {
    return <VotingStrIdentity key={IDS.votStrId} />;
}

function StrainStatusesE(): JSX.Element {
    return <StrainStatuses key={IDS.status} components={{ ol: OListWr }} />;
}

const ID_LIST: [number, string, (api?: string) => JSX.Element][] = [
    [IDS.webTour, 'Website', () => <MainTourVD />],
    [IDS.webSerTour, 'Web service/API', () => <ApiTourVD />],
    [IDS.term, 'Terminology', TerminologyE],
    [IDS.strain, 'Strains and deposits?', StrainHierE],
    [IDS.status, 'Strain statuses', StrainStatusesE],
    [IDS.webSerPy, 'API requests in Python', (api) => <WebSerPyE api={api} />],
    [IDS.votStrId, 'Voting on Strain Identity', VotingStrIdentityE],
];

function DocsPP(props: DocsPPT): JSX.Element {
    const { api } = props;
    return (
        <>
            {' '}
            {ID_LIST.map((val) => wrapSectionGen(genAnchor(val[0]), val[1], val[2](api)))}
        </>
    );
}

function crAnc(): AncT {
    const anc: AncT = {
        0: [genAnchor('main_intro'), 'StrainInfo Help'],
    };
    ID_LIST.forEach((value, index) => {
        anc[index + 1] = [genAnchor(value[0]), value[1]];
    });
    return anc;
}

function DocCon(props: { children: JSX.Element }): JSX.Element {
    const { children } = props;
    return (
        <>
            <Helmet>
                <meta name="description" content="StrainInfo documentation" />
                <link rel="canonical" href={getCurFullPath()} />
                <title>StrainInfo - Documentation</title>
            </Helmet>
            <div className={`${ClHtml.cntCon} ${Pad.bN0}`}>
                <div className={ClHtml.row}>{children}</div>
            </div>
        </>
    );
}

function Docs(): JSX.Element {
    const ctx: BreadCrumbsG | undefined = useContext(MainConGl);
    if (ctx?.bread !== undefined) {
        ctx.bread.map((actF) => {
            actF(HeadT.MANUAL);
        });
    }
    const api = createUrlStr(CONFIG.backend, '');
    return (
        <DocCon>
            <>
                <div className={Col.lN9}>
                    <Container>
                        {wrapSectionGen(genAnchor('main_intro'), 'StrainInfo', <Doc />)}
                        <DocsPP api={api} />
                    </Container>
                </div>
                <OnPageNavVD>{createNavLinks(crAnc())}</OnPageNavVD>
            </>
        </DocCon>
    );
}

const DocsVD = memo(Docs);

export default DocsVD;
