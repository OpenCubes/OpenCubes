String.prototype.getParent = function() {
    return this.toString().substring(0, this.toString().lastIndexOf('/'));
};

Object.defineProperty(Array.prototype, "in", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(value, def) {
        return this.indexOf(value) !== -1 ? value : def;
    }
});
Object.defineProperty(Array.prototype, "findIn", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(obj) {
        var index = -1; // not found initially
        var keys = Object.keys(obj);
        // filter the collection with the given criterias
        var arr = this;

        var result = arr.filter(function(doc, idx) {
            // keep a counter of matched key/value pairs
            var matched = 0;

            // loop over criteria
            for (var i = keys.length - 1; i >= 0; i--) {
                if (doc[keys[i]] === obj[keys[i]]) {
                    matched++;

                    // check if all the criterias are matched
                    if (matched === keys.length) {
                        index = idx;
                        return arr[idx];
                    }
                }
            }
        });
        return index === -1 ? undefined : arr[index];
    }
});