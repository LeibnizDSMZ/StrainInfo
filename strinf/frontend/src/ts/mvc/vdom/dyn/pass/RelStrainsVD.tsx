import type { SeaR } from '@strinf/ts/interfaces/api/mapped';
import type {
    GlobVersionGet,
    LoadSet,
    LoadStMInt,
    TTHookG,
} from '@strinf/ts/interfaces/dom/global';
import type { TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { JSX } from 'preact';
import QApiCon from '@strinf/ts/constants/api/q_api';
import PassAncId from '@strinf/ts/constants/page/pass';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import LoadT from '@strinf/ts/constants/type/LoadT';
import { getSeaResTuple } from '@strinf/ts/functions/api/map';
import SeaSimpleCtrl from '@strinf/ts/mvc/ctrl/SeaSimpleCtrl';
import { SeaTable } from '@strinf/ts/mvc/vdom/dyn/search/SeaTVD';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import SeaSimpleSt from '@strinf/ts/mvc/vdom/state/SeaSimpleSt';
import { Component } from 'preact';

interface NamNavProps {
    strId: number[];
    taxN: string;
    emptyCall: () => void;
}
const ID = PassAncId.rel_str;

function getAnchorRS(ord: number, taxa: string, empty: boolean): AncT {
    if (taxa !== '' && !empty) {
        return { [ord]: [ID, 'Other strains - Taxonomy'] };
    }
    return {};
}

interface IdState {
    results: SeaR[];
    stage: LoadT;
}
type CTX = GlobVersionGet & LoadSet & LoadStMInt & TTHookG<TT_GL_TYPE>;

class RelStrainsVD extends Component<NamNavProps, IdState> {
    private readonly hooks: SeaSimpleSt;

    private memory: string;

    private ctrl?: SeaSimpleCtrl;

    private load: LoadT;

    constructor(props: NamNavProps) {
        super(props);
        this.hooks = new SeaSimpleSt();
        this.state = { results: [], stage: LoadT.INI };
        const { emptyCall } = this.props;
        this.hooks.tabSet((results: SeaR[]): void => {
            if (results.length === 0) {
                emptyCall();
            }
            this.setState(prevSt => ({ ...prevSt, results }));
        });
        this.memory = '';
        this.load = LoadT.INI;
    }

    private initCtrl(ctx: CTX | undefined, taxN: string): void {
        if (this.ctrl === undefined && ctx !== undefined) {
            this.ctrl = new SeaSimpleCtrl(ctx.version);
        }
        if (ctx !== undefined) {
            ctx.loadSet('SEARCH_REL_STR')((load: LoadT) => {
                this.load = load;
                const { state } = this;
                this.setState({ ...state, stage: this.load });
            });
            this.hooks.setLoad(() => ctx.load);
        }
        if (this.memory !== taxN && this.ctrl !== undefined) {
            this.memory = taxN;
            const { strId } = this.props;
            this.ctrl.init(this.hooks, taxN, QApiCon.seaStrTaxName, strId);
        }
    }

    public override componentWillUnmount(): void {
        for (const ele of this.hooks.load) {
            ele(LoadT.INI);
        }
        this.state.results.splice(0, this.state.results.length);
    }

    public render(): JSX.Element | null {
        const { taxN } = this.props;
        const ctx: CTX | undefined = this.context;
        this.ctrl?.setVersion(ctx?.version ?? '');
        this.initCtrl(ctx, taxN);
        const ttHook = ctx?.getTTHook(TT_ID_SIM);
        const { results } = this.state;
        if (ttHook === undefined || this.load !== LoadT.FIN || results.length === 0) {
            return null;
        }
        return (
            <div id={IdHtmlTour.strainRel}>
                <h3 className={ClHtml.titSec}>
                    Other strains with the same taxonomy
                    <span id={ID} />
                </h3>
                <div>
                    <SeaTable
                        hook={ttHook}
                        res={results}
                        window={15}
                        term={taxN}
                        download={false}
                        perPage={false}
                        head={getSeaResTuple(false).map((val, index) => [
                            index,
                            val,
                            index !== 1
                            && index !== 3
                            && index !== 4
                            && (index !== 2 || results.length <= 400000),
                        ])}
                    />
                </div>
            </div>
        );
    }
}

RelStrainsVD.contextType = MainConGl;

export default RelStrainsVD;
export { getAnchorRS };
