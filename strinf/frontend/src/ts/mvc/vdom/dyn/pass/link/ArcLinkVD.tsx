import type { JSX } from 'preact';
import { createUrlStr } from '@strinf/ts/functions/http/http';
import linkSty from '@strinf/css/mods/link.module.css';
import conSty from '@strinf/css/mods/container.module.css';
import { Align, Dis, Mar, Tex } from '@strinf/ts/constants/style/ClHtml';
import DOI_L from '@strinf/ts/constants/links/doi';
import LogoDoiVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoDoiVD';
import crAlert from '@strinf/ts/mvc/vdom/fun/alert/alert';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import { useRef } from 'preact/hooks';
import { useTooltipForRef } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import type { TT_GL_TYPE, ToolTipHookInt } from '@strinf/ts/interfaces/dom/tooltip';
import ErrType from '@strinf/ts/constants/type/ErrT';
import onPrError from '@strinf/ts/functions/err/async';

interface ArcLink {
    doi: string;
    hook: ToolTipHookInt<TT_GL_TYPE>;
}

const DOI_R = new RegExp(`^(.+)(${IdAcrTagCon.strId}.+)(\\.\\d+)$`);

function splitDoi(doi: string): JSX.Element {
    const splDoi = DOI_R.exec(doi);
    if (splDoi === null) {
        return <p className={Mar.N0}>{doi}</p>;
    }
    return (
        <p className={Mar.N0}>
            {splDoi[1]}
            <strong className={Tex.p}>{splDoi[2]}</strong>
            {splDoi[3]}
        </p>
    );
}

function ArcLinkVD(props: ArcLink): JSX.Element | null {
    const { doi, hook } = props;
    const claD = `${Dis.dIFlex} ${conSty.fbundle}`;
    const claB = `${linkSty.cleanbutton} ${Dis.dIFlex} ${Align.jc}`;
    const ref = useRef<HTMLButtonElement>(null);
    useTooltipForRef(
        ref,
        hook,
        () => {
            if (hook.data !== undefined) {
                hook.data(<p>Click on the icon to copy the DOI URL</p>);
            }
        },
        [50, 50]
    );
    return (
        <span className={claD} id={IdHtmlTour.doiHead}>
            <button
                ref={ref}
                className={claB}
                type="button"
                aria-label="Copy archive"
                onClick={() => {
                    try {
                        navigator.clipboard
                            .writeText(createUrlStr(DOI_L, doi))
                            .then(() => {
                                crAlert(null, 'DOI copied to your clipboard');
                            })
                            .catch(onPrError);
                    } catch {
                        crAlert(ErrType.FEWARN, 'Clipboard not defined!');
                    }
                }}
            >
                <LogoDoiVD height="22" cla="" />
            </button>
            <span>{splitDoi(doi)}</span>
        </span>
    );
}

export default ArcLinkVD;
