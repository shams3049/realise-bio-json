const fs = require('fs');

exports.updateProcessJson = function(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile('public/process.json', JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};