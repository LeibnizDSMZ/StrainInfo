import type { BreadCrumbsG, GlobVersionGet } from '@strinf/ts/interfaces/dom/global';
import type { JSX } from 'preact';
import phSty from '@strinf/css/mods/icon.module.css';
import { ClHtml, Dis, Mar, Tex, Wid } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import HeadT from '@strinf/ts/constants/type/HeadT';
import PagPosT from '@strinf/ts/constants/type/PagPosT';
import IndCtrl from '@strinf/ts/mvc/ctrl/IndCtrl';
import OvVD from '@strinf/ts/mvc/vdom/dyn/stat/OvVD';
import SeaInVD from '@strinf/ts/mvc/vdom/main/input/SeaInVD';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import IndSt from '@strinf/ts/mvc/vdom/state/IndSt';
import AboutIVD from '@strinf/ts/mvc/vdom/static/AboutHomeVD';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import { DefaultGradientVD } from '@strinf/ts/mvc/vdom/static/images/background/DefaultVD';
import { Component } from 'preact';

const H_DESC = `
StrainInfo is a service developed to provide a
resolution of microbial strain identifiers by storing
culture collection numbers, their relations, and deposition data.
`;

function Hero(): JSX.Element {
    return (
        <section
            className={`${ClHtml.her} ${ClHtml.sec} ${ClHtml.secD} ${ClHtml.secI}`}
            style={{
                opacity: '0.9',
                position: 'relative',
            }}
        >
            <DefaultGradientVD />
            <div>
                <h1 className={Tex.w}>
                    Welcome to
                    <br />
                    StrainInfo
                </h1>
            </div>
        </section>
    );
}

class IndexVD extends Component<unknown, object> {
    private readonly hooks: IndSt;
    private iCtrl?: IndCtrl;

    constructor(props: unknown) {
        super(props);
        this.hooks = new IndSt();
    }

    public override componentDidMount(): void {
        const ctx: GlobVersionGet | undefined = this.context;
        if (ctx !== undefined) {
            this.iCtrl?.setVersion(ctx.version);
            if (this.iCtrl === undefined) {
                this.iCtrl = new IndCtrl(ctx.version);
                this.iCtrl.init(this.hooks);
            }
            else {
                this.iCtrl.init(this.hooks);
            }
        }
    }

    public render(): JSX.Element {
        const ctx: BreadCrumbsG | undefined = this.context;
        if (ctx?.bread !== undefined) {
            for (const actF of ctx.bread) {
                actF(HeadT.HOME);
            }
        }
        return (
            <>
                <MetaH title="StrainInfo" desc={H_DESC} />
                <Hero />
                <div className={`${ClHtml.herB} ${Wid.SMF}`}>
                    <i
                        className={`${ClHtml.micI} ${Tex.sig} ${Dis.dBlock} ${phSty.ph2}`}
                    />
                    <h2 className={`${Mar.tN10} ${phSty.ph2m}`}>Microbial Strains</h2>
                    <SeaInVD tId={IdHtmlTour.seaInHome} len={Wid.f} pos={PagPosT.BODY} />
                </div>
                <AboutIVD />
                <OvVD sta={this.hooks.statSet} dia={this.hooks.confSet} />
            </>
        );
    }
}

IndexVD.contextType = MainConGl;

export default IndexVD;
