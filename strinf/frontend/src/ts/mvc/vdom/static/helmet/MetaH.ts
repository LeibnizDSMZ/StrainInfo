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
        document.head.querySelectorAll(`.${metaCl}`).forEach(el => el.remove());
        if (desc) {
            document.head
                .querySelectorAll('meta[name=\'description\']')
                .forEach(el => el.remove());
            const meDesc = document.createElement('meta');
            meDesc.setAttribute('name', 'description');
            meDesc.setAttribute('content', desc);
            meDesc.setAttribute('class', metaCl);
            document.head.appendChild(meDesc);
        }
        if (title) {
            document.head.querySelectorAll('title').forEach(el => el.remove());
            const meTitle = document.createElement('title');
            meTitle.setAttribute('class', metaCl);
            meTitle.text = title;
            document.head.appendChild(meTitle);
        }
        if (index !== undefined) {
            document.head
                .querySelectorAll('meta[name=\'robots\']')
                .forEach(el => el.remove());
            const meDesc = document.createElement('meta');
            meDesc.setAttribute('name', 'robots');
            meDesc.setAttribute('content', 'noindex');
            meDesc.setAttribute('class', metaCl);
            document.head.appendChild(meDesc);
        }
        return () => {
            document.head.querySelectorAll(`.${metaCl}`).forEach(el => el.remove());
        };
    }, [desc, index, title]);

    return null;
}

export default MetaH;
