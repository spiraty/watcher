import ModuleComponent from './module.vue';

export default {
	id: 'spiraty-scanner',
	name: 'Scanner',
	icon: 'compare_arrows',
	routes: [
		{
			name: 'Home',
			path: '',
			props: true,
			component: ModuleComponent,
		},
		{
			name: 'page',
			path: ':page',
			props: true,
			component: ModuleComponent,
		},
	],
};
