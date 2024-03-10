
const DateTime = function (date) {
    this.year = date.year;
    this.month = date.month;
    this.day = date.day;
    this.hour = date.hour;
    this.minute = date.minute;
}


const findNewestDate = (dates) => {
    if (dates.length === 0) return null;

    let newestDate = dates[0];
    for (let i = 1; i < dates.length; i++) {
        const current = dates[i];
        if (isNewer(current, newestDate)) {
            newestDate = current;
        }
    }
    return newestDate;
};

const isNewer = (date1, date2) => {
    const dateTime1 = convertToDateTime(date1);
    const dateTime2 = convertToDateTime(date2);

    const numericDate1 = calculateNumericDate(dateTime1);
    const numericDate2 = calculateNumericDate(dateTime2);

    return numericDate1 > numericDate2;
};

const convertToDateTime = (date) => {
    return new DateTime(date);
};

const calculateNumericDate = (dateTime) => {
    return dateTime.year * 100000000 + dateTime.month * 1000000 + dateTime.day * 10000 + dateTime.hour * 100 + dateTime.minute;
};

module.exports = { DateTime, findNewestDate };