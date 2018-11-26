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
		ultimate: { cached: false, count: 0, viewers: 0, streams: [] },
		wiiu: { cached: false, count: 0, viewers: 0, streams: [] },
		threeds: { cached: false, count: 0, viewers: 0, streams: [] },
		brawl: { cached: false, count: 0, viewers: 0, streams: [] },
		melee: { cached: false, count: 0, viewers: 0, streams: [] },
		sixtyfour: { cached: false, count: 0, viewers: 0, streams: [] }
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
			Event.stop(e);
			switchTab(e.target.id);
		});
	});
}

function switchTab(target) {
	if(!$('#'+target)) {
		return;
	}
	
	app.settings.lastTab = target;
	console.log('Switching to: '+target);
}

function sortByViewers(a, b) {
	var aViews = a.viewers;
	var bViews = b.viewers;
	return ((aViews < bViews) ? 1 : ((aViews > bViews) ? -1 : 0));
}

function watchStream(streamer) {
	var url = $(this).attr('href');
	if(!url)
	{
		return;
	}
	var extra = '';
	if(stl.settings.isPopout) {
		extra = '/popout';
	}
	window.open(url+extra);
}

function loadStreams(game, callback) {
	let baseUrl = 'https://novax81.com/SmashTicker/server/twitch.php?game=';
	fetch(baseUrl + game)
		.then(r = > r.json())
		.then(r => {
			callback(game, r);
		});
}

function getGameStreams(game, ignoreCache) {
	if(game === 'all') {
		
	}
}

function renderSingleGameStreams(game, streamList) {
	
}

function renderAllGameStreams(complexStreamList) {
	
}

	$(data.streams).each(function(index,item){
		streams.wiiu.push({
			game: 'WiiU',
			logo: item.channel.logo,
			link: item.channel.url,
			label: item.channel.display_name,
			title: item.channel.status,
			viewers: item.viewers
		});
	});
	streams.wiiu.sort(sortByViewers);
	});
	var load_streams3DS = $.getJSON("https://api.twitch.tv/kraken/streams?game=Super+Smash+Bros.+For+Nintendo+3DS&client_id=f8xsv23y7spzh9gtt8l8u49aqnuko8&callback=?",function(data){
	streams.s3DS = [];
	$(data.streams).each(function(index,item){
		streams.s3DS.push({
			game: '3DS',
			logo: item.channel.logo,
			link: item.channel.url,
			label: item.channel.display_name,
			title: item.channel.status,
			viewers: item.viewers
		});
	});
	streams.s3DS.sort(sortByViewers);
	});
	var load_streamsMelee = $.getJSON("https://api.twitch.tv/kraken/streams?game=Super+Smash+Bros.+Melee&client_id=f8xsv23y7spzh9gtt8l8u49aqnuko8&callback=?",function(data){
	streams.melee = [];
	$(data.streams).each(function(index,item){
		streams.melee.push({
			game: 'Melee',
			logo: item.channel.logo,
			link: item.channel.url,
			label: item.channel.display_name,
			title: item.channel.status,
			viewers: item.viewers
		});
	});
	streams.melee.sort(sortByViewers);
	});
	var load_streamsBrawl = $.getJSON("https://api.twitch.tv/kraken/streams?game=Super+Smash+Bros.+Brawl&client_id=f8xsv23y7spzh9gtt8l8u49aqnuko8&callback=?",function(data){
	streams.brawl = [];
	$(data.streams).each(function(index,item){
		streams.brawl.push({
			game: 'Brawl',
			logo: item.channel.logo,
			link: item.channel.url,
			label: item.channel.display_name,
			title: item.channel.status,
			viewers: item.viewers
		});
	});
	streams.brawl.sort(sortByViewers);
	});
	var load_streams64 = $.getJSON("game=Super+Smash+Bros.&client_id=f8xsv23y7spzh9gtt8l8u49aqnuko8&callback=?",function(data){
	streams.s64 = [];
	$(data.streams).each(function(index,item){
		streams.s64.push({
			game: '64',
			logo: item.channel.logo,
			link: item.channel.url,
			label: item.channel.display_name,
			title: item.channel.status,
			viewers: item.viewers
		});
	});
	streams.s64.sort(sortByViewers);
	});

	$.when(load_streamsWiiU,load_streams3DS,load_streamsMelee,load_streamsBrawl,load_streams64).done(function() {
	streams.all = [].concat(streams.wiiu).concat(streams.s3ds).concat(streams.brawl).concat(streams.melee).concat(streams.s64);
	streams.all.sort(sortByViewers);
	
	$(streams.all).each(function(idx,item){
	addRow('#tbody_streams_all',item,true);
	});
	$(streams.wiiu).each(function(idx,item){
	addRow('#tbody_streams_wiiu',item);
	});
	$(streams.s3DS).each(function(idx,item){
	addRow('#tbody_streams_3ds',item);
	});
	$(streams.brawl).each(function(idx,item){
	addRow('#tbody_streams_brawl',item);
	});
	$(streams.melee).each(function(idx,item){
	addRow('#tbody_streams_melee',item);
	});
	$(streams.s64).each(function(idx,item){
	addRow('#tbody_streams_64',item);
	});
	
	$('.listload').each(function(idx,i){
	if($(i).children().size() == 0)
	{
		$(i).append('<tr class="streamrow streams"><td class="textCenter">No streams.</td></tr>');
	}
	});
	
		$('.listload').each(function(i) {
			$(this).find('.streamrow:eq(0)').tooltip({
				html:true,
				placement: 'bottom'
			});
		});

		$('.streamrow').tooltip({
			html:true,
			placement: 'top'
		});
	});
};

function addRow(container,item,symbol)
{
if(item == undefined)
{
	return;
}

$(container).append('<tr href="'+item.link+'" data-id="'+item.label+'" class="streamrow streams twitch" rel="tooltip" data-original-title="'+item.title+'">'+
					'<td class="stream_date"><img src="'+item.logo+'" width="16px" height="16px"/>'+(symbol ? '<i class="icon icon'+item.game+'"></i>' : '')+'</td>'+
					'<td>'+item.label+'</td>'+
					'<td class="textRight">'+item.viewers+'</td></tr>');
}

var update = function() {
	$('.streamrow, .err, .tooltip').remove();
	$('.listload').html("<tr class='gif'></tr>");
	onLoadAjax();
};

// Start Main
stl.init();

