import QApiCon from '@strinf/ts/constants/api/q_api';
import getLeTrComma from '@strinf/ts/constants/regexp/sep';
import LoadT from '@strinf/ts/constants/type/LoadT';
import Known404Error from '@strinf/ts/errors/known/404';
import Known500Error from '@strinf/ts/errors/known/500';
import KnownLostWarnError from '@strinf/ts/errors/known/lost_warn';
import { isOnlyOneStr } from '@strinf/ts/functions/api/args';
import { getApiToStr, isSerSeaAllJ, toArrSerSeaRes } from '@strinf/ts/functions/api/map';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespArr, checkRespObj, fetchRetry } from '@strinf/ts/functions/http/http';
import type { ApiChanInt, SeaR, SerSeaAllJ } from '@strinf/ts/interfaces/api/maped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/sea';
import type { LoadFS } from '@strinf/ts/interfaces/dom/global';

const REG_NUM = /\d+/;

function getUniqueKeys(data: number[]): number[] {
    let maxId = 1;
    for (const rId of data) {
        if (maxId < rId) {
            maxId = rId;
        }
    }
    const filA = new Uint8Array(maxId);
    for (const rId of data) {
        filA[rId] = 1;
    }
    return Array.from(filA.keys()).filter((ind) => filA[ind] !== 0);
}

function isOneStrain(data: SeaR[]): boolean {
    const index = new Set();
    for (const [strId] of data) {
        if (index.size > 1 && !index.has(strId)) {
            return false;
        }
        index.add(strId);
    }
    return true;
}

class SeaTable {
    private readonly apiCall: ApiChanInt;

    private foundCnt: number;

    private fetchedCnt: number;

    private static readonly packSize: number = 50000;

    private static readonly argLen: number = 3000;

    private results: SeaR[];

    constructor(apiCall: ApiChanInt) {
        this.apiCall = apiCall;
        this.foundCnt = 0;
        this.fetchedCnt = 0;
        this.results = [];
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
        return [argsStr.replace(getLeTrComma(), ''), added];
    }

    private getSeaStrJson(
        cha: ViewChanInt,
        jsonId: number[],
        api: string,
        args: string
    ): void {
        this.fetchedCnt = 0;
        cha.prog(0);
        const resTab: Promise<void>[] = [];
        let [cnt, cntEl] = [0, 0];
        const sortedJson = jsonId.sort((fir, sec) => fir - sec);
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
                                res(this.getRes(cha, json));
                            })
                            .catch((err: unknown) => {
                                SeaTable.onStop(cha);
                                onPrError(err);
                            });
                    }, timeOut);
                })
            );
            cntEl += 1;
        }
        this.awaitRes(cha, resTab, api, args);
    }

    private runSearchAll(
        cha: ViewChanInt,
        api: string,
        ind: number,
        resTab: Promise<void>[]
    ): void {
        const call = this.apiCall.createApiCall(`${api}${ind}`);
        resTab.push(
            new Promise((res) => {
                setTimeout(
                    () => {
                        fetchRetry(call, {
                            signal: AbortSignal.timeout(300000 * (1 + resTab.length)),
                        })
                            .then(async (resp) => {
                                if (ind === 0) {
                                    cha.load.map((ele: LoadFS) => {
                                        ele(LoadT.FET);
                                    });
                                    cha.prog(0);
                                    this.fetchedCnt = 0;
                                }
                                return checkRespObj<SerSeaAllJ>(resp, (data) => {
                                    const valObj =
                                        typeof data === 'object' && data !== null;
                                    if (valObj && 'next' in data) {
                                        this.runSearchAll(cha, api, ind + 1, resTab);
                                    } else {
                                        this.awaitRes(cha, resTab, api, '');
                                    }
                                    return isSerSeaAllJ(data);
                                });
                            })
                            .then((data: SerSeaAllJ) => {
                                this.foundCnt = data.count;
                                const json = data.data.map((val) => toArrSerSeaRes(val));
                                res(this.getRes(cha, json));
                            })
                            .catch((err: unknown) => {
                                SeaTable.onStop(cha);
                                onPrError(err);
                            });
                    },
                    15 * ind + 1
                );
            })
        );
    }

    private awaitRes(
        cha: ViewChanInt,
        resTab: Promise<void>[],
        api: string,
        args: string
    ): void {
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
                const res = this.results;
                if (isOneStrain(res)) {
                    const strId = res[0] ? `${res[0][0]}` : '';
                    this.wrapToPass(cha, api, args, strId);
                } else {
                    SeaTable.onStop(cha);
                    cha.tab(res);
                }
            })
            .catch((err: unknown) => {
                SeaTable.onStop(cha);
                onPrError(err);
            });
    }

    private async getRes(cha: ViewChanInt, json: SeaR[]): Promise<void> {
        this.fetchedCnt += json.length;
        cha.prog(Math.min(Math.round((100 * this.fetchedCnt) / this.foundCnt), 100));
        for (let cnt = 0; cnt < json.length; cnt += 1000) {
            await new Promise<void>((res) => {
                setTimeout(() => {
                    this.results.push(...json.slice(cnt, cnt + 1000));
                    res();
                }, 1);
            });
        }
    }

    private static onStop(cha: ViewChanInt): void {
        cha.load.map((ele: LoadFS) => {
            ele(LoadT.FIN);
        });
        cha.prog(0);
    }

    private wrapToPassGen(
        cha: ViewChanInt,
        api: string,
        args: string,
        strain: string
    ): void {
        const cApi = api as unknown as QApiCon;
        const reqApi = cApi
            .split(',')
            .map((ael) => SeaTable.mapStrApiCul(ael))
            .filter((cel) => cel !== '')
            .join(',');
        if (reqApi === '') {
            SeaTable.onStop(cha);
            cha.toPass(strain, '');
        } else {
            this.runSearchApiComb(cha, reqApi, args, (lCha, lIds) => {
                SeaTable.checkCulIds(lCha, lIds, strain);
            });
        }
    }

    private wrapToPass(
        cha: ViewChanInt,
        api: string,
        args: string,
        strain: string
    ): void {
        const cApi = api as unknown as QApiCon;
        if (cApi === QApiCon.seaStrCulId) {
            SeaTable.onStop(cha);
            cha.toPass(strain, REG_NUM.test(args) ? args : '');
        } else {
            this.wrapToPassGen(cha, api, args, strain);
        }
    }

    private checkStrIds(
        cha: ViewChanInt,
        jId: number[],
        args: string,
        api: string
    ): void {
        this.foundCnt = jId.length;
        cha.load.map((ele: LoadFS) => {
            ele(LoadT.FET);
        });
        switch (this.foundCnt) {
            case 0:
                throw new Known404Error(getApiToStr(api), args);
            case 1:
                this.wrapToPass(cha, api, args, `${jId[0] ?? ''}`);
                break;
            default:
                this.getSeaStrJson(cha, jId, api, args);
        }
    }

    private static mapStrApiCul(api: string): string {
        const cApi = api as unknown as QApiCon;
        if (cApi === QApiCon.seaStrStrDes) {
            return QApiCon.seaCulStrNo;
        }
        if (cApi === QApiCon.seaStrStrNo) {
            return QApiCon.seaCulStrNo;
        }
        if (cApi === QApiCon.seaStrSeqAcc) {
            return QApiCon.seaCulSeqAcc;
        }
        return '';
    }

    private static checkCulIds(cha: ViewChanInt, jId: number[], strain: string): void {
        SeaTable.onStop(cha);
        if (jId.length === 1) {
            cha.toPass(strain, `${jId[0] ?? ''}`);
        } else {
            cha.toPass(strain, '');
        }
    }

    private runSearchApiComb(
        cha: ViewChanInt,
        api: string,
        args: string,
        checkIds: (cha: ViewChanInt, jId: number[], args: string, api: string) => void
    ): void {
        const idRes: { data: number[] } = {
            data: [],
        };
        const promises: Promise<void>[] = [];
        const apis = new Set(api.split(','));
        for (const callApi of apis) {
            const call = this.apiCall.createApiCall(`${callApi}${args}`);
            const fetchP = fetchRetry(call)
                .then(async (resp) => checkRespArr<number>(resp, (num) => Number(num)))
                .then((json: number[]): void => {
                    if (apis.size === 1) {
                        idRes.data = json;
                    } else if (json.length < 80000) {
                        idRes.data.push(...json);
                    } else {
                        for (const val of json) {
                            idRes.data.push(val);
                        }
                    }
                })
                .catch((err: unknown) => {
                    SeaTable.onStop(cha);
                    if (err instanceof Known500Error) {
                        onPrError(err);
                    }
                });
            promises.push(fetchP);
        }
        Promise.all(promises)
            .then(() => {
                try {
                    let res = idRes.data;
                    if (apis.size > 1) {
                        res = getUniqueKeys(idRes.data);
                    }
                    checkIds(cha, res, args, api);
                } catch (err) {
                    SeaTable.onStop(cha);
                    if (err instanceof Error) {
                        onPrError(err);
                    }
                }
            })
            .catch(onPrError);
    }

    private static forwardStrainToPass(cha: ViewChanInt, strain: string) {
        if (!isOnlyOneStr(QApiCon.seaCulStrId, strain)) {
            onPrError(new Known404Error(getApiToStr(QApiCon.seaCulStrId), strain));
        } else {
            cha.toPass(strain, '');
        }
    }

    public initSea(cha: ViewChanInt, args: string, api: string): void {
        const cApi = api as unknown as QApiCon;
        const csApi = cApi.split(',');
        const allowedComb = new Set<string>([
            QApiCon.seaStrBrc,
            QApiCon.seaStrStrDes,
            QApiCon.seaStrTaxName,
        ]);
        const allowedApis = [
            QApiCon.seaStrStrNo,
            QApiCon.seaStrStrDes,
            QApiCon.seaStrTaxName,
            QApiCon.seaStrSeqAcc,
            QApiCon.seaStrCulId,
            QApiCon.seaStrAll,
        ];
        this.results = [];
        if (cApi === QApiCon.seaStrAll) {
            cha.load.map((ele: LoadFS) => {
                ele(LoadT.STA);
            });
            this.runSearchAll(cha, api, 0, []);
        } else if (cApi === QApiCon.seaCulStrId) {
            SeaTable.forwardStrainToPass(cha, args);
        } else if (
            allowedApis.includes(cApi) ||
            csApi.every((elApi) => allowedComb.has(elApi))
        ) {
            cha.load.map((ele: LoadFS) => {
                ele(LoadT.STA);
            });
            this.runSearchApiComb(cha, api, args, (lCha, lIds, lArg, lApi) => {
                this.checkStrIds(lCha, lIds, lArg, lApi);
            });
        }
    }
}

export default SeaTable;
