var parse = require('../lib/parser');
var format = function(str) {
    return str.replace(/(\r\n|\n|\r)/g, "");
}

describe("parser", function() {
    it("should be able to highlight code for Prism", function(done) {
        // javascript langs
        expect(format(parse('```js\nhello();```'))).toEqual('<pre><code class="language-js">hello();</code></pre>');
        done();
    });
    describe('labels:', function() {
        it('should generate HTML for a label with no modifier class', function() {
            var actual = parse('||This is a label!||');
            expect(format(actual)).toEqual('<p><span class="label">This is a label!</span></p>');
        });
        it('should generate HTML for a label with the "label-warning" modifier class', function() {
            var actual = parse('||This is a label!|warning||');
            expect(format(actual)).toEqual('<p><span class="label label-warning">This is a label!</span></p>');
        });
        it('should generate HTML for a label with the "label-success" modifier class', function() {
            var actual = parse('||This is a label!|success||');
            expect(format(actual)).toEqual('<p><span class="label label-success">This is a label!</span></p>');
        });
    });
});
