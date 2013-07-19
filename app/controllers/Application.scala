package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def sample = Action { implicit request =>
    val bootstrap = request.getQueryString("bootstrap").getOrElse("true").toBoolean;
    Ok(views.html.sample(bootstrap));
  }
}