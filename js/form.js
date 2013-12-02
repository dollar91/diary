//@charset "utf-8"
//记事框操作
$(".npop-close").click(function(){
    $(this).parents(".note-pop").hide();
    $("#mask_iframe").hide();
});

//编辑闹钟的时候选无闹钟的时候
$(".select_clock").change(function(){
	var boxOuter = $(this).parents('.note-pop'); 
	if($(this).val() == '无'){
		boxOuter.find(".clock_edit").hide().val('');
	}else{
		boxOuter.find(".clock_edit").show().click();
	}
});

//编辑时间的时候选无闹钟的时候
$(".select_ctime").change(function(){
	var boxOuter = $(this).parents('.note-pop'); 
	if($(this).val() == '无'){
		boxOuter.find(".ctime_edit").hide().val('');
	}else{
		boxOuter.find(".ctime_edit").show();
	}
});

//将闹钟和显示时间转换为时间戳
function getClockTime(clock_val){
	var date = clock_val.slice(0,10);
	var time = clock_val.slice(11);
    var s='2012-08-22 12:12:12';
    var a=clock_val.split(/[^0-9]/);
    var d=new Date(a[0],a[1]-1,a[2],a[3],a[4],a[5]);
	return d.getTime()/1000;
}
/**
 * 按键精灵
 */
$('#npopSearch').live('keyup', function(event){
    var searchText = $(this).val();
    if(event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {
        if(searchText=='')
        {
            $('#npopSearchList').hide();
        }else{
            $.getJSON('http://news.10jqka.com.cn/public/index_keyboard.php?search-text='+searchText+'&type=stock&jsoncallback=?',function(data){
                var html='',dataArray=[];
				if(data.length == 0){
                    $('#npopSearchList').hide();
				}else{
					for(var i=0; i<data.length; i++)
					{
						dataArray = data[i].split(' ');
						html+='<dd><span class="view-w1">'+dataArray[0].substr(3)+'</span><span class="view-w2">'+dataArray[1]+'</span></dd>';
					}
					$('#npopSearchList dl').empty();
					$('#npopSearchList dl').append(html);
					$('#npopSearchList dd:first-child').addClass('npop-ddhover');
					$('#npopSearchList').show();
				}
            });
        }
    }else if(event.keyCode == 38 ){
        var index = $('#npopSearchList .npop-ddhover').index()-1;
        if(index<0){
            return
        }else{
            $('#npopSearchList dd:eq('+index+')').addClass('npop-ddhover').siblings('dd').removeClass('npop-ddhover');
        }
    }else if(event.keyCode == 40 ){
        var index = $('#npopSearchList .npop-ddhover').index()+1;
        if(index>$('#npopSearchList dd').length){
            return
        }else{
            $('#npopSearchList dd:eq('+index+')').addClass('npop-ddhover').siblings('dd').removeClass('npop-ddhover');
        }
    }else if(event.keyCode == 27 ){
        $('#npopSearchList').hide();
    }else if(event.keyCode == 13){
        var code = $('#npopSearchList .npop-ddhover .view-w1').text();
        var name = $('#npopSearchList .npop-ddhover .view-w2').text();
        $('#npopSearch').val(code+name);
        $('#npopSearchList').hide();
    }
});
/**
 * 按键精灵搜索列表hover加背景色
 */
$('#npopSearchList dd').live('hover',function(){
    $(this).addClass('npop-ddhover').siblings('dd').removeClass('npop-ddhover');
});
/**
 * 按键精灵搜索列表双击事件，双击值写入input
 */
$('#npopSearchList dd').live('dblclick',function(){
    var code = $('#npopSearchList .npop-ddhover .view-w1').text();
    var name = $('#npopSearchList .npop-ddhover .view-w2').text();
    $('#npopSearch').val(code+name);
    $('#npopSearchList').hide();
});

/**
 * 按键精灵
 */
$('#npopSearchAdd').live('keyup', function(event){
    var searchText = $(this).val();
    if(event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {
        if(searchText=='')
        {
            $('#npopSearchListAdd').hide();
        }else{
            $.getJSON('http://news.10jqka.com.cn/public/index_keyboard.php?search-text='+searchText+'&type=stock&jsoncallback=?',function(data){
                var html='',dataArray=[];
				if(data.length == 0){
                    $('#npopSearchListAdd').hide();
				}else{
					for(var i=0; i<data.length; i++)
					{
						dataArray = data[i].split(' ');
						html+='<dd><span class="view-w1">'+dataArray[0].substr(3)+'</span><span class="view-w2">'+dataArray[1]+'</span></dd>';
					}
					$('#npopSearchListAdd dl').empty();
					$('#npopSearchListAdd dl').append(html);
					$('#npopSearchListAdd dd:first-child').addClass('npop-ddhover');
					$('#npopSearchListAdd').show();
				}
            });
        }
    }else if(event.keyCode == 38 ){
        var index = $('#npopSearchListAdd .npop-ddhover').index()-1;
        if(index<0){
            return
        }else{
            $('#npopSearchListAdd dd:eq('+index+')').addClass('npop-ddhover').siblings('dd').removeClass('npop-ddhover');
        }
    }else if(event.keyCode == 40 ){
        var index = $('#npopSearchListAdd .npop-ddhover').index()+1;
        if(index>$('#npopSearchListAdd dd').length){
            return
        }else{
            $('#npopSearchListAdd dd:eq('+index+')').addClass('npop-ddhover').siblings('dd').removeClass('npop-ddhover');
        }
    }else if(event.keyCode == 27 ){
        $('#npopSearchListAdd').hide();
    }else if(event.keyCode == 13){
        var code = $('#npopSearchListAdd .npop-ddhover .view-w1').text();
        var name = $('#npopSearchListAdd .npop-ddhover .view-w2').text();
        $('#npopSearchAdd').val(code+name);
        $('#npopSearchListAdd').hide();
    }
});
/**
 * 按键精灵搜索列表hover加背景色
 */
$('#npopSearchListAdd dd').live('hover',function(){
    $(this).addClass('npop-ddhover').siblings('dd').removeClass('npop-ddhover');
});
/**
 * 按键精灵搜索列表双击事件，双击值写入input
 */
$('#npopSearchListAdd dd').live('dblclick',function(){
    var code = $('#npopSearchListAdd .npop-ddhover .view-w1').text();
    var name = $('#npopSearchListAdd .npop-ddhover .view-w2').text();
    $('#npopSearchAdd').val(code+name);
    $('#npopSearchListAdd').hide();
});
/**
 * 标题失去焦点检测
 */
$('.subtitle_edit').live('blur', function(){
    var npopTitle = $(this).val();
    if(npopTitle == ''){
        promptFun('标题不能为空');
        setTimeout(function(){
            $('.subtitle_edit').focus();
        },100);
    }else if(npopTitle.length > 25){
        testFun();
    }
});

/**
 * 标题内容超出检测
 */
$('.subtitle_edit').live('keydown', function(event){
    var length = $(this).val().length;
    if(length > 25){
        testFun();
    }
});
/**
 * 提示标题
 */
$(".edit_title_a a").click(function(){
    var this_title = $(this).text();
    $(this).parents('.cnpop-content').find(".subtitle_edit").val(this_title);
});
/**
 * 检测函数
 */
var testFun = function(){
    promptFun('标题不能超过25个字');
    setTimeout(function(){
        $('.subtitle_edit').focus();
    },100);
}
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