var Options = {
    _default_options: {
        SearchAllHistory: true,
        ItemCount: 100,
        NonDisplayURL: ['^chrome-extension://'],
        Sort: 'Date',
        Order: 'DESC'
    },
    load: function() {
        var options = Options._default_options;
        if (localStorage.options) {
            options = JSON.parse(localStorage.options);
        }
        if (!options.NonDisplayURL) {
            options.NonDisplayURL = Options._default_options.NonDisplayURL;
        }
        if (!options.Sort) {
            options.Sort = Options._default_options.Sort;
        }
        if (!options.Order) {
            options.Order = Options._default_options.Order;
        }
        return options;
    },
    save: function(options) {
        localStorage.options = JSON.stringify(options);
    }
};
