import { Core } from './core';
import { Subject } from 'rxjs';

const newCoreParams = (typeof window === 'undefined'
  // BACKEND
  ? <C>(url: string) => {
    const subject = new Subject<C>();
    const events = {
      async load(): Promise<void> {
      },
      async save(): Promise<void> {
      },
    };
    return [events, subject] as const;
  }

  // FRONTEND
  : <C>(url: string) => {
    const subject = new Subject<C>();
    const events = {
      async load(): Promise<void> {
        // eslint-disable-next-line no-undef
        fetch(url).then(resp => resp.text()).then(text => JSON.parse(text)).then(config => subject.next(config));
      },
      async save(): Promise<void> {
      },
    };
    return [events, subject] as const;
  }
);

export class Config<C> extends Core<{ save(): Promise<void> }, C> {
  public constructor(url: string) {
    super(url, ...newCoreParams<C>(url));
  }
}
