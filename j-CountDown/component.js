COMPONENT('countdown', function(self, config, cls) {

	var interval = null;
	var template;
	var container;
	var text;
	var is = false;

	self.readonly();

	self.make = function() {

		self.aclass(cls);

		var scr = self.find('> scr' + 'ipt');
		if (scr.length) {
			template = scr.html();
			scr.remove();
		} else
			template = config.text || '{0}';

		text = document.createElement('DIV');
		container = document.createElement('DIV');

		while (self.dom.children.length)
			container.appendChild(self.dom.children[0]);

		self.dom.appendChild(text);
		self.dom.appendChild(container);
		text = $(text);
		container = $(container);
		container.aclass('hidden');

		self.rclass('hidden invisible');
	};

	self.setter = function(value) {
		if (value instanceof Date && (value > NOW))
			self.recalculate(value.getTime());
		else {
			clearInterval(interval);
			interval = null;
			text.aclass('hidden');
			container.rclass('hidden');
			is = false;
		}
	};

	self.destroy = function() {
		interval && clearInterval(interval);
		interval = null;
	};

	self.recalculate = function(expiredate) {
		interval && clearInterval(interval);
		interval = setInterval(function () {

			var now = Date.now();
			var timeleft = expiredate - now;

			if (timeleft < 0) {
				clearInterval(interval);
				interval = null;
				container.rclass('hidden');
				text.aclass('hidden');
				is = false;
				return;
			}

			var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

			text.html(template.format(minutes.padLeft(2) + ':' + seconds.padLeft(2)));

			if (!is) {
				text.rclass('hidden');
				container.aclass('hidden');
				is = true;
			}

		}, 1000);
	};

});