const FULL_DATE_R = /^\d{4}-\d{2}-\d{1,2}$/;
const FULL_DATE: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
};
const MONTH_DATE_R = /^\d{4}-\d{2}$/;
const MONTH_DATE: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
};
const YEAR_DATE_R = /^\d{4}$/;
const YEAR_DATE: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
};

const BETWEEN_R = /^(\d{4})(?:-\d{1,2}){0,2}\/(\d{4}(?:-\d{1,2}){0,2})$/;

function createDate(date: string): string {
    if (FULL_DATE_R.test(date))
        return new Date(date).toLocaleDateString('en-GB', FULL_DATE);
    if (MONTH_DATE_R.test(date))
        return new Date(date).toLocaleDateString('en-GB', MONTH_DATE);
    if (YEAR_DATE_R.test(date))
        return new Date(date).toLocaleDateString('en-GB', YEAR_DATE);
    return date;
}

// TODO still very simple
function createDateRKMS(date: string): string {
    if (date.startsWith('/')) {
        return `before ${createDate(date.slice(1))}`;
    }
    if (date.endsWith('/')) {
        return `after ${createDate(date.slice(0, -1))}`;
    }
    const btw = BETWEEN_R.exec(date);
    if (btw?.[1] !== undefined && btw[2] !== undefined) {
        return `between ${createDate(btw[1])} and ${createDate(btw[2])}`;
    }
    return createDate(date);
}

export { BETWEEN_R, createDate, createDateRKMS };
