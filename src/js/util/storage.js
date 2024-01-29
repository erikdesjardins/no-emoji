export async function get(key, defaultVal) {
	const { [key]: val } = await chrome.storage.sync.get({ [key]: defaultVal });
	return val;
}

export async function set(key, val) {
	await chrome.storage.sync.set({ [key]: val });
}
