import type { BreadCrumbsG } from '@strinf/ts/interfaces/dom/global';
import type { JSX } from 'preact';
import CInfo from '@strinf/md/contact/info.mdx';
import CONFIG from '@strinf/ts/configs/config';
import { strain_info_mail } from '@strinf/ts/constants/links/mail';
import ClHtmlSt from '@strinf/ts/constants/stat/ClHtml';
import { ClHtml as ClHtmlPl, Font } from '@strinf/ts/constants/style/ClHtml';

import HeadT from '@strinf/ts/constants/type/HeadT';

import { getCurFullPath } from '@strinf/ts/functions/http/http';
import { openMailClient, scrambleMail } from '@strinf/ts/functions/links/mail';
import { getFormSelValue } from '@strinf/ts/functions/types/html';
import { MainConGl } from '@strinf/ts/mvc/vdom/state/GlobSt';
import CanonH from '@strinf/ts/mvc/vdom/static/helmet/CanonH';
import MetaH from '@strinf/ts/mvc/vdom/static/helmet/MetaH';
import { memo } from 'preact/compat';

import { useContext as use } from 'preact/hooks';

enum FormE {
    sub = 'subject',
}

const OPTIONS: JSX.Element[] = [
    <option key={1} value="feat">
        Feature request
    </option>,
    <option key={2} value="fix">
        Bug
    </option>,
    <option key={3} value="reg">
        Registration
    </option>,
    <option key={4} selected value="data">
        Allow catalogue data integration
    </option>,
    <option key={5} value="chore">
        Other
    </option>,
];

function crSubject(): JSX.Element {
    const lid = 'contact-subject';
    return (
        <div className={ClHtmlPl.formGr}>
            <label htmlFor={lid} className={ClHtmlPl.req}>
                Subject
            </label>
            <select id={lid} required name={FormE.sub} className={ClHtmlPl.formCtrl}>
                {OPTIONS}
            </select>
        </div>
    );
}

interface FormProps {
    mail: string;
}

function mailto(form: HTMLFormElement, destMail: string, subE: string): void {
    const formEl = form.elements;
    const sel = getFormSelValue(FormE.sub, formEl);
    openMailClient(destMail, `${sel} - ${subE}`);
}

function FormVD(props: FormProps): JSX.Element {
    const { mail } = props;
    const state = CONFIG.production ? 'prod' : 'dev';
    const cla = `${ClHtmlPl.btn} ${ClHtmlPl.pri} ${Font.bold}`;
    return (
        <div className={ClHtmlPl.box}>
            <div className={ClHtmlPl.cnt}>
                <form
                    className={ClHtmlSt.mask}
                    onSubmit={(eve) => {
                        eve.preventDefault();
                        if (eve.target instanceof HTMLFormElement) {
                            mailto(eve.target, mail, state);
                        }
                    }}
                >
                    {crSubject()}
                    <button aria-label="Mail client" className={cla} type="submit">
                        Email Client
                    </button>
                </form>
            </div>
        </div>
    );
}

interface WrProps {
    children?: JSX.Element[] | JSX.Element;
}

function ContactWr({ children }: WrProps): JSX.Element {
    return (
        <>
            <MetaH title="StrainInfo - Contact" desc="StrainInfo contact information" />
            <CanonH href={getCurFullPath()} />
            <div className={ClHtmlPl.con}>
                <div className={ClHtmlPl.cnt}>{children || []}</div>
            </div>
        </>
    );
}

function Contact(): JSX.Element | null {
    const ctx: BreadCrumbsG | undefined = use(MainConGl);
    if (ctx?.bread !== undefined) {
        for (const actF of ctx.bread) {
            actF(HeadT.CONTACT);
        }
    }
    if (ctx === undefined) {
        return null;
    }
    const WR = CInfo as (props: { mail: string }) => JSX.Element;
    return (
        <ContactWr>
            <h1 className={ClHtmlPl.titSec}>Contact</h1>
            <WR mail={scrambleMail(strain_info_mail())} />
            <FormVD mail={strain_info_mail()} />
        </ContactWr>
    );
}

const ContactVD = memo(Contact);

export default ContactVD;
