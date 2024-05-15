// import { crawData } from './helper';
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
	id: 'spiraty-craw',
	handler: async ({ prevent_recents }, { data, database: db, accountability }) => {
		try {
			// video ids
			const ids = data['$trigger']?.body?.keys;

			if (!Array.isArray(ids) || ids.length === 0) throw new Error('Invalid payload data');

			// query videos data
			let vids = await db
				.select('scanned_at', 'platform', 'code', 'channel_url', 'video_id', 'status')
				.from('Video')
				.whereIn('video_id', ids);

			if (!Array.isArray(vids) || vids.length === 0) throw new Error('Empty data retrieve');

			// filter video to craw
			if (prevent_recents > 0) {
				const period_limit = prevent_recents * 60000;

				vids = vids.filter((el) => {
					return (
						(el?.scanned_at === null || new Date().getTime() - new Date(el?.scanned_at).getTime() > period_limit) &&
						el?.status === 'published' &&
						el?.platform > 0 &&
						el?.code &&
						(el?.channel_url || el?.platform == 1)
					);
				});
			}

			if (Array.isArray(vids) && vids.length > 0) {
				// make the video url
				vids = vids.map((el) => {
					el['url'] =
						el?.platform == 1 ? 'https://www.youtube.com/watch?v=' + el?.code : el?.channel_url + '/video/' + el?.code;

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

						// insert into record
						// await db('Record').insert({
						// 	video_id: vids[i]?.video_id,
						// 	views: data?.view,
						// 	likes: data?.like,
						// 	scanned_at,
						// 	date_created: scanned_at,
						// 	user_created: accountability.user,
						// });
					} else {
						// turn video into archive mode
						// await db('Video').where('video_id', vids[i]?.video_id).update({
						// 	status: 'archived',
						// 	title: 'Invalid video code or private video!',
						// });
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	},
};
