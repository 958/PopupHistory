/*
(function(){
    document.addEventListener('click', function(e){
        alert(e.shiftKey);
    },false);

    var evt = document.createEvent('MouseEvents');
    evt.initEvent( 'click', false, true );
    document.dispatchEvent(evt);
})();
*/

function unique(array) {
    var temp = {};
    for (var i = 0; i < array.length; i++) {
        var key = array[i].url.replace(/#.+$/, '');
        if (!temp[key]) temp[key] = array[i];
    }
    var ret = [];
    for (var i in temp) {
        ret.push(temp[i]);
    }
    return ret;
}

// timeago: a jQuery plugin
// http://timeago.yarp.com/
function toAgo(time){
    var strings = {
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
    var $l = strings;
    var prefix = $l.prefixAgo;
    var suffix = $l.suffixAgo;

    var distanceMillis = new Date().getTime() - time;

    var seconds = distanceMillis / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;

    function substitute(string, number) {
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
    }

    var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 48 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.floor(days)) ||
        days < 60 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.floor(days / 30)) ||
        years < 2 && substitute($l.year, 1) ||
        substitute($l.years, Math.floor(years));

    return [prefix, words, suffix].join(" ").trim();
}

function EntryManager(id, count, nonDisplayURL, sort, order) {
    this._container = document.getElementById(id);
    this.init('', count, nonDisplayURL, sort, order);
}
EntryManager.prototype = {
    _container: null,
    _items: [],
    init: function(query, count, nonDisplayURL, sort, order) {
        this._container.className = 'loading';
        this._container.innerHTML = '';
        this._items = [];
        var self = this;
        chrome.history.search(
            {
                text: query,
                maxResults: count
            },
            function(items){
                self._container.innerHTML = '';
                items = unique(items).
                    filter(function(item){
                        return !nonDisplayURL.test(item.url);
                    });
                var f;
                switch (sort) {
                case 'Count':
                    if (order == 'ASC') {
                        f = function(a, b){
                            return (a.visitCount == b.visitCount) ? 0 : (a.visitCount < b.visitCount) ? -1 : 1;
                        };
                    } else {
                        f = function(a, b){
                            return (a.visitCount == b.visitCount) ? 0 : (a.visitCount > b.visitCount) ? -1 : 1;
                        };
                    }
                    break;
                default:
                    if (order == 'ASC') {
                        f = function(a, b){
                            return (a.lastVisitTime == b.lastVisitTime) ? 0 : (a.lastVisitTime < b.lastVisitTime) ? -1 : 1;
                        };
                    } else {
                        f = function(a, b){
                            return (a.lastVisitTime == b.lastVisitTime) ? 0 : (a.lastVisitTime > b.lastVisitTime) ? -1 : 1;
                        };
                    }
                    break;
                }
                items.sort(f).forEach(function(item){
                    self._items.push({
                        elm: self._addElm(item),
                        data: item
                    });
                });
                self._container.className = '';
            }
        );
    },
    _addElm: function(item) {
        var self = this;
        var entry = document.createElement('li');
        var link = document.createElement('a');
        link.href = item.url;
        link.innerHTML =
            '<span class="title" style="background-image: url(chrome://favicon/' + item.url + ')">' +
                ((item.title != '') ? item.title.escapeHTML() : item.url) + '</span>' +
            '<span class="count">' + item.visitCount.toString() + '</span>' +
            '<span class="date">' + toAgo(item.lastVisitTime) + '</span>';
        link.title = item.url;
        link.target = '_blank';

        link.addEventListener('click', function(e){
            var href = this.href;
            if (/^(file|chrome):/.test(href)) {
                var button = e.button;
                setTimeout(function(){
                    chrome.tabs.create({
                        url: href,
                        selected: (button != 1)
                    });
                },0);
                e.preventDefault();
            }
        }, false);

        entry.appendChild(link);
        this._container.appendChild(entry);
        return entry;
    },
    filter: function(q) {
        q = q.toLowerCase().split(' ');
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            var result = true;
            for (var j = 0; j < q.length; j++) {
                var text = q[j];
                if (!text) break;
                if ((item.data.title + item.data.url).toLowerCase().indexOf(text) == -1) {
                    result = false;
                    break;
                }
            }
            if (result == false) {
                item.elm.setAttribute('class', 'hidden');
            } else {
                item.elm.setAttribute('class', '');
            }
        }
    }
};

window.addEventListener('load', function(e){
    var options = Options.load();
    var nonDisplayURL = new RegExp(options.NonDisplayURL.join('|'), 'i');

    var em = new EntryManager('entries', options.ItemCount, nonDisplayURL, options.Sort, options.Order);

    document.getElementById('title').addEventListener('click', function(e) {
        var button = e.button;
        setTimeout(function(){
            chrome.tabs.create({
                url: 'chrome://history/',
                selected: (button != 1)
            });
        },0);
    }, false);

    (function(){
        var _prevQuery = '';
        var queryElm = document.getElementById('query');
        queryElm.addEventListener('search', function(e) {
            var query = queryElm.value.trim();
            if (_prevQuery != query) {
                _prevQuery = query;
                if (options.SearchAllHistory)
                    em.init(query, options.ItemCount, nonDisplayURL, options.Sort, options.Order);
                else
                    em.filter(query);
            }
        }, false);
    })();
}, false);

String.prototype.escapeHTML = function () {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

