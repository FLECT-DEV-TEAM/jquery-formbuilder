if (typeof(flect) == "undefined") flect = {};
if (typeof(flect.app) == "undefined") flect.app = {};

$(function() {
	flect.app.FormEditor = function(initialData) {
		$("body").fixedDiv({
			"orientation" : "vertical"
		});
		$("#workspace").splitter({
			"limit" : 100,
			"keepLeft" : true
		});
		$("#editor").css("width", $("#editor-pane").innerWidth());
		
		var $form = $("#sampleForm"),
		    editor = ace.edit("editor"),
			json = editor.getValue();
		
		editor.setTheme("ace/theme/idle_fingers");
		editor.getSession().setMode("ace/mode/json");
		editor.getSession().setTabSize(2);
		editor.getSession().on("change", buildForm);
		editor.getSession().on("changeAnnotation", buildForm);
		
		$form.formbuilder(initialData);
		
		function hasError() {
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
			if (!hasError()) {
				var text = editor.getValue();
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
		$("#test").click(buildForm);
		$("#submit").click(function() {
			if ($form.validate().form()) {
				alert("エラーはありません");
			}
		});
	}
});
