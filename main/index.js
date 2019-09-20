"use strict";

var _path = _interopRequireDefault(require("path"));

var _main = require("@fure/main");

var _LogicDecoupling = _interopRequireDefault(require("./core/LogicDecoupling"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const parseArgs = argv => argv.reduce((args, arg, index) => {
  if (!arg.startsWith('-')) return args;
  const key = arg.slice(arg.startsWith('--') ? 2 : 1);
  const next = argv[index + 1] || '-end';
  if (next.startsWith('-')) return _objectSpread({}, args, {
    [key]: true
  });
  return _objectSpread({}, args, {
    [key]: next
  });
}, {});

const args = parseArgs(process.argv); // eslint-disable-line no-undef

const options = args.dev ? {
  page: 'http://localhost:3000'
} : {
  buildDir: _path.default.resolve(__dirname, '../../build'),
  buildPrefix: 'furegame',
  page: '/furegame'
};
args.dev && console.log('launch with develop mode:', options); // eslint-disable-line no-console

(0, _main.main)([_LogicDecoupling.default], options);