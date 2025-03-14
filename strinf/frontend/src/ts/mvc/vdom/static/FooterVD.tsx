import { memo } from 'preact/compat';
import type { JSX } from 'preact';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import { C_NOT } from '@strinf/ts/constants/page/copy';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';

import linkSty from '@strinf/css/mods/link.module.css';

function FooterVD(): JSX.Element {
    return (
        <div className={`${ClHtml.foot} ${linkSty.footer}`}>
            <span>{C_NOT}</span>
            <a href={UIApiCon.imprint}>Imprint</a>
            <a href={UIApiCon.impPrivacy}>Privacy Statement</a>
            <a href={UIApiCon.impLicense}>License</a>
            <a href={UIApiCon.sitemap} target="_blank" rel="noreferrer">
                Sitemap
            </a>
        </div>
    );
}
export default memo(FooterVD);
