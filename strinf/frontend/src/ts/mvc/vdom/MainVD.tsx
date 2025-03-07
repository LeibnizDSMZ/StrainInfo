import type { JSX, ErrorInfo, RefObject } from 'preact';
import { Component, createRef } from 'preact';
import KnownError from '@strinf/ts/errors/known/main';
import HeadVD from '@strinf/ts/mvc/vdom/HeadVD';
import FootVD from '@strinf/ts/mvc/vdom/FootVD';
import ContentVD from '@strinf/ts/mvc/vdom/ContentVD';
import GlState, { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import ErrType from '@strinf/ts/constants/type/ErrT';
import crAlert from '@strinf/ts/mvc/vdom/fun/alert/alert';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { getActiveWrapperCookies } from '@strinf/ts/functions/cookie/acc';
import getServerStatus from '@strinf/ts/functions/api/status';
import Known503Error from '@strinf/ts/errors/known/503';
import Known500Error from '@strinf/ts/errors/known/500';
import type { GlStInt } from '@strinf/ts/interfaces/dom/global';
import { reInitCStyle } from '@strinf/ts/functions/libs/style';
import type { TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type { ServerStatusInt } from '@strinf/ts/interfaces/api/maped';
import CONFIG from '@strinf/ts/configs/config';
import initMat from '@strinf/ts/mvc/vdom/fun/mat/init';

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

    private readonly glStateCon: GlStInt<TT_GL_TYPE>;

    private readonly wrapper: RefObject<HTMLDivElement>;

    private readonly stat: JSX.Element | null;

    constructor(props: Record<string, never>) {
        super(props);
        this.stat = initMat(CONFIG.statistic);
        this.errCr = false;
        this.state = { panic: false, showErrCnt: 0 };
        this.seaVGl = '';
        this.wrapper = createRef<HTMLDivElement>();
        this.glStateCon = this.createGlState();
        const sta = (status: ServerStatusInt) => {
            this.glStateCon.setVersion(status.version);
            if (status.maintenance.status) {
                this.setMaintenance(status.maintenance);
                this.onError();
            }
        };
        const cErr = () => {
            this.criticalError();
        };
        const onErr = () => {
            this.setState({ panic: true });
        };
        const sig = { signal: AbortSignal.timeout(60000) };
        this.errHandler();
        getServerStatus(sta, cErr, onErr, sig);
    }

    private criticalError(): void {
        const msg = 'Internal server error!';
        this.setServerError(msg, new Known500Error(msg));
        this.onError();
    }

    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    public override componentDidMount(): void {
        reInitCStyle();
    }

    public onError(): void {
        if (
            this.glStateCon.errT !== undefined &&
            [ErrType.INWARN, ErrType.FEWARN, ErrType.E404].includes(this.glStateCon.errT)
        ) {
            crAlert(this.glStateCon.errT, this.glStateCon.errS[1]);
        }
        if (this.errCr) {
            const { panic, showErrCnt } = this.state;
            this.setState({ panic, showErrCnt: (showErrCnt % 10) + 1 });
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
                switch (true) {
                    case status.maintenance.status:
                        this.setMaintenance(status.maintenance);
                        break;
                    case error instanceof KnownError:
                        this.setServerError(error.message, error);
                        break;
                    default:
                        this.glStateCon.errTSet(ErrType.E500);
                        this.errCr = true;
                }
                this.onError();
            },
            () => {
                this.criticalError();
            },
            () => {
                const { panic } = this.state;
                if (!panic) {
                    this.setState({ panic: true });
                }
            },
            { signal: AbortSignal.timeout(60000) }
        );
    }

    private setMaintenance(maintenance: { duration: string; zone: string }): void {
        this.errCr = true;
        this.glStateCon.errTSet(ErrType.E503);
        const msg = Known503Error.formateMsg(
            'Under maintenance!',
            maintenance.duration,
            maintenance.zone
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
                {this.stat}
                <div className={ClHtml.ld}>
                    <span />
                </div>
                <MainConGl.Provider value={this.initGlState()}>
                    <div
                        ref={this.wrapper}
                        className={`${ClHtml.pgWr} ${getActiveWrapperCookies().join(' ')}`}
                    >
                        <HeadVD />
                        <div className={ClHtml.cntWr}>
                            <ContentVD
                                panic={panic}
                                error={() => this.errCr}
                                disable={() => (this.errCr = false)}
                            />
                            <FootVD />
                        </div>
                    </div>
                </MainConGl.Provider>
            </>
        );
    }
}
export default MainVD;
