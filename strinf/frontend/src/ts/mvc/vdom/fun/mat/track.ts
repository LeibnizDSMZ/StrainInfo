import { matomoCallback } from '@strinf/ts/mvc/vdom/fun/mat/init';

function trackPageV(): void {
    const loc = window.location.href;
    matomoCallback(() => {
        window._paq = window._paq ?? [];
        window._paq.push(['setCustomUrl', loc]);
        window._paq.push(['trackPageView']);
    });
}

function trackPageRootV(time: number): void {
    const loc = window.location;
    const url = `${loc.protocol}//${loc.host}${loc.pathname}`;
    matomoCallback(() => {
        window._paq = window._paq ?? [];
        window._paq.push(['setCustomUrl', url]);
        window._paq.push(['setCustomVariable', 1, 'Response time', `${time}ms`, 'page']);
        window._paq.push(['trackPageView']);
    });
}

function trackSearch(
    seaC: string,
    seaV: string,
    cnt: number,
    paV: boolean,
    time: number,
): void {
    if (paV) {
        trackPageRootV(time);
    }
    const sea = `${seaC} - ${seaV}`;
    if (window.lastSearch !== sea) {
        matomoCallback(() => {
            window._paq = window._paq ?? [];
            window._paq.push(['trackSiteSearch', sea, seaC, cnt]);
        });
    }
    window.lastSearch = sea;
}

function trackDownload(url: string, bytes: number): void {
    matomoCallback(() => {
        window._paq = window._paq ?? [];
        window._paq.push(['appendToTrackingUrl', `bw_bytes=${bytes}`]);
        window._paq.push(['trackLink', url, 'download']);
        window._paq.push(['appendToTrackingUrl', '']);
    });
}

export { trackDownload, trackPageV, trackSearch };
