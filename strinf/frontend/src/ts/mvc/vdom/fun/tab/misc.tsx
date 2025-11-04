import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import type {
    DatIdTVInt,
    TT_GL_TYPE,
    TTSrcTVInt,
} from '@strinf/ts/interfaces/dom/tooltip';
import type { JSX } from 'preact';
import conSty from '@strinf/css/mods/container.module.css';
import tilSty from '@strinf/css/mods/tile.module.css';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import DOI_L from '@strinf/ts/constants/links/doi';
import { ena_genome, ena_nucleotide } from '@strinf/ts/constants/links/ena';
import { ncbi_genome, ncbi_nucleotide } from '@strinf/ts/constants/links/ncbi';
import { DB_ACC_REG } from '@strinf/ts/constants/regexp/seq';
import { TT_TAR } from '@strinf/ts/constants/style/AtHtml';
import {
    Align,
    ClHtml,
    Col,
    Dis,
    Pad,
    Tex,
    Wid,
} from '@strinf/ts/constants/style/ClHtml';
import Known500Error from '@strinf/ts/errors/known/500';
import { createUrlStr } from '@strinf/ts/functions/http/http';
import {
    createStrainCall,
    createStrainCultureCall,
} from '@strinf/ts/functions/links/create_pass';
import updateAnc from '@strinf/ts/functions/links/update_anc';
import updateHrefVal from '@strinf/ts/functions/links/update_href';
import { useTooltipForRef } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import crToolTip from '@strinf/ts/mvc/vdom/fun/tooltip/tooltip';
import LogoEnaVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoEnaVD';
import LogoNcbiVD from '@strinf/ts/mvc/vdom/static/images/logos/LogoNcbiVD';
import { Fragment, isValidElement } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

function createBoolIcon(val: boolean, dark = false): JSX.Element {
    const filter = dark ? 'brightness(2)' : 'brightness(1.0)';
    if (val) {
        return (
            <div
                style={{
                    color: 'var(--color-logo-green)',
                    filter,
                }}
            >
                <i className={ClHtmlI.check} />
            </div>
        );
    }
    return (
        <div
            style={{
                color: 'var(--color-logo-red)',
                filter,
            }}
        >
            <i className={ClHtmlI.cross} />
        </div>
    );
}

function createPassCulHref(
    val: [string | undefined, string],
    ctx: InValStInt | undefined,
    href: string,
    anc: string,
): JSX.Element {
    const [cul, strain] = val;
    if (cul === undefined) {
        return <span>{strain}</span>;
    }
    return (
        <a
            key={strain}
            href={href}
            className={Tex.tr}
            onClick={() => {
                setTimeout(() => {
                    updateHrefVal(`${IdAcrTagCon.depId} ${cul}`, ctx);
                    updateAnc(`#${anc}`);
                }, 100);
                return true;
            }}
            style="font-weight: normal;"
        >
            {strain}
        </a>
    );
}

function createPassLinkStrain(
    strain: string,
    cul: string | undefined,
    ctx: InValStInt | undefined,
): JSX.Element {
    const href
        = cul !== undefined
            ? createStrainCultureCall(strain, cul)
            : createStrainCall(strain);

    return (
        <a
            key={strain}
            href={href}
            className={Tex.tr}
            onClick={() => {
                setTimeout(() => {
                    updateHrefVal(`${IdAcrTagCon.strId} ${strain}`, ctx);
                }, 100);
                return true;
            }}
            style="font-weight: normal;"
        >
            {strain}
        </a>
    );
}

function createSimpleTile(key: number, name: string, exCl: string): JSX.Element {
    const clV = `${exCl} ${tilSty.tiletext} ${tilSty.cursor} ${ClHtml.til} ${Tex.tr}`;
    return (
        <span key={key} className={clV}>
            {' '}
            {name}
            {' '}
        </span>
    );
}

function createSimpleTiles<T>(
    values: T[],
    parser: (val: T) => [string, string],
): JSX.Element[] {
    const tiles: JSX.Element[] = [];
    for (let ind = 0; ind < values.length; ind += 1) {
        const val = values[ind];
        if (val === undefined) {
            throw new Known500Error(`values [${values}] are undefined!`);
        }
        const [name, extraClass] = parser(val);
        tiles.push(createSimpleTile(ind, name, extraClass));
    }
    return tiles;
}

function createLinkedTile(
    href: string,
    key: number,
    name: string,
    cal: () => boolean,
    exCl: string,
): JSX.Element {
    const clV = `${exCl} ${tilSty.tiletext} ${ClHtml.til} ${ClHtml.tLin} ${Tex.tr}`;
    return (
        <a
            key={key}
            href={href}
            className={clV}
            onClick={cal}
            style="font-weight: normal;"
        >
            {name}
        </a>
    );
}

function createDepositTile(
    anc: string,
    val: [number, number, string],
    ctx: InValStInt | undefined,
    exCl: string,
): JSX.Element {
    const [key, depId, name] = val;
    const culCl = () => {
        setTimeout(() => {
            updateHrefVal(`${IdAcrTagCon.depId} ${depId}`, ctx);
            updateAnc(anc);
        }, 100);
        return true;
    };
    return createLinkedTile(
        `${window.location.pathname}?${IdAcrTagCon.depId}${depId}`,
        key,
        name,
        culCl,
        exCl,
    );
}

function createStrainTile(
    _anc: string,
    val: [number, number, string],
    ctx: InValStInt | undefined,
    exCl: string,
): JSX.Element {
    const [key, strId, name] = val;
    const strCl = () => {
        setTimeout(() => {
            updateHrefVal(`${IdAcrTagCon.strId} ${strId}`, ctx);
        }, 100);
        return true;
    };
    return createLinkedTile(createStrainCall(strId), key, name, strCl, exCl);
}

function createDoiLink(doi: string | undefined, tit: string): JSX.Element {
    if (doi === undefined || doi.length === 0) {
        return <span>{tit}</span>;
    }
    return (
        <span>
            {tit}
            <a
                href={createUrlStr(DOI_L, doi)}
                target="_blank"
                rel="noopener"
                aria-label={tit}
            >
                &nbsp;
                <i className={ClHtmlI.link} />
            </a>
        </span>
    );
}

function selectSeqLinker(acc: string): [JSX.Element, string][] | null {
    if (DB_ACC_REG.assembly.test(acc)) {
        return [
            [<LogoEnaVD key="seql0" full={true} height="15" />, ena_genome(acc)],
            [<LogoNcbiVD key="seql1" full={true} height="15" />, ncbi_genome(acc)],
        ];
    }
    if (DB_ACC_REG.nucleotide.test(acc)) {
        return [
            [<LogoEnaVD key="seql0" full={true} height="15" />, ena_nucleotide(acc)],
            [<LogoNcbiVD key="seql1" full={true} height="15" />, ncbi_nucleotide(acc)],
        ];
    }
    return null;
}

function createSeqAccLink(acc: string): JSX.Element {
    if (acc === '') {
        return <span>unknown</span>;
    }
    const results = selectSeqLinker(acc);
    if (results == null) {
        return <span>{acc}</span>;
    }
    const spCl = `${ClHtml.row} ${Dis.dFlex} ${Align.je} ${Pad.bN5}`;
    const spCon = `${Dis.dIFlex} ${conSty.fbundle} ${Wid.f}`;
    return (
        <span className={spCon}>
            <span>{acc}</span>
            <span className={Col.col}>
                {results.map(([seqImg, href], ind) => (
                    <span key={`accl${ind}`} className={spCl}>
                        <a href={href} target="_blank" rel="noopener">
                            {seqImg}
                        </a>
                    </span>
                ))}
            </span>
        </span>
    );
}

const QUOTES = /^['"]|['"]$/g;

function parseVal2Html(value: unknown): JSX.Element | null {
    if (typeof value === 'boolean') {
        return createBoolIcon(value);
    }
    if (typeof value === 'object') {
        if (isValidElement(value)) {
            return value;
        }
        return null;
    }
    return <span>{JSON.stringify(value).replaceAll(QUOTES, '')}</span>;
}

function create2ColDiv<T>(
    keys: string[],
    values: T[],
    parser: (val: T, key: string) => JSX.Element | null,
): [JSX.Element, number] {
    const rows = [];
    for (let ind = 0; ind < values.length; ind += 1) {
        const val = values[ind];
        const side = keys[ind];
        if (val === undefined || side === undefined) {
            throw new Known500Error(
                `keys [${keys}] and values [${values}] are mismatched!`,
            );
        }
        const sep = ': ';
        rows.push(
            <div key={ind}>
                <b>{side}</b>
                {sep}
                {parser(val, side)}
            </div>,
        );
    }
    return [<Fragment key={0}>{rows}</Fragment>, rows.length];
}

type Events = [() => void, string, Element][];

interface RowElProps {
    chi: [number, JSX.Element][];
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
    stEv: (eve: Events) => void;
    events: Events;
}
interface RowChildProps {
    chiEl: [number, JSX.Element];
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
    stEv: (eve: Events) => void;
}

function RowWTT({ chiEl, hooks, stEv }: RowChildProps): JSX.Element {
    const rowRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        crToolTip(
            [rowRef, hooks],
            () => {
                if (hooks.data !== undefined) {
                    hooks.data(chiEl[0]);
                }
            },
            stEv,
        );
    }, [chiEl, hooks, stEv]);
    return (
        <div ref={rowRef} {...TT_TAR}>
            {chiEl[1]}
        </div>
    );
}

function RowElWTT(props: RowElProps): JSX.Element {
    const { events, chi, hooks, stEv } = props;
    for (const eve of events) {
        if (eve[1] === 'blur') {
            eve[0]();
        }
        eve[2].removeEventListener(eve[1], eve[0]);
    }
    return (
        <>
            {chi.map((val, ind) => (
                <RowWTT chiEl={val} hooks={hooks} stEv={stEv} key={ind} />
            ))}
        </>
    );
}

interface DotTTProps {
    head: string;
    data: string[];
    hook: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
}

function DotTT({ head, data, hook }: DotTTProps): JSX.Element | null {
    const ref = useRef<HTMLSpanElement>(null);
    const results = data.join(', ');
    useTooltipForRef(
        ref,
        hook,
        () => {
            if (hook.data !== undefined) {
                hook.data(
                    <p>
                        <b>
                            {head}
                            :
                            {' '}
                        </b>
                        {results}
                    </p>,
                );
            }
        },
        [50, 50],
    );
    return <span ref={ref}>...</span>;
}

export {
    create2ColDiv,
    createBoolIcon,
    createDepositTile,
    createDoiLink,
    createPassCulHref,
    createPassLinkStrain,
    createSeqAccLink,
    createSimpleTiles,
    createStrainTile,
    DotTT,
    parseVal2Html,
    RowElWTT,
};
