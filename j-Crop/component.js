COMPONENT('crop', 'dragdrop:true;format:{0}', function(self, config) {

	var canvas, context;
	var img = new Image();
	var can = false;
	var is = false;
	var zoom = 100;
	var current = { x: 0, y: 0 };
	var offset = { x: 0, y: 0 };
	var cache = { x: 0, y: 0, zoom: 0 };
	var width = 0;

	self.bindvisible();
	self.noValid();
	self.getter = null;

	img.onload = function () {
		can = true;
		zoom = 100;

		var width = config.width;
		var height = config.height;

		var nw = (img.width / 2);
		var nh = (img.height / 2);

		if (img.width > width) {
			var p = (width / (img.width / 100));
			zoom -= zoom - p;
			nh = ((img.height * (p / 100)) / 2);
			nw = ((img.width * (p / 100)) / 2);
		}

		// centering
		cache.x = current.x = (width / 2) - nw;
		cache.y = current.y = (height / 2) - nh;
		cache.zoom = zoom;
		self.redraw();
	};

	self.configure = function(key, value, init) {
		if (init)
			return;
		switch (key) {
			case 'width':
			case 'height':
				cache.x = current.x = cache.y = current.y = 0;
				setTimeout2(self._id + 'resize', self.redraw, 50);
				break;
		}
	};

	self.output = function(type) {
		var canvas2 = document.createElement('canvas');
		var ctx2 = canvas2.getContext('2d');

		canvas2.width = config.width;
		canvas2.height = config.height;

		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

		if (config.background) {
			ctx2.fillStyle = config.background;
			ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
		}

		var w = img.width;
		var h = img.height;

		w = ((w / 100) * zoom);
		h = ((h / 100) * zoom);

		ctx2.drawImage(img, current.x || 0, current.y || 0, w, h);
		return type ? canvas2.toDataURL(type) : !config.background && self.isTransparent(canvas2) ? canvas2.toDataURL('image/png') : canvas2.toDataURL('image/jpeg');
	};

	self.make = function() {

		self.aclass('ui-crop');
		self.append('<input type="file" style="display:none" accept="image/*" /><ul><li data-type="upload"><span class="fa fa-folder"></span></li><li data-type="plus"><span class="fa fa-plus"></span></li><li data-type="refresh"><span class="fa fa-refresh"></span></li><li data-type="minus"><span class="fa fa-minus"></span></li></ul><canvas></canvas>');

		canvas = self.find('canvas')[0];
		context = canvas.getContext('2d');

		self.event('click', 'li', function(e) {

			e.preventDefault();
			e.stopPropagation();

			var type = $(this).attr('data-type');

			switch (type) {
				case 'upload':
					self.find('input').trigger('click');
					break;
				case 'plus':
					zoom += 3;
					if (zoom > 300)
						zoom = 300;
					current.x -= 3;
					current.y -= 3;
					self.redraw();
					break;
				case 'minus':
					zoom -= 3;
					if (zoom < 3)
						zoom = 3;
					current.x += 3;
					current.y += 3;
					self.redraw();
					break;
				case 'refresh':
					zoom = cache.zoom;
					self.redraw();
					break;
			}

		});

		self.find('input').on('change', function() {

			var file = this.files[0];
			var reader = new FileReader();

			reader.onload = function () {
				img.src = reader.result;
				setTimeout(function() {
					self.change(true);
				}, 500);
			};

			reader.readAsDataURL(file);
			this.value = '';

		});

		$(canvas).on('mousedown', function (e) {

			if (self.disabled || !can)
				return;

			is = true;
			var rect = canvas.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;
			offset.x = x - current.x;
			offset.y = y - current.y;
		});

		config.dragdrop && $(canvas).on('dragenter dragover dragexit drop dragleave', function (e) {

			if (self.disabled)
				return;

			e.stopPropagation();
			e.preventDefault();

			switch (e.type) {
				case 'drop':
					self.rclass('ui-crop-dragdrop');
					break;
				case 'dragenter':
				case 'dragover':
					self.aclass('ui-crop-dragdrop');
					return;
				case 'dragexit':
				case 'dragleave':
				default:
					self.rclass('ui-crop-dragdrop');
					return;
			}

			var files = e.originalEvent.dataTransfer.files;
			self.load(files[0]);
		});

		self.load = function(file) {
			var reader = new FileReader();
			reader.onload = function () {
				img.src = reader.result;
				setTimeout(function() {
					self.change(true);
				}, 500);
			};
			reader.readAsDataURL(file);
		};

		self.event('mousemove mouseup', function (e) {

			if (e.type === 'mouseup') {
				is && self.change();
				is = false;
				return;
			}

			if (self.disabled || !can || !is)
				return;

			var rect = canvas.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;
			current.x = x - offset.x;
			current.y = y - offset.y;
			self.redraw();
		});
	};

	self.redraw = function() {

		var ratio = width < config.width ? width / config.width : 1;

		canvas.width = width < config.width ? width : config.width;
		canvas.height = width < config.width ? (config.height / config.width) * width : config.height;

		var w = img.width;
		var h = img.height;

		w = ((w / 100) * zoom);
		h = ((h / 100) * zoom);

		context.clearRect(0, 0, canvas.width, canvas.height);

		if (config.background) {
			context.fillStyle = config.background;
			context.fillRect(0, 0, canvas.width, canvas.height);
		}

		context.drawImage(img, (current.x || 0) * ratio, (current.y || 0) * ratio, w * ratio, h * ratio);
	};

	self.setter = function(value) {
		self.width(function(w) {
			width = w;
			if (value)
				img.src = config.format.format(value);
			else
				self.redraw();
		});
	};

	self.isTransparent = function(canvas) {
		var id = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
		for (var i = 0, length = id.data.length; i < length; i += 4) {
			if (id.data[i + 3] !== 255)
				return true;
		}
		return false;
	};
});