import type { ApiChanInt, DetailsR } from '@strinf/ts/interfaces/api/mapped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/details';
import QApiCon from '@strinf/ts/constants/api/q_api';
import Known404Error from '@strinf/ts/errors/known/404';
import Known500Error from '@strinf/ts/errors/known/500';
import { getApiToStr, toArrDetailsRes } from '@strinf/ts/functions/api/map';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespArr, fetchRetry } from '@strinf/ts/functions/http/http';

class DetailsCon {
    private readonly apiCall: ApiChanInt;

    constructor(apiCall: ApiChanInt) {
        this.apiCall = apiCall;
    }

    private static checkDetails(
        cha: ViewChanInt,
        json: DetailsR[],
        args: number[],
        api: string,
    ): void {
        if (json.length > 0) {
            cha.res(json);
        }
        else {
            throw new Known404Error(getApiToStr(api), `${args}`);
        }
    }

    private runDetApi(cha: ViewChanInt, api: string, args: number[]): void {
        const call = this.apiCall.createApiCall(`${api}${args.join(',')}`);
        fetchRetry(call)
            .then(async resp => checkRespArr<DetailsR>(resp, toArrDetailsRes))
            .then((json: DetailsR[]) => {
                DetailsCon.checkDetails(cha, json, args, api);
            })
            .catch((err: unknown) => {
                onPrError(err);
            });
    }

    public initDetails(cha: ViewChanInt, args: number[], api: string): void {
        const cApi = api as unknown as QApiCon;
        if (QApiCon.culAvg === cApi) {
            this.runDetApi(cha, api, args);
        }
        else {
            onPrError(new Known500Error(`Unknown arguments detected: ${cApi}`));
        }
    }
}

export default DetailsCon;
