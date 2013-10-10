if (typeof(flect) === "undefined") flect = {};
if (typeof(flect.util) === "undefined") flect.util = {};

(function($) {
	"use strict";
	
	flect.util.Bootstrap3Form = function($form, options) {
		var self = this;
		$form = $(form);
		
		//Default values
		this.horizontal = false,
		this.idPrefix = "",
		this.labelSize = 3;
		
		if (options) {
			$.extend(this, options);
		}
		
		var controls = [];
		
		function addInput(name, type, label, options) {
			var obj = {
				"name" : name,
				"type" : type,
				"label" : label,
				"options" : options
			};
			controls.push(obj);
			generate();
		}
		function addSelect(name, type, label) {
			var obj = {
				"name" : name,
				"type" : type,
				"label" : label
			};
			controls.push(obj);
			generate();
		}
		function addCheckbox(name, type, label) {
			var obj = {
				"name" : name,
				"type" : type,
				"label" : label
			};
			controls.push(obj);
			generate();
		}
		function addRadio(name, type, label) {
			var obj = {
				"name" : name,
				"type" : type,
				"label" : label
			};
			controls.push(obj);
			generate();
		}
		function addTextarea(name, type, label) {
			var obj = {
				"name" : name,
				"type" : type,
				"label" : label
			};
			controls.push(obj);
			generate();
		}
		
		function generate() {
			$form.empty();
			$form.addClass("form-horizontal");
			$.each(controls, function(index, obj) {
				var options = obj.options || {},
					$div = $("<div/>"),
					$label = $("<label/>");
				
				$label.html(obj.label);
				if (self.horizontal) {
					$label.addClass("col-sm-" + self.labelSize);
					$label.addClass("control-label");
				} else {
					$label.addClass("col-sm-12");
				}
				if (obj.type == "checkbox" || obj.type == "radio") {
				} else {
					$div.addClass("form-group");
					
					var $input = $("<input/>");
					$input.attr({
						"type" : obj.type,
						"id" : self.idPrefix + obj.name,
						"name" : obj.name
					});
					$input.addClass("form-control");
					if (options.placeHolder) {
						$input.attr("placeholder", options.placeHolder);
					}
					$label.attr("for", self.idPrefix + obj.name);
					$div.append($label);
					
					var $inputDiv = $("<div/>");
					$inputDiv.addClass("col-sm-" + (options.size || (self.horizontal ? 12 - self.labelSize : 12)));
					$inputDiv.append($input);
					$div.append($inputDiv);
				}
				$form.append($div);
			});
		}
		$.extend(this, {
			"addInput" : addInput,
			"addSelect" : addSelect,
			"addCheckbox" : addCheckbox,
			"addRadio" : addRadio,
			"addTextarea" : addTextarea
		});
	}
})(jQuery);
