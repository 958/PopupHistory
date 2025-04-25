/**
 * Options Management Class
 */
export class Options {
    /**
     * Default options
     * @type {Object}
     */
    static _defaultOptions = {
        SearchAllHistory: true,
        ItemCount: 100,
        NonDisplayURL: ['^chrome-extension://'],
        Sort: 'Date',
        Order: 'DESC'
    };

    /**
     * Load options
     * @returns {Object} Options
     */
    static load() {
        let options = { ...this._defaultOptions };
        
        if (localStorage.options) {
            try {
                const savedOptions = JSON.parse(localStorage.options);
                options = { ...options, ...savedOptions };
            } catch (e) {
                console.error('Failed to parse options from localStorage:', e);
            }
        }
        
        return options;
    }

    /**
     * Save options
     * @param {Object} options - Options to save
     */
    static save(options) {
        try {
            localStorage.options = JSON.stringify(options);
        } catch (e) {
            console.error('Failed to save options to localStorage:', e);
        }
    }
} 