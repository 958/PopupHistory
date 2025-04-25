import { Options } from './options.js';

/**
 * Initialize options page
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        const options = Options.load();
        
        // Set up checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(elm => {
            elm.checked = options[elm.id];
            elm.addEventListener('change', (e) => {
                options[e.target.id] = e.target.checked;
                Options.save(options);
            });
        });
        
        // Set up range sliders
        document.querySelectorAll('input[type="range"]').forEach(elm => {
            elm.value = options[elm.id];
            const output = document.getElementById(elm.id + '_val');
            output.textContent = elm.value;
            
            elm.addEventListener('change', (e) => {
                options[e.target.id] = parseInt(e.target.value, 10);
                output.textContent = e.target.value;
                Options.save(options);
            });
        });
        
        // Set up sort options
        document.querySelectorAll('input[name="Sort"]').forEach(elm => {
            const sort = elm.id.split('_');
            if (options.Sort === sort[1] && options.Order === sort[2]) {
                elm.checked = true;
            }
            
            elm.addEventListener('change', (e) => {
                const sort = e.target.id.split('_');
                options.Sort = sort[1];
                options.Order = sort[2];
                Options.save(options);
            });
        });

        // Set up non-display URLs
        setupNonDisplayURL(options);
    } catch (error) {
        console.error('Failed to initialize options page:', error);
    }
});

/**
 * Set up non-display URLs
 * @param {Object} options - Options object
 */
function setupNonDisplayURL(options) {
    const list = document.getElementById('NonDisplayURL');
    const text = document.getElementById('NonDisplayURL_text');
    
    // Function to add URL
    const addNonDisplayURL = (item, index) => {
        const li = document.createElement('li');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'url';
        input.value = item;
        input.addEventListener('input', (e) => {
            options.NonDisplayURL[index] = input.value;
            Options.save(options);
        });
        li.appendChild(input);
        
        const del = document.createElement('button');
        del.textContent = 'Del';
        del.addEventListener('click', (e) => {
            li.parentNode.removeChild(li);
            options.NonDisplayURL = options.NonDisplayURL.filter((item, i) => i !== index);
            Options.save(options);
        });
        li.appendChild(del);
        
        list.appendChild(li);
    };
    
    // Add button event listener
    document.getElementById('NonDisplayURL_add').addEventListener('click', () => {
        const url = text.value;
        if (url) {
            addNonDisplayURL(url, options.NonDisplayURL.length);
            options.NonDisplayURL.push(url);
            Options.save(options);
            text.value = '';
        }
    });
    
    // Display existing URLs
    options.NonDisplayURL.forEach(addNonDisplayURL);
} 