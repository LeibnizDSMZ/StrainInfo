import type { ApiChanInt, SeaR } from '@strinf/ts/interfaces/api/mapped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/sea_sim';
import QApiCon from '@strinf/ts/constants/api/q_api';
import LEAD_TRAIL_COMMA from '@strinf/ts/constants/regexp/sep';
import LoadT from '@strinf/ts/constants/type/LoadT';
import Known404Error from '@strinf/ts/errors/known/404';
import KnownLostWarnError from '@strinf/ts/errors/known/lost_warn';
import { getApiToStr, toArrSerSeaRes } from '@strinf/ts/functions/api/map';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespArr, fetchRetry } from '@strinf/ts/functions/http/http';

class SeaTable {
    private readonly apiCall: ApiChanInt;

    private foundCnt: number;

    private fetchedCnt: number;

    private static readonly packSize: number = 50000;

    private static readonly argLen: number = 3000;

    constructor(apiCall: ApiChanInt) {
        this.apiCall = apiCall;
        this.foundCnt = 0;
        this.fetchedCnt = 0;
    }

    private static detectRange(args: number[], start: number): number {
        let range = start;
        for (let ind = start + 1; ind < args.length; ind++) {
            const [fir, sec] = [args[ind], args[ind - 1]];
            if (fir === undefined || sec === undefined || fir - sec > 1) {
                break;
            }
            range = ind;
        }
        return range;
    }

    private static createArgs(args: number[]): [string, number] {
        let argsStr = '';
        let added = 0;
        for (let ind = 0; ind < args.length; ind++) {
            if (argsStr.length > SeaTable.argLen) {
                break;
            }
            const range = SeaTable.detectRange(args, ind);
            const [curId, rangeId] = [args[ind], args[range]];
            if (curId === undefined || rangeId === undefined) {
                continue;
            }
            if (range > ind) {
                ind = range;
                argsStr += `,${curId}-${rangeId}`;
                added += rangeId - curId + 1;
            } else {
                argsStr += `,${curId}`;
                added += 1;
            }
        }
        return [argsStr.replace(LEAD_TRAIL_COMMA, ''), added];
    }

    private getSeaStrJson(cha: ViewChanInt, jsonId: number[]): void {
        this.fetchedCnt = 0;
        const resTab: Promise<void>[] = [];
        let [cnt, cntEl] = [0, 0];
        const sortedJson = jsonId.sort((fir, sec) => fir - sec);
        const res_con: SeaR[] = [];
        while (cnt < jsonId.length) {
            const [argsS, addedN] = SeaTable.createArgs(
                sortedJson.slice(cnt, cnt + SeaTable.packSize)
            );
            cnt += addedN;
            const call = this.apiCall.createApiCall(`${QApiCon.seaStrIds}${argsS}`);
            const timeOut = cntEl * 15;
            resTab.push(
                new Promise((res) => {
                    setTimeout(() => {
                        fetchRetry(call)
                            .then(async (resp) =>
                                checkRespArr<SeaR>(resp, toArrSerSeaRes)
                            )
                            .then((json: SeaR[]): void => {
                                this.fetchedCnt += json.length;
                                res_con.push(...json);
                                res();
                            })
                            .catch((err: unknown): void => {
                                throw err;
                            });
                    }, timeOut);
                })
            );
            cntEl += 1;
        }
        this.awaitRes(cha, resTab, res_con);
    }

    private awaitRes(cha: ViewChanInt, resTab: Promise<void>[], res_con: SeaR[]): void {
        Promise.all(resTab)
            .then(() => {
                if (this.fetchedCnt !== this.foundCnt) {
                    onPrError(
                        new KnownLostWarnError(
                            `missing results ${this.foundCnt - this.fetchedCnt}, 
                        consider reloading`
                        )
                    );
                }
                SeaTable.onStop(cha);
                cha.tab(res_con);
            })
            .catch((err: unknown): void => {
                throw err;
            });
    }

    private static onStop(cha: ViewChanInt): void {
        for (const ele of cha.load) {
            ele(LoadT.FIN);
        }
    }

    private runSearchApi(
        cha: ViewChanInt,
        api: string,
        args: string,
        omitIds: number[]
    ): void {
        const call = this.apiCall.createApiCall(`${api}${args}`);
        fetchRetry(call)
            .then(async (resp) => checkRespArr<number>(resp, (num) => Number(num)))
            .then((json: number[]): void => {
                const res = json.filter((siId) => !omitIds.includes(siId));
                this.foundCnt = res.length;
                for (const ele of cha.load) {
                    ele(LoadT.FET);
                }
                switch (json.length) {
                    case 0:
                        throw new Known404Error(getApiToStr(api), args);
                    default:
                        this.getSeaStrJson(cha, res);
                }
            })
            .catch((err: unknown) => {
                if (!(err instanceof Known404Error)) {
                    SeaTable.onStop(cha);
                    onPrError(err);
                }
            });
    }

    public initSea(cha: ViewChanInt, args: string, api: string, omitIds: number[]): void {
        const cApi = api as unknown as QApiCon;
        const allowedApis = [
            QApiCon.seaStrCCNo,
            QApiCon.seaStrStrDes,
            QApiCon.seaStrTaxName,
            QApiCon.seaStrSeqAcc,
            QApiCon.seaStrBrc,
        ];
        if (allowedApis.includes(cApi)) {
            for (const ele of cha.load) {
                ele(LoadT.STA);
            }
            this.runSearchApi(cha, api, args, omitIds);
        }
    }
}

export default SeaTable;
