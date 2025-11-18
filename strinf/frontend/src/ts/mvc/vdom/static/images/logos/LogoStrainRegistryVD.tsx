import type { JSX } from 'preact';

const logoI = new URL('@assets/logo/streg.webp', import.meta.url).pathname;

function LogoStrainRegistryVD(): JSX.Element {
    return (
        <img loading="lazy" height="111" width="700" src={logoI} alt="StrainRegistry" />
    );
}
export default LogoStrainRegistryVD;
