import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import Known500Error from '@strinf/ts/errors/known/500';
import type { ConfLinkT } from '@strinf/ts/interfaces/misc/configs';
import type { LocationHook } from 'preact-iso';

function routeUri(uri: string, replace: string, location: LocationHook): void {
    if (uri.length === 0) {
        throw new Known500Error('uri is empty');
    }
    location.route(uri, replace.length > 0);
}

function scrollToId(aId: string): void {
    if (aId !== '') {
        window.location.hash = `#${aId}`;
    }
}

async function checkRespArr<E>(
    response: Response,
    mapFun: (data: unknown) => E
): Promise<E[]> {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (isJson === true && (response.ok || response.status === 404)) {
        const res = await response.json();
        if (Array.isArray(res)) {
            return res.map((val) => mapFun(val));
        }
    }
    throw new Known500Error(
        `RESP JSON: ${response.status}, ${response.headers.get('content-type')}`
    );
}

async function checkRespObj<E>(
    response: Response,
    checkFun: (data: unknown) => data is E
): Promise<E> {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (isJson === true && (response.ok || response.status === 404)) {
        const res = await response.json();
        if (checkFun(res)) {
            return res;
        }
    }
    throw new Known500Error(
        `RESP OBJ: ${response.status}, ${response.headers.get('content-type')}`
    );
}

async function checkRespTyp<E>(
    response: Response,
    mapFun: (data: unknown) => E
): Promise<E> {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (isJson === true && (response.ok || response.status === 404)) {
        const res = await response.json();
        return mapFun(res);
    }
    throw new Known500Error(
        `RESP OBJ: ${response.status}, ${response.headers.get('content-type')}`
    );
}

const MAX_RETIRES = 5;

async function delay(retries: number): Promise<void> {
    await new Promise((reso) => setTimeout(reso, 500 * (MAX_RETIRES + 1 - retries)));
}

async function fetchRetry(
    url: string,
    fetchInit: RequestInit | undefined = undefined,
    retries: number = MAX_RETIRES
): Promise<Response> {
    if (retries > MAX_RETIRES) {
        retries = MAX_RETIRES;
    }
    try {
        const resp = await fetch(url, fetchInit);
        if (!resp.ok && resp.status !== 404 && retries > 0) {
            await delay(retries);
            return await fetchRetry(url, fetchInit, retries - 1);
        } else {
            return resp;
        }
    } catch (err: unknown) {
        if (retries > 0) {
            await delay(retries);
            return fetchRetry(url, fetchInit, retries - 1);
        } else {
            throw err;
        }
    }
}

function isDefaultPort(prot: string, port: number): boolean {
    switch (prot) {
        case 'https':
            return port === 443;
        case 'http':
            return port === 80;
        default:
            return false;
    }
}

function link2uri(conf: ConfLinkT): URL {
    if (isDefaultPort(conf.protocol, conf.port)) {
        return new URL(`${conf.protocol}://${conf.domain}`);
    }
    return new URL(`${conf.protocol}://${conf.domain}:${conf.port}`);
}

function createUrlStr(conf: ConfLinkT, urlPath: string): string {
    const extRe = !urlPath.startsWith('/') ? `/${urlPath}` : urlPath;
    return new URL(extRe, link2uri(conf)).href;
}

function hidePrivateInfo(): void {
    if (
        window.location.pathname === UIApiCon.contact &&
        window.location.search.length > 0
    ) {
        window.history.replaceState(null, '', UIApiCon.contact);
    }
}

function getCurFullPath(): string {
    return new URL(`${window.origin}${window.location.pathname}`).href;
}

function getCurFullPathWithArgs(extraArgs: string): string {
    const mainUrl = `${window.origin}${window.location.pathname}`;
    let { search } = window.location;
    if (extraArgs !== '') {
        search = search === '' ? `?${extraArgs}` : `&${extraArgs}`;
    }
    return new URL(`${mainUrl}${search}`).href;
}

export {
    scrollToId,
    routeUri,
    checkRespArr,
    checkRespObj,
    checkRespTyp,
    createUrlStr,
    hidePrivateInfo,
    getCurFullPath,
    getCurFullPathWithArgs,
    fetchRetry,
};
