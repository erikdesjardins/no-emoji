import emojiRegexFactory from 'emoji-regex';

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

	const emojiRegex = emojiRegexFactory();

	// remove emoji
	new MutationObserver(mutationRecords => {
		for (const record of mutationRecords) {
			for (const node of record.addedNodes) {
				// avoid walking the tree (60% improvement)
				if (!emojiRegex.test(node.textContent)) continue;

				const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
				while (walker.nextNode()) {
					// avoid reads of .nodeValue (5% improvement)
					const oldVal = walker.currentNode.nodeValue;
					// (not using .test first to avoid running regex twice (10% improvement)
					const newVal = oldVal.replace(emojiRegex, '');
					// avoid writes of .nodeValue (5% improvement)
					if (newVal !== oldVal) {
						walker.currentNode.nodeValue = newVal;
					}
				}
			}
		}
	}).observe(document, { childList: true, subtree: true });
})();
