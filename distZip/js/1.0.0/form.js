//@charset "utf-8"
//记事框操作
$(".npop-close").click(function() {
    $(this).parents(".note-pop").hide();
    $("#mask_iframe").hide();
});

//编辑闹钟的时候选无闹钟的时候
$(".select_clock").change(function() {
    var boxOuter = $(this).parents('.note-pop');
    if ($(this).val() == '无') {
        boxOuter.find(".clock_edit").hide().val('');
    } else {
        boxOuter.find(".clock_edit").val('点击设定提醒时间').show();
    }
});

//编辑时间的时候选无闹钟的时候
$(".select_ctime").change(function() {
    var boxOuter = $(this).parents('.note-pop');
    if ($(this).val() == '无') {
        boxOuter.find(".ctime_edit").hide().val('');
    } else {
        boxOuter.find(".ctime_edit").val('点击设定提醒时间').show();
    }
});

//将闹钟和显示时间转换为时间戳
function getClockTime(clock_val) {
    var date = clock_val.slice(0, 10);
    var time = clock_val.slice(11);
    var s = '2012-08-22 12:12:12';
    var a = clock_val.split(/[^0-9]/);
    var d = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
    return d.getTime() / 1000;
}
/**
 * 标题内容超出检测
 */
$('.subtitle_edit').live('blur', function(event) {
    var text = $(this).val();
    $(this).val(mCutStr(text, 48,''));
    if (text.length > 25) {
        promptFun('标题不可以超过25个字')
    }
});
/**
 * 提示标题
 */
$(".edit_title_a a").click(function() {
    var this_title = $(this).text();
    $(this).parents('.cnpop-content').find(".subtitle_edit").val(this_title);
});
/**
 * 提示函数
 * @param promptStr 提示内容
 */
var promptFun = function(promptStr) {
    if ($('#promptPop').is(':hidden')) {
        $('#promptPop p').text(promptStr);
        $('#promptPop').fadeIn('3000').fadeOut('3000');
    }
}