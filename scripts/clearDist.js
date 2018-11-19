const path = require('path');
const fs = require('fs');

module.exports = (compiler) => {
    const outputPath = compiler.options.output.path;
    const rootPath = path.resolve(outputPath, '../');
    rimraf(rootPath);
    console.log('Dist is clear...');
};

function rimraf(dir_path) {
    if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(function(entry) {
            var entry_path = path.join(dir_path, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            } else {
                fs.unlinkSync(entry_path);
            }
        });
        fs.rmdirSync(dir_path);
    }
}
