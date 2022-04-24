COMPONENT('xterm', 'cols:80;rows:24', function(self, config, cls) {

	self.readonly();

	var fakews = {};
	var fakedata = {};
	var container;
	var term;

	fakews.handlers = {};
	fakews.readyState = 1;

	self.destroy = function() {
		term.destroy();
		term = null;
	};

	self.make = function() {

		self.aclass(cls);
		container = document.createElement('div');
		self.dom.appendChild(container);

		term = new Terminal({ cols: config.cols, rows: config.rows });
		term.open(container);

		fakews.send = function(data) {
			config.send && self.SEEX(config.send, data);
		};

		fakews.removeEventListener = function(type) {
			delete fakews.handlers[type];
		};

		fakews.addEventListener = function(type, handler) {
			fakews.handlers[type] = handler;
		};

		new attach.attach(term, fakews);
	};

	self.write = function(data) {
		fakedata.data = data;
		fakews.handlers.message(fakedata);
	};

}, ['https://cdn.componentator.com/xterm.min@314.css', 'https://cdn.componentator.com/xterm.min@314.js']);