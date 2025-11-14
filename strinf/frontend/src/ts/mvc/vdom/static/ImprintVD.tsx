import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import type { ConfLinkT } from '@strinf/ts/interfaces/misc/configs';
import type { JSX } from 'preact';
import linkSty from '@strinf/css/mods/link.module.css';
import Imprint from '@strinf/md/about/imprint.mdx';
import Privacy from '@strinf/md/about/privacy.mdx';
import CONFIG from '@strinf/ts/configs/config';
import { strain_info_mail } from '@strinf/ts/constants/links/mail';
import HeadT from '@strinf/ts/constants/type/HeadT';
import { getCurFullPath } from '@strinf/ts/functions/http/http';
import { openMailClient, scrambleMail } from '@strinf/ts/functions/links/mail';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';

import CanonH from '@strinf/ts/mvc/vdom/static/helmet/CanonH';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import { memo } from 'preact/compat';
import { useContext as use } from 'preact/hooks';

function crPrivNotice(notice: boolean, mat: ConfLinkT): JSX.Element {
    if (notice) {
        let link = `${mat.protocol}://${mat.domain}:${mat.port}/`;
        link += 'index.php?module=CoreAdminHome&action=optOut&language=en';
        const WR = Privacy as (props: { link: string }) => JSX.Element;
        return <WR link={link} />;
    }
    return <p>We are not collecting any data!</p>;
}

function MainCon(): JSX.Element {
    const linkCl = `${linkSty.cleanbutton} ${linkSty.linkbutton}`;
    const strinf = (
        <button
            className={linkCl}
            type="button"
            aria-label="Open mail client"
            onClick={(eve) => {
                eve.preventDefault();
                openMailClient(strain_info_mail());
            }}
        >
            {scrambleMail(strain_info_mail())}
        </button>
    );
    const WR = Imprint as (
        props: Record<'mailSI' | 'privacy', JSX.Element>,
    ) => JSX.Element;
    return (
        <WR
            mailSI={strinf}
            privacy={crPrivNotice(CONFIG.statistic.enable, CONFIG.statistic.matomo)}
        />
    );
}

function ImprintAll(): JSX.Element {
    const ctx: BreadCrumbsG | undefined = use(MainConGl);
    if (ctx?.bread !== undefined) {
        for (const actF of ctx.bread) {
            actF(HeadT.IMPRINT);
        }
    }
    return (
        <>
            <MetaH title="StrainInfo - Imprint" desc="StrainInfo imprint" />
            <CanonH href={getCurFullPath()} />
            <MainCon />
        </>
    );
}

const ImprintVD = memo(ImprintAll);

export default ImprintVD;
