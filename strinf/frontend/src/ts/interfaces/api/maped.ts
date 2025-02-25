import type {
    DepositAvg,
    DepositMin,
    StrainStrMin,
    DepositStrMin,
    StrainStrAvg,
    SeaIndCon,
} from '@strinf/ts/interfaces/api/data';

interface SeaInputMap {
    qApi: string;
    qArg: string;
}

interface SeaInputCombEl {
    getArgs: (input: string) => string;
    check: (input: string) => void;
    api: string;
}

type ChartData<T> = Record<string, T>;

interface ChartKeyXY {
    x: string;
    y: string;
}

interface ApiChanInt {
    createApiCall: (extra: string) => string;
}

// -------------------------------

interface SeaResJ {
    strain: StrainStrMin;
}

interface SerSeaAllJ {
    data: unknown[];
    count: number;
}

interface PassJ {
    strain: StrainStrAvg;
}

interface SeaIndJ {
    exact: SeaIndCon[];
    match: SeaIndCon[];
}

interface DetailsJ {
    deposit: DepositAvg;
    strain: DepositStrMin;
}

interface InfoJ {
    deposit: DepositMin;
}

// culture_id, strain_number, species [culture]
type InfoR = [number, string, string];
// culture col. no., culture id,
// taxon name culture, type_strain

// strain id, designation[], taxon name strain, type_strain, sample source cc
type SeaR = [number, string[], string, boolean, Uint8Array, number];
type SerSeaR = [number, string[], string, number, string, number];
// strain_id, catalog, strain_number, culture_id, type_culture, type_strain,
// species [culture],
// depositor, depositor_institute, deposit_year, deposit_designation, last updated
// isolation source, date, location
// submitter, institute, registration date
// supervisor, institute
// known related designations
type DetailsR = [
    number,
    [string, string, string, string, string, string],
    string,
    number,
    boolean,
    boolean,
    [string, number | undefined, number | undefined],
    [string, string],
    [string, string],
    number | undefined,
    string,
    string,
    string,
    string,
    string,
    [string, string],
    [string, string],
    string,
    [string, string],
    [string, string],
    string,
    string[],
];

// culture id, culture col. no., origin
type RelT = [number, string, number | undefined, number | undefined];
// culture col. no.
type DesT = string;
// strain id, type strain, [species (strain), lpsn, ncbi], bacdive, doi
type OvT = [
    number,
    boolean,
    [string, number | undefined, number | undefined],
    number | undefined,
    string,
];
// doi, title, authors, journal, year
type PubT = [string, string, [string, number][], string, string, number | undefined];
// seq acc, ccnos, description, type, sequence length, date
type SeqT = [
    string,
    [string, number][],
    string,
    string,
    number | string,
    number | undefined,
];
// catalog, strain_number, culture_id, type_culture, type_strain,
// [species (culture), lpsn, ncbi],
// depositor, depositor_institute, deposit_year, deposit_designation, last update
// isolation source, date, location,
// submitter, institute, registration date
// supervisor, institute
// strain history encoded
type DetMT = [
    [string, string, string, string, string, string],
    string,
    number,
    boolean,
    boolean,
    [string, number | undefined, number | undefined],
];
type DetET = [
    [string, string],
    [string, string],
    number | undefined,
    string,
    string,
    string,
    string,
    string,
    [string, string],
    [string, string],
    string,
    [string, string],
    [string, string],
    string,
];
type DetT = [...DetMT, ...DetET];
// doi, title, date
type ArcT = [string, string, string];

type SIndT = [string, string, number, number];

interface PassR {
    overview: OvT;
    relations: RelT[];
    designations: DesT[];
    sequences: SeqT[];
    publications: PubT[];
    archive: ArcT[];
    allStrIds: number[];
    altStrIds: number[];

    clear: () => void;
}

interface SeaIndR {
    exact: SIndT[];
    match: SIndT[];
}

interface MaintenanceInt {
    status: boolean;
    duration: string;
    zone: string;
}
interface ServerStatusInt {
    private: boolean;
    version: string;
    maintenance: MaintenanceInt;
}

export type {
    ServerStatusInt,
    ApiChanInt,
    ChartData,
    ChartKeyXY,
    SeaInputMap,
    SeaInputCombEl,
    SeaResJ,
    SerSeaAllJ,
    SeaR,
    SerSeaR,
    PassJ,
    PassR,
    InfoR,
    InfoJ,
    DetailsR,
    DetailsJ,
    SeqT,
    PubT,
    DetET,
    DetMT,
    DetT,
    OvT,
    RelT,
    DesT,
    ArcT,
    SeaIndR,
    SeaIndJ,
    SIndT,
};
