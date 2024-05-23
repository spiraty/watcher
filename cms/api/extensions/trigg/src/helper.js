/* eslint-disable no-console */
export const toTime = (num) => {
	if (num > 0) {
		var hours = Math.floor(num / 3600);
		var mins = Math.floor((num % 3600) / 60);
		var sec = num % 60;

		let dur = sec;
		if (mins > 0 && mins < 10) dur = '0' + mins + ':' + dur;
		else if (mins >= 10) dur = mins + ':' + dur;

		if (hours > 0 && hours < 10) dur = '0' + hours + ':' + dur;
		else if (hours >= 10) dur = hours + ':' + dur;

		return dur;
	}

	return 0;
};

export const parseTiktok = (str) => {
	try {
		const json = JSON.parse(str);
		const vidInfo = json['__DEFAULT_SCOPE__']['webapp.video-detail']['itemInfo']['itemStruct'];
		const stats = vidInfo['statsV2'];

		if (typeof stats !== 'object' || typeof stats['playCount'] === 'undefined') throw new Error('cant read stats');

		// good for now
		return {
			view: stats?.playCount,
			like: stats?.diggCount,
			share: stats?.shareCount,
			comment: stats?.commentCount,
			title: vidInfo?.desc,
			chanelUrl: vidInfo['author']['uniqueId'],
			chanelName: '@' + vidInfo['author']['nickname'],
			posted_at: dbDate(vidInfo?.createTime * 1000),
			duration: vidInfo['video']['duration'],
		};
	} catch (e) {
		console.log('parseTiktok error: ', e);
		return null;
	}
};

export const parseYoutube = (str) => {
	try {
		if (!str) throw new Error('Invalid str parameter value');
		let pattern = /(var ytInitialPlayerResponse =)(.*?)(};<\/script>)/gi;
		let result = str.match(pattern)[0].replace(/var ytInitialPlayerResponse =|;<\/script>/gi, '');

		let json = JSON.parse(result);

		const title = json['videoDetails']['title'];
		const view = json['videoDetails']['viewCount'];

		const chanelName = json['videoDetails']['author'];

		const chanelUrl = json['microformat']['playerMicroformatRenderer']['ownerProfileUrl'].replace(
			'http://www.youtube.com/',
			'',
		);

		const posted_at = dbDate(json['microformat']['playerMicroformatRenderer']['publishDate']);
		const duration = json['videoDetails']['lengthSeconds'];

		// read like count
		pattern = /(\[{"factoidRenderer)(.*)("}}\],"channelNavigationEndpoint)/;
		result = str.match(pattern);

		let txtLike = '0';

		if (result !== null && typeof result[0] !== 'undefined') {
			result = result[0].replace(',"channelNavigationEndpoint', '');

			json = JSON.parse(result);
			if (json.length < 2) throw new Error('Cant read info from youtube response html correctly');
			txtLike = json[0]['factoidRenderer']['value']['simpleText'];
		} else {
			//"iconName":"LIKE","title":"
			const from = str.indexOf('"iconName":"LIKE","title":"');

			if (from > -1) {
				const to = str.indexOf('"', from + 27);
				txtLike = str.substring(from + 27, to);
			}
		}

		const share = 0;
		const comment = 0;

		return {
			view,
			like: reverseRounded(txtLike),
			share,
			comment,
			title,
			chanelUrl,
			chanelName,
			posted_at,
			duration,
		};
	} catch (e) {
		console.log(e);
		return null;
	}
};

export const dbDate = (str) => {
	let date = null;

	if (str) {
		date = new Date(str);
	} else {
		date = new Date();
		date.setHours(date.getHours() + 7);
	}

	var iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);

	return iso[1] + ' ' + iso[2];
};

const reverseNum = (num) => {
	var p = num.split();
	for (var i = 0; i < p.length; i++) p[i] = p[i].replace(/\D/g, '');
	return p.join('');
};

const reverseRounded = (num) => {
	if (num.indexOf('N') > 0 || num.indexOf('K') > 0) {
		return reverseNum(num) * 1000;
	} else if (num.indexOf('T') > 0 || num.indexOf('M') > 0) {
		return reverseNum(num) * 1000000;
	}

	return reverseNum(num);
};
