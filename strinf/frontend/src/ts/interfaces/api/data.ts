import type { infer as z_infer } from 'zod/mini';
import type { ParsePayload } from 'zod/v4/core';
import {
    AssemblyLvl,
    DataSource,
    DepositStatus,
    SeqType,
    StrainStatus,
} from '@strinf/ts/constants/api/data';
import { BETWEEN_R } from '@strinf/ts/functions/parse/date';
import {
    array,
    boolean,
    length,
    literal,
    minimum,
    minLength,
    number,
    object,
    optional,
    strictObject,
    string,
    tuple,
    union,
    url,
    config as z_config,
    enum as z_enum,
} from 'zod/mini';

// config

z_config({
    jitless: true,
});

// check functions
function checkDate(ctx: ParsePayload<string>, date: string): void {
    if (Number.isNaN(Date.parse(date))) {
        ctx.issues.push({
            code: 'invalid_format',
            message: 'Date format error',
            input: date,
            format: 'Date',
        });
    }
}
function checkDateRKMSCtx(ctx: ParsePayload<string>): void {
    const date = ctx.value;
    const btw = BETWEEN_R.exec(date);
    if (date.startsWith('/')) {
        checkDate(ctx, date.slice(1));
    } else if (date.endsWith('/')) {
        checkDate(ctx, date.slice(0, -1));
    } else if (btw?.[1] !== undefined && btw[2] !== undefined) {
        checkDate(ctx, btw[1]);
        checkDate(ctx, btw[2]);
    } else {
        checkDate(ctx, date);
    }
}

function checkDateCtx(ctx: ParsePayload<string>): void {
    checkDate(ctx, ctx.value);
}
// --- parts

const EntityCon = strictObject({
    name: optional(string().check(minLength(1))),
    institute: optional(string().check(minLength(1))),
    countryCode: optional(string().check(length(2))),
    place: optional(array(string().check(minLength(1)))),
    ror: optional(string().check(minLength(1))),
    orcid: optional(string().check(minLength(1))),
});

const RegConMin = strictObject({
    date: string().check(checkDateCtx),
    submitter: optional(EntityCon),
});

const RegConMax = strictObject({
    ...RegConMin.shape,
    supervisor: optional(EntityCon),
});

const DepCon = strictObject({
    designation: optional(string().check(minLength(1))),
    origin: optional(number().check(minimum(1))),
    year: optional(number().check(minimum(1700))),
    depositor: optional(array(EntityCon)),
});

const SamSlimCon = strictObject({
    source: optional(string().check(minLength(1))),
    countryCode: optional(string().check(length(2))),
});

const SamCon = strictObject({
    ...SamSlimCon.shape,
    date: optional(string().check(checkDateRKMSCtx)),
    place: optional(array(string().check(minLength(1)))),
});

const IsoCon = strictObject({
    sample: optional(SamCon),
    isolator: optional(array(EntityCon)),
});

const ArcCon = strictObject({
    doi: string().check(minLength(1)),
    date: string().check(checkDateCtx),
    title: string().check(minLength(1)),
});

const TaxonCon = strictObject({
    name: string().check(minLength(1)),
    ncbi: optional(number().check(minimum(1))),
    lpsn: optional(number().check(minimum(1))),
});

const UrlCon = strictObject({
    url: url(),
    online: boolean(),
});

const HistCon = strictObject({
    dataSource: z_enum(DataSource),
    encoded: string().check(minLength(1)),
});

const CCConMin = strictObject({
    ccID: number().check(minimum(1)),
    name: string().check(minLength(1)),
    code: string().check(minLength(1)),
    deprecated: boolean(),
});

const CCCon = strictObject({
    ...CCConMin.shape,
    countryCode: string().check(length(2)),
    ror: optional(string().check(minLength(1))),
    gbif: optional(string().check(minLength(1))),
    homepage: optional(UrlCon),
    active: boolean(),
});

const DepositIdCon = strictObject({
    siDP: number().check(minimum(1)),
    designation: string().check(minLength(1)),
});

const RelCulCon = strictObject({
    ...DepositIdCon.shape,
    erroneous: boolean(),
    origin: optional(number().check(minimum(1))),
    ccID: optional(number().check(minimum(1))),
});

const RelCon = strictObject({
    deposit: array(RelCulCon).check(minLength(1)),
    designation: optional(array(string().check(minLength(1))).check(minLength(1))),
});

const SeqCon = strictObject({
    accessionNumber: string().check(minLength(1)),
    type: z_enum(SeqType),
    deposit: array(DepositIdCon).check(minLength(1)),
    length: optional(number().check(minimum(1))),
    assemblyLevel: optional(z_enum(AssemblyLvl)),
    year: optional(number().check(minimum(1700))),
    description: optional(string().check(minLength(1))),
});

const PubCon = strictObject({
    title: string().check(minLength(1)),
    year: number().check(minimum(1700)),
    author: optional(string().check(minLength(1))),
    publisher: optional(string().check(minLength(1))),
    pubmed: optional(number().check(minimum(1))),
    pmc: optional(number().check(minimum(1))),
    issn: optional(string().check(minLength(1))),
    doi: optional(string().check(minLength(1))),
    deposit: array(DepositIdCon).check(minLength(1)),
});

// --- main container

const DepositMin = strictObject({
    siDP: number().check(minimum(1)),
    designation: string().check(minLength(1)),
    cultureCollection: optional(CCConMin),
    catalogue: optional(UrlCon),
    status: z_enum(DepositStatus),
    typeStrain: boolean(),
    lastUpdate: string().check(checkDateCtx),
    dataSource: array(z_enum(DataSource)).check(minLength(1)),
    registration: optional(RegConMin),
    taxon: optional(TaxonCon),
});

const DepositAvg = strictObject({
    ...DepositMin.shape,
    relation: optional(array(string().check(minLength(1))).check(minLength(1))),
    history: optional(array(HistCon)),
    bdID: optional(array(number().check(minimum(1))).check(minLength(1))),
    registration: optional(RegConMax),
    cultureCollection: optional(CCCon),
    deposition: optional(DepCon),
    isolation: optional(IsoCon),
});

const DepositStrainMin = strictObject({
    siID: number().check(minimum(1)),
    doi: string().check(minLength(1)),
    merged: optional(array(number().check(minimum(1))).check(minLength(1))),
    typeStrain: boolean(),
});

const StrainMin = strictObject({
    siID: number().check(minimum(1)),
    doi: string().check(minLength(1)),
    merged: optional(array(number().check(minimum(1))).check(minLength(1))),
    typeStrain: boolean(),
    status: z_enum(StrainStatus),
    relation: RelCon,
    taxon: optional(TaxonCon),
    sample: optional(SamSlimCon),
    bdID: optional(number().check(minimum(1))),
});

const StrainAvg = strictObject({
    ...StrainMin.shape,
    alternative: optional(array(number().check(minimum(1))).check(minLength(1))),
    sequence: optional(array(SeqCon).check(minLength(1))),
    literature: optional(array(PubCon).check(minLength(1))),
    archive: array(ArcCon).check(minLength(1)),
    relation: RelCon,
});

const SeaIndCon = strictObject({
    fullKey: string().check(minLength(1)),
    path: string().check(minLength(1)),
    siID: number().check(minimum(1)),
    strainCount: number().check(minimum(1)),
});

const SerSeaEle = tuple([
    number().check(minimum(1)),
    array(string().check(minLength(1))).check(minLength(1)),
    string(),
    union([literal(0), literal(1)]),
    union([literal(''), string().check(length(2))]),
    union([literal(0), literal(1), literal(2), literal(3)]),
]);

// ---- mapped

const SeaIndJ = strictObject({
    exact: array(SeaIndCon),
    match: array(SeaIndCon),
});
const SerSeaAllJ = strictObject({
    count: number().check(minimum(1)),
    data: array(SerSeaEle).check(minLength(1)),
    next: optional(number().check(minimum(1))),
});

const PassJ = object({
    strain: StrainAvg,
});

const DetailsJ = strictObject({
    deposit: DepositAvg,
    strain: DepositStrainMin,
});

const InfoDJ = object({
    deposit: DepositMin,
});

const InfoSJ = object({
    strain: StrainMin,
});

const MaintenanceInt = strictObject({
    status: boolean(),
    duration: string(),
    zone: string(),
});

const ServerStatusJ = strictObject({
    private: boolean(),
    version: string().check(minLength(7)),
    maintenance: MaintenanceInt,
});

type ServerStatusJT = z_infer<typeof ServerStatusJ>;
type DetailsJT = z_infer<typeof DetailsJ>;
type PassJT = z_infer<typeof PassJ>;
type SerSeaAllJT = z_infer<typeof SerSeaAllJ>;
type SerSeaEleT = z_infer<typeof SerSeaEle>;
type SeaIndJT = z_infer<typeof SeaIndJ>;
type SeaIndConT = z_infer<typeof SeaIndCon>;
type InfoDJT = z_infer<typeof InfoDJ>;
type InfoSJT = z_infer<typeof InfoSJ>;
export type {
    DetailsJT,
    InfoDJT,
    InfoSJT,
    PassJT,
    SeaIndConT,
    SeaIndJT,
    SerSeaAllJT,
    SerSeaEleT,
    ServerStatusJT,
};

export { DetailsJ, InfoDJ, InfoSJ, PassJ, SeaIndJ, SerSeaAllJ, SerSeaEle, ServerStatusJ };
