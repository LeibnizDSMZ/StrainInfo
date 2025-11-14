import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type { JSX } from 'preact';
import conSty from '@strinf/css/mods/container.module.css';
import icoSty from '@strinf/css/mods/icon.module.css';
import { StrainStatus } from '@strinf/ts/constants/api/data';

import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { ClHtml, Dis, Hei, Mar, Wid } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';

import Known500Error from '@strinf/ts/errors/known/500';
import { createBoolIcon } from '@strinf/ts/mvc/vdom/fun/tab/misc';
import { TooltipWrapper } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import { useRef } from 'preact/hooks';

interface TTProps {
    hook: ToolTipHookInt<TT_GL_TYPE>;
    id: StrainStatus;
    cla: string;
}

function getAvailability(
    dat: Map<number, [boolean, boolean, boolean]>,
): [boolean, boolean, boolean] {
    let deposited = false;
    let available = false;
    let error = 0;
    for (const [dep, ava, err] of dat.values()) {
        if (dep) {
            deposited = true;
        }
        if (ava) {
            available = true;
        }
        error += err ? 1 : 0;
    }
    return [deposited, available, error === dat.size && dat.size !== 0];
}

interface LightsVDProps {
    dat: Map<number, [boolean, boolean, boolean]>;
    miss: number;
    ttHook: ToolTipHookInt<TT_GL_TYPE>;
}
interface LightsSmVDProps {
    status: StrainStatus;
    ttHook: ToolTipHookInt<TT_GL_TYPE>;
}

function crClaSel(
    id: StrainStatus,
    deposited: boolean,
    available: boolean,
    error: boolean,
): string {
    switch (id) {
        case StrainStatus.pubOn:
            if (!(deposited && available) || error) {
                return Dis.dNone;
            }
            break;
        case StrainStatus.dep:
            if (deposited || error) {
                return Dis.dNone;
            }
            break;
        case StrainStatus.err:
            if (!error) {
                return Dis.dNone;
            }
            break;
        default:
            if (!deposited || available || error) {
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
        case StrainStatus.err:
            return (
                <>
                    <h6>Incorrect strain</h6>
                    <span>
                        This strain contains only deposits for which culture collection
                        numbers could not be verified, possibly due to typos or similar
                        input errors.
                    </span>
                </>
            );
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
        case StrainStatus.err:
            return 'Incorrect';
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
        case StrainStatus.err:
            return <i className={`${ClHtmlI.err} ${icoSty.sterr}`} />;
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
        <div className={cla}>
            <TooltipWrapper
                key={lKey}
                chi={(
                    <div ref={lightR} className={Wid.N25}>
                        {crStatusIcon(id)}
                    </div>
                )}
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
    const [dep, ava, err] = getAvailability(dat);
    if (miss > 0) {
        const loadCl = `${Hei.h} ${ClHtml.btn} ${ClHtml.link} ${ClHtml.load}`;
        return <span className={loadCl}></span>;
    }
    return (
        <span id={IdHtmlTour.statusHead}>
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.err}
                cla={crClaSel(StrainStatus.err, dep, ava, err)}
            />
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.pubOn}
                cla={crClaSel(StrainStatus.pubOn, dep, ava, err)}
            />
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.dep}
                cla={crClaSel(StrainStatus.dep, dep, ava, err)}
            />
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.pubOff}
                cla={crClaSel(StrainStatus.pubOff, dep, ava, err)}
            />
        </span>
    );
}

function LightsSmVD({ status, ttHook }: LightsSmVDProps): JSX.Element {
    if (status === StrainStatus.err) {
        return (
            <span>
                <TooltipVD
                    hook={ttHook}
                    id={StrainStatus.err}
                    cla={crClaSel(StrainStatus.err, false, false, true)}
                />
            </span>
        );
    }
    if (status === StrainStatus.pubOn) {
        return (
            <span>
                <TooltipVD
                    hook={ttHook}
                    id={StrainStatus.pubOn}
                    cla={crClaSel(StrainStatus.pubOn, true, true, false)}
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
                    cla={crClaSel(StrainStatus.dep, false, false, false)}
                />
            </span>
        );
    }
    return (
        <span>
            <TooltipVD
                hook={ttHook}
                id={StrainStatus.pubOff}
                cla={crClaSel(StrainStatus.pubOff, true, false, false)}
            />
        </span>
    );
}

export default LightsVD;
export { LightsSmVD };
