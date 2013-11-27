//@charset "utf-8"
$(function(){
	function getUrlParam(item) {
	    var value = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
	    return value ? value[1] : value;
	}
	var pid = getUrlParam('pid');
    var testUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid='+userid+'&pid='+pid+'&type=jsonp&charset=utf8&callback=?';
    $.getJSON(testUrl,function(data){
        var content = removeHTMLTag($(data)[0].data.content);
        $("#clockContent").text(mCutStr(content,80));
    });
})