import AlertsT from '@strinf/ts/constants/style/AlertsT';
import ErrType from '@strinf/ts/constants/type/ErrT';
import Known500Error from '@strinf/ts/errors/known/500';

function createAl(msg: string, title: string, typ: AlertsT): void {
    window.style.initStickyAlert({
        content: msg,
        title,
        alertType: typ,
        filled: false,
        hasDismissButton: true,
        timeShown: 5000,
    });
}

function crAlert(errT: ErrType | null, msg: string): void {
    switch (errT) {
        case null:
            createAl(msg, 'Info!', AlertsT.success);
            break;
        case ErrType.E404:
            createAl(msg, 'No results found!', AlertsT.error);
            break;
        case ErrType.FEWARN:
        case ErrType.INWARN:
            createAl(msg, 'Warning!', AlertsT.warning);
            break;
        default:
            throw new Known500Error(
                `alert only recognizes 404 and warnings, ${errT} given`,
            );
    }
}

export default crAlert;
