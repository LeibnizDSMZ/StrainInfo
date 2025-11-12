import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import type { JSX } from 'preact';
import StrainRegistry from '@strinf/md/registry/strain_registry.mdx';

import HeadT from '@strinf/ts/constants/type/HeadT';
import { getCurFullPath } from '@strinf/ts/functions/http/http';

import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import CanonH from '@strinf/ts/mvc/vdom/static/helmet/CanonH';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import { memo } from 'preact/compat';
import { useContext as use } from 'preact/hooks';

function StrRegM(): JSX.Element {
    const ctx: BreadCrumbsG | undefined = use(MainConGl);
    if (ctx?.bread !== undefined) {
        for (const actF of ctx.bread) {
            actF(HeadT.STRREG);
        }
    }
    return (
        <>
            <MetaH title="StrainRegistry" desc="StrainRegistry" />
            <CanonH href={getCurFullPath()} />
            <StrainRegistry />{' '}
        </>
    );
}

const StrainRegistryVD = memo(StrRegM);

export default StrainRegistryVD;
