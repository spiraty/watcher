export default {
	id: 'spiraty-sece',
	name: 'Spiraty Section Export',
	icon: 'download_for_offline',
	description: 'Export videos in section to CSV',
	overview: ({ archived }) => [
		{
			label: 'Archived include?',
			text: archived,
		},
	],
	options: [
		{
			field: 'archived',
			name: 'Archived include?',
			type: 'Boolean',
			schema: {
				default_value: true,
			},
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};
