Number.prototype.round = function (decimals) {
     if (typeof decimals === 'undefined') decimals = 0;
     return Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

Array.prototype.random = function () {
     return this[Math.floor(Math.random() * this.length)]
}

Number.prototype.now = function () {
     return Date.now() - this;
}

Math.toRadians = function (degrees) {
     return degrees * (Math.PI / 180);
}

Number.prototype.timeSince = function () {
     let date = new Date(this);
     let seconds = Math.floor((new Date() - date) / 1000);

     let interval = seconds / 31536000;

     if (interval > 1) return Math.floor(interval) + " years";

     interval = seconds / 2592000;
     if (interval > 1) return Math.floor(interval) + " months";

     interval = seconds / 86400;
     if (interval > 1) return Math.floor(interval) + " days";

     interval = seconds / 3600;
     if (interval > 1) return Math.floor(interval) + " hours";

     interval = seconds / 60;
     if (interval > 1) return Math.floor(interval) + " minutes";

     return Math.floor(seconds) + " seconds";
}

export default {}