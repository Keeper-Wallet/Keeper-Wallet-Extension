import * as React from 'react';
import * as styles from './fromDate.styl';

const AddZero = ({ value=0 }) => {
    const res = +value < 10 ? `0${value}` : `${value}`;
    return <span>{res}</span>
};

const FullYear = ({ value }) => {
    const year = new Date(value).getFullYear();
    return <AddZero value={year}/>;
};

const Month = ({ value }) => {
    const month = new Date(value).getMonth();
    return <AddZero value={month + 1}/> ;
};

const Day = ({ value }) => {
    const day = new Date(value).getDate();
    return <AddZero value={day}/>;
};

const Hours = ({ value }) => {
    const hours = new Date(value).getHours();
    return <AddZero value={hours}/>;
};

const Minutes = ({ value }) => {
    const minutes = new Date(value).getMinutes();
    return <AddZero value={minutes}/>;
};

const TYPES = {
    DD: Day,
    MM: Month,
    YYYY: FullYear,
    hh: Hours,
    mm: Minutes
};

const DateFromFormat = ({ value, format }) => {
    return <span>{
        Object.keys(TYPES)
        .map((type) => ({ index: format.indexOf(type), type }))
        .filter(c => c.index > -1)
        .sort((a, b) => a.index - b.index)
        .reduce((prev, current, ind) => {
            const { index } = current;
            if (index > prev.index) {
                const res = format.slice(prev.index, index);
                prev.index += res.length;
                prev.data.push(<span key={res + ind}>{res}</span>)
            }
            const Comp = TYPES[current.type];
            prev.data.push(<Comp value={value} key={ current.type + prev.index + ind }></Comp>);
            prev.index += current.type.length;
            return prev;
        }, { data: [], index: 0 }).data
    }</span>
};

export const DateFormat = ({ value, format='DD-MM-YYYY hh:mm', showRaw = false, className = '' }) => {
    return <div className={className}>
        <DateFromFormat value={value} format={format}/> { showRaw ? <span className={styles.timestamp}>{value}</span> : undefined }
    </div>
};
