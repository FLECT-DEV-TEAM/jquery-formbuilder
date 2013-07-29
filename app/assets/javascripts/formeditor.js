if (typeof(flect) == "undefined") flect = {};
if (typeof(flect.app) == "undefined") flect.app = {};

$(function() {
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
		
		var json = jsonEditor.getValue();
		$form.formbuilder(JSON.parse(json));
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
		$("#bootstrap").click(function() {
			sessionStorage.setItem("template", jsonEditor.getValue());
			sessionStorage.setItem("css", cssEditor.getValue());
			
			var b = $("#bootstrap").attr("data-enable") == "true",
				template = $("#template").val();
			location.href = "/sample?bootstrap=" + !b + "&template=" + template;
		});
		$("#submit").click(function() {
			if ($form.validate().form()) {
				alert("エラーはありません");
			}
		});
		$("#template").change(function() {
			sessionStorage.removeItem("template");
			sessionStorage.removeItem("css");
			
			var b = $("#bootstrap").attr("data-enable") == "true",
				template = $("#template").val();
			location.href = "/sample?bootstrap=" + b + "&template=" + template;
		});
	}
});
