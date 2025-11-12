import type { JSX } from 'preact';
import timeSty from '@strinf/css/mods/timeline.module.css';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import { ClHtml, Tex } from '@strinf/ts/constants/style/ClHtml';
import { memo } from 'preact/compat';

const ROAD_MAP: [string, (string | JSX.Element)[]][] = [
    [
        '2000',
        [
            'An integrated strain database is created at BCCM/LMG by a team headed by',
            'Prof. Jean Swings with funding from BELSPO',
        ],
    ],
    [
        '2005',
        [
            'The  team is taken over by ',
            'Prof. Paul De Vos , Prof. Bernard De Baets and Peter Dawyndt',
        ],
    ],
    [
        '2007',
        [
            'The public StrainInfo.net bioportal launches.',
            'First implementation of the StrainInfo.net web services (API)',
        ],
    ],
    ['2009', ['New StrainInfo version introducing strain passports']],
    [
        '2015',
        [
            'Development and maintenance of StrainInfo.net ' +
                'ceases due to lack of continued funding',
        ],
    ],
    ['2019', ['StrainInfo.net goes offline']],
    [
        '2021',
        [
            'The StrainInfo.net data is moved to DSMZ, ' +
                'where development of a new StrainInfo website/database begins ' +
                'within the NFDI4Microbiota consortium, funded by DFG',
        ],
    ],
    [
        '2022',
        [
            'Prototypes for the web UI and web API of the new StrainInfo go online, ' +
                'showing archive data',
        ],
    ],
    [
        '2023 - NOW',
        [
            'Release of the new StrainInfo web services. ',
            <p key="2023">
                Read more about the progress of StrainInfo in our{' '}
                <a href={UIApiCon.news}>latest news</a>.
            </p>,
        ],
    ],
];

function createLiEl(eleC: [string, (string | JSX.Element)[]]): JSX.Element {
    return (
        <li>
            <div className={timeSty.time}>{eleC[0]}</div>
            {eleC[1].map((ele: string | JSX.Element, ind: number) => {
                let eleWr = ele;
                if (typeof ele === 'string') {
                    eleWr = <p>{ele}</p>;
                }
                return (
                    <span key={ind} className={Tex.m}>
                        {eleWr}
                    </span>
                );
            })}
        </li>
    );
}

function RoadMap(): JSX.Element {
    return (
        <div className={ClHtml.box}>
            <div className={ClHtml.cnt}>
                <ul className={timeSty.event}>{ROAD_MAP.map(createLiEl)}</ul>
            </div>
        </div>
    );
}

const RoadMapVD = memo(RoadMap);

export default RoadMapVD;
