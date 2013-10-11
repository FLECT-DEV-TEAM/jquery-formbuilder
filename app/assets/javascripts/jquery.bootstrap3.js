(function($) {
	"use strict";
	
	function property(properties, name, value) {
		if (value === undefined) {
			return properties[name];
		} else {
			properties[name] = value;
			return self;
		}
	}
	
	function normalizeOption(op) {
		if (typeof(op) == "object") {
			if (!op.text) {
				op.text = op.value;
			}
			return op;
		} else {
			op = "" + op;
			var idx = op.indexOf(":"),
				text = null,
				value = null;
			if (idx == -1) {
				value = op;
				text = op;
			} else {
				value = op.substring(0, idx);
				text = op.substring(idx+1);
			}
			return {
				"value": value,
				"text": text
			};
		}
	}
	function normalizeOptions(options) {
		var ret = [];
		for (var i=0; i<options.length; i++) {
			var op = normalizeOption(options[i]);
			ret.push(op);
		}
		return ret;
	}
	
	
	var defaultProperties = {
		"size" : 0,
		"placeHolder" : null,
		"helpText" : null,
		"follow" : false,
		"labelSize" : 0
	};
	function BasicInput(name, type, label, options) {
		var self = this;
		function initProperties(hash) {
			self.properties = $.extend(true, {}, defaultProperties, self.properties, hash);
console.log(self.properties);
		}
		function doProperties(name, v) {
			return property(self.properties, name, v);
		}
		if (!options) {
			options = {};
		}
		options.name = name;
		options.type = type;
		options.label = label;
		initProperties(options);
		
		$.extend(this, {
			"name" : function(v) { return doProperties("name", v);},
			"type" : function(v) { return doProperties("type", v);},
			"label" : function(v) { return doProperties("label", v);},
			"size" : function(v) { return doProperties("size", v);},
			"placeHolder" : function(v) { return doProperties("placeHolder", v);},
			"helpText" : function(v) { return doProperties("helpText", v);},
			"follow" : function(v) { return doProperties("follow", v);},
			"labelSize" : function(v) { return doProperties("labelSize", v);},
			"initProperties" : initProperties,
			"doProperties" : doProperties
		});
	}
	function Select(name, label, values, options) {
		function build($select) {
			var $group = null;
			for (var i=0; i<values.length; i++) {
				var op = values[i],
					$op = $("<option/>");
				$op.attr("value", op.value);
				$op.text(op.text);
				if (op.selected) {
					$op.attr("selected", "selected");
				}
				if (op.disabled) {
					$op.attr("disabled", "disabled");
				}
				if (op.group) {
					if ($group == null || $group.attr("label") != op.group) {
						$group = $("<optGroup/>");
						$group.attr("label", op.group);
						$select.append($group);
					}
				}
				if ($group) {
					$group.append($op);
				} else {
					$select.append($op);
				}
			}
		}
		function addOption(value, text) {
			if (typeof(value) === "string" && text) {
				value = value + ":" + text;
			}
			values.push(normalizeOption(value));
		}
		if (values && !$.isArray(values)) {
			options = values;
			values = [];
		}
		this.initProperties(options);
		this.name(name);
		this.label(label);
		if (!values) {
			values = [];
		}
		values = normalizeOptions(values);
		$.extend(this, {
			"build" : build,
			"addOption" : addOption
		});
	}
	Select.prototype = new BasicInput(null, "select", null);
	
	function Textarea(name, label, rows, options) {
		var self = this;
		if (typeof(rows) === "object") {
			options = rows;
			rows = null;
		}
		if (!options) {
			options = {};
		}
		if (!options.rows) {
			options.rows = rows || 3;
		}
		this.initProperties(options);
		this.name(name);
		this.label(label);
		$.extend(this, {
			"rows" : function(v) { return self.doProperties("rows", v);}
		});
	}
	Textarea.prototype = new BasicInput(null, "textarea", null);
	
	function Checkbox(name, label, values, options) {
		var self = this;
		
		function build($div) {
			for (var i=0; i<values.length; i++) {
				var op = values[i],
					$label = $("<label/>"),
					$input = $("<input/>");
				if (self.inline()) {
					$label.addClass(self.type() + "-inline");
				}
				$input.attr({
					"name" : self.name(),
					"type" : self.type(),
					"value" : op.value
				});
				$label.append($input).append(op.text);
				$div.append($label);
			}
		}
		function addValue(value, text) {
			if (typeof(value) === "string" && text) {
				value = value + ":" + text;
			}
			values.push(normalizeOption(value));
		}
		if (values && !$.isArray(values)) {
			options = values;
			values = [];
		}
		if (!values) {
			values = [];
		}
		values = normalizeOptions(values);
		if (!options) {
			options = {};
		}
		if (typeof(options.inline) === "undefined") {
			options.inline = true;
		}
		this.initProperties(options);
		this.name(name);
		this.label(label);
		$.extend(this, {
			"build" : build,
			"inline" : function(v) { return self.doProperties("inline", v);},
			"addValue" : addValue
		});
	}
	Checkbox.prototype = new BasicInput(null, "checkbox", null);
	
	
	function Bootstrap3Form($form, options) {
		var self = this,
			generated = false,
			properties = {
				"horizontal" : false,
				"idPrefix" : "",
				"labelSize" : 3,
				"gridSize" : "sm"
			};
		$form = $(form);
		
		if (options) {
			$.extend(properties, options);
		}
		
		var controls = [];
		
		function col(n) {
			return "col-" + properties.gridSize + "-" + n;
		}
		function offset(n) {
			return "col-" + properties.gridSize + "-offset-" + n;
		}
		
		function addInput(name, type, label, options) {
			var obj = new BasicInput(name, type, label, options);
			controls.push(obj);
			return obj;
		}
		function addSelect(name, label, values, options) {
			var obj = new Select(name, label, values, options);
			controls.push(obj);
			return obj;
		}
		function addTextarea(name, label, rows, options) {
			var obj = new Textarea(name, label, rows, options);
			controls.push(obj);
			return obj;
		}
		function addCheckbox(name, label, values, options) {
			var obj = new Checkbox(name, label, values, options);
			controls.push(obj);
			return obj;
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
		function isFollowGroup(index) {
			if (!self.horizontal()) {
				return false;
			}
			var obj = controls[index];
			if (obj.follow()) {
				return true;
			}
			if (controls.length > index + 1 && controls[index+1].follow()) {
				return true;
			}
			return false;
		}
		function generate() {
			$form.empty();
			$form.addClass("form-horizontal");
			$.each(controls, function(index, obj) {
				var $div = $("<div/>"),
					$label = $("<label/>"),
					id = self.idPrefix() + obj.name(),
					labelSize = obj.labelSize() || self.labelSize(),
					$input = null;
				
				$label.html(obj.label());
				if (self.horizontal()) {
					$label.addClass(col(labelSize));
					$label.addClass("control-label");
				} else {
					$label.addClass(col(12));
				}
				if (self.horizontal() && obj.follow()) {
					$div = $form.find(".form-group:last");
				} else {
					$div.addClass("form-group");
					$form.append($div);
				}
				$div.append($label);
				
				if (obj.type() == "checkbox" || obj.type() == "radio") {
					var $childDiv = $("<div/>");
					if (!obj.inline()) {
						$childDiv.addClass(obj.type());
					}
					$childDiv.addClass(col(self.horizontal() ? 12 - labelSize : 12));
					$div.append($childDiv);
					obj.build($childDiv);
				} else {
					if (obj.type() == "textarea") {
						$input = $("<textarea/>");
						$input.attr("rows", obj.rows() || 3);
					} else if (obj.type() == "select") {
						$input = $("<select/>");
						obj.build($input);
					} else {
						$input = $("<input/>");
					}
					$input.attr({
						"type" : obj.type(),
						"id" : id,
						"name" : obj.name()
					});
					$input.addClass("form-control");
					if (obj.placeHolder()) {
						$input.attr("placeholder", obj.placeHolder());
					}
					$label.attr("for", id);
					
					var $inputDiv = $("<div/>");
					$inputDiv.addClass(col(obj.size() || (self.horizontal() ? 12 - labelSize : 12)));
					$inputDiv.append($input);
					$div.append($inputDiv);
					
					if (obj.helpText()) {
						var helpBlock = $("<span/>");
						helpBlock.addClass("help-block");
						helpBlock.html(obj.helpText());
						if (self.horizontal()) {
							if (isFollowGroup(index)) {
								$inputDiv.append(helpBlock);
							} else {
								helpBlock.addClass(col(12 - labelSize));
								helpBlock.addClass(offset(labelSize));
								$div.append(helpBlock);
							}
						} else {
							if (obj.size()) {
								var dummy = $("<div/>");
								dummy.addClass(col(12 - obj.size()));
								dummy.addClass("dummy");
								dummy.height($inputDiv.outerHeight());
								$div.append(dummy);
							}
							helpBlock.addClass(col(12));
							$div.append(helpBlock);
						}
					}
				}
			});
			generated = true;
		}
		$.extend(this, {
			"addInput" : addInput,
			"addSelect" : addSelect,
			"addCheckbox" : addCheckbox,
			"addRadio" : addRadio,
			"addTextarea" : addTextarea,
			"generate" : generate,
			"horizontal" : function(v) { return property(properties, "horizontal", v);},
			"idPrefix" : function(v) { return property(properties, "idPrefix", v);},
			"labelSize" : function(v) { return property(properties, "labelSize", v);}
		});
	}
	$.fn.bootstrap3form = function(options) {
		return new Bootstrap3Form($(this), options);
	}

})(jQuery);
