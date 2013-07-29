package controllers

import play.api.mvc.Action;
import play.api.mvc.Controller;
import java.io.File;

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def sample = Action { implicit request =>
    val bootstrap = request.getQueryString("bootstrap").getOrElse("true").toBoolean;
    val template = request.getQueryString("template") match {
      case Some(s)  => println(new File("app/data/" + s).exists); s;
      case _ => "sample1.json";
    }
    Ok(views.html.sample(bootstrap, template));
  }
}