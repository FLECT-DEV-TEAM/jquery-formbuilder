(function($) {
	"use strict";
	
	if ($.validator) {
		//全角ひらがなのみ
		$.validator.addMethod("hiragana", function(value, element) {
			return this.optional(element) || /^([ぁ-んー]+)$/.test(value);
		}, "Please enter only Hiragana.");

		//全角カタカナのみ
		$.validator.addMethod("katakana", function(value, element) {
			return this.optional(element) || /^([ァ-ヶー]+)$/.test(value);
		}, "Please enter only Katakana.");

		//半角カタカナのみ
		$.validator.addMethod("hankana", function(value, element) {
			return this.optional(element) || /^([ｧ-ﾝﾞﾟ]+)$/.test(value);
		}, "Please enter only hankaku kana.");

		//半角アルファベット（大文字･小文字）のみ
		$.validator.addMethod("alpha", function(value, element) {
			return this.optional(element) || /^([a-zA-z¥s]+)$/.test(value);
		}, "Please enter only alphabet.");

		//半角アルファベット（大文字･小文字）もしくは数字のみ
		$.validator.addMethod("alphanum", function(value, element) {
			return this.optional(element) || /^([a-zA-Z0-9]+)$/.test(value);
		}, "Please enter only alphabet or number.");
		
		//郵便番号（例:012-3456）
		$.validator.addMethod("postcode", function(value, element) {
			return this.optional(element) || /^¥d{3}¥-¥d{4}$/.test(value);
		}, "Please enter a valid postcode.");

		//電話番号（例:010-2345-6789）
		$.validator.addMethod("tel", function(value, element) {
			return this.optional(element) || /^[0-9-]{10,13}$/.test(value);
		}, "Please enter a valid telephone number.");
		
		//正規表現
		$.validator.addMethod("regexp", function(value, element, param) {
			return this.optional(element) || new RegExp(param).test(value);
		}, "Please enter \"{0}\" format.");
		
		//複数項目のいずれかが必須
		$.validator.messages.requiredOne = "At least onf of {0} is required.";
	}
})(jQuery);
