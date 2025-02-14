import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { ClHtml, Col, Mar, Tex } from '@strinf/ts/constants/style/ClHtml';
import type { DiaSetF } from '@strinf/ts/interfaces/dom/dia';
import type { DataCon } from '@strinf/ts/interfaces/dom/global';
import type { StaSetF } from '@strinf/ts/interfaces/dom/ind';
import CpsVD from '@strinf/ts/mvc/vdom/dyn/stat/CpsVD';
import { selectBannerImage } from '@strinf/ts/functions/files/image';

function mapStats(sta: DataCon<number>): JSX.Element {
    return (
        <p key={sta.id} className={`${Mar.lN15} ${Mar.yN5}`}>
            {sta.id}: {sta.data}
        </p>
    );
}

interface OvProps {
    sta: StaSetF;
    dia: DiaSetF;
}

interface StaProps {
    stat: DataCon<number>[];
    dia: DiaSetF;
}

function Statistics({ dia, stat }: StaProps): JSX.Element {
    const dCl = `${Col.lN2} ${Mar.bNAT} ${Mar.tN15}`;
    return (
        <>
            <h2 className={`${Tex.w} ${ClHtml.titSec}`}>Statistics</h2>
            <div className={ClHtml.box}>
                <div className={`${ClHtml.cnt} ${ClHtml.row}`}>
                    <CpsVD dia={dia} />
                    <div className={dCl}>{stat.map(mapStats)}</div>
                </div>
            </div>
        </>
    );
}

const STY = {
    'background-size': 'cover',
    'background-position': 'left',
    'background-image':
        'linear-gradient(to right,rgba(27, 27, 27, 0.8),' +
        'rgba(27, 27, 27, 0.8)), ' +
        `url(${selectBannerImage()})`,
};

function OvVD({ dia, sta }: OvProps): JSX.Element {
    const [stat, setStat] = useState<DataCon<number>[]>([]);
    sta(setStat);
    return (
        <section className={`${ClHtml.sec} ${ClHtml.secD} ${ClHtml.secI}`} style={STY}>
            <div className={ClHtml.con}>
                <Statistics stat={stat} dia={dia} />
            </div>
        </section>
    );
}

export default OvVD;
