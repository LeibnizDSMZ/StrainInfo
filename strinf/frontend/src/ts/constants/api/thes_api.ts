import QApiCon from '@strinf/ts/constants/api/q_api';
import createComb from '@strinf/ts/functions/arr/comb';

enum StatTags {
    st_str = 'Strains',
    st_typ_str = 'Type strains',
    st_doi = 'StrainInfo DOIs',
    st_typ_cul = 'StrainRegistry',
    st_cul = 'Deposits',
    st_des = 'Designations',
    st_spe = 'Species names',
    str_min = 'Strain ID [MIN]',
    str_max = 'Strain ID [MAX]',
    str_avg = 'Strain ID [AVG]',
    cul_avg = 'Deposit ID [AVG]',
    cul_min = 'Deposit ID [MIN]',
    cul_max = 'Deposit ID [MAX]',
    str_arc = 'Archive [Strain ID]',
    sea_seq_acc = 'Seq. acc. number',
    sea_str_id = 'Strain ID',
    sea_cul_id = 'Deposit ID',
    sea_brc = 'Culture collection',
    sea_tax_nam = 'Taxonomy',
    sea_str_no = 'Registered strain designation',
    sea_str_des = 'Strain designation',
    sea_tax_brc = 'Taxonomy or collection',
    sea_tax_des = 'Taxonomy or designation',
    pass_str = 'Passport [Strain ID]',
    strain = 'Strain',
    all_strains = 'All strains',
}

const THESAURUS_SH_L: [string, string][] = [
    [StatTags.sea_tax_nam, 'Tax.'],
    [StatTags.sea_brc, 'CC'],
    [StatTags.sea_str_des, 'Str. des.'],
] as const;

const THESAURUS_L: [string, string][] = [
    [QApiCon.cntStr, StatTags.st_str],
    [QApiCon.cntTStr, StatTags.st_typ_str],
    [QApiCon.cntArc, StatTags.st_doi],
    [QApiCon.cntTCul, StatTags.st_typ_cul],
    [QApiCon.cntCul, StatTags.st_cul],
    [QApiCon.cntDes, StatTags.st_des],
    [QApiCon.cntSpe, StatTags.st_spe],
    [QApiCon.arcStrSiId, StatTags.str_arc],
    [QApiCon.strMin, StatTags.str_min],
    [QApiCon.strMax, StatTags.str_max],
    [QApiCon.strAvg, StatTags.str_avg],
    [QApiCon.culAvg, StatTags.cul_avg],
    [QApiCon.culMin, StatTags.cul_min],
    [QApiCon.culMax, StatTags.cul_max],
    [QApiCon.seaCulStrId, StatTags.sea_str_id],
    [QApiCon.seaStrCulId, StatTags.sea_cul_id],
    [QApiCon.seaStrSeqAcc, StatTags.sea_seq_acc],
    [QApiCon.seaCulSeqAcc, StatTags.sea_seq_acc],
    [QApiCon.seaStrTaxName, StatTags.sea_tax_nam],
    [QApiCon.seaCulTaxName, StatTags.sea_tax_nam],
    [QApiCon.seaStrBrc, StatTags.sea_brc],
    [QApiCon.seaCulBrc, StatTags.sea_brc],
    [QApiCon.seaStrCCNo, StatTags.sea_str_no],
    [QApiCon.seaCulCCNo, StatTags.sea_str_no],
    [QApiCon.seaStrStrDes, StatTags.sea_str_des],
    [QApiCon.seaCulStrDes, StatTags.sea_str_des],
    [QApiCon.seaStrAll, StatTags.all_strains],
    ...createComb([QApiCon.seaStrBrc, QApiCon.seaStrTaxName], StatTags.sea_tax_brc),
    ...createComb([QApiCon.seaCulBrc, QApiCon.seaCulTaxName], StatTags.sea_tax_brc),
    ...createComb([QApiCon.seaStrStrDes, QApiCon.seaStrTaxName], StatTags.sea_tax_des),
    ...createComb([QApiCon.seaCulStrDes, QApiCon.seaCulTaxName], StatTags.sea_tax_des),
] as const;
const THESAURUS_MAP = new Map<string, string>(THESAURUS_L);
const THESAURUS_SHORT_MAP = new Map<string, string>(THESAURUS_SH_L);

function getShortText(text: string): string {
    return THESAURUS_SHORT_MAP.get(text) ?? text;
}

const SEARCH_PATH_MAP: [string, string][] = [
    [QApiCon.seaStrSeqAcc, 'sequence'],
    [QApiCon.seaStrTaxName, 'taxonomy'],
    [QApiCon.seaStrBrc, 'collection'],
    [QApiCon.seaStrCCNo, 'ccno'],
    [QApiCon.seaStrStrDes, 'designation'],
    ...createComb([QApiCon.seaStrBrc, QApiCon.seaStrTaxName], 'taxonomy_collection'),
    ...createComb([QApiCon.seaStrStrDes, QApiCon.seaStrTaxName], 'taxonomy_designation'),
] as const;

function getSeaPathFApi(api: string): string {
    for (const [qapi, sea_p] of SEARCH_PATH_MAP) {
        if (qapi === api) {
            return sea_p;
        }
    }
    return '';
}

function getSeaApiFPath(path: string): string {
    for (const [qapi, sea_p] of SEARCH_PATH_MAP) {
        if (path === sea_p) {
            return qapi;
        }
    }
    return '';
}

export default THESAURUS_MAP;
export { getSeaApiFPath, getSeaPathFApi, getShortText, StatTags };
