(function($){	

    
    //判断手机类型
    var u = navigator.userAgent, app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    
    
    var contentid = $('#contentId').text();
    var shuju = JSON.parse(localStorage.getItem('time'+contentid));
    var fen = 0;
    var miao = 0;
    var timelength = 0;
    var onOff = true;

  var pluginName = "jAudio",
      defaults = {
        playlist: [],

        defaultAlbum: '',
        defaultArtist: '',
        defaultTrack: 0,

        autoPlay: false,

        debug: false
      };

  function Plugin( $context, options )
  {
    this.settings         = $.extend(true, defaults, options);

    this.$context         = $context;

    this.domAudio         = this.$context.find("audio")[0];
    this.$domPlaylist     = this.$context.find(".jAudio--playlist");
    this.$domControls     = this.$context.find(".jAudio--controls");
    this.$domVolumeBar    = this.$context.find(".jAudio--volume");
    this.$domDetails      = this.$context.find(".jAudio--details");
    this.$domStatusBar    = this.$context.find(".jAudio--status-bar");
    this.$domProgressBar  = this.$context.find(".jAudio--progress-bar-wrapper");
    this.$domTime         = this.$context.find(".jAudio--time");
    this.$domElapsedTime  = this.$context.find(".jAudio--time-elapsed");
    this.$domTotalTime    = this.$context.find(".jAudio--time-total");
//    this.$domThumb        = this.$context.find(".jAudio--thumb");

    this.currentState       = "pause";
    this.currentTrack       = this.settings.defaultTrack;
    this.currentElapsedTime = undefined;

    this.timer              = undefined;

    this.init();
  }

  Plugin.prototype = {

    init: function()
    {
      var self = this;
      self.renderPlaylist();
      self.preLoadTrack();
      self.highlightTrack();
      self.updateTotalTime();
      self.events();
      self.debug();
      self.autoPlay();
      self.domAudio.volume = 0.6;


      if( shuju ){
          fen = parseInt(shuju.fen);
          miao = parseInt(shuju.miao);


//        if(isAndroid){
            if( (fen*60+miao)>0 ){
                $('.opacity').show();
                $('.tanchu').show();
                $('.tanchu .prevTime').text( ten(fen) +':'+ ten(miao) );
            };
//        };
      }else{
          fen = 0;
          miao = 0;
      }
    //圆圈信息
    var isPlaying = false;
    var container = document.querySelector('.fengmian');
    var image = document.querySelector('.cicle-infor');
    var buttn = document.querySelector('.buttn'); 
    buttn.addEventListener('click', function bindEvent() {
        isPlaying ? pause() : play();
    });
    function pause() {
        isPlaying = false;
        var iTransform = getComputedStyle(image).transform;
        var cTransform = getComputedStyle(container).transform;
        container.style.transform = cTransform === 'none'
         ? iTransform
         : iTransform.concat(' ', cTransform);
        image.classList.remove('playll');
    }
    function play() {
        isPlaying = true;
        image.classList.add('playll');
    }


      $('.true').click(function(){
//	  	$('.cicle-infor').addClass('playll');
//        $('.cicle-infor').removeClass('playtt');
        isPlaying ? pause() : play();
        fen = parseInt(shuju.fen);
        miao = parseInt(shuju.miao);
        $('.opacity').hide();
        $('.tanchu').hide();

        if(onOff){
            self.domAudio.currentTime = (fen*60+miao);
        };
        self.domAudio.play();

        playButton  = self.$domControls.find("#btn-play");
        clearInterval(self.timer);
        self.timer = setInterval( self.run.bind(self), 50 );
        // change id
          playButton.data("action", "pause");
          playButton.attr("id", "btn-pause");

      });

      $('.false').click(function(){
//	  	$('.cicle-infor').addClass('playll');
//        $('.cicle-infor').removeClass('playtt');
        isPlaying ? pause() : play();
        fen = 0;
        miao = 0;
        $('.opacity').hide();
        $('.tanchu').hide();
        self.domAudio.play();

        playButton  = self.$domControls.find("#btn-play");
        clearInterval(self.timer);
      self.timer = setInterval( self.run.bind(self), 50 );
        // change id
          playButton.data("action", "pause");
          playButton.attr("id", "btn-pause");
      });





      function ten(num){
        var abc = num<10?'0'+num:num;	
        return abc;
      };


//	  document.addEventListener("DOMContentLoaded", function() { 
//	 	 var bgaudio = document.getElementById("audio");
//		 bgaudio.addEventListener('canplay', function (evt) {
//			
//			bgaudio.currentTime = (fen*60+miao);
//			
//			//alert('加载完成')
//		  })
//		})
//	  $('.jAudio--time-elapsed').text(ten(fen)+':'+ten(miao));
//	  




    },
    autoPlay: function(){
      var self = this;
      if(self.currentState === "play" || self.settings.autoPlay){
         //self.play();
      };

    },
    play: function()
    {
      var self      = this,
          time      = self.domAudio.currentTime,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time),
          timeleng  = self.domAudio.duration;

      playButton  = self.$domControls.find("#btn-play");

      self.domAudio.play();

      if(self.currentState === "play") return;

      clearInterval(self.timer);
      self.timer = setInterval( self.run.bind(self), 50 );

      self.currentState = "play";

      // change id
      playButton.data("action", "pause");
      playButton.attr("id", "btn-pause");

      // activate
      playButton.toggleClass('active');
//      $('.cicle-infor').addClass('playll');
//      $('.cicle-infor').removeClass('playtt');
    },

    pause: function()
    {
      var self      = this,
          time      = self.domAudio.currentTime,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time)




      playButton  = self.$domControls.find("#btn-pause");

      self.domAudio.pause();
      clearInterval(self.timer);

      self.currentState = "pause";

      // change id
      playButton.data("action", "play");
      playButton.attr("id", "btn-play");

      // activate
      playButton.toggleClass('active');
//      $('.cicle-infor').addClass('playtt');
    },

    stop: function()
    {
      var self      = this,
          time      = self.domAudio.currentTime,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time)

           playButton  = self.$domControls.find("#btn-pause");

      self.domAudio.pause();
      //self.domAudio.currentTime = 0;

      self.animateProgressBarPosition();
      clearInterval(self.timer);
      self.updateElapsedTime();

      self.currentState = "stop";
      playButton.toggleClass('active');
    },

    prev: function()
    {
      var self  = this,
          track;

      (self.currentTrack === 0)
        ? track = self.settings.playlist.length - 1
        : track = self.currentTrack - 1;

      self.changeTrack(track);
    },
    next: function()
    {
      var self = this,
          track;

      (self.currentTrack === self.settings.playlist.length - 1)
        ? track = 0
        : track = self.currentTrack + 1;

      self.changeTrack(track);
    },


    preLoadTrack: function()
    {
      var self      = this,
          time      = self.domAudio.currentTime,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time)




      defTrack  = self.settings.defaultTrack;

      self.changeTrack( defTrack );

      self.stop();
    },

    changeTrack: function(index)
    {
      var self = this;
      self.currentTrack  = index;
      self.domAudio.src  = self.settings.playlist[index].file;
      src = self.domAudio.src;


      if(self.currentState === "play" || self.settings.autoPlay) self.play();

      self.highlightTrack();

//      self.updateThumb();

      self.renderDetails();
    },

    events: function()
    {
      var self = this;

      // - controls events
      self.$domControls.on("click", "button", function()
      {
        var action = $(this).data("action");

        switch( action )
        {
          case "prev": self.prev.call(self); break;
          case "next": self.next.call(self); break;
          case "pause": self.pause.call(self); break;
          case "stop": self.stop.call(self); break;
          case "play": self.play.call(self); break;
        };

      });

      // - playlist events
      self.$domPlaylist.on("click", ".jAudio--playlist-item", function(e)
      {
        var item = $(this),
            track = item.data("track"),
            index = item.index();

        if(self.currentTrack === index) return;

        self.changeTrack(index);
      });

      // - volume's bar events
      // to do

      // - progress bar events
      self.$domProgressBar.on("click", function(e)
      {
        onOff = false;  
        self.updateProgressBar(e);
        self.updateElapsedTime();
      });


      $(self.domAudio).on("loadedmetadata", function()
      {
        self.animateProgressBarPosition.call(self);
        self.updateElapsedTime.call(self);
        self.updateTotalTime.call(self);

      }); 



    },


    getAudioSeconds: function(string)
    {
      var self    = this,
          string  = string % 60;
          string  = self.addZero( Math.floor(string), 2 );

      (string < 60) ? string = string : string = "00";

      return string;
    },

    getAudioMinutes: function(string)
    {
      var self    = this,
          string  = string / 60;
          string  = self.addZero( Math.floor(string), 2 );

      (string < 60) ? string = string : string = "00";

      return string;
    },

    addZero: function(word, howManyZero)
    {
      var word = String(word);

      while(word.length < howManyZero) word = "0" + word;

      return word;
    },

    removeZero: function(word, howManyZero)
    {
      var word  = String(word),
          i     = 0;

      while(i < howManyZero)
      {
        if(word[0] === "0") { word = word.substr(1, word.length); } else { break; }

        i++;
      }

      return word;
    },


    highlightTrack: function()
    {
      var self      = this,
          tracks    = self.$domPlaylist.children(),
          className = "active";

      tracks.removeClass(className);
      tracks.eq(self.currentTrack).addClass(className);
    },

    renderDetails: function()
    {
      var self          = this,
          track         = self.settings.playlist[self.currentTrack],
          file          = track.file,
          thumb         = track.thumb,
          trackName     = track.trackName,
          trackArtist   = track.trackArtist,
          trackAlbum    = track.trackAlbum,
          template      =  "";

          template += "<p>";
          template += "<h3>" + trackName + "</h3>";
          // template += " - ";
          template += "<span>" + trackArtist + "</span>";
          // template += "<span>" + trackAlbum + "</span>";
          template += "</p>";


      $(".jAudio--details").html(template);

    },

    renderPlaylist: function()
    {
      var self = this,
          template = "";


      $.each(self.settings.playlist, function(i, a)
      {
        var file          = a["file"],
            thumb         = a["thumb"],
            trackName     = a["trackName"],
            trackArtist   = a["trackArtist"],
            trackAlbum    = a["trackAlbum"];
            trackDuration = "00:00";

        template += "<div class='jAudio--playlist-item' data-track='" + file + "'>";

        template += "<div class='jAudio--playlist-thumb'><img src='"+ thumb +"'></div>";

        template += "<div class='jAudio--playlist-meta-text'>";
        template += "<h4>" + trackName + "</h4>";
        template += "<p>" + trackArtist + "</p>";
        template += "</div>";
        // template += "<div class='jAudio--playlist-track-duration'>" + trackDuration + "</div>";
        template += "</div>";

      // });

      });

      self.$domPlaylist.html(template);

    },

    run: function()
    {
      var self      = this,
          time      = self.domAudio.currentTime,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time)
          //console.log(minutes+','+seconds)

      self.animateProgressBarPosition();
      self.updateElapsedTime();


      if(self.domAudio.ended) self.next();
    },

    animateProgressBarPosition: function()
    {
      var self        = this,
          percentage  = (self.domAudio.currentTime * 100 / self.domAudio.duration) + "%",
          styles      = { "width": percentage };

      self.$domProgressBar.children().eq(0).css(styles);
    },
    updateProgressBar: function(e)
    {
      var self = this,
          mouseX,
          percentage,
          newTime;

      if(e.offsetX) mouseX = e.offsetX;
      if(mouseX === undefined && e.layerX) mouseX = e.layerX;

      percentage  = mouseX / self.$domProgressBar.width();
      newTime     = self.domAudio.duration * percentage;

      self.domAudio.currentTime = newTime;
      self.animateProgressBarPosition();


    },


    //当前时间
    updateElapsedTime: function()
    {



      var self      = this,
          time      = self.domAudio.currentTime,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time),


          audioTime = minutes + ":" + seconds;

          var Json = {'fen':minutes,'miao':seconds};
//          if(isAndroid){
              if( (fen*60+miao) > (minutes*60+seconds) ){
              audioTime = ten(fen)+':'+ten(miao);
              Json = {'fen':fen,'miao':miao};
//            }
          }

        function ten(num){
            var abc = num<10?'0'+num:num;	
            return abc;
          };
      self.$domElapsedTime.text( audioTime );




      //存当前播放时间
      //alert(Json.miao)
      var Str = JSON.stringify(Json);
      localStorage.setItem('time'+contentid,Str);
        //alert('存数据：'+Json.fen+','+Json.miao)

      //console.log(JSON.parse(localStorage.getItem('time'+contentId)));

    },


    //总时长
    updateTotalTime: function()
    {
      var self      = this,
          time      = self.domAudio.duration,
          minutes   = self.getAudioMinutes(time),
          seconds   = self.getAudioSeconds(time),
          audioTime = minutes + ":" + seconds;

      //alert('设置总时长'+audioTime)
      //timelength = time;
      self.$domTotalTime.text( audioTime );

    },


//    updateThumb: function()
//    {
//      var self = this,
//          thumb = self.settings.playlist[self.currentTrack].thumb,
//          styles = {
//            "background-image": "url(" + thumb + ")"
//          };
//
//      self.$domThumb.css(styles);
//    },

    debug: function()
    {
      var self = this;

      if(self.settings.debug) ;
    }

  }

  $.fn[pluginName] = function( options )
  {
    var instantiate = function()
    {
      return new Plugin( $(this), options );
    }

    $(this).each(instantiate);
  }

})(jQuery)

