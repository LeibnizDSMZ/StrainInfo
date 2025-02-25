import type { JSX } from 'preact';
import { memo } from 'preact/compat';
import { useContext } from 'preact/hooks';

import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';

import News from '@strinf/md/news/news.mdx';
import HeadT from '@strinf/ts/constants/type/HeadT';
import {
    type NewsT,
    TableWr,
    UListWr,
    factoryNewsDateWr,
} from '@strinf/ts/functions/md/wrapper';
import { Helmet } from 'react-helmet';
import { getCurFullPath } from '@strinf/ts/functions/http/http';

function NewsM(): JSX.Element {
    const ctx: BreadCrumbsG | undefined = useContext(MainConGl);
    if (ctx?.bread !== undefined) {
        ctx.bread.map((actF) => {
            actF(HeadT.NEWS);
        });
    }
    return (
        <>
            <Helmet>
                <meta name="description" content="StrainInfo news" />
                <link rel="canonical" href={getCurFullPath()} />
                <title>StrainInfo - News</title>
            </Helmet>
            <News
                components={{
                    h2: factoryNewsDateWr(({ children }: NewsT) => <h2>{children}</h2>),
                    ul: UListWr,
                    table: TableWr,
                }}
            />
        </>
    );
}

const NewsVD = memo<(props: { path: string }) => JSX.Element>(NewsM);

export default NewsVD;
