export default {
	id: 'spiraty-craw',
	name: 'Spiraty Craw',
	icon: 'query_stats',
	description: 'Perform crawling and parsing videos data',
	overview: ({ prevent_recents }) => [
		{
			label: 'Prevent recents (in minute)',
			text: prevent_recents,
		},
	],
	options: [
		{
			field: 'prevent_recents',
			name: 'Prevent recents (in minute)',
			type: 'number',
			default: 15,
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};
