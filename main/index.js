"use strict";

var _path = _interopRequireDefault(require("path"));

var _main = require("@fure/main");

var _LogicDecoupling = _interopRequireDefault(require("./core/LogicDecoupling"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const args = (0, _main.parseArgs)(process.argv.slice(2), {
  dev: undefined,
  fullscreen: undefined
}); // eslint-disable-line no-undef

const options = args.dev ? {
  page: 'http://localhost:3000'
} : {
  buildDir: _path.default.join(__dirname, '../../build'),
  buildPrefix: 'furegame',
  page: '/furegame',
  fullscreen: !!args.fullscreen
};
args.dev && console.log('launch with develop mode:', options); // eslint-disable-line no-console

(0, _main.main)([_LogicDecoupling.default], options);