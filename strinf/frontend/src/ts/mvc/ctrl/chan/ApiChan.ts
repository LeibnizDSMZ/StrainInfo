import CONFIG from '@strinf/ts/configs/config';
import type { ApiChanInt } from '@strinf/ts/interfaces/api/maped';
import type { ConfLinkT } from '@strinf/ts/interfaces/misc/configs';

class ApiChan implements ApiChanInt {
    private readonly apiConf: ConfLinkT;

    constructor() {
        this.apiConf = CONFIG.backend;
    }

    public createApiCall(extra: string): string {
        const extRe = !extra.startsWith('/') ? `/${extra}` : extra;
        const main = `${this.apiConf.protocol}://${this.apiConf.domain}`;
        return `${main}:${this.apiConf.port}${extRe}`;
    }
}

export default ApiChan;
