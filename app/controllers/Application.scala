package controllers

import play.api.mvc.Action;
import play.api.mvc.Controller;
import play.api.mvc.AnyContent;
import play.api.mvc.Request;
import play.api.mvc.Result;
import play.api.Play;
import play.api.Play.current;
import java.io.File;
import play.api.data.Form;
import play.api.data.Forms.tuple;
import play.api.data.Forms.text;

import jp.co.flect.formvalidation.FormDefinition;

object Application extends Controller {
  
  def index = Action {
    Redirect("/editor");
  }

  def filterAction(f: Request[AnyContent] => Result): Action[AnyContent] = Action { request =>
    if (Play.isProd && request.headers.get("x-forwarded-proto").getOrElse("http") == "http") {
      Redirect("https://" + request.host + request.path);
    } else {
      f(request);
    }
  }
  
  def editor = filterAction { implicit request =>
    val bootstrap = request.getQueryString("bootstrap").getOrElse("2").toInt;
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
  
  def validate = filterAction { implicit request =>
    val form = validateForm.bindFromRequest;
    if (form.hasErrors) {
      BadRequest;
    } else {
      val (formDef, formData) = form.get;
      val result = FormDefinition.fromJson(formDef).validate(formData);
      Ok(result.toJson).as("application/json; charset=utf-8");
    }
  }
  
  def downloadText = filterAction { implicit request =>
    request.body.asFormUrlEncoded.flatMap {
      _.get("text").map(_.head)
    } match {
      case Some(s) => Ok(s).as("application/octet-stream");
      case None => BadRequest;
    }
  }
}