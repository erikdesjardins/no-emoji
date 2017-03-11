import { STORAGE_EXCLUDED_DOMAINS } from './util/constants';
import { locationToRootDomain } from './util/location';
import { get, set } from './util/storage';

chrome.runtime.onMessage.addListener((enabling, { tab: { id: tabId } }, sendResponse) => {
	// content script telling us that it ran on this page
	if (enabling) {
		enablePageAction(tabId);
	} else {
		disablePageAction(tabId);
	}
	sendResponse();
});

chrome.pageAction.onClicked.addListener(async ({ id: tabId, url }) => {
	const excludedDomains = await get(STORAGE_EXCLUDED_DOMAINS, []);
	const domain = locationToRootDomain(url);

	if (excludedDomains.includes(domain)) {
		// enabling on this domain
		await set(STORAGE_EXCLUDED_DOMAINS, excludedDomains.filter(x => x !== domain));
		enablePageAction(tabId);
	} else {
		// disabling on this domain
		await set(STORAGE_EXCLUDED_DOMAINS, [...excludedDomains, domain]);
		disablePageAction(tabId);
	}
});

function enablePageAction(tabId) {
	chrome.pageAction.show(tabId);
	chrome.pageAction.setTitle({ tabId, title: 'stop removing emoji on this domain' });
}

function disablePageAction(tabId) {
	chrome.pageAction.hide(tabId);
	chrome.pageAction.setTitle({ tabId, title: 'start removing emoji on this domain' });
}
