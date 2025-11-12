import type { ChartData } from '@strinf/ts/interfaces/api/mapped';
import type DisChartT from '@strinf/ts/interfaces/chan/model';
import type { DiaCon } from '@strinf/ts/interfaces/dom/dia';
import QApiCon from '@strinf/ts/constants/api/q_api';
import DiaT from '@strinf/ts/constants/type/DiaT';
import Known500Error from '@strinf/ts/errors/known/500';
import onPrError from '@strinf/ts/functions/err/async';
import { checkRespObjOk, fetchRetry } from '@strinf/ts/functions/http/http';

const X_ID = 'deposits per strain';
const Y_ID = 'count';
const X_ST = 'deposits per strain';
const Y_ST = 'strains';
class DisCpsCnt implements DisChartT {
    private readonly apiC: string;

    private readonly id: DiaT;

    constructor() {
        this.apiC = QApiCon.disCpsCnt;
        this.id = DiaT.CPS;
    }

    public get api(): string {
        return this.apiC;
    }

    private static checkDis(obj: unknown): obj is ChartData<number[]>[] {
        if (!Array.isArray(obj)) {
            return false;
        }
        for (const dis of obj) {
            if (!(X_ID in dis && Y_ID in dis)) {
                return false;
            }
        }
        return obj.length > 0;
    }

    private static sortDis(data: ChartData<number[]>): ChartData<number[] | string[]> {
        const xData = data[X_ID] ?? [0];
        const yData = data[Y_ID] ?? [0];
        const sortedProto = [...Array.from({ length: Math.max(...xData) + 1 }).keys()];
        const xMap = xData
            .map((xVal, xInd) => ({ [xVal]: xInd }))
            .reduce((wObj, item) => ({ ...wObj, ...item }));
        const sortedY: number[] = [];
        const sortedX: string[] = [];
        for (const idX of sortedProto) {
            const valInd = xMap[idX];
            if (valInd !== undefined) {
                if (sortedX.length < 6) {
                    sortedY.push(yData[valInd] ?? -1);
                    sortedX.push(String(xData[valInd] ?? -1));
                } else {
                    sortedY[5] = (sortedY[5] ?? 0) + (yData[valInd] ?? 0);
                    sortedX[5] = `>${sortedX[4]}`;
                }
            }
        }
        return {
            [X_ST]: sortedX,
            [Y_ST]: sortedY,
        };
    }

    public async config(call: string): Promise<DiaCon> {
        const res: Promise<DiaCon> = fetchRetry(call)
            .then(async (resp) =>
                checkRespObjOk<ChartData<number[]>[]>(
                    resp,
                    (obj): obj is ChartData<number[]>[] => DisCpsCnt.checkDis(obj)
                )
            )
            .then((jsonCon: ChartData<number[]>[]): DiaCon => {
                const [data] = jsonCon;
                if (data === undefined) {
                    throw new Known500Error(`No X: ${X_ID} vs Y: ${Y_ID} data provided`);
                }
                return {
                    [this.id]: {
                        data: DisCpsCnt.sortDis(data),
                        keys: { x: X_ST, y: Y_ST },
                    },
                };
            });
        res.catch(onPrError);
        return res;
    }
}

export default DisCpsCnt;
