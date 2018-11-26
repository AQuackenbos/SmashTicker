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
		switchTab(app.settings.lastTab);
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

function switchTab(target) {
	if(!$('#'+target)) {
		return;
	}
	
	if(target === localStorage.lastTab)
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
	
	window.open(baseUrl + streamer.name);
}

function cacheGame(game, response) {
  let totalViewers = 0;
  
  response.streams.forEach((s,idx) => {
    totalViewers += s.viewers;
  });
  
  app.cache[game].cached = true;
  app.cache[game].count = response._total;
  app.cache[game].viewers = totalViewers;
  app.cache[game].streams = response.streams;
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
		
	} else {
	  if(ignoreCache || !app.cache[game].cached) {
	    loadStreams(game, renderSingleGameStreams);
	  } else {
	    renderSingleGameStreams(game);
	  }
	}
}

function renderSingleGameStreams(game) {
  
  let data = app.cache[game];
	let streams = data.streams;
	
	let container = $('#tab-'+game);
	
	while(container.children.length > 0) {
	  container.children[0].parentNode.removeChild(container.children[0]);
	}
	
	let titleRow = $('#titleTemplate').content.cloneNode(true);
	let headerRow = $('#headerTemplate').content.cloneNode(true);
	
	titleRow.querySelector('.game-name').innerHTML = data.name;
	titleRow.querySelector('.stream-count').innerHTML = data.count+' Streams';
	titleRow.querySelector('.viewers').innerHTML = data.viewers+' Viewers';
	titleRow.querySelector('.refresh .button').addEventListener('click',e => {
	  getGameStreams(game, true);
	});
	
	container.appendChild(titleRow);
	
	headerRow.querySelector('.game').style.display = 'none';
	
	container.appendChild(headerRow);
	
	streams.forEach((st, idx) => {
	  let el = $('#rowTemplate').content.cloneNode(true);
	  el.querySelector('.game').style.display = 'none';
	  
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

function renderAllGameStreams(complexStreamList) {
	
}


// Start Main
app.init();

