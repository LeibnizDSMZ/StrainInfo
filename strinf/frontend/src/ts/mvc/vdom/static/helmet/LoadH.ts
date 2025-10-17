import { useEffect } from 'preact/hooks';

type IMG = 'image/webp' | 'image/png' | 'image/jpg';
function getAs(type: IMG): string {
    if (['image/webp', 'image/png', 'image/jpg'].includes(type)) {
        return 'image';
    }
    return 'fetch';
}

function PreLoadH({ id, href, type }: { id: string; href: string; type: IMG }): null {
    const fId = `${id}_preload`;
    useEffect(() => {
        document.querySelector(`#${fId}`)?.remove();
        const link = document.createElement('link');
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', getAs(type));
        link.setAttribute('href', href);
        link.setAttribute('id', fId);
        document.head.appendChild(link);
        return () => {
            document.querySelector(`#${fId}`)?.remove();
        };
    }, [href, fId, type]);

    return null;
}

export default PreLoadH;
