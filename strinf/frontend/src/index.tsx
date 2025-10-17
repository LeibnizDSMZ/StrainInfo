import type { JSX } from 'preact';

import loaderSty from '@strinf/css/mods/loader.module.css';

import CONFIG from '@strinf/ts/configs/config';
import { SIDE_SMALL } from '@strinf/ts/constants/style/AtHtml';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import { createPreloadBanner } from '@strinf/ts/functions/files/image';
import { createUrlStr, hidePrivateInfo } from '@strinf/ts/functions/http/http';
import MainVD from '@strinf/ts/mvc/vdom/MainVD';
import PreConnectH from '@strinf/ts/mvc/vdom/static/helmet/ConnectH';
import { render } from 'preact';

import { ErrorBoundary, LocationProvider } from 'preact-iso';
import { useEffect } from 'preact/hooks';
// style functionality
import 'digidive';

// critical style
import 'digidive/css/digidive.css';
import '@strinf/css/root.css';

hidePrivateInfo();

function IndexBody(): JSX.Element {
    useEffect(() => {
        void import('@phosphor-icons/web/regular/style.css');
        void import('digidive/css/d3icons/style.css');
        void import('@strinf/css/adhoc/anchor.css');
    }, []);
    return (
        <body className={`${ClHtml.sideSM} ${loaderSty.loadoverlay}`} {...SIDE_SMALL}>
            <LocationProvider>
                <ErrorBoundary
                    onError={(err) => {
                        console.warn('detected uncaught error', err.message);
                    }}
                >
                    <PreConnectH
                        id="matomo_con"
                        href={createUrlStr(CONFIG.statistic.matomo, '')}
                    />
                    <PreConnectH id="api_con" href={createUrlStr(CONFIG.backend, '')} />
                    {createPreloadBanner()}
                    <MainVD />
                </ErrorBoundary>
            </LocationProvider>
        </body>
    );
}

render(<IndexBody />, document.body.parentNode ?? document.body);
