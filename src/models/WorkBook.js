
const WorkSheet = require('./WorkSheet');
const _ = require('lodash');

/**
 * Clase que contiene la informacion del `workbook`.
 * Recibe como parametro el `workbook` obtenido con la libreria `exceljs`.
 */
exports.WorkBook = function (workbook) {

    var vm = this;

    vm.sheets = [];

    init(vm, workbook);

    /**
     * Obtiene la Hoja indicada.
     * @param {*} sheet Nombre de la hoja a la que queremos acceder o posicion de la misma en base 0.
     * @returns Hoja con toda su informacion.
     * @throws Si no encuentra la hoja indicada.
     */
    vm.getSheet = function (sheet) {
        return getSheet(vm, sheet);
    };
};

/**
 * Inicializa el `WorkBook`.
 * @param {*} vm Referencia al `WorkBook` a inicializar.
 * @param {*} workbook Objeto `workbook` obtenido con la libreria `exceljs`.
 */
function init(vm, workbook) {

    // Para cada Hoja dentro del libro creamos un nuevo objeto de nuestra 
    // clase "WorkSheet" que es la encargada de preparar su lectura y la
    // añadimos a nuestro libro.
    for (var i = 0; i < workbook.worksheets.length; i++) {
        var worksheet = workbook.worksheets[i];

        var myWorkSheet = new WorkSheet.WorkSheet(worksheet);
        vm.sheets.push(myWorkSheet);
    }
};

/**
 * Obtiene la Hoja indicada.
 * @param {*} vm Referencia al `WorkBook` actual.
 * @param {*} sheet Nombre de la hoja a la que queremos acceder o posicion de la misma en base 0.
 * @returns Hoja con toda su informacion.
 * @throws Si no encuentra la hoja indicada.
 */
function getSheet(vm, sheet) {
    var type = typeof sheet;

    // Si el dato de acceso es un texto buscamos una hoja con ese nombre.
    if (type === 'string') {
        sheet = sheet.trim();
        var result = _.filter(vm.sheets, { name: sheet });

        if (result.length !== 1) {
            throw `Invalid parameter for "sheet": ${sheet}`;
        }

        return result[0];

    } else if (type === 'number') {
        // Si el dato de acceso es un numero miramos si existe una hoja dentro de ese rango numerico.
        var trunc = parseInt(sheet);
        if (sheet !== trunc) {
            throw `Invalid parameter for "sheet": ${sheet}`;
        } else if (sheet < 0 || sheet >= vm.sheets.length) {
            throw `Index out bound. Indext must be between 0 and ${vm.sheets.length - 1}`;
        }

        return vm.sheets[sheet];
    } else {
        throw `Invalid parameter for "sheet": ${sheet}`;
    }
}