//@charset "utf-8"
$(function() {
    var pid = getUrlParam('pid');
    var testUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
    $.ajax({
        url: testUrl,
        type: 'get',
        dataType : 'json',
        success: function(data){
            var content = removeHTMLTag($(data)[0].data.content);
            var title = $(data)[0].data.subtitle;
            var code = ''+$(data)[0].data.code;
            var codename = $(data)[0].data.codename;
                codename = getKHDCodename(code,codename);
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
            if(codename == ''){
                $("#clockCode").hide();
            }else{
                    $("#clockCode").html('相关股票：<span>'+codename+'</span>');
                  }   
        },
        error:function(){
             $('#clock_box .clock-inner').html('<p style="margin-top:30px;">对不起，服务器繁忙，闹钟具体内容请到股市日历查看</p><a href="###" class="konwBt">我知道了</a>');     
        }
    });
    $(".konwBt").click(function() {
        external.closeWindow();
    });
})
