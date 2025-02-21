import { CookieValue, FormNames } from '@strinf/ts/constants/style/Acc';
import {
    isContrastSet,
    isDyslexiaSet,
    isTransitionSet,
} from '@strinf/ts/functions/cookie/acc';

type DefAttr = Record<string, string | boolean>;

function crAccIn(name: string, value: string, check: boolean): DefAttr {
    return {
        type: 'checkbox',
        name,
        value,
        checked: check,
    };
}

const DD_B = {
    'data-toggle': 'dropdown',
    'aria-haspopup': true,
    'aria-expanded': false,
};

const ACC_M = {
    'aria-labelledby': 'accessibility-menu',
};

const ACC_LC = {
    for: 'set-contrast',
};

function accInC(): DefAttr {
    return crAccIn(FormNames.con, CookieValue.contrast, isContrastSet());
}

const ACC_LM = {
    for: 'set-transitions',
};

function accInM(): DefAttr {
    return crAccIn(FormNames.tra, CookieValue.transitions, isTransitionSet());
}

const ACC_LD = {
    for: 'set-dyslexia',
};

function accInD(): DefAttr {
    return crAccIn(FormNames.dys, CookieValue.dyslexia, isDyslexiaSet());
}

const TT_TAR = {
    'aria-describedby': 'tooltip',
};

const TT_SRC: { role: 'tooltip' } = {
    role: 'tooltip',
};

const TT_ARR = {
    'data-popper-arrow': true,
};

const HIDE_ATTR = {
    hidden: true,
};

const HIDE = 'hidden';

const SIDE_SMALL = {
    'data-sidebar-size': 'small',
};

export {
    HIDE,
    HIDE_ATTR,
    TT_ARR,
    TT_SRC,
    TT_TAR,
    accInD,
    ACC_LD,
    accInM,
    ACC_LM,
    accInC,
    ACC_LC,
    ACC_M,
    DD_B,
    SIDE_SMALL,
};

export type { DefAttr };
