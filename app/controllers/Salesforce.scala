package controllers

import play.api.mvc.Action;
import play.api.mvc.Controller;
import play.api.mvc.AnyContent;
import play.api.mvc.Request;
import play.api.mvc.Result;
import play.api.Play.current;
import play.api.cache.Cache;

import play.api.data.Form;
import play.api.data.Forms.tuple;
import play.api.data.Forms.nonEmptyText;
import play.api.data.Forms.text;
import play.api.data.Forms.optional;

import java.io.File;

import jp.co.flect.formvalidation.salesforce.SalesforceObjectBuilder;
import jp.co.flect.formvalidation.salesforce.SalesforceInfo;
import jp.co.flect.salesforce.SalesforceClient;
import jp.co.flect.log.Level;
import jp.co.flect.play2.utils.Params;
import jp.co.flect.net.OAuth2;

object Salesforce extends Controller {
  
  private val AUTH_URL  = "https://login.salesforce.com/services/oauth2/authorize";
  private val TOKEN_URL = "https://login.salesforce.com/services/oauth2/token";

  private val APPID    = sys.env.get("SALESFORCE_APPID");
  private val SECRET   = sys.env.get("SALESFORCE_SECRET");
  
  private val baseClient = new SalesforceClient(new File("conf/salesforce/partner.wsdl"));
  
  private def enabled = APPID.nonEmpty && SECRET.nonEmpty;
  private def cacheKey(implicit request: Request[AnyContent]) = Params(request).sessionId + "-clilent";
  
  def filterAction(f: Request[AnyContent] => Result): Action[AnyContent] = Action { request =>
    if (!enabled) {
      Ok("Not supported feature.");
    } else {
      f(request);
    }
  }
  
  def prepare = filterAction { implicit request =>
    Cache.get(cacheKey) match {
      case Some(client) =>
        Ok(views.html.salesforcePrepare());
      case None =>
        Redirect("/salesforce/login");
    }
  }
  
  def login(code: String, sandbox: Boolean) = filterAction { implicit request =>
    val (authUrl, tokenUrl) = if (sandbox) {
      (AUTH_URL.replace("login.salesforce.com", "test.salesforce.com"), 
       TOKEN_URL.replace("login.salesforce.com", "test.salesforce.com"));
    } else {
      (AUTH_URL, TOKEN_URL);
    }
    val loginUrl = "http://" + request.host + "/salesforce/login";
    val oauth = new OAuth2(
      authUrl,
      tokenUrl,
      APPID.get,
      SECRET.get,
      loginUrl
    );
    if (code.isEmpty) {
      Ok(views.html.salesforceLogin(oauth));
    } else {
      val res = oauth.authenticate(code);
      val client = new SalesforceClient(baseClient);
      client.getLogger.setLevel(Level.TRACE);
      if (sandbox) {
        val endpoint = client.getEndpoint().replace("login.salesforce.com", "test.salesforce.com");
        client.setEndpoint(endpoint);
      }
      client.login(res);
      Cache.set(cacheKey, client, 60 * 60);
      Redirect("/salesforce/prepare");
    }
  }
  
  private val createForm = Form(
    tuple(
      "name" -> nonEmptyText,
      "label" -> optional(text),
      "description" -> optional(text),
      "json" -> nonEmptyText
    )
  );
  
  def create = filterAction { implicit request =>
    val form = createForm.bindFromRequest;
    if (form.hasErrors) {
      BadRequest;
    } else {
      val (name, label, desc, json) = form.get;
      Cache.getAs[SalesforceClient](cacheKey) match {
        case Some(client) =>
          val builder = new SalesforceObjectBuilder(client, new File("conf/salesforce/metadata.wsdl"));
          try {
            val info = new SalesforceInfo(name);
            label.foreach(info.setLabel(_));
            desc.foreach(info.setDescription(_));
            
            builder.generate(info, json);
            Ok("OK");
          } catch {
            case e: Exception =>
              Ok(e.getMessage);
          }
        case None =>
          Redirect("/salesforce/login");
      }
    }
  }
  
}
