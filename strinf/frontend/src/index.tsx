// critical style
import 'digidive/css/digidive.css';
import '@strinf/css/root.css';
// non critical style
import 'digidive/css/d3icons/style.css';
import '@phosphor-icons/web/regular';
import '@strinf/css/adhoc/anchor.css';

// style functionality
import 'digidive';

import { render } from 'preact';

import MainVD from '@strinf/ts/mvc/vdom/MainVD';
import { createUrlStr, hidePrivateInfo } from '@strinf/ts/functions/http/http';
import { createPreloadBanner } from '@strinf/ts/functions/files/image';
import { Helmet } from 'react-helmet';
import CONFIG from '@strinf/ts/configs/config';
import type { JSX } from 'preact';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { SIDE_SMALL } from '@strinf/ts/constants/style/AtHtml';
import { ErrorBoundary, LocationProvider } from 'preact-iso';

hidePrivateInfo();
const pBE: JSX.Element = (
    <link rel="preconnect" href={createUrlStr(CONFIG.backend, '')} />
);
let pST: JSX.Element | null = null;
if (CONFIG.statistic.enable) {
    pST = <link rel="preconnect" href={createUrlStr(CONFIG.statistic.matomo, '')} />;
}

function IndexBody(): JSX.Element {
    return (
        <body className={ClHtml.sideSM} {...SIDE_SMALL}>
            <LocationProvider>
                <ErrorBoundary
                    onError={(err) => {
                        console.log('detected uncaught error', err.message);
                    }}
                >
                    <Helmet>
                        {pBE}
                        {pST}
                    </Helmet>
                    {createPreloadBanner()}
                    <MainVD />
                </ErrorBoundary>
            </LocationProvider>
        </body>
    );
}

render(<IndexBody />, document.body.parentNode ?? document.body);
