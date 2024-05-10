import PanelComponent from './panel.vue';

export default {
	id: 'spiraty-bulk',
	name: 'Spiraty Bulk',
	icon: 'post_add',
	description: 'Panel to bulk create videos from list of link',
	component: PanelComponent,
	options: [
		{
			field: 'buttonLabel',
			name: 'Button Label',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
			},
		},
	],
	minWidth: 12,
	minHeight: 5,
};
