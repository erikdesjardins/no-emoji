export function apiToPromise(fn) {
	return (...args) =>
		new Promise((resolve, reject) =>
			fn(...args, (...results) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(results.length > 1 ? results : results[0]);
				}
			})
		);
}
