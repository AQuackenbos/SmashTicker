"use strict";

function $(s) {
	return document.querySelector(s);
}

function $$(s) {
	return document.querySelectorAll(s);
}

var app = {
	meta: {
		version: "2.0.0",
		browser: "chrome",
		email: "a.quackenbos@gmail.com",
		exturl: "https://chrome.google.com/webstore/detail/super-smash-bros-stream-l/nhjklhalmbccpfhpnedcleiabpkocggi",
	},
	settings: {
		isPopout: localStorage.isPopout === "true",
		lastTab: localStorage.lastTab ? localStorage.lastTab : 'all'
	},
	init: function() {
		updateSettings();
		bindBasicEvents();
		switchTab(app.settings.lastTab, true);
	},
	cache: {
		ultimate: { cached: false, name: "Super Smash Bros. Ultimate", count: 0, viewers: 0, streams: [] },
		wiiu: { cached: false, name: "Super Smash Bros. for Wii U", count: 0, viewers: 0, streams: [] },
		threeds: { cached: false, name: "Super Smash Bros. for 3DS", count: 0, viewers: 0, streams: [] },
		brawl: { cached: false, name: "Super Smash Bros. Brawl", count: 0, viewers: 0, streams: [] },
		melee: { cached: false, name: "Super Smash Bros. Melee", count: 0, viewers: 0, streams: [] },
		sixtyfour: { cached: false, name: "Super Smash Bros.", count: 0, viewers: 0, streams: [] }
	}
};

var allStreamResponse = {
	ultimate: false,
	wiiu: false,
	threeds: false,
	brawl: false,
	melee: false,
	sixtyfour: false
};

function updateSettings() {
	$('#setting-popout').checked = app.settings.isPopout;
}

function bindBasicEvents() {
	$('#setting-popout').addEventListener('change', e => {
		localStorage.isPopout = $('#setting-popout').checked;
	});
	
	$$('.tab').forEach((el,idx) => {
		el.addEventListener('click', e => {
			let realTarget = e.target;
			
			while(realTarget.id === "")
				realTarget = realTarget.parentElement;
			
			switchTab(realTarget.id);
		});
	});
}

function switchTab(target, force) {
	if(!$('#'+target)) {
		return;
	}
	
	if(target === localStorage.lastTab && !force)
		return;
	
	localStorage.lastTab = target;
	app.settings.lastTab = target;
	
	if($('.tab.is-active'))
		$('.tab.is-active').classList.remove('is-active');
	
	$('#'+target).classList.add('is-active');
	
	$$('.content').forEach((el,idx) => {
		el.style.display = 'none';
	});
	
	$('#tab-'+target).style.display = 'block';
	
	if($('#'+target).classList.contains('streams')) {
		getGameStreams(target, false);
	}
}

function sortByViewers(a, b) {
	var aViews = a.viewers;
	var bViews = b.viewers;
	return ((aViews < bViews) ? 1 : ((aViews > bViews) ? -1 : 0));
}

function watchStream(streamer) {
	var baseUrl = 'https://www.twitch.tv/';
	if(app.settings.isPopout) {
		baseUrl = 'https://player.twitch.tv/?channel=';
	}
	
	window.open(baseUrl + streamer.channel.name);
}

function cacheGame(game, response) {
	let totalViewers = 0;
	
	response.streams.forEach((s,idx) => {
		s.gamecode = game;
		totalViewers += s.viewers;
	});
	
	app.cache[game].cached = true;
	app.cache[game].count = response._total;
	app.cache[game].viewers = totalViewers;
	app.cache[game].streams = response.streams;
	
	app.cache[game].streams.sort(sortByViewers);
}

function loadStreams(game, callback) {
	let baseUrl = 'https://novax81.com/SmashTicker/server/twitch.php?game=';
	fetch(baseUrl + game, {
		cache: "no-cache"
	})
	.then(r => r.json())
	.then(r => {
		cacheGame(game, r);
		callback(game);
	});
}

function getGameStreams(game, ignoreCache) {
	if(game === 'all') {
		buildAllGamesStreamList(ignoreCache);
	} else {
		if(ignoreCache || !app.cache[game].cached) {
			loadStreams(game, renderSingleGameStreams);
		} else {
			renderSingleGameStreams(game);
		}
	}
}

function buildAllGamesStreamList(ignoreCache) {
	let games = Object.keys(allStreamResponse);
	
	games.forEach((g, idx) => {
		if(ignoreCache || !app.cache[g].cached) {
			loadStreams(g, flagGameResponse);
		} else {
			flagGameResponse(g);
		}
	});
}

function flagGameResponse(game) {
	let games = Object.keys(allStreamResponse);
	allStreamResponse[game] = true;
	
	let responsesWanted = 0;
	let responsesNeeded = games.length;
	games.forEach((g,idx) => {
		if(allStreamResponse[g] === true)
			responsesWanted++;
	});
	
	if(responsesWanted >= responsesNeeded) {
		games.forEach((g,idx) => {
			allStreamResponse[g] = false;
		});
		renderAllGamesStreams();
	}
}

function renderSingleGameStreams(game) {
	let data = app.cache[game];
	let streams = data.streams;
	
	drawTab(game, data, streams);
}

function renderAllGamesStreams() {
	let games = Object.keys(allStreamResponse);
	
	let allStreams = [];
	let allViewers = 0;
	
	games.forEach((game, idx) => {
		allStreams = allStreams.concat(app.cache[game].streams);
		allViewers += app.cache[game].viewers;
	});
	
	allStreams.sort(sortByViewers);
	
	let data = {
		name: 'All Super Smash Bros. Games',
		count: allStreams.length,
		viewers: allViewers
	};
	
	drawTab('all', data, allStreams);
}

function drawTab(game, data, streams) {
	
	let container = $('#tab-'+game);
	
	while(container.children.length > 0) {
		container.children[0].parentNode.removeChild(container.children[0]);
	}
	
	let titleRow = $('#titleTemplate').content.cloneNode(true);
	let headerRow = $('#headerTemplate').content.cloneNode(true);
	
	titleRow.querySelector('.smashicon').classList.add(game);
	titleRow.querySelector('.game-name').innerHTML = data.name;
	titleRow.querySelector('.stream-count').innerHTML = data.count+' Streams';
	titleRow.querySelector('.viewers').innerHTML = data.viewers+' Viewers';
	titleRow.querySelector('.refresh .button').addEventListener('click',e => {
		getGameStreams(game, true);
	});
	
	container.appendChild(titleRow);
	
	if(game != 'all')
		headerRow.querySelector('.game').style.display = 'none';
	
	container.appendChild(headerRow);
	
	streams.forEach((st, idx) => {
		let el = $('#rowTemplate').content.cloneNode(true);
		
		if(game != 'all')
			el.querySelector('.game').style.display = 'none';
		
		el.querySelector('.smashicon').classList.add(st.gamecode);
		el.querySelector('.channelimg').src = st.channel.logo;
		el.querySelector('.streamer').innerHTML = st.channel.display_name;
		el.querySelector('.streamer').setAttribute('data-tippy-content',st.channel.status);
		el.querySelector('.viewers').innerHTML = st.viewers;
		
		el.querySelector('a').addEventListener('click', e => {
			watchStream(st);
		});
		
		container.appendChild(el);
	});
	
	tippy($$('.streamer'));
}


// Start Main
app.init();

