import type { JSX } from 'preact';
import { memo } from 'preact/compat';
import { useContext } from 'preact/hooks';

import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';

import HeadT from '@strinf/ts/constants/type/HeadT';
import { Helmet } from 'react-helmet';
import { getCurFullPath } from '@strinf/ts/functions/http/http';

import StrainRegistry from '@strinf/md/registry/strain_registry.mdx';

function StrRegM(): JSX.Element {
    const ctx: BreadCrumbsG | undefined = useContext(MainConGl);
    if (ctx?.bread !== undefined) {
        ctx.bread.map((actF) => {
            actF(HeadT.STRREG);
        });
    }
    return (
        <>
            <Helmet>
                <meta name="description" content="StrainRegistry" />
                <link rel="canonical" href={getCurFullPath()} />
                <title>StrainRegistry</title>
            </Helmet>
            <StrainRegistry />{' '}
        </>
    );
}

const StrainRegistryVD = memo(StrRegM);

export default StrainRegistryVD;
