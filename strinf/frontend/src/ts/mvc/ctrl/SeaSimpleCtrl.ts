import type ViewChanInt from '@strinf/ts/interfaces/chan/sea_sim';
import SeaTableSimple from '@strinf/ts/mvc/model/sea/SeaTableSimple';
import ApiChan from '@strinf/ts/mvc/ctrl/chan/ApiChan';
import Known500Error from '@strinf/ts/errors/known/500';
import getServerStatus from '@strinf/ts/functions/api/status';
import onPrError from '@strinf/ts/functions/err/async';
import emptyCall from '@strinf/ts/functions/misc/call';
import Controller from '@strinf/ts/mvc/ctrl/Controller';
import type { ServerStatusJT } from '@strinf/ts/interfaces/api/data';

class SeaSimpleCtrl extends Controller<ViewChanInt, [string, string, number[]]> {
    private readonly apiChan: ApiChan;

    constructor(version: string) {
        super(version);
        this.apiChan = new ApiChan();
    }

    public override init(
        cha: ViewChanInt,
        args: string,
        api: string,
        omitIds: number[]
    ): void {
        const errC = new Known500Error('Internal server error!');
        const dataReq = (status: ServerStatusJT): void => {
            this.reloadWindowOrCb(status.version, () => {
                const seaTable = new SeaTableSimple(this.apiChan);
                seaTable.initSea(cha, args, api, omitIds);
            });
        };
        getServerStatus(
            dataReq,
            () => {
                onPrError(errC);
            },
            emptyCall
        );
    }
}

export default SeaSimpleCtrl;
