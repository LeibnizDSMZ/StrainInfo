function isFunction(func: unknown): func is CallableFunction {
    return typeof func === 'function';
}

function onPrError(err: unknown): void {
    const onErrF = window.onerror;
    if (isFunction(onErrF)) {
        onErrF('', undefined, undefined, undefined, err);
    }
}

export default onPrError;
