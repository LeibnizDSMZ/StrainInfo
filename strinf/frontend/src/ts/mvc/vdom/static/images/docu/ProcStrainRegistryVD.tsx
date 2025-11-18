import type { JSX } from 'preact';

const Prog = new URL('@assets/dia/streg_proc.jpg', import.meta.url).pathname;

function ProcStrainRegistryVD(): JSX.Element {
    return (
        <img
            loading="lazy"
            width="560"
            src={Prog}
            alt="StrainRegistry registrationprocedure"
        />
    );
}
export default ProcStrainRegistryVD;
