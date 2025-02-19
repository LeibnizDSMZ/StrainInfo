import { ClHtml, DdM, Pad } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';

import { createButtons, onClose, TOUR_OPTIONS } from '@strinf/ts/constants/tour/Settings';
import { routeUri, scrollToId } from '@strinf/ts/functions/http/http';
import { render } from 'preact';
import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import { callSearch } from '@strinf/ts/functions/http/sea';
import callPass from '@strinf/ts/functions/http/pass';
import PassAncId from '@strinf/ts/constants/page/pass';
import {
    getInputSearch,
    getSortSearch,
} from '@strinf/ts/mvc/vdom/static/tour/main_end_points';
import IdAcrTagCon from '@strinf/ts/constants/acr/id_acr';
import { type Driver, driver, type DriveStep, type PopoverDOM } from 'driver.js';
import type { JSX } from 'preact';
import { isNotWideScreen, isSmallScreen } from '@strinf/ts/functions/misc/screen';

function crTour(driverTour: Driver): DriveStep[] {
    return [
        {
            element: `#${IdHtmlTour.seaInHead}`,
            popover: {
                side: 'bottom' as const,
                disableButtons: ['previous'],
                description: `To find strain and deposit information, 
                use the header search bar 
                that is directly accessible from almost all pages.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, false, true, false);
                    routeUri(UIApiCon.index, '');
                },
            },
        },
        {
            element: `#${IdHtmlTour.seaInHome}`,
            popover: {
                side: 'top' as const,
                description: 'Or use the large search bar on the home page',
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `.${DdM.sug}`,
            popover: {
                side: 'left' as const,
                description: 'You can search for:',
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                    const htmlDiv = document.createElement('div');
                    render(
                        <ul className={`${ClHtml.lis} ${Pad.N15}`}>
                            <li>Genus and species names</li>
                            <li>Sequence accession numbers</li>
                            <li>Strain designations</li>
                            <li>Culture collection acronyms</li>
                            <li>StrainInfo strain IDs ({IdAcrTagCon.strId})</li>
                            <li>StrainInfo deposit IDs ({IdAcrTagCon.depId})</li>
                        </ul>,
                        htmlDiv
                    );
                    popover.description.appendChild(htmlDiv);
                },
            },
            onHighlightStarted: (element?: Element) => {
                if (element != null) {
                    element.classList.add(ClHtml.show);
                }
            },
            onDeselected: (element?: Element) => {
                if (element != null) {
                    element.classList.remove(ClHtml.show);
                }
            },
        },
        {
            popover: {
                side: 'bottom' as const,
                disableButtons: ['previous'],
                description: `Let&quot;s search the genus name
                        <i>Eubacterium</i> in the StrainInfo
                        database.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, false, true, false);
                    callSearch('Eubacterium');
                },
            },
        },
        {
            element: `#${IdHtmlTour.seaTab}`,
            popover: {
                side: 'top' as const,
                description: `A taxonomy search leads to a results table that lists
            all strains belonging to the searched genus or species.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    window.scrollTo(0, 0);
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: getInputSearch(),
            popover: {
                side: 'left' as const,
                description: `The table can be filtered using 
                                    the "search in table" input field.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: getSortSearch(),
            popover: {
                side: 'top' as const,
                description: `The table can be sorted using the 
                arrows in the table header.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            popover: {
                description: `Now let's continue with the strain page by searching the
            culture collection number 'DSM 20543'.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    callPass('34969', '134886', UIApiCon.index);
                    createButtons(driverTour, popover, false, true, false);
                },
            },
        },
        {
            popover: {
                description: `In StrainInfo a strain page shows basic strain information,
            all known deposits of the strain with deposit-specific information,
            sequence accessions, literature and the strain archive.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `.${ClHtml.titB}`,
            popover: {
                description: `Basic information on the strain can be found on the 
            left side of the page header.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `.${ClHtml.titB}`,
            popover: {
                side: 'bottom' as const,
                description: `The right side lists further sources 
            with detailed information about the strain.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `.${ClHtml.titB}`,
            popover: {
                side: 'bottom' as const,
                description: `The type strain and species name information displayed 
                for the strain are decided by a majority voting algorithm on
                the possibly conflicting deposit information.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.doiHead}`,
            popover: {
                description: `Here you can also find the DOI for the whole strain.
                By clicking on the DOI icon the full URL is copied to your clipboard.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.statusHead}`,
            popover: {
                side: 'bottom' as const,
                description: `As well as the current status of the whole strain.
                Hover over the circle to get more information about the status.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passRel}`,
            popover: {
                side: 'top' as const,
                description: 'Known deposits of the strain are represented as tiles.',
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passDet}`,
            popover: {
                side: 'left' as const,
                description: `Details of the deposit tile highlighted in yellow are 
                presented here.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passDet} a`,
            popover: {
                side: 'bottom' as const,
                description: `If available a link to the culture collection catalog entry
                is generated here.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    window.scrollTo(0, 0);
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passDet} .${ClHtml.tils}`,
            popover: {
                side: 'bottom' as const,
                description: `The final deposit details field depicts the 
                deposit exchange as a
                shallow history. Only the direct ancestor and direct descendants 
                of the deposit are displayed.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    window.scrollTo(0, 400);
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passSeq}`,
            popover: {
                side: 'bottom' as const,
                description: `Sequences for the strain are listed 
                in a searchable and sortable table.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    scrollToId(PassAncId.seq);
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passPub}`,
            popover: {
                side: 'bottom' as const,
                description: `Publications for the strain are also 
                listed in a similar table.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    scrollToId(PassAncId.pub);
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passArc}`,
            popover: {
                side: 'bottom' as const,
                description: `In this table current and previous versions of the strain 
                can be downloaded as a JSON file.
                All versions are listed with their DOI, title and date of creation.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    scrollToId(PassAncId.arc);
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passArc}`,
            popover: {
                side: 'top' as const,
                description: `This versioning of strain data ensures that these
                strains can be referenced and cited. 
                Which also significantly improves the traceability of such strains`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, true, false);
                },
            },
        },
        {
            element: `#${IdHtmlTour.passSid}`,
            popover: {
                side: 'left' as const,
                description: `The sidebar of the strain page allows easy jumping 
                between sections and links to other strains 
                of the same species or taxon name.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    window.scrollTo(0, 0);
                    createButtons(driverTour, popover, true, true, false);
                    if (isNotWideScreen()) {
                        const htmlDiv = document.createElement('div');
                        render(<p>Sidebar is hidden on small screens.</p>, htmlDiv);
                        popover.description.appendChild(htmlDiv);
                    }
                },
            },
        },
        {
            popover: {
                description: 'We hope this tour was helpful to you.',
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, true, false, true);
                },
            },
        },
    ];
}
function MainTourVD(): JSX.Element {
    const desc = (
        <p>Here you can get more information about the Website and its functions.</p>
    );

    if (isSmallScreen()) {
        return (
            <div>
                {desc}
                <p>
                    The tour is available only for displays with at least 800x600
                    resolution.
                </p>
            </div>
        );
    }
    return (
        <div>
            {desc}
            <button
                type="button"
                onClick={() => {
                    const tour = driver();
                    tour.setConfig({
                        ...TOUR_OPTIONS,
                        steps: crTour(tour),
                        onCloseClick: () => {
                            onClose(tour);
                        },
                    });
                    tour.drive();
                }}
                className={`${ClHtml.btn} ${ClHtml.pri}`}
                aria-label="Website tour"
            >
                Start
            </button>
        </div>
    );
}

export default MainTourVD;
