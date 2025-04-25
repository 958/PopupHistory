import { toAgo } from '../utils/time_utils.js';
import { escapeHTML } from '../utils/string_utils.js';

/**
 * History Entry Management Class
 */
export class EntryManager {
    /**
     * Constructor
     * @param {string} id - Container ID
     * @param {number} count - Number of entries to display
     * @param {RegExp} nonDisplayURL - Regular expression for URLs to hide
     * @param {string} sort - Sort method
     * @param {string} order - Sort order
     */
    constructor(id, count, nonDisplayURL, sort, order) {
        this._container = document.getElementById(id);
        this._CURRENT_CLASS = 'current';
        this._HIDDEN_CLASS = 'hidden';
        this._items = [];
        this._count = count;
        this._nonDisplayURL = nonDisplayURL;
        this._sort = sort;
        this._order = order;
        this.init('', count, nonDisplayURL, sort, order);
    }

    /**
     * Initialize
     * @param {string} query - Search query
     * @param {number} count - Number of entries to display
     * @param {RegExp} nonDisplayURL - Regular expression for URLs to hide
     * @param {string} sort - Sort method
     * @param {string} order - Sort order
     */
    init(query, count, nonDisplayURL, sort, order) {
        this._container.className = 'loading';
        this._container.innerHTML = '';
        this._items = [];
        
        chrome.history.search(
            {
                text: query,
                startTime: Date.now() - (1000 * 60 * 60 * 24 * 7),
                maxResults: count
            },
            (items) => {
                this._container.innerHTML = '';
                items = items.filter(item => !nonDisplayURL.test(item.url));
                
                const sortFunction = this._getSortFunction(sort, order);
                items.sort(sortFunction).forEach(item => {
                    this._items.push({
                        elm: this._addElm(item),
                        data: item
                    });
                });
                
                this._container.className = '';
            }
        );
    }

    /**
     * Get sort function
     * @param {string} sort - Sort method
     * @param {string} order - Sort order
     * @returns {Function} Sort function
     */
    _getSortFunction(sort, order) {
        if (sort === 'Count') {
            return (a, b) => {
                if (a.visitCount === b.visitCount) return 0;
                return order === 'ASC' 
                    ? (a.visitCount < b.visitCount ? -1 : 1)
                    : (a.visitCount > b.visitCount ? -1 : 1);
            };
        } else {
            return (a, b) => {
                if (a.lastVisitTime === b.lastVisitTime) return 0;
                return order === 'ASC'
                    ? (a.lastVisitTime < b.lastVisitTime ? -1 : 1)
                    : (a.lastVisitTime > b.lastVisitTime ? -1 : 1);
            };
        }
    }

    /**
     * Add entry element
     * @param {Object} item - History item
     * @returns {HTMLElement} Added element
     */
    _addElm(item) {
        const entry = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.url;
        
        const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
        faviconUrl.searchParams.set("pageUrl", item.url);
        faviconUrl.searchParams.set("size", "16");
        
        link.innerHTML = `
            <span class="title" style="background-image: url('${faviconUrl.toString()}')">
                ${(item.title !== '') ? escapeHTML(item.title) : item.url}
            </span>
            <span class="count">${item.visitCount.toString()}</span>
            <span class="date">${toAgo(item.lastVisitTime)}</span>
        `;
        
        link.title = item.url;
        link.target = '_blank';

        link.addEventListener('click', (e) => {
            const href = this.href;
            if (/^(file|chrome):/.test(href)) {
                const button = e.button;
                setTimeout(() => {
                    this._open(href, (button !== 1));
                }, 0);
                e.preventDefault();
            }
        }, false);

        entry.appendChild(link);
        this._container.appendChild(entry);
        return entry;
    }

    /**
     * Open link
     * @param {string} link - Link URL
     * @param {boolean} selected - Selection state
     */
    _open(link, selected) {
        chrome.tabs.create({
            url: link,
            active: selected
        });
    }

    /**
     * Filter entries
     * @param {string} q - Filter query
     */
    filter(q) {
        const queryTerms = q.toLowerCase().split(' ');
        
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            
            const result = queryTerms.every((text) => {
                return !text || item.data.title.toLowerCase().includes(text) || item.data.url.toLowerCase().includes(text);
            });
            
            item.elm.classList.toggle(this._HIDDEN_CLASS, !result);
        }
        
        const cur = this.currentItem;
        if (cur) {
            cur.elm.classList.remove(this._CURRENT_CLASS);
            window.scrollTo(0, 0);
        }
    }

    /**
     * Select entry
     * @param {number} increment - Increment value
     */
    select(increment) {
        let cur = this.currentIndex;
        if (cur >= 0) {
            this._items[cur].elm.classList.remove(this._CURRENT_CLASS);
        }
        
        for (let i = 0; i < this._items.length; i++) {
            cur += increment;
            if (cur >= this._items.length) {
                cur = 0;
            } else if (cur < 0) {
                cur = this._items.length - 1;
            }
            
            if (this._items[cur].elm.classList.contains(this._HIDDEN_CLASS)) {
                continue;
            }
            break;
        }
        
        this._items[cur].elm.classList.add(this._CURRENT_CLASS);
        this._items[cur].elm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Open current entry
     * @param {boolean} focus - Focus state
     */
    openCurrent(focus) {
        let cur = this.currentItem;
        if (!cur) {
            for (let i = 0; i < this._items.length; i++) {
                if (!this._items[i].elm.classList.contains(this._HIDDEN_CLASS)) {
                    cur = this._items[i];
                    break;
                }
            }
        }
        
        if (cur) {
            this._open(cur.data.url, focus);
        }
    }

    /**
     * Remove current entry
     */
    removeCurrent() {
        let cur = this.currentItem;
        if (!cur) {
            for (let i = 0; i < this._items.length; i++) {
                if (!this._items[i].elm.classList.contains(this._HIDDEN_CLASS)) {
                    cur = this._items[i];
                    break;
                }
            }
        }
        
        if (cur) {
            chrome.history.deleteUrl(
                { url: cur.data.url },
                () => {
                    cur.elm.parentNode.removeChild(cur.elm);
                    this._items.splice(this._items.indexOf(cur), 1);
                }
            );
        }
    }

    /**
     * Get current index
     * @returns {number} Current index
     */
    get currentIndex() {
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i].elm.classList.contains(this._CURRENT_CLASS)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Get current item
     * @returns {Object|null} Current item
     */
    get currentItem() {
        const cur = this.currentIndex;
        if (cur >= 0) {
            return this._items[cur];
        } else {
            return null;
        }
    }
} 