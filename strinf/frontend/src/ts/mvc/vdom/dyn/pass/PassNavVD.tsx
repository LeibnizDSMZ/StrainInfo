import type { JSX } from 'preact';
import { useContext } from 'preact/hooks';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { createKnownSeaCall } from '@strinf/ts/functions/links/create_sea';
import updateHrefVal from '@strinf/ts/functions/links/update_href';
import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import sortAndReduce from '@strinf/ts/functions/arr/filter';
import OnPageNavVD, { createNavLinks } from '@strinf/ts/mvc/vdom/dyn/misc/OnPageNav';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import QApiCon from '@strinf/ts/constants/api/q_api';
import SeaRelCtrl from '@strinf/ts/mvc/ctrl/SeaRelCtrl';
import { Component } from 'preact';
import RelSeaSt from '@strinf/ts/mvc/vdom/state/RelSeaSt';
import type { GlobVersionGet } from '@strinf/ts/interfaces/dom/global';
import type { RelDataT } from '@strinf/ts/interfaces/dom/sea_rel';
import linkSty from '@strinf/css/mods/link.module.css';
import { callSearch } from '@strinf/ts/functions/http/sea';
import type { LocationHook } from 'preact-iso';
import { useLocation } from 'preact-iso';

interface NavProps {
    anc: AncT;
}

interface NamNavProps {
    strId: number[];
    taxN: string;
}

interface SpeNavProps {
    str: RelDataT;
    taxN: string;
}

function createNamNav(
    str: RelDataT,
    ctx: InValStInt | undefined,
    location: LocationHook
): JSX.Element[] {
    const res = [];
    const grCul: Record<number, string[]> = {};
    for (const { id, cultures } of str.strains) {
        grCul[id] = [...cultures];
    }
    const [sorKey, filMap] = sortAndReduce(grCul, 2, '...');
    for (const key of sorKey) {
        const navRef = (
            <button
                className={`${linkSty.cleanbutton} ${linkSty.pagenav}`}
                key={key}
                type="button"
                onClick={() => {
                    updateHrefVal(`${IdAcrTagCon.strId} ${key}`, ctx);
                    callSearch(`${IdAcrTagCon.strId} ${key}`, location);
                    return true;
                }}
            >
                <b>
                    {IdAcrTagCon.strId + ' '}
                    <em>{key}</em>:
                </b>
                <br />
                {filMap[key]?.join(', ')}
            </button>
        );
        if (res.length >= 5) {
            break;
        }
        res.push(navRef);
    }
    return res;
}

function crTitle(strN: number, taxN: string): JSX.Element {
    const preT = `${strN} other strains of`;
    const name = taxN === '' ? 'unknown species' : <i>{taxN}</i>;
    return (
        <>
            {preT}
            <br />
            {name}
        </>
    );
}

function SpeNav({ str, taxN }: SpeNavProps): JSX.Element | null {
    const ctx: InValStInt | undefined = useContext(MainConGl);
    const location = useLocation();
    const res: JSX.Element[] = createNamNav(str, ctx, location);
    if (str.count === 0) {
        return null;
    }
    return (
        <>
            <div className={ClHtml.tit}>{crTitle(str.count, taxN)}</div>
            {res}
            {str.count - res.length > 0 ? (
                <a
                    aria-label={`Search ${taxN}`}
                    href={createKnownSeaCall(taxN, QApiCon.seaStrTaxName)}
                    rel="nofollow"
                >
                    show all ...
                </a>
            ) : null}
        </>
    );
}

interface IdState {
    results: RelDataT;
}

class PassNavVD extends Component<NamNavProps & NavProps, IdState> {
    private readonly hooks: RelSeaSt;

    private memory: string;

    private ctrl?: SeaRelCtrl;

    constructor(props: NamNavProps & NavProps) {
        super(props);
        this.hooks = new RelSeaSt();
        this.state = { results: { count: 0, strains: [] } };
        this.hooks.tabSet((results: RelDataT): void => {
            this.setState((prevSt) => ({ ...prevSt, results }));
        });
        this.memory = '';
    }

    private initCtrl(ctx: GlobVersionGet | undefined): void {
        if (this.ctrl === undefined && ctx !== undefined) {
            this.ctrl = new SeaRelCtrl(ctx.version);
        }
    }

    public render(): JSX.Element | null {
        const { anc, strId, taxN } = this.props;
        const { results } = this.state;
        const ctx: GlobVersionGet | undefined = this.context;
        this.ctrl?.setVersion(ctx?.version ?? '');
        this.initCtrl(ctx);
        if (this.memory !== taxN && this.ctrl !== undefined) {
            this.memory = taxN;
            this.ctrl.init(this.hooks, taxN, QApiCon.seaStrTaxName, strId);
        }
        const addCnt = (
            <div className={ClHtml.cnt}>
                <SpeNav str={results} taxN={taxN} />
            </div>
        );
        return (
            <OnPageNavVD tId={IdHtmlTour.passSid} addCnt={addCnt}>
                {createNavLinks(anc)}
            </OnPageNavVD>
        );
    }
}

PassNavVD.contextType = MainConGl;

export default PassNavVD;
