import type { JSX } from 'preact';
import logoI from '@assets/logo/strinf.webp';

function LogoStrainInfoVD(): JSX.Element {
    return <img fetchPriority="high" height="100" src={logoI} alt="StrainInfo" />;
}
export default LogoStrainInfoVD;
