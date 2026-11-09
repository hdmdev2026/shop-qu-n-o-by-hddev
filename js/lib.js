 (function() {
 var cly = document.createElement('script'); cly.type = 'text/javascript';
 cly.async = true;
 cly.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
 cly.onload = function(){
 var element = document.getElementById('phone-auth-submit');
 var callback = window.On_PhoneAuthRecaptchaCallback;
 if(element && callback) {
 grecaptcha.ready(function() {
 grecaptcha.render('phone-auth-submit', {
 'size': 'invisible',
 'callback' : callback,
 'sitekey': "6Ld6YqwsAAAAAOekXVVS-Mdsmc4a2YLa5ExogurO"
 });
 });
 }
 }
 var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
 })();
