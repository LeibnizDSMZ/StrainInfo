import type { JSX } from 'preact';
import { PubSimVD } from '@strinf/ts/mvc/vdom/dyn/pass/PubVD';
import { memo } from 'preact/compat';

// doi, title, authors, journal, year
const PUB_CON: [string, string, string, string, number][] = [
    [
        '10.1093/database/baaf059',
        'StrainInfo—the central database for linked microbial strain identifiers',
        'A. Lissin, I. Schober, J. F. Witte, H. Lüken, A. Podstawka, J. Koblitz, B. Bunk, P. Dawyndt, P. Vandamme, P. de Vos, J. Overmann, L. C. Reimer',
        'Database',
        2025,
    ],
    [
        '10.1016/j.syapm.2011.01.004',
        'Make Histri: Reconstructing the Exchange History of Bacterial and '
        + 'Archaeal Type Strains.',
        'B. Verslyppe, W. De Smet, B. De Baets, P. De Vos, P. Dawyndt',
        'Systematic and Applied Microbiology',
        2011,
    ],
    [
        '10.1016/j.resmic.2010.02.005',
        'Microbiological Common Language (MCL): A Standard for Electronic '
        + 'Information Exchange in the Microbial Commons.',
        'B. Verslyppe, R. Kottmann, W. De Smet, B. De Baets, P. De Vos, P. Dawyndt',
        'Research in Microbiology',
        2010,
    ],
    [
        '10.1016/j.syapm.2013.09.001',
        'Filtering and Ranking Techniques for Automated Selection'
        + ' of High-Quality 16S RRNA Gene Sequences.',
        'W. De Smet, K. De Loof, P. De Vos, P. Dawyndt, B. De Baets',
        'Systematic and Applied Microbiology',
        2013,
    ],
    [
        '10.1016/j.syapm.2013.11.002',
        'StrainInfo Introduces Electronic Passports for Microorganisms.',
        'B. Verslyppe, W. De Smet, B. De Baets, P. De Vos, P. Dawyndt',
        'Systematic and Applied Microbiology',
        2014,
    ],
    [
        '10.1109/TKDE.2005.131',
        'Knowledge Accumulation and Resolution of Data Inconsistencies during the '
        + 'Integration of Microbial Information Sources.',
        'P. Dawyndt, M. Vancanneyt, H. De Meyer, J. Swings',
        'IEEE Transactions on Knowledge and Data Engineering',
        2005,
    ],
];

function Publications(): JSX.Element {
    return <PubSimVD res={PUB_CON} />;
}

const PublicationsVD = memo(Publications);

export default PublicationsVD;
