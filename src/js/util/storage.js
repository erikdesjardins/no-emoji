import { apiToPromise } from './promise';

const _get = apiToPromise((keys, callback) => chrome.storage.sync.get(keys, callback));

export async function get(key, defaultVal = null) {
	const { [key]: val } = await _get({ [key]: defaultVal });
	return val;
}

const _set = apiToPromise((items, callback) => chrome.storage.sync.set(items, callback));

export async function set(key, val) {
	await _set({ [key]: val });
}
