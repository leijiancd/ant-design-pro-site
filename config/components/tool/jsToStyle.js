/**
 * 将js 中引入的 antd 组件加入到 css 和 less 中
 * antd/lib/button
 * 在 css.js 中加入 require('antd/lib/button/style/css')
 * 在 less 中加入 @import '~antd/lib/button/style/index.less';
 */
const fs = require('fs');
const path = require('path');

const fileExistsSync = (pathString) => {
  if (!fs.existsSync(pathString)) {
    fs.writeFileSync(pathString, '');
  }
};

const antComMap = {};

const loopAllStyle = function (parents) {
  const paths = fs.readdirSync(path.join(__dirname, parents));
  paths.forEach((itemPath) => {
    // file status
    const fileStatus = fs.lstatSync(path.join(__dirname, parents, itemPath));
    // is file
    if (fileStatus.isFile()) {
      if (itemPath.indexOf('.js') > -1) {
        const relaPath = path.join(__dirname, parents, itemPath);
        if (
          relaPath.indexOf('css.js') === -1 &&
          relaPath.indexOf('_utils') === -1
        ) {
          const jsString = fs.readFileSync(relaPath).toString();
          if (jsString.includes('antd/lib/')) {
            const execArray = jsString.match(/(antd\/lib\/)(\w*)/gi);
            if (execArray) {
              const relaPathDir = path.dirname(relaPath);
              if (!fs.existsSync(`${relaPathDir}/style/`)) {
                fs.mkdirSync(`${relaPathDir}/style/`);
              }
              const cssPath = `${relaPathDir}/style/css.js`;
              const lessPath = `${relaPathDir}/style/index.less`;

              const cssPathString = [];
              const lessPathString = [];

              execArray.forEach((antdCom) => {
                antComMap[antdCom] = true;
                cssPathString.push(`require('${antdCom}/style/css')`);
                lessPathString.push(`@import '~${antdCom}/style/index';`);
              });

              fileExistsSync(cssPath);
              let cssString = fs.readFileSync(cssPath);
              cssString = `${cssPathString.join('\n')}\n${cssString}`;
              fs.writeFileSync(cssPath, cssString);
              fileExistsSync(lessPath);
              let lessString = fs.readFileSync(lessPath);
              lessString = `${lessPathString.join('\n')}\n${lessString}`;
              fs.writeFileSync(lessPath, lessString);
            }
          }
        }
      }
    }
    // is Directory
    if (fileStatus.isDirectory()) {
      loopAllStyle(path.join(parents, itemPath));
    }
  });
};
loopAllStyle('../lib');

// creactant-design-pro.less]
// insert all use antd component less

const lessPathString = [];
Object.keys(antComMap).forEach((antdCom) => {
  lessPathString.push(`@import '~${antdCom}/style/index';`);
});
const antProLessPath = path.join(__dirname, '../dist/ant-design-pro.less');
fileExistsSync(antProLessPath);
fs.writeFileSync(
  antProLessPath,
  `${lessPathString.join('\n')}\n@import "../lib/index.less";`
);
const charts = require('./chart');

charts();
module.exports = loopAllStyle;
