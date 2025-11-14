import type { InValStInt } from '@strinf/ts/interfaces/dom/inp';
import type {
    DatIdTVInt,
    TT_GL_TYPE,
    TTSrcTVInt,
} from '@strinf/ts/interfaces/dom/tooltip';
import type AncT from '@strinf/ts/interfaces/misc/anchor';
import type { JSX } from 'preact';
import tilSty from '@strinf/css/mods/tile.module.css';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import PassAncId from '@strinf/ts/constants/page/pass';
import { ClHtml, Col } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import { createRStrTiles, TooltipWrapper } from '@strinf/ts/mvc/vdom/fun/tab/pass';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import { useContext as use } from 'preact/hooks';

const ID = PassAncId.alt_str;

function getAnchorAS(ord: number, alt: number[]): AncT {
    if (alt.length > 0) {
        return { [ord]: [ID, 'Other strains - Designation'] };
    }
    return {};
}

interface AltProps {
    altSiId: number[];
}

function createTiles(
    tiles: [JSX.Element, number][],
    hook: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>,
    addInd: number,
    oriDes: string[],
): JSX.Element[] {
    return tiles.map((til, ind: number) => (
        <TooltipWrapper
            key={ind + addInd}
            chi={til[0]}
            srcH={hook}
            upD={() => {
                if (hook.data !== undefined) {
                    hook.data([til[1], oriDes]);
                }
            }}
        />
    ));
}

interface TProps {
    alt: number[];
    strH: TTSrcTVInt & DatIdTVInt<TT_GL_TYPE>;
    oriDes: string[];
}

function AltStrains({ strH, alt, oriDes }: TProps): JSX.Element | null {
    const ctx: InValStInt | undefined = use(MainConGl);
    const tilesStr = createRStrTiles(
        alt,
        (dat: number) => [dat, `${IdAcrTagCon.strId} ${dat}`],
        ctx,
    );
    if (tilesStr.length === 0) {
        return null;
    }
    const tiles = createTiles(tilesStr, strH, 0, oriDes);
    const cla = `${ClHtml.tils} ${tilSty.tilestext}`;
    return <div className={cla}>{tiles}</div>;
}

interface AltProps {
    altSiId: number[];
    hookStr: DatIdTVInt<TT_GL_TYPE> & TTSrcTVInt;
    oriDes: string[];
}

function AltStrainsVD({ altSiId, hookStr, oriDes }: AltProps): JSX.Element | null {
    if (altSiId.length === 0) {
        return null;
    }
    return (
        <div id={IdHtmlTour.strainAlt} className={Col.col}>
            <h3 className={ClHtml.titSec}>
                Other strains with overlapping designations
                <span id={ID} />
            </h3>
            <section>
                <AltStrains alt={altSiId} strH={hookStr} oriDes={oriDes} />
            </section>
        </div>
    );
}

export default AltStrainsVD;

export { getAnchorAS };
