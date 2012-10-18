var options = Options.load();

window.addEventListener('load', function(e){
    Array.prototype.slice.call(document.querySelectorAll('input[type="checkbox"]')).forEach(function(elm) {
        elm.checked = options[elm.id];
        elm.addEventListener('click', function(e){
            options[e.target.id] = e.target.checked;
            Options.save(options);
        }, false);
    });
    Array.prototype.slice.call(document.querySelectorAll('input[type="range"]')).forEach(function(elm) {
        elm.value = options[elm.id];
        var output = document.getElementById(elm.id + '_val');
        output.textContent = elm.value;
        elm.addEventListener('change', function(e){
            options[e.target.id] = parseInt(e.target.value, 10);
            output.textContent = e.target.value;
            Options.save(options);
        }, false);
    });
    Array.prototype.slice.call(document.querySelectorAll('input[name="Sort"]')).forEach(function(elm) {
        var sort = elm.id.split('_');
        if (options.Sort == sort[1] && options.Order == sort[2]) {
            elm.checked = true;
        }
        elm.addEventListener('click', function(e){
            var sort = e.target.id.split('_');
            options.Sort = sort[1];
            options.Order = sort[2];
            Options.save(options);
        }, false);
    });

    // Non-display URL
    var AddNonDisplayURL = function(item, index) {
        var li = document.createElement('li');
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'url';
        input.value = item;
        input.addEventListener('input',function(e){
            options.NonDisplayURL[index] = input.value;
            Options.save(options);
        }, false);
        li.appendChild(input);
        var del = document.createElement('button');
        del.textContent = 'Del';
        del.addEventListener('click',function(e){
            li.parentNode.removeChild(li);
            options.NonDisplayURL = options.NonDisplayURL.filter(function(item, i){
                return (i != index);
            });
            Options.save(options);
        }, false);
        li.appendChild(del);
        list.appendChild(li);
    };

    var list = document.getElementById('NonDisplayURL');
    var text = document.getElementById('NonDisplayURL_text');
    document.getElementById('NonDisplayURL_add').addEventListener('click', function(e) {
        var url = document.getElementById('NonDisplayURL_text').value;
        if (url) {
            AddNonDisplayURL(text.value, options.NonDisplayURL.length);
            options.NonDisplayURL.push(url);
            Options.save(options);
            text.value = '';
        }
    }, false);
    options.NonDisplayURL.forEach(AddNonDisplayURL);

}, false);

