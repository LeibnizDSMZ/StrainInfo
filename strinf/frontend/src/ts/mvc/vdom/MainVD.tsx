import type { ServerStatusJT } from '@strinf/ts/interfaces/api/data';
import type { GlStInt } from '@strinf/ts/interfaces/dom/global';
import type { TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type { ErrorInfo, JSX, RefObject } from 'preact';
import CONFIG from '@strinf/ts/configs/config';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import ErrType from '@strinf/ts/constants/type/ErrT';
import Known503Error from '@strinf/ts/errors/known/503';
import KnownError from '@strinf/ts/errors/known/main';
import getServerStatus from '@strinf/ts/functions/api/status';
import { getActiveWrapperCookies } from '@strinf/ts/functions/cookie/acc';
import { reInitCStyle } from '@strinf/ts/functions/libs/style';
import ContentVD from '@strinf/ts/mvc/vdom/ContentVD';
import crAlert from '@strinf/ts/mvc/vdom/fun/alert/alert';
import initMat from '@strinf/ts/mvc/vdom/fun/mat/init';
import HeadVD from '@strinf/ts/mvc/vdom/HeadVD';
import GlState, { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { Component, createRef } from 'preact';

type OnErrorArg = [
    Event | string,
    string | undefined,
    number | undefined,
    number | undefined,
    Error | undefined,
];

class MainVD extends Component<
    Record<string, never>,
    { panic: boolean; showErrCnt: number }
> {
    private errCr: boolean;

    private seaVGl: string;

    private lastAlert: string;

    private readonly glStateCon: GlStInt<TT_GL_TYPE>;

    private readonly wrapper: RefObject<HTMLDivElement>;

    constructor(props: Record<string, never>) {
        super(props);
        initMat(CONFIG.statistic);
        this.lastAlert = '';
        this.errCr = false;
        this.state = { panic: false, showErrCnt: 0 };
        this.seaVGl = '';
        this.wrapper = createRef<HTMLDivElement>();
        this.glStateCon = this.createGlState();
        const sta = (status: ServerStatusJT) => {
            this.glStateCon.setVersion(status.version);
            if (status.maintenance.status) {
                this.setMaintenance(status.maintenance);
                this.onError();
            }
        };
        const sig = { signal: AbortSignal.timeout(60000) };
        this.errHandler();
        getServerStatus(
            sta,
            () => {
                this.glStateCon.errTSet(ErrType.E500);
                this.errCr = true;
                this.onError(true);
            },
            sig,
        );
    }

    public override componentDidMount(): void {
        reInitCStyle();
    }

    public onError(toPanic: boolean = false): void {
        const alert
            = this.glStateCon.errT !== undefined
                && [ErrType.INWARN, ErrType.FEWARN, ErrType.E404].includes(
                    this.glStateCon.errT,
                )
                && this.glStateCon.errS[1] !== this.lastAlert;
        if (alert) {
            this.lastAlert = this.glStateCon.errS[1];
            crAlert(this.glStateCon.errT, this.glStateCon.errS[1]);
        }
        if (this.errCr) {
            const { panic, showErrCnt } = this.state;
            this.setState({ panic: panic || toPanic, showErrCnt: (showErrCnt % 10) + 1 });
        }
    }

    public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        if (!CONFIG.production) {
            console.log(error, errorInfo);
        }
        this.handleError(error);
    }

    public handleError(error: Error): void {
        if (!CONFIG.production) {
            console.log(error);
        }
        getServerStatus(
            (status) => {
                this.glStateCon.errSSet(error.message, error.message);
                if (status.maintenance.status) {
                    this.setMaintenance(status.maintenance);
                }
                else if (error instanceof KnownError) {
                    this.setServerError(error.message, error);
                }
                else {
                    this.glStateCon.errTSet(ErrType.E500);
                    this.errCr = true;
                }
                this.onError();
            },
            () => {
                this.glStateCon.errTSet(ErrType.E500);
                this.errCr = true;
                this.onError(true);
            },
            { signal: AbortSignal.timeout(60000) },
        );
    }

    private setMaintenance(maintenance: { duration: string; zone: string }): void {
        this.errCr = true;
        this.glStateCon.errTSet(ErrType.E503);
        const msg = Known503Error.formateMsg(
            'Under maintenance!',
            maintenance.duration,
            maintenance.zone,
        );
        this.glStateCon.errSSet(msg, msg);
    }

    private setServerError(message: string, error: KnownError): void {
        this.errCr = error.crit;
        this.glStateCon.errTSet(error.type);
        this.glStateCon.errSSet(message, error.customMsg);
    }

    private errHandler(): void {
        const errH = (...args: OnErrorArg): boolean => {
            if (args[4] instanceof Error) {
                this.handleError(args[4]);
            }
            return true;
        };
        window.onerror = errH;
    }

    private createGlState(): GlStInt<TT_GL_TYPE> {
        return new GlState(this.seaVGl, this.wrapper);
    }

    private initGlState(): GlStInt<TT_GL_TYPE> {
        this.glStateCon.inValSet('MAIN')((val: string) => {
            this.seaVGl = val;
        });
        return this.glStateCon;
    }

    public render(): JSX.Element {
        const { panic } = this.state;
        return (
            <>
                <MainConGl value={this.initGlState()}>
                    <div
                        ref={this.wrapper}
                        className={`${ClHtml.pgWr} ${getActiveWrapperCookies().join(' ')}`}
                    >
                        <HeadVD />
                        <ContentVD
                            panic={panic}
                            error={() => this.errCr}
                            disable={() => (this.errCr = false)}
                        />
                    </div>
                </MainConGl>
            </>
        );
    }
}
export default MainVD;
