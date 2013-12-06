//@charset "utf-8"
$(function () {
    (function (jQuery) {
        "use strict";
        window.UEDITOR_HOME_URL = "/zscript/ueditor/";
        var $=jQuery,
            info = external.createObject("Passport"),
            userId = info.get("userid"),
            stockCurPage = 1,
            stockTotalPage,
            deleteStockCode,
            updateStockCode = '',
            updateLiIndex = '',
            plateCurPage = 1,
            plateTotalPage,
            deletePlateCode,
            subscribeUrl = 'http://comment.10jqka.com.cn/api/subscribe.php',
            getListUrlFormat = subscribeUrl+'?act=getList&userid={userId}&block={block}&page={page}&jsoncallback=?',
            index_keyboardUrl = 'http://news.10jqka.com.cn/public/index_keyboard.php',
            yjzxgUrl = 'http://pop.10jqka.com.cn/getselfstockinfo.php?jsonp=?',

            $subStockList = $('#subStockList'),
            $subPlateList = $('#subPlateList'),
            $addStockBox = $('#addStockBox'),
            $addPlateBox = $('#addPlateBox'),
            $stockPageCurNum = $('#stockPageCurNum'),
            $stockPagePrev = $('#stockPagePrev'),
            $stockPageNext = $('#stockPageNext'),
            $stockPageJump = $('#stockPageJump'),
            $stockPageJumpNum = $('#stockPageJumpNum'),
            $deleteAllStock = $('#deleteAllStock'),
            $stockSet = $('#stockSet'),
            $stockExtent = $('#stockExtent'),
            $stockExtentList = $('#stockExtentList'),
            $stockExtentListInput = $('#stockExtentList input'),
            $stockExtentClose = $('#stockExtentClose'),
            $stockExtentcancel = $('#stockExtentcancel'),
            $stockExtentSure = $('#stockExtentSure'),
			$stockExtentEm = $('#stockExtentEm'),
            $platePageCurNum = $('#platePageCurNum'),
            $platePageJumpNum = $('#platePageJumpNum'),
            $plateSearch = $('#plateSearch'),
            $platePageJump = $('#platePageJump'),
            $plateSearchList = $('#plateSearchList'),
            $plateSearchInput = $('#plateSearchInput');

        /**
         * 根据block返回用户的个股或者板块列表
         * @param userId 用户id
         * @param block 模块
         * @param page 页码
         */
        var getList = function (userId, block, page) {
            $.get(getListUrlFormat.replace('{userId}',userId).replace('{block}',block).replace('{page}',page), function (data) {
                var html = [], list;
                var htmlData = data.data;
                if (block === 'stock') {
                    stockTotalPage = data.total;
                    if (stockTotalPage === 0) {
                        page = 0;
                    }
                    if (page > stockTotalPage) {
                        page = page - 1;
                        stockTurnPage(block, page);
                    } else {
                        for (var i = 0; i < htmlData.length; i++) {
                            if (htmlData[i].list === '1,2') {
                                list = '每日新闻+公告信息';
                            } else if (htmlData[i].list === '1') {
                                list = '每日新闻';
                            } else if (htmlData[i].list === '2') {
                                list = '公告信息';
                            } else {
                                list = '';
                            }
                            html.push([
                                '<li>',
                                    '<span class="sli-w1">' , htmlData[i].code , htmlData[i].name , '</span>' ,
                                    '<a class="sli-w2" href="###">' ,
                                        '<em>' , list , '</em>' ,
                                    '</a>' ,
                                    '<a class="sli-blue sli-em" href="###">取消订阅</a>' ,
                                '</li>'].join(''));
                        }
                        $subStockList.find('li:gt(1)').remove();
                        $addStockBox.after(html.join(''));
                        $stockPageCurNum.text([page , '/' , stockTotalPage , '页'].join(''));
                    }
                    if(htmlData.length > 0){
                        $deleteAllStock.show();
                    }else{
                        $deleteAllStock.hide();
                    }
                } else if (block === 'plate') {
                    plateTotalPage = data.total;
                    if (plateTotalPage === 0) {
                        page = 0;
                    }
                    if (page > plateTotalPage) {
                        page = page - 1;
                        plateTurnPage(block, page);
                    } else {
                        for (var i = 0; i < htmlData.length; i++) {
                            html.push([
                                '<li>' ,
                                    '<span class="sli-w1" code="' , htmlData[i].code , '" type="' , htmlData[i].type , '">',
                                        htmlData[i].name , 
                                    '</span>' ,
                                    '<span class="sli-w2"><em class="sli-em3">每日新闻</em></span>' ,
                                    '<a class="sli-blue sli-em" href="###">取消订阅</a>' ,
                                '</li>'].join(''));
                        }
                        $subPlateList.find('li:gt(1)').remove();
                        $addPlateBox.after(html.join(''));
                        $platePageCurNum.text([page , '/' , plateTotalPage , '页'].join(''));
                    }
                    if(htmlData.length > 0){
                        $('#deleteAllPlate').show();
                    }else{
                        $('#deleteAllPlate').hide();
                    }
                }
            }, 'json');
        };
        /**
         * 进入页面更新整个个股订阅列表
         */
        setTimeout(function(){
            getList(userId, 'stock', stockCurPage);    
        },100);
        /**
         * 进入页面更新整个个股订阅列表
         */
        setTimeout(function(){
            getList(userId, 'plate', plateCurPage);    
        },100);
        /**
         * 个股上页
         */
        $stockPagePrev.live('click', function () {
            stockCurPage = parseInt($stockPageCurNum.text().substr(0, 1));
            stockTurnPage('stock', stockCurPage - 1);
        });
        /**
         * 个股下页
         */
        $stockPageNext.live('click', function () {
            stockCurPage = parseInt($stockPageCurNum.text().substr(0, 1));
            stockTurnPage('stock', stockCurPage + 1);
        });
        /**
         * 点击跳转按钮实现个股跳转
         */
        $stockPageJump.live('click', function () {
            stockJumpPage();
        });
        /**
         * 个股跳转输入框回车实现个股跳转
         */
        $stockPageJumpNum.live('keyup', function (event) {
            if (event.keyCode == 13) {
                stockJumpPage();
            }
        });
        /**
         * 个股跳转具体实现
         */
        var stockJumpPage = function () {
            var jumpNum = $('#stockPageJumpNum').val();
            stockTurnPage('stock', jumpNum);
        }
        /**
         * 实现翻页
         * @param block 模块
         * @param turnPageNum 页码
         */
        var stockTurnPage = function (block, turnPageNum) {
            if (turnPageNum >= 1 && turnPageNum <= stockTotalPage) {
                getList(userId, block, turnPageNum);
            } else {
                return;
            }
        };
        /**
         * 点击个股取消订阅，取消自己的订阅
         */
        $subStockList.find('li:gt(1)').find('.sli-blue').live('click', function () {
            deleteStockCode = $(this).parent('li').children('.sli-w1').text().substr(0, 6);
            $.get([subscribeUrl,'?act=deleteOne&userid=' ,
                userId , '&block=stock&type=1&code=' , deleteStockCode , '&jsoncallback=?'].join(''), function (data) {
                stockCurPage = parseInt($('#stockPageCurNum').text().substr(0, 1));
                stockTurnPage('stock', stockCurPage);
            }, 'json');
        });
        /**
         * 点击个股取消全部订阅，删除所有个股订阅
         */
        $deleteAllStock.live('click', function () {
            $.get([subscribeUrl,'?act=deleteAll&userid=' , userId , '&block=stock&jsoncallback=?'].join(''), function (data) {
                stockCurPage = 1;
                stockTurnPage('stock', stockCurPage);
            }, 'json');
        });
        /**
         * 点击设置按钮，弹出订阅范围弹窗
         */
        $stockSet.click(function () {
            $stockExtent.show();
            $stockExtentListInput.attr('checked', true);
			$stockExtentEm.text('(适用全部股票)');
            updateStockCode = 'all';
        });
        /**
         * 关闭订阅范围弹窗
         */
        $stockExtentClose.click(function () {
            $stockExtent.hide();
        });
        $stockExtentcancel.click(function () {
            $stockExtent.hide();
        });
        /**
         * 订阅范围弹窗，点击保存，根据股票代码修改个股的订阅范围或者修改所有股票的订阅范围
         */
        $stockExtentSure.click(function () {
            var inputList = $stockExtentList.find('input:checkbox');//$('#stockExtentList input:checkbox');
            var inputNum = inputList.length;
            var list, stockList = [], extentList = [];
            for (var i = 0; i < inputNum; i++) {
                if (inputList.eq(i).attr('checked')) {
                    stockList.push(i + 1);
                    extentList.push($stockExtentList.find('label span').eq(i).text());
                }
            }
            list = stockList.join(',');
            if (list === '') {
                alert('订阅范围不能为空');
            } else {
                if (updateStockCode === 'all') {
                    $.get([subscribeUrl,'?act=update&userid=' , userId ,
                        '&block=stock&type=1&list=' , list , '&jsoncallback=?'].join(''), function (data) {
                        $subStockList.find('li:gt(1) .sli-w2 em').text(extentList.join('+'));
                    }, 'json');
                } else {
                    $.get([subscribeUrl,'?act=update&userid=' , userId , '&block=stock&type=1&code=' , updateStockCode , '&list=' ,
                        list , '&jsoncallback=?'].join(''), function (data) {
                        $subStockList.find('li:eq(' + updateLiIndex + ') .sli-w2 em').text(extentList.join('+'));
                    }, 'json');
                }
                $stockExtent.hide();
            }
        });
        /**
         * 点击单个个股的订阅范围，弹出订阅范围弹窗
         */
        $subStockList.find('li:gt(1) .sli-w2').live('click', function () {
            var textList = $(this).text().split('+');
            updateStockCode = $(this).parent('li').children('.sli-w1').text().substr(0, 6);
            updateLiIndex = $(this).parent('li').index();
            $stockExtentList.find('input:checkbox').attr('checked', false);
            for (var i = 0; i < textList.length; i++) {
                if (textList[i] === '每日新闻') {
                    $stockExtentList.find('input:checkbox:eq(0)').attr('checked', true);
                } else if (textList[i] === '公告信息') {
                    $stockExtentList.find('input:checkbox:eq(1)').attr('checked', true);
                }
            }
			$stockExtentEm.text('(适用单个股票)');
            $stockExtent.show();
        });
        /**
         * 新增个股
         * @param code 股票代码
         */
        var addStock = function (code) {
            if (code !== '') {
               // $stockSearchList.hide();
               // $yjzxg.hide();
               // $stockSearchList.find('dd').removeClass('sli-ddhover');
                $('#stockSearchList').hide();
                $('#yjzxg').hide();
                $('#stockSearchList').find('dd').removeClass('sli-ddhover');
                $.get([subscribeUrl,'?act=add&userid=' , userId , '&block=stock&type=1&code=' , code , '&list=1,2&jsoncallback=?'].join(''), function (data) {
                    var msg = '',
                        htmlData = data.data;
                    for (var name in htmlData) {
                        if (htmlData.hasOwnProperty(code)) {
                            msg = htmlData[name]
                        }
                    }
                    if (msg == 'OK') {
                        stockCurPage = parseInt($stockPageCurNum.text().substr(0, 1));
                        if (stockCurPage === 0) {
                            stockCurPage = 1;
                            stockTotalPage = 1;
                        }
                        stockTurnPage('stock', stockCurPage);
                        promptFun('新增成功！');
                    }
                }, 'json');
            }
        };
        /**
         * 实例化该按键精灵
         * @type {window.syq.KeySprite}
         */
        var keySprite = new window.syq.KeySprite(
            $('#stockSearch'),
            addStock,
            'http://news.10jqka.com.cn/public/index_keyboard.php',
            'true');

        /**
         * addStock点击显示keySprite
         */
        $('#addStock').click(function () {
            keySprite.show();
        });
        /**
         * 板块上页
         */
        $('#platePagePrev').live('click', function () {
            plateCurPage = parseInt($platePageCurNum.text().substr(0, 1));
            plateTurnPage('plate', plateCurPage - 1);
        });
        /**
         * 板块下页
         */
        $('#platePageNext').live('click', function () {
            plateCurPage = parseInt($platePageCurNum.text().substr(0, 1));
            plateTurnPage('plate', plateCurPage + 1);
        });
        /**
         * 板块跳转
         */
        $platePageJump.live('click', function () {
            plateJumpPage();
        });
        /**
         * 板块跳转输入框回车跳转
         */
        $platePageJumpNum.live('keyup', function (event) {
            if (event.keyCode == 13) {
                plateJumpPage();
            }
        });
        /**
         * 板块跳转实现
         */
        var plateJumpPage = function () {
            var jumpNum = $platePageJumpNum.val();
            plateTurnPage('plate', jumpNum);
        };
        /**
         * 实现翻页
         * @param block 模块
         * @param turnPageNum 页码
         */
        var plateTurnPage = function (block, turnPageNum) {
            if (turnPageNum >= 1 && turnPageNum <= plateTotalPage) {
                getList(userId, block, turnPageNum);
            } else {
                return;
            }
        };
        /**
         * 点击板块取消订阅，取消自己的订阅
         */
        $subPlateList.find('li:gt(1) .sli-blue').live('click', function(){
            deletePlateCode = $(this).parent('li').children('.sli-w1').attr('code');
            var type = $(this).parent('li').children('.sli-w1').attr('type');
            $.get([subscribeUrl,'?act=deleteOne&userid=' ,
                userId , '&block=plate&type=',type,'&code=' , deletePlateCode , '&jsoncallback=?'].join(''), function (data) {
                plateCurPage = parseInt($('#platePageCurNum').text().substr(0,1));
                plateTurnPage('plate', plateCurPage);
            }, 'json');
         });
        /**
         * 点击板块取消全部订阅，删除所有板块订阅
         */
        $('#deleteAllPlate').live('click', function () {
            $.get(subscribeUrl+'?act=deleteAll&userid=' + userId + '&block=plate&jsoncallback=?', function (data) {
                plateCurPage = 1;
                plateTurnPage('plate', plateCurPage);
            }, 'json');
        });
        /**
         * 点击添加板块订阅，弹出板块按键精灵弹窗
         */
        $('#addPlate').click(function () {
            $plateSearch.show();
        });
        /**
         * 点击添加板块订阅，弹出板块按键精灵弹窗
         */
        $('#plateSearchClose').click(function () {
            $plateSearch.hide();
            $plateSearchList.hide();
            $plateSearchInput.val('输代码/名称，双击添加');
        });
        /**
         * 板块input获得焦点
         */
        $plateSearchInput.focus(function(){
            $plateSearchInput.val('');
        });
        /**
         * 板块input失去焦点
         */
        $plateSearchInput.blur(function(){
            $plateSearchInput.val('输代码/名称，双击添加');
        });
        /**
         * 板块订阅实现按键精灵
         */
        $plateSearchInput.keyup(function (event) {
            var searchText = $(this).val();
            if (event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {
                if (searchText == '') {
                    $plateSearchList.hide();
                } else {
                    $.getJSON([index_keyboardUrl,'?search-text=' , searchText , '&type=field&jsoncallback=?'].join(''), function (fieldData) {
                        var fieldHtml = '<dd class="sli-title"><span><em class="sli-red">"' + searchText + '"</em>相关行业</span></dd>', conceptHtml = '<dd class="sli-title"><span><em class="sli-red">"' + searchText + '"</em>相关概念</span></dd>', dataArray = [];
                        for (var i = 0; i < fieldData.length; i++) {
                            dataArray = fieldData[i].split(' ');
                            fieldHtml += '<dd><span class="view-w1" type="3">' + dataArray[0].substr(3) + '</span><span class="view-w2">' + dataArray[1] + '</span></dd>';
                        }
                        $plateSearchList.find('dl').empty();
                        $plateSearchList.find('dl').append(fieldHtml);
                        $.getJSON([index_keyboardUrl,'?search-text=' , searchText , '&type=concept&jsoncallback=?'].join(''), function (conceptData) {
                            dataArray = [];
                            for (var i = 0; i < conceptData.length; i++) {
                                dataArray = conceptData[i].split(' ');
                                conceptHtml += '<dd><span class="view-w1" type="2">' + dataArray[0].substr(3) + '</span><span class="view-w2">' + dataArray[1] + '</span></dd>';
                            }
                            $plateSearchList.find('dl').append(conceptHtml);
                        });
                        $plateSearchList.find('dd:eq(1)').addClass('sli-ddhover');
                        $plateSearchList.show();
                    });
                }
            } else if (event.keyCode == 38) {
                var index = $plateSearchList.find('dd.sli-ddhover').index() - 1;
                var titleIndex = $plateSearchList.find('dd.sli-title:not(:eq(0))').index();
                if (index < 0) {
                    return
                } else {
                    if (index == titleIndex) {
                        index--;
                    }
                    $plateSearchList.find('dd:eq(' + index + '):not(.sli-title)').addClass('sli-ddhover').siblings('dd').removeClass('sli-ddhover');
                }
            } else if (event.keyCode == 40) {
                var index = $plateSearchList.find('dd.sli-ddhover').index() + 1;
                var titleIndex = $plateSearchList.find('dd.sli-title:not(:eq(0))').index();
                if (index > $plateSearchList.find('dd').length) {
                    return
                } else {
                    if (index == titleIndex) {
                        index++;
                    }
                    $plateSearchList.find('dd:eq(' + index + '):not(.sli-title)').addClass('sli-ddhover').siblings('dd').removeClass('sli-ddhover');
                }
            } else if (event.keyCode == 27) {
                $plateSearchList.hide();
            } else if (event.keyCode == 13) {
                addPlate();
            }
        });
        /**
         * 板块按键精灵搜索列表hover加背景色
         */
        $plateSearchList.find('dd:not(.sli-title)').live('hover', function () {
            $(this).addClass('sli-ddhover').siblings('dd').removeClass('sli-ddhover');
        });
        /**
         * 板块按键精灵搜索列表双击事件，双击新增板块订阅
         */
        $plateSearchList.find('dd').live('dblclick', function () {
            addPlate();
        });
        /**
         * 新增板块
         */
        var addPlate = function () {
            var code = $plateSearchList.find('.sli-ddhover').children('.view-w1').text(),
                plateName = $plateSearchList.find('.sli-ddhover').children('.view-w2').text(),
                type = $plateSearchList.find('.sli-ddhover').children('.view-w1').attr('type');
            if (code !== '' && plateName !== '') {
                $plateSearchList.hide();
                $plateSearchList.find('dd').removeClass('sli-ddhover');
                $.get([subscribeUrl,'?act=add&userid=' , userId , '&block=plate&type=' , type , '&code=' , code , '&list=1&jsoncallback=?'].join(''), function (data) {
                    var msg = '',
                        htmlData = data.data;
                    for (var name in htmlData) {
                        if (htmlData.hasOwnProperty(code)) {
                            msg = htmlData[name]
                        }
                    }
                    if (msg == 'OK') {
                        plateCurPage = parseInt($platePageCurNum.text().substr(0, 1));
                        if (plateCurPage === 0) {
                            plateCurPage = 1;
                            plateTotalPage = 1;
                        }
                        plateTurnPage('plate', plateCurPage);
                        promptFun('新增成功！');
                    }
                }, 'json');
            }
        };
        /**
         * 一键订阅自选股
         */
        $('#yjzxg').live('click', function () {
            $.getJSON(yjzxgUrl, function(data){
                    for(var i=0;i<data.length;i++){
                        addStock(data[i].code);
                    }
            });
        });
        /**
         * 点击页面上其他地方，关闭按键精灵
         */
        $(document).bind('click', function (e) {
            var $clicked = $(e.target);
            if (!$clicked.parents().hasClass('sli-stock')) {
                $('#stockSearchList').hide();
                $('#yjzxg').hide();
            }
            if (!$clicked.parents().hasClass('sli-plate')) {
                $plateSearchList.hide();
            }
        });
        /**
         * 提示函数
         * @param promptStr 提示内容
         */
        var promptFun = function(promptStr){
            if($('#promptPop').is(':hidden')){
                $('#promptPop p').text(promptStr);
                $('#promptPop').fadeIn('3000').fadeOut('3000');
            }
        }
    })($ || jQuery);
});