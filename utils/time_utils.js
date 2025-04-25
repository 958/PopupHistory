/**
 * Function to convert time to "X time ago" format
 * @param {number} time - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function toAgo(time) {
    const strings = {
        suffixAgo: "ago",
        suffixFromNow: "from now",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
    };
    
    const prefix = strings.prefixAgo;
    const suffix = strings.suffixAgo;

    const distanceMillis = Date.now() - time;

    const seconds = distanceMillis / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const years = days / 365;

    function substitute(string, number) {
        const value = (strings.numbers && strings.numbers[number]) || number;
        return string.replace(/%d/i, value);
    }

    const words = seconds < 45 && substitute(strings.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute(strings.minute, 1) ||
        minutes < 45 && substitute(strings.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute(strings.hour, 1) ||
        hours < 24 && substitute(strings.hours, Math.round(hours)) ||
        hours < 48 && substitute(strings.day, 1) ||
        days < 30 && substitute(strings.days, Math.floor(days)) ||
        days < 60 && substitute(strings.month, 1) ||
        days < 365 && substitute(strings.months, Math.floor(days / 30)) ||
        years < 2 && substitute(strings.year, 1) ||
        substitute(strings.years, Math.floor(years));

    return [prefix, words, suffix].join(" ").trim();
} 