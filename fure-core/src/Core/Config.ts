import path from 'path';
import { BehaviorSubject } from 'rxjs';
import { Core, Events } from './core';

export interface ConfigEvents<C> extends Events {
  load(): Promise<C>;
  save(config: C): Promise<void>;
}

export interface ConfigParser<C> {
  parse(text: string): C;
  dumps(config: C): string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const JsonParser: ConfigParser<any> = { parse: text => JSON.parse(text), dumps: config => JSON.stringify(config, undefined, '    ') };

// TODO 感觉不对，这不是我理想的效果。
// 配置编辑器应该单独拎出来，提供基础的api来快速的可视化配置，
// 可以单独运行配置编辑器，也可以把可视化界面嵌入到App的任何地方。
// 场景编辑器、剧本编辑器等等都应该是配置编辑器的一个子集实现。
// 还有，底层存储最好不用json，换成yaml之类比较好，按行存储感觉更加方便版本管理

const newCoreParams = (typeof window === 'undefined'
  // BACKEND
  ? <C>(url: string, parser: ConfigParser<C>) => {
    const afs = async () => { // eslint-disable-line @typescript-eslint/explicit-function-return-type
      const fs = await import('fs');
      const util = await import('util');
      return {
        readFile: util.promisify(fs.readFile),
        writeFile: util.promisify(fs.writeFile),
      };
    };

    const subject = new BehaviorSubject<C>(undefined as unknown as C);
    const events: ConfigEvents<C> = {
      async load() {
        const { readFile } = await afs();
        const text = String(await readFile(url));
        const config = parser.parse(text);
        subject.next(config);
        return config;
      },
      async save(config) {
        const text = parser.dumps(config);
        // rewrite file
        const { writeFile } = await afs();
        await writeFile(url, text, { flag: 'w' });
      },
    };
    events.load();
    return [events, subject] as const;
  }

  // FRONTEND
  : <C>(url: string, parser: ConfigParser<C>) => {
    const g = window; // eslint-disable-line no-undef
    const filename = path.basename(url);

    const subject = new BehaviorSubject<C>(undefined as unknown as C);
    const events: ConfigEvents<C> = {
      async load() {
        const text = await g.fetch(url).then(resp => resp.text());
        const config = parser.parse(text);
        subject.next(config);
        return config;
      },
      async save(config) {
        const text = parser.dumps(config);
        // download file
        const file = new g.Blob([text], { type: 'text/plain' });
        const save = g.document.createElement('a');
        save.download = filename;
        save.href = URL.createObjectURL(file);
        save.click();
      },
    };
    events.load();
    return [events, subject] as const;
  }
);

export class Config<C> extends Core<ConfigEvents<C>, C> {
  public constructor(url: string, parser: ConfigParser<C> = JsonParser) {
    super(url, ...newCoreParams<C>(url, parser));
  }
}
