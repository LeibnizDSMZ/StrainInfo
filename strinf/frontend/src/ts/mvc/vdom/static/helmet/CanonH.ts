import { useEffect } from 'preact/hooks';

function CanonH({ href }: { href: string }): null {
    useEffect(() => {
        const fId = `canonical_url`;
        document.querySelector(`#${fId}`)?.remove();
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', href);
        link.setAttribute('id', fId);
        document.head.appendChild(link);
        return () => {
            document.querySelector(`#${fId}`)?.remove();
        };
    }, [href]);

    return null;
}

export default CanonH;
