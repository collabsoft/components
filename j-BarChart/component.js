COMPONENT('barchart', 'pl:20;pt:10;pb:25;prselected:0;axisX:true;axisY:true;paddingbars:5;limit:0;paddinggroup:10;radius:2;offsetX:10;offsetY:10;templateY:{{ value | format(0) }};templateX:{{ value }};height:0', function(self, config) {

	var svg, g, axis, selected;
	var templateX, templateY;
	var W = $(window);

	self.readonly();
	self.make = function() {
		self.aclass('ui-barchart');
		self.empty().append('<svg></svg>');
		svg = self.find('svg');
		axis = svg.asvg('g').attr('class', 'axisy');
		g = svg.asvg('g').attr('class', 'bars');
		selected = svg.asvg('text').attr('class', 'selected').attr('text-anchor', 'end');
		W.on('resize', self.resize);

		self.event('click mouseenter', 'rect', function(e) {
			var rect = $(this);
			var index = rect.attrd('index');

			if (index === self.$selectedindex && e.type === 'mouseenter')
				return;

			self.$selectedindex = index;
			var arr = index.split(',');
			var item = self.get()[+arr[0]];
			var value = item.values[+arr[1]];
			selected.text(templateY({ value: value.y }));
			if (e.type === 'mouseenter') {
				setTimeout2(self.id, function() {
					selected.text('');
				}, 2000);
			} else
				clearTimeout2(self.id);
		});

	};

	self.destroy = function() {
		W.off('resize', self.resize);
	};

	self.resize = function() {
		setTimeout2('resize.' + self.id, function() {
			self.refresh();
		}, 500);
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'templateX':
				templateX = Tangular.compile(value);
				break;
			case 'templateY':
				templateY = Tangular.compile(value);
				break;
			default:
				!init && self.resize();
				break;
		}
	};

	self.released = function(is) {
		!is && setTimeout(self.refresh, 1000);
	};

	self.setter = function(value) {

		if (!self.element[0].offsetParent) {
			setTimeout(function() {
				self.refresh();
			}, 1000);
			return;
		}

		if (!value) {
			g.empty();
			return;
		}

		var maxX = 0;
		var maxY = 0;
		var labels = [];
		var paddingbars = config.paddingbars;
		var paddinggroup = config.paddinggroup;
		var len = value.length;
		var size = value[0].values.length;
		var width = config.width ? config.width : self.element.width();
		var height = config.height ? config.height : (width / 100) * 60;
		var barwidth = ((width - paddingbars - paddinggroup - config.pl) / (size * len));
		var lines = {};

		barwidth -= paddingbars + (paddinggroup / len);

		for (var i = 0; i < len; i++) {
			var item = value[i];
			labels.push(item.name);
			for (var j = 0, length = item.values.length; j < length; j++) {
				var val = item.values[j];
				maxX = Math.max(maxX, val.x);
				maxY = Math.max(maxY, val.y);
			}
		}

		if (config.limit)
			maxY = config.limit;

		svg.attr('width', width);
		svg.attr('height', height);

		selected.attr('transform', 'translate({0},30)'.format(width - config.prselected));

		g.empty();
		axis.empty();

		lines.height = height - config.pt - config.pb;

		var T = { value: null };

		for (var i = 5; i > 0; i--) {
			var val = i * 20;
			var y = (((lines.height / 100) * val) + config.pt);
			config.axisY && axis.asvg('line').attr('x1', 0).attr('x2', width).attr('y1', y).attr('y2', y).attr('class', 'axis');
			T.value = (maxY / 100) * (100 - val);
			axis.asvg('text').aclass('ylabel').attr('transform', 'translate({0},{1})'.format(config.offsetX, y - config.offsetY)).text(templateY(T));
		}

		var offsetX = config.pl + paddingbars + paddinggroup;
		var posX = 0;
		var offsetL = (len - 1) === 0 ? 0.5 : len - 1;
		var offsetY =  config.pb;

		for (var i = 0, length = size; i < length; i++) {

			for (var j = 0; j < len; j++) {

				var item = value[j];
				var val = item.values[i];
				var rect = g.asvg('rect');
				var y = ((val.y / maxY) * 100) >> 0;
				var x = posX + (barwidth * j);
				var h = lines.height.inc('{0}%'.format(y));

				x += offsetX + (paddingbars * j);
				T.value = val.y;
				rect.attr('x', x).attr('y', ((lines.height - h) + (offsetY / 2)) - 3).attr('width', barwidth).attr('height', h).attr('class', 'bar bar' + (j + 1)).attr('data-index', j + ',' + i);
				config.radius && rect.attr('rx', config.radius).attr('ry', config.radius);
			}

			T.value = val.x;
			var text = templateX(T);
			var ax = posX + offsetX + (barwidth * len) + (paddingbars * len) + 2;
			config.axisX && axis.asvg('line').attr('x1', ax).attr('x2', ax).attr('y1', 0).attr('y2', height - 25).attr('class', 'axis');
			g.asvg('text').aclass('xlabel').text(text).attr('text-anchor', 'middle').attr('transform', 'translate({0},{1})'.format(posX + offsetX + (barwidth * offsetL), height - 6));

			posX += (len * barwidth) + paddinggroup;
			offsetX += len * paddingbars;
		}
	};
});