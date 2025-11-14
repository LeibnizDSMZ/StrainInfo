import type { DetailsR, PassR, RelT } from '@strinf/ts/interfaces/api/mapped';
import type ViewChanInt from '@strinf/ts/interfaces/chan/details';
import type { TTHookG } from '@strinf/ts/interfaces/dom/global';
import type { ToolTipHookInt, TT_GL_TYPE } from '@strinf/ts/interfaces/dom/tooltip';
import type DetailCtrl from '@strinf/ts/mvc/ctrl/DetailCtrl';
import type { JSX } from 'preact';
import { ClHtml, Col } from '@strinf/ts/constants/style/ClHtml';

import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import OnPageNavVD, { createNavLinks } from '@strinf/ts/mvc/vdom/dyn/misc/OnPageNav';
import AltStrainsVD, { getAnchorAS } from '@strinf/ts/mvc/vdom/dyn/pass/AltStrainsVD';
import ArcVD, { getAnchorA } from '@strinf/ts/mvc/vdom/dyn/pass/ArcVD';

import DetailsVD, { getAnchorD } from '@strinf/ts/mvc/vdom/dyn/pass/DetailsVD';
import HistoryVD, { getAnchorH } from '@strinf/ts/mvc/vdom/dyn/pass/HistoryVD';
import PubVD, { getAnchorP } from '@strinf/ts/mvc/vdom/dyn/pass/PubVD';
import RelationsVD, {
    getAnc4Det,
    getAnchorR,
} from '@strinf/ts/mvc/vdom/dyn/pass/RelationsVD';
import RelStrainsVD, { getAnchorRS } from '@strinf/ts/mvc/vdom/dyn/pass/RelStrainsVD';
import SeqVD, { getAnchorS } from '@strinf/ts/mvc/vdom/dyn/pass/SeqVD';
import { TT_ID_DEP } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTDepVD';
import { TT_ID_SIM } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTSimVD';
import { TT_ID_STR } from '@strinf/ts/mvc/vdom/dyn/tooltip/TTStrVD';
import createCVSchema from '@strinf/ts/mvc/vdom/fun/schema/pass';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import SchemaMainH from '@strinf/ts/mvc/vdom/static/helmet/SchemaH';
import { Component } from 'preact';
import { memo, useCallback, useState } from 'preact/compat';

interface PassRProps {
    res: PassR | undefined;
    culId: string;
    dCtrl: DetailCtrl | undefined;
}

interface PassRVerified {
    res: PassR;
    culId: string;
    dCtrl: DetailCtrl;
}

interface ResProps {
    res: PassR;
    culId: string;
    hookDep: ToolTipHookInt<TT_GL_TYPE>;
    hookStr: ToolTipHookInt<TT_GL_TYPE>;
    hookInf: ToolTipHookInt<TT_GL_TYPE>;
    dCtrl: DetailCtrl;
}

interface CulVProps {
    resCnt: number;
    culOv: JSX.Element;
    culDet: JSX.Element;
}

const REL_ORD = 1 as const;
const DET_ORD = 2 as const;
const HIS_ORD = 3 as const;
const ALT_STR_ORD = 4 as const;
const REL_STR_ORD = 5 as const;
const SEQ_ORD = 6 as const;
const PUB_ORD = 7 as const;
const ARC_ORD = 8 as const;

function createCultureRow(
    culOv: JSX.Element,
    culDet: JSX.Element,
    colCl: [string, string],
): JSX.Element {
    return (
        <div className={ClHtml.row}>
            <div className={colCl[0]}>{culOv}</div>
            <div className={colCl[1]}>{culDet}</div>
        </div>
    );
}

function CultureView({ resCnt, culOv, culDet }: CulVProps): JSX.Element {
    let colCl: [string, string] = [Col.lN3, Col.lN9];
    if (resCnt <= 36)
        return createCultureRow(culOv, culDet, colCl);
    if (resCnt <= 54) {
        colCl = [Col.lN4, Col.lN8];
        return createCultureRow(culOv, culDet, colCl);
    }
    return (
        <>
            {culOv}
            {culDet}
        </>
    );
}

function selectCul(culId: number, rel: RelT[]): [number, string] {
    const def: [number, string] = [culId, ''];
    if (rel.length === 0) {
        return def;
    }
    for (const [cid, des] of rel) {
        if (cid === culId) {
            return [cid, des];
        }
    }
    const [ranId, ranDes] = rel[0] ?? def;
    return [ranId, ranDes];
}

function MainContainer({
    res,
    culId,
    hookDep,
    hookStr,
    hookInf,
    dCtrl,
    relEmp,
    hisRec,
}: ResProps & {
    relEmp: () => void;
    hisRec: () => void;
}): JSX.Element {
    const [selId, selDes] = selectCul(
        culId === '' ? 0 : Number.parseInt(culId, 10),
        res.relations,
    );
    const culOv = (
        <RelationsVD
            detAnc={getAnc4Det()}
            rel={res.relations}
            des={res.designations}
            curId={selId}
            hookDep={hookDep}
            hookInf={hookInf}
        />
    );
    const culDet = (
        <DetailsVD
            dCtrl={dCtrl}
            rel={res.relations}
            culId={selId}
            culDes={selDes}
            hookDep={hookDep}
            hookInf={hookInf}
        />
    );
    const oriDes = [...res.designations, ...res.relations.map(([, des]) => des)];
    return (
        <div className={Col.lN9}>
            <CultureView
                resCnt={res.relations.length + res.designations.length}
                culDet={culDet}
                culOv={culOv}
            />
            <div className={ClHtml.row}>
                <HistoryVD
                    detAnc={getAnc4Det()}
                    hooks={hookDep}
                    rel={res.relations}
                    selCuId={selId}
                    hisRec={hisRec}
                />
                <AltStrainsVD altSiId={res.altStrIds} oriDes={oriDes} hookStr={hookStr} />
            </div>
            <RelStrainsVD
                strId={res.allStrIds}
                taxN={res.overview[2][0]}
                emptyCall={relEmp}
            />
            <SeqVD
                hookDep={hookDep}
                hookInf={hookInf}
                detAnc={getAnc4Det()}
                res={res.sequences}
            />
            <PubVD
                hookDep={hookDep}
                hookInf={hookInf}
                detAnc={getAnc4Det()}
                res={res.publications}
            />
            <ArcVD res={res.archive} />
        </div>
    );
}

const MainContVD = memo(MainContainer);

function Inner({ res, culId, hookDep, hookStr, hookInf, dCtrl }: ResProps): JSX.Element {
    const [relEmp, setRelEmp] = useState<boolean>(false);
    const [hisRec, setHisRec] = useState<boolean>(false);
    const anc = {
        ...getAnchorD(DET_ORD, res.relations),
        ...getAnchorR(REL_ORD, res.relations),
        ...getAnchorH(HIS_ORD, res.relations, hisRec),
        ...getAnchorAS(ALT_STR_ORD, res.altStrIds),
        ...getAnchorS(SEQ_ORD, res.sequences),
        ...getAnchorP(PUB_ORD, res.publications),
        ...getAnchorRS(REL_STR_ORD, res.overview[2][0], relEmp),
        ...getAnchorA(ARC_ORD, res.archive),
    };
    const empRel = useCallback(() => {
        setRelEmp(true);
    }, []);
    const cirHis = useCallback(() => {
        setHisRec(true);
    }, []);
    return (
        <>
            <MainContVD
                dCtrl={dCtrl}
                res={res}
                culId={culId}
                hookInf={hookInf}
                hookDep={hookDep}
                hookStr={hookStr}
                relEmp={empRel}
                hisRec={cirHis}
            />
            <OnPageNavVD tId={IdHtmlTour.passSid}>{createNavLinks(anc)}</OnPageNavVD>
        </>
    );
}

interface DataSetProps {
    res: PassR;
    dCtrl: DetailCtrl;
}

function crUpdater(
    setDat: (con: Map<number, string>) => void,
    allIds: number,
): ViewChanInt {
    const resCon = new Map<number, string>();
    const setter = setDat;
    const limit = allIds;
    return {
        res: (detRes: DetailsR[]): void => {
            for (const [, , , culID, , , taxC] of detRes) {
                resCon.set(culID, taxC[0]);
            }
            if (resCon.size >= limit) {
                setter(resCon);
            }
        },
    };
}

function DataSet({ res, dCtrl }: DataSetProps): JSX.Element | null {
    const [dat, setDat] = useState<Map<number, string>>(() => new Map());
    const miss = res.relations.filter(([culId]) => !dat.has(culId));
    const { relations } = res;
    if (miss.length !== 0) {
        const upd = crUpdater((con: Map<number, string>) => {
            setDat(con);
        }, relations.length);
        dCtrl.init(
            upd,
            relations.map(([culID, ,]) => culID),
        );
        return null;
    }
    return <SchemaMainH json={createCVSchema(res, [...dat.values()])} />;
}

function checkUndefined(props: PassRProps): props is PassRVerified {
    const { res, dCtrl } = props;
    if (res === undefined || dCtrl === undefined) {
        return false;
    }
    return true;
}

class PassCVD extends Component<PassRProps, object> {
    public render(): JSX.Element | null {
        const ctx: TTHookG<TT_GL_TYPE> | undefined = this.context;
        const hookDep = ctx?.getTTHook(TT_ID_DEP);
        const hookStr = ctx?.getTTHook(TT_ID_STR);
        const hookInf = ctx?.getTTHook(TT_ID_SIM);
        const verified = this.props;
        if (
            hookStr !== undefined
            && hookDep !== undefined
            && hookInf !== undefined
            && checkUndefined(verified)
        ) {
            const { res, culId, dCtrl } = verified;
            return (
                <>
                    <DataSet dCtrl={dCtrl} res={res} />
                    <div className={ClHtml.row}>
                        <Inner
                            dCtrl={dCtrl}
                            res={res}
                            culId={culId}
                            hookDep={hookDep}
                            hookStr={hookStr}
                            hookInf={hookInf}
                        />
                    </div>
                </>
            );
        }
        return null;
    }
}

PassCVD.contextType = MainConGl;

export default PassCVD;
