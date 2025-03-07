import { ClHtml, Dis, Hei, Mar, Wid } from '@strinf/ts/constants/style/ClHtml';
import Known500Error from '@strinf/ts/errors/known/500';
import icoSty from '@strinf/css/mods/icon.module.css';
import { createBoolIcon } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import { useRef } from 'preact/hooks';

import { TooltipWrapper } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import conSty from '@strinf/css/mods/container.module.css';
import type { TT_GL_TYPE, ToolTipHookInt } from '@strinf/ts/interfaces/dom/tooltip';

import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import StrainStatus from '@strinf/ts/constants/api/data';
import type { JSX } from 'preact';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
interface TTProps {
    hook: ToolTipHookInt<TT_GL_TYPE>;
    id: StrainStatus;
    cla: string;
}

function getAvailability(dat: Map<number, [boolean, boolean]>): [boolean, boolean] {
    let deposited = false;
    let available = false;
    for (const [dep, ava] of dat.values()) {
        if (dep) {
            deposited = true;
        }
        if (ava) {
            available = true;
        }
    }
    return [deposited, available];
}

interface LightsVDProps {
    dat: Map<number, [boolean, boolean]>;
    miss: number;
    ttHook: ToolTipHookInt<TT_GL_TYPE>;
}
interface LightsSmVDProps {
    status: StrainStatus;
    ttHook: ToolTipHookInt<TT_GL_TYPE>;
}

function crClaSel(id: StrainStatus, deposited: boolean, available: boolean): string {
    switch (id) {
        case StrainStatus.pubOn:
            if (!(deposited && available)) {
                return Dis.dNone;
            }
            break;
        case StrainStatus.dep:
            if (deposited) {
                return Dis.dNone;
            }
            break;
        default:
            if (!deposited || available) {
                return Dis.dNone;
            }
    }
    return `${Dis.dIFlex} ${conSty.fbundle} ${Wid.f}`;
}

function createTable(data: [boolean, string][]): JSX.Element {
    return (
        <table className={`${ClHtml.tab} ${ClHtml.sm} ${ClHtml.sim} ${Mar.tN15}`}>
            <tbody>
                {data.map(([req, inf], ind) => {
                    return (
                        <tr key={`tablerow${ind}`} style={{ 'border-bottom': 'none' }}>
                            <td>{createBoolIcon(req, true)}</td>
                            <td>{inf}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function getStatusInf(id: StrainStatus): JSX.Element {
    const req = <span>The strain with this status has following properties:</span>;
    const depR = 'Deposited in at least one culture collection';
    const onlR = 'Shown on the website of at least one culture collection';
    const regR = 'Strain deposition process is active in at least one culture collection';
    switch (id) {
        case StrainStatus.pubOn:
            return (
                <>
                    <h6>Published - publicly available</h6>
                    {req}
                    {createTable([
                        [true, depR],
                        [true, onlR],
                    ])}
                </>
            );
        case StrainStatus.dep:
            return (
                <>
                    <h6>Deposition in progress</h6>
                    {req}
                    {createTable([
                        [true, regR],
                        [false, onlR],
                    ])}
                </>
            );
        case StrainStatus.pubOff:
            return (
                <>
                    <h6>Published - not publicly available</h6>
                    {req}
                    {createTable([
                        [true, depR],
                        [false, onlR],
                    ])}
                </>
            );
        default:
            throw new Known500Error(`unknown id [${id}] in strain status`);
    }
}

function crStatusText(id: StrainStatus): string {
    switch (id) {
        case StrainStatus.pubOn:
            return 'Published';
        case StrainStatus.dep:
            return 'Deposition in progress';
        default:
            return 'Published';
    }
}

function crStatusIcon(id: StrainStatus): JSX.Element {
    switch (id) {
        case StrainStatus.pubOn:
            return <i className={`${ClHtmlI.depOn} ${icoSty.stpub}`} />;
        case StrainStatus.dep:
            return <i className={`${ClHtmlI.undDep} ${icoSty.stdep}`} />;
        default:
            return <i className={`${ClHtmlI.depOff} ${icoSty.stina}`} />;
    }
}

function TooltipVD({ hook, id, cla }: TTProps): JSX.Element {
    const lightR = useRef<HTMLDivElement>(null);
    const lKey = `lights_${id}`;
    const lID = id;
    const localH = hook;
    return (
        <div className={cla} id={IdHtmlTour.statusHead}>
            <TooltipWrapper
                key={lKey}
                chi={
                    <div ref={lightR} className={Wid.N25}>
                        {crStatusIcon(id)}
                    </div>
                }
                srcH={localH}
                upD={() => {
                    if (localH.data !== undefined) {
                        localH.data(getStatusInf(lID));
                    }
                }}
            />
            <div>{crStatusText(id)}</div>
        </div>
    );
}

function LightsVD({ dat, miss, ttHook }: LightsVDProps): JSX.Element {
    const [dep, ava] = getAvailability(dat);
    if (miss > 0) {
        const loadCl = `${Hei.h} ${ClHtml.btn} ${ClHtml.link} ${ClHtml.load}`;
        return <span className={loadCl}></span>;
    }
    return (
        <span>
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.pubOn}
                cla={crClaSel(StrainStatus.pubOn, dep, ava)}
            />
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.dep}
                cla={crClaSel(StrainStatus.dep, dep, ava)}
            />
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.pubOff}
                cla={crClaSel(StrainStatus.pubOff, dep, ava)}
            />
        </span>
    );
}

function LightsSmVD({ status, ttHook }: LightsSmVDProps): JSX.Element {
    if (status === StrainStatus.pubOn) {
        return (
            <span>
                <TooltipVD
                    hook={ttHook}
                    id={StrainStatus.pubOn}
                    cla={crClaSel(StrainStatus.pubOn, true, true)}
                />
            </span>
        );
    }
    if (status === StrainStatus.dep) {
        return (
            <span>
                <TooltipVD
                    hook={ttHook}
                    id={StrainStatus.dep}
                    cla={crClaSel(StrainStatus.dep, false, false)}
                />
            </span>
        );
    }
    return (
        <span>
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.pubOff}
                cla={crClaSel(StrainStatus.pubOff, true, false)}
            />
        </span>
    );
}

export default LightsVD;
export { LightsSmVD };
