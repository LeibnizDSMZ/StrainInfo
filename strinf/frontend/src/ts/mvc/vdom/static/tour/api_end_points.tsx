type ELE_RO = Omit<Element, 'id'> & {
    readonly id: string;
};

function getShadowRootEle(
    selector: () => HTMLCollectionOf<Element>,
    validate: (ele: ELE_RO) => boolean,
): Element | null {
    for (const chi of selector()[0]?.shadowRoot?.children ?? []) {
        if (validate(chi)) {
            return chi;
        }
    }
    return null;
}

function mainSelector(): HTMLCollectionOf<Element> {
    return document.getElementsByTagName('rapi-doc');
}

function getEndPoint(): HTMLElement | null {
    const root = getShadowRootEle(
        mainSelector,
        (chi: ELE_RO) => chi.id === 'the-main-body',
    );
    const endP = root?.getElementsByClassName('section-tag')[0];
    if (endP instanceof HTMLElement) {
        return endP;
    }
    return null;
}

function openEndPointPath(): void {
    const path = getEndPoint()?.getElementsByClassName('m-endpoint')[0];
    if (path instanceof HTMLElement) {
        path.querySelector('summary')?.click();
    }
}

function getEndPointPath(): HTMLElement | null {
    const path = getEndPoint()?.getElementsByClassName('m-endpoint')[0];
    if (path instanceof HTMLElement) {
        return path;
    }
    return null;
}

function getApiReqShadowRoot(): HTMLCollectionOf<Element> | null {
    const root = getShadowRootEle(
        mainSelector,
        (chi: ELE_RO) => chi.id === 'the-main-body',
    );
    if (root != null) {
        return root.getElementsByTagName('api-request');
    }
    return null;
}
function getApiShadowClass(clName: string): HTMLElement | null {
    const apiReq = getApiReqShadowRoot();
    if (apiReq != null) {
        const shCl = getShadowRootEle(
            () => apiReq,
            (chi: ELE_RO) => chi.getElementsByClassName(clName).length > 0,
        )?.getElementsByClassName(clName)[0];
        if (shCl instanceof HTMLElement) {
            return shCl;
        }
    }
    return null;
}

function getApiRequest(click: boolean): HTMLElement | null {
    const tryBtn = getApiShadowClass('m-btn');
    const apiReq = getApiReqShadowRoot();
    if (tryBtn != null && apiReq != null && apiReq[0] instanceof HTMLElement) {
        if (click) {
            tryBtn.click();
        }
        return apiReq[0];
    }
    return null;
}

export { getApiRequest, getEndPoint, getEndPointPath, openEndPointPath };
