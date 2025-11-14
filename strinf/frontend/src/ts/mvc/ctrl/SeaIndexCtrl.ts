import type { SeaIndJT, ServerStatusJT } from '@strinf/ts/interfaces/api/data';
import type ViewChanInt from '@strinf/ts/interfaces/chan/sea_ind';
import Known500Error from '@strinf/ts/errors/known/500';
import getServerStatus from '@strinf/ts/functions/api/status';
import onPrError from '@strinf/ts/functions/err/async';
import ApiChan from '@strinf/ts/mvc/ctrl/chan/ApiChan';
import Controller from '@strinf/ts/mvc/ctrl/Controller';
import SeaIndexCon from '@strinf/ts/mvc/model/sea/SeaIndexCon';

const LIMIT = 20;

class SeaIndexCtrl extends Controller<ViewChanInt, [string]> {
    private readonly indexCon: SeaIndexCon;

    private readonly apiChan: ApiChan;

    private readonly memory: Map<string, SeaIndJT>;

    constructor(version: string) {
        super(version);
        this.apiChan = new ApiChan();
        this.indexCon = new SeaIndexCon(this.apiChan);
        this.memory = new Map<string, SeaIndJT>();
    }

    private createCacheHook(cha: ViewChanInt, key: string): ViewChanInt {
        const chaL = cha;
        const caKey = key;
        const mem = this.memory;
        return {
            tab: (results: SeaIndJT): void => {
                const kVal = mem.keys().next().value;
                if (mem.size > LIMIT && typeof kVal === 'string') {
                    mem.delete(kVal);
                }
                mem.set(caKey, results);
                chaL.tab(results);
            },
        };
    }

    public override init(cha: ViewChanInt, args: string): void {
        const cacheKey = args.toUpperCase();
        const cache = this.memory.get(cacheKey);
        if (cache !== undefined) {
            cha.tab(cache);
        }
        else {
            const errC = new Known500Error('Internal server error!');
            const dataReq = (status: ServerStatusJT): void => {
                this.reloadWindowOrCb(status.version, () => {
                    this.indexCon.initSea(this.createCacheHook(cha, cacheKey), args);
                });
            };
            getServerStatus(dataReq, () => {
                onPrError(errC);
            });
        }
    }
}

export default SeaIndexCtrl;
