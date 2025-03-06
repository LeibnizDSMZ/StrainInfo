import {
    createStrainCall,
    createStrainCultureCall,
} from '@strinf/ts/functions/links/create_pass';
import { routeUri } from '@strinf/ts/functions/http/http';
import Known500Error from '@strinf/ts/errors/known/500';
import type { LocationHook } from 'preact-iso';

function callPass(
    strain: string,
    culture: string,
    replace: string,
    location: LocationHook
): void {
    if (strain === '') {
        throw new Known500Error(`empty strain detected ${strain}`);
    }
    const routeS =
        culture === ''
            ? createStrainCall(strain)
            : createStrainCultureCall(strain, culture);
    routeUri(routeS, replace, location);
}

export default callPass;
