<script>
export default {
	props: {
		showHeader: {
			type: Boolean,
			default: false,
		},
		text: {
			type: String,
			default: '',
		},
	},
};
</script>

<template>
	<div class="text" :class="{ 'has-header': showHeader }">
		{{ text }}
	</div>
</template>

<style scoped>
.text {
	padding: 12px;
}

.text.has-header {
	padding: 0 12px;
}
</style>
