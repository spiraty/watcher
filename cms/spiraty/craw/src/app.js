export default {
	id: 'spiraty-craw',
	name: 'Spiraty Craw',
	icon: 'troubleshoot',
	description: 'Perform crawling and parsing videos data',
	overview: () => [],
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
