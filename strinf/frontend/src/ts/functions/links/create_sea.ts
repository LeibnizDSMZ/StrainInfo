import type { SeaInputMap } from '@strinf/ts/interfaces/api/mapped';
import QApiCon from '@strinf/ts/constants/api/q_api';
import { getSeaPathFApi } from '@strinf/ts/constants/api/thes_api';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import UIArgCon from '@strinf/ts/constants/api/ui_arg';
import Known500Error from '@strinf/ts/errors/known/500';
import KnownInWarnError from '@strinf/ts/errors/known/in_warn';
import { SEA_INPUT_COMB } from '@strinf/ts/functions/api/map';
import { createPassCall, createStrainCall } from '@strinf/ts/functions/links/create_pass';

function parseSeaStr<T extends string | number>(sea: T | T[]): string {
    if (Array.isArray(sea) || `${sea}`.length === 0) {
        throw new KnownInWarnError('no input given');
    }
    return `${sea}`;
}

function checkSeaTags(sea: string): SeaInputMap {
    for (const taEl of SEA_INPUT_COMB) {
        try {
            taEl.check(sea);
            return { qApi: taEl.api, qArg: taEl.getArgs(sea) };
        }
        catch (err) {
            if (err instanceof KnownInWarnError) {
                throw err;
            }
        }
    }
    throw new KnownInWarnError(
        `${sea} could not been matched to any searchable elements`,
    );
}

function parseToPath(api: string, args: string): string {
    const sea_p = getSeaPathFApi(api);
    if (sea_p !== '') {
        return `${UIApiCon.search}/${sea_p}/${args}`;
    }
    return `${UIApiCon.search}?${UIArgCon.search}${args}&${UIArgCon.qApi}${api}`;
}

function createSeaInCall(api: string, args: string): string {
    switch (api) {
        case QApiCon.culMax:
            return createPassCall(args);
        case QApiCon.seaCulStrId:
            return createStrainCall(args);
        case QApiCon.culMin:
        case QApiCon.culAvg:
            throw new Known500Error(
                `${QApiCon.culMin} or ${QApiCon.culAvg} api [${api}] `
                + 'given in a search pass environment',
            );
        default:
            return parseToPath(api, args);
    }
}

function createSeaCall<T extends string | number>(search: T | T[]): string {
    const parsedStr = parseSeaStr(search);
    const callArgs = checkSeaTags(parsedStr);
    return createSeaInCall(callArgs.qApi, callArgs.qArg);
}

function createKnownSeaCall(search: string, qApi = ''): string {
    if (qApi === '') {
        return createSeaCall(search);
    }
    return createSeaInCall(qApi, encodeURIComponent(search));
}

export default createSeaCall;
export { checkSeaTags, createKnownSeaCall };
