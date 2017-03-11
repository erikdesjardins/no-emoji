import { apiToPromise } from './promise';

const _send = apiToPromise(chrome.runtime.sendMessage);

export function send(msg) {
	return _send(msg);
}
