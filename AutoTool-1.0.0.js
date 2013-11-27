//@charset "utf-8";

/**
 * 大社区前端自动化工具
 * @author  yangkongqing@myhexin.com
 * @date 2013-11-04 08:57:17
 */

// window 的路径是用\  linux 是用/。统一使用 /
function formatPath(path) {
    return path.replace(/\\/g, '/');
}
/**
 * [getAbsolutePath 根据package的配置获取js、images、css等文件在资源服务器的绝对地址]
 * @return {[Object]} [各对应文件的绝对地址]
 */
function getAbsolutePath(){
    var package = require('./package.json');
    var cssThsiPath = package.cssThsiPath;
    var jsThsiPath = package.jsThsiPath;
    var imagesThsiPath = package.imagesThsiPath;
    function getHttpPath( thisPath ){
        return "http://" + thisPath.replace('/html/', '').slice(0, 1) + '.thsi.cn' + thisPath.replace('/html/', '').slice(1) + '/';
    }
    var jsHttpPath = getHttpPath(jsThsiPath) + package.version + '/';
    var cssHttpPath = getHttpPath(cssThsiPath) + package.cssVersion + '/';
    var imagesHttpPath = getHttpPath(imagesThsiPath);
    return {
        "js": jsHttpPath,
        "images": imagesHttpPath,
        "css": cssHttpPath
    }
}

/**
 * [copyFile 文件拷贝]
 * @param  {[type]}   srcFile  [原始目录]
 * @param  {[type]}   distFile [目标目录]
 * @param  {Function} callback [拷贝文件后的回调函数]
 * @return {[type]}            [description]
 */
function copyFile(srcFile, distFile, callback){
    var fs = require('fs');
    if( !fs.existsSync(srcFile) ){
        console.log( '目录' + srcFile + '不存在' );
        return ;
    }

    if( !fs.existsSync(distFile) ){
        fs.mkdirSync(distFile, 0755)
    }

    fs.readdir(srcFile, function(error, filelist){
        if( error ){
            console.log('读取文件有错误：');
            console.log( error );
            return false;
        }
        for(var i = 0; i < filelist.length; i++){
            var curSrcFile = srcFile + '/' + filelist[i];
            var curDistFile = distFile + '/' + filelist[i];
            if( fs.statSync(curSrcFile).isFile() ){
                    fs.writeFileSync(curDistFile, fs.readFileSync(curSrcFile, ''), '');
                    if( Object.prototype.toString.call(callback) ===  '[object Function]' ){
                        callback(curDistFile);
                    }
                    //var outContent = fs.readFileSync( curDistFile, 'utf-8' );
                    //fs.writeFileSync( curDistFile, outContent );
            } else {
                if( filelist[i] != '.svn'){
                    copyFile(curSrcFile, curDistFile, callback);
                }
            }
        }
    });
}
// 
/**
 * 文件zip压缩。目前采用的方法是通过子线程调用WZZIP进行压缩，必须先安装WZZIP。具体看README.md
 * [zipFile description]
 * @param  {[Object]} zipPathMap [{ "压缩成zip文件的名字": "要压缩的文件的路径" }]
 * @return {[type]}            [description]
 */
function zipFile( zipPathMap ){
    var path = require('path');
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    var defaultZipfilePath = formatPath(fs.realpathSync('.')) + '/distZip'; 
    if(!fs.existsSync(defaultZipfilePath)){
        fs.mkdirSync(defaultZipfilePath, 0755)
    }
    for( var zipName in zipPathMap ){
        // 利用匿名函数创建访问zipName的闭包
        (function(){
            var zipNamePath = zipPathMap[zipName];
            //console.log(zipNamePath)
            
            var zipChart = spawn('WZZIP', [ path.join( defaultZipfilePath, zipName + '.zip' ), zipNamePath , '-r', '-p' ]);
            zipChart.stdout.on('data', function(data){
                //console.log(data.toString());
            });
            zipChart.on('exit', function(){
                console.log( ' - ZIP ' + zipNamePath + ' COMPLETE!' );
                //autoLoginUpload(zipName, path.join( defaultZipfilePath, zipName + '.zip') );
            });
        })(zipName);
    }
}

/**
 * [relpaceCssfileUrl 替换css文件中的url为绝对地址]
 * @param  {[type]} cssFile [description]
 * @return {[type]}         [description]
 */
function relpaceCssfileUrl( cssFile ){
    var cssFileContent = fs.readFileSync(cssFile, 'utf-8');
    //var rImageUrlPath = /url.*\(.*\/(.*[0-9a-zA-Z_-]+\..+)\)/ig; // 替换css文件中的url
    var rImageUrlPath = /url.*\(.*\/(.*[0-9a-zA-Z_-]+\..+)\)/ig; // 
    var absolutePath = getAbsolutePath();
    // console.log(absolutePath)
    //cssFileContent = cssFileContent.replace(rImageUrlPath, 'url(' + absolutePath['images'] + '$1)');
    cssFileContent = cssFileContent.replace(/\.\.\/images\//ig, absolutePath['images']);
    fs.writeFileSync(cssFile, cssFileContent, 'utf-8');
}

/**
 * [autoLoginUpload 模拟登录和上传文件，代码有点丑，先用再优化  yangkongqing@myhexin.com]
 * @param  {[type]} zipName [zip文件名字]
 * @param  {[type]} zipPath [zip文件路径]
 * @return {[type]}         [description]
 */
function autoLoginUpload(zipName, zipPath) {
    var http = require("http");
    var fs = require("fs");
    var querystring = require("querystring");
    var package = require('./package.json');

    var contents = querystring.stringify({
        password: package.password,
        user_name: package.username,
        controller: "login",
        action: "in"

    });

    var options = {
        host: "admin.thsi.cn",
        path: "/",
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Content-Length": contents.length,
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-cn",
            "Cache-Control": "no-cache",
            "Connection": "Keep-Alive",
            "Host": "admin.thsi.cn",
            "Referer": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36"
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding("utf8");
        var headers = res.headers;
        var cookies = headers["set-cookie"];// 返回是一个对象
        if( cookies[0].indexOf('PHPSESSID=') >= 0 ){
            console.log("登录成功");
            console.log("正在上传 "+ zipName +" 文件...");
            upLoadZip(cookies[0], zipPath, zipName);
        } else {
            console.log("登录失败，请检查账号，密码是否正确");
        }
    });

    req.write(contents);
    req.end();


    function upLoadZip(Cookie, zipPath, zipName) {

        var filePath = zipPath;
        var datas = fs.readFileSync(filePath);
        doUpload(datas, Cookie, zipPath);

    }

    function doUpload(datas, Cookie, zipPath) {
        var boundary = "---------------------------leon";
        var uploadPath  = "";
        if( zipPath.indexOf('css') >= 0 ){
            uploadPath = package.cssThsiPath
        } else if( zipPath.indexOf('js') >= 0 ){
             uploadPath = package.jsThsiPath
         } else if( zipPath.indexOf('images') >= 0 ){
             uploadPath = package.imagesThsiPath
         }

        var formStr = '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="zipFlag"' + '\r\n\r\n' + 'true' + '\r\n' + '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="path"' + '\r\n\r\n' + uploadPath + '\r\n' + '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="file"; filename="' + zipPath + '"' + '\r\n' + 'Content-Type: application/octet-stream' + '\r\n\r\n';

        var formEnd = '\r\n--' + boundary + '--\r\n';
        var options = {
            host: "admin.thsi.cn",
            port: 80,
            method: "POST",
            path: "/index.php?controller=file&action=upload",
            headers: {
                "Content-Type": "multipart/form-data; boundary=" + boundary,
                "Content-Length": formStr.length + datas.length + formEnd.length,
                "Cookie": Cookie
            }
        };

        var req = http.request(options, function(res) {
            // console.log( res );
            res.on("data", function(data) {
               var sData =  data.toString() ;
               console.log( '上传文件返回内容' + sData + '\n');
               if( sData.indexOf('temporarily unavailable') > 0 ){
                    console.log('如果上传的zip文件含多个文件夹，服务器返回会超时，其实文件时上传成功了。亲，你可以发布到测试环境去看看哦。\n');
               }
               if( sData.indexOf('true') > 0 ){
                    console.log('上传'+ zipPath +'文件成功到资源服务器' + uploadPath + '\n' );
                    console.log('如果有任何疑问请联系 yangkongqing@myhexin.com')
               } else {
                    console.log('上传'+ zipPath +'文件失败');
               }

            });
            res.on("end", function(){

            });
        });
        req.write(formStr, 'utf8');
        req.write(datas);
        req.write(formEnd, 'utf8');
        req.end();
    }
}

// 删除打包的时候留下不必要的文件
var rmdirSync = (function() {
    function iterator(url, dirs) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            dirs.unshift(url); //收集目录
            inner(url, dirs);
        } else if (stat.isFile()) {
            fs.unlinkSync(url); //直接删除文件
        }
    }

    function inner(path, dirs) {
        var arr = fs.readdirSync(path);
        for (var i = 0, el; el = arr[i++];) {
            iterator(path + "/" + el, dirs);
        }
    }
    return function(dir, cb) {
        cb = cb || function() {};
        var dirs = [];

        try {
            iterator(dir, dirs);
            for (var i = 0, el; el = dirs[i++];) {
                fs.rmdirSync(el); //一次性删除所有收集到的目录
            }
            cb()
        } catch (e) { //如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();

var fs = require('fs');
var path = require('path');
var package = require('./package.json');
var currentDirectory = formatPath(fs.realpathSync('.')); // 获取当前路径
var jsVersion = package.version;
var cssVersion = package.cssVersion;

var distZip = currentDirectory + '/distZip';
if( !fs.existsSync(distZip) ){
    fs.mkdirSync(distZip, 0755)
}
var distZipCss = currentDirectory + '/distZip/css';
if( !fs.existsSync(distZipCss) ){
    fs.mkdirSync(distZipCss, 0755)
}

var distZipJS = currentDirectory + '/distZip/js';
if( !fs.existsSync(distZipJS) ){
    fs.mkdirSync(distZipJS, 0755)
}

// 拷贝images
var imagesSrcPath = currentDirectory + '/images';
var imagesdistPath = currentDirectory + '/distZip/images';
copyFile(imagesSrcPath, imagesdistPath);

// 拷贝css并替换url
var cssSrcPath = currentDirectory + '/css';
var cssdistPath = currentDirectory + '/distZip/css/' + cssVersion;
copyFile(cssSrcPath, cssdistPath, function( cssFile ){
    // relpaceCssfileUrl(cssFile);  
});

// 拷贝js
var jsSrcPath = currentDirectory + '/js';
var jsdistPath = currentDirectory + '/distZip/js/' + jsVersion;
copyFile(jsSrcPath, jsdistPath );

var zipPathMap = {};
// 拷贝文件是异步的，不做延迟的话会导致zip压缩的文件的内容不全。这个方法需要改进
setTimeout(function(){
    
    // zipPathMap["images"] = currentDirectory + "/distZip/images";
    zipPathMap["css" + cssVersion] = currentDirectory + "/distZip/css";
    zipPathMap["js" + jsVersion] = currentDirectory + '/distZip/js';
    zipFile(zipPathMap);
}, 2000);

setTimeout(function(){

    for(var zipName in zipPathMap){
        (function(){
            var defaultZipfilePath = formatPath(fs.realpathSync('.')) + '/distZip/'; 
            var zipPath = defaultZipfilePath  + zipName + '.zip';
            autoLoginUpload(zipName, zipPath);
        })(zipName)
    }
}, 4000);



// 删除打包的时候留下不必要的文件
var rmdirSync = (function() {
    function iterator(url, dirs) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            dirs.unshift(url); //收集目录
            inner(url, dirs);
        } else if (stat.isFile()) {
            fs.unlinkSync(url); //直接删除文件
        }
    }

    function inner(path, dirs) {
        var arr = fs.readdirSync(path);
        for (var i = 0, el; el = arr[i++];) {
            iterator(path + "/" + el, dirs);
        }
    }
    return function(dir, cb) {
        cb = cb || function() {};
        var dirs = [];

        try {
            iterator(dir, dirs);
            for (var i = 0, el; el = dirs[i++];) {
                fs.rmdirSync(el); //一次性删除所有收集到的目录
            }
            cb()
        } catch (e) { //如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();
// // todo 优化
// setTimeout(function(){
//     var removeCssPath = "distZip"
//     rmdirSync(removeCssPath, function(){
//         console.log("删除" +　removeCssPath + "目录以及子目录成功");
//     });

// }, 10000);







