/* eslint-disable no-console */
import { parse } from 'node-html-parser';
import { dbDate, parseTiktok, parseYoutube, toTime } from './helper';

const crawData = async (url, platform) => {
	try {
		const response = await fetch(url, {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
		});

		if (response.ok) {
			const html = await response.text();
			let stats = null;

			if (platform === 1) {
				stats = parseYoutube(html);
			} else if (platform === 2) {
				const dom = parse(html);
				const jsonScript = dom.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
				if (typeof jsonScript !== 'object') throw new Error('cant find tiktok REHYDRATION tag');
				stats = parseTiktok(jsonScript.text);
			}

			return stats;
		} else {
			throw new Error(
				'fetch failure in crawData. Response status ' + response.status + ' with text ' + response.statusText,
			);
		}
	} catch (e) {
		console.log('crawData failure: ', e);
	}
};

export default {
	id: 'spiraty-secs',
	handler: async ({ prevent_recents }, { data, database: db, accountability, services, getSchema }) => {
		try {
			const section_id = data['$trigger'].body?.keys[0];
			// craw new data
			if (isNaN(section_id) || section_id < 1) throw new Error('Invalid payload data');

			// prevent recents
			const timestamp = Date.now();

			// query videos data
			let vids = await db
				.select('scanned_at', 'platform', 'code', 'channel_url', 'video_id', 'status')
				.from('Video')
				.where(function () {
					this.where('scanned_at', null).orWhere('scanned_at', '<', dbDate(timestamp - prevent_recents * 60000));
				})
				.andWhere({ section: section_id, status: 'published' });

			if (!Array.isArray(vids) || vids.length === 0) throw new Error('Empty data retrieve');

			// filter valid video to craw
			vids = vids.filter((el) => {
				return el?.platform > 0 && el?.code && (el?.channel_url || el?.platform == 1);
			});

			if (Array.isArray(vids) && vids.length > 0) {
				// make the video url
				vids = vids.map((el) => {
					el['url'] =
						el?.platform == 1
							? 'https://www.youtube.com/watch?v=' + el?.code
							: 'https://www.tiktok.com/@' + el?.channel_url + '/video/' + el?.code;

					return el;
				});

				const scanned_at = dbDate();

				// scan and parse the info
				for (let i = 0; i < vids.length; i++) {
					const data = await crawData(vids[i]?.url, vids[i]?.platform);

					if (data != null && typeof data == 'object' && typeof data['view'] != 'undefined') {
						// update current video
						await db('Video')
							.where('video_id', vids[i]?.video_id)
							.update({
								views: data?.view,
								likes: data?.like,
								scanned_at,
								posted_at: data?.posted_at,
								title: data?.title,
								channel_name: data?.chanelName,
								channel_url: data?.chanelUrl,
								duration: toTime(data?.duration),
								status: 'published',
							});
					}
				}

				// insert update activity of current section
				const { ActivityService } = services;
				const schema = await getSchema({ db });

				const activityService = new ActivityService({
					schema: schema,
					accountability: accountability,
					knex: db,
				});

				await activityService.createOne({
					action: 'comment',
					comment: '🟢  quét dữ liệu mới các video trong section thành công',
					user: accountability?.user ?? null,
					collection: 'Section',
					ip: accountability?.ip ?? null,
					user_agent: accountability?.userAgent ?? null,
					origin: accountability?.origin ?? null,
					item: section_id,
				});
			}
		} catch (e) {
			console.log('spiraty-secs error: ', e);
		}
	},
};
