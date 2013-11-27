//@charset "utf-8"
var util = util || {};

util.setCookie = function(sName, sValue, oExpires, sPath, sDomain, bSecure) {
    var sCookie = sName + '=' + encodeURIComponent(sValue);
    if (oExpires) {
        sCookie += '; expires=' + oExpires.toGMTString();
    };
    if (sPath) {
        sCookie += '; path=' + sPath;
    };
    if (sDomain) {
        sCookie += '; domain=' + sDomain;
    };
    if (bSecure) {
        sCookie += '; secure';
    };
    document.cookie = sCookie;
};

util.getCookie = function(sName) {
    var sRE = '(?:; )?' + sName + '=([^;]*)';
    var oRE = new RegExp(sRE);
    if (oRE.test(document.cookie)) {
        return decodeURIComponent(RegExp['$1']);
    } else {
        return null;
    };
}

util.deleteCookie = function(sName, sPath, sDomain) {
    this.setCookie(sName, '', new Date(0), sPath, sDomain);
}

function getUrlParam(item) {
    var value = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
    return value ? value[1] : value;
}

// 获取userid通过cookie
function getUserid() {
    return util.getCookie('userid');
}



