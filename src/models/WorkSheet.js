
const Table = require('./Table');
const ExcelUtil = require('../utils/excelUtil');
const NumberUtil = require('../utils/numberUtil');

/**
 * Clase con la funcionalidad para trabajar con Hojas de Excel.
 * Recibe como parametro la `worksheet` de la libreria `exceljs`
 */
exports.WorkSheet = function (worksheet) {

    var vm = this;

    vm.name = worksheet.name.trim();
    vm.tables = {};
    vm.data = [];
    vm.numRows = 0;
    vm.numColumns = 0;

    /**
     * Obtiene la tabla indicada por el nombre.
     * @param {*} tableName Nombre de la tabla que queremos obtener.
     * @returns Objeto con la informacion de la tabla indicada.
     * @throws Si la tabla no existe.
     */
    vm.getTable = function (tableName) {
        return getTable(vm, tableName);
    };

    /**
     * Obtiene el dato de la fila y columna indicadas.
     * @param {*} row Numero de la fila en base 1.
     * @param {*} col Columna a la que queremos acceder. Puede ser por 
     * letra o por posicion en base 1.
     * @returns Dato de la fila y columna seleccionada.
     * @throws Si no existe la posicion especificada.
     */
    vm.getData = function (row, col) {
        return getData(vm, row, col);
    }

    /**
     * Obtiene el nombre de la hoja.
     */
    vm.getName = function () {
        return vm.name;
    };

    init(vm, worksheet);
};

/**
 * Inicializa la Hoja para poder acceder a sus celdas y tablas.
 * @param {*} vm Referencia a la Hoja actual.
 * @param {*} worksheet Objeto `worksheet` de la libreria `exceljs` 
 * sobre el que vamos a leer los datos.
 */
function init(vm, worksheet) {

    // Obtenemos todos los nombres de las tablas.
    var tableNames = Object.getOwnPropertyNames(worksheet.tables);

    // Para cada tabla creamos un objeto de nuestra clase "Tabla"
    // que es el que usaremos para acceder a los datos y lo añadimos 
    // a nuestra "hoja".
    for (var j = 0; j < tableNames.length; j++) {

        var tableName = tableNames[j];
        var table = worksheet.tables[tableName];

        var myTable = new Table.Table(table, worksheet, vm);
        vm.tables[myTable.getName()] = myTable;
    }

    // Guardamos el numero de filas y columnas que son accesibles en nuestra Hoja.
    vm.numRows = worksheet.rowCount;
    vm.numColumns = worksheet.columnCount;

    // Añadimos los datos a nuestra "hoja" para poder leerlos.
    // En este caso no borramos las filas vacias porque afectaria 
    // a la lectura por posicion absoluta, ejemplo: B6
    for (var i = 1; i <= vm.numRows; i++) {
        var row = [];
        for (var j = 1; j <= vm.numColumns; j++) {
            var cell = worksheet.getCell(i, j);
            var value = ExcelUtil.cellValue(cell);
            row.push(value);
        }

        vm.data.push(row);
    }
};

/**
 * Obtiene la tabla indicada por el nombre.
 * @param {*} vm Referenvia a la Hoja actual.
 * @param {*} tableName Nombre de la tabla que queremos obtener.
 * @returns Objeto con la informacion de la tabla indicada.
 * @throws Si la tabla no existe.
 */
function getTable(vm, tableName) {
    tableName = tableName.trim();
    var table = vm.tables[tableName];

    if (table === undefined) {
        throw `Invalid table "${tableName}" for sheet "${vm.name}"`;
    }

    return table;
};

/**
 * Obtiene el dato de la fila y columna indicadas.
 * @param {*} vm Referenvia a la Hoja actual.
 * @param {*} row Numero de la fila en base 1.
 * @param {*} col Columna a la que queremos acceder. Puede ser por letra o por posicion en base 1.
 * @returns Dato de la fila y columna seleccionada.
 * @throws Si no existe la posicion especificada.
 */
function getData(vm, row, col) {
    var typeCol = typeof col;
    var colIndex = NumberUtil.toInt(col);;
    var rowIndex = NumberUtil.toInt(row);

    // Comprobamos si la fila es un numero y esta en el rango de filas valido.
    if (isNaN(rowIndex)) {
        throw `Invalid row "${row}".`;
    } else {
        if (rowIndex < 1 || rowIndex > vm.data.length) {
            throw `Row ${rowIndex} out bound. Row must be between 1 and ${vm.data.length}`;
        }
    }

    // Si la columna viene como letra, la transofrmamos a su posicion numerica.
    if (typeCol === 'string' && isNaN(colIndex)) {
        colIndex = ExcelUtil.letterToIndex(col);
    }

    // Comprobamos si no existe transformacion a numero o esta fuera del rango.
    if (isNaN(colIndex)) {
        throw `Invalid column "${col}".`;
    } else {
        if (colIndex < 1 || colIndex > vm.numColumns) {
            if (typeCol === 'string') {
                throw `Column ${col} doesnt have value.`;
            } else {
                throw `Column ${colIndex} out bound. Column must be between 1 and ${vm.numColumns}`;
            }
        }
    }

    return vm.data[rowIndex - 1][colIndex - 1];
};