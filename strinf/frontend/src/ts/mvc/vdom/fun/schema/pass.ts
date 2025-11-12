import type { PassR, SeqT } from '@strinf/ts/interfaces/api/mapped';
import type { ConfLinkT } from '@strinf/ts/interfaces/misc/configs';
import CONFIG from '@strinf/ts/configs/config';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { DOI_P, LPSN_P, NCBI_P, SCH_ORG } from '@strinf/ts/constants/links/collection';
import { DSMZ_DET } from '@strinf/ts/constants/links/dsmz';
import { C_LIC_LIN } from '@strinf/ts/constants/page/copy';
import { createUrlStr } from '@strinf/ts/functions/http/http';
import {
    createApiStrainCall,
    createStrainCall,
} from '@strinf/ts/functions/links/create_pass';

const logoI = new URL('@assets/logo/strinf.webp', import.meta.url).pathname;

interface ID_T {
    '@type': string;
    name: string;
    propertyID: string;
    value: number | string;
}

function bacDiveID(pass: PassR): string[] {
    if (pass.overview[3] === undefined) {
        return [];
    }
    return [`${IdAcrTagCon.bacDiveId} ${pass.overview[3]}`];
}

function doiAsID(pass: PassR): ID_T[] {
    if (pass.overview[4] === '') {
        return [];
    }
    return [
        {
            '@type': 'PropertyValue',
            name: 'DOI',
            propertyID: DOI_P,
            value: pass.overview[4],
        },
    ];
}

function getArchiveDates(pass: PassR): [string, string] {
    const [strId] = pass.overview;
    const regDoi = new RegExp(`^(?:.+/)?${IdAcrTagCon.strId}\\s*${strId}\\.(\\d+)$`);
    let crDate = '';
    let modDate = '';
    let runId = 0;
    for (const arc of pass.archive) {
        const version = regDoi.exec(arc[0]);
        if (version?.[1] === undefined) {
            continue;
        }
        const versionNum = Number.parseInt(version[1], 10);
        if (versionNum === 1) {
            crDate = `${arc[2]}T00:00:00+01:00`;
        }
        if (versionNum > runId) {
            runId = versionNum;
            modDate = `${arc[2]}T00:00:00+01:00`;
        }
    }
    return [crDate, modDate];
}

function checkTaxon(name: unknown): name is string {
    return typeof name === 'string' && name.length > 0;
}

function createAbout(name: string, lpsn?: number, ncbi?: number): Record<string, object> {
    if (checkTaxon(name)) {
        return {};
    }
    return {
        about: {
            '@type': 'Taxon',
            name: name,
            identifier: [
                lpsn !== undefined
                    ? {
                          '@type': 'PropertyValue',
                          name: 'LPSN',
                          propertyID: LPSN_P,
                          value: lpsn,
                      }
                    : null,
                ncbi !== undefined
                    ? {
                          '@type': 'PropertyValue',
                          name: 'NCBI',
                          propertyID: NCBI_P,
                          value: ncbi,
                      }
                    : null,
            ].filter((about) => about != null),
        },
    };
}

function crCreator(strinf: ConfLinkT) {
    return {
        '@type': 'Organization',
        name: 'StrainInfo',
        url: createUrlStr(strinf, ''),
        logo: createUrlStr(strinf, logoI),
    };
}

function crDSMZ() {
    return {
        ...DSMZ_DET,
        '@context': SCH_ORG,
        '@type': 'Organization',
    };
}

function defineTaxonName(name: string): string {
    if (checkTaxon(name)) {
        return name;
    }
    return 'unknown';
}

function createAllSeqAcc(pass: PassR): string[] {
    const seqCon = pass.sequences;
    return seqCon.map((seq: SeqT) => seq[0]);
}

const KEY_WORDS = [
    'Microbiology',
    'Life Sciences',
    'Microorganism',
    'StrainInfo',
] as const;

function crTaxonNames(main: string, cul_tax: string[]): string[] {
    const u_tax = new Set(cul_tax);
    if (checkTaxon(main)) {
        u_tax.add(main);
    }
    u_tax.delete('');
    return [...u_tax];
}
function createCVSchema(pass: PassR, cul_tax: string[]): string {
    const [crDat, modDat] = getArchiveDates(pass);
    return JSON.stringify({
        '@context': SCH_ORG,
        '@type': 'Dataset',
        description: [
            `StrainInfo dataset ${pass.overview[0]}`,
            `about a strain of ${defineTaxonName(pass.overview[2][0])}.`,
            'StrainInfo is a service developed to provide a',
            'resolution of microbial strain identifiers by',
            'storing culture collection numbers, their relations,',
            'and deposit-associated data. This work is part of the Strain-ID',
            'use case of the NFDI4Microbiota consortium.',
        ].join(' '),
        identifier: [...doiAsID(pass)],
        keywords: [
            `${IdAcrTagCon.strId} ${pass.overview[0]}`,
            ...crTaxonNames(pass.overview[2][0], cul_tax),
            ...createAllSeqAcc(pass),
            ...pass.relations.map(([, ccno]) => ccno),
            ...bacDiveID(pass),
            ...KEY_WORDS,
        ],
        license: C_LIC_LIN,
        name: `StrainInfo ${IdAcrTagCon.strId} ${pass.overview[0]}`,
        url: createUrlStr(CONFIG.frontend, createStrainCall(pass.overview[0])),
        creator: crCreator(CONFIG.frontend),
        includedInDataCatalog: {
            '@type': 'DataCatalog',
            name: 'StrainInfo',
            description: [
                'StrainInfo is a service developed to provide',
                'a resolution of microbial strain identifiers',
                'by storing culture collection numbers, their relations,',
                'and deposit-associated data.',
            ].join(' '),
            url: createUrlStr(CONFIG.frontend, ''),
            provider: crDSMZ(),
        },
        publisher: crCreator(CONFIG.frontend),
        isAccessibleForFree: true,
        sourceOrganization: crDSMZ(),
        thumbnailUrl: createUrlStr(CONFIG.frontend, logoI),
        distribution: [
            {
                '@type': 'DataDownload',
                encodingFormat: 'JSON',
                contentUrl: createUrlStr(
                    CONFIG.backend,
                    createApiStrainCall(pass.overview[0])
                ),
            },
        ],
        ...createAbout(pass.overview[2][0], pass.overview[2][1], pass.overview[2][2]),
        ...(crDat === '' ? {} : { dateCreated: crDat }),
        ...(modDat === '' ? {} : { dateModified: modDat }),
    });
}

export default createCVSchema;
