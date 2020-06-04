COMPONENT('enter', 'validate:1;trigger:button[name="submit"]', function(self, config) {
	self.readonly();
	self.make = function() {
		self.event('keydown', 'input', function(e) {
			if (e.which === 13 && (!config.validate || CAN(self.path))) {
				if (config.exec)
					EXEC(self.makepath(config.exec), self);
				else
					self.find(config.trigger).trigger('click');
			}
		});
	};
});