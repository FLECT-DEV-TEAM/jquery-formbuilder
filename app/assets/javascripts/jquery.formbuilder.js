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
		rules = {},
		idPrefix = options.idPrefix || "";
	$form.prepend($ul);
	
	function warn(msg) {
		console.log("warn: " + msg);
	}
	function error(msg) {
		console.log("error: " + msg);
	}
	function getId(type, key) {
		if (idPrefix) {
			return idPrefix + "-" + type + "-" + key;
		} else {
			return type + "-" + key;
		}
	}
	function valueKind(key) {
		switch (key) {
			case "type" :
			case "label":
			case "values":
			case "rules":
			case "attrs":
			case "selected":
			case "checked":
				return "top";
			case "required":
			case "remote":
			case "minlength":
			case "maxlength":
			case "rangelength":
			case "min":
			case "max":
			case "range":
			case "email":
			case "url":
			case "date":
			case "dateISO":
			case "number":
			case "digits":
			case "creditcard":
			case "accept":
			case "equalTo":
				return "rules";
			case "class":
			case "value":
			case "size":
			case "multiple":
			case "disabled":
			case "rows":
			case "cols":
			case "autocomplete":
			case "list":
			case "placeholder":
				return "attrs";
			default:
				return "top";
		}
	}
	function errorPlacement(label, element) {
		var type = element.attr("type");
		if (type == "checkbox" || type == "radio") {
			label.insertAfter(element.parent().get(0));
		} else {
			label.insertAfter(element);
		}
	}
	function normalizeItem(key, values) {
		if (!values.label) {
			values.label = key;
		}
		if (!values.type) {
			values.type = "text";
		}
		if (!values.rules) {
			values.rules = {};
		}
		if (!values.attrs) {
			values.attrs = {};
		}
		for (var prop in values) {
			var kind = valueKind(prop);
			if (kind != "top") {
				values[kind][prop] = values[prop];
				delete values[prop];
			}
		}
		normalizeRules(key, values.rules);
	}
	function normalizeRules(key, rules) {
		if (rules.equalTo) {
			var value = rules.equalTo;
			if (value.length > 0 && value.charAt(0) == "#") {
				value = value.substring(1);
			}
			rules.equalTo = "#" + getId("input", value)
		}
	}
	function normalizeOptions(options) {
		var ret = [];
		for (var i=0; i<options.length; i++) {
			var op = options[i],
				text = null,
				value = null;
			
			if (typeof(op) == "object") {
				if ($.isArray(op)) {
					value = op[0];
					if (op.length > 1) {
						text = op[1];
					} else {
						text = value;
					}
				} else {
					value = op.value;
					text = op.text || value;
				}
			} else {
				op = "" + op;
				var idx = op.indexOf(":");
				if (idx == -1) {
				} else {
					value = op.substring(0, idx);
					text = op.substring(idx+1);
				}
			}
			ret.push({
				value: value,
				text: text
			});
		}
		return ret;
	}
	function setSelected($el, values, attr) {
		var array = ("" + values).split(",");
		$el.each(function() {
			var value = $(this).attr("value");
			for (var i=0; i<array.length; i++) {
				if (value == array[i]) {
					$(this).attr(attr, attr);
					break;
				}
			}
		});
	}
	function buildSelect($select, options) {
		options = normalizeOptions(options);
		for (var i=0; i<options.length; i++) {
			var op = options[i],
				$op = $("<option/>");
			$op.attr("value", op.value);
			$op.text(op.text);
			$select.append($op);
		}
	}
	function buildCheckboxOrRadio(key, type, options) {
		options = normalizeOptions(options);
		var $span = $("<span/>");
		for (var i=0; i<options.length; i++) {
			var op = options[i],
				$input = $("<input/>");
			$input.attr({
				name: key,
				id: getId("input", key) + "-" + op.value,
				type : type,
				value : op.value
			});
			$span.append($input);
			if (op.text) {
				var $label = $("<label/>");
				$label.text(op.text);
				$span.append($label);
			}
		}
		return $span;
	}
	function setAttrs($input, attrs) {
		for (var prop in attrs) {
			var value = attrs[prop];
			if (prop == "class") {
				$input.addClass(value);
			} else if (prop == "value") {
				$input.val(value);
			} else {
				$input.attr(prop, value);
			}
		}
	}
	function buildForm(key, values) {
		if (typeof(values) === "string") {
			values = {
				type : values
			}
		}
		normalizeItem(key, values);
		var type = values.type,
			$input = null,
			$target = null;
		
		switch (type) {
			case "text":
			case "password":
			case "hidden":
			case "file":
				$input = $("<input/>");
				$input.attr({
					name: key,
					id: getId("input", key),
					type: type
				})
				setAttrs($input, values.attrs);
				break;
			case "date":
				$input = $("<input/>");
				$input.attr({
					name: key,
					id: getId("input", key),
					type: "text"
				})
				setAttrs($input, values.attrs);
				var dateFormat = options.dateFormat || defaults.dateFormat;
				$input.datepicker({
					dateFormat: dateFormat
				});
				values.rules.date = true;
				break;
			case "checkbox":
			case "radio":
				if (!values.values) {
					values.values = ["true:"];
				}
				$target = buildCheckboxOrRadio(key, type, values.values);
				$input = $target.find("input");
				setAttrs($input, values.attrs);
				if (values.checked) {
					setSelected($input, values.checked, "checked");
				}
				break;
			case "select":
				$input = $("<select/>");
				$input.attr({
					name: key,
					id: getId("input", key)
				});
				buildSelect($input, values.values);
				setAttrs($input, values.attrs);
				if (values.selected) {
					setSelected($input.find("option"), values.selected, "selected");
				} else {
					$input.find("option:first").attr("selected", "selected");
				}
				break;
			case "textarea":
				$input = $("<textarea/>");
				$input.attr({
					name: key,
					id: getId("input", key)
				})
				setAttrs($input, values.attrs);
				break;
			default:
				error("unknown type: " + key + ", " + type);
				break;
		}
		if ($input) {
			var $li = null,
				$label = $("<label/>");
			if (values.follow) {
				$li = $form.find("li:last");
				$label.addClass("form-label-follow");
			} else {
				$li = $("<li/>");
				$ul.append($li);
				$label.addClass("form-label");
			}
			if (options.labelWidth) {
				$label.css("width", options.labelWidth);
			}
			if (resources && resources[values.label]) {
				$label.html(resources[values.label]);
			} else {
				$label.html(values.label);
			}
			if (type != "hidden") {
				$li.append($label);
			}
			$li.append($target ? $target : $input);
			if (values.rules) {
				rules[key] = values.rules;
			}
		}
	}
	if (options.items) {
		$.each(options.items, buildForm);
	}
	if ($.fn.validate && rules) {
		var validateOptions = $.extend(true, {}, options.validateOptions);
		validateOptions.rules = rules;
		if (!validateOptions.errorPlacement) {
			validateOptions.errorPlacement = errorPlacement;
		}
		$form.validate(validateOptions);
	}
}
})(jQuery);
