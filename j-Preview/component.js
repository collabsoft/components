COMPONENT('preview', 'width:200;height:100;background:#FFFFFF;quality:90;customize:1;schema:{file\\:base64,name\\:filename}', function(self, config, cls) {

	var empty, img, canvas, name, content = null;

	self.readonly();
	self.nocompile && self.nocompile();

	self.configure = function(key, value, init) {

		if (init)
			return;

		var redraw = false;

		switch (key) {
			case 'width':
			case 'height':
			case 'background':
				setTimeout2(self.id + 'reinit', self.reinit, 50);
				break;
			case 'label':
			case 'icon':
				redraw = true;
				break;
		}

		redraw && setTimeout2(self.id + 'redraw', function() {
			self.redraw();
			self.refresh();
		}, 50);

	};

	self.reinit = function() {
		canvas = document.createElement('canvas');
		canvas.width = config.width;
		canvas.height = config.height;
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = config.background;
		ctx.fillRect(0, 0, config.width, config.height);
		empty = canvas.toDataURL('image/png');
		canvas = null;
	};

	var resizewidth = function(w, h, size) {
		return Math.ceil(w * (size / h));
	};

	var resizeheight = function(w, h, size) {
		return Math.ceil(h * (size / w));
	};

	self.reupload = function() {
		name = 'image.jpg';
		img && self.resizeforce(img[0]);
	};

	self.resizeforce = function(image) {

		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = config.width;
		canvas.height = config.height;
		ctx.fillStyle = config.background;
		ctx.fillRect(0, 0, config.width, config.height);

		var w = 0;
		var h = 0;
		var x = 0;
		var y = 0;
		var is = false;
		var diff = 0;
		var propw = 'naturalWidth';
		var proph = 'naturalHeight';

		if (config.customize) {

			if (config.percentage) {
				config.width = (image[propw] / 100) * config.percentage >> 0;
				config.height = (image[proph] / 100) * config.percentage >> 0;
				canvas.width = config.width;
				canvas.height = config.height;
				ctx.fillStyle = config.background;
				ctx.fillRect(0, 0, config.width, config.height);
				empty = canvas.toDataURL('image/png');
			}

			if (image[propw] > config.width || image[proph] > config.height) {
				if (image[propw] > image[proph]) {

					w = resizewidth(image[propw], image[proph], config.height);
					h = config.height;

					if (w < config.width) {
						w = config.width;
						h = resizeheight(image[propw], image[proph], config.width);
					}

					if (w > config.width) {
						diff = w - config.width;
						x -= (diff / 2) >> 0;
					}

					is = true;
				} else if (image[proph] > image[propw]) {

					w = config.width;
					h = resizeheight(image[propw], image[proph], config.width);

					if (h < config.height) {
						h = config.height;
						w = resizewidth(image[propw], image[proph], config.height);
					}

					if (h > config.height) {
						diff = h - config.height;
						y -= (diff / 2) >> 0;
					}

					is = true;
				}
			}
		}

		if (!is) {
			if (image[propw] < config.width && image[proph] < config.height) {
				w = image[propw];
				h = image[proph];
				x = (config.width / 2) - (image[propw] / 2);
				y = (config.height / 2) - (image[proph] / 2);
			} else if (image[propw] >= image[proph]) {
				w = config.width;
				h = image[proph] * (config.width / image[propw]);
				y = (config.height / 2) - (h / 2);
			} else {
				h = config.height;
				w = (image[propw] * (config.height / image[proph])) >> 0;
				x = (config.width / 2) - (w / 2);
			}
		}

		ctx.drawImage(image, x, y, w, h);
		var base64 = canvas.toDataURL('image/jpeg', config.quality * 0.01);
		img.attr('src', base64);
		self.upload(base64);
	};

	self.redraw = function() {
		var label = config.label || content;
		self.html((label ? ('<div class="' + cls + '-label">{0}{1}:</div>'.format(config.icon ? '<i class="{0}"></i>'.format(config.icon.indexOf(' ') === -1 ? ('ti ti-' + config.icon) : config.icon) : '', label)) : '') + '<input type="file" accept="image/*" class="hidden" /><img src="{0}" class="img-responsive" alt="" />'.format(empty, config.width, config.height));
		img = self.find('img');

		img[0].crossOrigin = 'anonymous';
		img[0].onerror = () => self.set('');

		img.on('click', function() {
			self.find('input').trigger('click');
		});
	};

	self.make = function() {

		content = self.html();
		self.aclass(cls);
		self.reinit();
		self.redraw();

		self.event('change', 'input', function() {
			var file = this.files[0];
			file && self.load(file);
			this.value = '';
		});

		self.event('dragenter dragover dragexit drop dragleave', function (e) {

			e.stopPropagation();
			e.preventDefault();

			switch (e.type) {
				case 'drop':
					break;
				default:
					return;
			}

			var dt = e.originalEvent.dataTransfer;
			if (dt && dt.files.length) {
				var file = e.originalEvent.dataTransfer.files[0];
				file && self.load(file);
			}
		});
	};

	// Source: https://stackoverflow.com/questions/35940290/how-to-convert-base64-string-to-javascript-file-object-like-as-from-file-input-f
	function dataURLtoFile(dataurl, filename) {
		var arr = dataurl.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];
		var bstr = atob(arr[arr.length - 1]);
		var n = bstr.length;
		var u8arr = new Uint8Array(n);
		while (n--)
			u8arr[n] = bstr.charCodeAt(n);
		return new File([u8arr], filename, {type:mime});
	}

	self.load = function(file) {

		name = file.name.replace(/\.(png|gif|jpeg|svg|webp)$/i, '.jpg');

		self.getOrientation(file, function(orient) {
			var reader = new FileReader();
			reader.onload = function () {
				var img = new Image();
				img.onload = function() {
					if (config.keeporiginal && img.width == config.width && img.height == config.height) {
						self.upload(reader.result, file.name);
					} else {
						self.resizeforce(img);
						self.change(true);
					}
				};

				img.crossOrigin = 'anonymous';
				if (orient < 2)
					img.src = reader.result;
				else
					self.resetOrientation(reader.result, orient, url => img.src = url);
			};
			reader.readAsDataURL(file);
		});
	};

	self.upload = function(base64, filename) {
		if (base64) {
			var url = config.url.env(true);
			if (config.output === 'file') {
				var file = dataURLtoFile(base64, filename || name);
				var data = new FormData();
				data.append('file', file);
				UPLOAD(url, data, ERROR(function(response) {
					self.change(true);
					self.set(config.map ? FN(config.map)(response) : response);
				}));
			} else {
				var data = (new Function('base64', 'filename', 'return ' + config.schema))(base64, filename || name);
				AJAX((url.indexOf(' ') === -1 ? 'POST ' : '') + url, data, ERROR(function(response) {
					self.change(true);
					self.set(config.map ? FN(config.map)(response) : response);
				}));
			}
		}
	};

	self.setter = function(value) {
		if (value && config.preview)
			value = FN(config.preview)(value);
		if (!value && config.empty)
			value = config.empty;
		img.attr('src', value ? value : empty);
	};

	// http://stackoverflow.com/a/32490603
	self.getOrientation = function(file, callback) {
		var reader = new FileReader();
		reader.onload = function(e) {
			var view = new DataView(e.target.result);
			if (view.getUint16(0, false) != 0xFFD8)
				return callback(-2);
			var length = view.byteLength;
			var offset = 2;
			while (offset < length) {
				var marker = view.getUint16(offset, false);
				offset += 2;
				if (marker == 0xFFE1) {
					if (view.getUint32(offset += 2, false) != 0x45786966)
						return callback(-1);
					var little = view.getUint16(offset += 6, false) == 0x4949;
					offset += view.getUint32(offset + 4, little);
					var tags = view.getUint16(offset, little);
					offset += 2;
					for (var i = 0; i < tags; i++)
						if (view.getUint16(offset + (i * 12), little) == 0x0112)
							return callback(view.getUint16(offset + (i * 12) + 8, little));
				} else if ((marker & 0xFF00) != 0xFF00)
					break;
				else
					offset += view.getUint16(offset, false);
			}
			return callback(-1);
		};
		reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
	};

	self.resetOrientation = function(src, srcOrientation, callback) {
		var img = new Image();
		img.onload = function() {
			var width = img.width;
			var height = img.height;
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			canvas.width = width;
			canvas.height = height;

			switch (srcOrientation) {
				case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
				case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
				case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
				case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
				case 6: ctx.transform(-1, 0, 0, 1, width, 0); break;
				case 7: ctx.transform(0, -1, -1, 0, height, width); break;
				case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
			}

			ctx.drawImage(img, 0, 0);

			if (srcOrientation === 6) {
				var canvas2 = document.createElement('canvas');
				canvas2.width = width;
				canvas2.height = height;
				var ctx2 = canvas2.getContext('2d');
				ctx2.scale(-1, 1);
				ctx2.drawImage(canvas, -width, 0);
				callback(canvas2.toDataURL());
			} else
				callback(canvas.toDataURL());
		};

		img.src = src;
	};
});