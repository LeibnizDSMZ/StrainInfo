abstract class Controller<T, E extends [...unknown[]]> {
    private initVersion: string;

    constructor(version: string) {
        this.initVersion = version;
    }

    public setVersion(version: string): void {
        if (version !== '') {
            if (this.initVersion !== '' && version !== this.initVersion) {
                window.location.reload();
            }
            this.initVersion = version;
        }
    }

    protected reloadWindowOrCb(version: string, callback: () => void): void {
        if (this.initVersion !== '' && version !== this.initVersion) {
            window.location.reload();
        } else {
            this.initVersion = version;
            callback();
        }
    }

    public abstract init(cha: T, ...args: [...E]): void;
}

export default Controller;
