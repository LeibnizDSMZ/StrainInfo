import type { JSX } from 'preact';
import hubSty from '@strinf/css/mods/hub.module.css';
import tabSty from '@strinf/css/mods/tab.module.css';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import {
    ClHtml,
    Col,
    Dis,
    Font,
    Hei,
    Mar,
    Pad,
    Tex,
    Wid,
} from '@strinf/ts/constants/style/ClHtml';
import UserPicVD from '@strinf/ts/mvc/vdom/static/images/user/UserPicVD';

interface TabT {
    children: JSX.Element[];
}
function TableWr({ children }: TabT): JSX.Element {
    const tabG = `${ClHtml.tab} ${ClHtml.sm} ${ClHtml.hov} ${tabSty.gfmtab}`;
    return <table className={tabG}>{children}</table>;
}

interface TeamT {
    children: JSX.Element[];
}
function TeamWr({ children }: TeamT): JSX.Element {
    const teamR = `${ClHtml.row} ${ClHtml.rowEq} ${Hei.f}`;
    return <div className={teamR}>{children}</div>;
}

const DEF_SEP_REG = /;/;
const DEF_SEP_CH_REG = /(?:[^;]*;)+/;

interface PersT {
    children: JSX.Element[] | string;
}
function PersonWr({ children }: PersT): JSX.Element {
    const perCol = `${Col.lN3} ${Col.sN6} ${Col.mN4}`;
    let person = children;
    let glName = '';
    if (typeof children === 'string') {
        const [name, job, since] = children.split(DEF_SEP_REG);
        glName = name ?? '';
        person = [
            <h6 key="ph0" className={ClHtml.tit}>
                {name}
            </h6>,
            <span key="ps1" className={Dis.dBlock}>
                {job}
            </span>,
            <em key="pe2" className={Tex.m}>
                {since}
            </em>,
        ];
    }
    return (
        <div className={perCol}>
            <div className={`${ClHtml.box} ${Hei.N150} ${hubSty.tbox}`}>
                <div className={`${ClHtml.cnt} ${Wid.N150}`}>{person}</div>
                <UserPicVD name={glName} />
            </div>
        </div>
    );
}

function selIconH(type: string | undefined): string {
    switch (type) {
        case 'Species':
            return `${ClHtml.taxI} ${Wid.N50}`;
        case 'Deposit':
            return `${ClHtml.micI} ${Wid.N50}`;
        case 'Strain':
            return `${ClHtmlI.cont} ${Wid.N50}`;
        default:
            return '';
    }
}

function selColH(type: string | undefined): string {
    switch (type) {
        case 'Species':
            return ClHtml.dan;
        case 'Deposit':
            return ClHtml.suc;
        case 'Strain':
            return ClHtml.pri;
        default:
            return '';
    }
}

function selTexF(type: string | undefined): string {
    switch (type) {
        case 'Species':
            return Font.ita;
        default:
            return '';
    }
}
interface StrainT {
    children: JSX.Element[] | string;
}
function StrHierWr({ children }: StrainT): JSX.Element | null {
    let parseEle: string | JSX.Element[] | JSX.Element = children;
    let wrapped: (string | JSX.Element[] | JSX.Element)[] = [];
    if (
        Array.isArray(children) &&
        children.length > 0 &&
        typeof children[0] === 'string'
    ) {
        [parseEle, ...wrapped] = children;
    }
    if (typeof parseEle === 'string' && DEF_SEP_CH_REG.test(parseEle)) {
        const [type, culture, strain] = parseEle.split(DEF_SEP_REG);
        const hierarchy = [
            <h6 key="ph0" className={ClHtml.tit}>
                {type}
            </h6>,
            <span key="ps1" className={Dis.dBlock}>
                {culture}
            </span>,
            <em key="pe2" className={Tex.m}>
                {strain}
            </em>,
        ];
        const conCl = `${selColH(type)} ${ClHtml.box} 
        ${Hei.N100} ${Wid.N200}`;
        wrapped = [
            <div key="mainwrap0" className={conCl}>
                <i
                    className={`${selIconH(type)} ${Tex.m} ${Pad.tN5}`}
                    style={{ float: 'right', fontSize: '1.5em', display: 'float' }}
                />
                <div className={`${selTexF(type)} ${ClHtml.cnt} ${Mar.N10}`}>
                    {hierarchy}
                </div>
            </div>,
            ...wrapped,
        ];
    }
    return <>{wrapped}</>;
}

function StrHierLiWr({ children }: StrainT): JSX.Element | null {
    return (
        <li>
            <StrHierWr>{children}</StrHierWr>
        </li>
    );
}
function StrHierUlWr({ children }: StrainT): JSX.Element | null {
    return (
        <ul>
            <StrHierWr>{children}</StrHierWr>
        </ul>
    );
}
interface AncT {
    href: string;
    children: JSX.Element[];
}

function AnchorWr({ href, children }: AncT): JSX.Element {
    return (
        <a href={href} target="_blank" rel="noopener">
            {' '}
            {children}{' '}
        </a>
    );
}

interface NewsT {
    children: (string | JSX.Element)[] | JSX.Element;
}

function factoryNewsDateWr(
    main: (props: NewsT) => JSX.Element
): (props: NewsT) => JSX.Element {
    const MainCon = main;
    return function NewsDateWr({ children }: NewsT): JSX.Element {
        if (!Array.isArray(children)) {
            return <>{children}</>;
        }
        return (
            <MainCon>
                <>
                    {children.filter((ele: JSX.Element | string) => {
                        return typeof ele === 'string';
                    })}
                </>
                <h6 className={`${ClHtml.bad} ${ClHtml.mut}`} style={{ float: 'right' }}>
                    {children.filter((ele: JSX.Element | string) => {
                        return typeof ele !== 'string' && ele.type === 'date';
                    })}
                </h6>
            </MainCon>
        );
    };
}

interface UlT {
    children: JSX.Element[];
}
function UListWr({ children }: UlT): JSX.Element {
    return <ul className={`${ClHtml.lis} ${Pad.lN15}`}>{children}</ul>;
}

interface OlT {
    children: JSX.Element[];
}
function OListWr({ children }: OlT): JSX.Element {
    return <ol className={`${ClHtml.lis} ${Pad.lN15}`}>{children}</ol>;
}

export {
    AnchorWr,
    factoryNewsDateWr,
    type NewsT,
    OListWr,
    PersonWr,
    StrHierLiWr,
    StrHierUlWr,
    TableWr,
    TeamWr,
    UListWr,
};
