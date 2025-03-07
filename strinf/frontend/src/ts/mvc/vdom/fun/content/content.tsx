import type { JSX } from 'preact';
import { ClHtml, Pad } from '@strinf/ts/constants/style/ClHtml';

interface ConT {
    children: JSX.Element[] | JSX.Element;
}

function Container({ children }: ConT): JSX.Element {
    return (
        <div className={ClHtml.con}>
            <div className={ClHtml.cnt}>{children}</div>
        </div>
    );
}

function ContentContainer({ children }: ConT): JSX.Element {
    return <div className={`${ClHtml.cntCon} ${Pad.bN0}`}>{children}</div>;
}

function wrapSectionGen(anc: string, head: string, cont: JSX.Element): JSX.Element {
    return (
        <>
            <h1 className={ClHtml.titSec}>{head}</h1>
            <span id={anc} />
            <section>{cont}</section>
        </>
    );
}

export { ContentContainer, Container, wrapSectionGen };
