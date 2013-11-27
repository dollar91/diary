//@charset "utf-8"
$(function () {
    (function(jQuery){
        "use strict";
        var $=jQuery,
            userid = encodeURIComponent('syqiong'),
            date = '2013-11-15',
            getNewsListUrlFormat = 'http://comment.10jqka.com.cn/api/subscribe.php?act=getNews&userid={userid}&jsoncallback=?',
            $newsContent = $('#newsContent'),
            $newsList = $('#newsList');

        /**
         * 根据日期返回用户的资讯列表
         * @param userid 用户id
         * @param date 日期
         */
        var getNewsList = function (userid, date) {
            $.getJSON(getNewsListUrlFormat.replace("{userid}",userid), function (data) {
                var htmlData = data.data, source;
                var html =['<tr><th>日期</th><th>标题</th><th>来源</th></tr>'];
                for (var i = 0; i < htmlData.length; i++) {
                    if (htmlData[i].type[0] === 1) {
                        source = '个股';
                    } else if (htmlData[i].type[0] === 2) {
                        source = '概念';
                    } else if (htmlData[i].type[0] === 3) {
                        source = '行业';
                    }
                    html.push([
                        '<tr url="' , htmlData[i].url , '">' ,
                            '<td class="cks-td1">' , date , '</td>' ,
                            '<td class="cks-td2">' , htmlData[i].title , '</td>' ,
                            '<td>' , source , '</td>' +
                        '</tr>'].join("")
                    );
                }
                $newsContent.attr('src', htmlData[0].url);
                $newsList.append(html.join(''));
                $newsList.find('tr:eq(1)').addClass('cks-hover');
                //$('#newsList tr:eq(1)').addClass('cks-hover');
            });
        };
        /**
         * 进入页面获取新闻列表
         */
        getNewsList(userid, date);
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
        /**
         * 返回日记
         */
        $('#return').live('click', function(){

        });
    })($||jQuery);
});