import { Configuration, LogicDecoupling } from '.';
import { Core } from '@fure/core';
import { App } from '@fure/main';

export default [
  _app => Configuration,
  _app => LogicDecoupling,
] as Array<<M>(app: App) => Core<M>>;
