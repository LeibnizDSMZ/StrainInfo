const F_COOKIE = 'agreed';

function setFirstAgreed(): void {
    const expTime = new Date();
    expTime.setTime(expTime.getTime() + 180 * 24 * 3600 * 1000);
    const cStr = `${F_COOKIE}=true;Secure;SameSite=Strict;Path=/;expires=${expTime};`;
    document.cookie = cStr;
}

function checkFirstCookie(): boolean {
    return /.*\s?agreed=true.*/.test(document.cookie);
}

export { checkFirstCookie, setFirstAgreed };
