import type ErrType from '@strinf/ts/constants/type/ErrT';
import type LoadT from '@strinf/ts/constants/type/LoadT';
import type { InValInt } from '@strinf/ts/interfaces/dom/inp';
import type { ToolTipHookInt } from '@strinf/ts/interfaces/dom/tooltip';

interface ErrStCon {
    get errS(): [string, string];
    get errT(): ErrType | undefined;
}

interface ErrSet {
    errSSet: (msg: string, customMsg: string) => void;
    errTSet: (typ: ErrType) => void;
}

interface GlobVersionSet {
    setVersion: (ver: string) => void;
}

interface GlobVersionGet {
    get version(): string;
}

type LoadFS = (load: LoadT) => void;
type LoadSetFS = (setter: LoadFS) => void;

type BreadFS = (active: number) => void;
type BreadSetFS = (setter: BreadFS) => void;

type ToolTipSetFS<T> = (hook: ToolTipHookInt<T>) => void;

interface LoadSet {
    loadSet: (id: string) => LoadSetFS;
}

interface LoadStMInt {
    get load(): LoadFS[];
}

interface BreadCrumbsS {
    breadSet: (id: string) => BreadSetFS;
}

interface BreadCrumbsG {
    get bread(): BreadFS[];
}

interface TTHookG<T> {
    getTTHook: (id: string) => ToolTipHookInt<T> | undefined;
}

interface TTHookS<T> {
    ttHookSet: (id: string) => ToolTipSetFS<T>;
}

interface WrapperInt {
    wrapperAddClass: (classList: string[]) => void;
    wrapperRmClass: (classList: string[]) => void;
}

type CookieFS = (cookie: string[]) => void;
type CookieSetFS = (setter: string[]) => void;

interface CookieS {
    cookieActiveSet: (id: string, setter: CookieSetFS) => void;
}
interface CookieG {
    get cookieActive(): CookieFS[];
}

type GlStInt<T> = ErrSet
    & ErrStCon
    & LoadSet
    & LoadStMInt
    & CookieS
    & CookieG
    & InValInt
    & BreadCrumbsS
    & BreadCrumbsG
    & TTHookG<T>
    & TTHookS<T>
    & WrapperInt
    & GlobVersionGet
    & GlobVersionSet;

interface DataCon<T> {
    id: string | number;
    data: T;
}

export type {
    BreadCrumbsG,
    BreadCrumbsS,
    BreadFS,
    BreadSetFS,
    CookieFS,
    CookieG,
    CookieS,
    CookieSetFS,
    DataCon,
    ErrStCon,
    GlobVersionGet,
    GlStInt,
    LoadFS,
    LoadSet,
    LoadStMInt,
    TTHookG,
    TTHookS,
    WrapperInt,
};
