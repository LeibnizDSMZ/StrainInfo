import type { ApiChanInt, InfoR, InfoS } from '@strinf/ts/interfaces/api/mapped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/info';
import QApiCon from '@strinf/ts/constants/api/q_api';
import Known404Error from '@strinf/ts/errors/known/404';
import Known500Error from '@strinf/ts/errors/known/500';
import { getApiToStr } from '@strinf/ts/functions/api/map';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespArr, fetchRetry } from '@strinf/ts/functions/http/http';

class InfoCon<T extends InfoR | InfoS> {
    private readonly apiCall: ApiChanInt;
    private readonly parser: (data: unknown) => T;

    constructor(apiCall: ApiChanInt, parser: (data: unknown) => T) {
        this.apiCall = apiCall;
        this.parser = parser;
    }

    private static checkInfo<T extends InfoR | InfoS>(
        cha: ViewChanInt<T>,
        json: T[],
        args: number[],
        api: string
    ): void {
        if (json.length > 0) {
            cha.res(json);
        } else {
            throw new Known404Error(getApiToStr(api), `${args}`);
        }
    }

    private runInfoApi(cha: ViewChanInt<T>, api: string, args: number[]): void {
        const call = this.apiCall.createApiCall(`${api}${args}`);
        fetchRetry(call)
            .then(async (resp) => checkRespArr<T>(resp, this.parser))
            .then((json: T[]) => {
                InfoCon.checkInfo(cha, json, args, api);
            })
            .catch((err: unknown) => {
                onPrError(err);
            });
    }

    public initInfo(cha: ViewChanInt<T>, args: number[], api: string): void {
        const cApi = api as unknown as QApiCon;
        if (QApiCon.culMin === cApi || QApiCon.strMin === cApi) {
            this.runInfoApi(cha, api, args);
        } else {
            onPrError(new Known500Error(`Unknown arguments detected: ${cApi}`));
        }
    }
}

export default InfoCon;
