//@charset "utf-8"
$(function() {
    var pid = getUrlParam('pid');
    var testUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
    //根据code取codename
    function getEvalJson(str){
      return eval(str);
    }
    function getKHDCodename(code,codename){
      var thsQuote = external.createObject('Quote');
      var reqObj = {
        code : code,
        type : 'zqmc,new',
        onready: function(){
          var param = {
            code : code,
            type : 'zqmc'
          };
          var retObj = thsQuote.getData(param);
          var codenameNew;
          if(code == ''){
            codenameNew = '';
          }else{
            codenameNew = getEvalJson(retObj)[code]['zqmc'];
          }
          if(codenameNew == ''){
            $("#clockCode").hide();
            }else{
                $("#clockCode").html('相关股票：<span>'+codenameNew+'</span>');
            }
        }
      };
      var flag = thsQuote.request(reqObj);
    }
    $.getJSON(testUrl, function(data) {
        var content = removeHTMLTag($(data)[0].data.content);
        var title = $(data)[0].data.subtitle;
        var code = $(data)[0].data.code;
        var codename = $(data)[0].data.codename;
        var clocktime = $(data)[0].data.clock;
        $("#clockTitle").text(mCutStr(title,30));
        $("#clockContent").text(mCutStr(content, 72));
        if(clocktime == 0){
            $("#clockTime").hide();
        }else{
            var fulldate = getFullDate(clocktime * 1000),
                year = fulldate.slice(0,4),
                month = fulldate.slice(4,6),
                day = fulldate.slice(6,8),
                hour = fulldate.slice(8,10),
                min = fulldate.slice(10,12),
                sec = fulldate.slice(12);
            $("#clockTime").text('提醒时间：'+year+':'+month+':'+day+' '+hour+':'+min+':'+sec);
        }
        getKHDCodename(code,codename);
    });
    $("#konwBt").click(function() {
        external.closeWindow();
    });
})