import icon19 from '../images/icon19.png';
import icon38 from '../images/icon38.png';
import iconDisabled19 from '../images/icon19-disabled.png';
import iconDisabled38 from '../images/icon38-disabled.png';
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
	chrome.pageAction.setIcon({ tabId, path: { 19: icon19, 38: icon38 } });
}

function disablePageAction(tabId) {
	chrome.pageAction.show(tabId);
	chrome.pageAction.setTitle({ tabId, title: 'start removing emoji on this domain' });
	chrome.pageAction.setIcon({ tabId, path: { 19: iconDisabled19, 38: iconDisabled38 } });
}
