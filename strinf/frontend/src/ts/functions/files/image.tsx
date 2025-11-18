import type { JSX } from 'preact';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import PreLoadH from '@strinf/ts/mvc/vdom/static/helmet/LoadH';

const bgI1920 = new URL('@assets/bg/main_1920.jpg', import.meta.url).href;
const bgI1280 = new URL('@assets/bg/main_1280.jpg', import.meta.url).href;
const bgI800 = new URL('@assets/bg/main_800.jpg', import.meta.url).href;
const bgI400 = new URL('@assets/bg/main_400.jpg', import.meta.url).href;

function selectBannerImage(): string {
    const width = window.innerWidth;
    if (width > 1280) {
        return bgI1920;
    }
    if (width > 800) {
        return bgI1280;
    }
    if (width > 400) {
        return bgI800;
    }
    return bgI400;
}

const BANNER_URL = [UIApiCon.search, UIApiCon.pass] as const;

function createPreloadBanner(): JSX.Element {
    if (UIApiCon.index === window.location.pathname) {
        return <PreLoadH type="image/jpg" id="banner_image" href={selectBannerImage()} />;
    }
    for (const ban of BANNER_URL) {
        if (window.location.pathname.startsWith(ban)) {
            return (
                <PreLoadH type="image/jpg" id="banner_image" href={selectBannerImage()} />
            );
        }
    }
    return <></>;
}

export { createPreloadBanner, selectBannerImage };
