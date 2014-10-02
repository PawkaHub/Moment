/*!
 *  Double Carousel Plugin for JQuery
 *  Version   : 0.9
 *  Date      : 2014-01-02
 *  Licence   : All rights reserved 
 *  Author    : owwwlab (Ehsan Dalvand & Alireza Jahandideh)
 *  Contact   : owwwlab@gmail.com
 *  Web site  : http://themeforest.net/user/owwwlab
 *  Dependencies: tweenmx, imagesLoaded
 */

// Utility
if ( typeof Object.create !== 'function'  ){ // browser dose not support Object.create
    Object.create = function (obj){
        function F(){};
        F.prototype = obj;
        return new F();
    };
};

(function($, window, document, undefined) {
    
    var dcs,inAnimation=false;

    var DoubleCarousel = {
      init: function( options , elem ){
          var self = this; //store a reference to this

          self.elem = elem;
          self.$elem = $(elem);
          self.options = $.extend( {}, $.fn.DoubleCarousel.options, options);

          dcs=self.options;

          dcs.contentItems=dcs.contentSide.find('.item');
          dcs.imageItems=dcs.imageSide.find('.item');


          self.prepare();
          //self.handleBgColors();

          self.bindUIActions();
        
          //reverse the order of images since we want them to scroll from the very first at the bottom.
          dcs.imageWrapper.children().each(function(i,item){dcs.imageWrapper.prepend(item)});

      },


      handleBgColors : function(){
        
        var parentColor = dcs.contentWrapper.css("backgroundColor");
        var parts = parentColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if(parts){
          delete(parts[0]);
          var hsv = this.rgbToHsv(parts[1],parts[2],parts[3]);
        }else{
          var hsv = [0,0,0];
        }

        dcs.items.each(function(){
          var bgColor='hsl('+hsv[0]+','+hsv[1]+'%,'+rand(hsv[2]-10,hsv[2]+10)+ '%)';
          $(this).css('background',bgColor);
        });
        function rand(min, max) {
          return parseInt(Math.random() * (max-min+1), 10) + min;
        }
        
      },
      rgbToHsv : function(r,g,b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
      },

      prepare : function(){

        this.fillImages(dcs.imageItems);
        //height of each image and des
        dcs.imageHeight = dcs.imageSide.height();
        dcs.desHeight = dcs.contentSide.children(".item").first().outerHeight();

        dcs.contentSide.find(".item-wrapper").each(function(){
          var minusMarginTop = $(this).outerHeight()/-2;
          $(this).css('margin-top',minusMarginTop);
        });
        //just to make sure
        //dcs.contentSide.children(".item").css('height',dcs.desHeight);

        //slides count
        dcs.slideCount = dcs.imageWrapper.find('.item').length;
        dcs.currentSlideIndex = 0;
        
        dcs.counterTotal.html(dcs.slideCount);
        dcs.counterCurrent.html(1);

        //Show/hide Controllers
        dcs.nextButton.fadeIn();
        dcs.prevButton.fadeOut();

        //pull the images container all the way up.
        dcs.initMargin = dcs.imageHeight*(dcs.slideCount-1);
        dcs.imageWrapper.css('margin-top',-dcs.initMargin);
        dcs.contentSide.css('margin-top',0);
      },

      nextSlide : function(){
        inAnimation=true;
        dcs.currentSlideIndex++;
        this.updateCounter(dcs.currentSlideIndex);

        if (dcs.currentSlideIndex+1==dcs.slideCount)
          dcs.nextButton.fadeOut();
        dcs.prevButton.fadeIn();
        
        (new TimelineLite({onComplete:function(){inAnimation=false}}))
          .to(dcs.imageWrapper,1,{marginTop:'+='+dcs.imageHeight,ease:Power4.easeOut})
          .to(dcs.contentSide,0.8,{marginTop:'-='+dcs.desHeight,ease:Power4.easeOut},'-=1');     
      },

      prevSlide : function(){
        inAnimation=true;
        dcs.currentSlideIndex--;
        this.updateCounter(dcs.currentSlideIndex);
        if (dcs.currentSlideIndex==0){
          //hide the nexr arrow
          dcs.prevButton.fadeOut();
        }
        dcs.nextButton.fadeIn();
        (new TimelineLite({onComplete:function(){inAnimation=false}}))
          .to(dcs.imageWrapper,1,{marginTop:'-='+dcs.imageHeight,ease:Power4.easeOut})
          .to(dcs.contentSide,0.8,{marginTop:'+='+dcs.desHeight,ease:Power4.easeOut},'-=1');     
      },
      updateCounter : function(currentSlideIndex){
        dcs.counterCurrent.html(currentSlideIndex+1);
      },
      bindUIActions: function(){
        self = this;
        dcs.nextButton.on('click',function(){
          if (inAnimation){
            return false
          }
          self.nextSlide();
        })
        dcs.prevButton.on('click',function(){
          if (inAnimation){
            return false
          }
          self.prevSlide();
        })

        $(window).on('debouncedresize',function(){
          self.prepare();

        });
      },
      //cover images in a container
      fillImages:function($container){

          function fillCore(){

            $container.imagesLoaded(function(){
              
              var containerWidth=$container.width(),
              containerHeight=$container.height(),
              containerRatio=containerWidth/containerHeight,
              imgRatio;

              $container.find('img').each(function(){
                var img=$(this);
                imgRatio=img.width()/img.height();
                if (containerRatio < imgRatio) {
                  // taller
                  img.css({
                    width: 'auto',
                    height: containerHeight,
                    top:0,
                    left:-(containerHeight*imgRatio-containerWidth)/2
                  });
                } else {
                  // wider
                  img.css({
                    width: containerWidth,
                    height: 'auto',
                    top:-(containerWidth/imgRatio-containerHeight)/2,
                    left:0
                  });
                }
              });
            });
          }

          fillCore();

          $(window).on('resized',function(){
              fillCore();
          });
      }
    }

    
    $.fn.DoubleCarousel = function( options ) {
        return this.each(function(){
            var dCar = Object.create( DoubleCarousel ); 
            dCar.init( options, this );
        }); 
    };

    $.fn.DoubleCarousel.options = {
      imageWrapper    : $('.image-side-wrapper'),
      contentWrapper  : $('.content-carousel-wrapper'),
      contentSide     : $('.content-carousel'),
      imageSide       : $('.image-side'), 
      nextButton      : $('.vcarousel-next'),
      prevButton      : $('.vcarousel-prev'),
      counterTotal    : $(".vcarousel-counter .counter-total"),
      counterCurrent  : $(".vcarousel-counter .counter-current")
    };

})(jQuery, window, document);