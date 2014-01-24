var mongoose = require('mongoose'),
	Mod = mongoose.model('Mod');

exports.load = function(req, res, next, id) {

	Mod.load(id, function(err, mod) {
		if (err) return next(err);
		if (!article) return next(new Error('not found'));
		req.mod = mod;
		next();
	});
};
exports.index = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };

  Mod.list(options, function(err, articles) {
    if (err) return res.render('500');
    Article.count().exec(function (err, count) {
      res.render('articles/index', {
        title: 'Articles',
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};