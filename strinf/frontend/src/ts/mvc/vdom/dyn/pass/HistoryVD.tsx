/*!
 * Parts of this file were based on software from:
 *
 * Author: Julia Koblitz
 * Date: 2024
 */

import type { RelT } from '@strinf/ts/interfaces/api/mapped';
import type { InValInt, InValStInt } from '@strinf/ts/interfaces/dom/inp';
import type {
    DatIdTVInt,
    TT_GL_TYPE,
    TTSrcTVInt,
} from '@strinf/ts/interfaces/dom/tooltip';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { JSX } from 'preact';
import scSty from '@strinf/css/mods/scroll.module.css';
import svgSty from '@strinf/css/mods/svg.module.css';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import PassAncId from '@strinf/ts/constants/page/pass';
import { SR_CUL_ID } from '@strinf/ts/constants/regexp/sea_reg';
import { ClHtml, Col } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import updateAnc from '@strinf/ts/functions/links/update_anc';
import updateHrefVal from '@strinf/ts/functions/links/update_href';
import { useTooltipForRef } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import * as d3Sankey from 'd3-sankey';
import { useContext as use, useRef, useState } from 'preact/hooks';

const M_TOP = 10;
const M_LEFT = 10;
const L_WID = 220;
const N_WID = 8;
const N_PAD = 10;
const N_HEI = 42;
const R_BUF = 180;
const B_BUF = 20;
const DEF_H = 800;

const FILTER_ID_L = 'filter_label';

const COLORS = new Map<string, string>([
    ['DSM', '#006EB7'],
    // data contributors
    // BCCM
    ['CCUG', '#6495D2'],
    ['LMG', '#ADC364'],
    ['IHEM', '#EC8466'],
    ['ITM', '#608398'],
    ['MUCL', '#3B3034'],
    ['DCG', '#D23035'],
    ['ULC', '#6EC0E2'],
    // ---
    ['CFBP', '#b15928'],
    ['ICMP', '#ff7f00'],
    ['CIP', '#bdbdbd'],
    // > 5000 deposits in DB
    ['ATCC', '#262355'],
    ['JCM', '#39A575'],
    ['CBS', '#CAB95C'],
    ['NBRC', '#083E8D'],
    ['IMI', '#FEAE4F'],
    ['BCRC', '#38C5B8'],
    ['NRRL', '#005941'],
    ['CGMCC', '#67B73A'],
    ['UAMH', '#012B5D'],
    ['KCTC', '#003399'],
    ['NCIMB', '#71CEF5'],
    ['VKM', '#EBE6E4'],
    ['CECT', '#082B3E'],
    ['NCTC', '#009172'],
]);

const FB_COLORS = ['#3484bb', '#ff8b25', '#40a940', '#da3c3d', '#9e75c3', '#00D7FF'];

const REG_DES = /^([A-Z]+)[^A-Z].*$/;
function getColor(ccno: string, counter: number): string {
    const known = REG_DES.exec(ccno);
    const def = FB_COLORS[counter % FB_COLORS.length] ?? '#2ca25f';
    return COLORS.get(known?.[1] ?? '') ?? def;
}

interface RelProps {
    rel: RelT[];
    detAnc: string;
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
    selCuId: number;
    hisRec: () => void;
}

const TIT = 'Strain history';
const ID = PassAncId.his;

function getAnchorH(ord: number, rel: RelT[], rec: boolean): AncT {
    if (!rec && rel.filter(([, , dep]) => dep !== undefined).length > 0) {
        return { [ord]: [ID, TIT] };
    }
    return {};
}

function formatMsg(culCnt: number): JSX.Element {
    if (culCnt === 0) {
        return <></>;
    }
    const msg = culCnt < 2 ? `: ${culCnt} collection` : `: ${culCnt} collections`;
    return (
        <span>
            <b>Send to</b>
            {msg}
        </span>
    );
}

function formatData(rel: RelT[]): DATA_T {
    const nodesMap = new Map<number, NODE_T>();
    const hasLink = new Set<number>();
    for (const [mapId, , linkId] of rel) {
        if (linkId !== undefined) {
            hasLink.add(mapId);
            hasLink.add(linkId);
        }
    }
    const fRel = rel.filter(([mId, ,]) => hasLink.has(mId));
    const husk = { name: 'unknown', color: getColor('', 1), siCu: -1 };
    const nodes = fRel.map(([mId, relI], ind) => {
        const node = { name: relI, color: getColor(relI, ind), siCu: mId };
        nodesMap.set(mId, node);
        return node;
    });
    return {
        nodes,
        links: fRel
            .filter(([, , linkId]) => linkId !== undefined)
            .map(([mId, , link]) => {
                return {
                    source: nodesMap.get(link ?? -1) ?? husk,
                    target: nodesMap.get(mId) ?? husk,
                    value: 1,
                };
            }),
    };
}
interface NODE_T {
    name: string;
    siCu: number;
    color: string;
}
interface LINK_T {
    source: NODE_T;
    target: NODE_T;
    value: number;
}
interface DATA_T {
    nodes: NODE_T[];
    links: LINK_T[];
}

interface DEF_CON {
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
    anc: string;
    ctx: InValStInt | undefined;
}

function scaleForHeight(heiMin: number, rows: number): number {
    const heightEx = rows * N_HEI + rows * N_PAD;
    const heightIS = heightEx / DEF_H;
    if (heightIS * heiMin < 28) {
        return 28 / heiMin;
    }
    return heightIS;
}

interface XYProp {
    x0: number;
    x1: number;
}

function hasXProperty(node: unknown): node is XYProp {
    if (typeof node !== 'object' || node === null) {
        return false;
    }
    return 'x1' in node && 'x0' in node;
}

function getCoords(
    node: d3Sankey.SankeyNode<NODE_T, LINK_T> | d3Sankey.SankeyLink<NODE_T, LINK_T>,
): [number, number, number, number] {
    if (hasXProperty(node)) {
        return [node.x0, node.y0 ?? 0, node.x1, node.y1 ?? 0];
    }
    return [0, node.y0 ?? 0, 0, node.y1 ?? 0];
}

function correctNodeXPos(
    node: d3Sankey.SankeyNode<NODE_T, LINK_T>,
    originX: number,
): void {
    let [x0, , x1] = getCoords(node);
    const depth = node.depth ?? 0;
    const dis = L_WID * depth + originX;
    x0 = dis;
    x1 = dis + N_WID;
    node.x0 = x0;
    node.x1 = x1;
}

function scaleNodeYPos(node: d3Sankey.SankeyNode<NODE_T, LINK_T>, scaleH: number): void {
    const [, y0, , y1] = getCoords(node);
    node.y0 = y0 * scaleH;
    node.y1 = y1 * scaleH;
}
interface GraphMap {
    oriX: number;
    width: number;
    height: number;
    scaleH: number;
}

function crNode(
    graph: d3Sankey.SankeyGraph<NODE_T, LINK_T>,
    selCuId: number,
    { hooks, anc, ctx }: DEF_CON,
): JSX.Element {
    const hookF = (rel: d3Sankey.SankeyNode<NODE_T, LINK_T>) => {
        if (hooks.data !== undefined) {
            hooks.data([rel.siCu, formatMsg(rel.sourceLinks?.length ?? 0)]);
        }
    };
    return (
        <g stroke="#000">
            {graph.nodes.map((rel, index) => {
                const [x0, y0, x1, y1] = getCoords(rel);
                const ref = useRef<SVGRectElement>(null);
                useTooltipForRef(
                    ref,
                    hooks,
                    () => {
                        hookF(rel);
                    },
                    [500, 300],
                );
                return (
                    <rect
                        ref={ref}
                        key={index}
                        className={svgSty.click}
                        strokeWidth={0.5}
                        fillOpacity={selCuId === rel.siCu ? 1 : 0.4}
                        x={x0}
                        y={y0}
                        width={x1 - x0}
                        height={y1 - y0}
                        fill={rel.color}
                        onClick={() => {
                            updateHrefVal(`${IdAcrTagCon.depId} ${rel.siCu}`, ctx);
                            updateAnc(`#${anc}`);
                        }}
                    />
                );
            })}
        </g>
    );
}

function crLink(
    graph: d3Sankey.SankeyGraph<NODE_T, LINK_T>,
    selCuId: number,
): JSX.Element {
    const linkGen = d3Sankey.sankeyLinkHorizontal();
    return (
        <g fill="none">
            {graph.links.map((rel, index) => {
                return (
                    <g
                        key={index}
                        className={svgSty.mul}
                        strokeOpacity={rel.source.siCu === selCuId ? 0.7 : 0.1}
                    >
                        <path
                            key={`p_${index}`}
                            d={linkGen(rel) ?? undefined}
                            stroke={rel.source.color}
                            className={svgSty.hover}
                            strokeWidth={Math.max(1, rel.width ?? 1)}
                        />
                    </g>
                );
            })}
        </g>
    );
}

function crLabel(
    graph: d3Sankey.SankeyGraph<NODE_T, LINK_T>,
    selCuId: number,
): JSX.Element {
    return (
        <g>
            {graph.nodes.map((rel, index) => {
                const [, y0, x1, y1] = getCoords(rel);
                return (
                    <g key={index} className={svgSty.mul}>
                        <text
                            key={`l_${index}`}
                            x={x1 + 6}
                            y={(y1 + y0) / 2}
                            dy="8px"
                            textAnchor="start"
                            fontWeight={selCuId === rel.siCu ? 'bold' : 'normal'}
                            filter={`url(#${FILTER_ID_L})`}
                            fontSize="20px"
                        >
                            {rel.name}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}

function crGraphSizes(graph: d3Sankey.SankeyGraph<NODE_T, LINK_T>): GraphMap {
    const [heightS, sizeM] = [new Set<number>(), new Map<number, number>()];
    let [originX, maxD] = [0, 0];
    for (const val of graph.nodes) {
        const dep = val.depth ?? -1;
        const locS = sizeM.get(dep) ?? 0;
        heightS.add((val.y1 ?? 1) - (val.y0 ?? 0));
        if (dep === 0) {
            originX = val.x1 ?? 0;
        }
        if (maxD < dep) {
            maxD = dep;
        }
        sizeM.set(dep, locS + 1);
    }
    sizeM.delete(-1);
    const heiMin = Math.min(...heightS);
    const rows = Math.max(...sizeM.values());
    const scaleH = scaleForHeight(heiMin, rows);
    return {
        oriX: originX,
        height: DEF_H * scaleH,
        width: maxD * N_WID + maxD * L_WID,
        scaleH,
    };
}

function crSankey(data: DATA_T): [d3Sankey.SankeyGraph<NODE_T, LINK_T>, number, number] {
    const sankey = d3Sankey
        .sankey<NODE_T, LINK_T>()
        .nodeWidth(N_WID)
        .nodePadding(N_PAD)
        .extent([
            [1, 13],
            [DEF_H - 1, DEF_H - 13],
        ])
        .nodeAlign(d3Sankey.sankeyLeft);
    const graph = sankey.nodeId(node => node.name)(data);
    const graphM = crGraphSizes(graph);
    for (const node of graph.nodes) {
        correctNodeXPos(node, graphM.oriX);
        scaleNodeYPos(node, graphM.scaleH);
        for (const link of node.sourceLinks ?? []) {
            link.width = (link.width ?? 1) * graphM.scaleH;
        }
    }
    sankey.update(graph);
    return [graph, graphM.width, graphM.height];
}

interface HStrainProps {
    data: DATA_T;
    detAnc: string;
    hooks: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
    selCuId: number;
    ctx: InValStInt | undefined;
}

function HistoryStrain({ data, hooks, detAnc, selCuId, ctx }: HStrainProps): JSX.Element {
    const [graph, width, height] = crSankey(data);
    return (
        <div style={{ minWidth: width }}>
            <svg
                viewBox={`0 0 ${width + R_BUF} ${height + B_BUF}`}
                width={width + R_BUF}
                height={height + B_BUF}
            >
                <defs>
                    <filter x="-2%" y="0" width="104%" height="100%" id={FILTER_ID_L}>
                        <feFlood floodColor="white" result="LABEL" floodOpacity={0.8} />
                        <feComposite operator="over" in2="LABEL" in="SourceGraphic" />
                    </filter>
                </defs>
                <g transform={`translate(${M_LEFT}, ${M_TOP})`}>
                    {crLink(graph, selCuId)}
                    {crNode(graph, selCuId, {
                        hooks,
                        anc: detAnc,
                        ctx,
                    })}
                    {crLabel(graph, selCuId)}
                </g>
            </svg>
        </div>
    );
}

function hasCycle(
    key: number,
    graph: Map<number, Set<number>>,
    visited: Set<number>,
    verified: Set<number>,
): [boolean, Set<number>] {
    visited.add(key);
    const target = graph.get(key)?.values().next().value;
    if (target !== undefined) {
        if (verified.has(target)) {
            return [false, visited];
        }
        if (visited.has(target)) {
            return [true, visited];
        }
        return hasCycle(target, graph, visited, verified);
    }
    return [false, visited];
}

function detectRec(data: DATA_T): boolean {
    const graph = new Map<number, Set<number>>();
    for (const link of data.links) {
        if (!graph.has(link.source.siCu)) {
            graph.set(link.source.siCu, new Set<number>());
        }
        graph.get(link.source.siCu)?.add(link.target.siCu);
    }
    const verified = new Set<number>();
    for (const src_key of graph.keys()) {
        if (verified.has(src_key)) {
            continue;
        }
        const [loop, visited] = hasCycle(src_key, graph, new Set<number>(), verified);
        if (loop) {
            return true;
        }
        verified.union(visited);
    }
    return false;
}

function HistoryVD({
    rel,
    hooks,
    detAnc,
    selCuId,
    hisRec,
}: RelProps): JSX.Element | null {
    const data = formatData(rel);
    const [selSiCu, setSelSiCu] = useState<number>(selCuId);
    const ctx: (InValStInt & InValInt) | undefined = use(MainConGl);
    if (detectRec(data)) {
        hisRec();
        return null;
    }
    if (data.nodes.length < 2) {
        return null;
    }
    ctx?.inValSet('HistoryVD')((val: string) => {
        const valInt = Number.parseInt(
            val.replace(new RegExp(IdAcrTagCon.depId, 'i'), '').replace(/,.*/, ''),
            10,
        );
        if (!Number.isNaN(valInt) && SR_CUL_ID.test(val)) {
            setSelSiCu(valInt);
        }
    });
    return (
        <div id={IdHtmlTour.passStrHis} className={Col.col}>
            <h3 className={ClHtml.titSec}>
                {TIT}
                <span id={ID} />
            </h3>
            <section className={scSty.mobile}>
                <HistoryStrain
                    data={data}
                    hooks={hooks}
                    detAnc={detAnc}
                    selCuId={selSiCu}
                    ctx={ctx}
                />
            </section>
        </div>
    );
}

export default HistoryVD;

export { getAnchorH };
