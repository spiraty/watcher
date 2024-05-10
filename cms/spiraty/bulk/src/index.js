import PanelComponent from './panel.vue';

export default {
	id: 'spiraty_bulk',
	name: 'Spiraty Bulk',
	icon: 'post_add',
	description: 'Panel to bulk create videos from list of link',
	component: PanelComponent,
	options: [
		{
			field: 'responseFormat',
			name: 'Response',
			type: 'string',
			meta: {
				interface: 'system-display-template',
				width: 'full',
			},
		},
	],
	minWidth: 12,
	minHeight: 8,
};
