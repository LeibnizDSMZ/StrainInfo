import type { JSX } from 'preact';
import linkSty from '@strinf/css/mods/link.module.css';
import { dsmz_mail } from '@strinf/ts/constants/links/mail';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { createUrlStr } from '@strinf/ts/functions/http/http';
import { openMailClient, scrambleMail } from '@strinf/ts/functions/links/mail';

const DSMZ_L = {
    domain: 'www.dsmz.de',
    protocol: 'https',
    port: 443,
} as const;

const DSMZ_BULK = 'https://www.dsmz.de/bulk-deposit';

const DSMZ_DET = {
    name: 'DSMZ',
    legalName: [
        'Leibniz Institute DSMZ-German Collection of Microorganisms',
        'and Cell Cultures GmbH',
    ].join(' '),
    address: {
        '@type': 'PostalAddress',
        'addressCountry': 'DE',
        'addressLocality': 'Braunschweig',
        'postalCode': '38124',
        'streetAddress': 'Inhoffenstraße 7B',
    },
    email: dsmz_mail(),
    telephone: '+49 531 2616 0',
    faxNumber: '+49 531 2616 418',
    vatID: 'DE 114815269',
    url: createUrlStr(DSMZ_L, ''),
    logo: 'https://www.dsmz.de/fileadmin/templates/main/img/logo_en.svg',
    image: 'https://www.dsmz.de/fileadmin/_processed_/8/9/csm_Gebaeude_Drohne_8_3fad1fbb63.jpg',
} as const;

function ImprintDsmzVD(): JSX.Element {
    const linkCl = `${linkSty.cleanbutton} ${linkSty.linkbutton}`;
    const dsmz = (
        <button
            className={linkCl}
            type="button"
            aria-label="Open mail client"
            onClick={(eve) => {
                eve.preventDefault();
                openMailClient(dsmz_mail());
            }}
        >
            {scrambleMail(dsmz_mail())}
        </button>
    );
    return (
        <>
            <strong className={ClHtml.lead}>{DSMZ_DET.legalName}</strong>
            <p>
                {DSMZ_DET.address.streetAddress}
                <br />
                {DSMZ_DET.address.postalCode}
                {' '}
                {DSMZ_DET.address.addressLocality}
                <br />
                Science Campus Braunschweig-Süd
                <br />
                GERMANY
            </p>
            <p>
                Phone:
                {' '}
                {DSMZ_DET.telephone}
                <br />
                EMail:
                {' '}
                {dsmz}
                <br />
                Internet:
                {' '}
                <a target="_blank" href={createUrlStr(DSMZ_L, '')} rel="noopener">
                    www.dsmz.de
                </a>
            </p>
        </>
    );
}

export default DSMZ_L;
export { DSMZ_BULK, DSMZ_DET, ImprintDsmzVD };
