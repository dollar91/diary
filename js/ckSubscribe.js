//@charset "utf-8"
$(function () {
    (function(jQuery){
        "use strict";
        window.UEDITOR_HOME_URL = "/zscript/ueditor/";
        var $=jQuery,
            info = external.createObject("Passport"),
            userid = info.get("userid"),
            getNewsListUrlFormat = 'http://comment.10jqka.com.cn/api/subscribe.php?act=getNews&userid={userid}&jsoncallback=?',
            $newsContent = $('#newsContent'),
            $newsList = $('#newsList');
        /**
         * 返回需要的date
         * @param fmt
         * @returns {*}
         * @constructor
         */
        Date.prototype.Format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
        /**
         * 根据日期返回用户的资讯列表
         * @param userid 用户id
         */
        var getNewsList = function (userid) {
            $.getJSON(getNewsListUrlFormat.replace("{userid}",userid), function (data) {
                var htmlData = data.data, source, dateMs, date;
                var html =['<tr><th>日期</th><th>标题</th><th>来源</th></tr>'];
                for (var i = 0; i < htmlData.length; i++) {
                    if (htmlData[i].type[0] === 1) {
                        source = '个股';
                    } else if (htmlData[i].type[0] === 2) {
                        source = '概念';
                    } else if (htmlData[i].type[0] === 3) {
                        source = '行业';
                    }
                    dateMs = (htmlData[i].ctime)*1000;
                    date = new Date(dateMs).Format("yyyy-MM-dd hh:mm");
                    html.push([
                        '<tr url="' , htmlData[i].url , '">' ,
                            '<td class="cks-td1">' , date , '</td>' ,
                            '<td class="cks-td2">' , htmlData[i].title , '</td>' ,
                            '<td>' , source , '</td>' +
                        '</tr>'].join("")
                    );
                }
                $newsList.append(html.join(''));
                $newsList.find('tr:eq(1)').addClass('cks-hover');
                $newsContent.attr('src', htmlData[0].url);
            });
        };
        /**
         * 进入页面获取新闻列表
         */
        getNewsList(userid);
        /**
         * td hover加背景色
         */
        $newsList.find('tr').live('hover', function () {
            $(this).addClass('cks-hover').siblings('tr').removeClass('cks-hover');
        });
        /**
         * 点击td切换下面的iframe内容
         */
        $newsList.find('td').live('click', function () {
            var url = $(this).parents('tr').attr('url');
            $newsContent.attr('src', url);
        });
    })($||jQuery);
});