import type { infer as z_infer } from 'zod/mini';
import {
    array,
    boolean,
    literal,
    minimum,
    minLength,
    number,
    strictObject,
    string,
    union,
    config as z_config,
} from 'zod/mini';

// config

z_config({
    jitless: true,
});

const ConfLink = strictObject({
    domain: string().check(minLength(1)),
    port: number().check(minimum(1)),
    protocol: union([literal('https'), literal('http')]),
});

type ConfLinkT = z_infer<typeof ConfLink>;

const Stats = strictObject({
    enable: boolean(),
    matomo: ConfLink,
    domain: array(string()),
    id: number().check(),
});

type StatsT = z_infer<typeof Stats>;

const Index = strictObject({
    key_len: number().check(minimum(1)),
});

const ConfCon = strictObject({
    backend: ConfLink,
    frontend: ConfLink,
    statistic: Stats,
    index: Index,
    production: boolean(),
    stage: boolean(),
});

export { ConfCon };
export type { ConfLinkT, StatsT };
