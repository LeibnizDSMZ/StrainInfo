import type { JSX } from 'preact/jsx-runtime';
import hubSty from '@strinf/css/mods/hub.module.css';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { createUserPicMap } from '@strinf/ts/constants/resources';
import { Pad, Tex } from '@strinf/ts/constants/style/ClHtml';
import { useState } from 'preact/hooks';

function DefaultImage(): JSX.Element {
    return (
        <i
            className={`${ClHtmlI.user} ${Tex.m} ${Pad.N15}`}
            style={{
                float: 'right',
                fontSize: '3em',
                display: 'float',
            }}
        />
    );
}

const USER_PICS: [string, unknown][] = Object.entries(
    import.meta.glob('@extra/straininfo/users/*.webp', {
        eager: true,
        query: '?url',
        import: 'default',
    })
);

function setPictureSrc(picName: string, setPicP: (src: string) => void): void {
    const picMap = createUserPicMap(USER_PICS);
    const srcL = picMap.get(picName);
    if (srcL !== undefined) {
        if (srcL.startsWith('/')) {
            const pUrl = new URL(srcL, import.meta.url).href;

            fetch(pUrl)
                .then((res): void => {
                    if (res.ok && res.headers.get('content-type') === 'image/webp') {
                        setPicP(pUrl);
                    }
                })
                .catch((err: unknown) => `${err}`);
        } else if (srcL.startsWith('data:image/webp')) {
            setPicP(srcL);
        }
    }
}

function UserPicVD({ name }: { name: string }): JSX.Element {
    const [picP, setPicP] = useState<string>('');
    if (picP !== '') {
        return <img className={hubSty.timg} loading="lazy" src={picP} alt={name} />;
    }
    return (
        <i
            ref={() => {
                const pic_n = name.toLocaleLowerCase().replaceAll(/\s+/g, '_');
                setPictureSrc(pic_n, (src) => {
                    setPicP(src);
                });
            }}
        >
            <DefaultImage />
        </i>
    );
}

export default UserPicVD;
