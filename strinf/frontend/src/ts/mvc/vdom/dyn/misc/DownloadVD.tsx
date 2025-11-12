import type { JSX } from 'preact';
import ClHtmlSt from '@strinf/ts/constants/stat/ClHtml';
import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import onPrError from '@strinf/ts/functions/err/async';
import { useRef, useState } from 'preact/hooks';

interface DBProp {
    btnC: string;
    ancC: string;
    ico: string;
    callBack: (eve: Event) => Promise<[string, string]>;
    label: string;
    emptyLoad: boolean;
    state: number | string;
    desc: string;
}

function DownloadBlobVD({
    btnC,
    ico,
    callBack,
    ancC,
    label,
    emptyLoad,
    state,
    desc,
}: DBProp): JSX.Element {
    const [downS, setDownS] = useState({
        dState: state,
        link: '',
        name: '',
        load: false,
    });
    const linKRef = useRef<HTMLAnchorElement>(null);
    const icoLS = { opacity: 1 };
    if (emptyLoad) {
        icoLS.opacity = 0;
    }
    const { load } = downS;
    if (load) {
        return (
            <span className={`${btnC} ${ClHtml.load}`}>
                <i className={ico} style={icoLS} />
            </span>
        );
    }
    const { link, name, dState } = downS;
    if (link === '' || name === '' || dState !== state) {
        let counter = 1;
        return (
            <button
                className={btnC}
                type="button"
                aria-label={label}
                onClick={(eve) => {
                    setDownS({ ...downS, load: true, dState: state });
                    callBack(eve)
                        .then((linkCC) => {
                            setDownS({
                                ...downS,
                                load: false,
                                link: linkCC[0],
                                name: linkCC[1],
                                dState: state,
                            });
                            const int = setInterval(() => {
                                counter++;
                                if (linKRef.current !== null) {
                                    linKRef.current.click();
                                    clearInterval(int);
                                } else if (counter > 2400) {
                                    clearInterval(int);
                                }
                            }, 100);
                        })
                        .catch(onPrError);
                }}
                style={{ outline: 'none', boxShadow: 'none' }}
            >
                <i className={ico} />
                {desc !== '' ? <b>{desc}</b> : null}
            </button>
        );
    }
    return (
        <span className={btnC}>
            <a
                ref={linKRef}
                type="button"
                href={link}
                download={name}
                aria-label={label}
                className={`${ancC} ${ClHtmlSt.ignore}`}
                target="_blank"
                rel="noopener"
            >
                <i className={ico} />
                {desc !== '' ? <b>{desc}</b> : null}
            </a>
        </span>
    );
}

export default DownloadBlobVD;
