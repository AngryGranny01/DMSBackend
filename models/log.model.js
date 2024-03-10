const Log = function (log, user, dateId) {
    this.logID = log.logId;
    this.name = log.name;
    this.descritpion = log.descritpion;
    this.userID = user.userId;
    this.dateID = dateId;
};

module.exports ={
    Log
}