import type { DataCon } from '@strinf/ts/interfaces/dom/global';
import Known500Error from '@strinf/ts/errors/known/500';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespArr, fetchRetry } from '@strinf/ts/functions/http/http';

async function crStat(call: string, name: string): Promise<DataCon<number>> {
    const res = fetchRetry(call)
        .then(async resp => checkRespArr<number>(resp, num => Number(num)))
        .then((json: number[]): DataCon<number> => {
            const [resNo] = json;
            if (resNo === undefined) {
                throw new Known500Error(`No value for stat ${name} found`);
            }
            return {
                id: name,
                data: resNo,
            };
        });
    res.catch(onPrError);
    return res;
}

export default crStat;
