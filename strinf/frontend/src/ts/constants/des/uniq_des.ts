import {
    CL_CORE,
    SINGLE_WORD_CHAR,
    STR_DEFINED_SEP,
    UNIQUE_DES,
} from '@strinf/ts/constants/regexp/des';

function cleanPre(pre: string): string {
    let last_char = '';
    const output = Array.from(pre).map((char: string) => {
        last_char = char;
        if (SINGLE_WORD_CHAR.exec(char) !== null)
            return char.toUpperCase();
        if (last_char === STR_DEFINED_SEP) {
            return '';
        }
        last_char = STR_DEFINED_SEP;
        return STR_DEFINED_SEP;
    });
    const [start, end] = [
        output[0] === STR_DEFINED_SEP ? 1 : 0,
        output[-1] === STR_DEFINED_SEP ? output.length - 1 : output.length,
    ];
    return output.slice(start, end).join('');
}

function cleanCore(core: string): string {
    return core.replaceAll(CL_CORE, '');
}

function cleanSuf(suf: string): string {
    return cleanCore(suf).replaceAll(/T$/g, '').toUpperCase();
}

function getSynEqStruct(des: string): string | null {
    const match = UNIQUE_DES.exec(des);
    if (match === null) {
        return null;
    }
    const [, pre, num, suf] = match;
    if (pre === undefined || num === undefined || suf === undefined) {
        return null;
    }
    return `${cleanPre(pre)}-${cleanCore(num)}-${cleanSuf(suf)}`.replaceAll(/^⁻|-?/g, '');
}

export default getSynEqStruct;
