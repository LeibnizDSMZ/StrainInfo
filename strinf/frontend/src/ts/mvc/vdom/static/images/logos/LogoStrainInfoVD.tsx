import type { JSX } from 'preact';

const logoI = new URL('@assets/logo/strinf.webp', import.meta.url).pathname;

function LogoStrainInfoVD(): JSX.Element {
    return <img fetchPriority="high" height="100" src={logoI} alt="StrainInfo" />;
}
export default LogoStrainInfoVD;
