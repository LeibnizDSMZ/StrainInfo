import type { JSX } from 'preact';

const GrAb = new URL('@assets/dia/gr_ab.jpg', import.meta.url).pathname;

function AboutIluVD(): JSX.Element {
    /** not loading="lazy" because of cls */
    return <img height="535" src={GrAb} alt="Background" />;
}

export default AboutIluVD;
