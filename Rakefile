task :default => "dist"

task "dist" do
  dest = "dist"
  cp "app/assets/javascripts/jquery.bootstrap3.js", dest
  cp "app/assets/javascripts/jquery.formbuilder.js", dest
  cp "app/assets/javascripts/jquery.validate.addons.js", dest
  cp "target/scala-2.10/resource_managed/main/public/javascripts/jquery.bootstrap3.min.js", dest
  cp "target/scala-2.10/resource_managed/main/public/javascripts/jquery.formbuilder.min.js", dest
  cp "target/scala-2.10/resource_managed/main/public/javascripts/jquery.validate.addons.min.js", dest
  cp "target/scala-2.10/resource_managed/main/public/stylesheets/jquery.formbuilder.css", dest
  cp "target/scala-2.10/resource_managed/main/public/stylesheets/jquery.formbuilder.min.css", dest
  cp "public/javascripts/ext/validation/jquery.validate.js", dest + "/validation"
  cp "public/javascripts/ext/validation/jquery.validate.min.js", dest + "/validation"
  cp "public/javascripts/ext/validation/additional-methods.js", dest + "/validation"
  cp "public/javascripts/ext/validation/additional-methods.min.js", dest + "/validation"
  cp "public/javascripts/ext/validation/localization/messages_ja.js", dest + "/validation"
end

