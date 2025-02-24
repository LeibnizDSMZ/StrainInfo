import QApiCon from '@strinf/ts/constants/api/q_api';
import LoadT from '@strinf/ts/constants/type/LoadT';
import Known404Error from '@strinf/ts/errors/known/404';
import Known500Error from '@strinf/ts/errors/known/500';
import { getApiToStr, toArrPassRes } from '@strinf/ts/functions/api/map';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespArr, fetchRetry } from '@strinf/ts/functions/http/http';
import type { ApiChanInt, PassR } from '@strinf/ts/interfaces/api/maped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/pass';
import type { LoadFS } from '@strinf/ts/interfaces/dom/global';

class PassCon {
    private readonly apiCall: ApiChanInt;

    constructor(apiCall: ApiChanInt) {
        this.apiCall = apiCall;
    }

    private static checkPass(
        cha: ViewChanInt,
        json: PassR[],
        args: string,
        api: string
    ): void {
        switch (json.length) {
            case 0:
                throw new Known404Error(getApiToStr(api), args);
            case 1:
                PassCon.pushRes(cha, json[0]);
                break;
            default:
                throw new Known500Error(
                    `found ${json.length} results but expected only one`
                );
        }
    }

    private static pushRes(cha: ViewChanInt, res: PassR | undefined): void {
        cha.load.map((ele: LoadFS) => {
            ele(LoadT.FIN);
        });
        if (res === undefined) {
            throw new Known500Error('something went horribly wrong!');
        }
        cha.tab(res);
    }

    private runPassApi(cha: ViewChanInt, api: string, args: string): void {
        cha.load.map((ele: LoadFS) => {
            ele(LoadT.STA);
        });
        const call = this.apiCall.createApiCall(`${api}${args}`);
        fetchRetry(call)
            .then(async (resp) => checkRespArr<PassR>(resp, toArrPassRes))
            .then((json: PassR[]) => {
                PassCon.checkPass(cha, json, args, api);
            })
            .catch((err: unknown) => {
                onPrError(err);
            });
    }

    public initPass(cha: ViewChanInt, strainId: number): void {
        if (strainId > 0) {
            this.runPassApi(cha, QApiCon.strAvg, `${strainId}`);
        }
    }
}

export default PassCon;
