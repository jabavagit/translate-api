

/**
 * Convierte el numero a entero en caso de ser un entero valido. Si no devuelve `NaN`.
 * @param {*} number Numero a convertir a entero.
 * @returns Numero entero o NaN.
 */
exports.toInt = function (number) {
    var type = typeof number;

    if (((type === 'string') && !isNaN(number) && number.indexOf('.') === -1) ||
        ((type === 'number') && Number.isInteger(number))) {
        return parseInt(number);
    } else {
        return NaN;
    }
};