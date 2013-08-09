if (typeof(flect) == "undefined") flect = {};
if (typeof(flect.app) == "undefined") flect.app = {};

$(function() {
	function ColorPicker(id) {
		var $el = $(id),
			callback = null;
		
		$el.change(function() {
			if (callback) {
				callback.call(this, $(this).val());
			}
		});
		function isColorStr(s) {
			return /^[a-zA-Z0-9]{6}$/.test(s);
		}
		function select(func) {
			var self = this;
			callback = function(s) {
				func.call(self,s);
				callback = null;
			}
			$el.click();
		}
		function val(s) {
			$el.val(s);
		}
		$.extend(this, {
			"isColorStr" : isColorStr,
			"select" : select,
			"val" : val
		});
	}
	
	flect.app.FormEditor = function() {
		$("body").fixedDiv({
			"orientation" : "vertical"
		});
		$("#workspace").splitter({
			"limit" : 300,
			"keepLeft" : true,
			"windowResized" : function() {
				resize();
			}
		});
		
		var $form = $("#sampleForm"),
		    jsonEditor = ace.edit("json-editor"),
		    cssEditor = ace.edit("css-editor"),
		    colorPicker = new ColorPicker("#color"),
			$tabs = $("#tabs").tabs({
				"activate": function(event, ui) {
					setTimeout(function(){
						var editor = ui.newPanel[0].id == "json-editor" ? jsonEditor : cssEditor;
						editor.resize(true);
						editor.focus();
					}, 10)
				}
			});
		
		if (sessionStorage.getItem("template")) {
			jsonEditor.setValue(sessionStorage.getItem("template"));
			sessionStorage.removeItem("template");
		}
		if (sessionStorage.getItem("css")) {
			cssEditor.setValue(sessionStorage.getItem("css"));
			sessionStorage.removeItem("css");
		}
		jsonEditor.setTheme("ace/theme/chrome");
		jsonEditor.getSession().setMode("ace/mode/json");
		jsonEditor.getSession().setTabSize(2);
		jsonEditor.getSession().on("change", buildForm);
		jsonEditor.getSession().on("changeAnnotation", buildForm);
		
		cssEditor.setTheme("ace/theme/chrome");
		cssEditor.getSession().setMode("ace/mode/css");
		cssEditor.getSession().setTabSize(2);
		cssEditor.getSession().on("change", buildCss);
		cssEditor.getSession().on("changeAnnotation", buildCss);
		
		resize();
		
		var json = jsonEditor.getValue(),
			builder = $form.formbuilder(JSON.parse(json));
		buildCss();
		
		function resize() {
			$tabs.width($("#editor-pane").innerWidth());
			
			var wh = {
				"width" : $tabs.innerWidth(),
				"height" : $tabs.innerHeight() - 180
			}
			$("#json-editor").css(wh);
			$("#css-editor").css(wh);
			
			jsonEditor.resize();
			cssEditor.resize();
			
			$("#form-pane").css("height", $(window).height() - 60);
		}
		
		function hasError(editor) {
			var annotations = editor.getSession().getAnnotations();
			if (annotations) {
				for (var i=0; i<annotations.length; i++) {
					if (annotations[i].type == "error") {
						return true;
					}
				}
			}
			return false;
		}
		function buildForm() {
			if (!hasError(jsonEditor)) {
				var text = jsonEditor.getValue();
				if (json != text) {
					var obj = null;
					text = text.replace(/\/\/.*\n/g, "\n")
					json = text;
					try {
						obj = JSON.parse(text);
					} catch (e) {
						return;
					}
					if (obj) {
						$.removeData($form[0], "validator");
						$form.empty().formbuilder(obj);
					}
				}
			}
		}
		function buildCss() {
			if (!hasError(cssEditor)) {
				var text = cssEditor.getValue();
				$("#form-css").text(text);
			}
		}
		function gotoLine(name) {
			var text = jsonEditor.getValue().split("\n");
			name = "\"" + name + "\"";
			for (var i=0; i<text.length; i++) {
				if (text[i].indexOf(name) >= 0) {
					jsonEditor.gotoLine(i + 1);
					break;
				}
			}
		}
		function showDialog(data) {
			var title = data.success ? "Success" : "Error",
				$ul = $("#resultList").empty();
			if (data.messages) {
				$.each(data.messages, function(name, msgs) {
					var $li = $("<li><label></label><span></span></li>");
					$li.find("label").text(name);
					$li.find("span").html(msgs.join("<br>"));
					$ul.append($li);
				});
			} else {
				var $li = $("<li><span></span></li>");
				$li.find("span").html("No errors.");
				$ul.append($li);
			}
			$("#resultDialog").dialog({
				"title" : title,
				"height" : 400,
				"width" : 600,
				"modal" : true
			});
		}
		function save(name, text) {
			var form = $("#downloadForm");
			form.attr("action", "/download/" + name);
			form.find(":input[name=text]").val(text);
			form[0].submit();
		}
		$("#bootstrap").click(function() {
			sessionStorage.setItem("template", jsonEditor.getValue());
			sessionStorage.setItem("css", cssEditor.getValue());
			
			var b = $("#bootstrap").attr("data-enable") == "true",
				template = $("#template").val();
			location.href = "/editor?bootstrap=" + !b + "&template=" + template;
		});
		$("#saveJson").click(function() {
			save("form.json", jsonEditor.getValue());
		});
		$("#saveCss").click(function() {
			save("style.css", cssEditor.getValue());
		});
		$("#salesforce").click(function() {
			alert("Not implemented yet.");
		});
		$("#submit").click(function() {
			if (builder.validate()) {
				alert("No errors.");
			}
		});
		$("#submit2").click(function() {
			var json = builder.getJson();
			$.ajax({
				"url" : "/validate",
				"type" : "POST",
				"data" : {
					"formDef" : jsonEditor.getValue(),
					"formData" : JSON.stringify(json)
				},
				"success" : function(data) {
					showDialog(data);
				}
			});
		});
		$("#template").change(function() {
			sessionStorage.removeItem("template");
			sessionStorage.removeItem("css");
			
			var b = $("#bootstrap").attr("data-enable") == "true",
				template = $("#template").val();
			location.href = "/editor?bootstrap=" + b + "&template=" + template;
		});
		
		$("#css-editor").dblclick(function() {
			var text = cssEditor.session.getTextRange(cssEditor.getSelectionRange());
			if (colorPicker.isColorStr(text)) {
				colorPicker.val("#" + text);
				colorPicker.select(function(s) {
					cssEditor.insert(s.substring(1));
				});
			}
		});
		$form.find(":input").focus(function() {
			var name = $(this).attr("name");
			gotoLine(name);
		});
	}
});
