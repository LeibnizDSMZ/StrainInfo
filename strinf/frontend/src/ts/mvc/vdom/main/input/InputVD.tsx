import type { JSX, RefObject } from 'preact';
import btnSty from '@strinf/css/mods/icon.module.css';
import { Component } from 'preact';
import DropSeaVD from '@strinf/ts/mvc/vdom/dyn/misc/DropSeaVD';
import { callSearch } from '@strinf/ts/functions/http/sea';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import IndSeaSt from '@strinf/ts/mvc/vdom/state/IndSeaSt';
import SeaIndexCtrl from '@strinf/ts/mvc/ctrl/SeaIndexCtrl';
import type { SeaIndR } from '@strinf/ts/interfaces/api/maped';
import type { GlobVersionGet } from '@strinf/ts/interfaces/dom/global';
import CONFIG from '@strinf/ts/configs/config';
import type { LocationHook } from 'preact-iso';
import { useLocation } from 'preact-iso';

interface InputMProps {
    callB: () => RefObject<HTMLInputElement>;
    upD: () => void;
    val: string;
    len: string;
}

type InProps = InputMProps & {
    tId: undefined | string;
    ctx: GlobVersionGet;
};

type InWrProps = InputMProps & {
    reset: () => void;
    onInput: (input: JSX.TargetedEvent<HTMLInputElement>) => void;
};

interface BtnProps {
    callB: () => RefObject<HTMLInputElement>;
    upD: () => void;
    reset: () => void;
    location: LocationHook;
}

type KeyEvent = JSX.TargetedKeyboardEvent<HTMLInputElement>;

function clickEvent({ callB, upD, reset, location }: BtnProps) {
    const ref = callB();
    reset();
    upD();
    callSearch(ref.current?.value ?? '', location);
}

function seaEvent({ callB, upD, reset, location }: BtnProps, eve?: KeyEvent): void {
    const called =
        eve === undefined ||
        eve.key === 'Enter' ||
        eve.key === 'Accept' ||
        eve.key === 'Tab';
    if (called) {
        clickEvent({ callB, upD, reset, location });
    }
}

function seaIndEvent(
    ctrl: SeaIndexCtrl,
    hooks: IndSeaSt,
    keyLen: number,
    input: JSX.TargetedEvent<HTMLInputElement>
): void {
    const val = input.currentTarget.value;
    const valLen = val.length >= keyLen || val.replaceAll(/[^A-Za-z]/g, '').length >= 1;
    if (val.length < 40 && valLen && !val.includes(',')) {
        ctrl.init(hooks, encodeURIComponent(val.replaceAll('.', '_').replace('/', ':')));
    } else {
        hooks.tab({ match: [], exact: [] });
    }
}

function SeaBtn({ callB, upD, reset, location }: BtnProps): JSX.Element {
    const btnCl = `${ClHtml.btn}  ${ClHtml.pri} ${btnSty.center}`;
    return (
        <div className={ClHtml.igp}>
            <button
                type="button"
                aria-label="Search"
                className={btnCl}
                onClick={() => {
                    clickEvent({ callB, upD, reset, location });
                }}
            >
                <i className={ClHtmlI.search} />
            </button>
        </div>
    );
}

function InputWr({ val, callB, upD, reset, onInput, len }: InWrProps): JSX.Element {
    const location = useLocation();
    return (
        <div className={ClHtml.ig}>
            <input
                value={val}
                ref={callB()}
                type="text"
                name="search"
                className={`${ClHtml.formCtrl} ${len}`}
                autoComplete="off"
                placeholder="search in database"
                onKeyPress={(event) => {
                    seaEvent({ callB, upD, reset, location }, event);
                }}
                onInput={onInput}
            />
            <SeaBtn callB={callB} upD={upD} reset={reset} location={location} />
        </div>
    );
}

interface InState {
    ctrl: undefined | SeaIndexCtrl;
    results: SeaIndR;
}

class InputVD extends Component<InProps, InState> {
    private readonly hooks: IndSeaSt;

    private input: string | null;

    private memory: string;

    constructor(props: InProps) {
        super(props);
        this.hooks = new IndSeaSt();
        this.state = { results: { match: [], exact: [] }, ctrl: undefined };
        this.hooks.tabSet((results: SeaIndR): void => {
            this.setState((prevSt) => ({ ...prevSt, results }));
        });
        this.input = null;
        this.memory = '';
    }

    public render(): JSX.Element | null {
        const { ctx, callB, upD, val, len, tId } = this.props;
        const { ctrl, results } = this.state;
        if (ctrl === undefined) {
            this.initCtrl(ctx);
            return null;
        }
        if (this.memory !== val) {
            this.memory = val;
            this.input = null;
        }
        return (
            <div className={ClHtml.navS} {...(tId !== undefined ? { id: tId } : {})}>
                <InputWr
                    val={this.input ?? val}
                    callB={callB}
                    len={len}
                    upD={upD}
                    reset={() => {
                        this.resetIndResults();
                    }}
                    onInput={(input): void => {
                        this.input = input.currentTarget.value;
                        const keyL = CONFIG.index.key_len;
                        seaIndEvent(ctrl, this.hooks, keyL, input);
                    }}
                />
                <DropSeaVD results={results} input={this.input ?? ''} />
            </div>
        );
    }

    private initCtrl(ctx: GlobVersionGet): void {
        const { ctrl } = this.state;
        ctrl?.setVersion(ctx.version);
        if (ctrl === undefined) {
            this.setState({ ctrl: new SeaIndexCtrl(ctx.version) });
        }
    }

    private resetIndResults(): void {
        this.input = null;
    }
}

InputVD.contextType = MainConGl;
export default InputVD;
