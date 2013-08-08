package controllers

import play.api.mvc.Action;
import play.api.mvc.Controller;
import java.io.File;
import play.api.libs.json._;
import play.api.data.Form;
import play.api.data.Forms.tuple;
import play.api.data.Forms.text;
import scala.collection.JavaConversions._

import jp.co.flect.formvalidation.FormDefinition;

object Application extends Controller {
  
  def index = Action {
    Redirect("/editor");
  }

  def editor = Action { implicit request =>
    val bootstrap = request.getQueryString("bootstrap").getOrElse("true").toBoolean;
    val template = request.getQueryString("template") match {
      case Some(s) if (new File("app/data/" + s).exists) => s;
      case _ => "sample1.json";
    }
    Ok(views.html.sample(bootstrap, template));
  }
  
  private val validateForm = Form(
    tuple(
      "formDef" -> text,
      "formData" -> text
    )
  );
  
  def validate = Action { implicit request =>
    val form = validateForm.bindFromRequest;
    if (form.hasErrors) {
      BadRequest;
    } else {
      val (formDef, formData) = form.get;
      val map = jsonToMap(formData);
      val result = FormDefinition.fromJson(formDef).validate(map);
      Ok(result.toJson).as("application/json; charset=utf-8");
    }
  }
  
  private def jsonToMap(str: String): scala.collection.Map[String, Array[String]] = {
    val json = Json.parse(str);
    json match {
      case obj: JsObject => 
        obj.value.mapValues{ value =>
          value match {
            case s: JsString => Array(s.value.toString);
            case b: JsBoolean => Array(b.value.toString);
            case n: JsNumber => Array(n.value.toString);
            case a: JsArray => a.value.map{ value =>
              value match {
                case s: JsString => s.value.toString;
                case b: JsBoolean => b.value.toString;
                case n: JsNumber => n.value.toString;
                case _ => "";
              }
            }.toArray;
            case _ => Array("");
          }
        }
      case _ => Map[String, Array[String]]();
    }
  }
}