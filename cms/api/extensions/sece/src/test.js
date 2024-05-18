const x = {
	limit: 50,
	fields: ['title', 'status', 'views', 'likes', 'posted_at', 'duration', 'platform', 'channel_name', 'scanned_at'],
	filter: { _and: [{ status: { _eq: 'published' } }] },
	layout: 'table',
	template: '{{status}}{{code}}',
	enableLink: true,
	tableSpacing: 'compact',
	enableSearchFilter: true,
};
