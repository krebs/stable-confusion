/*!
 * Mediengewitter client.
 *
 * Connects to a websocket server and reacts to events
 *
 * @author pfleidi
 * @author makefu
 * @author samularity
 */

(function (window, document, undefined) {
    var cache = false;
        socket = false;

    function log(msg) {
      try {
        console.log(msg);
      } catch (e) { }
    }

    const ws = new WebSocket('ws://localhost:8080')
    ws.onopen = () => {
      console.log('ws opened on browser')
    }

    (() => {
      ws.onmessage = (message) => {
          console.log('got message')
          console.log(message.data)
          try {
            var msg = JSON.parse(message.data);
            console.log(msg)
            switch (msg.type) {
              case 'cache' : evalCache(msg.payload);
                break;
              case 'chat' : evalChat(msg.payload);
                chatfield =  document.getElementById('chatfield');
                chatfield.scrollTop = chatfield.scrollHeight;
                break;
              default:
                console.dir(msg)
                log('unknown type'+ msg.type );
            }
          } catch (err) {
            log('Error while parsing data:' + err);
          }
      }
    })()

    function createCache(initData) {

      var out = {};

      $('#container').empty();

      out.stopped = false;

      out.center = 1 + Math.floor((initData.length + 1) / 2);
      out.current = out.center;

      initData.forEach(function (img) {
          var item = genItem(img),
          thumbnail = genThumbnail(img),
          i = initData.indexOf(img) + 1;

          if (i < out.current) {
            item.addClass('old');
          }

          if (i === out.current) {
            item.addClass('current');
            thumbnail.addClass('thumbnail_current');
          }

          if (i > out.current) {
            item.addClass('new');
          }

        });

      out.update = function (newData) {
        if (!out.stopped) {
          genItem(newData).addClass('new');
          genThumbnail(newData);

          if (out.current <= out.center) { // get back to center
            this.next();
          }

          $('#container :first').remove();
          $('#thumbnails :first').remove();
          out.current -= 1;
        }
      };

      out.next = function () {
        if (!(out.current === $('section').length)) {
          $('.current').removeClass('current').addClass('old').next().removeClass('new').addClass('current');
          $('.thumbnail_current').removeClass('thumbnail_current').next().addClass('thumbnail_current');
          out.current += 1;
          adjustRatio();
        } else {
          log('Already at the last image');
        }
      };

      out.prev = function () {
        if (!(out.current === 1)) {
          $('.current').removeClass('current').addClass('new').prev().removeClass('old').addClass('current');
          $('.thumbnail_current').removeClass('thumbnail_current').prev().addClass('thumbnail_current');
          out.current -= 1;
          adjustRatio();
        } else {
          log('Already at the first image');
        }
      };

      out.switchTo = function (ident) {
        if (ident == out.current)
          return;
        while (ident != out.current) {
          if (ident < out.current) {
            out.prev();
          } else {
            out.next();
          }
        }
      };

      out.toggleStop = function () {
        out.stopped = !out.stopped;
      };

      return out;
    }

    var enabled = true,
    sections = [];

    function sendText() {
      var text = $('#chatInput').val();
      if ( text === '') {
        return;
      }
      ws.send(JSON.stringify ( { type : 'chat', payload : { action: "msg", data : text}}));
      $('#chatInput').val('');
    }

    function evalCache(payload){
      switch (payload.action) {
        case 'init' :
          console.log('init image cache')
          cache = createCache(payload.data);
          break;
        case 'nextImage' :
          console.log('next image')
          cache.update(payload.data);
          break;
        default:
          log('unknown action');
      }
    }
    function evalChat(payload) {
      switch (payload.action) {
        case 'msg' : $('#chatfield').append(payload.data + '<br/>');
          break;
        default :
          log('unknown chat action');
      }
    }

    function switchToImage() {
      clicked = $(this);
      realId = 1;
      $('.thumbnail').each( function ( index ) {
        if ( clicked[0].src == $(this)[0].src) {
          realId = index;
        }
      });
      realId += 1;
      cache.switchTo(realId);
    }

    function genItem(imageData) {
      var next = $('<section><img src="' + imageData + '" /></section>');
      $('#container').append(next);

      return next;
    }

    function genThumbnail(imageData) {
      var next = $('<img src="' + imageData + '" />');
      next.addClass('thumbnail');
      next.click(switchToImage);
      $('#thumbnails').append(next);
      return next;
    }

    function adjustRatio() {
      var img = $('.current :first-child');
/*
      img.aeImageResize({
          height: $('.current').height(),
          width: $('.current').width()
        });
*/
    }

    function getWebSocketUri() {
      return "ws://"
      + window.location.hostname
      + ":" + window.location.port
      + "/websocket";
    }

    $(document).ready(function () {
        adjustRatio();
        //connect();
      });

    $(window).resize(function () {
        adjustRatio();
      });

    $(document).keydown(function (e) {
        if (/^(input|textarea)$/i.test(e.target.nodeName) || e.target.isContentEditable) {
          if (e.keyCode === 13) {
            sendText()
          }
          return;
        }
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || !cache) {
          return;
        }

        if (e.keyCode === 32) {
        e.preventDefault();
          cache.toggleStop();
        }
        if (e.keyCode === 39) {
        e.preventDefault();
          cache.next();
        }
        if (e.keyCode === 37) {
        e.preventDefault();
          cache.prev();
        }
      });

  }(window, document));
