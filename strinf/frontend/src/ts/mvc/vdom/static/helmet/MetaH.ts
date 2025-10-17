import { useEffect } from 'preact/hooks';

function MetaH({
    desc,
    title,
    index,
}: {
    desc: string;
    title: string;
    index?: false;
}): null {
    useEffect(() => {
        const metaCl = 'meta_head_main';
        document.head.querySelector(`.${metaCl}`)?.remove();
        if (desc) {
            document.head.querySelector('meta[name=\'description\']')?.remove();
            const meDesc = document.createElement('meta');
            meDesc.setAttribute('name', 'description');
            meDesc.setAttribute('content', desc);
            meDesc.setAttribute('class', metaCl);
            document.head.appendChild(meDesc);
        }
        if (title) {
            document.head.querySelector('title')?.remove();
            const meTitle = document.createElement('title');
            meTitle.setAttribute('class', metaCl);
            meTitle.text = title;
            document.head.appendChild(meTitle);
        }
        if (index !== undefined) {
            document.head.querySelector('meta[name=\'robots\']')?.remove();
            const meDesc = document.createElement('meta');
            meDesc.setAttribute('name', 'robots');
            meDesc.setAttribute('content', 'noindex');
            meDesc.setAttribute('class', metaCl);
            document.head.appendChild(meDesc);
        }
        return () => {
            document.head.querySelector(`.${metaCl}`)?.remove();
        };
    }, [desc, index, title]);

    return null;
}

export default MetaH;
