const fs = require('fs');

module.exports = (path, options = {}, to) => {
  const data = JSON.parse(fs.readFileSync(path));
  const remove = options.remove || [];
  const add = options.add || [];

  remove.forEach(jsonPath => {
    let currentData = data;
    const arrayPath = jsonPath.split('.');
    // eslint-disable-next-line no-shadow
    const path = arrayPath.slice(0, -1);
    const key = arrayPath[path.length];
    // eslint-disable-next-line no-shadow
    for (const key of path) {
      currentData = currentData[key];
    }
    delete currentData[key];
  });

  Object.entries(add).forEach(([jsonPath, jsonObject]) => {
    let currentData = data;
    const arrayPath = jsonPath.split('.');
    // eslint-disable-next-line no-shadow
    const path = arrayPath.slice(0, -1);
    const key = arrayPath[path.length];
    // eslint-disable-next-line no-shadow
    for (const key of path) {
      currentData = currentData[key];
    }

    currentData[key] = jsonObject;
  });
  if (fs.existsSync(to)) {
    fs.unlinkSync(to);
  }

  fs.writeFileSync(to, JSON.stringify(data, null, 4));
};
