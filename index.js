let request = require('request');
let $ = require('cheerio');
let Promise = require('bluebird');

const SEARCH_SUBDIVX = 'http://subdivx.com/index.php?buscar={q}&accion=5&masdesc=&subtitulos=1&realiza_b=1';

exports.listSubs = function (opts) {
  return new Promise(function (resolve, reject) {
    if (!opts) reject('getSubs parameter is required');

    if (typeof opts === 'string') {
      opts = {
        query: opts
      };
    }

    const requestOptions = {
      url: SEARCH_SUBDIVX.replace('{q}', opts.query.replace(' ', '+'))
    };

    exports._request
            .call(this, requestOptions)
            .then(resolve)
            .catch(reject);
  });
};

exports._request = function (opts) {
  return new Promise(function (resolve, reject) {
    request(opts.url, function (err, res, body) {
      if (err) reject('Error requesting subdivx');

      const subtitleDivs = $(body)
                      .find('#contenedor_izq > div')
                      .filter(function (i, elem) {
                        return ~($(elem).attr('id') || '').indexOf('buscador_detalle');
                      });

      const downloadLinks = subtitleDivs
                        .map(function (i, elem) {
                          return {
                            downloadLink: $(elem).find('a[target="new"]').attr('href'),
                            description: $(elem).find('#buscador_detalle_sub').text()
                          };
                        })
                        .toArray();

      resolve(downloadLinks);
    });
  });
};
