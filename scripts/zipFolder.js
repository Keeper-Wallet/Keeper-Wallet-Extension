const FolderZip = require('folder-zip');


module.exports = (from, to, done) => {
    const zip = new FolderZip();
    zip.zipFolder(from,{excludeParentFolder: true}, () => {
        zip.writeToFileSync(to);
        done && done();
        console.log('ZIP', to, 'done!!!');

    });
};
