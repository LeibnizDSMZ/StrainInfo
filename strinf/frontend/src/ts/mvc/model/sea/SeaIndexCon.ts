import type { SeaIndJT } from '@strinf/ts/interfaces/api/data';
import type { ApiChanInt } from '@strinf/ts/interfaces/api/mapped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/sea_ind';
import QApiCon from '@strinf/ts/constants/api/q_api';
import Known404Error from '@strinf/ts/errors/known/404';
import { toArrIndSeaIndRes } from '@strinf/ts/functions/api/map';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespTyp, fetchRetry } from '@strinf/ts/functions/http/http';

class SeaIndexCon {
    private readonly apiCall: ApiChanInt;

    private ready: boolean;

    private lastInput: string;

    constructor(apiCall: ApiChanInt) {
        this.apiCall = apiCall;
        this.ready = true;
        this.lastInput = '';
    }

    private runSeaApi(cha: ViewChanInt, key: string) {
        const api = QApiCon.seaKeyInd;
        const call = this.apiCall.createApiCall(`${api}${key}`);
        const cIn = key;
        setTimeout(
            () =>
                void fetchRetry(call)
                    .then(async resp =>
                        checkRespTyp<SeaIndJT>(resp, toArrIndSeaIndRes, () =>
                            toArrIndSeaIndRes({ match: [], exact: [] })),
                    )
                    .then((json: SeaIndJT): void => {
                        cha.tab(json);
                        const lIn = this.lastInput;
                        this.ready = true;
                        if (cIn !== lIn) {
                            this.initSea(cha, lIn);
                        }
                    })
                    .catch((err: unknown) => {
                        this.ready = true;
                        if (!(err instanceof Known404Error)) {
                            onPrError(err);
                        }
                    }),
            200,
        );
    }

    public initSea(cha: ViewChanInt, args: string): void {
        this.lastInput = args;
        if (!args.includes(',') && args !== '' && this.ready) {
            this.ready = false;
            this.runSeaApi(cha, args);
        }
    }
}

export default SeaIndexCon;
