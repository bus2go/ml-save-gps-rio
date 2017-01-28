const http = require('http');
const path = require('path');
const Immutable = require('immutable');
const fs = require('fs');
const helper = require('./helper');

const CITY = 'rio';
    
let counter = 0;
let busList = Immutable.Map({});
let id = 1;

let main = () => {
    setTimeout(getGPS, 1);
    setInterval(getGPS, 10 * 1000);
};

let getGPS = () => {
    const FILE_PATH = path.join('files', helper.getFileName(CITY));
    
    if(!fs.existsSync(FILE_PATH)) {
        let header = "id,key,dataHora,ordem,linha,lat,lon\n";
        helper.writeHeader(FILE_PATH, header);
    }
    
    var options = {
        hostname: 'dadosabertos.rio.rj.gov.br',
        path: '/apiTransporte/apresentacao/rest/index.cfm/obterTodasPosicoes',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
    };

    http.get(options, (res) => {
        let body = '';
    
        res.setEncoding('utf8');
    
        res.on('data', partialBody => {
            body += partialBody;
        });
    
        res.on('end', () => {
            if(res.statusCode !== 200) {
                console.log('res.statusCode', res.statusCode);
            } else {
                try {
                    let data = JSON.parse(body);
                    console.log('>>> inicio', counter++, new Date());
                    
                    parseData(FILE_PATH, data.DATA);
                } catch(err) {
                    console.log('err', err);
                }
            }
        });
    }).on('error', err => {
        console.log('err', err);
    });
};

let parseData = (filePath, loadedData) => {
    for(let i=0; i<loadedData.length; i++) {
        let row = loadedData[i];
        let dados = Immutable.Map({
            dataHora: row[0],
            ordem: row[1],
            linha: row[2] + '',
            lat: row[3],
            lon: row[4]
        });
        
        if(!busList.get(dados.get('ordem')) || !dados.equals(busList.get(dados.get('ordem')))) {
            busList = busList.set(dados.get('ordem'), dados);
            
            let item = dados.toObject();
            
            let date = item.dataHora.split(' ')[0].split('-');
            date = [date[2], date[1], date[0]].join('-');
            item.dataHora = [date, item.dataHora.split(' ')[1]].join('T') + 'Z';
            
            let key = item.ordem + '-' + item.dataHora;
            
            if(item.linha !== '') helper.writeLine(filePath, id++, key, item);
        }
    }
};

/* BEGIN */
main();