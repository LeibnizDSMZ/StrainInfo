import { UIApiCon } from '@strinf/ts/constants/api/ui_api';
import { Align, ClHtml, Dis, Pad, Wid } from '@strinf/ts/constants/style/ClHtml';
import IdHtmlTour from '@strinf/ts/constants/tour/IdHtml';
import { createButtons, onClose, TOUR_OPTIONS } from '@strinf/ts/constants/tour/Settings';
import { routeUri } from '@strinf/ts/functions/http/http';
import { driver, type PopoverDOM, type DriveStep, type Driver } from 'driver.js';
import {
    getApiRequest,
    getEndPoint,
    getEndPointPath,
    openEndPointPath,
} from '@strinf/ts/mvc/vdom/static/tour/api_end_points';
import ClHtmlI from '@strinf/ts/constants/icon/ClHtml';
import { render } from 'preact';
import crAlert from '@strinf/ts/mvc/vdom/fun/alert/alert';
import ErrType from '@strinf/ts/constants/type/ErrT';
import type { JSX } from 'preact';
import { isSmallScreen } from '@strinf/ts/functions/misc/screen';
import type { LocationHook } from 'preact-iso';
import { useLocation } from 'preact-iso';

function createElement(ele: Element | null): { element?: Element } {
    if (ele == null) {
        return {};
    }
    return { element: ele };
}

function createTour(driverTour: Driver, location: LocationHook): DriveStep[] {
    const tour: DriveStep[] = [
        {
            element: `#${IdHtmlTour.apiHead}`,
            popover: {
                side: 'bottom' as const,
                description: `The documentation for the StrainInfo web service
                can be found under the "Web service" category.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [false, true, false], location);
                },
            },
        },
        {
            ...createElement(getEndPoint()),
            popover: {
                side: 'bottom' as const,
                description: `StrainInfo's web API provides several different endpoints,
                that requests can be send to.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [true, true, false], location);
                },
            },
        },
        {
            ...createElement(getEndPoint()),
            popover: {
                side: 'bottom' as const,
                description: `On the documentation page they are listed with short
                explanations and the option to test them.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [true, true, false], location);
                },
            },
        },
        {
            ...createElement(getEndPointPath()),
            popover: {
                side: 'bottom' as const,
                description: `More information on each endpoint 
                can be found by opening up its section.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [true, true, false], location);
                },
            },
        },
        {
            ...createElement(getEndPointPath()),
            popover: {
                side: 'left' as const,
                description: `An example request to the server,
                can be made by clicking the "TRY" button.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [false, true, false], location);
                    openEndPointPath();
                },
            },
        },
        {
            ...createElement(getEndPointPath()),
            popover: {
                side: 'left' as const,
                description: `The URL for the request to 
                the server is shown in the curl command,
                which can be used to make the request via a Unix command line.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [false, true, false], location);
                    let cnt = 0;
                    getApiRequest(true);
                    const awaitApi = setInterval(() => {
                        if (cnt >= 200 || getApiRequest(false) !== null) {
                            clearInterval(awaitApi);
                            driverTour.refresh();
                        }
                        cnt++;
                    }, 200);
                },
            },
        },
        {
            ...createElement(getEndPointPath()),
            popover: {
                description: `The actual response to the 
                request is shown in the JSON format and,
                in this case, contains just one number: the number of strains 
                in the StrainInfo database.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [true, true, false], location);
                },
            },
        },
        {
            popover: {
                description: `All the other endpoints are documented here 
                and can be tested in a similar way. 
                We encourage you to experiment with the API
                here before using it in production.`,
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [true, true, false], location);
                },
            },
        },
        {
            popover: {
                description: 'We hope this tour was helpful to you.',
                onPopoverRender: (popover: PopoverDOM) => {
                    createButtons(driverTour, popover, [true, false, true], location);
                },
            },
        },
    ];
    return tour;
}

function checkApi(): boolean {
    if (getEndPointPath() === null) {
        return false;
    }
    if (getEndPoint() === null) {
        return false;
    }
    return true;
}

function prepareDrive(location: LocationHook): void {
    const driveTour = driver();
    window.scrollTo(0, 0);
    routeUri(UIApiCon.service, '', location);
    let cnt = 0;
    const awaitApi = setInterval(() => {
        if (checkApi()) {
            driveTour.setConfig({
                ...TOUR_OPTIONS,
                steps: createTour(driveTour, location),
                onCloseClick: () => {
                    onClose(driveTour, location);
                },
            });
            driveTour.drive();
            clearInterval(awaitApi);
        }
        cnt++;
        if (cnt > 200) {
            crAlert(ErrType.FEWARN, 'API takes too long too load for tour');
            clearInterval(awaitApi);
        }
    }, 200);
}
function TourS(): JSX.Element {
    const location = useLocation();
    return (
        <button
            type="button"
            onClick={() => {
                prepareDrive(location);
            }}
            className={`${ClHtml.btn} ${ClHtml.pri}`}
            aria-label="Web service tour"
        >
            Start
        </button>
    );
}

function YouTubeB(): JSX.Element {
    return (
        <div>
            <p>
                Watch our tutorial on{' '}
                <a
                    href="https://www.youtube.com/watch?v=utcq5G9xtbk&t=1s"
                    target="_blank"
                    rel="noreferrer"
                >
                    YouTube
                </a>{' '}
                or click on the YouTube button below to load the video here.
            </p>
            <p>Note: YouTube has a different privacy policy.</p>
            <div className={`${Align.jc} ${Dis.dFlex}`}>
                <button
                    type="button"
                    aria-label="Watch YouTube"
                    className={`${ClHtml.btn} ${ClHtml.dan}`}
                    onClick={(eve) => {
                        const cont = eve.currentTarget.parentElement?.parentElement;
                        if (cont != null) {
                            let lastChi = cont.lastElementChild;
                            while (lastChi !== null) {
                                cont.removeChild(lastChi);
                                lastChi = cont.lastElementChild;
                            }
                            render(<YouTubeI />, cont);
                        }
                    }}
                >
                    <i className={ClHtmlI.youtube} />
                </button>
            </div>
        </div>
    );
}

function YouTubeI(): JSX.Element {
    return (
        <div className={Pad.tN15}>
            <iframe
                width="560"
                height="315"
                src="https://www.youtube-nocookie.com/embed/utcq5G9xtbk?si=_yODhDSv6fiL0dVv&privacy_mode=1"
                title="YouTube video player"
                allow={`accelerometer; autoplay; 
        clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`}
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                    border: 0,
                }}
            />
        </div>
    );
}

function ApiTourVD(): JSX.Element {
    let tourS = <TourS />;
    if (isSmallScreen()) {
        tourS = (
            <p>
                The tour is available only for displays with at least 800x600 resolution.
            </p>
        );
    }
    return (
        <div className={Dis.dFlex} style={{ 'flex-flow': 'row wrap' }}>
            <div
                className={`${Pad.rN10} ${Wid.N500} ${Pad.tN15}`}
                style={{ 'min-width': 300 }}
            >
                API stands for Application Programming Interface. An API or web service is
                a set of procedures that allow applications to communicate with each
                other. The procedures can be used in code to communicate with an
                application, like StrainInfo and automatically request information from
                the database.
                <p>
                    Here you can get more information about the web service and its
                    functions.
                </p>
                {tourS}
            </div>
            <YouTubeB />
        </div>
    );
}

export default ApiTourVD;
