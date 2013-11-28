//@charset "utf-8"
//全局的变量如：userid ,uname


window.UEDITOR_HOME_URL = "/zscript/ueditor/";
var info = external.createObject("Passport");
var userid = info.get("userid");
var uname  = info.get("account");
// alert(userid);
// var userid = 110477887;
// var uname = 'luck_dlp';
// var userid = 137561046;
// var uname = 'xiaonigu123';
// var userid = 178072724;
// var uname = '969988aaaaaa';
// var userid = 127530836;
// var uname = 'syqiong';
var urlMap = {
  'diary': "http://sapi.10jqka.com.cn&controller=api&action=getStockDiary", // 获取所有记事
  'subscribe': "http://comment.10jqka.com.cn/api/subscribe.php", // 订阅
  'save': "http://blog.10jqka.com.cn/sapigsrj/index.php?module=blog&controller=api&action=post"
};
var jsUrl = "http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiary&userid="+userid+"&type=jsonp&charset=utf8&callback=?";
var dyUrl = "http://comment.10jqka.com.cn/api/subscribe.php?act=getNews&userid="+userid+"&jsoncallback=?";

//以下用于日记列表和表格日历的共用部分
//获取服务器时间
function getDomainTime(){
  var nowDate = new Date(jstime); //获取服务器时间
  var nowYear = nowDate.getFullYear(); //获取服务器年份
  var nowMonth = nowDate.getMonth()+1; //获取服务器月份
  var nowDay = nowDate.getDate();//获取服务器日期
  var nowHour = nowDate.getHours();//获取服务器小时
  var nowMin = nowDate.getMinutes();//获取服务器分钟
  var nowSec= nowDate.getSeconds();//获取服务器秒数
  return{
    nowYear:nowYear,
    nowMonth:nowMonth,
    nowDay:nowDay,
    nowHour:nowHour,
    nowMin:nowMin,
    nowSec:nowSec
  }
}
var yearSelect = $("#year-select");
var yearBt = $("#year-bt");
var monthSelect = $('#month-select');
var monthBt = $("#month-bt");
var noteBody = $("#noteBody");

//设置显示的年份
function setSelectYear(currentYear) {
    yearBt.text(currentYear + '年').attr('year', currentYear);
}

//设置显示的月份
function setSelectMonth(currentMonth) {
    monthBt.text(currentMonth + '月').attr('month', currentMonth);
}

//创建年份下拉列表
function genSelectYear(currentYear) {
    var yearUl = '<ul>';
    yearSelect.html('');
    for (var i = currentYear - 5; i <= currentYear + 5; i++) {
        if (i == currentYear) {
            yearUl += '<li class="cur" year="' + i + '"><a href="###">' + i + '年</a></li>';
        } else {
            yearUl += '<li year="' + i + '"><a href="###">' + i + '年</a></li>';
        }
    }
    yearUl += '</ul>';
    yearSelect.html(yearUl);
}

//创建月份下拉列表
function genSelectMonth(currentMonth) {
    var monthUl = '<ul>';
    monthSelect.html('');
    for (var i = 1; i <= 12; i++) {
        if (i == currentMonth) {
            monthUl += '<li class="cur" month="' + i + '"><a href="###">' + i + '月</a></li>';
        } else {
            monthUl += '<li month="' + i + '"><a href="###">' + i + '月</a></li>';
        }
    }
    monthUl += '</ul>';
    monthSelect.html(monthUl);
}

//计算上一个月的年份和月份
function countLastDate(currentYear,currentMonth){
  if (currentMonth >= 2){
    currentMonth--;
  }else{
    currentYear--;
    currentMonth = 12;
  }
  return {year:currentYear,month:currentMonth}
}

//计算下个月的年份和月份
function countNextDate(currentYear,currentMonth){
  if (currentMonth < 12){
    currentMonth++;
  }else{
    currentYear++;
    currentMonth = 1;
  }
  return {year:currentYear,month:currentMonth}
}

//获取某年某个月有多少天
function countDays(currentYear, currentMonth) {
    return new Date(currentYear, currentMonth, 0).getDate();
}

  //获取某一天是星期几
function fngetday(year, month, date) {
    var keystr = "622503514624";
    var deltmonth = parseInt(keystr.substr(month - 1, 1));
    var deltyear = (year - 2000) + Math.ceil((year - 2000) / 4);
    deltyear += (year - Math.floor(year / 4) * 4 == 0 && month > 2 ? 1 : 0);
    var deltdate = date - 1;
    return (deltmonth + deltyear + deltdate) - Math.floor((deltmonth + deltyear + deltdate) / 7) * 7;
}

//限制字数
function mCutStr(str,len)
{
   var str_length = 0;
   var str_len = 0;
      str_cut = new String();
      str_len = str.length;
      for(var i = 0;i<str_len;i++)
     {
        a = str.charAt(i);
        str_length++;
        if(escape(a).length > 4)
        {
         //中文字符的长度经编码之后大于4
         str_length++;
         }
         str_cut = str_cut.concat(a);
         if(str_length>=len)
         {
         str_cut = str_cut.concat("...");
         return str_cut;
         }
    }
    //如果给定字符串小于指定长度，则返回源字符串；
    if(str_length<len){
     return  str;
    }
}

//以下是公用的diary的列表和表格公用的
//根据毫秒得到十位的日期
function getFullDate(milliseconds){
    var date = new Date(milliseconds);
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    if(day<10){day = '0'+day}
    if(month<10){month = '0'+ month}
    var hour = date.getHours();
    if(hour<10){hour = '0'+ hour}
    var minite = date.getMinutes();
    if(minite<10){minite = '0'+minite};
    var sec = date.getSeconds();
    if(sec<10){sec = '0'+sec};
    return ''+year+month+day+hour+minite+sec;
}

//根据具体年月日获取八位日期
function getFullDate2(year,month,date){
    if(month<10){month = '0'+month}
        if(date<10){date = '0'+date}
            //if(hour<10){hour = '0'+hour}
              //  if(minite<10){'0'+minite}
        return ''+year+month+date;
}

//根据八位日期转换格式
function dateChange(date){
  var yearChange = date.slice(0,4);
  var monthChange = date.slice(4,6);
  var dayChange = date.slice(6);
  return yearChange+'-'+monthChange+'-'+dayChange;
}

//数组排序
function dateSort(arr){
    arr.sort(function(x,y){
        return parseInt(y.ctime)-parseInt(x.ctime);
    })
}
 //截取时间的年月日,时分
function getFullTime(time){
    var timeStr = time.toString();//转换成字符串
    var year = timeStr.slice(0,4);//年
    var month = timeStr.slice(4,6);//月
    var date = timeStr.slice(6,8);//日
    var hour = timeStr.slice(8,10);//时
    var min = timeStr.slice(10,12);//分
    var sec = timeStr.slice(12,14);//秒
    var timeDate = year + '-' + month + '-' + date;
    var timeHour = hour + ':' + min + ':' + sec;
    var week = fngetday(year,month,date);
    var weekDay;
    switch(week){
        case 0:
            weekDay = '星期天';
            break;
        case 1:
            weekDay = '星期一';
            break;
        case 2:
            weekDay = '星期二';
            break;
        case 3:
            weekDay = '星期三';
            break;
        case 4:
            weekDay = '星期四';
            break;
        case 5:
            weekDay = '星期五';
            break;
        case 6:
            weekDay = '星期六';
            break;
        }
    return{timeDate:timeDate,timeHour:timeHour,weekDay:weekDay}
}

//选出数组中出现次数最多的元素
function getTop(arr, size)
{
  var value = []; //作为元素的计数器
  var key = []; //用于对应元素和计算器的位置
  for (var i in arr) {
    if(!Array.prototype.indexOf){//IE6,7不支持数组的indexOf
      Array.prototype.indexOf = function(val){
      var value = this;
      for(var i =0; i < value.length; i++){
        if(value[i] == val) return i;
      }
      return -1;
    };
  }
    var indexOfValue = key.indexOf(arr[i]);
    if (indexOfValue == -1) {
      key.push(arr[i]);
      value.push(1);
    } else {
      value[indexOfValue]++;
    }
  }
  
  var obj = quickSort(key, value);
  var rtn = [];
  var len = obj.key.length;
  for (var i = 0; i < size && i < len; i++) {
    rtn.push(obj.key[i]);
  }
  return rtn;
}

function quickSort(key, value)
{
　　if (value.length <= 1) { 
    return {
      key : key,
      value : value
    };
  }
　　var pivotIndex = Math.floor(value.length / 2);
  var pivotKey = key.splice(pivotIndex, 1)[0];
　　var pivotValue = value.splice(pivotIndex, 1)[0];
　　var leftValue = [];
　　var rightValue = [];
  var leftKey = [];
　　var rightKey = [];
　　for (var i = 0; i < value.length; i++) {
　　　　if (value[i] > pivotValue) {
      leftKey.push(key[i]);
      leftValue.push(value[i]);
　　　　} else {
      rightKey.push(key[i]);
      rightValue.push(value[i]);
　　　　}
　　}
  var left = quickSort(leftKey, leftValue);
  var right = quickSort(rightKey, rightValue);
  return {
    key : left.key.concat([pivotKey], right.key),
    value : left.value.concat([pivotValue], right.value)
  }
}

//去除数组的重复元素
function unique(data){
    data = data || [];
    var a = {};
    for (var i=0; i<data.length; i++) {
        var v = data[i];
        if (typeof(a[v]) == 'undefined'){
             a[v] = 1;
         }
    };
    data.length=0; 
      for (var i in a){
               data[data.length] = i;
         }
        return data;
}

//截取url的固定字段
function getFieldValue(field,url){
  var fields = url.split('&');
  var fieldObj = {};
  for(var k=0 ;k<fields.length;k++){
    var fieldsInner = fields[k].split('=');
    var fieldname = fieldsInner[0];
    var fieldvalue = fieldsInner[1];
    if(fieldname == field){
      return fieldvalue;
    }
  }
}

//过滤字符串中的html标签
function removeHTMLTag(str) {
  str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
  str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
  //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
  str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
  return str;
}

//首页的动态交互
//添加记事按钮的出现
$(".notelist-title").live('mouseover',function(){
  $(".add-note").hide();
  $(this).siblings('.add-note').show();
});
$(".notelist-title").live('mouseout',function(){
  $(this).siblings('.add-note').hide();
});
//添加记事框框的出现
  $("#noteBody td").live('mouseover',function(){
    $(".add-note").hide();
    $(this).find('.add-note').show();
  });
  $("#noteBody td").live('mouseout',function(){
    $(this).find('.add-note').hide();
  });
  
//记事列表动态交互
//添加记事框框的出现
$(".note-day").live('mouseover',function(){
  $(".add-note").hide();
  $(this).find('.add-note').show();
});
$(".note-day").live('mouseout',function(){
  $(this).find('.add-note').hide();
});
$('.add-note').live('click',function(){
    $("#add_box,#mask_iframe").show();
    var add_date = $(this).siblings(".notelist-date").text().slice(0,10).replace(/-/g,'');
    var display_date = setDispaly_date(add_date);
    $("#add_box .wdate_picker_date").val(display_date);
  });

//获取当前的年份
function getYear(){
  return parseInt($("#year-bt").attr('year'));
}

//获取当前的月份
function getMonth(){
  return parseInt($("#month-bt").attr('month'));
}

//获取当前是第几页数
function getCurrentPage(){
    return parseInt($("#currentPage").text(), 10);
}

$(document).ready(function() {
  // 日历控件初始化
  $('.wdate_picker_time').click(function() {
    WdatePicker({
      dateFmt:'yyyy-MM-dd HH:mm:ss'
    });
  });
  $('.wdate_picker_date').click(function() {
    WdatePicker();
  });
});