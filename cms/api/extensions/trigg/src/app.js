export default {
	id: 'spiraty-trigg',
	name: 'Spiraty Trigger',
	icon: 'bolt',
	description: 'Trigger right after a video is created',
	overview: ({ operation_comment }) => [
		{
			label: 'Comment',
			text: operation_comment,
		},
	],
	options: [
		{
			field: 'operation_comment',
			name: 'Comment',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};
