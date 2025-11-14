import type { InfoR, InfoS } from '@strinf/ts/interfaces/api/mapped';
import type { GlobVersionGet, TTHookS } from '@strinf/ts/interfaces/dom/global';
import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type InfoCtrl from '@strinf/ts/mvc/ctrl/InfoCtrl';
import type { JSX, RefObject } from 'preact';
import tooSty from '@strinf/css/mods/tooltip.module.css';
import { HIDE_ATTR, TT_ARR, TT_SRC } from '@strinf/ts/constants/style/AtHtml';
import Known500Error from '@strinf/ts/errors/known/500';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import ToolTipHook from '@strinf/ts/mvc/vdom/state/InfoHk';
import InfoSt from '@strinf/ts/mvc/vdom/state/InfoSt';
import { Component, createRef } from 'preact';

interface ToolState<I extends InfoS | InfoR> {
    selId: number;
    res?: I;
}

interface ToolTipProps<I extends InfoS | InfoR> {
    res: I;
    loading: boolean;
    info: JSX.Element | undefined;
}

interface ToolProps<I extends InfoS | InfoR> {
    hookName: string;
    createCtrl: (ver: string, extra: string[]) => InfoCtrl<I>;
    createTT: (props: ToolTipProps<I>) => JSX.Element;
}

class ToolTipInfoVD<I extends InfoS | InfoR> extends Component<
    ToolProps<I>,
    ToolState<I>
> {
    private readonly modelH: InfoSt<I>;

    private ctrl: InfoCtrl<I> | undefined;

    private readonly tooRef: RefObject<HTMLDivElement>;

    private readonly arrRef: RefObject<HTMLDivElement>;

    private loading: boolean;

    private extra: string[];

    private info: JSX.Element | undefined;

    private readonly hook: ToolTipHookInt<TT_GL_TYPE>;

    private readonly buffer: Set<number>;

    constructor(props: ToolProps<I>) {
        super(props);
        this.state = { selId: 0 };
        this.extra = [];
        this.info = undefined;
        this.ctrl = undefined;
        this.modelH = new InfoSt<I>();
        this.loading = true;
        this.hook = new ToolTipHook();
        this.buffer = new Set<number>();
        this.modelH.resSet((results: I[]): void => {
            for (const res of results) {
                const [locCid] = res;
                this.buffer.delete(locCid);
                const { selId } = this.state;
                if (selId === locCid) {
                    this.loading = false;
                    this.setState({ selId, res });
                }
            }
        });
        this.tooRef = createRef<HTMLDivElement>();
        this.arrRef = createRef<HTMLDivElement>();
    }

    private startInfo(ctx: GlobVersionGet): void {
        const { selId } = this.state;
        this.loading = this.buffer.has(selId);
        this.ctrl?.setVersion(ctx.version);
        if (this.ctrl === undefined) {
            const { createCtrl } = this.props;
            this.ctrl = createCtrl(ctx.version, this.extra);
            this.ctrl.init(this.modelH, [...this.buffer.values()]);
        }
        else {
            this.ctrl.init(this.modelH, [...this.buffer.values()]);
        }
    }

    private initCtrl(): void {
        const ctx: (TTHookS<TT_GL_TYPE> & GlobVersionGet) | undefined = this.context;
        const { hookName } = this.props;
        ctx?.ttHookSet(hookName)(this.hook);
        this.hook.dataSetter((curIdH: TT_GL_TYPE) => {
            const [selId, info_extra] = Array.isArray(curIdH)
                ? curIdH
                : [curIdH, undefined];
            this.info = undefined;
            this.extra = [];
            if (Array.isArray(info_extra)) {
                this.extra = info_extra;
                this.ctrl = undefined;
            }
            else {
                this.info = info_extra;
            }
            if (typeof selId !== 'number') {
                throw new Known500Error(
                    `deposit tooltips accept only numbers [${typeof curIdH}]`,
                );
            }
            const { res } = this.state;
            let newState: ToolState<I> = { selId };
            if (res !== undefined) {
                newState = { res, selId };
            }
            this.buffer.add(selId);
            this.setState(newState);
        });
        this.hook.setTTSrc([this.tooRef, this.arrRef]);
        if (ctx !== undefined && this.buffer.size > 0) {
            this.startInfo(ctx);
        }
    }

    public render(): JSX.Element {
        this.initCtrl();
        const { res, selId } = this.state;
        const { createTT } = this.props;
        return (
            <div ref={this.tooRef} className={tooSty.tooltip} {...HIDE_ATTR} {...TT_SRC}>
                {selId === 0 || res === undefined
                    ? null
                    : createTT({
                            loading: this.loading,
                            info: this.info,
                            res,
                        })}
                <div ref={this.arrRef} className={tooSty.arrow} {...TT_ARR} />
            </div>
        );
    }
}

ToolTipInfoVD.contextType = MainConGl;

export default ToolTipInfoVD;
