import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { JSX } from 'preact';
import { ClHtml, Col, Dis, Pad, ZInd } from '@strinf/ts/constants/style/ClHtml';
import { memo } from 'preact/compat';

interface PageNav {
    children: JSX.Element[];
    tId?: string;
}

interface NavT {
    children: JSX.Element[];
}

function Nav({ children }: NavT): JSX.Element | null {
    if (children.length === 0) {
        return null;
    }
    return (
        <>
            <div className={ClHtml.tit}>On this page</div>
            {children}
        </>
    );
}

function OnPageNavVD({ children, tId = undefined }: PageNav): JSX.Element {
    return (
        <div
            className={`${Col.lN3} ${Dis.dNone} ${Dis.dBL}`}
            {...(tId === undefined ? {} : { id: tId })}
        >
            <div className={`${ClHtml.pageNav} ${ZInd.N10} ${Pad.tN15}`}>
                <div className={ClHtml.cnt}>
                    <Nav>{children}</Nav>
                </div>
            </div>
        </div>
    );
}

function createNavLinks(anc: AncT | undefined): JSX.Element[] {
    if (anc === undefined) {
        return [];
    }
    const res: JSX.Element[] = [];
    for (const key of Object.keys(anc)
        .sort()
        .map(ele => Number(ele))) {
        const val = anc[key];
        if (val !== undefined) {
            res.push(
                <a key={val[0]} href={`#${val[0]}`}>
                    {val[1]}
                </a>,
            );
        }
    }
    return res;
}

export default memo(OnPageNavVD);
export { createNavLinks };
