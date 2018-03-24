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

	const emoji = emojiRegexFactory();

	// remove emoji
	new MutationObserver(mutationRecords => {
		const seenThisTick = new Set();

		for (const record of mutationRecords) {
			for (const node of record.addedNodes) {
				// avoid running on trees where the parent was just walked (30% improvement)
				seenThisTick.add(node);
				if (seenThisTick.has(node.parentNode)) continue;

				// avoid walking the tree (60% improvement)
				if (!emoji.test(node.textContent)) continue;

				const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
				while (walker.nextNode()) {
					// avoid reads of .nodeValue (5% improvement)
					const oldVal = walker.currentNode.nodeValue;
					// not using .test first to avoid running regex twice (10% improvement)
					// note: in testing `re.test(text)` and `text.replace(re, '') === text`
					//       have approximately the same performance for negative results,
					//       which is all that matters, because for positive results
					//       we always have to run the replace anyways.
					const newVal = oldVal.replace(emoji, '');
					// avoid writes of .nodeValue (5% improvement)
					if (newVal !== oldVal) {
						walker.currentNode.nodeValue = newVal;
					}
				}
			}
		}
	}).observe(document, { childList: true, subtree: true });
})();
