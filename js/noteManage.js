//@charset "utf-8"
$(function() {
    var IS = true;
    //数据分页
    function setListPage(noteList, pageLength) {
        var ListLength = noteList.length;
        var pageCount; //总页数
        var pageList = []; //每一页的列表，二维数组
        var l = 0; //用于遍历所有日记
        pageLength = pageLength || 20;
        if (ListLength % pageLength != 0) {
            pageCount = (ListLength - ListLength % pageLength) / pageLength + 1;
        } else {
            pageCount = ListLength / pageLength;
        }
        for (var i = 0; i < pageCount; i++) {
            pageList[i] = [];
            for (var k = 0; k < pageLength; k++) {
                if (l < ListLength) {
                    pageList[i].push(noteList[l]);
                    l++;
                }
            }
        }
        return pageList;
    }

    //填充列表
    function genNoteList(noteList, page, pageLength) {
        pageLength = pageLength || 20;
        var pageList = setListPage(noteList, pageLength);
        var pageCount = pageList.length;
        //var pageCount = 0;
        // 当noteList 为空的时候
        if (pageCount == 0) {
            $("#noteList").html("");
            return;
        }
        $("#noteList").html("");
        var noteBody = '';
        var onlyList; //每一页显示的行数
        if (0 < page && page < pageCount) {
            onlyList = pageLength;
        } else if (page == pageCount) {
            onlyList = pageList[page - 1].length;
        }
        for (var i = 0; i < onlyList; i++) {
            var clock; //有无提醒
            if (pageList[page - 1][i].clockDate == 0) {
                clock = '无';
            } else {
                clock = getFullTime(pageList[page - 1][i].clockDate).timeDate;
            }
            noteBody += '<tr pid=' + pageList[page - 1][i].pid + '>';
            noteBody += '<td><input class="delete-input" type="checkbox"></td>';
            noteBody += '<td>' + getFullTime(pageList[page - 1][i].ctime).timeDate + '</td>';
            noteBody += '<td style="text-align:left;padding-left:20px;">' + mCutStr(pageList[page - 1][i].subtitle, 20) + '</td>';
            noteBody += '<td>' + pageList[page - 1][i].codename + '</td>';
            noteBody += '<td style="text-align:left;padding-left:20px;">' + mCutStr(pageList[page - 1][i].subcontent, 40) + '</td>';
            noteBody += '<td>' + clock + '</td>';
            noteBody += '<td><a href="###" class="show_note">查看</a><a href="###" class="edit_note">编辑</a><a href="###" class="delete_note">删除</a></td>';
            noteBody += '</tr>';
        }
        noteBody += '<tr class="tr-manage"><td><input type="checkbox" id="deleteAllInput"/></td><td colspan="3" style="text-align:left"><a href="###" id="deleteAll">删除所选</a></td><td colspan="3" style="text-align:right"><div class="page"><span class="currentpage"><span id="currentPage">' + page + '</span>/<span id="pageCount">' + pageCount + '</span>页</span><span id="prePageNo">上一页</span><a class="sli-blue" href="###" id="prePage">上一页</a><a class="sli-blue" href="###" id="nextPage">下一页</a><span id="nextPageNo">下一页</span><input id="jumpTo" class="jump-input" type="text" /><a class="sli-blue" href="###" id="jumpBt">跳转</a></div></td></tr>';
        $("#noteList").html(noteBody);
        //处理分页默认的上一页下一页问题
        var currentpage = $("#currentPage").text();
        if(currentpage == 1 && pageCount == 1){//不可上不可下
            $("#prePage,#nextPage").hide();
            $("#prePageNo,#nextPageNo").show();
        }else if(currentpage>1 && currentpage<pageCount){//可上可下
            $("#prePage,#nextPage").show();
            $("#prePageNo,#nextPageNo").hide();
        }else if(currentpage>1 && currentpage == pageCount){//可上不可下
            $("#prePage,#nextPageNo").show();
            $("#prePageNo,#nextPage").hide();
        }else if(currentpage == 1 && currentpage<pageCount){//可下不可上
            $("#prePageNo,#nextPage").show();
            $("#prePage,#nextPageNo").hide();
        }
    }

    //处理数据
    function treatData(data) {
        var noteList = []; //用于填充请求的全部数据
        var clockDate;
        if ($(data)[0].errorCode == 0) {
            var jsArr = $(data)[0].data;
            for (var i = 0; i < jsArr.length; i++) {
                if (jsArr[i].clock == '0') {
                    clockDate = 0;
                } else {
                    clockDate = getFullDate(jsArr[i].clock * 1000);
                }
                var ctime = getFullDate(jsArr[i].ctime * 1000);
                var subtitle = jsArr[i].subtitle;
                var subcontent = jsArr[i].content;
                var pid = jsArr[i].pid;
                var codename = jsArr[i].codename;
                noteList.push({
                    flag: 1,
                    ctime: ctime,
                    clockDate: clockDate,
                    subtitle: subtitle,
                    subcontent: subcontent,
                    pid: pid,
                    codename: codename
                });
            }
        }
        dateSort(noteList);
        return noteList;
    }

    //处理筛选数据的函数
    function treatFilter(newDate, codenow, clocknow, searchStr, noteList) {
        var dateList = [];
        var codeList = [];
        var clockList = [];
        var newList = [];
        //日期筛选
        if (newDate == '所有日期' || newDate == '') {
            dateList = noteList;
        } else {
            for (var i = 0; i < noteList.length; i++) {
                if (noteList[i].ctime.slice(0, 8) == newDate) {
                    dateList.push(noteList[i]);
                }
            }
        }
        //股票筛选
        if (codenow == '全部股票') {
            codeList = dateList;
        } else {
            for (var i = 0; i < dateList.length; i++) {
                if (dateList[i].codename == codenow) {
                    codeList.push(dateList[i]);
                }
            }
        }
        //闹钟筛选
        if (clocknow == '无提醒') {
            for (var i = 0; i < codeList.length; i++) {
                if (codeList[i].clockDate == 0) {
                    clockList.push(codeList[i]);
                }
            }
        } else if (clocknow == '有提醒') {
            for (var i = 0; i < codeList.length; i++) {
                if (codeList[i].clockDate != 0) {
                    clockList.push(codeList[i]);
                }
            }
        } else {
            clockList = codeList;
        }
        //字符串筛选
        if (searchStr == '') {
            newList = clockList;
        } else {
            var reg = new RegExp(searchStr, 'ig'); //不区分大小写全局验证
            for (var i = 0; i < clockList.length; i++) {
                if (reg.test(clockList[i].subtitle) || reg.test(clockList[i].subcontent) || reg.test(clockList[i].codename)) {
                    newList.push(clockList[i]);
                }
            }
        }
        genPageList(1, newList);
    }


    //分页请求后的数据渲染
    function genPageList(page, noteList) {
        var pageLength = 20;
        genNoteList(noteList, page, pageLength);
    }

    //创建动态相关股票列表
    function createGpList(noteList) {
        var noteListLen = noteList.length;
        var codeArr = [];
        for (var k = 0; k < noteListLen; k++) {
            if (noteList[k].codename.length != 0) {
                codeArr.push(noteList[k].codename);
            }
        }
        codeArr = unique(codeArr);
        $("#gpSelect").html('');
        $("#gpSelect").append('<option>全部股票</option>');
        for (var i = 0; i < codeArr.length; i++) {
            $("#gpSelect").append('<option>' + codeArr[i] + '</option>');
        }
        $("#gpSelect").val(klinecode);
    }

    //筛选数据
    function filterDate(noteList) {
        //日期
        $("#dateFilter").live('click', function() {
            WdatePicker({
                onpicking: function(dp) {
                    var date = dp.cal.getNewDateStr();
                    var newDate = dp.cal.getNewDateStr().replace(/-/g, '');
                    var codenow = $("#gpSelect").val();
                    var clocknow = $("#clockSelect").val();
                    var searchStr = $("#searchStr").val();
                    treatFilter(newDate, codenow, clocknow, searchStr, noteList);
                },
                onclearing: function() { //清空的时候
                    var newDate = '';
                    var codenow = $("#gpSelect").val();
                    var clocknow = $("#clockSelect").val();
                    var searchStr = $("#searchStr").val();
                    $("#dateFilter").val('所有日期');
                    treatFilter(newDate, codenow, clocknow, searchStr, noteList);
                }
            });
        });
        //股票
        $("#gpSelect").live('change', function() {
            var newDate = $("#dateFilter").val();
            if (newDate != '所有日期') {
                newDate = newDate.replace(/-/g, '');
            }
            var codenow = $(this).val();
            var clocknow = $("#clockSelect").val();
            var searchStr = $("#searchStr").val();
            treatFilter(newDate, codenow, clocknow, searchStr, noteList);
        });
        //闹钟
        $("#clockSelect").live('change', function() {
            var newDate = $("#dateFilter").val();
            if (newDate != '所有日期') {
                newDate = newDate.replace(/-/g, '');
            }
            var codenow = $("#gpSelect").val();
            var clocknow = $(this).val();
            var searchStr = $("#searchStr").val();
            treatFilter(newDate, codenow, clocknow, searchStr, noteList);
        });
        //字符串搜索
        $("#searchBtn").live('click', function() {
            var newDate = $("#dateFilter").val();
            if (newDate != '所有日期') {
                newDate = newDate.replace(/-/g, '');
            }
            var codenow = $("#gpSelect").val();
            var clocknow = $("#clockSelect").val();
            var searchStr = $("#searchStr").val();
            treatFilter(newDate, codenow, clocknow, searchStr, noteList);
            $("#searchStr").val('');
        });
        //enter键搜索
        $("#searchStr").keydown(function(event){
             if(event.keyCode==13){
                $(this).blur();
                $("#searchBtn").trigger('click');
             }
        });
        //清空
        $("#empty").click(function(){
            $("#dateFilter").val('所有日期');
            $("#gpSelect").val('全部股票');
            $("#clockSelect").val('全部提醒');
            $("#searchStr").val('');
            treatFilter('所有日期', '全部股票', '全部提醒', '', noteList);
        })
    }

    //翻页
    function turnPage(noteList) {
        $("#prePage").live('click', function() {
            var currentPage = parseInt($("#currentPage").text());
            var pageLen = parseInt($("#pageCount").text());
            if (currentPage - 1 < 1) {
                tipBox('超出页码范围');
                return;
            } else {
                genPageList(currentPage - 1, noteList);
            }
        });

        $("#nextPage").live('click', function() {
            var currentPage = parseInt($("#currentPage").text());
            var pageLen = parseInt($("#pageCount").text());
            if (currentPage + 1 > pageLen) {
                tipBox('超出页码范围');
                return;
            } else {
                genPageList(currentPage + 1, noteList);
            }
        });

        $("#jumpBt").live('click', function() {
            var currentPage = parseInt($("#currentPage").text());
            var toPage = parseInt($("#jumpTo").val());
            var pageLen = parseInt($("#pageCount").text());
            $("#jumpTo").val('');
            if(currentPage == toPage || isNaN(toPage)){
                return;
            } else if (toPage > pageLen || toPage < 1) {
                tipBox('超出页码范围');
                return;
            } else {
                genPageList(toPage, noteList);
            }
        });
    }

    //页面的渲染函数
    function render(page) {
        if (IS == true) {
            IS = false;
            $.getJSON(jsUrl, {
                order: 'display_date desc'
            }, function(data) {
                var noteList = treatData(data);
                createGpList(noteList);
                treatFilter('所有日期', klinecode, '全部提醒', '', noteList);
                IS = true
                filterDate(noteList);
                turnPage(noteList);
            });
        }
    }
    /*
     *inita初始化
     *edit编辑后的操作
     *add添加记事的操作
     *deleteIf删除记事的操作
     */
    var operateDiary = {
        inita: function() {
            render(1);
        },
        edit: function(editdata) {
            if (editdata['title'] == '') {
                promptFun('标题不可为空');
                $(this).parents(".note-pop").find('.subtitle_edit').focus();
                return false;
            }
            if (editor.hasContents() == false) {
                promptFun('内容不可以为空');
                $(this).parents(".note-pop").find('.news_content_edit').focus();
                return false;
            }
            $("#edit_box,#mask_iframe").hide();
            $.ajax({
                url: urlMap.save,
                data: editdata,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    var errcode = data.errorCode,
                        errmsg = data.errorMsg;
                    if (errcode == 0) {
                        tipBox('修改成功！');
                        $.getJSON(jsUrl, {
                            order: 'display_date desc'
                        }, function(data) {
                            var noteList = treatData(data);
                            genPageList(getCurrentPage(), noteList);
                            createGpList(noteList);
                            filterDate(noteList);
                        });
                    } else {
                        //alert('success'+errmsg);
                        tipBox("修改记事失败！");
                    }
                },
                error: function(x, status) {
                    tipBox("修改记事失败！");
                    //alert('error' + ' :' + status);
                }
            });
        },
        deleteIf: function(pid) {
            $("#delete_box,#mask_iframe").show();
            var deleteUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=deletepost&userid=' + userid + '&&pid=' + pid + '&type=jsonp&callback=?';
            $("#deleteYes").click(function() {
                $("#delete_box,#show_box").hide();
                $.getJSON(deleteUrl, function(deletemes) {
                    if (deletemes.errorCode == 0) {
                        tipBox('删除记事成功！');
                        render(getCurrentPage());
                    } else {
                        tipBox('删除记事失败！');
                    }
                });
            });
            $("#deleteNo").click(function() {
                $("#delete_box,#mask_iframe").hide();
            });
        }
    }


    /*
     *以下是具体各项操作
     *初始化,为各个链接添加自定义codename和code属性
     *查看记事
     *修改记事
     *删除记事
     */

    /*
     *1、初始化
     *2、为各个链接添加自定义codename和code属性
     */
    render(1);

    var autoCode = getUrlParam('code');
    var autoCodeName = getUrlParam('codename');
    var diaryUrl = 'http://blog.10jqka.com.cn/diary/index.html?code=' + autoCode + '&codename=' +autoCodeName; //设置日历视图链接地址 
    $(".subs-return").eq(0).attr('href', diaryUrl);

    /*
     *查看记事
     */

    $(".show_note").live('click', function() {
        $("#show_box,#mask_iframe").show();
        var pid = $(this).parents('tr').attr('pid');
        showNewsAjax(pid);
    });

    /*
     *修改记事
     *1、通过列表的修改记事按钮去修改
     *2、通过show_box框框的修改记事按钮去修改
     *3、修改以后的保存
    **/

    $(".edit_note").live('click', function() {
        var pid = $(this).parents('tr').attr('pid');
        var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
        $.getJSON(currentUrl, function(data) {
            $(".mask,#edit_box,#mask_iframe").show();
            editNews(data, currentUrl);
        });
    });

    $("#editBtn").live('click', function() {
        $("#show_box").hide();
        var pid = $('#pidVal').val();
        var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
        $.getJSON(currentUrl, function(data) {
            $("#edit_box,#mask_iframe").show();
            editNews(data, currentUrl);
        });
    });

    $("#edit_saveBtn").click(function() {
        var editdata = editData($(this));
        operateDiary.edit(editdata);
    });


    /*
     *删除记事
     *1、通过列表的删除记事按钮去删除
     *2、通过show_box框框的删除记事按钮去删除
     *3、多项删除
    **/

    $(".delete_note").live('click', function() {
        var pid = $(this).parents('tr').attr('pid');
        operateDiary.deleteIf(pid);
    });

    $("#deleteBtn").click(function() {
        var pid = $(this).parents(".note-pop").find("#pidVal").val();
        operateDiary.deleteIf(pid);
    });

    //全选
    $("#deleteAllInput").live('click', function() {
        if ($(this).attr('checked') == 'checked') {
            $(".delete-input").attr('checked', true);
        } else {
            $(".delete-input").attr('checked', false);
        }
    });

    //全部删除
    $("#deleteAll").live('click', function() {
        var pidTr = $("#noteList tr");
        var pidLen = pidTr.length - 1;
        var pidStr = '';
        var deleteNum = 0;
        for (var i = 0; i < pidLen; i++) {
            if (pidTr.eq(i).find('.delete-input').attr('checked') == 'checked') {
                pidStr += pidTr.eq(i).attr('pid') + '|';
                deleteNum++;
            }
        }
        if (deleteNum == 0) {
            tipBox('您尚未选择任何记事！');
            return;
        } else {
            pidStr = pidStr.substring(0, pidStr.length - 1);
            operateDiary.deleteIf(pidStr);
        }
    });
    
});