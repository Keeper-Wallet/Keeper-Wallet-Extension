import * as React from 'react';

const AddZero = ({ value=0 }) => {
    const res = +value < 10 ? `0${value}` : `${value}`;
    return <span>{res}</span>
};

export const DateFormat = ({ value }) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    return <div>
        <AddZero value={day}/>-<AddZero value={month}/>-<AddZero value={year}/>
        <span> </span>
        <AddZero value={hours}/>:<AddZero value={minutes}/>
    </div>
};
