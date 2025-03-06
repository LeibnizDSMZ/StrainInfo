import { routeUri } from '@strinf/ts/functions/http/http';
import { useLocation } from 'preact-iso';

interface PROPS {
    to: string;
    path?: string;
}

function Redirect(props: PROPS): null {
    const { to } = props;
    const location = useLocation();
    setTimeout(() => {
        routeUri(to, to, location);
    }, 100);
    return null;
}

export default Redirect;
