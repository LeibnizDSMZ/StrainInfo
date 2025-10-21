import { selectBannerImage } from '@strinf/ts/functions/files/image';

function DefaultVD() {
    return (
        <img
            src={selectBannerImage()}
            alt="Background"
            fetchPriority="high"
            width={window.innerWidth}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: -2,
            }}
        />
    );
}

function DefaultGradientVD() {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background:
                        'linear-gradient(to right, rgba(27, 27, 27, 0.7) 20%, rgba(27, 27, 27, 0))',
                    zIndex: -1,
                }}
            />
            <DefaultVD />
        </>
    );
}

function DefaultDarkVD() {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: -1,
                }}
            />
            <DefaultVD />
        </>
    );
}

export { DefaultDarkVD, DefaultGradientVD };
