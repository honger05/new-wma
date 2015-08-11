(function($, bars) {

	/**
	 * demo: {{#equal 10 10}} ... {{else}} ... {{/equal}}
	 */
	bars.registerHelper('equal', function(v1, v2, options) {
		if (v1 == v2) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	})
	
	/**
	 * demo: {{transform 0}}
	 */
	bars.registerHelper('transform', function(v1) {
		if (v1 == 0) {
			return '男';
		} else if (v1 == 1) {
			return '女'
		}
	})
	
})(mui, Handlebars);
