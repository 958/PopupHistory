import { Options } from './options.js';
import { EntryManager } from './entry_manager.js';

/**
 * Set up event listeners
 * @param {EntryManager} em - Entry manager
 * @param {Object} options - Options
 * @param {RegExp} nonDisplayURL - Non display URL
 */
function setupEventListeners(em, options, nonDisplayURL) {
    // Title click event
    document.getElementById('title').addEventListener('click', (e) => {
        const button = e.button;
        setTimeout(() => {
            chrome.tabs.create({
                url: 'chrome://history/',
                active: (button !== 1)
            });
        }, 0);
    });

    // Search event
    let prevQuery = '';
    const queryElm = document.getElementById('query');
    
    queryElm.addEventListener('search', (e) => {
        const query = queryElm.value.trim();
        if (prevQuery !== query) {
            prevQuery = query;
            if (options.SearchAllHistory) {
                em.init(query, options.ItemCount, nonDisplayURL, options.Sort, options.Order);
            } else {
                em.filter(query);
            }
        }
    });

    // Keyboard event
    queryElm.addEventListener('keydown', (e) => {
        let noDefault = false;
        
        switch (e.key) {
            case 'ArrowDown':
                em.select(+1);
                noDefault = true;
                break;
            case 'n':
                if (e.ctrlKey) {
                    em.select(+1);
                    noDefault = true;
                }
                break;
            case 'ArrowUp':
                em.select(-1);
                noDefault = true;
                break;
            case 'p':
                if (e.ctrlKey) {
                    em.select(-1);
                    noDefault = true;
                }
                break;
            case 'Delete':  // Delete
                if (e.shiftKey) {
                    em.removeCurrent();
                    noDefault = true;
                }
                break;
            case 'Enter':
                em.openCurrent(e.shiftKey);
                noDefault = true;
                break;
            case 'Escape':
                window.close();
                break;
        }
        
        if (noDefault) {
            e.preventDefault();
        }
    });
}

// Initialize on DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    try {
        const options = Options.load();
        const nonDisplayURL = new RegExp(options.NonDisplayURL.join('|'), 'i');
        const em = new EntryManager('entries', options.ItemCount, nonDisplayURL, options.Sort, options.Order);
        
        setupEventListeners(em, options, nonDisplayURL);
    } catch (error) {
        console.error('Failed to initialize popup:', error);
    }
}); 