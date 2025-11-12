import type { InfoR } from '@strinf/ts/interfaces/api/mapped';
import type { JSX } from 'preact';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { getInfoDepTuple } from '@strinf/ts/functions/api/map';
import { filterArrStr } from '@strinf/ts/functions/arr/parse';
import { create2ColDiv, parseVal2Html } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import { memo } from 'preact/compat';

type EleT = number | boolean | string | string[] | JSX.Element;

const HEAD = getInfoDepTuple();
const TT_ID_DEP = 'tooltip_deposit_id';

interface ToolTipProps {
    res: InfoR;
    loading: boolean;
    info: JSX.Element | undefined;
}

function crToolTipC(res: JSX.Element): JSX.Element {
    return (
        <div className={ClHtml.con}>
            <div className={ClHtml.cnt}>{res}</div>
        </div>
    );
}

function ToolTipC({ res, loading, info }: ToolTipProps): JSX.Element {
    const fixCul = [`${IdAcrTagCon.depId} ${res[0]}`, ...res.slice(1, 3)];
    const filteredTT: [string[], EleT[]] = filterArrStr(HEAD.slice(0, 3), fixCul);
    const ind = filteredTT[0].indexOf(HEAD[2] ?? '');
    filteredTT[1][ind] = <i>{filteredTT[1][ind]}</i>;
    if (res[3]) {
        filteredTT[0].push('Status');
        filteredTT[1].push(<span>Incorrect deposit</span>);
    }
    const resDiv = create2ColDiv<EleT | JSX.Element>(
        ...filteredTT,
        (val: EleT | JSX.Element) => {
            return parseVal2Html(val);
        }
    );
    if (resDiv[1] === 1 || loading) {
        resDiv[0] = <div key={0}>Loading ...</div>;
    }
    return crToolTipC(
        <>
            {resDiv[0]}
            {info ?? null}
        </>
    );
}

const ToolTipDepCM = memo(ToolTipC);

export { ToolTipDepCM, TT_ID_DEP };
