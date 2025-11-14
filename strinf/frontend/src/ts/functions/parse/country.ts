const reNames = new Intl.DisplayNames(['en'], { type: 'region' });

function parseCountryCode(code: string): string {
    try {
        return reNames.of(code) ?? code;
    }
    catch {
        return code;
    }
}

export default parseCountryCode;
