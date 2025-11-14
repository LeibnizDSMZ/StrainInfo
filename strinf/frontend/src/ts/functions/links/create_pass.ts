import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import QApiCon from '@strinf/ts/constants/api/q_api';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import UIArgCon from '@strinf/ts/constants/api/ui_arg';

function createPassCall(cul_id: string | number): string {
    const def = `${UIArgCon.search}${cul_id}&${UIArgCon.qApi}${QApiCon.seaStrCulId}`;
    return `${UIApiCon.search}?${def}`;
}

function createStrainCall(str_id: string | number): string {
    return `${UIApiCon.strain}${str_id}`;
}

function createApiStrainCall(str_id: string | number): string {
    return `${QApiCon.strMax}${str_id}`;
}

function createStrainCultureCall(
    str_id: string | number,
    cul_id: number | string,
): string {
    return `${UIApiCon.strain}${str_id}?${IdAcrTagCon.depId}${cul_id}`;
}

export { createApiStrainCall, createPassCall, createStrainCall, createStrainCultureCall };
