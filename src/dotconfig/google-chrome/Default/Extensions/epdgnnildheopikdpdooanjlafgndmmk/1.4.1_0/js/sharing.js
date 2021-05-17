//Copyright 2019 and Patent Pending. 2019-12-30 14:54:36
function shareLinks(link) {
  if (link.indexOf("http") == -1 || link.length > 25) {
    return;
  }
  var data = "";
  data += '<p id="sid" sytle="height: 151px; margin-top: 50px;" align="right">';
  data += ' <span style="font-size: 12px; font-family: verdana;"><span style="color: red">*</span><span style="color: grey">Share it on </span></span>';
  data += ' <a class=addThis id=Fb onclick="gaEvent(gappRef, "Share", "Fb");" href="http://www.addtoany.com/add_to/facebook?linkname=&linkurl=' + link + '" target="_blank"><img src="https://cache.addthiscdn.com/icons/v2/thumbs/16x16/facebook.png" border="0" alt="Facebook"/></a>';
  data += ' <a class=addThis id=Tw onclick="gaEvent(gappRef, "Share", "Tw");" href="http://www.addtoany.com/add_to/twitter?linkname=&linkurl=' + link + '" target="_blank"><img src="https://cache.addthiscdn.com/icons/v2/thumbs/16x16/twitter.png" border="0" alt="Twitter"/></a>';
  data += ' <a class=addThis id=Gp onclick="gaEvent(gappRef, "Share", "Gp");" href="http://www.addtoany.com/add_to/google_plus?linkname=&linkurl=' + link + '" target="_blank"><img src="https://cache.addthiscdn.com/icons/v2/thumbs/16x16/google_plusone_share.png" border="0" alt="GooglePlus"/></a>';
  data += ' <a class=addThis id=Li onclick="gaEvent(gappRef, "Share", "Li");" href="http://www.addtoany.com/add_to/linkedin?linkname=&linkurl=' + link + '" target="_blank"><img src="https://cache.addthiscdn.com/icons/v2/thumbs/16x16/linkedin.png" border="0" alt="LinkedIn"/></a>';
  data += ' <a class=addThis id=Email onclick="gaEvent(gappRef, "Share", "Email");" href="http://www.addtoany.com/add_to/email?linkname=&linkurl=' + link + '" target="_blank"><img src="https://cache.addthiscdn.com/icons/v2/thumbs/16x16/email.png" border="0" alt="Email"/></a>';
  data += ' <a class=addThis id=Ext onclick="gaEvent(gappRef, "Share", "Ext");" href="http://www.addtoany.com/share_save?linkname=&type=page&linkurl=' + link + '" target="_blank"><img src="https://cache.addthiscdn.com/icons/v2/thumbs/16x16/addthis.png" border="0" alt="Addthis"/></a>';
  data += "</p>";
  $("#sid").remove();
  $("#msg").after(data);
  $(".addThis").click(function() {
    gaEvent(gappRef, "Share", this.id);
  });
  $("a.addThis").css("opacity", ".4");
  $("a.addThis").hover(function() {
    $(this).fadeTo("fast", "1");
  }, function() {
    $(this).fadeTo("fast", ".4");
  });
}
;
