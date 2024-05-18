/* eslint-disable no-console */
import { randomUUID } from 'node:crypto';
import { dbDate, slugify } from './helper';
import open from 'open';

export default {
	id: 'spiraty-sece',
	handler: async ({ archived }, { data, services, database: db, accountability, getSchema, env }) => {
		try {
			// processed section
			const section_id = data['$trigger'].body?.keys[0];
			if (isNaN(section_id) || section_id < 1) throw new Error('Invalid payload data');

			// query section info
			const section = await db('Section').where({ section_id }).first();

			// query the display fields of relation
			const relation = await db('directus_fields').where({ collection: 'Section', field: 'videos' }).first();
			let fields = JSON.parse(relation.options)?.fields;

			// platform and section append
			fields = fields.map((el) => (el == 'platform' ? 'platform.Title' : el));
			fields.push('section.name');

			// video items filter
			const filter = { section: { _eq: section_id } };

			if (archived == 'No') {
				filter.status = { _eq: 'published' };
			} else {
				fields.push('status');
			}

			// sort by date_created DESC
			const sort = ['-date_created'];

			// process export/download
			const { ExportService } = services;
			const schema = await getSchema({ db });
			const exportService = new ExportService({ schema, accountability, knex: db });

			// file info
			const title = `export-section-${slugify(section.name)}-${dbDate()}`;

			const file = {
				id: randomUUID(),
				title,
				filename_disk: `${title}.csv`,
				filename_download: `${title}.csv`,
				charset: 'utf-8',
				description: section?.description,
			};

			await exportService.exportToFile('Video', { fields, filter, sort }, 'csv', { file });

			// download file
			open(`${env?.PUBLIC_URL}/assets/${file?.id}?download`, '_blank', `${file?.filename_disk}`);
		} catch (e) {
			console.log('spiraty-sece error: ', e);
		}
	},
};
