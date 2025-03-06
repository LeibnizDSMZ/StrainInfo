import Known500Error from '@strinf/ts/errors/known/500';
import type { ConfConT } from '@strinf/ts/interfaces/misc/configs';
import { hasProp } from '@strinf/ts/functions/types/arr';

type IsTypeCheck = (obj: unknown) => boolean;

function isPropInObj(obj2Test: object, propList: [string, IsTypeCheck][]): boolean {
    for (const [, typeCheck] of propList) {
        if (!typeCheck(obj2Test)) {
            return false;
        }
    }
    return true;
}

function isArrayStr(arr2Test: unknown[]): boolean {
    for (const ele of arr2Test) {
        if (typeof ele !== 'string') {
            return false;
        }
    }
    return true;
}

const TYPES_URL: [string, IsTypeCheck][] = [
    [
        'domain',
        (obj: unknown): boolean =>
            hasProp('domain', obj) && typeof obj.domain === 'string',
    ],
    [
        'protocol',
        (obj: unknown): boolean =>
            hasProp('protocol', obj) &&
            typeof obj.protocol === 'string' &&
            ['http', 'https'].includes(obj.protocol),
    ],
    [
        'port',
        (obj: unknown): boolean =>
            hasProp('port', obj) && typeof obj.port === 'number' && obj.port > 0,
    ],
];

const TYPES_INDEX: [string, IsTypeCheck][] = [
    [
        'key_len',
        (obj: unknown): boolean =>
            hasProp('key_len', obj) && typeof obj.key_len === 'number' && obj.key_len > 0,
    ],
];

const TYPES_STAT: [string, IsTypeCheck][] = [
    [
        'enable',
        (obj: unknown): boolean =>
            hasProp('enable', obj) && typeof obj.enable === 'boolean',
    ],
    ['id', (obj: unknown): boolean => hasProp('id', obj) && typeof obj.id === 'number'],
    [
        'matomo',
        (obj: unknown): boolean => {
            if (hasProp('matomo', obj) && typeof obj.matomo === 'object') {
                return isPropInObj(obj.matomo ?? {}, TYPES_URL);
            }
            return false;
        },
    ],
    [
        'domain',
        (obj: unknown): boolean => {
            if (hasProp('domain', obj) && obj.domain instanceof Array) {
                return isArrayStr(obj.domain);
            }
            return false;
        },
    ],
];

const TYPES_CONF_CON: [string, IsTypeCheck][] = [
    [
        'backend',
        (obj: unknown): boolean => {
            if (hasProp('backend', obj) && typeof obj.backend === 'object') {
                return isPropInObj(obj.backend ?? {}, TYPES_URL);
            }
            return false;
        },
    ],
    [
        'frontend',
        (obj: unknown): boolean => {
            if (hasProp('frontend', obj) && typeof obj.frontend === 'object') {
                return isPropInObj(obj.frontend ?? {}, TYPES_URL);
            }
            return false;
        },
    ],
    [
        'index',
        (obj: unknown): boolean => {
            if (hasProp('index', obj) && typeof obj.index === 'object') {
                return isPropInObj(obj.index ?? {}, TYPES_INDEX);
            }
            return false;
        },
    ],
    [
        'statistic',
        (obj: unknown): boolean => {
            if (hasProp('statistic', obj) && typeof obj.statistic === 'object') {
                return isPropInObj(obj.statistic ?? {}, TYPES_STAT);
            }
            return false;
        },
    ],
    [
        'production',
        (obj: unknown): boolean =>
            hasProp('production', obj) && typeof obj.production === 'boolean',
    ],
    [
        'stage',
        (obj: unknown): boolean =>
            hasProp('production', obj) && typeof obj.production === 'boolean',
    ],
];

function isConfCon(config: unknown): config is ConfConT {
    if (typeof config !== 'object' || config === null) {
        return false;
    }
    return isPropInObj(config, TYPES_CONF_CON);
}

function checkConfCon(config: unknown): ConfConT {
    if (isConfCon(config)) {
        return config;
    }
    throw new Known500Error('config is not an valid object');
}

export default checkConfCon;
