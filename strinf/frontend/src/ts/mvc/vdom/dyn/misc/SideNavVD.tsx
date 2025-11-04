import type { BreadCrumbsS } from '@strinf/ts/interfaces/dom/global';
import type { JSX } from 'preact';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import SideT from '@strinf/ts/constants/type/HeadT';
import Known500Error from '@strinf/ts/errors/known/500';
import onPrError from '@strinf/ts/functions/err/async';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { memo } from 'preact/compat';
import { useContext as use, useEffect, useRef, useState } from 'preact/hooks';

const NAV: { [key in keyof typeof SideT]?: string } = {
    [SideT.HOME]: 'Home',
    [SideT.STRDB]: 'Strains',
    [SideT.API]: 'Web service',
    [SideT.STRREG]: 'StrainRegistry',
    [SideT.NEWS]: 'News',
    [SideT.ABOUT]: 'About',
    [SideT.MANUAL]: 'Manual',
    [SideT.TEAM]: 'Team',
    [SideT.CONTACT]: 'Contact',
};

const NAV_CON_CNT = [SideT.STRDB, SideT.API];

const NAV_CON_INF = [SideT.STRREG, SideT.NEWS, SideT.ABOUT, SideT.MANUAL];
const NAV_CON_ABU = [SideT.TEAM, SideT.CONTACT];

interface SideTProps {
    key: number;
    act: boolean;
    ele: [string, string, string, Promise<string>];
    tId: string | null;
}

function SideEl({ act, key, ele, tId }: SideTProps): JSX.Element {
    const actCl = `${ClHtml.wIco} ${act ? ClHtml.act : ''}`;
    const hrefRef = useRef<HTMLAnchorElement>(null);
    const eleThree = ele[3];
    useEffect(() => {
        eleThree
            .then((link) => {
                if (hrefRef.current !== null) {
                    hrefRef.current.href = link;
                }
            })
            .catch(onPrError);
    }, [eleThree]);
    return (
        <a
            {...(tId == null ? {} : { id: tId })}
            key={key}
            className={`${actCl} ${ele[2]}`}
            ref={hrefRef}
            href="/"
            aria-label={ele[0]}
        >
            {' '}
            <i className={ele[1]} />
            <span className={ClHtml.lab}>{ele[0]}</span>
        </a>
    );
}

function mapLink(nav: string): [string, string, string, Promise<string>] {
    switch (nav) {
        case NAV[SideT.API]:
            return [
                nav,
                ClHtmlI.term,
                ClHtml.dan,
                new Promise((res) => {
                    res(UIApiCon.service);
                }),
            ];
        case NAV[SideT.STRDB]:
            return [
                nav,
                ClHtml.micI,
                ClHtml.pri,
                new Promise((res) => {
                    res(UIApiCon.search);
                }),
            ];
        case NAV[SideT.STRREG]:
            return [
                nav,
                ClHtmlI.reg,
                ClHtml.pri,
                new Promise((res) => {
                    res(UIApiCon.strReg);
                }),
            ];
        case NAV[SideT.NEWS]:
            return [
                nav,
                ClHtmlI.news,
                ClHtml.suc,
                new Promise((res) => {
                    res(UIApiCon.news);
                }),
            ];
        case NAV[SideT.ABOUT]:
            return [
                nav,
                ClHtmlI.about,
                ClHtml.mut,
                new Promise((res) => {
                    res(UIApiCon.about);
                }),
            ];
        case NAV[SideT.MANUAL]:
            return [
                nav,
                ClHtmlI.book,
                ClHtml.mut,
                new Promise((res) => {
                    res(UIApiCon.manual);
                }),
            ];
        case NAV[SideT.CONTACT]:
            return [
                nav,
                ClHtmlI.envelope,
                ClHtml.sig,
                new Promise((res) => {
                    res(UIApiCon.contact);
                }),
            ];
        case NAV[SideT.TEAM]:
            return [
                nav,
                ClHtmlI.team,
                ClHtml.sig,
                new Promise((res) => {
                    res(UIApiCon.team);
                }),
            ];
        default:
            throw new Known500Error(`unknown NAV in sidebar:\n${nav}`);
    }
}

function mapTour(nav: string): string | null {
    if (nav === NAV[SideT.API]) {
        return IdHtmlTour.apiHead;
    }
    return null;
}

function isActive(cur: SideT, act: SideT): boolean {
    switch (cur) {
        case SideT.TEAM:
        case SideT.ABOUT:
        case SideT.NEWS:
        case SideT.API:
        case SideT.MANUAL:
        case SideT.CONTACT:
        case SideT.STRREG:
            return act === cur;
        case SideT.STRDB:
            return [SideT.PASS, SideT.STRDB, SideT.SEARCH].includes(act);
        default:
            throw new Known500Error(`unknown NAV in sidebar:\n${cur}`);
    }
}

function mapSide(val: SideT, ind: number, act: number): JSX.Element | null {
    const navC = NAV[val];
    if (navC !== undefined) {
        return (
            <SideEl
                key={ind}
                act={isActive(val, act)}
                ele={mapLink(navC)}
                tId={mapTour(navC)}
            />
        );
    }
    return null;
}

function SideNavVD(): JSX.Element {
    const conf: BreadCrumbsS | undefined = use(MainConGl);
    const [act, setAct] = useState<SideT>(0);
    conf?.breadSet('SIDE_BAR_NAV')((actI: number) => {
        setAct(actI);
    });
    return (
        <>
            <h5 className={ClHtml.tit} style={{ color: 'var(--color-gray-80)' }}>
                Content
            </h5>
            {NAV_CON_CNT.map((val, ind) => mapSide(val, ind, act))}
            <h5 className={ClHtml.tit} style={{ color: 'var(--color-gray-80)' }}>
                Information
            </h5>
            {NAV_CON_INF.map((val, ind) => mapSide(val, ind, act))}
            <h5 className={ClHtml.tit} style={{ color: 'var(--color-gray-80)' }}>
                About&nbsp;us
            </h5>
            {NAV_CON_ABU.map((val, ind) => mapSide(val, ind, act))}
            <span
                ref={() => {
                    window.style.initSmallSidebar();
                }}
                style={{ display: 'none' }}
            />
        </>
    );
}

export default memo(SideNavVD);
