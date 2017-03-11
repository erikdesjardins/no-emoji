import emojiRegex from 'emoji-regex';

import { STORAGE_EXCLUDED_DOMAINS } from './util/constants';
import { locationToRootDomain } from './util/location';
import { send } from './util/messaging';
import { get } from './util/storage';

(async () => {
	const excludedDomains = await get(STORAGE_EXCLUDED_DOMAINS, []);

	// check if we're disabled on this domain
	if (excludedDomains.includes(locationToRootDomain(location))) {
		// hide the pageAction
		send(false);
		return;
	} else {
		// show the pageAction
		send(true);
	}

	// walk the tree
	new MutationObserver(mutationRecords => {
		for (const record of mutationRecords) {
			console.log(record.type);
		}
	}).observe(document, { childList: true, characterData: true, subtree: true });
})();
