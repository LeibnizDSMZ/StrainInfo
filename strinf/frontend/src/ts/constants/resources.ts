const GREP_GEN = /\/([^/]+)\.[^/.]+$/;
const GREP_WEBP = /^.*\/([^/]+)\.(webp|jpeg|jpg|png)+$/;
const GREP_ID = /^[^@]*@([^@]+)@.*$/;

const RESOURCES_PATH: Record<string, (path: string) => string> = {
    '@extra/straininfo/users/': (path: string) => {
        const name = GREP_GEN.exec(path);
        if (name?.[1] !== undefined) {
            const userID = `@${name[1]}@`;
            return userID;
        }
        return path;
    },
};

function getName(picName: string): string {
    for (const regP of [GREP_WEBP, GREP_ID]) {
        const name = regP.exec(picName);
        if (name?.[1] !== undefined) {
            return name[1];
        }
    }
    return '';
}

function createUserPicMap(userPics: [string, unknown][]): Map<string, string> {
    const picMap = new Map<string, string>();
    for (const [picNam, picPath] of userPics) {
        if (typeof picPath !== 'string') {
            continue;
        }
        const name = getName(picNam);
        if (name !== '') {
            picMap.set(name, picPath);
        }
    }
    return picMap;
}

export { createUserPicMap, RESOURCES_PATH };
