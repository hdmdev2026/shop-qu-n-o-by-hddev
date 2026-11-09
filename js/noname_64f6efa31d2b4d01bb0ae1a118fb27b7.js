var script = document.createElement('script');
script.onload = function () {
    fbInboxFillPage('https://www.facebook.com/Rabityfashion/','https://onapp.haravan.com/facebookinbox/static/images/fb-icon-1.png','#3366CC','#797979','#FFFFFF','0','Rabity xin chào',true,false),facebookShowPanelButton();
};
script.src = "https://onapp.haravan.com/facebookinbox/static/javascripts/fb-box.js?v=1564325697874";
document.getElementsByTagName('head')[0].appendChild(script);