  //@charset "utf-8"
  $(function() {
    //设置全局的变量用于填充tip框。
    var tipList = [];
    var IS = true;
    /**
     *此处分日期和内容两部分处理数据
     *sortDiary(currentYear,currentMonth)排出一个日历的年月日
     *sortDiaryContent(year,month,diaryList)返回处理后需要填充的日期
     *treatData(js,dy)处理请求到的数据
     *innerTdContent(diaryObj,diaryContent)返回填充的html<td></td>
     *createDiary(currentYear,currentMonth,diaryList)创建日历
     */
    //日历排序
    function sortDiary(currentYear, currentMonth) {
      var lastYear = countLastDate(currentYear, currentMonth).year, //上一个月的年份
        lastMonth = countLastDate(currentYear, currentMonth).month, //上一个月的月份
        nextYear = countNextDate(currentYear, currentMonth).year, //下一个月的年份
        nextMonth = countNextDate(currentYear, currentMonth).month, //下一个月的月份
        firstDay = fngetday(currentYear, currentMonth, 1), //这个月的一号星期几
        countNowDays = countDays(currentYear, currentMonth), //这个月的天数
        lastDay = fngetday(currentYear, currentMonth, countNowDays), //这个月的最后一天星期几
        countLastDays = countDays(lastYear, lastMonth), //上个月的天数
        arrDate = [],
        arrDateLength = 0,
        lastDays = 0; //上个月排进去的天数。
      //上个月排进日历
      for (var j = 0; j < firstDay; j++) {
        var fulldate = '' + lastYear + (lastMonth < 10 ? '0' + lastMonth : lastMonth) + (countLastDays - firstDay + j + 1); //八位数的年月日
        var weekDay = fngetday(lastYear, lastMonth, (countLastDays - firstDay + j + 1));
        var dateOnly = countLastDays - firstDay + j + 1;
        arrDate.push({
          fulldate: fulldate,
          weekDay: weekDay,
          dateOnly: dateOnly
        });
        arrDateLength++;
        lastDays++;
      }
      //本月排进日历
      for (var k = 1; k <= countNowDays; k++) {
        var fulldate = '' + currentYear + (currentMonth < 10 ? '0' + currentMonth : currentMonth) + (k < 10 ? '0' + k : k);
        var weekDay = fngetday(currentYear, currentMonth, k);
        var dateOnly = k;
        arrDate.push({
          fulldate: fulldate,
          weekDay: weekDay,
          dateOnly: dateOnly
        });
        arrDateLength++;
      }
      //判断是否需要排进下个月的
      var q = 1;
      if (arrDateLength % 7 != 0) {
        while (q <= 7 - arrDateLength % 7) {
          nextDays = q;
          var fulldate = '' + nextYear + (nextMonth < 10 ? '0' + nextMonth : nextMonth) + '0' + q;
          var weekDay = fngetday(nextYear, nextMonth, q);
          var dateOnly = q;
          arrDate.push({
            fulldate: fulldate,
            weekDay: weekDay,
            dateOnly: dateOnly
          });
          q++;
        }
      }
      arrDateLength = arrDate.length;
      return {
        diaryLength: arrDateLength, //这个日历一共多少天
        diaryTime: arrDate, //日历数组
        lastDays: lastDays,
        countNowDays: countNowDays
      }
    }

    //待填充的日历具体内容
    function sortDiaryContent(year, month, diaryList) {
      var diaryTimeObj = sortDiary(year, month).diaryTime;
      var diaryLength = sortDiary(year, month).diaryLength;
      var diaryContent = []; //用于存储待填充的具体内容
      if (diaryList != 0) { //有请求到数据的时候
        for (var i = 0; i < diaryLength; i++) {
          diaryContent[i] = [];
          var nowTime = diaryTimeObj[i].fulldate;
          for (var j = 0; j < diaryList.length; j++) {
            if (diaryList[j].ctime.slice(0, 8) == nowTime) {
              diaryContent[i].push(diaryList[j]);
            }
          }
        }
      }
      return diaryContent;
    }

    //处理请求到的数据
    function treatData(js, dy) {
      var diaryList = []; //用于存储所有要填进去列表的数据，包括订阅和记事；
      var jsList = []; //用于存储记事
      if ($(js)[0].errorCode == 0) {
        var jsArr = $(js)[0].data;
        for (var i = 0; i < jsArr.length; i++) {
          var ctime = getFullDate(jsArr[i].ctime * 1000);
          var clockDate;
          var clock = jsArr[i].clock;
          var subtitle = jsArr[i].subtitle;
          var subcontent = jsArr[i].content;
          var pid = jsArr[i].pid;
          var codename = jsArr[i].codename;
          var code = jsArr[i].code;
          var clockDate; //提醒时间
          if (clock == 0) { //没有闹钟提醒的时候
            clockDate = 0;
            jsList.push({
              flag: 1,
              ctime: ctime,
              clockDate: clockDate,
              subtitle: subtitle,
              subcontent: subcontent,
              pid: pid,
              codename: codename,
              code:code
            });
          } else {
            clockDate = getFullDate(clock * 1000);
            ctime=clockDate;
            jsList.push({
              flag: 3,
              ctime: ctime,
              clockDate: clockDate,
              subtitle: subtitle,
              subcontent: subcontent,
              pid: pid,
              codename: codename,
              code:code
            });
          }
        }
      }
      diaryList = jsList;
      if (dy && $(dy)[0] && $(dy)[0].status == 0 && $(dy)[0].data.total != 0) {
        var dylength = $(dy)[0].data.total;
        var dyKeys = $(dy)[0].data.wd; //用于存储订阅的关键字
        var nowYear = getDomainTime().nowYear;
        var nowMonth = getDomainTime().nowMonth;
        var nowDay = getDomainTime().nowDay;
        var ctime = '' + nowYear + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + (nowDay < 10 ? '0' + nowDay : nowDay) + '000000';
        if (dyKeys.length == 3) {
          dyKeys = dyKeys[0] + ',' + dyKeys[1];
        } else {
          dyKeys = dyKeys.join(',');
        }
        diaryList.push({
          flag: 2,
          ctime: ctime,
          keys: dyKeys,
          length: dylength
        });
      }
      dateSort(diaryList);
      tipList = jsList;
      return diaryList;
    }

    //创建单元格填充内容
    function innerTdContent(diaryObj, diaryContent) {
      var diaryTime = diaryObj.diaryTime; //完整的日期 年月日星期
      var diaryLength = diaryObj.diaryLength; //日历中的天数
      var tdContent = []; //单元格填充的内容数组
      var nowYear = getDomainTime().nowYear;
      var nowMonth = getDomainTime().nowMonth;
      var nowDay = getDomainTime().nowDay;
      var nowDate = '' + nowYear + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + (nowDay < 10 ? '0' + nowDay : nowDay);
      for (var i = 0; i < diaryLength; i++) {
        var tdHtml = '';
        var fulldate = diaryTime[i].fulldate; //20131115
        var weekDay = diaryTime[i].weekDay; //星期几
        var dateOnly = diaryTime[i].dateOnly; //几号
        if (fulldate == nowDate) {
          tdHtml += '<td class="selected" date="' + fulldate + '"weekday=' + weekDay + '><div class="td-inner"><div class="td-height"><div class="date-num">' + dateOnly + '<a href="###" class="add-note"><s class="add-icon"></s>添加记事</a></div>';
        } else {
          tdHtml += '<td date="' + fulldate + '"weekday=' + weekDay + '><div class="td-inner"><div class="td-inner"><div class="date-num">' + dateOnly + '<a href="###" class="add-note"><s class="add-icon"></s>添加记事</a></div>';
        }
        if (diaryContent.length != 0) { //有请求道数据的时候填充数据否则只填充td
          if (diaryContent[i].length != 0) { //有内容
            tdHtml += '<ul>';
            var clockList = '',
              jsList = '',
              dyList = '';
            for (var k = 0; k < diaryContent[i].length; k++) {
              if (diaryContent[i][k].flag == 1) {
                jsList += '<li pid="' + diaryContent[i][k].pid + '" flag="' + diaryContent[i][k].flag + '"><p class="tip-js"><a href="###" class="lineb">' + mCutStr(diaryContent[i][k].subtitle, 30) + '</a></p></li>';
              } else if (diaryContent[i][k].flag == 3) {
                clockList += '<li pid="' + diaryContent[i][k].pid + '" flag="' + diaryContent[i][k].flag + '"><p class="tip-warning"><s class="clock-icon"></s><a href="###" class="lineb">' + mCutStr(diaryContent[i][k].subtitle, 26) + '</a></p></li>';
              } else if (diaryContent[i][k].flag == 2) {
                var text = diaryContent[i][k].keys + '等共' + diaryContent[i][k].length + '条信息';
                dyList += '<li flag="' + diaryContent[i][k].flag + '"><p class="tip-zx"><a href="'+dyListUrl2+'">' + text + '</a></p></li>';
              }
            } //for
            tdHtml += clockList + jsList + dyList + '</ul>';
          } //if有数组
        }
        tdHtml += '</div></div></td>';
        tdContent.push(tdHtml);
      } //for
      return tdContent;
    }

    //创建日历
    function createDiary(currentYear, currentMonth, diaryList) {
      var diaryObj = sortDiary(currentYear, currentMonth);
      var diaryContent = sortDiaryContent(currentYear, currentMonth, diaryList);
      var tdContent = innerTdContent(diaryObj, diaryContent);
      var diaryLength = diaryObj.diaryLength;
      var arrDate = diaryObj.diaryTime;
      var lastDays = diaryObj.lastDays;
      var countNowDays = diaryObj.countNowDays;
      noteBody.html('');
      var weekLength = diaryLength / 7; //日历里面包括几个星期
      var noteTable = '<table>';
      var l = 0; //用于数组的遍历
      for (var i = 0; i < weekLength; i++) {
        noteTable += '<tr>';
        for (var n = 0; n < 7; n++) {
          noteTable += tdContent[l];
          l++;
        }
        noteTable += '</tr>';
      }
      noteTable += '</table>';
      noteBody.html(noteTable);
      $("#noteBody td").slice(0, lastDays).addClass('other-month'); //上个月添加特殊的样式
      $("#noteBody td").slice(lastDays + countNowDays).addClass('other-month'); //下个月添加特殊的样式
      $("#noteBody tr").each(function() {
        $(this).find("td").eq(0).addClass('bg-date');
        $(this).find("td").eq(6).addClass('bg-date');
      });
      //处理蓝框框 
      var tdHeight = $(".selected").height();
      $(".selected .td-height").css("height", tdHeight - 2);
      if ($("#jsShow").hasClass('cur')) {
        $(".tip-zx").parents('li').hide();
      }
    }


    /*
     *operateDiary用于日期年月操作
     */

    function operateDate(diaryList) {
      $("#date-pre").live('click', function() {
        if (IS == false) {
          return;
        } else {
          var currentMonth = parseInt(monthBt.attr('month'));
          var currentYear = parseInt(yearBt.attr('year'));
          var dateObj = countLastDate(currentYear, currentMonth);
          setSelectYear(dateObj.year);
          setSelectMonth(dateObj.month);
          createDiary(dateObj.year, dateObj.month, diaryList);
        }
      });

      $("#date-next").live('click', function() {
        if (IS == false) {
          return;
        } else {
          var currentMonth = parseInt(monthBt.attr('month'));
          var currentYear = parseInt(yearBt.attr('year'));
          var dateObj = countNextDate(currentYear, currentMonth);
          setSelectYear(dateObj.year);
          setSelectMonth(dateObj.month);
          createDiary(dateObj.year, dateObj.month, diaryList);
        }
      });

      $("#month-select ul li").live('click', function() {
        if (IS == false) {
          return;
        } else {
          var currentYear = parseInt(yearBt.attr('year'));
          var currentMonth = parseInt($(this).attr('month'));
          genSelectMonth(currentMonth);
          monthSelect.hide();
          setSelectMonth(currentMonth);
          createDiary(currentYear, currentMonth, diaryList);
        }
      });

      $("#year-select ul li").live('click', function() {
        if (IS == false) {
          return;
        } else {
          var currentYear = parseInt($(this).attr('year'));
          var currentMonth = parseInt(monthBt.attr('month'));
          genSelectYear(currentYear);
          yearSelect.hide();
          setSelectYear(currentYear);
          createDiary(currentYear, currentMonth, diaryList);
        }
      });

      $("#todayBt").live('click', function() {
        if (IS == false) {
          return;
        } else {
          if (getMonth() == getDomainTime().nowMonth && getYear() == getDomainTime().nowYear) {
            return;
          } else {
            var nowMonth = getDomainTime().nowMonth;
            var nowYear = getDomainTime().nowYear;
            setSelectYear(nowYear);
            setSelectMonth(nowMonth);
            createDiary(nowYear, nowMonth, diaryList);
          }
        }
      });
    }

    /*
     *渲染的函数
     */
    var renderFunc = function(nowYear, nowMonth) {
      //没有数据的时候或者有任何请求出错的时候先出现日历
      var diaryList = [];
      setSelectYear(nowYear);
      setSelectMonth(nowMonth);
      createDiary(nowYear, nowMonth, diaryList);
      //页面刚进入的时候渲染
      if (IS == true) {
        IS = false;
        var jsKey = false,
          dyKey = false,
          js = {}, dy = {};
        $.ajax({
          url: urlMap.jsUrl,
          data: {
            order: 'display_date desc'
          },
          type: 'get',
          dataType: 'json',
          success: function(data) {
            js = data;
          },
          complete: function() {
            jsKey = true;
            if (dyKey) {
              var diaryList = treatData(js, dy);
              createDiary(nowYear, nowMonth, diaryList);
              IS = true;
              operateDate(diaryList);
            }
          }
        });
        //判断是否是本年本月，若是本年本月则不必再请求订阅部分
        if (nowYear == getDomainTime().nowYear && nowMonth == getDomainTime().nowMonth) {
          $.ajax({
            url: urlMap.dyUrl,
            type: 'get',
            dataType: 'json',
            success: function(data) {
              dy = data;
            },
            complete: function() {
              dyKey = true;
              if (jsKey) {
                var diaryList = treatData(js, dy);
                createDiary(nowYear, nowMonth, diaryList);
                IS = true;
                operateDate(diaryList);
              }
            }
          });
        } else {
          dyKey = true;
          IS = true;
          return;
        }
      }
    }

    /*
     *inita初始化函数
     */
    var initaFunc = function(){
        setSelectYear(getDomainTime().nowYear);
        setSelectMonth(getDomainTime().nowMonth);
        renderFunc(getDomainTime().nowYear, getDomainTime().nowMonth);
     }
    /*
     *以下是具体各项操作
     *初始化,为各个链接添加自定义codename和code属性
     *查看记事
     *修改记事
     *添加记事
     *删除记事
     */

    /*
     *1、初始化
     *2、为各个链接添加自定义codename和code属性
     */
    operateDiary.inita(initaFunc);

    var autoCode = getUrlParam('code');
    var autoCodeName = getUrlParam('codename');
    var manageUrl = $(".set-ul a").eq(0).attr('href') + '?code=' + autoCode + '&codename=' + autoCodeName; //设置记事管理地址
    var listUrl = $(".set-ul a").eq(1).attr('href') + '?code=' + autoCode + '&codename=' + autoCodeName; //设置记事列表的链接地址
    var dyListUrl = 'http://blog.10jqka.com.cn/diary/subscribe.html?&code='+autoCode+'&codename='+autoCodeName;
    var dyListUrl2 = 'http://blog.10jqka.com.cn/diary/ck-subscribe.html?&code='+autoCode+'&codename='+autoCodeName;
    $(".set-ul a").eq(0).attr('href', manageUrl);
    $(".set-ul a").eq(1).attr('href', listUrl);
    $(".dy-bt").attr('href',dyListUrl);


    /*
     *查看记事
     */
    $(".td-inner ul li").live('click', function() {
      if ($(this).attr('flag') == 1 || $(this).attr('flag') == 3) {
        $("#mask_iframe,#show_box").show();
        var pid = $(this).attr('pid');
        operateDiary.show(pid);
      }
    });

    /*
     *修改记事
     *1、通过修改框里面的修改按钮修改
     *2、通过详情框框里面的修改按钮去修改
     *3、保存修改记事
     */

    $("#editBtn").live('click', function() {
      var pid = $('#pidVal').val();
      var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
       operateDiary.showEditBox(currentUrl);
    });

    $("#xqEdit").live('click', function() {
      var pid = $('#xqPid').val();
      var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
      operateDiary.showEditBox(currentUrl);
    });

    $("#edit_saveBtn").click(function() {
      var editdata = editData($(this));
      operateDiary.edit(editdata,renderFunc,getYear(),getMonth());
    });

    /*
     *添加记事
     *1、通过每一个项目里面的添加记事按钮（列表或表格）去添加记事
     *2、保存添加的记事
     */    

    $('.add-note').live('click', function() {
      setAddData(); //填充内容设置为0
      $("#add_box,#mask_iframe").show();
      var date = $(this).parents('td').attr('date');
      var display_date = setDispaly_date(date);
      $("#add_box .wdate_picker_date").val(display_date);
    });

    $("#add_saveBtn").click(function() {
      var adddata = addData($(this));
      operateDiary.add(adddata,renderFunc,getYear(),getMonth());
    });

    /*
     *删除记事
     *1、通过删除查看记事框框的删除按钮删除记事
     *2、通过详情框框的删除按钮删除记事
     *2、保存添加的记事
     */  

    $("#deleteBtn").click(function() {
      var pid = $(this).parents(".note-pop").find("#pidVal").val();
      operateDiary.deleteIf(pid,renderFunc,getYear(),getMonth());
    });

    $("#xqDelete").click(function() {
      var pid = $("#xqPid").val();
      operateDiary.deleteIf(pid,renderFunc,getYear(),getMonth());
    });


     /*
     *详情框框渲染
     */  
    // $('#noteBody').delegate('li', 'mouseenter', function(e) {
    //   var tipObj = {};
    //   var tipPid = $(this).attr('pid');
    //   var flag = $(this).attr('flag');
    //   if ($(this).attr('flag') == 1 || $(this).attr('flag') == 3) {
    //     for (var i = 0; i < tipList.length; i++) {
    //       if (tipList[i].pid == tipPid) {
    //         var tipTitle = tipList[i].subtitle,
    //           tipContent = tipList[i].subcontent,
    //           tipCodename = tipList[i].codename,
    //           tipCode = tipList[i].code,
    //           tipClockText,
    //           tipClockTime = tipList[i].clockDate;
    //         if (tipClockTime == 0) {
    //           tipClockText = '无';
    //         } else {
    //           var tipYear = tipClockTime.slice(0, 4);
    //           var tipMonth = tipClockTime.slice(4, 6);
    //           var tipDate = tipClockTime.slice(6, 8);
    //           var tipHour = tipClockTime.slice(8, 10);
    //           var tipMin = tipClockTime.slice(10, 12);
    //           var tipSec = tipClockTime.slice(12);
    //           tipClockText = tipYear + '-' + tipMonth + '-' + tipDate + ' ' + tipHour + ':' + tipMin + ':' + tipSec;
    //         }
    //       }
    //     }
    //     tipObj.tipPid = tipPid;
    //     tipObj.tipContent = tipContent;
    //     tipObj.tipTitle = tipTitle;
    //     tipObj.tipClockText = tipClockText;
    //     tipObj.tipCodename = tipCodename;
    //     tipObj.tipCode = tipCode;
    //     showTip($(this), tipObj);
    //   }
    // })

    // $('#noteBody').delegate('li', 'mouseleave', function(e) {
    //   if (!$('.xq-box')[0].contains(e.relatedTarget)) {
    //     $('.xq-box').hide();
    //   };
    // })

    // $('.xq-box').bind('mouseleave', function() {
    //   $(this).hide();
    // })

    // function showTip(el, tipObj) {
    //   var tipPid = tipObj.tipPid,
    //     tipContent = tipObj.tipContent,
    //     tipTitle = tipObj.tipTitle,
    //     tipClockText = tipObj.tipClockText,
    //     tipCode = tipObj.tipCode;
    //   $("#xqPid").val(tipPid);
    //   $(".xq-box .tip-title").html(tipTitle);
    //   $(".xq-box .tip-content").html(mCutStr(tipContent, 101));
    //   if (tipClockText == '无') {
    //     $(".xq-box .xq-time").hide();
    //   } else {
    //     $(".xq-box .xq-time").show().text('提醒时间：' + tipClockText);
    //   }
    //   //从客户端取codename
    //   var thsQuote = external.createObject('Quote');
    //   var reqObj = {
    //     code : tipCode,
    //     type : 'zqmc,new',
    //     onready: function(){
    //       var param = {
    //         code : tipCode,
    //         type : 'zqmc'
    //       };
    //       var retObj = thsQuote.getData(param);
    //       var codenameNew;
    //       if(tipCode == ''){
    //         codenameNew = '';
    //       }else{
    //         codenameNew = getEvalJson(retObj)[tipCode]['zqmc'];
    //       }
    //       if (codenameNew == '') {
    //         $(".xq-box .tip-codename").hide();
    //       } else {
    //         $(".xq-box .tip-codename").show().html('相关股票：<span>' + codenameNew + '</span>');
    //       }
    //     }
    //   };
    //   var flag = thsQuote.request(reqObj);

    //   var left = $(el).position().left;
    //   var top = $(el).position().top;
    //   var parentWidth = $('#noteBody').width();
    //   var elWidth = $(el).width();
    //   var targetLeft;
    //   if (left > parentWidth / 2) {
    //     targetLeft = left - $('.xq-box').outerWidth();
    //     $('.xq-box').find('.point').css({
    //       left: $('.xq-box').outerWidth() - 2,
    //       background: 'url(images/point-r.png)'
    //     })
    //   } else {
    //     targetLeft = left + elWidth;
    //     $('.xq-box').find('.point').css({
    //       left: -9,
    //       background: 'url(http://i.thsi.cn/images/blog/diary/point.png)'
    //     })
    //   }
    //   var targetHeight = $(".xq-box").height();
    //   $('.xq-box').css({
    //     left: targetLeft,
    //     top: top - targetHeight / 2 + $(el).height() / 2
    //   }).show();
    // }
    /*
     *详情框框渲染
     */  
    $('#noteBody').delegate('li', 'mouseenter', function(e) {
      var tipObj = {};
      var tipPid = $(this).attr('pid');
      var flag = $(this).attr('flag');
      if ($(this).attr('flag') == 1 || $(this).attr('flag') == 3) {
        for (var i = 0; i < tipList.length; i++) {
          if (tipList[i].pid == tipPid) {
            var tipTitle = tipList[i].subtitle,
              tipContent = tipList[i].subcontent,
              tipCodename = tipList[i].codename,
              tipCode = tipList[i].code,
              tipClockText,
              tipClockTime = tipList[i].clockDate;
            if (tipClockTime == 0) {
              tipClockText = '无';
            } else {
              var tipYear = tipClockTime.slice(0, 4);
              var tipMonth = tipClockTime.slice(4, 6);
              var tipDate = tipClockTime.slice(6, 8);
              var tipHour = tipClockTime.slice(8, 10);
              var tipMin = tipClockTime.slice(10, 12);
              var tipSec = tipClockTime.slice(12);
              tipClockText = tipYear + '-' + tipMonth + '-' + tipDate + ' ' + tipHour + ':' + tipMin + ':' + tipSec;
            }
          }
        }
        tipObj.tipPid = tipPid;
        tipObj.tipContent = tipContent;
        tipObj.tipTitle = tipTitle;
        tipObj.tipClockText = tipClockText;
        tipObj.tipCodename = tipCodename;
        tipObj.tipCode = tipCode;
        showTip($(this), tipObj);
      }
    })

    $('#noteBody').delegate('li', 'mouseleave', function(e) {
      if (!$('.xq-box')[0].contains(e.relatedTarget)) {
        $('.xq-box').hide();
      };
    })

    $('.xq-box').bind('mouseleave', function() {
      $(this).hide();
    })

    function showTip(el, tipObj) {
      var tipPid = tipObj.tipPid,
        tipContent = tipObj.tipContent,
        tipTitle = tipObj.tipTitle,
        tipClockText = tipObj.tipClockText,
        tipCode = tipObj.tipCode,
        tipCodename = tipObj.tipCodename;
        tipCodename = getKHDCodename(tipCode,tipCodename);
      $("#xqPid").val(tipPid);
      $(".xq-box .tip-title").html(tipTitle);
      $(".xq-box .tip-content").html(mCutStr(tipContent, 101));
      if (tipCodename == '') {
        $(".xq-box .tip-codename").hide();
      } else {
        $(".xq-box .tip-codename").show().html('相关股票：<span>' + tipCodename + '</span>');
      }
      if (tipClockText == '无') {
        $(".xq-box .xq-time").hide();
      } else {
        $(".xq-box .xq-time").show().text('提醒时间：' + tipClockText);
      }
      var left = $(el).position().left;
      var top = $(el).position().top;
      var parentWidth = $('#noteBody').width();
      var elWidth = $(el).width();
      var targetLeft;
      if (left > parentWidth / 2) {
        targetLeft = left - $('.xq-box').outerWidth();
        $('.xq-box').find('.point').css({
          left: $('.xq-box').outerWidth() - 2,
          background: 'url(images/point-r.png)'
        })
      } else {
        targetLeft = left + elWidth;
        $('.xq-box').find('.point').css({
          left: -9,
          background: 'url(http://i.thsi.cn/images/blog/diary/point.png)'
        })
      }
      var targetHeight = $(".xq-box").height();
      $('.xq-box').css({
        left: targetLeft,
        top: top - targetHeight / 2 + $(el).height() / 2
      }).show();
    }
  })