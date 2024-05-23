<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<!-- eslint-disable no-console -->
<script>
import { useApi } from '@directus/extensions-sdk';
import { ref } from 'vue';
export default {
	props: {
		showHeader: {
			type: Boolean,
			default: false,
		},
		buttonLabel: {
			type: String,
			default: '',
		},
	},
	setup(props) {
		const api = useApi();
		const submitConfirmation = ref(false);
		const recipient = ref('');
		const section_id = ref();
		const txtLinks = ref();
		const sections = ref([]);
		const linkImported = ref(0);
		const linkInputed = ref(0);
		const importErrors = ref([]);

		async function fetchResults() {
			try {
				sections.value = [];
				const query = await api.get(`/items/Section`, { params: { limit: -1 } });
				const res = query.data.data;

				res.forEach((item) => {
					sections.value.push({
						text: item?.name,
						value: item?.section_id,
					});
				});
			} catch (err) {
				console.warn(err);
			}
		}

		fetchResults();

		return {
			txtLinks,
			sections,
			recipient,
			section_id,
			submitConfirmation,
			submitLinks,
			updateSection,
			updateLinks,
			restForm,
			linkImported,
			linkInputed,
			importErrors,
		};

		function updateSection(value) {
			section_id.value = value;
			return;
		}

		function updateLinks(value) {
			linkInputed.value = parseLink(value).length;
			return;
		}

		function parseLink(txt) {
			try {
				const pattern = /\r\n|\r|\n/;
				const links = txt.split(pattern);

				if (links.length > 0) {
					const results = [];

					const ytPattern =
						/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gim;

					const ttPattern =
						/^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;

					links.forEach((link) => {
						const item = {};

						if (link.match(ytPattern)) {
							item.platform = 1;
							// get the video id
							const test = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
							const matcher = link.match(test);
							if (typeof matcher[2] !== 'undefined') item.code = matcher[2];
							item.url = link;
						} else if (link.match(ttPattern)) {
							item.platform = 2;

							const test =
								/^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;

							const matcher = link.match(test);

							if (typeof matcher[2] !== 'undefined') {
								item.code = matcher[2];
								item.channel_url = 'https://www.tiktok.com/' + matcher[1].substring(0, matcher[1].indexOf('/'));
							}

							item.url = link;
						}

						results.push(item);
					});

					return results;
				}
			} catch (e) {
				console.log(e);
				return [];
			}
		}

		async function submitLinks() {
			linkImported.value = 0;
			importErrors.value = [];

			const links = parseLink(txtLinks.value);
			linkInputed.value = links.length;

			if (Array.isArray(links)) {
				// check to create new section
				let secId = null;
				if (isNaN(section_id.value) && (typeof section_id.value === 'string' || section_id.value instanceof String)) {
					const response = await api.post('/items/Section', { name: section_id.value.trim() });

					if (response?.status == 200) {
						secId = response.data?.data?.section_id;
					}
				} else secId = section_id.value;

				let lastVidId = 0;
				// fetch the bigest video id
				const response = await api.get('/items/Video?sort=-video_id&limit=1&fields[]=video_id');

				if (response?.status == 200) {
					lastVidId = response.data?.data[0]?.video_id;
				}

				secId > 0 &&
					links.forEach((item, idx) => {
						const objVid = {
							section: secId,
							channel_url: item?.channel_url,
							platform: item?.platform,
							code: item?.code,
							status: 'published',
						};

						// assign video id
						if (lastVidId > 0) objVid['video_id'] = lastVidId + idx + 1;

						api
							.post(`/items/Video`, objVid)
							.then((response) => {
								if (response?.status == 200) {
									linkImported.value += 1;
								} else {
									importErrors.value.push({
										url: item?.url,
										error: {
											code: response.data.code,
											message: response.data.message,
										},
									});
								}
							})
							.catch((error) => {
								importErrors.value.push({
									url: item?.url,
									error,
								});
							});
					});
			}

			return;
		}

		function restForm() {
			section_id.value = '';
			txtLinks.value = '';
			return;
		}
	},
};
</script>

<template>
	<div class="spiraty-card" :class="{ 'has-header': showHeader }">
		<v-select
			:model-value="section_id"
			:items="sections"
			placeholder="Chọn Section"
			:allow-other="true"
			:close-on-content-click
			:value="section_id"
			@update:model-value="updateSection($event)"
		></v-select>
		<v-textarea v-model="txtLinks" class="text-area-content" @update:model-value="updateLinks($event)"></v-textarea>
		<v-dialog
			v-model="submitConfirmation"
			@esc="
				submitConfirmation = false;
				refresh();
			"
		>
			<template #activator="{ on }">
				<v-button v-if="section_id != undefined && txtLinks != undefined && linkInputed > 0" @click="on">
					{{ buttonLabel }}
				</v-button>
				<v-button v-else secondary disabled>{{ buttonLabel }}</v-button>
			</template>
			<v-sheet v-if="section_id != undefined">
				<div v-if="linkImported === 0">
					<h2 class="spiraty-modal-header">Tải lên các video</h2>
					<p class="spiraty-message">
						Bạn muốn tải lên {{ linkInputed }} video từ danh sách các liên kết được phân tách bằng xuống dòng?
					</p>
				</div>

				<v-notice v-if="importErrors.length > 0" type="danger" icon="warning">
					Có lỗi xảy ra khi tải lên {{ importErrors.length }} liên kết.
				</v-notice>
				<v-notice v-if="linkImported > 0" type="success" icon="done">
					{{ linkImported }} video đã được đăng lên và quét dữ liệu thành công.
				</v-notice>
				<div class="spiraty-actions">
					<v-button v-if="linkImported === 0" secondary @click="submitConfirmation = false">Đóng</v-button>
					<v-button v-if="linkImported === 0" @click="submitLinks()">Xác nhận</v-button>
					<div v-if="linkImported > 0">
						<a href="/admin/content/Video">
							<v-button>Danh sách video</v-button>
						</a>
						<v-button
							@click="
								submitConfirmation = false;
								restForm();
							"
						>
							Xong
						</v-button>
					</div>
				</div>
			</v-sheet>
		</v-dialog>
	</div>
</template>

<style scoped>
.spiraty-card {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 0 1em 1em;
}

.text-area-content {
	flex-grow: 1;
	margin: 1em 0;
	max-height: none;
}

.spiraty-modal-header {
	font-weight: bold;
	font-size: 1.3em;
}

.spiraty-message {
	margin: 1em 0;
}

.spiraty-actions {
	text-align: right;
	padding: 1em 0 0;
	.v-button {
		margin: 0 0.5em 0;
	}
}
</style>
