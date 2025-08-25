import { useEffect } from 'preact/hooks';

function SchemaMainH({ json }: { json: string }): null {
    const fId = 'main_site_schema';
    useEffect(() => {
        const nonce: unknown = window[import.meta.env.VITE_NONCE_NAME];
        document.querySelector(`#${fId}`)?.remove();
        const script = document.createElement('script');
        if (typeof nonce === 'string') {
            script.setAttribute('nonce', nonce);
        }
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', fId);
        script.text = json;
        document.head.appendChild(script);
        return () => {
            document.querySelector(`#${fId}`)?.remove();
        };
    }, [json]);

    return null;
}

export default SchemaMainH;
