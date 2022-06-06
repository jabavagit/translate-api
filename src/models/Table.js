
const NumberUtil = require('../utils/numberUtil');
const ExcelUtil = require('../utils/excelUtil');

/**
 * Clase con la funcionalidad para la lectura de tablas.
 * Recibe como parametro la `tabla`, la `worksheer` de la libreria `exceljs`. y la `worksheet` nuestra.
 */
exports.Table = function (table, exceljsWorksheet, worksheet) {

    var vm = this;

    vm.worksheet = worksheet;
    vm.data = [];
    vm.numRows = 0;

    var name = table.name.trim();
    /**
     * Obtiene el nombre de la tabla.
     */
    vm.getName = function () {
        return name;
    };


    /**
     * Metodo que devuelve el valor que tiene una celda de una tabla dada 
     * su posicion en la misma mediante la fila y la columna.
     * @param {*} row Fila de la que se quiere obtener el dato (en base 1).
     * @param {*} col Columna de la que se quiere obtener el dato. Puede ser 
     * por posicion (en base 1) o puede ser el nombre de la columna.
     * @returns El valor de la fila y columna seleccionada.
     */
    vm.getData = function (row, col) {
        return getData(vm, row, col);
    }

    init(vm, table, exceljsWorksheet);
};

/**
 * Metodo que devuelve el valor que tiene una celda de una tabla dada 
 * su posicion en la misma mediante la fila y la columna.
 * @param {*} vm Referencia a la instancia de la tabla
 * @param {*} row Fila de la que se quiere obtener el dato (en base 1).
 * @param {*} col Columna de la que se quiere obtener el dato. Puede ser 
 * por posicion (en base 1) o puede ser el nombre de la columna.
 * @returns El valor de la fila y columna seleccionada.
 */
function getData(vm, row, col) {
    var typeCol = typeof col;
    var colIndex = NumberUtil.toInt(col);;
    var rowIndex = NumberUtil.toInt(row);

    // Verificamos que la fila sea un numero valido.
    if (isNaN(rowIndex)) {
        throw `Invalid row "${row}".`;
    } else {
        if (rowIndex < 1 || rowIndex > vm.data.length) {
            throw `Row ${row} out bound. Row must be between 1 and ${vm.data.length}`;
        }
    }

    // Si la columna es un txto comprobamos si es realmente un numero
    // Si es un texto no numerico y que no este registrado como nombre 
    // de una columna mostramos el error. Si es un numero lo interpretamos 
    // como el indice de la columna.
    if (typeCol === 'string') {
        col = col.trim();
        var colix = vm.columnData.table.nameToIndex[col];
        if (colix === undefined && isNaN(colIndex)) {
            throw `Invalid column name "${col}".`;
        } else if (colix !== undefined) {
            colIndex = colix + 1;
        }
    }

    // Verificamos que la columna sea un numero valido.
    if (isNaN(colIndex)) {
        throw `Invalid column "${col}".`;
    } else {
        if (colIndex < 1 || colIndex > vm.columnData.numColumns) {
            throw `Column out bound. Column must be between 1 and ${vm.columnData.numColumns}`;
        }
    }

    return vm.data[rowIndex - 1][colIndex - 1];
};

/**
 * Construye la tabla y le pone la informacion necesaria para trabajar con ella.
 * @param {*} vm Referencia a la instancia de la tabla actual.
 * @param {*} table Objeto `table` de la libreria `exceljs` que contiene la tabla 
 * que queremos procesar.
 * @param {*} worksheet Objeto `worksheet` de la libreria `exceljs` que contiene 
 * la tabla. Necesario para acceder a los datos ya que los metodos de acceso 
 * desde la tabla no funcionan en la version actual.
 */
function init(vm, table, worksheet) {

    // Guardamos el rango de la tabla
    var range = getRange(table);
    vm.range = range;

    // Guardamos la informacion de las columnas.
    var columnData = getColumData(table, range);
    vm.columnData = columnData;

    // Accedemos a todas las filas de la tabla. Saltamos la primera por ser la de la cabecera.
    for (var i = range.from.row + 1; i <= range.to.row; i++) {

        // Creamos una fila vacia.
        var row = [];

        // Accedemos a todas las columnas de la tabla para añadirle los datos a la fila.
        for (var j = range.from.col; j <= range.to.col; j++) {

            var cell = worksheet.getCell(i, j);
            var value = ExcelUtil.cellValue(cell);
            row.push(value);
        }

        //  Solo añadimos la fila a la tabla si tiene al menos una columna con datos.
        if (row.filter(x => x !== '').length !== 0) {
            vm.data.push(row);
        }
    }

    // Guardamos el numreo de filas que tiene la tabla.
    vm.numRows = vm.data.length;
};

/**
 * Devuelve el rango de la tabla como indices (en base 1)
 * @param {*} table Objeto `table` de la libreria `exceljs` de la que queremos 
 * obtener el rango.
 * @returns Rango de la tabla.
 */
function getRange(table) {

    var model = table.model;
    var rangeStr = model.tableRef.split(':');

    var expReg = /([A-Z]+)(\d+)/;
    var openMatch = expReg.exec(rangeStr[0].toUpperCase());
    var closeMatch = expReg.exec(rangeStr[1].toUpperCase());

    return {
        from: {
            row: parseInt(openMatch[2]),
            col: ExcelUtil.letterToIndex(openMatch[1])
        },
        to: {
            row: closeMatch[2],
            col: ExcelUtil.letterToIndex(closeMatch[1])
        }
    };
};

/**
 * Devuelve informacion de las columnas.
 * Numero de Columnas.
 * Conversor de indice / nombre respecto a la hoja.
 * Conversor de indice / nombre respecto a la tabla.
 * @param {*} table Objeto `table` de la libreria `exceljs` de la que queremos 
 * obtener la informacion de sus columnas.
 * @param {*} range Rango que ocupa la tabla.
 */
function getColumData(table, range) {

    var model = table.model;

    var columNames = model.columns.map(x => x.name.trim());

    var columnData = {
        numColumns: columNames.length,
        sheet: {
            nameToIndex: {},
            indexToName: {}
        },
        table: {
            nameToIndex: {},
            indexToName: {}
        }
    };

    var firstIndex = range.from.col;
    for (i = 0; i < columNames.length; i++) {
        var columnName = columNames[i];
        var columnIndex = i + firstIndex;

        columnData.sheet.nameToIndex[columnName] = columnIndex;
        columnData.sheet.indexToName[columnIndex] = columnName;

        columnData.table.nameToIndex[columnName] = i;
        columnData.table.indexToName[i] = columnName;
    }

    return columnData;
};
