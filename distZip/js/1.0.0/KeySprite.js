//@charset "utf-8"
/**
 * 需要jquery框架
 */
(function (window) {
    //严格模式
    "use strict";
    if (!window.syq) {
        window.syq = {};
    }
    //引入jQuery
    var $ = window.$;

    /**
     * 按键精灵（暂时只针对个股，有待改进）
     * @param $search 按键精灵的html元素
     * @param callback 选中按键精灵显示的数据时的操作
     * @param url   按键精灵的请求url
     * @param yjzxg 是否有一键订阅自选股
     * @constructor
     */
    var KeySprite = function ($search, callback, url, yjzxg) {
        var me = this;
        this.$search = $search;
        this.url = url;
        this.callback = callback;
        this.yjzxg = yjzxg;

        //初始化按键精灵UI
        this.initSearch();

        //定义一些内部变量
        this.$searchInput = $search.find('#stockSearchInput');
        this.stockSearchClose = $search.find('#stockSearchClose');
        this.$stockSearchList = $search.find('#stockSearchList');
        //this.$yjzxg = $search.find('#yjzxg');

        //初始化事件
        this.initSearchListEvent();
        this.initSearchCloseEvent();
        this.initSearchInputEvent();

    }
    //原型
    KeySprite.prototype = {
        constructor: KeySprite,
        initSearch: function () {
            if(this.yjzxg == 'true'){
                this.$search.append([
                    '<div id="stockSearchList" class="sli-view" style="display:none;">',
                    '<dl>',
                    '</dl>',
                    '</div>',
                    '<p id="yjzxg" class="sli-yj"  style="display:none;">一键订阅所有我的自选股</p>'
                ].join(''));
                this.$yjzxg = this.$search.find('#yjzxg');
            }else{
                this.$search.append([
                    '<div id="stockSearchList" class="sli-view" style="display:none;">',
                    '<dl>',
                    '</dl>',
                    '</div>'
                ].join(''));
            }
        },

        initSearchListEvent: function () {
            var me = this;
            var $stockSearchList = this.$stockSearchList;
            /**
             * 按键精灵搜索列表hover加背景色
             */
            $stockSearchList.find('dd').live('hover', function () {
                $(this).addClass('sli-ddhover').siblings('dd').removeClass('sli-ddhover');
            });
            /**
             * 个股按键精灵搜索列表双击事件，双击新增个股订阅
             */
            $stockSearchList.find('dd').live('dblclick', function () {
                var code = $stockSearchList.find('.sli-ddhover .view-w1').text();
                me.callback(code);
            });
        },

        initSearchCloseEvent:function(){
            var me = this;
            var $stockSearchClose=this.stockSearchClose;
            //点击隐藏Search
            $stockSearchClose.click(function () {
                me.$search.hide();
                me.$searchInput.val('');
            });
        },

        initSearchInputEvent:function(){
            var me = this;
            var $searchInput = this.$searchInput;

            $searchInput.keyup(function (event) {
                me.inputKeyup(event);
            });
        },

        inputKeyup: function (event) {
            var me = this;
            var searchText = me.$searchInput.val();
            if (event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {
                if (searchText == '') {
                    me.$stockSearchList.hide();
                    if(me.yjzxg == 'true'){
                        me.$yjzxg.hide();
                    }
                } else {
                    $.getJSON([me.url, '?search-text=' , searchText , '&type=stock&jsoncallback=?'].join(''), function (data) {
                        var html = '', dataArray = [];
                        for (var i = 0; i < data.length; i++) {
                            dataArray = data[i].split(' ');
                            html += '<dd><span class="view-w1">' + dataArray[0].substr(3) + '</span><span class="view-w2">' + dataArray[1] + '</span></dd>';
                        }
                        me.$stockSearchList.find('dl').empty().append(html);
                        //$('#stockSearchList dl').append(html);
                        me.$stockSearchList.find('dd:first-child').addClass('sli-ddhover');
                        me.$stockSearchList.show();
                        if(me.yjzxg == 'true'){
                            me.$yjzxg.show();
                        }

                    });
                }
            } else if (event.keyCode == 38) {
                var index = me.$stockSearchList.find('dd.sli-ddhover').index() - 1;
                if (index < 0) {
                    return
                } else {
                    me.$stockSearchList.find('dd:eq(' + index + ')').addClass('sli-ddhover').siblings('dd').removeClass('sli-ddhover');
                }
            } else if (event.keyCode == 40) {
                var index = me.$stockSearchList.find('dd.sli-ddhover').index() + 1;
                if (index > me.$stockSearchList.find('dd').length) {
                    return;
                } else {
                    me.$stockSearchList.find('dd:eq(' + index + ')').addClass('sli-ddhover').siblings('dd').removeClass('sli-ddhover');
                }
            } else if (event.keyCode == 27) {
                me.$stockSearchList.hide();
                if(me.yjzxg == 'true'){
                    me.$yjzxg.hide();
                }

            } else if (event.keyCode == 13) {
                var code = me.$stockSearchList.find('.sli-ddhover .view-w1').text();
                me.callback(code);
            }
        },
        show: function () {
            this.$search.show();
        },
        hide: function () {
            this.$search.hide();
        }
    }

    window.syq.KeySprite = KeySprite;
})(window);

