import type {
    DetailsJT,
    InfoDJT,
    InfoSJT,
    PassJT,
    SeaIndJT,
    SerSeaAllJT,
    SerSeaEleT,
    ServerStatusJT,
} from '@strinf/ts/interfaces/api/data';
import type {
    ArcT,
    DesT,
    DetailsR,
    DetET,
    DetMT,
    DetT,
    InfoR,
    InfoS,
    OvT,
    PassR,
    PubT,
    RelT,
    SeaInputCombEl,
    SeaR,
    SeqT,
} from '@strinf/ts/interfaces/api/mapped';
import type { JSX } from 'preact';
import CONFIG from '@strinf/ts/configs/config';
import { DepositStatus, StrainStatus } from '@strinf/ts/constants/api/data';
import QApiCon from '@strinf/ts/constants/api/q_api';
import THESAURUS_MAP, { getShortText } from '@strinf/ts/constants/api/thes_api';
import getSynEqStruct from '@strinf/ts/constants/des/uniq_des';
import {
    SR_BRC,
    SR_CUL_ID,
    SR_DES,
    SR_SEQ_ACC,
    SR_STR_ID,
    SR_TAX,
} from '@strinf/ts/constants/regexp/sea_reg';
import Known500Error from '@strinf/ts/errors/known/500';
import { isSlimScreen } from '@strinf/ts/functions/misc/screen';
import {
    DetailsJ,
    InfoDJ,
    InfoSJ,
    PassJ,
    SeaIndJ,
    SerSeaAllJ,
    SerSeaEle,
    ServerStatusJ,
} from '@strinf/ts/interfaces/api/data';

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
        api: QApiCon.seaStrTaxName,
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
        api: `${QApiCon.seaStrTaxName},${QApiCon.seaStrStrDes}`,
    },
];

function isZodEnabled(): boolean {
    return !CONFIG.production;
}

const ENC = new TextEncoder();

function convertStrainStatusToEnum(status: number): StrainStatus {
    if (status === 0) {
        return StrainStatus.err;
    }
    if (status === 1) {
        return StrainStatus.pubOn;
    }
    if (status === 2) {
        return StrainStatus.dep;
    }
    return StrainStatus.pubOff;
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

function createOVCon(data: PassJT): OvT {
    return [
        data.strain.siID,
        data.strain.typeStrain,
        [data.strain.taxon?.name ?? '', data.strain.taxon?.lpsn, data.strain.taxon?.ncbi],
        data.strain.bdID,
        data.strain.doi,
    ];
}

function createAllStrIds(data: PassJT): number[] {
    return [data.strain.siID, ...(data.strain.merged ?? [])];
}

function createAltStrIds(data: PassJT): number[] {
    return data.strain.alternative ?? [];
}

function getOVTuple(): string[] {
    return ['Persistent link - DOI', 'Type strain', 'Taxonomy', 'More about this strain'];
}

function detConMain(data: DetailsJT): DetMT {
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
            data.deposit.cultureCollection?.deprecated ?? false,
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

/* eslint complexity: ["error", 40] */
function detConExtra(data: DetailsJT): DetET {
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
        data.deposit.status === DepositStatus.err,
    ];
}

function getDetTuple(error: boolean): string[] {
    return [
        error ? 'Status' : 'Available at',
        'Collection',
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

function createRelCon(data: PassJT): RelT[] {
    const relCon: RelT[] = [];
    const siDPM = new Map();
    const notDepIds = new Set();
    for (const dep of data.strain.relation.deposit) {
        siDPM.set(dep.siDP, dep.ccID);
        if (dep.ccID === undefined) {
            notDepIds.add(dep.siDP);
        }
    }
    for (const cul of Object.values(data.strain.relation.deposit)) {
        const toPush: RelT = [
            cul.siDP,
            cul.designation,
            cul.origin,
            siDPM.get(cul.siDP),
            cul.erroneous,
        ];
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

function createDesCon(data: PassJT): DesT[] {
    const desCon: DesT[] = [];
    if (data.strain.relation.designation === undefined) {
        return desCon;
    }
    return data.strain.relation.designation
        .slice()
        .sort((first, second) => first.localeCompare(second));
}

function createSeqCon(data: PassJT): SeqT[] {
    const res: SeqT[] = [];
    for (const seqEl of data.strain.sequence ?? []) {
        let type_ass: number | string = 0;
        if (seqEl.assemblyLevel !== undefined) {
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

function createPubCon(data: PassJT): PubT[] {
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

function createArcCon(data: PassJT): ArcT[] {
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

function isArrPassRes(data: unknown): data is PassJT {
    if (isZodEnabled()) {
        PassJ.parse(data);
    }
    return true;
}

function toArrPassRes(data: unknown): PassR {
    if (!isArrPassRes(data)) {
        throw new Known500Error('Wrong data type received!');
    }
    const pData = data;
    return {
        overview: createOVCon(pData),
        relations: createRelCon(pData),
        designations: createDesCon(pData),
        sequences: createSeqCon(pData),
        publications: createPubCon(pData),
        archive: createArcCon(pData),
        allStrIds: createAllStrIds(pData),
        altStrIds: createAltStrIds(pData),
        clear() {
            this.overview.splice(0, this.overview.length);
            this.relations.splice(0, this.relations.length);
            this.designations.splice(0, this.designations.length);
            this.sequences.splice(0, this.sequences.length);
            this.publications.splice(0, this.publications.length);
            this.archive.splice(0, this.archive.length);
            this.allStrIds.splice(0, this.allStrIds.length);
            this.altStrIds.splice(0, this.altStrIds.length);
        },
    };
}

function isSerSeaAllJ(data: unknown): data is SerSeaAllJT {
    if (isZodEnabled()) {
        SerSeaAllJ.parse(data);
    }
    return true;
}

function isSeaIndJ(data: unknown): data is SeaIndJT {
    if (isZodEnabled()) {
        SeaIndJ.parse(data);
    }
    return true;
}

function toArrIndSeaIndRes(data: unknown): SeaIndJT {
    if (!isSeaIndJ(data)) {
        throw new Known500Error('Wrong data type received!');
    }
    return data;
}

function isServerStatus(data: unknown): data is ServerStatusJT {
    if (isZodEnabled()) {
        ServerStatusJ.parse(data);
    }
    return true;
}

function isInfoDJ(data: unknown): data is InfoDJT {
    if (isZodEnabled()) {
        InfoDJ.parse(data);
    }
    return true;
}

function toArrInfoDepRes(data: unknown): InfoR {
    if (!isInfoDJ(data)) {
        throw new Known500Error('Wrong data type received!');
    }
    return [
        data.deposit.siDP,
        data.deposit.designation,
        data.deposit.taxon?.name ?? '',
        data.deposit.status === DepositStatus.err ||
            (data.deposit.cultureCollection?.deprecated ?? false),
    ];
}
function isInfoSJ(data: unknown): data is InfoSJT {
    if (isZodEnabled()) {
        InfoSJ.parse(data);
    }
    return true;
}

function toArrInfoStrRes(data: unknown, oriDes: string[]): InfoS {
    if (!isInfoSJ(data)) {
        throw new Known500Error('Wrong data type received!');
    }
    const oriInd = new Set(oriDes.map((des) => getSynEqStruct(des)));
    const designations = [
        ...data.strain.relation.deposit.map((des) => des.designation),
        ...(data.strain.relation.designation ?? []),
    ];
    return [
        data.strain.siID,
        data.strain.taxon?.name ?? 'UNKNOWN',
        data.strain.relation.deposit.map((dat) => dat.designation).join(','),
        designations
            .map((des) => [getSynEqStruct(des), des])
            .filter(([ind]) => ind != null && oriInd.has(ind))
            .map(([, des]) => des)
            .join(','),
    ];
}

function getInfoDepTuple(): string[] {
    return ['Deposit id', 'Designation', 'Listed taxonomy', 'Status'];
}

function getInfoStrTuple(): string[] {
    return ['Strain id', 'Taxonomy', 'Designations', 'Overlapping designations'];
}

function getInfoDesTuple(): string {
    return 'Designation';
}
function isDetailsJ(data: unknown): data is DetailsJT {
    if (isZodEnabled()) {
        DetailsJ.parse(data);
    }
    return true;
}

function toArrDetailsRes(data: unknown): DetailsR {
    if (!isDetailsJ(data)) {
        throw new Known500Error('Wrong data type received!');
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

function isSerSeaEle(data: unknown): data is SerSeaEleT {
    if (isZodEnabled()) {
        SerSeaEle.parse(data);
    }
    return true;
}

function toSeaResEle(data: SerSeaEleT): SeaR {
    return [...data.slice(0, 3), data[3] === 1, ENC.encode(data[4]), data[5]] as SeaR;
}

function toArrSerSeaRes(data: unknown): SeaR {
    if (!isSerSeaEle(data)) {
        throw new Known500Error('Wrong data type received!');
    }
    return toSeaResEle(data);
}

function toArrSerSeaResSim(dataCon: SerSeaAllJT): SeaR[] {
    return dataCon.data.map((val) => toSeaResEle(val));
}

export {
    convertStrainStatusToEnum,
    flattenDetTto1dim,
    getApiToStr,
    getArcTuple,
    getDetTuple,
    getInfoDepTuple,
    getInfoDesTuple,
    getInfoStrTuple,
    getOVTuple,
    getPubTuple,
    getSeaResTuple,
    getSeqTuple,
    isSerSeaAllJ,
    isServerStatus,
    mapDetails2DetT,
    SEA_INPUT_COMB,
    toArrDetailsRes,
    toArrIndSeaIndRes,
    toArrInfoDepRes,
    toArrInfoStrRes,
    toArrPassRes,
    toArrSerSeaRes,
    toArrSerSeaResSim,
    wrapDetValues,
};
