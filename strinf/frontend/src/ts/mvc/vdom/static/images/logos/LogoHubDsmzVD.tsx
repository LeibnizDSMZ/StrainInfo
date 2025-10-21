import type { JSX } from 'preact';
import src from '@extra/straininfo/logos/d3_hub.webp';
import srcFull from '@extra/straininfo/logos/d3_hub_full.webp';

function LogoHubDsmzVD({
    full,
    height,
}: {
    full: boolean;
    height?: string;
}): JSX.Element {
    const srcI = full ? srcFull : src;
    return (
        <img
            fetchPriority="high"
            height={height ?? 100}
            src={srcI}
            alt="DSMZ Digital Diversity"
        />
    );
}

export default LogoHubDsmzVD;
