import type {
    DatIdF,
    DatIdSetF,
    ToolTipHookInt,
    TT_GL_TYPE,
} from '@strinf/ts/interfaces/dom/tooltip';
import type { RefObject } from 'preact';

class ToolTipHook implements ToolTipHookInt<TT_GL_TYPE> {
    private dataIdH?: DatIdF<TT_GL_TYPE>;

    private ttSrcH?: [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>];

    public get data(): DatIdF<TT_GL_TYPE> | undefined {
        return this.dataIdH;
    }

    public get dataSetter(): DatIdSetF<TT_GL_TYPE> {
        return (setter: DatIdF<TT_GL_TYPE>): void => {
            this.dataIdH = setter;
        };
    }

    public get ttSrc():
        | [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>]
        | undefined {
        return this.ttSrcH;
    }

    public setTTSrc(
        srcRef: [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>],
    ): void {
        this.ttSrcH = srcRef;
    }
}

export default ToolTipHook;
