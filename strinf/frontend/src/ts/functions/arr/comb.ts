function recSelect(prefix: string, stack: string[], resCon: string[]): void {
    if (stack.length > 0) {
        stack.forEach((val, ind) => {
            const arrCop = stack.slice();
            arrCop.splice(ind, 1);
            let newPre = `${prefix},${val}`;
            if (newPre.startsWith(',')) {
                newPre = newPre.slice(1);
            }
            recSelect(newPre, arrCop, resCon);
        });
    } else {
        resCon.push(prefix);
    }
}

function createComb(cont: string[], desc: string): [string, string][] {
    return cont.flatMap((_ele, _ind, arr): [string, string][] => {
        const resCon: string[] = [];
        recSelect('', arr, resCon);
        return resCon.map((comb) => [comb, desc]);
    });
}

export default createComb;
