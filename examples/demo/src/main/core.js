import { Core } from '@fure/core';
import { Subject } from 'rxjs';

const subject: Subject<{}> = new Subject();

const events = {
};

export default new Core(events, subject);
