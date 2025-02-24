import { ClHtml } from '@strinf/ts/constants/style/ClHtml';
import onPrError from '@strinf/ts/functions/err/async';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';

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
    const [load, setLoad] = useState(false);
    const [linkC, setLinkC] = useState(['', '']);
    const linKRef = useRef<HTMLAnchorElement>(null);
    useEffect(() => {
        const [linkL, nameL] = linkC;
        if (linkL !== '' || nameL !== '') {
            setLinkC(['', '']);
        }
    }, [state]);
    const icoLS = { opacity: 1 };
    if (emptyLoad) {
        icoLS.opacity = 0;
    }
    if (load) {
        return (
            <span className={`${btnC} ${ClHtml.load}`}>
                <i className={ico} style={icoLS} />
            </span>
        );
    }
    const [linkL, nameL] = linkC;
    if (linkL === '' || nameL === '') {
        return (
            <button
                className={btnC}
                type="button"
                aria-label={label}
                onClick={(eve) => {
                    setLoad(true);
                    callBack(eve)
                        .then((linkCC) => {
                            setLinkC(linkCC);
                            const int = setInterval(() => {
                                if (linKRef.current !== null) {
                                    linKRef.current.click();
                                    clearInterval(int);
                                }
                            }, 100);
                            setLoad(false);
                        })
                        .catch(onPrError);
                }}
                style={{ outline: 'none', boxShadow: 'none' }}
            >
                <i className={ico} />
                <span>
                    <b>{desc}</b>
                </span>
            </button>
        );
    }
    return (
        <span className={btnC}>
            <a
                ref={linKRef}
                type="button"
                href={linkL}
                download={nameL}
                aria-label={label}
                className={ancC}
            >
                <i className={ico} />
                <span>
                    <b>{desc}</b>
                </span>
            </a>
        </span>
    );
}

export default DownloadBlobVD;
