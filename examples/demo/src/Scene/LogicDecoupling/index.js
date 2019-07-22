import React, { useEffect, useMemo } from 'react';
import { map, scan, throttleTime } from 'rxjs/operators';
import { App, AppOptions, useSubscribe } from '@fure/view';
import './index.css';
import { LogicDecoupling as core } from '../../main/core';
import { Subject, interval } from 'rxjs';
import { pick } from '@fure/core';

const options: AppOptions = { width: 960, height: 1080, transparent: true };
type Attr = | 'fire' | 'water';

interface BubbleProps { life: number; attr: Attr }
const Bubble = ({ life, attr }: BubbleProps) => {
  const size = `${life && (0.5 + life)}em`;
  return (
    <div className={`Bubble ${attr}`} style={{ width: size, height: size }} />
  );
};

interface PlayerProps { attr: Attr }
const Player = ({ attr }: PlayerProps) => {
  const onTap = useMemo(() => {
    const subject = new Subject();
    subject.pipe(throttleTime(300)).subscribe(() => core.events.blow(attr));
    return event => subject.next(event);
  }, [attr]);
  return (
    <div className={`Player ${attr}`} onClick={onTap} onTouchStart={onTap} />
  );
};

const Message = ({ value = [], show }: { value: [string, number][]; show: number }) => {
  const now = useSubscribe(useMemo(() => interval(1000 / 30).pipe(map(() => new Date().getTime())), []), 0);
  const messages = value.map(([message, insertAt]): [string, number] => [message, now - insertAt]).filter(([, time]) => (time < show));
  return (
    <div className="Message">{messages.map(([message, time], index) => (
      <p key={index} style={{ opacity: Math.cos(time / show) }}>{message}</p>
    ))}</div>
  );
};
Message.queue = scan((queue: [[string, number]], message: string): [[string, number]] => [...queue.slice(1 - 5), [message, new Date().getTime()]], []);

interface GameProps { player: PlayerProps & { name: string } }
const Game = ({ player }: GameProps) => {
  const life = useSubscribe(useMemo(() => core.pipe(pick('life')), []), 0);
  const attr = useSubscribe(useMemo(() => core.pipe(pick('attr')), []));
  const messages = useSubscribe(useMemo(() => core.pipe(pick('message')).pipe(Message.queue), []));

  useEffect(() => {
    core.events.join(player.name, player.attr);
    return () => core.events.leave(player.name);
  }, [player.name, player.attr]);

  return (
    <App {...App.Creator(options)}>
      <p className="name">{player.name}</p>
      {attr && <Bubble life={life} attr={attr} />}
      <Player attr={player.attr} />
      <Message value={messages} show={3000} />
    </App>
  );
};

export const LogicDecoupling = () => {
  return (
    <div className="LogicDecoupling">
      <Game player={{ name: 'Girl', attr: 'fire' }} />
      <Game player={{ name: 'Boy', attr: 'water' }} />
    </div>
  );
};
LogicDecoupling.displayName = 'LogicDecoupling';
LogicDecoupling.displayText = 'Logic Decoupling';
export default LogicDecoupling;
