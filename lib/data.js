// dependencies
const fs = require('fs');
const path = require('path');
//
const lib = {};

// base derectory of the data folder
lib.basedir = path.join(__dirname, '/../.data');

// write data to file

lib.create = (dir, file, data, callback) => {
    // open file for writing
    fs.open(`${`${lib.basedir}/${dir}`}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // Write data to file and then close it
            fs.writeFile(fileDescriptor, stringData, (err1) => {
                if (!err1) {
                    fs.close(fileDescriptor, (err2) => {
                        if (!err2) {
                            callback(false);
                        } else {
                            callback('Error closing the new file!');
                        }
                    });
                } else {
                    callback('Error writing to new file!');
                }
            });
        } else {
            callback('could not create new fole, it may already exisest');
        }
    });
};
// read data form file
lib.read = (dir, file, callback) => {
    fs.readFile(`${`${lib.basedir}/${dir}`}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// update existing file
lib.update = (dir, file, data, callback) => {
    fs.open(`${`${lib.basedir}/${dir}`}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const steingData = JSON.stringify(data);

            // truncate the file
            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {
                    // write to file and close it
                    fs.writeFile(fileDescriptor, steingData, (err2) => {
                        if (!err2) {
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback('File not closing!');
                                }
                            });
                        } else {
                            callback('could not write file');
                        }
                    });
                } else {
                    callback('Error truncating file!');
                }
            });
        } else {
            callback('Error updating . file may no esist!');
        }
    });
};

// delete existing file
lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${`${lib.basedir}/${dir}`}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('File could not deleted!');
        }
    });
};



// list all the item in a derectory
lib.list = (dir, callback) => {
    fs.readdir(`${`${lib.basedir}/${dir}`}`, (err, fileNames) => {
        if(!err && fileNames  && fileNames.length > 0) {
            let trimmedFileName =[];
            fileNames.forEach(fileName => {
                trimmedFileName.push(fileName.replace('.json', ''));
                callback(false, trimmedFileName)
            })
        }else {
            callback('error reading directory')
        }
    })
}


module.exports = lib;
