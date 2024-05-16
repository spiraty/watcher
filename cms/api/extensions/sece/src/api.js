/* eslint-disable no-console */

export default {
	id: 'spiraty-sece',
	handler: async ({ archived }, { data, services, database: db, accountability, getSchema }) => {
		try {
			const section_id = data['$trigger'].body?.keys[0];
			// craw new data
			if (isNaN(section_id) || section_id < 1) throw new Error('Invalid payload data');

			const fields = [
				'code',
				'title',
				'views',
				'likes',
				'duration',
				'scanned_at',
				'platform.Title',
				'section.name',
				'channel_url',
				'channel_name',
			];

			const filter = { section: { _eq: section_id } };

			if (archived == 'No') {
				filter.status = { _eq: 'published' };
			} else {
				fields.push('status');
			}

			const { ExportService } = services;
			const schema = await getSchema({ db });

			const exportService = new ExportService({ schema, accountability, knex: db });

			// Video?limit=1000&fields[]=status&fields[]=views&fields[]=likes&fields[]=posted_at&fields[]=title&fields[]=scanned_at&fields[]=platform.Title&fields[]=platform.platform_id&fields[]=section.name&fields[]=section.section_id&fields[]=duration&fields[]=channel_url&fields[]=video_id&sort[]=-likes&page=1&filter[status][_neq]=archived
			exportService.exportToFile('Video', { fields, filter }, 'csv');
		} catch (e) {
			console.log('spiraty-sece error: ', e);
		}
	},
};
