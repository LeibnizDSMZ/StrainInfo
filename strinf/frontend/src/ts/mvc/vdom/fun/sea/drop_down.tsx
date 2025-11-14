import type { SeaIndConT } from '@strinf/ts/interfaces/api/data';
import type { JSX } from 'preact';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import QApiCon from '@strinf/ts/constants/api/q_api';
import { StatTags } from '@strinf/ts/constants/api/thes_api';
import { getApiToStr } from '@strinf/ts/functions/api/map';

const FULL: [string, string][] = [
    ['Designation', 'DSM 20543'],
    ['Taxonomy', 'Eubacterium limosum'],
    ['Seq. accession number', 'M59120'],
    ['Culture Collection', 'DSMZ'],
    ['Strain id', `${IdAcrTagCon.strId} 34969`],
    ['Deposit id', `${IdAcrTagCon.depId} 901889`],
];

const MOBILE: [string, string][] = [
    ['Designation', 'DSM 20543'],
    ['Taxonomy', 'E. limosum'],
    ['Seq. acc.', 'M59120'],
    ['BRC', 'DSMZ'],
    ['Strain id', `${IdAcrTagCon.strId} 34969`],
    ['Cul. id', `${IdAcrTagCon.depId} 901889`],
];

function createValue(
    index: number,
    values: [string, string][],
    ita = false,
): JSX.Element | string {
    const [, valueMapped] = values[index] ?? [];
    if (valueMapped === undefined) {
        return 'unknown';
    }
    if (index === 1 && ita) {
        return <i>{valueMapped}</i>;
    }
    return valueMapped;
}

type MAP_TYP = [string, JSX.Element | string, string];

function getDDExp(): MAP_TYP[] {
    if (window.innerWidth < 768) {
        return [
            ...FULL.map(
                (val, ind): MAP_TYP => [
                    MOBILE[ind]?.[0] ?? '',
                    createValue(ind, MOBILE),
                    val[1],
                ],
            ),
        ];
    }
    return [
        ...FULL.map(
            (val, ind): MAP_TYP => [val[0], createValue(ind, FULL, true), val[1]],
        ),
    ];
}

function getDDRes(data: SeaIndConT[], len: number): [string, string, string, string][] {
    const strainIds = new Set();
    return data
        .map((val): [string, string, string, string, boolean] => {
            if (val.strainCount === 1) {
                const dup = !strainIds.has(val.siID);
                strainIds.add(val.siID);
                return [
                    StatTags.strain,
                    val.fullKey,
                    `${val.siID}`,
                    QApiCon.seaCulStrId,
                    dup,
                ];
            }
            return [getApiToStr(val.path), val.fullKey, val.fullKey, val.path, true];
        })
        .filter(val => val[4])
        .map((val): [string, string, string, string] => [val[0], val[1], val[2], val[3]])
        .slice(0, len);
}

export default getDDExp;
export { getDDRes };
