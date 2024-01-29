import icon19 from '../images/icon19.png';
import icon38 from '../images/icon38.png';
import iconDisabled19 from '../images/icon19-disabled.png';
import iconDisabled38 from '../images/icon38-disabled.png';
import { STORAGE_EXCLUDED_DOMAINS } from './util/constants';
import { locationToRootDomain } from './util/location';
import { get, set } from './util/storage';

chrome.runtime.onMessage.addListener((enabled, { tab: { id: tabId } }, sendResponse) => {
	// content script telling us that it ran on this page
	if (enabled) {
		showActionEnabled(tabId);
	} else {
		showActionDisabled(tabId);
	}
	sendResponse();
});

chrome.action.onClicked.addListener(async ({ id: tabId, url }) => {
	const domain = locationToRootDomain(url);

	// We can't await this here, because any promise chaining will break the "user intraction" context...
	const alreadyHadPermission = chrome.permissions.contains({ origins: [url] });
	try {
		// ...which is required for this call to work.
		await chrome.permissions.request({ origins: [url] });
	} catch (e) {
		console.error('Failed to request permissions for tab:', e);
	}

	if (!await alreadyHadPermission) {
		// We just retrieved the permission, so don't toggle the activation state of the extension.
		// This will happen e.g. on Firefox after the first click on the action for a domain,
		// since Firefox forces all extensions to request domain permissions dynamically in MV3.
		console.log(`First time requesting permissions for ${domain}, not toggling activation state.`);
		return;
	}

	const excludedDomains = await get(STORAGE_EXCLUDED_DOMAINS, []);

	if (excludedDomains.includes(domain)) {
		// enabling on this domain
		await set(STORAGE_EXCLUDED_DOMAINS, excludedDomains.filter(x => x !== domain));
		showActionEnabled(tabId);
		console.log(`Enabling the extension on ${domain}.`);
	} else {
		// disabling on this domain
		await set(STORAGE_EXCLUDED_DOMAINS, [...excludedDomains, domain]);
		showActionDisabled(tabId);
		console.log(`Disabling the extension on ${domain}.`);
	}
});

function showActionEnabled(tabId) {
	chrome.action.setTitle({ tabId, title: chrome.i18n.getMessage('stopRemovingEmoji') });
	chrome.action.setIcon({ tabId, path: { 19: icon19, 38: icon38 } });
}

function showActionDisabled(tabId) {
	chrome.action.setTitle({ tabId, title: chrome.i18n.getMessage('startRemovingEmoji') });
	chrome.action.setIcon({ tabId, path: { 19: iconDisabled19, 38: iconDisabled38 } });
}
