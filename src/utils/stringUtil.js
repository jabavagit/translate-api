
exports.toUnicode = function (text) {

    var unicodeString = '';
    for (var i = 0; i < text.length; i++) {
        var currentChar = text.charAt(i);
        if (!isLetter(currentChar) && !isNumber(currentChar) && !isBlank(currentChar)) {
            var theUnicode = currentChar.charCodeAt(0).toString(16).toUpperCase();
            while (theUnicode.length < 4) {
                theUnicode = '0' + theUnicode;
            }
            theUnicode = '\\u' + theUnicode;
            unicodeString += theUnicode;
        } else {
            unicodeString += currentChar;
        }

    }
    return unicodeString;
};


function isBlank(str) {
    return str === ' ';
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isNumber(str) {
    return /^\d+$/.test(str);
}