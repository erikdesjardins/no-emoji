export function locationToRootDomain(location /*: string | Location | URL */) /*: string */ {
	return new URL(location).host.split('.').slice(-2).join('.');
}
