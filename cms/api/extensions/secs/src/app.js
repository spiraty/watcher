export default {
	id: 'spiraty-secs',
	name: 'Spiraty Section Craw',
	icon: 'query_stats',
	description: 'Scan data of all videos in section',
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
