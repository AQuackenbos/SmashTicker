(function($) {
  "use strict";
  $.ajaxSetup({
    type: "GET",
    dataType: "json",
    success: function() {
      $('.gif').remove();
    },
    error: function() {
      $('.gif').attr('class', 'err').html("Twitch API Failed!");
    }
  });

  var stl = {
    config: {
      version: "2.0.0",
      browser: "chrome",
      email: "a.quackenbos@gmail.com",
      exturl: "https://chrome.google.com/webstore/detail/super-smash-bros-stream-l/nhjklhalmbccpfhpnedcleiabpkocggi",
    },
    settings: {
      isPopout: localStorage.isPopout === "true",
      menuPos: "top"
    },
    init: function() {
      defineDefaults();
      onLoadAjax();
    }
  };

  var isPopout = stl.settings.isPopout,
    menuPos = stl.settings.menuPos;

  var setMenuPosition = function(menuPos) {
    var $tab = $('.tabbable');
    if (menuPos === "top") {
      $tab.removeClass("tabs-left");
      $('.ph-tableft').removeClass("sub-tabs-left");
      $tab.addClass("tabs-top");
      $('.ph-tabstop').addClass("sub-tabs-top");
    } else {
      $tab.removeClass("tabs-top");
      $('.ph-tabstop').removeClass("sub-tabs-top");
      $tab.addClass("tabs-left");
      $('.ph-tableft').addClass("sub-tabs-left");
    }
  };

  var defineDefaults = function() {
    // Last Opened Tab
    if (localStorage.lastOpenedTab !== undefined) {
      $('#'+localStorage.lastOpenedTab).tab('show');
    } else {
      $('#nav_stream_all').tab('show');
    }

    // Stream Link Format
    if (stl.settings.isPopout) {
      $('#spTrue').addClass("active");
    } else {
      $('#spFalse').addClass("active");
    }
  };

	function sortByViewers(a, b){
	  var aViews = a.viewers;
	  var bViews = b.viewers;
	  return ((aViews < bViews) ? 1 : ((aViews > bViews) ? -1 : 0));
	}
  var streams = {};
  var onLoadAjax = function() {

	$('#tbody_streams_all').empty();
	$('#tbody_streams_wiiu').empty();
	$('#tbody_streams_3ds').empty();
	$('#tbody_streams_brawl').empty();
	$('#tbody_streams_melee').empty();
	$('#tbody_streams_64').empty();
    streams = {};
	
    var load_streamsWiiU = $.getJSON("https://api.twitch.tv/kraken/streams?game=Super+Smash+Bros.+For+Wii+U&client_id=f8xsv23y7spzh9gtt8l8u49aqnuko8&callback=?",function(data){
		streams.wiiu = [];
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

  $('.tab-content').on('click', '.streamrow', function(e){
    e.stopPropagation();
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
  });

  $('.menutab').on('shown', function(e) {
    var lastTab = e.target;
    localStorage.lastOpenedTab = $(lastTab).attr('id');
  });

  $('.spformat').click(function(){
    isPopout = $(this).data('ispopout');
    localStorage.isPopout = isPopout;
  });

  $('#nav_update').click(function(){
    update();
  });

  $('.permalink').click(function(e){
    var url = $(this).attr("data-link");
    window.open(url);
    e.stopPropagation();
  });

})(jQuery);