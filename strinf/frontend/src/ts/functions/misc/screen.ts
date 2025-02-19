function isSlimScreen(): boolean {
    return document.body.clientWidth < 800;
}
function isNotWideScreen(): boolean {
    return document.body.clientWidth < 1200;
}
function isSmallScreen(): boolean {
    return document.body.clientHeight < 600 || isSlimScreen();
}

export { isSlimScreen, isSmallScreen, isNotWideScreen };
