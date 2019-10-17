/**
 * @example
 * 'command1 command2 -a 1 --bbb false arg1 arg2 --c' -> [ 'command1', 'command2', 'arg1', 'arg2', 'a': '1', 'bbb': 'false', 'c': 'true' }.
 *
 * @param argv .
 * @param init default arguments.
 */
export const parseArgs = <K extends string>(argv: string[], init?: Record<K, string>): Record<K, string> & string[] => {
  const args = [] as unknown as Record<K, string> & string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init && Object.entries(init).forEach(([key, value]) => (args as any)[key] = value);

  let index = -1;
  while (++index < argv.length) {
    const arg = argv[index].trim();
    // 不是key，则直接放入args里
    if (!arg.startsWith('-')) {
      args.push(arg);
      continue;
    }

    const key = arg.slice(arg.startsWith('--') ? 2 : 1) as K;
    const value = (argv[index + 1] || '').trim();
    // 无下一个参数或下一个参数是key，则当前key为bool标记，值为true
    if (!value || value.startsWith('-')) {
      args[key] = 'true' as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      continue;
    }

    // 下一个参数是值，则将key-value对存入args里
    index++;
    args[key] = value as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  return args;
};
