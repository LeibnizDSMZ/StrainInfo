import type { JSX } from 'preact/jsx-runtime';

type EleT = number | boolean | string | string[] | JSX.Element;

function isEmptyStr(val: unknown): boolean {
    if (val === undefined) {
        return true;
    }
    if (typeof val === 'string' && val.length === 0) {
        return true;
    }
    return false;
}

function containsArrNoEmptyStr(val: unknown[], chI: number[]): boolean {
    let colI = 0;
    for (const valEl of val) {
        if (typeof valEl === 'string' && chI.includes(colI) && valEl.length === 0) {
            return false;
        }
        colI += 1;
    }
    return true;
}
function filterArrStr(
    head: string[],
    vals: (EleT | undefined)[],
    repl_str?: string,
): [string[], EleT[]] {
    const resH = [];
    const resV = [];
    for (let vaI = 0; vaI < vals.length; vaI += 1) {
        const elH = head[vaI];
        let elV = vals[vaI];
        if (isEmptyStr(elV)) {
            elV = repl_str;
        }
        if (elH !== undefined && elV !== undefined) {
            resH.push(elH);
            resV.push(elV);
        }
    }
    return [resH, resV];
}

function filterArrRowStr<T>(vals: T[], chI: number[]): T[] {
    return vals
        .slice()
        .filter(
            elV =>
                elV !== undefined && Array.isArray(elV) && containsArrNoEmptyStr(elV, chI),
        );
}

function filterRowStr<T>(vals: T[]): T[] {
    return vals
        .slice()
        .filter(elV => elV !== undefined && typeof elV === 'string' && elV.length > 0);
}

export { filterArrRowStr, filterArrStr, filterRowStr };
