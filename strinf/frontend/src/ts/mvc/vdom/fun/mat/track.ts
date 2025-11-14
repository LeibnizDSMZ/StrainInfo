import { matomoCallback } from '@strinf/ts/mvc/vdom/fun/mat/init';

type Matomo = [string, string[] | boolean] | string[] | (string | number)[];

function trackPageV(): void {
    const loc = window.location.href;
    matomoCallback(() => {
        window._paq = window._paq ?? [];
        window._paq.push(['setCustomUrl', loc], ['trackPageView']);
    });
}

function trackSearch(
    seaC: string,
    seaV: string,
    cnt: number,
    paV: boolean,
    time: number,
): void {
    const sea = `${seaC} - ${seaV}`;
    const loc = window.location;
    const url = `${loc.protocol}//${loc.host}${loc.pathname}`;
    if (window.lastSearch !== sea || paV) {
        matomoCallback(() => {
            window._paq = window._paq ?? [];
            const paq: Matomo[] = [];
            if (paV) {
                paq.push(['setCustomUrl', url]);
                paq.push(['setCustomVariable', 1, 'Response time', `${time}ms`, 'page']);
                paq.push(['trackPageView']);
            }
            paq.push(['trackSiteSearch', sea, seaC, cnt]);
            window._paq.push(...paq);
        });
    }
    window.lastSearch = sea;
}

function trackDownload(url: string, bytes: number): void {
    matomoCallback(() => {
        window._paq = window._paq ?? [];
        window._paq.push(
            ['appendToTrackingUrl', `bw_bytes=${bytes}`],
            ['trackLink', url, 'download'],
            ['appendToTrackingUrl', ''],
        );
    });
}

export { trackDownload, trackPageV, trackSearch };
