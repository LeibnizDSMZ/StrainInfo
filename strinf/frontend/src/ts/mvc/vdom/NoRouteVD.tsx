import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import type { JSX } from 'preact';
import errSty from '@strinf/css/mods/error.module.css';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import HeadT from '@strinf/ts/constants/type/HeadT';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { useContext as use } from 'preact/hooks';

interface EmptyProps {
    path: string;
}

function NoRouteVD({ path }: EmptyProps): JSX.Element {
    const ctx: BreadCrumbsG | undefined = use(MainConGl);
    if (ctx?.bread !== undefined) {
        for (const actF of ctx.bread) {
            actF(HeadT.HOME);
        }
    }
    return (
        <section className={ClHtml.sec}>
            <div className={ClHtml.con}>
                <div className={errSty.err}>
                    <h1>404</h1>
                    <h2>
                        Route not found -
                        {path}
                    </h2>
                </div>
            </div>
        </section>
    );
}

export default NoRouteVD;
