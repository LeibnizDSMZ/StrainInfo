function isSlimScreen(): boolean {
    return window.innerWidth < 800;
}
function isSmallScreen(): boolean {
    return window.innerHeight < 600 || isSlimScreen();
}

export { isSlimScreen, isSmallScreen };
