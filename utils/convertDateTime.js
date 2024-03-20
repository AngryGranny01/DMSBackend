const convertTimeStampToDateTime = (timeStamp) => {
    const date = {
        year: timeStamp.getFullYear(),
        month: timeStamp.getMonth() + 1, // Adding 1 because getMonth() returns zero-based month index
        day: timeStamp.getDate(),
        hour: timeStamp.getHours(),
        minute: timeStamp.getMinutes(),
    }
    return new DateTime(date);
}

module.exports = { convertTimeStampToDateTime };