
const ExcelJS = require('exceljs');
const Models = require('../models/Models');

/**
 * Devuelve el indice de la columna en base 1.
 * @param {*} column Letra de la columna.
 * @returns Indice de la colmna en base 1.
 * @throws Si la letra es invalida.
 */
exports.letterToIndex = function (column) {
    var result = columns.indexOf(column) + 1;

    if (result === 0) {
        throw `Invalid column letter: "${column}"`;
    }

    return result;
};

/**
 * Procesa el excel indicado y ejecuta la funcion con la informaciond el mismo.
 * @param {*} filePath Ruta del fichero excel.
 * @param {*} callback Funcion que se ejecuta si la lectura del excel es correcta.
 */
exports.read = function (filePath, callback) {

    var workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile(filePath)
        .then(function (response) {

            var myWorkBock = new Models.WorkBook(workbook);
            if (typeof callback === 'function') {
                callback(myWorkBock);
            }

        })
        .catch(function (error) {
            console.log('Something was wrong');
            console.log(error);
        });
};

exports.cellValue = function (cell) {
    let value = '';
    try {
        value = (cell.text || '').trim();
    } catch{
        value = '';
    }

    return value;
}

// Array con las letras de las columnas para la conversion a indice.
var columns = [
    'A', 'B', 'C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y',
    'Z', 'AA', 'AB', 'AC', 'AD',
];