import CONFIG from '@strinf/ts/configs/config';
import StrainStatus from '@strinf/ts/constants/api/data';
import QApiCon from '@strinf/ts/constants/api/q_api';
import {
    SR_BRC,
    SR_CUL_ID,
    SR_DES,
    SR_SEQ_ACC,
    SR_STR_ID,
    SR_TAX,
} from '@strinf/ts/constants/api/sea_reg';
import THESAURUS_MAP, { getShortText } from '@strinf/ts/constants/api/thes_api';
import Known500Error from '@strinf/ts/errors/known/500';
import type {
    DetT,
    OvT,
    PassJ,
    PassR,
    PubT,
    RelT,
    SeaInputCombEl,
    SeaResJ,
    SeaR,
    SeqT,
    InfoJ,
    InfoR,
    DetailsJ,
    DetailsR,
    DesT,
    ArcT,
    DetET,
    DetMT,
    ServerStatusInt,
    SeaIndJ,
    SeaIndR,
    SerSeaR,
    SerSeaAllJ,
} from '@strinf/ts/interfaces/api/maped';
import type { JSX } from 'preact';
import { isSlimScreen } from '../misc/screen';

const SEA_INPUT_COMB: SeaInputCombEl[] = [
    {
        check: (input: string): void => {
            const trIn = input.trim();
            if (!SR_CUL_ID.test(trIn)) {
                throw new Error('no match found');
            }
        },
        getArgs: (input: string): string =>
            encodeURIComponent(
                input.trim().replace(/\s+/g, ' ').replace(SR_CUL_ID, '$1')
            ),
        api: QApiCon.seaStrCulId,
    },
    {
        check: (input: string): void => {
            const trIn = input.trim();
            if (!SR_STR_ID.test(trIn)) {
                throw new Error('no match found');
            }
        },
        getArgs: (input: string): string =>
            encodeURIComponent(
                input.trim().replace(/\s+/g, ' ').replace(SR_STR_ID, '$1')
            ),
        api: QApiCon.seaCulStrId,
    },
    {
        check: (input: string): void => {
            if (!SR_SEQ_ACC.test(input.trim())) {
                throw new Error('no match found');
            }
        },
        getArgs: (input: string): string =>
            encodeURIComponent(input.trim().replace(/\s*,\s*/g, ',')),
        api: QApiCon.seaStrSeqAcc,
    },
    {
        check: (input: string): void => {
            const trIn = input.trim();
            if (!SR_TAX.test(trIn)) {
                throw new Error('no match found');
            }
        },
        getArgs: (input: string): string =>
            encodeURIComponent(
                input
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/\s*,\s*/g, ',')
                    .split(',')
                    .filter((arg) => arg.length >= 2)
                    .join(',')
            ),
        api: `${QApiCon.seaStrTaxName},${QApiCon.seaStrBrc}`,
    },
    {
        check: (input: string): void => {
            const trIn = input.trim();
            if (!SR_BRC.test(trIn)) {
                throw new Error('no match found');
            }
        },
        getArgs: (input: string): string =>
            encodeURIComponent(
                input
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/\s*,\s*/g, ',')
                    .split(',')
                    .filter((arg) => arg.length >= 2)
                    .join(',')
            ),
        api: QApiCon.seaStrBrc,
    },
    {
        check: (input: string): void => {
            const trIn = input.trim();
            if (!SR_DES.test(trIn)) {
                throw new Error('no match found');
            }
        },
        getArgs: (input: string): string =>
            encodeURIComponent(
                input
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/\s*,\s*/g, ',')
                    .split(',')
                    .filter((arg) => arg.length >= 2)
                    .join(',')
            ),
        api: QApiCon.seaStrStrDes,
    },
];

function skipAPIchecks(): boolean {
    if (CONFIG.production || CONFIG.stage) {
        return true;
    }
    return false;
}

function checkDifCon(data: object, to_check: string[]): void {
    const dif = to_check.filter((val) => !(val in data));
    if (dif.length > 0) {
        throw new Known500Error(`missing json properties: ${dif.join(', ')}`);
    }
}

const ENC = new TextEncoder();

function isSeaResJ(data: unknown): data is SeaResJ {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(typeof data === 'object') || data === null) {
        return false;
    }
    const toCh = data as SeaResJ;
    checkDifCon(toCh, ['strain']);
    const { strain } = toCh;
    checkDifCon(strain, ['siID', 'doi', 'typeStrain', 'status', 'relation']);
    const { relation } = strain;
    checkDifCon(relation, ['deposit']);
    for (const cul of relation.deposit) {
        checkDifCon(cul, ['siDP', 'designation']);
    }
    return true;
}

function isSerSeaR(data: unknown): data is SerSeaR {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(Array.isArray(data) && data.length === 6)) {
        return false;
    }
    const [si_id, desCon, tax, tst, code, status] = data;
    if (!(typeof si_id === 'number')) {
        return false;
    }
    if (!(typeof tax === 'string')) {
        return false;
    }
    if (!(typeof code === 'string')) {
        return false;
    }
    if (!(typeof tst === 'number')) {
        return false;
    }
    if (!(typeof status === 'number')) {
        return false;
    }
    if (!Array.isArray(desCon)) {
        return false;
    }
    for (const des of desCon) {
        if (!(typeof des === 'string')) {
            return false;
        }
    }
    return true;
}

function convertStrainStatusToInt(status: string): number {
    if (status === StrainStatus.dep) {
        return 2;
    }
    if (status === StrainStatus.pubOn) {
        return 1;
    }
    return 0;
}

function convertStrainStatusToEnum(status: number): StrainStatus {
    if (status === 1) {
        return StrainStatus.pubOn;
    }
    if (status === 2) {
        return StrainStatus.dep;
    }
    return StrainStatus.pubOff;
}

// TODO deprecate  and move to new service instead?
function toArrSeaRes(data: unknown): SeaR {
    if (!isSeaResJ(data)) {
        throw new Known500Error('Unknown type provided for search results');
    }
    const { strain } = data;
    const { relation, taxon, sample, status } = strain;
    const code = ENC.encode(sample?.countryCode);
    return [
        strain.siID,
        relation.deposit.map((cul) => cul.designation),
        taxon?.name ?? '',
        strain.typeStrain,
        code,
        convertStrainStatusToInt(status),
    ];
}

function getSeaResTuple(full: boolean): string[] {
    if (full) {
        return [
            'SI-ID',
            'Designation',
            'Taxonomy',
            'Type strain',
            'Sample country',
            'Strain status',
        ];
    }
    return ['Strain id', 'Designation', 'Taxonomy', 'Type strain', 'Strain status'];
}

function createOVCon(data: PassJ): OvT {
    return [
        data.strain.siID,
        data.strain.typeStrain,
        [data.strain.taxon?.name ?? '', data.strain.taxon?.lpsn, data.strain.taxon?.ncbi],
        data.strain.bdID,
        data.strain.doi,
    ];
}

function createAllStrIds(data: PassJ): number[] {
    return [data.strain.siID, ...(data.strain.merged ?? [])];
}

function createAltStrIds(data: PassJ): number[] {
    return data.strain.alternative ?? [];
}

function getOVTuple(): string[] {
    return ['Persistent link - DOI', 'Type strain', 'Taxonomy', 'More about this strain'];
}

function detConMain(data: DetailsJ): DetMT {
    let cat_url = '';
    if (data.deposit.catalogue?.online === true) {
        cat_url = data.deposit.catalogue.url;
    }
    let brc_home = '';
    if (data.deposit.cultureCollection?.homepage?.online === true) {
        brc_home = data.deposit.cultureCollection.homepage.url;
    }
    return [
        [
            cat_url,
            data.deposit.cultureCollection?.code ?? '',
            data.deposit.cultureCollection?.name ?? '',
            data.deposit.cultureCollection?.countryCode ?? '',
            brc_home,
            data.deposit.cultureCollection?.ror ?? '',
        ],
        data.deposit.designation,
        data.deposit.siDP,
        data.deposit.cultureCollection === undefined,
        data.deposit.typeStrain,
        [
            data.deposit.taxon?.name ?? '',
            data.deposit.taxon?.lpsn,
            data.deposit.taxon?.ncbi,
        ],
    ];
}

/*eslint complexity: ["error", 40]*/
function detConExtra(data: DetailsJ): DetET {
    const sub = data.deposit.registration?.submitter;
    const sup = data.deposit.registration?.supervisor;
    const dep_con = data.deposit.deposition?.depositor ?? [];
    const dep = dep_con
        .map((ent): [string, string] => [ent.name ?? '', ent.orcid ?? ''])
        .filter(([nam]) => nam !== '');
    const dep_ins = Array.from(
        new Set(dep_con.map((ent) => ent.institute ?? '').filter((val) => val !== ''))
    ).join(', ');
    const dep_ror = Array.from(
        new Set(dep_con.map((ent) => ent.ror ?? '').filter((val) => val !== ''))
    ).join(', ');
    return [
        [dep.map(([nam]) => nam).join(', '), dep.map(([, orcid]) => orcid).join(', ')],
        [dep_ins, dep_ror],
        data.deposit.deposition?.year,
        data.deposit.deposition?.designation ?? '',
        data.deposit.lastUpdate,
        data.deposit.isolation?.sample?.source ?? '',
        data.deposit.isolation?.sample?.date ?? '',
        data.deposit.isolation?.sample?.countryCode ?? '',
        [sub?.name ?? '', sub?.orcid ?? ''],
        [sub?.institute ?? '', sub?.ror ?? ''],
        data.deposit.registration?.date ?? '',
        [sup?.name ?? '', sup?.orcid ?? ''],
        [sup?.institute ?? '', sup?.ror ?? ''],
        data.deposit.history?.[0]?.encoded ?? '',
    ];
}

function getDetTuple(): string[] {
    return [
        'Available at',
        'Name',
        'Country',
        'Identifier',
        'Deposit id',
        'StrainRegistry',
        'Listed as type strain',
        'Listed taxonomy',
        'Depositor',
        'Depositor - institute',
        'Deposition year',
        'Deposition designation',
        'Last update',
        'Sample source',
        'Sampling date',
        'Sample country',
        'Submitter',
        'Submitter - institute',
        'Listed in StrainInfo',
        'Supervisor',
        'Supervisor - institute',
        'Strain history',
    ];
}

type EleT = number | boolean | string | string[];

function createTriplet(
    key: string | undefined,
    val: EleT | JSX.Element | undefined,
    spanN: number
): [string, EleT | JSX.Element, number] {
    const inVal = val;
    return [key ?? '', inVal ?? '/', spanN];
}

function createRegDep(data_keys: string[], data_values: (EleT | JSX.Element)[]) {
    const typeCulture = data_values[5] as boolean;
    if (typeCulture) {
        return [
            [
                createTriplet(data_keys[16], data_values[16], 2),
                createTriplet(data_keys[17], data_values[17], 4),
            ],
            [
                createTriplet(data_keys[19], data_values[19], 2),
                createTriplet(data_keys[20], data_values[20], 4),
            ],
        ];
    }
    return [
        [
            createTriplet(data_keys[8], data_values[8], 3),
            createTriplet(data_keys[11], data_values[11], 3),
        ],
        [
            createTriplet(data_keys[9], data_values[9], 3),
            createTriplet(data_keys[10], data_values[10], 3),
        ],
    ];
}

function wrapDetValues(
    data_keys: string[],
    data_values: (EleT | JSX.Element)[]
): [string, EleT | JSX.Element, number][][] {
    return [
        [
            createTriplet(data_keys[0], data_values[0], 1),
            createTriplet(data_keys[1], data_values[1], 3),
            createTriplet(data_keys[2], data_values[2], 2),
        ],
        [
            createTriplet(data_keys[3], data_values[3], 1),
            createTriplet(data_keys[7], data_values[7], 5),
        ],
        [
            createTriplet(data_keys[4], data_values[4], 1),
            createTriplet(data_keys[6], data_values[6], 2),
            createTriplet(data_keys[12], data_values[12], 3),
        ],
        [
            createTriplet(data_keys[13], data_values[13], 3),
            createTriplet(data_keys[14], data_values[14], 1),
            createTriplet(data_keys[15], data_values[15], 2),
        ],
        ...createRegDep(data_keys, data_values),
        [createTriplet(data_keys[21], data_values[21], 6)],
    ];
}

function flattenDetTto1dim(data: DetT): EleT[] {
    return [
        data[0][0],
        data[0][4],
        data[0][3],
        ...data.slice(1, 5),
        data[5][0],
        ...data.slice(6),
    ] as EleT[];
}

function createRelCon(data: PassJ): RelT[] {
    const relCon: RelT[] = [];
    const siDPM = new Map();
    let notDepIds = new Set();
    for (const dep of data.strain.relation.deposit) {
        siDPM.set(dep.siDP, dep.ccID);
        if (dep.ccID === undefined) {
            notDepIds.add(dep.siDP);
        }
    }
    for (const cul of Object.values(data.strain.relation.deposit)) {
        const toPush: RelT = [cul.siDP, cul.designation, cul.origin, siDPM.get(cul.siDP)];
        relCon.push(toPush);
    }
    const sortedRes = relCon.sort((first, second) => first[1].localeCompare(second[1]));
    const shI = [];
    for (const [ind, cul] of sortedRes.entries()) {
        if (notDepIds.has(cul[0])) {
            shI.push(ind);
        }
    }
    for (const ind of shI) {
        const buf = sortedRes.splice(ind, 1);
        sortedRes.unshift(...buf);
    }
    return sortedRes;
}

function createDesCon(data: PassJ): DesT[] {
    const desCon: DesT[] = [];
    if (data.strain.relation.designation === undefined) {
        return desCon;
    }
    return data.strain.relation.designation
        .slice()
        .sort((first, second) => first.localeCompare(second));
}

function createSeqCon(data: PassJ): SeqT[] {
    const res: SeqT[] = [];
    for (const seqEl of data.strain.sequence ?? []) {
        let type_ass: number | string = 0;
        if (seqEl.assemblyLevel !== undefined && seqEl.assemblyLevel !== '') {
            type_ass = seqEl.assemblyLevel;
        }
        const toPush: SeqT = [
            seqEl.accessionNumber,
            seqEl.deposit.map((cul) => [cul.designation, cul.siDP]),
            seqEl.description ?? '',
            seqEl.type,
            seqEl.length ?? type_ass,
            seqEl.year,
        ];
        res.push(toPush);
    }
    return res;
}

function getSeqTuple(assembly: boolean): string[] {
    return [
        'Accession number',
        'Deposit',
        'Description',
        assembly ? 'Level' : 'Length',
        'Year',
    ];
}

function createPubCon(data: PassJ): PubT[] {
    const res: PubT[] = [];
    for (const pubEl of data.strain.literature ?? []) {
        const toPush: PubT = [
            pubEl.doi ?? '',
            pubEl.title,
            pubEl.deposit.map((cul) => [cul.designation, cul.siDP]),
            pubEl.author ?? '',
            pubEl.publisher ?? '',
            pubEl.year,
        ];
        res.push(toPush);
    }
    return res;
}

function getArcTuple(): string[] {
    return ['DOI', 'Title', 'Date'];
}

function createArcCon(data: PassJ): ArcT[] {
    const res: ArcT[] = [];
    for (const pubEl of data.strain.archive) {
        const toPush: ArcT = [pubEl.doi, pubEl.title, pubEl.date];
        res.push(toPush);
    }
    return res;
}

function getPubTuple(): string[] {
    return ['Title', 'Deposit', 'Authors', 'Publisher', 'Year'];
}

function isPassJ(data: unknown): data is PassJ {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(typeof data === 'object') || data === null) {
        return false;
    }
    const toCh = data as PassJ;
    checkDifCon(toCh, ['strain']);
    checkDifCon(toCh.strain, ['siID', 'typeStrain']);
    for (const seqEl of toCh.strain.sequence ?? []) {
        checkDifCon(seqEl, ['accessionNumber', 'type', 'deposit']);
        for (const dep of seqEl.deposit) {
            checkDifCon(dep, ['siDP', 'designation']);
        }
    }
    for (const pubEl of toCh.strain.literature ?? []) {
        checkDifCon(pubEl, ['year', 'title', 'deposit']);
        for (const dep of pubEl.deposit) {
            checkDifCon(dep, ['siDP', 'designation']);
        }
    }
    checkDifCon(toCh.strain, ['archive']);
    for (const pubEl of toCh.strain.archive) {
        checkDifCon(pubEl, ['doi', 'title', 'date']);
    }
    for (const relDep of toCh.strain.relation.deposit) {
        checkDifCon(relDep, ['siDP', 'designation']);
    }
    return true;
}

function toArrPassRes(data: unknown): PassR {
    if (!isPassJ(data)) {
        throw new Known500Error('Unknown type provided for passport results');
    }
    return {
        overview: createOVCon(data),
        relations: createRelCon(data),
        designations: createDesCon(data),
        sequences: createSeqCon(data),
        publications: createPubCon(data),
        archive: createArcCon(data),
        allStrIds: createAllStrIds(data),
        altStrIds: createAltStrIds(data),
    };
}

function isSeaIndJ(data: unknown): data is SeaIndJ {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(typeof data === 'object') || data === null) {
        return false;
    }
    const toCh = data as SeaIndJ;
    checkDifCon(toCh, ['match', 'exact']);
    for (const elem of toCh.match) {
        checkDifCon(elem, ['fullKey', 'path', 'siID', 'strainCount']);
    }
    for (const elem of toCh.exact) {
        checkDifCon(elem, ['fullKey', 'path', 'siID', 'strainCount']);
    }
    return true;
}

function isSerSeaAllJ(check: unknown): check is SerSeaAllJ {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(typeof check === 'object') || check === null) {
        return false;
    }
    const toCh = check as SerSeaAllJ;
    checkDifCon(toCh, ['data', 'count']);
    const { count, data } = toCh;
    if (!(typeof count === 'number')) {
        return false;
    }
    if (!Array.isArray(data)) {
        return false;
    }
    return true;
}

function toArrIndSeaIndRes(data: unknown): SeaIndR {
    if (!isSeaIndJ(data)) {
        throw new Known500Error('Unknown type provided for search index results');
    }
    return {
        match: data.match.map((elem) => [
            elem.fullKey,
            elem.path,
            elem.siID,
            elem.strainCount,
        ]),
        exact: data.exact.map((elem) => [
            elem.fullKey,
            elem.path,
            elem.siID,
            elem.strainCount,
        ]),
    };
}

interface Maintain {
    maintenance: object;
}

function isServerStatus(data: unknown): data is ServerStatusInt {
    if (skipAPIchecks()) {
        return true;
    }
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    checkDifCon(data, ['private', 'maintenance', 'version']);
    checkDifCon((data as Maintain).maintenance, ['status', 'duration', 'zone']);
    return true;
}

function isInfoJ(data: unknown): data is InfoJ {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(typeof data === 'object') || data === null) {
        return false;
    }
    const toCh = data as InfoJ;
    checkDifCon(toCh, ['deposit']);
    checkDifCon(toCh.deposit, ['siDP', 'designation']);
    return true;
}

function toArrInfoRes(data: unknown): InfoR {
    if (!isInfoJ(data)) {
        throw new Known500Error('Unknown type provided for info results');
    }
    return [data.deposit.siDP, data.deposit.designation, data.deposit.taxon?.name ?? ''];
}

function getInfoTuple(): string[] {
    return ['Deposit id', 'Designation', 'Listed taxonomy'];
}

function getInfoDesTuple(): string {
    return 'Designation';
}

function isDetailsJ(data: unknown): data is DetailsJ {
    if (skipAPIchecks()) {
        return true;
    }
    if (!(typeof data === 'object') || data === null) {
        return false;
    }
    const toCh = data as DetailsJ;
    checkDifCon(toCh, ['deposit', 'strain']);
    checkDifCon(toCh.deposit, ['siDP', 'typeStrain', 'designation', 'lastUpdate']);
    checkDifCon(toCh.strain, ['siID']);
    return true;
}

function toArrDetailsRes(data: unknown): DetailsR {
    if (!isDetailsJ(data)) {
        throw new Known500Error('Unknown type provided for details results');
    }
    return [
        data.strain.siID,
        ...detConMain(data),
        ...detConExtra(data),
        data.deposit.relation ?? [],
    ];
}

function mapDetails2DetT(data: DetailsR): DetT {
    return data.slice(1, data.length - 1) as DetT;
}

function getApiToStr(api: string): string {
    const label = THESAURUS_MAP.get(api) ?? 'unknown';
    if (isSlimScreen()) {
        return getShortText(label);
    }
    return label;
}

function toArrSerSeaRes(data: unknown): SeaR {
    if (!isSerSeaR(data)) {
        throw new Known500Error('Unknown type provided for service search results');
    }
    return [...data.slice(0, 3), data[3] === 1, ENC.encode(data[4]), data[5]] as SeaR;
}

export {
    SEA_INPUT_COMB,
    toArrSeaRes,
    toArrSerSeaRes,
    isSerSeaAllJ,
    getSeaResTuple,
    toArrPassRes,
    getOVTuple,
    getDetTuple,
    getPubTuple,
    getSeqTuple,
    getApiToStr,
    toArrInfoRes,
    toArrDetailsRes,
    getInfoTuple,
    mapDetails2DetT,
    getInfoDesTuple,
    getArcTuple,
    wrapDetValues,
    flattenDetTto1dim,
    isServerStatus,
    toArrIndSeaIndRes,
    convertStrainStatusToEnum,
};
