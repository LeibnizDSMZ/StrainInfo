import { convertStrainStatusToEnum, getSeaResTuple } from '@strinf/ts/functions/api/map';
import parseCountryCode from '@strinf/ts/functions/parse/country';

type MOD_SEA_T = [number, string[], string, boolean, Uint8Array, number];
const DEC = new TextDecoder();

const ALL_DATA = new Map<number, string>();

function joinCSV(data: MOD_SEA_T): string {
    const cul = data[1].join(';');
    const sta = convertStrainStatusToEnum(data[5]);
    const country = parseCountryCode(DEC.decode(data[4]));
    return `${data[0]},${cul},${data[2]},${data[3]},${country},${sta}`;
}

function createCSV(indices: number[]): string {
    let res = `${getSeaResTuple(true).join(',')}\n`;
    for (const ind of indices) {
        const buf = ALL_DATA.get(ind);
        if (buf !== undefined) {
            res += `${buf}\n`;
        }
    }
    return res;
}

interface Init {
    type: 'init';
    data: MOD_SEA_T[];
}
interface Request {
    type: 'request';
    data: number[];
}

function createBuffer(data: MOD_SEA_T[]): void {
    for (let ind = 0; ind < data.length; ind++) {
        const dat = data[ind];
        if (dat !== undefined) {
            ALL_DATA.set(ind, joinCSV(dat));
        }
    }
}

onmessage = (eve: MessageEvent<Init | Request>) => {
    if (eve.data.type === 'init') {
        createBuffer(eve.data.data);
    } else {
        const csv = createCSV(eve.data.data);
        postMessage(csv);
    }
};
