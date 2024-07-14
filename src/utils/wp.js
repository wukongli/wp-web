import { ElMessage } from 'element-plus';
export  function getFilesize(row, column, size) {
    if (!size || size === '0') return '';

    var num = 1024.0; //byte

    if (size < num) return size + 'B';
    if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + 'K'; //kb
    if (size < Math.pow(num, 3))
        return (size / Math.pow(num, 2)).toFixed(2) + 'M'; //M
    if (size < Math.pow(num, 4)){
        let fileSize = (size / Math.pow(num, 3)).toFixed(2);
        if(fileSize > 7){
            return fileSize + 'G' + ` ( 文件大于10G请使用快速下载 )`; //G
        }
        return fileSize + 'G'; //G
    }
    return (size / Math.pow(num, 4)).toFixed(2) + 'T'+`(文件大于10G请使用快速下载)`; //T
}

export function getIconClass(row) {
    const {server_filename ,isdir} = row;
    if(parseInt(isdir) === 1){
        return "icon-wenjianjia";
    }
    const filetype = {
        "icon-shipin": ["wmv", "rmvb", "mpeg4", "mpeg2", "flv", "avi", "3gp", "mpga", "qt", "rm", "wmz", "wmd", "wvx", "wmx", "wm", "mpg", "mp4", "mkv", "mpeg", "mov", "asf", "m4v", "m3u8", "swf"],
        "icon-audio": ["wma", "wav", "mp3", "aac", "ra", "ram", "mp2", "ogg", "aif", "mpega", "amr", "mid", "midi", "m4a", "flac"],
        "icon-image": ["jpg", "jpeg", "gif", "bmp", "png", "jpe", "cur", "svg", "svgz", "ico", "webp", "tif", "tiff"],
        "icon-yasuobao": ["rar", "zip", "7z", "iso"],
        "icon-exe": ["exe"],
        "icon-pingguo": ["ipa"],
        "icon-APK": ["apk"],
        "icon-txt": ["txt", "rtf"],
        "icon-xls": ["xls", "xlsx", "xlsm", "xlsb", "csv", "xltx", "xlt", "xltm", "xlam"],
        "icon-docx": ["doc", "docx", "docm", "dotx"],
        "icon-ppt": ["ppt", "pptx", "potx", "pot", "potm", "ppsx", "pps", "ppam", "ppa"],
        "icon-pdfwenjian": ["pdf"]
    };
    let index = server_filename.lastIndexOf(".");
    if (index === -1) return "icon-wenjianjia";
    let name = server_filename.substring(index + 1);
    name = name.toLowerCase();
    for (let icon in filetype){
        for (let type in filetype[icon]){
            if (name === filetype[icon][type]){
                return icon;
            }
        }
    }
    return "icon-wenjian";
}

export function SubmitLink(url) {
    let surl = null;
    let uk = url.match(/uk=(\d+)/),
        shareid = url.match(/shareid=(\d+)/);
    if (uk != null && shareid != null) {
        let tmp = uk[1] + '&' + shareid[1];
        surl = '2' + window.btoa(tmp); // base64 encode
    } else {
        surl = url.match(/surl=([A-Za-z0-9-_]+)/);
        if (surl == null) {
            surl = url.match(/1[A-Za-z0-9-_]+/);
            if (surl != null) {
                surl = surl[0];
            }
        } else {
            surl = '1' + surl[1];
        }

        if (surl == null || surl === '') {
            ElMessage.error('网盘分享的链接有错误，请检查输入的链接 ！');
            return false;
        }
    }

    let pwd = url.match(
        /(提取码|pwd=|pwd:|密码|%E6%8F%90%E5%8F%96%E7%A0%81|%E5%AF%86%E7%A0%81)( |:|：|%EF%BC%9A|%20)*([a-zA-Z0-9]{4})/i
    );
    let pw;
    if (pwd != null && pwd.length === 4) {
        pw = pwd[3];
    }
    // if (pw.length !== 0 && pw.length !== 4) {
    //     ElMessage.error('验证码错误，请检查！');
    //     return false;
    // }
    return {
        url: surl,
        pwd: pw,
    };
}

export function timestampToTime(row, column, timestamp) {
    // 时间戳为10位需*1000，时间戳为13位不需乘1000
    var date = new Date(timestamp * 1000);
    var Y = date.getFullYear() + '-';
    var M =
        (date.getMonth() + 1 < 10
            ? '0' + (date.getMonth() + 1)
            : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
     return Y + M + D + h + m + s;
}

export function generateRandomLetters(count) {
    let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let counts = count || 4;
    for (let i = 0; i < counts; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return result;
}