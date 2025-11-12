/*!
 * Parts of this file were based on software with the following license:
 *
 * Copyright 2017–2023 Observable, Inc.
 * Licensed under the ISC license
 */

import type { DiaCon, DiaDataCPS, DiaSetF } from '@strinf/ts/interfaces/dom/dia';
import type { TTHookG } from '@strinf/ts/interfaces/dom/global';
import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type * as d3 from 'd3';
import type { JSX } from 'preact';
import svgSty from '@strinf/css/mods/svg.module.css';
import { Col, Tex } from '@strinf/ts/constants/style/ClHtml';
import DiaT from '@strinf/ts/constants/type/DiaT';
import Known500Error from '@strinf/ts/errors/known/500';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import { useTooltipForRef } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { axisBottom, axisLeft, scaleBand, scaleLinear, select } from 'd3';
import { useContext as use, useRef, useState } from 'preact/hooks';

interface CpsProps {
    dia: DiaSetF;
}

const WIDTH = 800;
const HEIGHT = 400;

const M_TOP = 40;
const M_BOTTOM = 40;
const M_LEFT = 80;
const M_RIGHT = 40;

const P_BAR = 20;

const W_IN = WIDTH - M_RIGHT;
const H_IN = HEIGHT - M_BOTTOM;

function createXScale(ticks: string[] | number[]): d3.ScaleBand<string> {
    return scaleBand()
        .domain(ticks.map((tick) => tick.toString()))
        .range([M_LEFT, W_IN]);
}

function createTitle(): JSX.Element {
    return (
        <text
            x={400}
            y={20}
            fontSize="1.4rem"
            style={{
                'text-anchor': 'middle',
                fill: '#404040',
            }}
        >
            Deposits per strain distribution
        </text>
    );
}

function createXLabel(label: string): JSX.Element {
    return (
        <text
            x={400}
            y={395}
            fontSize="1.2rem"
            style={{
                'text-anchor': 'middle',
                fill: 'grey',
            }}
        >
            {label}
        </text>
    );
}

function createYLabel(label: string): JSX.Element {
    return (
        <text
            x={-200}
            y={10}
            fontSize="1.2rem"
            transform="rotate(-90)"
            style={{
                'text-anchor': 'middle',
                fill: 'grey',
            }}
        >
            {label}
        </text>
    );
}

function createYScale(ticks: string[] | number[]): d3.ScaleLinear<number, number> {
    let [minV, maxV] = [0, 0];
    for (const val of ticks) {
        maxV = typeof val !== 'string' && val > maxV ? val : maxV;
    }
    return scaleLinear()
        .domain([minV, maxV + Math.floor(0.1 * maxV)])
        .range([H_IN, M_TOP]);
}

interface ScaleT<T> {
    scale: d3.Axis<T>;
    transform: string;
    opa?: number;
    stW?: number;
    cla?: string;
}

function Scale<T>({ scale, transform, opa, stW, cla }: ScaleT<T>): JSX.Element {
    return (
        <g
            ref={(dom) => {
                if (dom !== null) {
                    select(dom).call(scale);
                }
            }}
            className={`${Tex.m} ${cla ?? ''}`}
            transform={transform}
            style={{
                'stroke-opacity': opa ?? 1.0,
                'stroke-width': stW ?? 1.0,
            }}
        />
    );
}

interface DataT {
    scX: d3.ScaleBand<string>;
    scY: d3.ScaleLinear<number, number>;
    data: DiaDataCPS;
    ttH: ToolTipHookInt<TT_GL_TYPE> | undefined;
}

function wrCulText(cnt: number | string): string {
    const cntL = typeof cnt !== 'number' ? Number.parseInt(cnt, 10) : cnt;
    if (Number.isNaN(cntL) || cntL > 1) {
        return `${cnt} deposits`;
    }
    return 'one deposit';
}

interface RectDiaT {
    scX: d3.ScaleBand<string>;
    scY: d3.ScaleLinear<number, number>;
    index: number;
    val: string | number;
    yDa: string[] | number[];
    ttH: ToolTipHookInt<TT_GL_TYPE>;
}

function RectDia({ scX, scY, val, index, yDa, ttH }: RectDiaT): JSX.Element {
    const ref = useRef<SVGRectElement>(null);
    const parser = (toParse: unknown) => {
        return typeof toParse !== 'number' ? 0 : toParse;
    };
    useTooltipForRef(
        ref,
        ttH,
        () => {
            if (ttH.data !== undefined) {
                const textB = `Strains with ${wrCulText(val)}`;
                const text = `: ${yDa[index]}`;
                ttH.data(
                    <p>
                        <b>{textB}</b>
                        {text}
                    </p>
                );
            }
        },
        [50, 50]
    );
    return (
        <rect
            ref={ref}
            x={scX(`${val}`)}
            y={scY(parser(yDa[index]))}
            height={scY(0) - scY(parser(yDa[index]))}
            width={scX.bandwidth() - P_BAR}
            transform={`translate(${P_BAR / 2},-0.5)`}
            rx="0.5"
            ry="0.5"
            className={svgSty.hover}
            style={{
                'stroke-width': 0.5,
                stroke: 'gray',
                'fill-opacity': 0.9,
            }}
        />
    );
}

function Dia({ data, scX, scY, ttH }: DataT): JSX.Element | null {
    const [xDa, yDa] = [data.data[data.keys.x], data.data[data.keys.y]];
    if (xDa === undefined || yDa === undefined || ttH === undefined) {
        return null;
    }
    return (
        <g fill="rgb(236, 175, 0, 0.75)">
            {xDa.map((val, index) => {
                return (
                    <RectDia
                        key={index}
                        scX={scX}
                        scY={scY}
                        index={index}
                        val={val}
                        yDa={yDa}
                        ttH={ttH}
                    />
                );
            })}
        </g>
    );
}

function CpsDia({ dia }: { dia: DiaCon }): JSX.Element {
    const cps = dia[DiaT.CPS];
    const ctx: TTHookG<TT_GL_TYPE> | undefined = use(MainConGl);
    const ttH = ctx?.getTTHook(TT_ID_SIM);
    if (cps === undefined) {
        throw new Known500Error('canvas has no 2d context or cps dia was not defined');
    }
    const [scX, scY, laX, laY] = [
        createXScale(cps.data[cps.keys.x] ?? []),
        createYScale(cps.data[cps.keys.y] ?? []),
        createXLabel(cps.keys.x),
        createYLabel(cps.keys.y),
    ];
    const [axX, axY] = [
        axisBottom(scX).tickSizeOuter(0),
        axisLeft(scY).ticks(5).tickSizeOuter(0),
    ];
    const [grY, grX] = [
        axisLeft(scY)
            .ticks(5)
            .tickSize(-W_IN + M_LEFT)
            .tickSizeOuter(0)
            .tickFormat(() => ''),
        axisBottom(scX)
            .tickSize(-H_IN + M_TOP)
            .tickSizeOuter(0)
            .tickFormat(() => ''),
    ];
    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {createTitle()}
            {laX}
            <Scale transform={`translate(0,${H_IN})`} scale={axX} />
            {laY}
            <Scale transform={`translate(${M_LEFT},0)`} scale={axY} />
            <Scale transform={`translate(${M_LEFT},0)`} scale={grY} opa={0.8} stW={0.3} />
            <Scale
                transform={`translate(${scX.bandwidth() / 2},${H_IN})`}
                scale={grX}
                opa={0.8}
                stW={0.3}
                cla={svgSty.grid}
            />
            <Dia data={cps} scX={scX} scY={scY} ttH={ttH} />
        </svg>
    );
}

function CpsVD({ dia: pDia }: CpsProps): JSX.Element | null {
    const [dia, setDia] = useState<DiaCon | undefined>();
    pDia(setDia);
    if (dia === undefined) {
        return null;
    }
    return (
        <div className={Col.lN10}>
            <CpsDia dia={dia} />
        </div>
    );
}

export default CpsVD;
