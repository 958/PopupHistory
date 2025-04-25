/**
 * Function to escape HTML characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
}

/**
 * Function to remove duplicates from an array
 * @param {Array} array - Array to remove duplicates from
 * @returns {Array} Array with duplicates removed
 */
export function unique(array) {
    const temp = {};
    for (let i = 0; i < array.length; i++) {
        const key = array[i].url.replace(/#.+$/, '');
        if (!temp[key]) temp[key] = array[i];
    }
    const ret = [];
    for (const i in temp) {
        ret.push(temp[i]);
    }
    return ret;
} 