import type { StatsT } from '@strinf/ts/interfaces/misc/configs';
import CONFIG from '@strinf/ts/configs/config';
import { checkFirstCookie } from '@strinf/ts/functions/cookie/banner';

function initF(url: string, id: string): void {
    const fId = 'matomo_main_script';
    if (document.querySelector(`#${fId}`) === null) {
        window._paq = window._paq ?? [];
        window._paq.push(['setTrackerUrl', `${url}matomo.php`]);
        window._paq.push(['setSiteId', id]);

        const script = document.createElement('script');
        script.setAttribute('nonce', `${import.meta.env.VITE_NONCE_NAME}`);
        script.setAttribute('id', fId);
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', `${url}matomo.js`);
        document.head.appendChild(script);
    }
}

function initT(domains: string[]): void {
    window._paq = window._paq ?? [];
    window._paq.push(['setCookieDomain', domains]);
    window._paq.push(['setDomains', domains]);
    window._paq.push(['enableLinkTracking']);
}

function createUrl(mat: StatsT): string {
    let matPort = `:${mat.matomo.port}`;
    if (
        (mat.matomo.protocol === 'https' && mat.matomo.port === 443)
        || (mat.matomo.protocol === 'http' && mat.matomo.port === 80)
    ) {
        matPort = '';
    }
    return `${mat.matomo.protocol}://${mat.matomo.domain}${matPort}/`;
}

function initMat(mat: StatsT): void {
    if (mat.enable && window.matomoLoaded === undefined) {
        window._paq = window._paq ?? [];
        initT(mat.domain);
        initF(createUrl(mat), `${mat.id}`);
        window.matomoLoaded = true;
    }
}

function setMatomoInterval(callback: () => void, onfail: () => void): void {
    let cnt = 0;
    const interval = setInterval(() => {
        if (typeof window.Matomo === 'object') {
            clearInterval(interval);
            callback();
        }
        else if (cnt > 3) {
            clearInterval(interval);
            onfail();
        }
        else {
            cnt += 1;
        }
    }, 300);
}

function createDelayedTrack(callback: () => void): void {
    const tracked = window.tracking ?? 0;
    window.tracking = tracked + 1;
    let time = (tracked + 1) * 1000;
    if (time > 5000) {
        time = 5000;
    }
    setTimeout(() => {
        callback();
        if (window.tracking !== undefined && window.tracking > 0) {
            window.tracking -= 1;
        }
    }, time);
}

function matomoCallback(callback: () => void): void {
    if (window.matomoLoaded !== undefined) {
        createDelayedTrack(callback);
    }
    else if (checkFirstCookie()) {
        initMat(CONFIG.statistic);
        setMatomoInterval(
            () => createDelayedTrack(callback),
            () => {
                console.log('matomo not loaded');
            },
        );
    }
}

export { matomoCallback };
