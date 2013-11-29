//@charset "utf-8"
//这里面全部是记事的操作，查看，添加，删除，修改记事。 
//查看记事
	window.lastId = 0;
	window.nextId = 0;
	//填充单片记事内容
	function showNews(data,url){
		var pidnow = getFieldValue('pid',url);
		var news = $(data)[0].data,
    		subtitle = news.subtitle,
			subcontent = news.content,
			codename = news.codename
	    if(news.clock == 0){
	        var clocktext = '无'
	    }else{
	        clocktime = getFullDate(news.clock*1000);
	        var clock_date = getFullTime(clocktime).timeDate;//年月日
	        var clock_time = getFullTime(clocktime).timeHour;//分秒
	    }
	    var ctime = getFullDate(news.ctime*1000);
	    var url = news.url;
	    lastId = news.lastId;
	    nextId = news.nextId;
	    var js_date = getFullTime(ctime).timeDate;
	    var js_time = getFullTime(ctime).timeHour;
	    $("#pidVal").val(pidnow);//pid当前的值
	    $("#subtitle").text(subtitle);
	    $("#codename").text(codename);
	    $("#js_date").text(js_date);
	    $("#js_time").text(js_time);
	    $("#codename").text(codename);
	    $("#news_content").html(subcontent);
	    if(news.clock == 0){
	    	$("#clock").text('无');
		}else{
			$("#clock").text(clock_date+' '+clock_time);
		}
	}

    //查看记事发送ajax
  function showNewsAjax(pid){
    var onlyIS = true;
    var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid='+userid+'&pid='+pid+'&type=jsonp&charset=utf8&callback=?';
    $.getJSON(currentUrl,function(data){
    //初始化渲染表单
        showNews(data,currentUrl);
    //下一条处理
        $("#lastNews").click(function(){ 
            if(onlyIS == false){
                return;
            }else{         
                if(lastId == 0){
                    tipBox('已经是第一篇了');
                    onlyIS = true;
                }else{
                    onlyIS = false;
                    var lastUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid='+userid +'&pid='+lastId+'&type=jsonp&charset=utf8&callback=?';
                    $.getJSON(lastUrl,function(lastData){
                        showNews(lastData,lastUrl);
                        onlyIS = true;
                    });
                }
            }
        });
        //下一条
        $("#nextNews").click(function(){
            if(onlyIS == false){
                return;
            }else{ 
                if(nextId == 0){
                    tipBox('已经是最后篇了');
                    onlyIS = true;
                }else{        
                    onlyIS = false;      
                    var nextUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid='+userid +'&pid='+nextId+'&type=jsonp&charset=utf8&callback=?';
                    $.getJSON(nextUrl,function(nextData){
                        showNews(nextData,nextUrl);
                        onlyIS = true;
                    });
                }
            }
        }); 
      });
  }

//以下为点击编辑以后的处理
//从列表点击编辑以后
function editNews(data,url){
	var news = $(data)[0].data;
	$("#edit_box .subtitle_edit").val(news.subtitle).focus();
	$("#edit_box .codename_edit").val(news.codename);
	$("#edit_box .pidVal").val(news.pid);
    editor.setContent(news.content);
	if(news.clock == '0'){
		$("#edit_box .select_clock").val('无');
		$("#edit_box .clock_edit").hide().val('');
	}else{
		$("#edit_box .select_clock").val('有');
	    var clocktime = getFullDate(news.clock*1000);
	    var clock_date = getFullTime(clocktime).timeDate;//年月日
	    var clock_time = getFullTime(clocktime).timeHour;//分秒
	    $("#edit_box .clock_edit").show().val(clock_date+' '+clock_time);
	}
}
//编辑保存需要提交的数据
function editData(saveBt){
	var boxOuter = saveBt.parents(".note-pop");
    var id = boxOuter.find(".pidVal").val();
    var title = boxOuter.find(".subtitle_edit").val();
    var content = editor.getContent();
    var stockcode = boxOuter.find(".codename_edit").val().slice(0,6);
    var ip = 0;
    var pcate = -1;
    var clock;
    var clock_date;//提醒时间
    if(boxOuter.find(".select_clock").val() == '无'){
        clock = 0;
        clock_date = 0;
    }else if(boxOuter.find(".select_clock").val() == '有' && boxOuter.find(".clock_edit").val() != ''){
        clock = 1;   
        clock_date = getClockTime(boxOuter.find(".clock_edit").val());
    } else if(boxOuter.find(".select_clock").val() == '有' && boxOuter.find(".clock_edit").val() == ''){
        clock = 0;
        clock_date = 0;
    }
    return {
        type: 'json',
        charset: 'utf-8',
        uname:uname,
        userid:userid,
        id:id,
        title:title,
        content:content,
        stockcode:stockcode,
        ip:ip,
        pcate:pcate,
        clock:clock,
        clock_date:clock_date
    }
}
//点击添加记事按钮
//添加记事框内容置为0
function setAddData(){
    var autoCode = getUrlParam('code');
    $("#add_box .subtitle_edit").val('');//标题为空
    if(autoCode == '1A0001'){
        $("#add_box .codename_edit").val('');//代码为空
    }else{
        $("#add_box .codename_edit").val(autoCode);//代码不为空
    }
    $("#add_box .select_clock").val('无');//无闹钟
    $("#add_box .clock_edit").val('');//闹钟为空
    editor2.setContent('');//内容为空
}
//添加记事保存需要提交的数据
function addData(saveBt){
	var boxOuter = saveBt.parents(".note-pop");
    var title = boxOuter.find(".subtitle_edit").val();
    var content1 = editor2.getContent();
    //var stockcode = boxOuter.find(".codename_edit").val();
    var stockcode = boxOuter.find(".codename_edit").val().slice(0,6);
    var ip = 0;
    var pcate = -1;
    var display_date;
    var display_date2 = boxOuter.find('.ctime_edit').val();
    var nowHour = getDomainTime().nowHour;//获取服务器小时
    var nowMin = getDomainTime().nowMin;//获取服务器分钟
    var nowSec= getDomainTime().nowSec;//获取服务器秒数
    //显示日记的时间
    if(display_date2 == ''){
        display_date = 0;
    }else{
        display_date2 +=' '+(nowHour<10?'0'+nowHour:nowHour)+':'+(nowMin<10?'0'+nowMin:nowMin)+':'+(nowSec<10?'0'+nowSec:nowSec);
        display_date = getClockTime(display_date2);
    }
    var clock;
    var clock_date;//提醒时间
    if(boxOuter.find(".select_clock").val() == '无'){
        clock = 0;
        clock_date = 0;
    }else if(boxOuter.find(".select_clock").val() == '有' && boxOuter.find(".clock_edit").val() != ''){
        clock = 1;   
        clock_date = getClockTime(boxOuter.find(".clock_edit").val());
    } else if(boxOuter.find(".select_clock").val() == '有' && boxOuter.find(".clock_edit").val() == ''){
        clock = 0;
        clock_date = 0;
    }
    return {
        type: 'json',
        charset: 'utf-8',
        uname:uname,
        userid:userid,
        display_date:display_date,
        stockcode:stockcode,
        title:title,
        content:content1,
        ip:ip,
        pcate:pcate,
        clock:clock,
        clock_date:clock_date
    }
}
function setDispaly_date(date){
    var display_date;
    var nowYear = getDomainTime().nowYear;
    var nowMonth = getDomainTime().nowMonth;
    var nowDay = getDomainTime().nowDay;
    if(date==0){//0的时候write入口，1的时候.add-note入口
        display_date=nowYear+'-'+(nowMonth<10?'0'+nowMonth:nowMonth)+'-'+(nowDay<10?'0'+nowDay:nowDay);
    }else{
        var datechange = dateChange(date);
        display_date=datechange;
    }
    return display_date;
}
//写记事
$("#writeBtn").click(function(){  
    setAddData();//填充内容设置为0
  $("#mask_iframe,#add_box").show();
  var display_date = setDispaly_date(0);
  $('#add_box .wdate_picker_date').val(display_date);
});
//取消编辑
$("#edit_resumeBtn").click(function(){
    $("#edit_box,#mask_iframe").hide();
}); 
//取消添加
$("#add_resumeBtn").click(function(){
    $("#add_box,#mask_iframe").hide();
});   
//关闭窗口
$(".npop-close").click(function(){
    $(this).parents(".delete-box").hide();
    $("#mask_iframe").hide();
});
//提醒添加成功等公用框
function tipBox(text){
    $("#success_box .delete-text").text(text);
    $("#success_box,#mask_iframe").show();
    if($("#show_box").is(":visible") == false){//有显示记事框存在的情况下
        $(".konwBt").click(function(){
            $("#success_box,#mask_iframe").hide();
        });
        setTimeout(function hide(){
            $("#success_box,#mask_iframe").hide();
        },3000);
    }else{
        $(".konwBt").click(function(){
            $("#success_box").hide();
        });
        setTimeout(function hide(){
            $("#success_box").hide();
        },3000);
    }
}