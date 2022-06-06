import _ from "lodash";

export const controlErrors = (error: any) => {
    if (error.response && error.response.status) {
        const response = error.response;
        switch (response.status) {
            case 500:
                console.error(response.status, response.data);
                break;
            case 404:
                console.error(response.status, error.stack);
                break;
            case 413:
                console.error(response.status, response.data.error);
                break;

            default:
                console.error(response.status, error);
                break;
        }
    } else {
        if (error.message && error.stack)
            console.error(error.message, error.stack);
        else
            console.error(error);
    }
};

export const jsonStringify = (data: any): any => {
    let dataStringfy = JSON.stringify(data);
    dataStringfy.split(/\r/g);
    dataStringfy.split(/\n/g);
    dataStringfy.split(/\t/g);
    dataStringfy.replace('\\', '');

    return dataStringfy;
};

export const replaceNewLineChars = ((someString: any, replacementString = '') => { // defaults to just removing
    const LF = '\u{000a}'; // Line Feed (\n)
    const VT = '\u{000b}'; // Vertical Tab
    const FF = '\u{000c}'; // Form Feed
    const CR = '\u{000d}'; // Carriage Return (\r)
    const CRLF = '${CR}${LF}'; // (\r\n)
    const NEL = '\u{0085}'; // Next Line
    const LS = '\u{2028}'; // Line Separator
    const PS = '\u{2029}'; // Paragraph Separator
    const lineTerminators = [LF, VT, FF, CR, CRLF, NEL, LS, PS]; // all Unicode 'lineTerminators'
    let finalString = someString.normalize('NFD'); // better safe than sorry? Or is it?
    for (let lineTerminator of lineTerminators) {
        if (finalString.includes(lineTerminator)) { // check if the string contains the current 'lineTerminator'
            let regex = new RegExp(lineTerminator.normalize('NFD'), 'gu'); // create the 'regex' for the current 'lineTerminator'
            finalString = finalString.replace(regex, replacementString); // perform the replacement
        };
    };
    return finalString.normalize('NFC'); // return the 'finalString' (without any Unicode 'lineTerminators')
});

export const getInfoDataToProjects = (model: any): any => {
    const result: Array<any> = [];

    model.forEach((project: any) => {
        let _countMissing: number = 0;
        let _countUntranslated: number = 0;
        let countM: number = 0;
        let countU: number = 0;

        _.forEach(project.literals, (_literal: any) => {
            const arrLangs = Object.keys(_literal.lang).map((name) => {
                let values = _literal.lang[name];
                return values;
            });
            countM = 0;
            countU = 0;
            _.forEach(arrLangs, (value: any) => {
                if (value === '') {
                    countU++;
                }

                if (value.length > 0) {
                    countM++;
                }
            });

            if (countM < arrLangs.length) {
                _countMissing++;
            }

            if (countU === arrLangs.length) {
                _countUntranslated++;
            }
        });

        result.push({
            id: project.id,
            name: project.name,
            count: {
                total: project.literals.length,
                missing: _countMissing,
                untranslated: _countUntranslated
            }
        });
    });

    return result;
};

export const dataResponse = (code: number, message: string, data: any) => {
    const response = {
        code: code,
        message: message,
        data: data
    };

    return response;
};
