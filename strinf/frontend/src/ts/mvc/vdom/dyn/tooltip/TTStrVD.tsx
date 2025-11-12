import type { InfoS } from '@strinf/ts/interfaces/api/mapped';
import type { JSX } from 'preact';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { getInfoStrTuple } from '@strinf/ts/functions/api/map';
import { filterArrStr } from '@strinf/ts/functions/arr/parse';
import { create2ColDiv, parseVal2Html } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import { memo } from 'preact/compat';

type EleT = number | boolean | string | string[] | JSX.Element;

const HEAD = getInfoStrTuple();
const TT_ID_STR = 'tooltip_strain_id';

interface ToolTipProps {
    res: InfoS;
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
    const fixStr = [`${IdAcrTagCon.strId} ${res[0]}`, ...res.slice(1)];
    const filteredTT: [string[], EleT[]] = filterArrStr(HEAD, fixStr);
    const ind = filteredTT[0].indexOf(HEAD[1] ?? '');
    filteredTT[1][ind] = <i>{filteredTT[1][ind]}</i>;
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

const ToolTipStrCM = memo(ToolTipC);

export { ToolTipStrCM, TT_ID_STR };
