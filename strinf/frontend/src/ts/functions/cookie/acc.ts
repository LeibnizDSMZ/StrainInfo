import { Cookie, CookieValue } from '@strinf/ts/constants/style/Acc';

const CONTRAST = new RegExp(`.*\\s?${Cookie.contrast}=${CookieValue.contrast};?.*`);
const TRANSITION = new RegExp(
    `.*\\s?${Cookie.transitions}=${CookieValue.transitions};?.*`,
);
const DYSLEXIA = new RegExp(`.*\\s?${Cookie.dyslexia}=${CookieValue.dyslexia};?.*`);

function isContrastSet(): boolean {
    return CONTRAST.test(document.cookie);
}

function isTransitionSet(): boolean {
    return TRANSITION.test(document.cookie);
}

function isDyslexiaSet(): boolean {
    return DYSLEXIA.test(document.cookie);
}

function setCookie(name: string, value: string, domain: string): void {
    const expTime = new Date();
    expTime.setTime(expTime.getTime() + 100 * 24 * 3600 * 1000);
    const cookStr
        = `${name}=${value};Secure;SameSite=Strict;`
            + `domain=${domain};expires=${expTime};Path=/;`;
    document.cookie = cookStr;
}

const SUB = /^[^.]+\.(.+)$/;

function asSubDomain(domain: string): string {
    const subDom = SUB.exec(domain);
    const [, matchD] = subDom ?? [];
    if (matchD !== undefined) {
        return matchD;
    }
    return domain;
}

function setContrast(value: string, domain: string): void {
    setCookie(Cookie.contrast, value, asSubDomain(domain));
}

function setDyslexia(value: string, domain: string): void {
    setCookie(Cookie.dyslexia, value, asSubDomain(domain));
}

function setTransition(value: string, domain: string): void {
    setCookie(Cookie.transitions, value, asSubDomain(domain));
}

function getActiveWrapperCookies(): string[] {
    const cookiesClass = [];
    if (isContrastSet()) {
        cookiesClass.push(CookieValue.contrast);
    }
    if (isDyslexiaSet()) {
        cookiesClass.push(CookieValue.dyslexia);
    }
    if (isTransitionSet()) {
        cookiesClass.push(CookieValue.transitions);
    }
    return cookiesClass;
}

function getAllWrapperCookies(): string[] {
    return [CookieValue.dyslexia, CookieValue.transitions, CookieValue.contrast];
}

export {
    getActiveWrapperCookies,
    getAllWrapperCookies,
    isContrastSet,
    isDyslexiaSet,
    isTransitionSet,
    setContrast,
    setDyslexia,
    setTransition,
};
