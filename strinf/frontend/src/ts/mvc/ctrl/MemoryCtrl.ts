import type { ServerStatusJT } from '@strinf/ts/interfaces/api/data';
import Known500Error from '@strinf/ts/errors/known/500';
import getServerStatus from '@strinf/ts/functions/api/status';
import onPrError from '@strinf/ts/functions/err/async';

const LIMIT = 200;
interface Chan<T> {
    get res(): (res: T[]) => void;
}

function awaitResults<T>(cha: Chan<T>, key: number, mem: Map<number, T>): void {
    const lMem = mem;
    let cache = lMem.get(key);
    if (cache !== undefined) {
        cha.res([cache]);
    }
    else {
        let counter = 0;
        const awaitInterval = setInterval(() => {
            cache = mem.get(key);
            counter++;
            if (cache !== undefined) {
                cha.res([cache]);
                clearInterval(awaitInterval);
            }
            else if (counter > 3000) {
                clearInterval(awaitInterval);
            }
        }, 100);
    }
}

function* crPackage<T>(
    keys: number[],
    mem: Map<number, T>,
    tasks: Set<number>,
): Generator<[number, boolean]> {
    let cnt = 0;
    let nextVal = keys.pop();
    while (nextVal !== undefined) {
        const awaitable = tasks.has(nextVal) || mem.has(nextVal);
        if (!awaitable) {
            cnt++;
        }
        yield [nextVal, awaitable];
        nextVal = cnt < 20 ? (nextVal = keys.pop()) : undefined;
    }
}

class MemoryCtrl<T> {
    private readonly memory: Map<number, T>;

    private readonly tasks: Set<number>;

    private readonly memOrder: number[];

    private readonly getId: (val: T) => number;

    private readonly dataReq: (
        status: ServerStatusJT,
        cha: Chan<T>,
        ids: number[],
    ) => void;

    constructor(
        getId: (val: T) => number,
        dataReq: (status: ServerStatusJT, cha: Chan<T>, ids: number[]) => void,
    ) {
        this.memory = new Map<number, T>();
        this.tasks = new Set<number>();
        this.memOrder = [];
        this.getId = getId;
        this.dataReq = dataReq;
    }

    private updateMem(results: T[]): void {
        for (const resEl of results) {
            const culId = this.getId(resEl);
            this.memOrder.push(culId);
            const [keyF] = this.memOrder.slice(0, 1);
            if (this.memOrder.length > LIMIT && keyF !== undefined) {
                this.memory.delete(keyF);
                this.memOrder.shift();
            }
            this.memory.set(culId, resEl);
            this.tasks.delete(culId);
        }
    }

    private createCacheHook(cha: Chan<T>): Chan<T> {
        const chaL = cha;
        const updater = (res: T[]) => {
            this.updateMem(res);
        };
        return {
            res: (results: T[]): void => {
                updater(results);
                chaL.res(results);
            },
        };
    }

    private requestDetails(cha: Chan<T>, culIds: number[]): void {
        const errC = new Known500Error('Internal server error!');
        const mCal = this.createCacheHook(cha);
        for (const culId of culIds) {
            this.tasks.add(culId);
        }
        const dataReq = (status: ServerStatusJT): void => {
            this.dataReq(status, mCal, culIds);
        };
        getServerStatus(dataReq, () => {
            onPrError(errC);
        });
    }

    public init(cha: Chan<T>, args: number[]): void {
        const cKeys = [...args];
        const toAwait: number[] = [];
        let packager = crPackage(cKeys, this.memory, this.tasks);
        while (cKeys.length > 0) {
            const toRequest: number[] = [];
            for (const [cid, awa] of [...packager]) {
                if (awa) {
                    toAwait.push(cid);
                }
                else {
                    toRequest.push(cid);
                }
            }
            if (toRequest.length > 0) {
                this.requestDetails(cha, toRequest);
            }
            packager = crPackage(cKeys, this.memory, this.tasks);
        }
        for (const awa of toAwait) {
            awaitResults(cha, awa, this.memory);
        }
    }
}

export default MemoryCtrl;
