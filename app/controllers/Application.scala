package controllers

import play.api.mvc.Action;
import play.api.mvc.Controller;
import java.io.File;
import play.api.data.Form;
import play.api.data.Forms.tuple;
import play.api.data.Forms.text;

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
      val result = FormDefinition.fromJson(formDef).validate(formData);
      Ok(result.toJson).as("application/json; charset=utf-8");
    }
  }
  
  def downloadText = Action { implicit request =>
    request.body.asFormUrlEncoded.flatMap {
      _.get("text").map(_.head)
    } match {
      case Some(s) => Ok(s).as("application/octet-stream");
      case None => BadRequest;
    }
  }
}