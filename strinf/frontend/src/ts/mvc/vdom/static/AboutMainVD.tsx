import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { JSX } from 'preact';
import Contribution from '@strinf/md/about/contribution.mdx';
import Info from '@strinf/md/about/info.mdx';
import Services from '@strinf/md/about/services.mdx';
import { ClHtml, Col } from '@strinf/ts/constants/style/ClHtml';
import HeadT from '@strinf/ts/constants/type/HeadT';
import { getCurFullPath } from '@strinf/ts/functions/http/http';
import { AnchorWr, TableWr } from '@strinf/ts/functions/md/wrapper';

import OnPageNavVD, { createNavLinks } from '@strinf/ts/mvc/vdom/dyn/misc/OnPageNav';
import { Container, wrapSectionGen } from '@strinf/ts/mvc/vdom/fun/content/content';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import PublicationsVD from '@strinf/ts/mvc/vdom/static/about/PublicationsVD';
import RoadMapVD from '@strinf/ts/mvc/vdom/static/about/RoadMapVD';
import CanonH from '@strinf/ts/mvc/vdom/static/helmet/CanonH';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import AboutIluVD from '@strinf/ts/mvc/vdom/static/images/docu/AboutIluVD';
import LogoBccmVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoBccmVD';
import LogoCcugVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoCcugVD';
import LogoCipVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoCipVD';
import LogoCirmVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoCirmVD';
import LogoDsmzVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoDsmzVD';
import LogoIcmpVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoIcmpVD';
import LogoRccVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoRccVD';
import LogoUamhVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoUamhVD';
import { memo } from 'preact/compat';
import { useContext as use } from 'preact/hooks';

const LOGOS = {
    dsmz: <LogoDsmzVD />,
    bccm: <LogoBccmVD />,
    cip: <LogoCipVD />,
    ccug: <LogoCcugVD />,
    cirm: <LogoCirmVD />,
    icmp: <LogoIcmpVD />,
    rcc: <LogoRccVD />,
    uamh: <LogoUamhVD />,
};

interface AboutElProps {
    path: string;
}

enum IDS {
    main = 1,
    cont = 2,
    road = 3,
    pub = 4,
    ser = 5,
}

function InfoE(): JSX.Element {
    const WR = Info as (props: { about: JSX.Element }) => JSX.Element;
    return <WR key={IDS.main} about={<AboutIluVD />} />;
}

function ContributionE(): JSX.Element {
    const WR = Contribution as (props: { logos: typeof LOGOS }) => JSX.Element;
    return <WR key={IDS.cont} logos={LOGOS} />;
}

function RoadMapE(): JSX.Element {
    return <RoadMapVD key={IDS.road} />;
}

function PublicationsE(): JSX.Element {
    return <PublicationsVD key={IDS.pub} />;
}

function ServicesE(): JSX.Element {
    return (
        <Services
            key={IDS.ser}
            components={{
                table: TableWr,
                a: AnchorWr,
            }}
        />
    );
}

function genAnchor(id: number): string {
    return `about_vd_anc_${id}`;
}

const ID_LIST: [number, string, () => JSX.Element][] = [
    [IDS.main, 'StrainInfo', InfoE],
    [IDS.cont, 'Strain data contributors', ContributionE],
    [IDS.road, 'StrainInfo - History', RoadMapE],
    [IDS.pub, 'Publications', PublicationsE],
    [IDS.ser, 'Services', ServicesE],
];

function AboutPP(): JSX.Element {
    return (
        <>
            {' '}
            {ID_LIST.map(val => wrapSectionGen(genAnchor(val[0]), val[1], val[2]()))}
        </>
    );
}

function crAnc(): AncT {
    const anc: AncT = {};
    ID_LIST.forEach((value, index) => {
        anc[index] = [genAnchor(value[0]), value[1]];
    });
    return anc;
}

function AboutP(): JSX.Element {
    const ctx: BreadCrumbsG | undefined = use(MainConGl);
    if (ctx?.bread !== undefined) {
        for (const actF of ctx.bread) {
            actF(HeadT.ABOUT);
        }
    }
    return (
        <>
            <MetaH title="StrainInfo - About" desc="About StrainInfo" />
            <CanonH href={getCurFullPath()} />
            <div className={ClHtml.row}>
                <div className={Col.lN9}>
                    <Container>
                        <AboutPP />
                    </Container>
                </div>
                <OnPageNavVD>{createNavLinks(crAnc())}</OnPageNavVD>
            </div>
        </>
    );
}

export default memo<(props: AboutElProps) => JSX.Element>(AboutP);
