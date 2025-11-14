import type { JSX } from 'preact';

import linkSty from '@strinf/css/mods/link.module.css';
import QApiCon from '@strinf/ts/constants/api/q_api';
import HUB_L from '@strinf/ts/constants/links/hub_dsmz';
import { ClHtml, Dis, Mar, Wid } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import PagPosT from '@strinf/ts/constants/type/PagPosT';
import { toArrInfoDepRes, toArrInfoStrRes } from '@strinf/ts/functions/api/map';
import { createUrlStr } from '@strinf/ts/functions/http/http';
import { SIDE_ID, toggleSideBar } from '@strinf/ts/functions/libs/style';
import InfoCtrl from '@strinf/ts/mvc/ctrl/InfoCtrl';
import MainNavVD from '@strinf/ts/mvc/vdom/dyn/misc/MainNavVD';
import SideNavVD from '@strinf/ts/mvc/vdom/dyn/misc/SideNavVD';
import { ToolTipDepCM, TT_ID_DEP } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTDepVD';
import ToolTipInfoVD from '@strinf/ts/mvc/vdom/dyn/tooltip/TTInfoVD';
import TTSimVD from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import { ToolTipStrCM, TT_ID_STR } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTStrVD';
import SeaInVD from '@strinf/ts/mvc/vdom/main/input/SeaInVD';
import LogoHubDsmzVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoHubDsmzVD';
import LogoStrainInfoVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoStrainInfoVD';
import AccVD from '@strinf/ts/mvc/vdom/static/misc/AccVd';
import FirInfVD from '@strinf/ts/mvc/vdom/static/misc/FirInfVD';
import { useRef } from 'preact/hooks';

function Logos(): JSX.Element {
    const dsmCl = `${ClHtml.navBbr} ${Mar.lNAT} ${Dis.dNone} ${Dis.dBS}`;
    return (
        <div className={ClHtml.con}>
            <a className={`${ClHtml.navBbr} ${ClHtml.posRel}`} href="/">
                <LogoStrainInfoVD />
            </a>
            <a
                className={dsmCl}
                href={createUrlStr(HUB_L, '')}
                target="_blank"
                rel="noopener"
            >
                <LogoHubDsmzVD height="90" full={true} />
            </a>
        </div>
    );
}

function NavBar(): JSX.Element {
    const hamCl = `${ClHtml.btn} ${ClHtml.btnAct} ${linkSty.cleanbutton}`;
    const btnRef = useRef<HTMLButtonElement>(null);
    return (
        <div className={ClHtml.con}>
            <button
                id={SIDE_ID}
                ref={btnRef}
                type="button"
                className={hamCl}
                aria-label="Menu"
                onClick={() => {
                    toggleSideBar(btnRef.current ?? undefined);
                }}
            >
            </button>
            <MainNavVD />
            <AccVD />
            <SeaInVD
                tId={IdHtmlTour.seaInHead}
                len={`${Wid.SM250} ${Wid.MD400}`}
                pos={PagPosT.HEAD}
            />
        </div>
    );
}

function ToolTipCon(): JSX.Element {
    return (
        <div>
            <ToolTipInfoVD
                hookName={TT_ID_DEP}
                createCtrl={(ver: string) =>
                    new InfoCtrl(ver, toArrInfoDepRes, QApiCon.culMin)}
                createTT={prpos => <ToolTipDepCM {...prpos} />}
            />
            <ToolTipInfoVD
                hookName={TT_ID_STR}
                createCtrl={(ver: string, des: string[]) =>
                    new InfoCtrl(
                        ver,
                        (data: unknown) => toArrInfoStrRes(data, des),
                        QApiCon.strMin,
                    )}
                createTT={prpos => <ToolTipStrCM {...prpos} />}
            />
            <TTSimVD />
        </div>
    );
}

function HeadVD(): JSX.Element {
    return (
        <>
            <ToolTipCon />
            <FirInfVD />
            <button
                type="button"
                aria-label="Menu"
                className={`${ClHtml.sOv} ${linkSty.cleanbutton}`}
                onClick={() => {
                    toggleSideBar();
                }}
            >
            </button>
            <div className={`${ClHtml.navB} ${ClHtml.navBt}`}>
                <Logos />
            </div>
            <nav className={`${ClHtml.navB} ${ClHtml.navBb}`}>
                <NavBar />
            </nav>
            <div className={ClHtml.side}>
                <div className={ClHtml.sMen}>
                    <SideNavVD />
                </div>
            </div>
        </>
    );
}

export default HeadVD;
