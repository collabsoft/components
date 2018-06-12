COMPONENT('clipboardimage', 'quality:90;maxwidth:1024;maxheight:768', function(self, config) {

	var ctx, img, canvas = null;

	self.singleton();
	self.readonly();
	self.blind();

	self.make = function() {
		self.aclass('hidden');
		self.append('<canvas></canvas><img src="data:image/png;base64,R0lGODdhAQABAIAAAHnrWAAAACH5BAEAAAEALAAAAAABAAEAAAICTAEAOw==" />');
		canvas = self.find('canvas')[0];
		ctx = canvas.getContext('2d');
		img = self.find('img')[0];

		$(window).on('paste', function(e) {

			if (config.disabled)
				return;

			var item = e.originalEvent.clipboardData.items[0];
			if (item.kind !== 'file' || item.type.substring(0, 5) !== 'image')
				return;
			var blob = item.getAsFile();
			var reader = new FileReader();
			reader.onload = function(e) {
				img.onload = function() {
					self.resize();
				};
				img.src = e.target.result;
			};
			reader.readAsDataURL(blob);
		});
	};

	self.resize = function() {
		var dpr = window.devicePixelRatio;

		if (dpr > 1) {
			canvas.width = img.width / dpr;
			canvas.height = img.height / dpr;
		} else {
			canvas.width = img.width;
			canvas.height = img.height;
		}

		if (canvas.width > config.maxwidth) {
			canvas.width = config.maxwidth;
			canvas.height = (config.maxwidth / (img.width / img.height)) >> 0;
		} else if (canvas.height > config.maxheight) {
			canvas.height = config.maxheight;
			canvas.width = (config.maxheight / (img.width / img.height)) >> 0;
		}

		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		var data = canvas.toDataURL('image/jpeg', config.quality * 0.01);
		config.exec && EXEC(config.exec, data);
		EMIT('clipboardimage', data);
	};
});