<script>
import { ref, watch } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { useRouter } from 'vue-router';
import PageNavigation from './components/navigation.vue';

export default {
	components: {
		PageNavigation,
	},

	props: {
		page: {
			type: String,
			default: 'home',
		},
	},

	setup(props) {
		const router = useRouter();
		const api = useApi();
		const page_title = ref('');
		const page_banner = ref('');
		const page_cards = ref([]);
		const page_body = ref('');

		const breadcrumb = ref([
			{
				name: 'Home',
				to: `/spiraty-scanner`,
			},
		]);

		const all_pages = ref([]);

		render_page(props.page);
		fetch_all_pages();

		watch(
			() => props.page,
			() => {
				render_page(props.page);
			},
		);

		function change_page(to) {
			const next = router.resolve(`${to}`);
			router.push(next);
		}

		return { page_title, page_banner, page_cards, page_body, breadcrumb, all_pages, change_page };

		function render_page(page) {
			if (page === null) {
				page_title.value = '500: Internal Server Error';
				breadcrumb.value.splice(1, 1);
				page_cards.value = [];
				page_body.value = '';
			} else {
				switch (page) {
					case 'home':
						page_title.value = 'Recents';
						page_cards.value = all_pages.value;
						page_body.value = '<p>a</p>';
						break;
					case 'by-section':
						page_title.value = 'Scan By Section';
						page_cards.value = all_pages.value;
						page_body.value = '<p>b</p>';
						break;
					case 'by-videos':
						page_title.value = 'Scan By Videos';
						page_cards.value = [];
						page_body.value = '<p>c</p>';
						break;
					default:
						page_title.value = '404: Not Found';
				}

				if (page === 'home') {
					breadcrumb.value.splice(1, 1);
				} else {
					breadcrumb.value[1] = {
						name: page_title.value,
						to: `/spiraty-scanner/${page}`,
					};
				}
			}
		}

		function fetch_all_pages() {
			all_pages.value = [
				{
					label: 'Recents',
					uri: 'spiraty-scanner',
					to: '/spiraty-scanner',
					icon: 'update',
				},
				{
					label: 'By Section',
					uri: 'by-section',
					to: '/spiraty-scanner/by-section',
					icon: 'folder_open',
				},
				{
					label: 'By Videos',
					uri: 'by-videos',
					to: '/spiraty-scanner/by-videos',
					icon: 'video_settings',
				},
			];
		}
	},
};
</script>

<template>
	<private-view id="spiraty-container" :title="page_title">
		<template v-if="breadcrumb" #headline>
			<v-breadcrumb :items="breadcrumb" />
		</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="compare_arrows" />
			</v-button>
		</template>
		<template #actions>test</template>
		<template #navigation>
			<page-navigation :current="page" :pages="all_pages" />
		</template>
		<div class="padding-box">
			<div v-if="page_body" v-html="page_body"></div>
		</div>
	</private-view>
</template>

<style lang="scss">
#spiraty-container {
	.padding-box {
		padding: var(--content-padding);
		padding-top: 0;
	}
	aside#sidebar {
		display: none;
		visibility: hidden;
	}
}
</style>
