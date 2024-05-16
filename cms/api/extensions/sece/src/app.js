export default {
	id: 'spiraty-sece',
	name: 'Spiraty Section Export',
	icon: 'download_for_offline',
	description: 'Export videos in section to CSV',
	overview: ({ archived }) => [
		{
			label: 'Including archived items?',
			text: archived,
		},
	],
	options: [
		{
			field: 'archived',
			name: 'Archived include?',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'select-dropdown',
				options: {
					choices: [
						{
							text: 'No',
							value: 'No',
						},
						{
							text: 'Yes',
							value: 'Yes',
						},
					],
				},
			},
		},
	],
};
