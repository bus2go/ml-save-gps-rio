const fs = require('fs');

const zeros = (value, size) => {
    value += '';
    
    while(value.length < size) value = '0' + value;
    
    return value;
};

const writeLine = (file, id, key, item) => {
    let line = [id, key, item.dataHora, item.ordem, item.linha, item.lat, item.lon].join(',') + '\n';
    write(file, line);
};

const write = (file, data) => {
    fs.appendFile(file, data, err => {
        if(err) {
            console.log(err);
            throw err;
        }
    });
};

const writeHeader = (file, header) => {
    write(file, header);
};

const getFileName = (city) => {
    let date = new Date();
    
    let result = city + '_' + zeros(date.getFullYear(), 4) + '-';
    result += zeros(date.getMonth()+1, 2) + '-';
    result += zeros(date.getDate(), 2);
    result += '.txt';
    
    return result;
};

module.exports = {
    zeros,
    writeHeader,
    writeLine,
    getFileName
};