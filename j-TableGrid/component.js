COMPONENT('tablegrid', 'count:3', function(self, config, cls) {

	var empty = '';
	var display;

	self.readonly();

	self.make = function() {
		self.aclass(cls);

		var templates = self.find('scri' + 'pt');
		for (var i = 0; i < templates.length; i++) {
			var html = templates[i].innerHTML;
			if (i)
				empty = html;
			else
				self.template = Tangular.compile(html);
		}

		self.on('resize + resize2', self.resize);
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 300);
	};

	self.resizeforce = function() {
		var tmp = config.parent ? WIDTH(self.parent(config.parent)) : WIDTH();
		if (tmp !== display)
			self.refresh();
	};

	self.setter = function(value) {

		if (!value) {
			self.empty();
			return;
		}

		display = config.parent ? WIDTH(self.parent(config.parent)) : WIDTH();

		var rows = [];
		var count = config['count' + display] || config.count;
		var cols = [];
		var items = value.slice(0);
		var width = (100 / count).floor(2);

		while (items.length % count)
			items.push(null);

		for (var i = 0; i < items.length; i++) {

			var row = i % count;
			var item = items[i];
			var c = [cls + '-item'];

			if (!cols.length)
				c.push(cls + '-first');

			if (item == null)
				c.push(cls + '-empty');

			if (rows.length)
				c.push(cls + '-bt');

			if (cols.length)
				c.push(cls + '-bl');

			if (row === count - 1)
				c.push(cls + '-last');

			cols.push('<div class="{0}" style="width:{1}%">{2}</div>'.format(c.join(' '), width, item == null ? empty : self.template({ value: item })));

			if (row === count - 1) {
				rows.push('<div class="{0}-row">{1}</div><div class="clearfix"></div>'.format(cls, cols.join('')));
				cols.length = 0;
			}

		}

		if (cols.length)
			rows.push('<div class="{0}-row">{1}</div><div class="clearfix"></div>'.format(cls, cols.join('')));

		var html = rows.join('');
		self.html(html);
		html.COMPILABLE() && COMPILE();
	};

});