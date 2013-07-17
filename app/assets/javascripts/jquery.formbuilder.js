(function($) {
"use strict";

var defaults = {
	dateFormat: "yy-mm-dd"
};
/*
options - Settings for formbuilder.
  dateFormat - Format for date type field.
  labelWidth - Width for field label
  validateOptions - Options for jquery.validate
resources - Localized messages for labels and messages.
*/
$.fn.formbuilder = function(options, resources) {
	var $form = $(this),
		$ul = $("<ul class='formbuilder-form'></ul>"),
		rules = {};
	$form.prepend($ul);
	
	function buildForm(key, values) {
		if (typeof(values) === "string") {
			values = {
				type : values
			}
		}
		if (!values.rules) {
			values.rules = {};
			for (var prop in values) {
				switch (prop) {
					case "type":
					case "label":
					case "rules":
						break;
					default:
						values.rules[prop] = values[prop];
						delete values[prop];
				}
			}
		}
		var type = values.type || "text",
			$input = null;
		
		switch (type) {
			case "text":
				$input = $("<input/>");
				$input.attr("type", type);
				break;
			case "date":
				$input = $("<input/>");
				$input.attr("type", "text");
				var dateFormat = options.dateFormat || defaults.dateFormat;
				$input.datepicker({
					dateFormat: dateFormat
				});
				values.rules.date = true;
				break;
			case "checkbox":
				$input = $("<input/>");
				$input.attr({
					type : "checkbox",
					value : values.value || "true"
				});
				break;
			default:
				console.log("unknown type: " + type);
				break;
		}
		if ($input) {
			$input.attr("name", key);
			
			var $li = $("<li/>"),
				$label = $("<label class='form-label'/>");
			if (options.labelWidth) {
				$label.css("width", options.labelWidth);
			}
			if (values.label) {
				$label.text(values.label);
			} else if (resources && resources[key]) {
				$label.text(resources[key]);
			} else {
				$label.text(key);
			}
			$li.append($label).append($input);
			$ul.append($li);
			if (values.rules) {
				rules[key] = values.rules;
			}
		}
	}
	if (options.items) {
		$.each(options.items, buildForm);
	}
	if (rules) {
		var validateOptions = $.extend(true, {}, options.validateOptions);
		validateOptions.rules = rules;
		$form.validate(validateOptions);
	}
}
})(jQuery);
