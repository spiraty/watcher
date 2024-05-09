export const parseTiktok = (str) => {
	try {
		const json = JSON.parse(str);
		const vidInfo = json['__DEFAULT_SCOPE__']['webapp.video-detail']['itemInfo']['itemStruct'];
		const stats = vidInfo['statsV2'];

		if (typeof stats !== 'object') throw new Error('cant read stats');

		// good for now
		return {
			view: stats?.playCount,
			like: stats?.diggCount,
			share: stats?.shareCount,
			comment: stats?.commentCount,
			title: vidInfo?.desc,
			chanelUrl: vidInfo['author']['uniqueId'],
			chanelName: '@' + vidInfo['author']['nickname'],
			posted_at: dbDate(vidInfo?.createTime * 100),
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
		result = str.match(pattern)[0].replace(',"channelNavigationEndpoint', '');
		json = JSON.parse(result);
		if (json.length < 2) throw new Error('Cant read info from youtube response html correctly');
		const txtLike = json[0]['factoidRenderer']['value']['simpleText'];

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

// export const parseYoutube_ = (str) => {
// 	try {
// 		if (!str) throw new Error('Invalid str parameter value');

// 		const pattern = /(\[{"factoidRenderer)(.*)("}}\],"channelNavigationEndpoint)/;
// 		const result = str.match(pattern)[0].replace(',"channelNavigationEndpoint', '');
// 		const json = JSON.parse(result);
// 		if (json.length < 2) throw new Error('Cant read info from youtube response html correctly');

// 		const objLike = json[0];
// 		const objView = json[1];

// 		const txtView = objView['factoidRenderer']['value']['simpleText'];
// 		const txtLike = objLike['factoidRenderer']['value']['simpleText'];

// 		return {
// 			view: reverseNum(txtView),
// 			like: reverseRounded(txtLike),
// 			share: 0,
// 			comment: 0,
// 		};
// 	} catch (e) {
// 		console.log('parseYoutube error: ', e);
// 		return null;
// 	}
// };

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
	if (num.indexOf(' N') > 0 || num.indexOf(' K') > 0) {
		return reverseNum(num) * 1000;
	} else if (num.indexOf(' T') > 0 || num.indexOf(' M') > 0) {
		return reverseNum(num) * 1000000;
	}

	return reverseNum(num);
};
