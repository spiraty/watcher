export default {
	id: 'spiraty-secs',
	name: 'Spiraty Section Craw',
	icon: 'query_stats',
	description: 'Scan data of all videos in section',
	overview: ({ text }) => [
		{
			label: 'Text',
			text: text,
		},
	],
	options: [
		{
			field: 'text',
			name: 'Text',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};
