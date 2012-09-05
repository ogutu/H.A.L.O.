//Monitor scrolls of target elements to update focus on source elements
$.fn.syncTo = function(opts) {
    var cfg = { selector: '.syncItems',
                focus: { scrollSyncSel: '',
                         idConvert: function(id) { return 'sync_' + id},
                         cssFocusFirst: 'focusFirst',
                         cssFocus: 'focus',
                         cssFocusLast: 'focusLast'
                       }};
    var srcSel = '#' + $(this).attr('id');
    return this.each(function() {
        function pauseSync(p) {
            paused=p;
        }
      if(opts) {
        $.extend(true, cfg, opts);
      }
      var srcObj = $(srcSel);
      var objs = $(cfg.selector);
        var paused = false;
      $(cfg.focus.scrollSyncSel).scroll(function(e) {
          if(paused==true) { return; }
        var vpt = $(this).scrollTop();
        var vpb = vpt + $(this).height();
        var prevObj = null;
        var numObjs = objs.length;
        for(objIndex=0; objIndex<numObjs; objIndex++) {
          var objCrnt = $(objs[objIndex]);
          if($(objCrnt).attr('id')==undefined) {}
          else {
            var oct = $(objs[objIndex]).position().top;
            var ocb;
            if(objIndex==numObjs-1) { ocb = vpb+1; }
            else { ocb = $(objs[objIndex+1]).position().top; }
          
            var idSel = '#' + cfg.focus.idConvert(objCrnt.attr('id').replace(/[\.]/g, '\\.').replace(/[\:]/g, '\\:'));
            var outlineObj = $(idSel);
            outlineObj.parent().removeClass(cfg.focus.cssFocusFirst + ' ' + cfg.focus.cssFocusLast);
            if( (oct >= vpt && ocb <= vpb) ||
                (oct <= vpt && ocb >= vpt) ||
                (oct <= vpb && ocb >= vpb) ||
                (oct <= vpt && ocb >= vpb) ) {
              DBG.out(5, objIndex + '(' + idSel + ')' + '::setting::' + oct + '\t' + ocb + '\t' + vpt + '-' + vpb);
              outlineObj.parent().addClass(cfg.focus.cssFocus);
              if(ArticlePage.isIE7()) {}
              else {
                if($('#outline').attr('data-osbp')=='y') {
//                outlineObj.parent().css('margin-right', 0);
                }
                else {
                  outlineObj.parent().css('margin-right', $.scrollBarWidth());
                }  
              }
            }
            else {
              DBG.out(5, objIndex + '(' + idSel + ')' + '::clearing::' + oct + '\t' + ocb + '\t' + vpt + '-' + vpb);
              outlineObj.parent().removeClass(cfg.focus.cssFocus);
            }
          }
        }

        //Loop through all the outlineFocus item and determine first/last
        var fObs = $(srcSel + ' .' + cfg.focus.cssFocus);
        if(fObs.length > 0) {
          $(fObs[0]).addClass(cfg.focus.cssFocusFirst);
          $(fObs[fObs.length-1]).addClass(cfg.focus.cssFocusLast);
        
          var fTop = $(fObs[0]).position().top;
          var fBot = $(fObs[fObs.length-1]).position().top + $(fObs[fObs.length-1]).height();
        
          //Assume for now that we only need to worry about one at a time
          if( fTop < 0 ) {
            var goTo = $('#outline').scrollTop() + fTop - 20;
            $(srcSel).scrollTop(goTo);
            //Keep FF in line
            $(srcSel).attr('data-st', goTo);
          }
          else if( fBot+5 > $(srcSel).height() ) {
            var goTo = $('#outline').scrollTop() +  (fBot-$(srcSel).height()) + 40;
            $(srcSel).scrollTop(goTo);
            //Keep FF in line
            $(srcSel).attr('data-st', goTo);
          }
          
        }
        
      }) //scroll
    }) //this.each
} //$.fn.syncTo



$.fn.attrsToString = function() {
  var str = "";
  var attrs = this.get(0).attributes;
  for(var i=0; i<attrs.length; i++) {
    str = str + attrs[i].nodeName + '="' + attrs[i].nodeValue + '" ';
  }
  return str.slice(0, -1);
}

/**
 * This method will need to be called from the article.tmpl file
 * to initialize the dynamic functionality on the page.
 */
 function initializeArticlePage(){
    ArticlePage = function(){
      var autoHide=0;

        var page = {
            //outlineElegibleSel:'#centerPane .fig, #centerPane .figTblUpiOuter, #centerPane h2, #centerPane h3, #centerPane h4',
            objLColumn: $('#leftColumn'),
            objRColumn: $('#rightColumn'),
            objToolbarExt: $('#sdQuickSearch'),
            objToolbar: $('#articleToolbar'),
            selectorE: '#centerPane dl.figure, #centerPane dl.table, #centerPane dl.ecomponent, #centerPane h2, #centerPane h3, #centerPane h4',
            selectorUE: '#centerPane div.articleOutlineHidden h2, #centerPane div.articleOutlineHidden h3, #centerPane div.articleOutlineHidden h4',
            boomboxAd:{width:280},
            ready: false,
            opts: {
              empty: false,
              selector: '',
              focusEffect: false,
              focus: {
                cssFocusFirst: 'outlineFocusFirst',
                cssFocus: 'outlineFocus',
                cssFocusLast: 'outlineFocusLast',
                scrollSyncSel: '#rightColumn',
                idConvert: function(s) {return 'ol_'+s;}
              }
            },
            addDynamics: function() {
              //Enable the images
              $('#centerPane dl.figure noscript').each(function() {
                if(SDM.imageLazyLoading==false) {
                  if(SDM.fullSize==true) {
                    $(this).parent().prepend('<img src="' + $(this).attr('data-fullsrc') + '" ' + $(this).attrsToString() + '>');
                  }
                  else {
                    $(this).parent().prepend('<img src="' + $(this).attr('data-thumbsrc') + '" ' + $(this).attrsToString() + '>');
                  }
                }
                else {
                  if(SDM.fullSize==true) {
                    $(this).parent().parent().attr('style', $(this).parent().parent().attr('data-style') );//.css('position', 'relative');
                  }
                  $(this).parent().prepend('<img src="' + $(this).attr('data-thumbsrc') + '" ' + $(this).attrsToString() + '>');
                  //$(this).parent().children('img').addClass('imgLazyFull');
                }
              });
              if(SDM.imageLazyLoading==false) {
                $('#centerPane dl.figure dd a.linkText').click(function() {page.toggleImages('centerPane');});
              }
              else {
                $('#centerPane dl.figure dd a.linkText').hide();
              }

              $('body').css('overflow', 'hidden').css('min-width', '');
              $('#header-area, #footer-area, #page-area, #articleToolbar').addClass('js');
              $('#leftColumn, #leftColumnSmall2, #rightColumn, #outline, #outlineGraphicsCheckBoxBox, #centerPane, #rightPane').addClass('js');
              $('#leftColumn, #rightColumn, #leftColumnSmall2').css('top', $('#articleToolbar').height());
              $('#page-area').css( { top: $('#header-area').height(),
                                     bottom: $('#footer-area').height()});
              if(page.isIE7 || page.isIE8) {
                $(window).resize(function() { page.delay(function(){ page.setPaneWidths()}, 500); }); 
              }
              else {
               $(window).resize( _.debounce( page.setPaneWidths, 500 ));
              }
              $('#header-area').attr('data-dynamic', 'y');
              $('#footer-area').attr('data-dynamic', 'y');
              page.setPaneWidths();
            },
            isIE7:function(){return ($.browser.msie && $.browser.version == 7); },
            isIE8:function(){return ($.browser.msie && $.browser.version == 8); },
            isIE78:function(){return ($.browser.msie && ($.browser.version == 7||$.browser.version == 8)); },
            delay:function(callback, ms){   
              var timer = 0;  
              clearTimeout (timer);     
              timer = setTimeout(callback, ms);
            },
            verticalStretcher: function (paneScrlHeight, vpHeight) {
              var delta = 0;
              if(!$('#pStretcher').length) {
                $('#centerPane').append('<div id="pStretcher"></div>');
                $('#pStretcher').css('height', 0);
              }
              var sHeight = $('#pStretcher').css('height').split('px')[0]*1.0;
              var origPaneScrlHeight = paneScrlHeight - sHeight;
              if(origPaneScrlHeight<vpHeight) {
                if(page.isIE78) delta = vpHeight - origPaneScrlHeight +150;
                else delta = vpHeight - origPaneScrlHeight +50;
              }

              $('#pStretcher').css({height:delta});
              DBG.out(1, 'ArticlePage::sizeStretcher()::stretcherHeight(' + delta + ')');
              return delta;
            },
            setPaneWidths: function () {
              var vpHeight = $(window).height();
              var d = page.verticalStretcher($('#rightColumn')[0].scrollHeight, vpHeight);
              page.viewHandler();

              var vpWidth = $(window).width();
              var pgWidth = 1220;
              var lcWidth = 260;
              if(vpWidth > 1260) {
                if(page.isIE7()) { page.objLColumn.css('width', lcWidth-2); }
                else { page.objLColumn.css('width', lcWidth-2); }
                Outline.sidebarOpen();
                $('#leftColumnSmall').hide();
              }
              else if(vpWidth > 1200) {
                pgWidth = 1220 - (1260-vpWidth);
                lcWidth = lcWidth - (1260-vpWidth);
                if(page.isIE7()) { page.objLColumn.css('width', lcWidth-2);}
                else { page.objLColumn.css('width', lcWidth-2); }
                Outline.sidebarOpen();
                $('#leftColumnSmall').hide();
              }
              else {
                SDM.adPreventOutline = true; 
                if(SDM.adReqOutline==true) {page.adRemoveOutline();}
                pgWidth = 980; 
                lcWidth = 20;

                page.objLColumn.css('width', '260px').css('z-index', 10);
                if(page.ready==false)
                  Outline.pendingCloseTimer = setTimeout(Outline.sidebarClose, 500);
                $('#leftColumnSmall').show();
              }
              var pgMarginLeft = (vpWidth-(pgWidth+$.scrollBarWidth()))/2;
              if(pgMarginLeft<0) { pgMarginLeft=0; }
              $('#header-area').css('width', pgWidth+$.scrollBarWidth());
              $('#footer-area').css('width', pgWidth+$.scrollBarWidth());
              $('#page-area').css('width', pgWidth+$.scrollBarWidth());
              page.objToolbar.css('width', pgWidth+$.scrollBarWidth());
              page.objToolbarExt.css('width', pgWidth+$.scrollBarWidth()-27);
              $('#header-area').css('margin-left', pgMarginLeft);
              $('#page-area').css('margin-left', pgMarginLeft);
              $('#footer-area').css('margin-left', pgMarginLeft);
              page.objRColumn.css('left', lcWidth);
                
              if(vpWidth>=980+$.scrollBarWidth()) {
                $('.searchresults').show();
                page.objRColumn.css('width', 960+$.scrollBarWidth());
                page.objRColumn.css('overflow-x', 'hidden');
                $('body').css('overflow-x', '');
              }
              else {
                $('.searchresults').hide();
                page.objRColumn.css('width', 960+$.scrollBarWidth());
                page.objRColumn.css('overflow-x', 'hidden');
                $('body').css('overflow-x', 'scroll');
              }
            },
            toggleImages: function(zStr) {
              $('#centerPane dl.figure').each(function() {
                var img = $(this).find('img.figure');
                if(img.attr('id')!='gabsImg'){
                if(SDM.fullSize==true) {
                  if(img.attr('src')!=img.attr('data-thumbsrc')) {
                    img.attr('src', img.attr('data-thumbsrc'));
                  }
                  if(SDM.imageLazyLoading==false) {
                    $(this).find('a.linkText').text("View full-size images");
                  }
                }
                else {
                  if(SDM.imageLazyLoading==true) {
                    img.attr('data-loaded', 'false');
                  }
                  else {
                    img.attr('src', img.attr('data-fullsrc'));
                    $(this).find('a.linkText').text("View thumbnail images");
                  }
                }
                }
               });
              if(SDM.fullSize==true) {
                page.sendUserKeyEvent('disableFullSizeImages', 'article', zStr, SDM.keOriginContentFamily);
                $('#optImgToggle').html("Show full-size images");
                SDM.fullSize=false;
              }
              else {
                SDM.fullSize=true;
                $('#optImgToggle').html("Show thumbnail images");
                page.sendUserKeyEvent('enableFullSizeImages', 'article', zStr, SDM.keOriginContentFamily);
              }
              $('#rightColumn').doTheScrollJitter();
            }, //toggleImages
            lazyLoadInit: function() {
              $('#rightColumn').lazyLoadImages({imgSel:'dl.figure img.figure'});
            },
            sendUserKeyEvent: function(a, o, z, ocf) {
              $.get(SDM.userActionURL+'/'+o+'/'+z+'/'+ocf+'/'+a);
            }, //sendUserActionKeyEvent
            // reduce the noise generated by frequently occuring events ie. scroll.
            viewHandler: function( e ){
              $("#rightColumn").unbind( "scroll.viewHandler", page.delayedScrollHandler );
              var h = $("#rightColumn").height();
              var st = $("#rightColumn").scrollTop();
              var sh = $('#rightColumn')[0].scrollHeight;

              if( st > $('#rightColumn').attr('data-st') ) { $('#rightColumn').attr('data-dir', 'd'); }
              else { $('#rightColumn').attr('data-dir', 'u'); }
              $('#rightColumn').attr('data-st', $("#rightColumn").scrollTop());
              if(st>20) {
                page.hideHeader();
              }
              else {
                page.showHeader();
              }
              setTimeout(page.viewHandlerFooter, 450);
            },
            viewHandlerFooter: function() {
              var h = $("#rightColumn").height();
              var st = $("#rightColumn").scrollTop();
              var sh = $('#rightColumn')[0].scrollHeight;
              if(st+h > sh-20 ) {
                page.showFooter();
              }
              else {
                page.hideFooter();
              }
              $("#rightColumn").bind("scroll.viewHandler", page.delayedScrollHandler );           
            },
            hideHeader: function(){
              if($('#header-area').attr('data-dynamic')=='n') {return true;}
              if($( "#header-area" ).css('display') == 'none' || $('#rightColumn').attr('data-st')=='d') {return true;}
              $( "#header-area" ).hide('blind', {}, 300);
              $( "#page-area" ).css("border-top","3px solid #6c9d30");                
              $( "#page-area" ).animate({"top": 0 },400, function() {
                //only IE need this, but should not hurt other browsers
//                page.viewHandler();
              }); // adjust
              $('#leftColumn').height('');
              return false;
            },
            showHeader: function(){
              if($('#header-area').attr('data-dynamic')=='n') {return true;}
              if($( "#header-area" ).css('display') != 'none') {return true;}
              $( "#page-area" ).css("border-top","none");
              $( "#header-area" ).show('blind', {}, 300);
              var height =  $("#header-area").height();
              $("#page-area").animate({"top": height }, 300, function() {
              } );                
              $('#leftColumn').height('');
              return false;
            },
            showFooter: function(){
              if($('#footer-area').attr('data-dynamic')=='n') {return;}
              if( $("#footer-area").height() != 0 ){ return; }

              // get the height of the footer
              var height = $("#footer").height();
              if(height==0){
                $("#footer-area").css({'position':'absolute','visibility':'hidden','display':'block','height':'auto'}); 
                height = $("#footer").height(); 
                $("#footer-area").css({'position':'','visibility':'','display':''}); 
              }
              // resize the page area and set the height of the footer-area
              // to the size of the footer. Rebind viewHandler when completed.
              $("#page-area").animate(  {"bottom": height }, 200,function(){
                  $("#footer-area").animate( {"height": height },300);
              } );
              $('#rightColumn').attr('data-st', $("#rightColumn").scrollTop()-$("#footer-area").height());
              
              // fixes a bug where the left column looses its' height
              $('#leftColumn').height('');
            },
            hideFooter: function(){
              if($('#footer-area').attr('data-dynamic')=='n') {return;}
              
              var height = $("#footer-area").height();
              if( height === 0 ){ return; } // already collapsed 
              var scrollTop = $("#rightColumn").scrollTop();
              $("#footer-area").animate({"height":0},300);
              if( page.isIE7() ){ $("#footer-area").css({"display":"none"}) }
              else{ $("#rightColumn").scrollTop( scrollTop - height  ); }
              $("#page-area").animate({"bottom":0},300, function() {
              });
              $('#leftColumn').height('');
            },         
            showLeftAd:function() {
              if(SDM.adPreventOutline == true) return;

              var iframe = $( '<iframe scrolling="no" frameborder="0" border="0" cellspacing="0" src="' + SDM.adArticleLeftURL + '"></iframe>' );
              $("#articleLeftAd").append( iframe );
            },
            adRemoveOutline:function() {
              $("#articleLeftAd").remove();
            },
            touchUpLeftAd:function(){
                $("#articleLeftAd iframe")[0].style.height =
                    $("#articleLeftAd iframe")[0].contentWindow.document.body.offsetHeight + 'px';
                $("#articleLeftAd iframe")[0].contentWindow.document.body.style.background = "#ECF2F6";
            },
            showRightAd:function() {
              $("#articleRightAd")[0].appendChild( $("#right_ad_content")[0] );// this moves the add
              $("#right_ad_content").css("display","block");
            },
            showOptionsAd:function() {
              var iframe = $( '<iframe frameborder="0" scrolling="no" border="0" cellspacing="0" src="' + SDM.adArticleOptionsURL + '"></iframe>' );
              $("#articleOptionsAd").append( iframe );
            },
            updateRightAdLeftPosition:function(){
                var sidebarAd = $("#articleRightAd");
                if( sidebarAd.css( 'position' )== 'fixed' ){
                    var rightPane = $("#rightPane"); // fixes the left position issue.
                    sidebarAd.css({'left': (rightPane.offset().left - $(window).scrollLeft() ) })
                }
            },
            hideGGCON:function() {
              $('#ggcon').hide();
              if($('#footer-area').height()>0) {
                $('#footer-area').css('height', $("#footer").height());
                $("#page-area").animate({"bottom": $("#footer").height()}, 200);
              }
            },
            moveGGCON:function(s) {
              $('#footer .bottomArticle').append('<div id="ggcon">' + s + '</div>');
              $('#ggcon').css('display', 'inline-block').show();
              if($('#footer-area').height()>0)$("#page-area").animate({"bottom": $("#footer").height()}, 200);
              page.setPaneWidths();
            },
            doHighlighting:function(ev) {
              //function to take care of cross-ref highlighting
              var thisObj = $(this);
              var linkId = thisObj.attr('href');
              $('#rightColumn').moveTo(linkId.substring(1));
              ev.preventDefault();
            },
            showFullTableLink:function(){
              $("dl.table").each(function(i){
                var thisObj = $(this);
                if($(thisObj.find('.table')).width()<$(thisObj.find('table')).width()){
                  $(thisObj.find(".fullsizeTable")).css('display','block');
                }
                if($(thisObj.find('.table')).width()<$(thisObj.find('dt img')).width()){
                  $(thisObj.find(".fullsizeTable")).css('display','block');
                }				
              });
			      },
            setupPDFKing:function() {
              $("#pdfLink").click(function(event) {
                var t = $(event.currentTarget);
                if (t.attr("suggestedarturl")) {
                  suggestedArt (t.attr("suggestedarturl"), event);
                }
                if (t.attr("pdfurl")) {
                  openPDF (t.attr("pdfurl"), event);
                }
                return true;
              });
            }
        } //page

        if($.browser.msie && $.browser.version <= 6) {return;}
                
        articleToolbar.init();
        page.addDynamics();
        page.hideFooter();
        page.setupPDFKing();

        //TODO: This should be inside outline
        if(SDM.entitled==true && SDM.pageType=='article_full') {
          page.opts.selector = page.selectorE;
          page.opts.focusEffect = true;
          $('#centerPane').outline( $('#outline'), page.opts );
        }
        else {
          if($('#centerPane div.articleOutlineHidden').length<1) {
            page.opts.selector = page.selectorUE;
            page.opts.focusEffect = false;
            page.opts.empty = true;
            $('#centerPane').outline( $('#outline'), page.opts );
            $('#outline').css('top', 0);
            $('#outline .outlineMsg').html('This document does not have an outline.')
                                     .css('padding-left',5)
                                     .css('margin-top', 38)
                                     .show();
          }
          else {
            page.opts.selector = page.selectorUE;
            page.opts.focusEffect = false;
            $('#centerPane').outline( $('#outline'), page.opts );
          }
        }
        $('#outline ul li').css('margin-right', $.scrollBarWidth());
        $('#outline').attr('data-st', 0);
        $('#leftColumn').hover(
          function() {
            Outline.hoverOverOn();
            if( $(window).width() <= 1200) {
              clearTimeout(Outline.pendingCloseTimer);
            }
          }, 
          function() { 
            Outline.hoverOverOff();
            if( $(window).width() <= 1200) {
              Outline.pendingCloseTimer = setTimeout(Outline.sidebarClose, 1000);
            }
          } 
        );

        page.delayedScrollHandler = _.debounce( page.viewHandler, 300 );
        $( "#rightColumn" ).bind( "scroll.viewHandler", page.delayedScrollHandler );

        $(".intra_ref").bind("click",page.doHighlighting);        
        $('a.articleOptions').toggle(
            function() { $('div.articleOptions').css('display', 'block');},
            function() {$('div.articleOptions').css('display', 'none');}
         );
        $('#optImgToggle').click(function() {page.toggleImages('toolbar');});
        $('#leftColumn').height('');

        refResolve();
        populateRelLinks();
        if(SDM.imageLazyLoading==true) page.lazyLoadInit();
       
        page.showFullTableLink();
        
        if(SDM.crawlerAvail==false) {
          if(SDM.mlktAvail) buildRelatedResults();
          if(SDM.citedByScAvail) buildCitedByBox();
        }
		
        if(SDM.suppContentInline) EComponent.init();
        CanonicalLink.init();
        CanonicalHomeLink.init();
        if(SDM.displayGadgets) {
          SDM.sciverseDecoded=false;
          var gadgetURL = SDM.urlPrefix +'/gadgets/render/'+SDM.pii;
          $.post(gadgetURL,{ JSONString:SDM.sciverseJsonObject },
                 function(data){
                   if (data) {
                     try {
                       sciverse = decodeURIComponent(decodeURIComponent(data));
                       SDM.sciverseDecoded=true;
                     } catch (err) {
                       SDM.sciverseDecoded=false; 
                     }
                   }
                   if(SDM.sciverseDecoded==true && sciverse.length>0) {
                     prs.rt('svAppLibs_start');
                     LazyLoad.js([SDM.svShindigLib, SDM.svSciverseLib], function() {
                       SD_UTIL.displayGadgetsWrapper();
                       if(page.isIE7())page.setPaneWidths();
                       prs.rt('svAppLibs_end');
                     }); 
                   }
          });
        }
        ready=true;
        return page;
    }();
} //initializeArticlePage

$.fn.outline = function(oObj, opts) {
  var cfg = {
      empty: false,
      selector: '.outlineItem',
      focusEffect: true,
      focus: {}
    };

  return this.each(function() {
    if(opts) {
      $.extend(true, cfg, opts);
    }

    oObj.append('<ul></ul>');
    oObj.parent().prepend('<div id="outlineGraphicsCheckBoxBox">'
            + '<label><input id="outlineGraphicsCheckBox" type="checkBox" checked="true">Show thumbnails in outline</label>'
            + '</div>');
    var level = "";
    var isGraphics = false;
    prs.rt('outlineLoop_start');

    if($(cfg.selector).length>0) {
      $(cfg.selector).each(function() {
        if($(this).parents('.textboxBody').length>0) {
        }
        else {
          if($(this).attr('id')==undefined) {
            $(this).attr('id', 'bs_' + Math.floor(Math.random()*100000));
            DBG.out(1, 'fixing id::' + $(this).attr('id') + '::'  + $(this).text());
          }
          DBG.out(4, 'adding::' + $(this).text());
          //This if needs to be in sync with the outlineElegibleSel
          if($(this).is("h2")||$(this).is("h3")||$(this).is("h4")) {
            level = $(this)[0].tagName;
            level = level.toLowerCase();
            var label = $(this).html();
            if(label==undefined) label='';
            if (SDM.entitled==true) {
              oObj.children('ul').append(Outline.addItemSection($(this).attr('id'), label, level));
            } else {
              //Note: In case of unentitled view we render the outline from a hidden div in center pane
              oObj.children('ul').append(Outline.addItemOutline($(this).attr('id'), label, level));
            }
          }
          else {
            isGraphics = true;
            if($(this).hasClass('table')==true) {
              var label = $(this).find(".label").html();
              if(label==undefined) label='';
              oObj.children('ul').append(Outline.addItemTbl($(this).attr('id'), label, level));
            }
            else if($(this).hasClass('figure')==true) {
              var label = $(this).find(".label").html();
              if(label==undefined) label='';
              var image = $(this).find("dt img").attr('data-thumbsrc');
              oObj.children('ul').append(Outline.addItemFig($(this).attr('id'), label, image, level));
            }
            else if($(this).hasClass('ecomponent')==true) {
              var label = $(this).attr('data-label');
              if(label==undefined) label='';
              var ext = $(this).attr('data-ext');
              oObj.children('ul').append(Outline.addItemMMC($(this).attr('id'), label, ext, level));
            }
            else {
            }
          }
        }
      })
      $('#leftColumn .outlineMsg').hide();
    }
    else {
      $('#outline').css('top', 0);
      $('#outline .outlineMsg').html('This document does not have an outline.')
                               .css('padding-left',5)
                               .css('margin-bottom', 10)
                               .css('margin-top', 5)
                               .show();
    }

    prs.rt('outlineLoop_end');

    oObj.append('<div id="articleLeftAd"></div>');
    
    //Setup the sync between rightColumn scroll and outline highlight
    if(cfg.focusEffect==true) {
      oObj.syncTo(cfg);
    }
    
   //moved to line 602; $('#leftColumn .outlineMsg').hide();
    $('#leftColumn ul').show();
    
    if(SDM.outlineImgFence==true)  {
      if($('li div.fig, li div.tbl, li div.mmc').length > 0 && SDM.entitled==true) {	
        if(SDM.outlineGraphics == true) {
          $('#outlineGraphicsCheckBox').attr('checked', true).change(Outline.toggleGraphics);
        }
        else {	  
          $('#outlineGraphicsCheckBox').attr('checked', false).change(Outline.toggleGraphics);
          $('li div.fig, li div.tbl, li div.mmc').parent().hide();
        }
      }
      else {
        $('#outlineGraphicsCheckBoxBox').hide();
	      $('#outline').css('top','0');
	      $('#outline').css('padding-top','12px');
      }
	  }
	  else {
// when ARTICLE_OUTLINE_IMAGES FENCE is set to FALSE, check box and thumnails in outline will not be displayed 
      $('#outlineGraphicsCheckBoxBox').hide();
	    $('#outline').css('top','0');
	    $('#outline').css('padding-top','12px');
      $('li div.fig, li div.tbl, li div.mmc').parent().hide();	  
	  }
  
    $('#leftColumnSmall2').click(function(e) {Outline.sidebarOpenClick(e)});
    $('#leftColumnSmall').click(function(e) {Outline.sidebarCloseClick(e)});
  }); //return
} //.outline

var Outline = {
  onHover:false,
  pendCloseTimer:null,
  addItemMMC: function(hashId, lbl, ext, hStr) {
    var extClassName = "olIconMMCDef";
    if(ext=="pdf"){extClassName="olIconMMCPdf"}
    else if(ext=="avi"){extClassName="olIconMMCMov"}
    else if(ext=="csv"){extClassName="olIconMMCCsv"}
    else if(ext=="eps"){extClassName="olIconMMCEps"}
    else if(ext=="flv"){extClassName="olIconMMCFlv"}
    else if(ext=="gif"){extClassName="olIconMMCImg"}
    else if(ext=="jpg"){extClassName="olIconMMCJpg"}
    else if(ext=="kmz"){extClassName="olIconMMCDef"}
    else if(ext=="mml"){extClassName="olIconMMCDef"}
    else if(ext=="xls"){extClassName="olIconMMCExcel"}
    else if(ext=="ppt"){extClassName="olIconMMCPpt"}
    else if(ext=="doc"){extClassName="olIconMMCWord"}
    else if(ext=="mp3"){extClassName="olIconMMCAud"}
    else if(ext=="mpg"){extClassName="olIconMMCMov"}
    else if(ext=="mp4"){extClassName="olIconMMCMpg4"}
    else if(ext=="txt"){extClassName="olIconMMCTxt"}
    else if(ext=="png"){extClassName="olIconMMCPng"}
    else if(ext=="mov"){extClassName="olIconMMCMov"}
    else if(ext=="rtf"){extClassName="olIconMMCRtf"}
    else if(ext=="svg"){extClassName="olIconMMCSvg"}
    else if(ext=="tar"){extClassName="olIconMMCDef"}
    else if(ext=="tif"){extClassName="olIconMMCDef"}
    else if(ext=="zip"){extClassName="olIconMMCZip"}
    else {extClassName = "olIconMMCDef";}

    var html = "<li><div id='ol_" + hashId + "' class='item " + hStr + "sec mmc'>"
             + "<div class=\"olIcon " + extClassName + "\"></div><a class=\"olIcon " + extClassName + "\" href='" + "' onClick=\"return $('#rightColumn').moveTo('" + hashId + "\')\">"
             + lbl + "</a></div></li>";
    return html;
  },  //Outline.addOutlineItemTbl
  addItemTbl: function(hashId, lbl, hStr) {
    var html = "<li><div id='ol_" + hashId + "' class='item " + hStr + "sec tbl'>"
             + "<div class=\"olIcon olIconTbl\"></div><a class=\"olIcon olIconTbl\" href='" + "' onClick=\"return $('#rightColumn').moveTo('" + hashId + "\')\">"
             + lbl + "</a></div></li>";
    return html;
  },  //Outline.addOutlineItemTbl
  addItemFig: function(hashId, lbl, img, hStr) {
    var html = "<li><div id='ol_" + hashId + "' class='item " + hStr + "sec fig'>"
             + "<a href='" + "' onClick=\"return $('#rightColumn').moveTo('" + hashId + "\')\">"
             + "<img src='" + img + "'></a></div></li>";
    return html;
  },  //Outline.addOutlineItemFig

  addItemSection: function(hashId, lbl, hStr) {
    var html = "<li><div id='ol_" + hashId + "' class='item " + hStr + "sec'>"
             + "<a href='#" + hashId + "' onClick=\"return $('#rightColumn').moveTo('" + hashId + "\')\">"
             + lbl + "<br>"
             + "</a></div></li>";
    return html;
  }, //Outline.addOutlineItemSection

  addItemOutline: function(hashId, lbl, hStr) {
  //outline for non-subscribed articles
    var html = "<li><div class='item " + hStr + "sec'>"
             + "<a class='cLink' queryStr='" + SDM.urlTOCLinkQueryStr + "' href='" + SDM.urlTOCLink + "'\>"
			 //"#" + hashId + is not added to the href as SEO crawl will not support the jumps hereon
             + lbl + "<br>"
             + "</a></div></li>";
    return html;
  }, //Outline.addOutlineItemSection
  sidebarOpenClick: function(e) {
    Outline.sidebarOpen(true);
    ArticlePage.sendUserKeyEvent('openLeftPane', 'article', 'leftPane', SDM.keOriginContentFamily);
    return false;
  },
  sidebarCloseClick: function(e) {
    Outline.sidebarClose();  
    ArticlePage.sendUserKeyEvent('closeLeftPane', 'article', 'leftPane', SDM.keOriginContentFamily);
    return false;
  },
  sidebarOpen: function(e) {
    if($('#leftColumn').css('display')=='none') {
      $('#leftColumnSmall2').hide();

      if($.browser.msie && ($.browser.version == 7||$.browser.version == 8)) {
//        $('#leftColumn').height('').height($('#leftColumn').height());
      }
      else {
        $('#leftColumn').height('').height($('#leftColumn').height());
      }

      $('#leftColumn').show('slide', 250, function() {
        var ol = $('#outline');
        ol.css('overflow-y', 'auto');
        if(ol.attr('data-st')==undefined) {}
        else {
          ol.attr('scrollTop', ol.attr('data-st'));
        }
        ol.css('overflow-y', 'hidden');
        if(e==true) {
          Outline.hoverOverOn();
        }
      });
    }
  },
  sidebarClose: function() {
    if($('#leftColumn').css('display')=='block' && $('#leftColumn').attr('data-closing')!='y') {
      var ol = $('#outline');
      var st = ol.scrollTop();
      ol.attr('data-st', st);
      ol.css('overflow-y', 'hidden');

      $('#leftColumn').attr('data-closing', 'y');
      if($.browser.msie && ($.browser.version == 7||$.browser.version == 8)) {
//        $('#leftColumn').height('').height($('#leftColumn').height());
      }
      else {
        $('#leftColumn').height('').height($('#leftColumn').height());
      }
      $('#leftColumn').hide('slide', 250, function() {
        $('#leftColumnSmall2').show();
        $('#leftColumn').attr('data-closing', '');
      });
    }
  },
  collapseSmallLeft: function() {
  }, //Outline.collapseSmallLeft
  expandSmallLeft: function() {
  }, //Outline.expandSmallLeft
  toggleGraphics: function() {
    if(SDM.outlineGraphics == true) {
      SDM.outlineGraphics = false;
      var ulWidthBefore = $('#outline ul').width();
      $('li div.fig, li div.tbl, li div.mmc').parent().hide();
      var ulWidthAfter = $('#outline ul').width();
      if(ulWidthAfter > ulWidthBefore && !ArticlePage.isIE7()) {
        $('#outline').css('overflow-x', 'hidden');
        $('#outline').attr('data-osbp', 'n');
        $('#outline ul li').css('margin-right', $.scrollBarWidth());
      }
      else if(ulWidthAfter < ulWidthBefore && !ArticlePage.isIE7()) {
        $('#outline').attr('data-osbp', 'y');
        $('#outline ul li').css('margin-right', 0);
      }

      ArticlePage.sendUserKeyEvent('disableOutlineGraphics', 'article', 'leftPane', SDM.keOriginContentFamily);
    }
    else {
      SDM.outlineGraphics = true;
      var ulWidthBefore = $('#outline ul').width();
      $('li div.fig, li div.tbl, li div.mmc').parent().show();
      var ulWidthAfter = $('#outline ul').width();
      if(ulWidthAfter > ulWidthBefore && !ArticlePage.isIE7()) {
        $('#outline').attr('data-osbp', 'n');
        $('#outline ul li').css('margin-right', $.scrollBarWidth());
      }
      else if(ulWidthAfter < ulWidthBefore && !ArticlePage.isIE7()) {
        $('#outline').css('overflow-x', 'auto');
        $('#outline').attr('data-osbp', 'y');
        $('#outline ul li').css('margin-right', 0);
      }
      ArticlePage.sendUserKeyEvent('enableOutlineGraphics', 'article', 'leftPane', SDM.keOriginContentFamily);
    }
  }, //Outline.toggleGraphics
  hoverOverOn: function() {
    this.onHover = true;
    var ol = $('#outline');
    ol.doTheScrollJitter()
        
    var ulWidthBefore = $('#outline ul').width();

    if(ArticlePage.isIE7()) {}
    else {
      ol.css('overflow-x', 'auto');
    }
        
    ol.css('overflow-y', 'auto');
    if(ol.attr('data-st')==undefined) {}
    else {
      ol.attr('scrollTop', ol.attr('data-st'));
    }
        
    var ulWidthAfter = $('#outline ul').width();
    if(ulWidthAfter < ulWidthBefore) {
      ol.attr('data-osbp', 'y');
      if(ArticlePage.isIE7()) {}
      else {
        ol.find('li').css('margin-right', 0);
      }
    }
    else {
      ol.attr('data-osbp', 'n');
      if(ArticlePage.isIE7()) {
//              ol.find('li').not('.outlineFocus').css('margin-right', 0);
      }
      else {
//        ol.find('li').not('.outlineFocus').css('margin-right', 0);
      }
      ol.find('li.outlineFocus').parent().css('background', '#ffffff');
    }
    ol.css('background', '#ffffff');
    ol.children('ul').css('background', '#ffffff');
    ol.addClass('active');

    ol.addClass('active');
        
    $('#articleLeftAd').css('background', '#ffffff');
    if( $("#articleLeftAd iframe").length > 0 ){
      $('#articleLeftAd iframe')[0].contentWindow.document.body.style.background = "#ffffff";
      $('#articleLeftAd iframe').css('background', '#ffffff');
    }
  },
  hoverOverOff: function() {
    this.onHover = false;
    var ol = $('#outline');
    ol.doTheScrollJitter()
    var ulWidthBefore = $('#outline ul').width();

    var st = ol.scrollTop();
    ol.attr('data-st', st);
    ol.css('overflow-y', 'hidden');
    ol.css('overflow-x', 'hidden');
    var ulWidthAfter = $('#outline ul').width();

    if(ArticlePage.isIE7()) {
      if(ulWidthAfter < ulWidthBefore) {
      }
      else {
        $('#outline ul li').css('margin-right', $.scrollBarWidth());
      }
    }
    else {
      if(ulWidthAfter < ulWidthBefore) {
        $('#outline ul li').css('margin-right', $.scrollBarWidth());
      }
      else {
        $('#outline ul li').css('margin-right', $.scrollBarWidth());
      }
    }
    ol.find('li.outlineFocus').parent().css('background', '#ecf2f6');
    ol.css('background', '#ecf2f6');
    ol.children('ul').css('background', '#ecf2f6');

    ol.removeClass('active');
    //This must be at end or FF will reset the scroll
    ol.attr('scrollTop', st);
        
    $('#articleLeftAd').css('background', '#ecf2f6');
    if( $("#articleLeftAd iframe").length > 0 ){
      $('#articleLeftAd iframe')[0].contentWindow.document.body.style.background = "#ecf2f6";
      $('#articleLeftAd iframe').css('background', '#ecf2f6');
    }      
  }

} //Outline


//////////////////////////////
//Scroll element to id and apply effects
$.fn.moveTo = function(id, opts) {
  var cfg = {
        scrollSpeed: 100,
        offset: -40,
        bounce: true,
        bounceSpeed: 125,
        bounceHeight: 10,
        focus: true,
        focusColor: '#D9D9D9',
        focusReturnColor: 'ORIGINAL',
        focusUp: 200,
        focusHold: 300,
        focusDown: 200,
        setFocus: true
  };
  //TODO:: not right design pattern, but returns false
  // to avoid reloading page/jumping
  // maybe they should not be <a> tags in outline?
  // or wrap call to moveTo and return flase from wrapper
//  return this.each(function() {
    if(opts) {
        $.extend(cfg, opts);
    }
    //TODO:make config based
    if($('#leftColumnSmall').css('display')!='none') {
      Outline.sidebarClose();
    }

    // !"#$%&'()*+,./:;?@[\]`{|}~ need to be escaped (we only expect .:)
    id = id.replace(/[\.]/g, '\\.');
    id = id.replace(/[\:]/g, '\\:');
    var $elm = $('#'+id);
    DBG.out(2, 'id::' + id + '     ' + 'position::' + $('#'+id).position().top + '+' + cfg.offset);
    var pos = $('#'+id).position().top + cfg.offset;
    if(cfg.bounce==true && pos==$(this).scrollTop()) {
      $(this).animate( {scrollTop: '-='+cfg.bounceHeight.toString()}, cfg.bounceSpeed)
             .animate( {scrollTop: '+='+cfg.bounceHeight.toString()}, cfg.bounceSpeed);
    }
    $(this).animate({scrollTop: pos}, cfg.scrollSpeed);

    if(cfg.focusReturnColor=='ORIGINAL') {
      cfg.focusReturnColor = $elm.backgroundColor();
    }
    if(cfg.focus==true) {
      $('#'+id).animate( {backgroundColor: cfg.focusColor}, cfg.focusUp, function() { 
        setTimeout( function() {$('#'+id).animate( {backgroundColor: cfg.focusReturnColor}, cfg.focusDown)}, cfg.focusHold);
      });
    }
    if(cfg.setFocus==true) {
      $elm[0].tabIndex=0;
      $elm[0].focus();
      $elm[0].tabIndex=-1;
    }
//  })
      return false;
} //$.fn.moveTo

$.fn.doTheScrollJitter = function(amt) {
  if(amt==undefined) amt=1;
  if($(this).scrollTop() != 0) {
    var st = $(this).scrollTop() - amt;
    $(this).attr('scrollTop', st);
    st = $(this).scrollTop() + amt;
    $(this).attr('scrollTop', st);
  }
}
$.fn.backgroundColor = function() {
  var bg = $(this).css('backgroundColor');
  if(bg=='rgba(0, 0, 0, 0)' || bg=='transparent') {
    var pbg='';
    $(this).parents().each(function() {
      if( $(this).css('backgroundColor')=='rgba(0, 0, 0, 0)' || $(this).css('backgroundColor')=='transparent' ) {}
      else {
        if(pbg=='') { pbg = $(this).css('backgroundColor'); }
      }
    });
    return pbg;
  }
  else {
    return bg;  
  }
}

$.scrollBarWidth = function() {
if(document.body.clientWidth) {
  document.body.style.overflow = 'hidden';
  var width = document.body.clientWidth;
  document.body.style.overflow = 'scroll';
  width -= document.body.clientWidth;
  if(!width) width = document.body.offsetWidth - document.body.clientWidth;
  document.body.style.overflow = '';
  $.scrollBarWidth = function() {
    return width;
  }
  return width;
}
else { //makes ie7 happy
  document.documentElement.style.overflow = 'hidden';
  var width = document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'scroll';
  width -= document.documentElement.clientWidth;
  if(!width) width = document.documentElement.offsetWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = '';
  $.scrollBarWidth = function() {
    return width;
  }
  return width;
}
}

var DBG = {
  out: function(lvl, str) {
    if(SDM.debugFlag=="undefined") {return;}
    if(SDM.debugFlag >= lvl || lvl==0) {
      if(typeof console=== "undefined" || typeof console.log==="undefined"){
        if(!$('#sdConsole').length) {
          $('body').append('<textarea id="sdConsole" class="ui-widget-content" cols="60"></textarea>');
          $('#sdConsole').resizable();
        }
        $('#sdConsole').append(str + "<br>");
      }
      else{console.log(str) }
    }
  }
} //DBG

var SD_UTIL = {
  loadLib: function(urlStr) {
    var headID = document.getElementsByTagName('head')[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = urlStr;
    headID.appendChild(newScript);
  },
  sendStats:function(){
 		var params = '';
		for( var i = 0;i < prs.length;i++){
			params += "data=" + prs[i].toString() + "&";
		}
		params += "key=" + SDM.pageTransKey + "&";
		params += "pagetype=" + SDM.pageType;

		$.post(SDM.urlPrefix+"/pageReport",params);
  },
  displayGadgetsWrapper: function() {
    if(typeof displayGadgets=='function') displayGadgets();
    else setTimeout('SD_UTIL.displayGadgetsWrapper()', 250);
  },
  getProdColor: function(){
    return (SDM.prodColor==""?"sci_dir":SDM.prodColor);
  },
  getIFrameHeight: function(ifr) {
    var ifrDoc=ifr.contentWindow||ifr.contentDocument||ifr.document;
    if(ifrDoc.document!=undefined) ifrDoc=ifrDoc.document;
    return $(ifrDoc.body).height();
  },
  resizeIFrame: function(iframeBox, iframeHeight) {
//    var newHeight = SD_UTIL.getIFrameHeight(ifr);
    $('#' + iframeBox + ' iframe').height(iframeHeight);
    
  }
}
////////////////////
////////////////////
////////////////
// Lazy Loader
$.fn.lazyLoadImages = function(opts) {
  var cfg = {
    imgSel: 'img'
  };

  function scrollAction() {
    var bottom = $(window).height() + $('#rightColumn').scrollTop();
    $(cfg.imgSel).each(function() {
//      $(this).removeClass('imgLazyFull').parent().parent().position('block');
      if( Math.abs($('#rightColumn').scrollTop()+$(window).height() - $(this).position().top+$(this).height()) < $(window).height()
       || Math.abs($('#rightColumn').scrollTop() - $(this).position().top)  < $(window).height() ) {
        var imgObj = $(this);
        if(imgObj.attr('data-thumbsrc') == imgObj.attr('src') 
        && imgObj.attr('data-loaded')!='true'
        && SDM.fullSize==true) {
          imgObj.attr('src', imgObj.attr('data-fullsrc')).attr('data-loaded', 'true');
        }
        $(this).parent().parent().css('height', '').css('width', '');
      }
      else {
//        $(this).addClass('imgLazyFull').parent().parent().position('relative');
      }
    })
  } //scroll

  return this.each(function() {
    if(opts) {
      $.extend(cfg, opts);
    }
      
    var lazyScroll = _.debounce(scrollAction, 300);
    $(this).scroll( lazyScroll );

  }) //return
};

jQuery.fn.lazyLoad = function( cfg ){
    // Internal function used to implement `_.throttle` and `_.debounce`.
    var limit = function(func, wait, debounce) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          var throttler = function() {
            timeout = null;
            func.apply(context, args);
          };
          if (debounce) clearTimeout(timeout);
          if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    };
    var plugin = {
      objs:[],
      buffer: cfg.buffer?cfg.buffer:50, // 50 pixels by default
      batchSize: cfg.batchSize?cfg.batchSize:1, // 1 is the default batch size.
      scrollSrc: cfg.scrollSrc?cfg.scrollSrc:'#rightColumn',
      callback: cfg.intoView?cfg.intoView:function(obj,idx){},
      screenTop: $(window).scrollTop(),
      screenHeight:$(window).height(),
	  debounce: function(func, wait) { return limit(func, wait, true); },
      calculateView: function(){
  
        if( plugin.applyPatch() ){ // patch for IE
            plugin.buffer += 500;
//            plugin.screenTop = $( "html" ).scrollTop() - plugin.buffer;
            plugin.screenTop = $( plugin.scrollSrc ).scrollTop() - plugin.buffer;
        }else{
//            plugin.screenTop = $( window ).scrollTop() - plugin.buffer;
            plugin.screenTop = $( plugin.scrollSrc ).scrollTop() - plugin.buffer;
        }
        var screenBot = plugin.screenTop + $(window).height() + plugin.buffer;
        var batch = [];
        var objs = [];
        $.each( plugin.objs, function(){
          var tmpTop= this.top;
          if( plugin.applyPatch() ){ // patch IE
             tmpTop = this.el.offsetTop;
             this.top = tmpTop;
          }

          if( tmpTop > plugin.screenTop &&
              tmpTop < screenBot ){                        
            batch.push( this );            
            if( plugin.batchSize == 1 ){            
              plugin.callback( batch );
              batch = [];
            }else{              
              if( batch.length == plugin.batchSize ){
                plugin.callback( batch ); // call callback to handle batch.
                batch = []; // clear the batch and start collecting again.
              }
            }
          }else{
            objs.push( this );
          }          
        });       
        if( batch ){ plugin.callback( batch ); } // run any remainder in batch
        plugin.objs = objs;
      },
      loadAll:function(){
          
          //if( plugin.batchSize==1){ // batch is default so load all items.
              plugin.callback( plugin.objs );    
          //}else{ // use the specified batchsize to load all elements.
            //  for( var i=0;i<plugin.objs.length;i++){
            //    plugin.callback(  plugin.objs.slice(i, plugin.batchSize)  );
           //   }
          //}
                  
      },
      loadOne:function(id){
        if (id > 0){
           plugin.callback( plugin.objs,id); 
        }
      },
      applyPatch:function(){
          return ($.browser.msie && $.browser.version < 9)
      }
    }
    
    var elements = this;    
    $.each( elements, function(){
       if( plugin.applyPatch() ){ // patch IE     
           var top = this.offsetTop;
           //alert( "IE top: " + top );
           plugin.objs.push({"top":top,"el":this});    
       }else{
           //alert( "Other tops: " + $(this).offset().top ) ;
           plugin.objs.push({"top":$(this).position().top,"el":this});
       }
       
    });
    
    // clean up signal to eliminate noise
    var lazyResize = plugin.debounce(plugin.calculateView,300);
   
    // clean up signal to eliminate noise
    var lazyScroll = plugin.debounce(plugin.calculateView, 300);
    
    $(window).resize( lazyResize );
//    $(window).scroll( lazyScroll );
    $(plugin.scrollSrc).scroll( lazyScroll );
    
    plugin.calculateView();
    
    return plugin;
}  

// end of Lazy Loader

//Article Citation
function submitCitation(actionUrl) {
document.forms["citationInfo"].action = actionUrl; 
document.forms["citationInfo"].submit(); 
}
//Article Refer to by link
function populateRelLinks() {
var refLink = document.getElementById("refersToAndReferredToBy");

$.ajax(
   {
      url: SDM.refLinkURL,
      type: 'GET',
      error: function() 
      {
         refLink.innerHTML = ' ';
      },
      success: function(res) {
        if(res.replace(" ","")!=""){
            refLink.style.display = 'block';
            refLink.innerHTML = res;
        } else {
            $("#refersToAndReferredToBy").remove();
        }
      }
   });
}

function isNotNumber (o) {
  if (o == -1) {
     return true;
  }
  return isNaN (o-0);
}
function getNumber(str) {
   if(!str) {
      return -1;
   }
   var i=0;
   while(i < str.length) {
      var charat = str.charAt(i);
      if (!isNotNumber(charat)) {
         if (charat != "0") {
           return str.substring(i);
         }
      }
      i++;
   }
}
//Reference resolution
var ajaxRefResol;
var ajaxCitedByUpdate;
function updateCitedByCounts(citedByCounts,isHoover,start,count) {
 citedByCounts = citedByCounts.substring(0,citedByCounts.length-1);
  var updateCitedUrl = updatedCitedBy + citedByCounts;

  ajaxCitedByUpdate = new $.ajax({
       url: updateCitedUrl,
       type: 'GET',
       async : isHoover,
       error: function() {
          $(".citedBy_").each(function(){
             $(this).html("");
          });
       },
       success: function(res) {
         var citedBy = decodeURIComponent(res);
         if (citedBy != null) {
            this.$citedByDiv = $('<div></div>')
              .hide()
              .append($(citedBy)
           );
           $(".citedBy_").each(function(){
              if(myXabsCounts[this.id]) {
                 if( this.innerHTML.match('Cited By in Scopus') == null) {
                  $(this).html( myXabsCounts[this.id]);
                 }
              }
           });
           $(".citedBy_").each(function(){
               var v = parseInt(getNumber(this.id));
               var end = parseInt(start)+parseInt(count);
               if ( (v != -1) && (v >= parseInt(start)) && (v < end)) {
                   if(!myXabsCounts[this.id]) {
                      $(this).html("");
                   }
               }
           });

         }
       }
   });
}
String.prototype.substringBetween = function (string1, string2) {
    if ((this.indexOf(string1, 0) == -1) || (this.indexOf(string2, this.indexOf(string1, 0)) == -1)) {
        return (-1);
    } else {
        return this.substring((this.indexOf(string1, 0) + string1.length), (this.indexOf(string2, this.indexOf(string1, 0))));
    }
};

var lazyRefs = null;

function refResolve() {

   lazyRefs = $(".refPlaceHolder").lazyLoad({
          batchSize:50,
          intoView:function(objs,idx){
            if( objs ){
                if( objs[0] ){
                    var start = $(objs[0].el).attr("id").substring(8);
                    if(!start) {
                      start = 1;
                    }
                    var count = objs.length;
                    if (idx) {
                       resolveRefs(idx,1);
                    } else {
                       resolveRefs( start, count );
                    }
                }
            }
          }
   });
}


function resolveRefs( start, count ){

     var url = refResolvePath + "&_refRangeStart="+start+"&_refRangeCount="+count;
     var isHoover = true;
     if (count == 1) {
       isHoover = false;
     }
     ajaxRefResol = new $.ajax({
             url: url,
             type: 'GET',
             async : isHoover,
             error: function() {
                 $(".refPlaceHolder").each(function(){
                     $(this).html(' <span style="color:red;"> [SD-008]<\/span>');
                  });
                 return;
              },
              success: function(res) {
                var refMap = decodeURIComponent(res);
                var citedBySCEids = refMap.substringBetween("#","^");
                var tmp = "#"+citedBySCEids+"^";
                refMap = refMap.replace(tmp,"");
                if (refMap != null) {
                   this.$OuterDiv = $('<div></div>')
                      .hide()
                      .append($(refMap)
                   );
				   
                   $(".refPlaceHolder").each(function(){
                      if (myMap[this.id.toLowerCase()]) {
                        if(this.innerHTML.match('/science?') == null){
                            $(this).html(myMap[this.id.toLowerCase()] );
                        }
                      }
                    });
                   // update Cited by counts
				  if(citedBySCEids != null && citedBySCEids != ""){
                    updateCitedByCounts(citedBySCEids,isHoover,start,count);
				   }
               }
                // shut the spinner down for no data
                $(".refPlaceHolder").each(function(){
                   var v = parseInt(getNumber(this.id));
                   var end = parseInt(start)+parseInt(count);
                   if ( (v != -1) && (v >= parseInt(start)) && (v < end)) {
                      if (!myMap[this.id]) {
                         $(this).html("");
                      }
                    }
                });
             }
     });
}


//Reference resolution End

//Nonserial Index and glossary ajax call
var loadsection;
function loadSection(baseUrl,section){

 var endPoint = baseUrl+section;
 var div1 = document.getElementById("indexSection");
 loadsection = new $.ajax(
   {
      url: endPoint,
      type: 'GET',
      error: function() 
      {     
         div1.innerHTML = '';
      },
      success: function(res) {
        div1.innerHTML = res;		
                if($('#'+section).position()!=null){
                  $('#rightColumn').moveTo(section);
                }
		var secTitle=$('#sectitle');	
		$('#ol_sectitle').html("<a onclick=\"return $('#rightColumn').moveTo('sectitle')\"  href='"+secTitle.attr('id')+"'>"+secTitle.html()+"<br></a>");
            
      }
   });
}

/*-------------------------- TOOL BAR CODE STARTS HERE -------------------*/
 //document.getElementById("centerPane").click()
 var AutoCompleFlag =false;
 var IE7HeightFixGlobalVar;
var articleToolbar = {
    DEFAULT_QS_TEXT: "Search ScienceDirect",
    init:function() {
//      this.artInternalLnkPos();
    	$("#quickSearch").css("color", "#9b9b9b");
	    $("#articleToolbar .sdSearch input").val("Search ScienceDirect");
//	    $('a.articleOptions').click(articleToolbar.toolBarHandler);
	    $("#quickSearchButton").click( articleToolbar.toggleQuickSearch );
      //the below code for ie7
      if( $("#sdQuickSearch").is(":visible") ){
        $("#rightColumn").bind('click',articleToolbar.toggleQuickSearch);
      }
	    $("#moreOptionsButton").click( articleToolbar.toggleOptions );
	    $('#quickSearch').bind('keypress',articleToolbar.qssmall_frmsubmit);
	    $('#articleToolbar .sdSearch button.submit').bind('click',articleToolbar.qSearchbut);
	    $('#articleToolbar .sdSearch input').bind('focusin',articleToolbar.showTextQSonFocus);
	    $('#articleToolbar .sdSearch input').bind('focusout',articleToolbar.showTextQSoutFocus);
        
        //make sure the icons for toolbar are clickable too 	    
	    $('.icon_pdf div').click(function(){ $('.icon_pdf a').click();  })
	    $('.icon_orderdoc'+SD_UTIL.getProdColor()+' div').click(function(){ 
	        document.location = $(".icon_orderdoc"+SD_UTIL.getProdColor()+" a").attr("href");  });
	    $('.icon_exportarticle'+SD_UTIL.getProdColor()+' div').click(function(){ 
	        document.location = $(".icon_exportarticle"+SD_UTIL.getProdColor()+" a").attr("href"); })
	    $('.email'+SD_UTIL.getProdColor()+' div').click(function(){
	        document.location = $(".email"+SD_UTIL.getProdColor()+" a").attr("href"); });
	    $('.alert'+SD_UTIL.getProdColor()+' div').click(function(){
	        document.location = $(".alert"+SD_UTIL.getProdColor()+" a").attr("href"); });
        $('.thumbnail'+SD_UTIL.getProdColor()+' div').click(function(){
	        document.location = $(".thumbnail"+SD_UTIL.getProdColor()+" a").attr("href"); });
        $('.fullsize'+SD_UTIL.getProdColor()+' div').click(function(){
	        $(".fullsize"+SD_UTIL.getProdColor()+" a").click(); });
    },
    toggleQuickSearch:function(e){
		AutoCompleFlag =false;
        if( $("#sdQuickSearch").is(":visible") ){
			      $("#quickSearchButton").attr("title", "Show more quick search options");
            $("#quickSearchButton div").removeClass("up_" + SD_UTIL.getProdColor() );
        }else{
			      $("#quickSearchButton").attr("title", "Show less quick search options");
            $("#quickSearchButton div").addClass("up_" + SD_UTIL.getProdColor() );
        }
        
        $("#sdQuickSearch").toggle('blind',function(){
            if( $("#sdQuickSearch").is(":visible") ){
                articleToolbar.disableQS();
            }else{
                articleToolbar.enableQS(); 
            }                
        });
        
        $('body').bind('click',articleToolbar.closeQS);
        $('#rightColumn').bind('scroll',articleToolbar.closeQS);
        articleToolbar.closeOptions();        
        articleToolbar.killEvent( e );        
    },
    toggleOptions:function(e){
		    AutoCompleFlag =true;
        if( $("#moreOptionsMenu").is(":visible") ){
          articleToolbar.closeOptions();
        }else{
          $("#moreOptionsButton div").addClass("up_" + SD_UTIL.getProdColor() );
          if(ArticlePage.isIE7() || SDM.adReqOptions==false) {
            $("#moreOptionsMenu").show('blind');
          }
          else {
            $("#moreOptionsMenu").show();
          }
          $('body').bind('click',articleToolbar.closeOptions);
          $('#rightColumn').bind('scroll',articleToolbar.closeOptions);  
        }
        articleToolbar.closeQS();
        articleToolbar.killEvent( e );
    },
    killEvent:function(e){
        if(!e) return;
        e.preventDefault();
        e.stopPropagation();        
    },
    closeOptions:function(){
        $("#moreOptionsButton div").removeClass( "up_" + SD_UTIL.getProdColor() );
	    if( $("#moreOptionsMenu").is(":visible") ){
        if(ArticlePage.isIE7() || SDM.adReqOptions==false) {
          $("#moreOptionsMenu").hide('blind');
        }
        else {
          $("#moreOptionsMenu").hide();
        }
	    }
		$('body').unbind('click',articleToolbar.closeOptions );
		$('#rightColumn').unbind('scroll',articleToolbar.closeOptions );	            
    },
	
    userIsUsingSearchForm:function( e ){
		var IE7HeightFixLocalVar = $("#page-area").height();
		//alert($("#footer-area").is(":visible"));
		if(IE7HeightFixLocalVar>0)
			IE7HeightFixGlobalVar=IE7HeightFixLocalVar;
		if(AutoCompleFlag!=true){
			if($(e.target).attr("class")!="ui-corner-all"){
				return  e &&  ($( e.target ).parents( "div" ).hasClass("extSearch") ||
				               $( e.target ).parents( "div" ).hasClass("quickSearch") );
			}else{
				$("#page-area").height(IE7HeightFixGlobalVar+"px");
				return true;
			}
		}else{
			return  e && ($( e.target ).parents( "div" ).hasClass("extSearch") ||
			              $( e.target ).parents( "div" ).hasClass("quickSearch") );
		}
    },
    closeQS:function(e){
		if( $("#sdQuickSearch").is(":visible") ){
			$("#quickSearchButton").attr("title", "Show more quick search options");
		}
		if( articleToolbar.userIsUsingSearchForm( e )) { return; }
		articleToolbar.enableQS();
		$("#quickSearchButton div").removeClass( "up_" + SD_UTIL.getProdColor() );
		if( $("#sdQuickSearch").is(":visible") ){
			$("#sdQuickSearch").toggle('blind');
		}
		$('body').unbind('click',articleToolbar.closeQS );
		$('#rightColumn').unbind('scroll',articleToolbar.closeQS );
    },
    disableQS:function(){
        $(".sdSearch input").prop("disabled","disabled");
        $(".sdSearch input").css("background","#CCCCCC");
        $(".sdSearch button").prop("disabled","disabled");        
        $(".sdSearch input").css("color","#9b9b9b");     
        if( articleToolbar.containsUserQuery() ){
            $("#qs_all").val($(".sdSearch input").val());
        }

    },
    enableQS:function(){
        $(".sdSearch input").prop("disabled","");
        $(".sdSearch input").css("background","white");
		if($("#qs_all").val() == "" || $("#qs_all").val() == "e.g. figures, tables, videos etc"){
			$(".sdSearch input").css("color","#9b9b9b");
		}else{
		  if ($("#Articles").prop("checked") == true){
			$(".sdSearch input").css("color","#000000");
		  }
		}
		
        $(".sdSearch button").prop("disabled","");
        if ($("#Images").prop("checked") == false){ 
          $(".sdSearch input").val( $("#qs_all").val());
        }else if( $("#qs_all").val()!='' && $("#qs_all").val() != articleToolbar.DEFAULT_QS_TEXT ) {
          $(".sdSearch input").val( $("#qs_all").val() );
        }else if( $("#qs_all").val()=='' ){
          $(".sdSearch input").val(articleToolbar.DEFAULT_QS_TEXT);
        }
        $("#Articles").prop("checked", true);
		//from old functionality
		  $(".toggleQukSrch").css('display', '');
		  $("#fieldLabel").html("&nbsp;&nbsp;&nbsp;&nbsp;All Fields");
		  $("#qs_all").attr("title","For Example. Heart Attack and Behaviour");
		  if ($("#qs_all").val() == "e.g. figures, tables, videos etc") {
			$("#qs_all").val('');
			$("#qs_all").css('color','#000000');
		  }
		  $("#volField, #qs_vol , #issueField , #qs_issue , #pageField , #qs_pages").css('display','');
		  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
			$("#submit_search").css('margin-left','14px');
		  }
		
        $("#sdQuickSearch input.textbox").val("");
		
        articleToolbar.resetOnEmptyQS();
    },
    resetOnEmptyQS:function(){
        if ( $(".sdSearch input").val()=="" ){
            $(".sdSearch input").val(articleToolbar.DEFAULT_QS_TEXT);
        }
    },
    containsUserQuery:function(){
        return $(".sdSearch input").val() != articleToolbar.DEFAULT_QS_TEXT;
    },
    /*----QUICK SEARCH BUTTON ENTER EVENT----*/
	qSrchButton:function(){
		document.getElementById("qs_all").value=document.getElementById("quickSearch").value;
		document.forms["qkSrch"].submit();
		return false;
	},
    qssmall_frmsubmit:function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		 if(code == 13) 
		 { 
			if($(".sdSearch input").val() == articleToolbar.DEFAULT_QS_TEXT){
				$(".sdSearch input").val("");
				articleToolbar.qSrchButton();
			}else{
				articleToolbar.qSrchButton();
			}
		 }
    },
    /*----QUICK SEARCH BUTTON CLICK EVENT----*/
    qSearchbut:function(){
		if($(".sdSearch input").val() == articleToolbar.DEFAULT_QS_TEXT){
			$(".sdSearch input").val("");
			articleToolbar.qSrchButton();
		}else{
			articleToolbar.qSrchButton();
		}
    },
    /*----INTERNAL LINK POSITION----*/
    artInternalLnkPos:function(){
        if($('#_loggedusr').val() == 'loggedusr')
        {
            $('#articleToolbar').css('height',52);
        }
        else
        {
            $('#articleToolbar').css('height',26);
        }
    },
	
	/* quick search textbox color change and set value*/
	showTextQSonFocus:function(){
		if($("#quickSearch").val() == articleToolbar.DEFAULT_QS_TEXT){
			$("#quickSearch").val("");
			$("#quickSearch").css("color", "#000000");
			return false;
		}else{
			$("#quickSearch").css("color", "#000000");
		}
	},
	showTextQSoutFocus:function(){
		if($("#quickSearch").val() == ""){
			$("#quickSearch").val( articleToolbar.DEFAULT_QS_TEXT );
			$("#quickSearch").css("color", "#9b9b9b");
			return false;
		}
	}
};

var blocks = {
articleOptions:    false,
quickSearch:    false
};

//Publication Email Alert

function publicationLink(url, showId, hideId, rsltIndId) {
    $.get(url, function(data) {
        if(data.match(/TRUE/g)) {
            document.getElementById(hideId).style.display = 'none';
            document.getElementById(showId).style.display = 'inline';
            document.getElementById(rsltIndId).style.display = 'none';
        }
        else {
            document.getElementById(rsltIndId).style.display = 'inline';
        }
    });
}

/*-------------------------- TOOL BAR CODE ENDS HERE -------------------*/


function openNS(url, width, height) {
    if ((navigator.appName == "Microsoft Internet Explorer") &&
        (parseFloat(navigator.appVersion) < 4 ))
    {
        return false;
    }

    if (!width) var width = 600;
    if (!height) var height = 400;

    var newX=width,newY=height,xOffset=10,yOffset=10;
    var parms = 'width=' + newX +
            ',height=' + newY +
            ',screenX='+ xOffset +
            ',screenY=' + yOffset +
            ',status=yes,toolbar=yes,menubar=yes' +
            ',scrollbars=yes,resizable=yes,location=yes';
    nsWin = window.open(url,'displayWindow',parms);
    nsWin.focus();
    return false;
}

var figCaption;

function openStrippedNS(url, figElem, figRefElem, pii) {
if ((navigator.appName == "Microsoft Internet Explorer") &&(parseFloat(navigator.appVersion) < 4 ))
{
return false;
}
var capId = figElem.replace('labelCaption','');
var ih = document.getElementById(figElem);
var cRef = document.getElementById(capId+'b'+figRefElem);
var newRef = document.getElementById('anc'+capId+'b'+figRefElem);

var xOffset=25,yOffset=25;
var parms = 'left='+ xOffset + ',top=' + yOffset +',status=yes,toolbar=no,menubar=no' + ',scrollbars=yes,resizable=yes,location=no';
if(ih != null )
{
   if(cRef != null)
   {
       figCaption = ih.innerHTML.replace(cRef.innerHTML,'<a href='+'/science/article/pii/'+pii+'#'+figRefElem+'>'+newRef.innerHTML+'</a>');
   }
   else
   {
       figCaption = ih.innerHTML;
   }
}
else {
    figCaption = "";
} 
nsWin = window.open(url,'displayWindow',parms);
nsWin.focus();
return false;
}

var LoginBox = {
  getStyleObj: function(elem,parent) {
    if (document.layers) {
      if (parent) {return "document."+parent+".document."+elem;}
      else { return "document."+elem + ".style";}
    }
    else if (document.all) {return "document.all."+elem + ".style";}
    else if (document.getElementById) {return "document.getElementById('"+elem+"').style";}
  },
  flipLogin: function (e,button){
    var t = eval(LoginBox.getStyleObj(e));
    var u = document.getElementById("loginPlus");
    var v = document.getElementById("userPlus");
    var userbox = document.getElementById("userBox");
    var j = document.getElementById("loginPlusScript");
    if(button == null){
      if (t.display=="none"){
        t.display = 'block';
        j.className = 'minus';
      }
      else{
        t.display = 'none';
        j.className = 'plus';
      }
    }
    else if (button == "userPlus" ) {
      if (t.display=="none" ){
        t.display = 'block';
        v.className = 'userMinus';
      }
      else{
        t.display = 'none';
        v.className = 'userPlus';
      }
    }
    else{
      if (t.display=="none" ){
        t.display = 'block';
        userbox.style.display ='none';
        v.className = 'userPlus';
      }
      else{
        t.display = 'none';
      }
    }
  }
}//LoginBox

/*Existing Quick Search functionality*/
//Auto complete in quicksearch
function sortInit() {
  var navBox = jQuery("#navBox");
//  navBox.children().css("cursor", "move");
  navBox.sortable({ axis: "y",
                    opacity: 0.6
                 });
  navBox.disableSelection();
  navBox.bind("sortstop", function(event,ui) {
    var url = SD_SORTURL + "?" + navBox.sortable("serialize");
    jQuery.get(url);
  });
}
///////////////////////////
var QuickSearch = {
  getElementsByClassName: function(oElm, strTagName, strClassName){
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    strClassName = strClassName.replace(/\-/g, "\\-");
    var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
    var oElement;
    for(var i=0; i<arrElements.length; i++){
      oElement = arrElements[i];
      if(oRegExp.test(oElement.className)){
        arrReturnElements.push(oElement);
      }
    }
    return (arrReturnElements);
  }, //getElementsByClassName

  clearQSForm: function() {
    document.qkSrch.qs_tak.value="";
    document.qkSrch.qs_author.value="";
    document.qkSrch.qs_title.value="";
    document.qkSrch.qs_vol.value="";
    document.qkSrch.qs_issue.value="";
    document.qkSrch.qs_pages.value="";
  }, //clearQSForm

  changeFields: function(event) {
    var quckSrch = QuickSearch.getElementsByClassName(document, 'td', 'toggleQukSrch');
    if(event.currentTarget.value == "i") {
      jQuery(".toggleQukSrch").css('display', 'none');
      document.getElementById("fieldLabel").innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;Images";
      document.getElementById("qs_all").title = "e.g. figures, tables, videos etc";
      if (document.getElementById("qs_all").value == "") {
        document.getElementById("qs_all").value = "e.g. figures, tables, videos etc";
        document.getElementById("qs_all").style.color ="#9b9b9b";
      }
      document.getElementById("volField").style.display = "none";
      document.getElementById("qs_vol").style.display = "none";
      document.getElementById("issueField").style.display = "none";
      document.getElementById("qs_issue").style.display = "none";
      document.getElementById("pageField").style.display = "none";
      document.getElementById("qs_pages").style.display = "none";
      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
        document.getElementById("submit_search").style.marginLeft = "7px";
      }
    }
    else {
      jQuery(".toggleQukSrch").css('display', '');
      document.getElementById("fieldLabel").innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;All Fields";
      document.getElementById("qs_all").title = "For Example. Heart Attack and Behaviour";
      if (document.getElementById("qs_all").value == "e.g. figures, tables, videos etc") {
        document.getElementById("qs_all").value = ""; 
        document.getElementById("qs_all").style.color ="#000000";
      }
      document.getElementById("volField").style.display = "";
      document.getElementById("qs_vol").style.display = "";
      document.getElementById("issueField").style.display = "";
      document.getElementById("qs_issue").style.display = "";
      document.getElementById("pageField").style.display = "";
      document.getElementById("qs_pages").style.display = "";
      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
        document.getElementById("submit_search").style.marginLeft = "14px";
      }
    }
  }, //changeFields

  clearValues: function() {
    if (document.getElementById("Images").checked ==  true) {
        if (document.getElementById("qs_all").value == "e.g. figures, tables, videos etc") {
            document.getElementById("qs_all").value = "";
            document.getElementById("qs_all").style.color ="#000000";
        }
    }
  }, //clearValues

  setValues: function() {
    if (document.getElementById("Images").checked ==  true) { 
      if (document.getElementById("qs_all").value == "") {
        document.getElementById("qs_all").value = "e.g. figures, tables, videos etc";
        document.getElementById("qs_all").style.color ="#9b9b9b";
      }
    }
  } //setValues
}; //QuickSearch
////////////////////////////


function autoCompleteInit() {
  jQuery(document).ready(function() {sdAutoComplete('qs_title','qsPub_autoComp', SDM.urlPrefix + '/jfind/auto');});
}

function sdAutoComplete(inputField, outputField, serviceURL) {
  jQuery(".qsRadio").click(QuickSearch.changeFields);
  jQuery(".qsImgBlurFocus").blur(QuickSearch.setValues);
  jQuery(".qsImgBlurFocus").focus(QuickSearch.clearValues);

//  jQuery(".qsRadio").each(function() { $(this).click(QuickSearch.changeFields);});
  $( "#" + inputField ).autocomplete(
    { 
      minLength:2,
      source: function(req,resp) {
        $.post(serviceURL,{ qs_title:req.term }, function(data){
          var list = []
          $(data).find("li").each(function(i,e){ list.push({ label:$(e).text() });});
          resp( list );
        })
      },
      open: function(event, ui) { $("ul.ui-autocomplete").css("z-index", 1999); $("ul.ui-autocomplete").addClass("suggdropdown"); }
    });
}
              
function ccAutoComplete(inputField, outputField, validCostCodes) {
  $("#"+inputField).autocomplete({
    minLength:2,
    source:validCostCodes
  });

  //var costcode_list = new Autocompleter.Local(inputField,outputField,validCostCodes,{ minChars:2, partialSearch:false }) 
}
autoCompleteInit();

/*Existing Quick Search functionality*/

// SEOCRAWL2
var CanonicalLink = {
  init: function() {
    $("body").delegate(".cLink", "click", function(event) {
      var t = $(this);
      createStateCookie (t.attr("queryStr"),
                  event);
    });
  }
} //CanonicalLink
//$(document).ready(function() {CanonicalLink.init();});

var CanonicalHomeLink = {
   init: function() {
     $("body").delegate(".canonHomeLink", "click", function(event) {
       var t = $(this);
       createCookieForHomePage (t,
                   event);
     });
   }
} //CanonicalLink
//$(document).ready(function() {CanonicalHomeLink.init();});

 function createCookieForHomePage (homeCookie, event) {

   var cookValue = '';
   var method = homeCookie.attr("method");
    if(method) { cookValue += ("<md>" + method + "</md>"); }

    var zone = homeCookie.attr("zone");
    if(zone) { cookValue += ("<z>" + zone + "</z>"); }

    var btn = homeCookie.attr("btn");
    if(btn) { cookValue += ("<btn>" + btn + "</btn>"); }

    var origin = homeCookie.attr("origin");
    if(origin) { cookValue += ("<org>" + origin + "</org>"); }

    var more  = homeCookie.attr("more");
    if(more) { cookValue += ("<me>" + more + "</me>"); }

    var action  = homeCookie.attr("actionType");
    if(action) { cookValue += ("<at>" + action + "</at>"); }

    var boxAction = homeCookie.attr("boxAction");
    if(boxAction) { cookValue += ("<bt>" + boxAction + "</bt>"); }

    var box  = homeCookie.attr("box");
    if(box) { cookValue += ("<bx>" + box + "</bx>"); }

    var record = homeCookie.attr("record");
    if(record) { cookValue += ("<rd>" + record + "</rd>"); }

    var fl = homeCookie.attr("fl");
    if(fl) { cookValue += ("<fl>" + fl + "</fl>"); }

    var prompt = homeCookie.attr("prompt");
    if(prompt) { cookValue += ("<pt>" + prompt + "</pt>"); }

    var lg  = homeCookie.attr("lg");
    if(lg) { cookValue += ("<lg>" + lg + "</lg>"); }


   createCookie("SD_HOME_PAGE_COOKIE", cookValue)
}

function getNamedQueryParameter(inURL, inName)
{
   var outParm = "";
   var queryIndex = inURL.indexOf("?");
   var parmIndex = inURL.indexOf(inName, queryIndex+1);
   if (parmIndex > 0)
   {
      parmIndex += inName.length;
      while ((parmIndex >= 0) && ('=' != inURL.charAt(parmIndex)))
      {
         parmIndex = inURL.indexOf(inName, parmIndex+1);
         if (parmIndex > 0)
         {
            parmIndex += inName.length;
         }
      }
      if ('=' == inURL.charAt(parmIndex))
      {
         parmIndex++;
         var endIndex = parmIndex;
         while (   (endIndex < inURL.length)
                && ('&' != inURL.charAt(endIndex))
                && ('#' != inURL.charAt(endIndex)))
         {
            endIndex++;
         }
         if (endIndex > parmIndex)
         {
            outParm = inURL.substring(parmIndex,endIndex);
         }
      }
   }
   return outParm;
}

function createStateCookie (queryString, event) {

  // Parse the query string to get the individual state attributes
  // and create State Cookie
  var cookieValue = '';

  if (queryString) {

    var alid='';
    alid = getNamedQueryParameter (queryString, "_alid");
    if (alid) { cookieValue += ("<al>" + alid + "</al>"); }

    var rdoc='';
    rdoc = getNamedQueryParameter (queryString, "_rdoc");
    if (rdoc) { cookieValue += ("<rd>" + rdoc + "</rd>"); }

    var fmt='';
    fmt = getNamedQueryParameter (queryString, "_fmt");
    if (fmt) { cookieValue += ("<fmt>" + fmt + "</fmt>"); }

    var orig='';
    orig = getNamedQueryParameter (queryString, "_origin");
    if (orig) { cookieValue += ("<org>" + orig + "</org>"); }

    var srch='';
    srch = getNamedQueryParameter (queryString, "_srch");
    if (srch) { cookieValue += ("<src>" + srch + "</src>"); }

    var hitCount='';
    hitCount = getNamedQueryParameter (queryString, "_ct");
    if (hitCount) { cookieValue += ("<cnt>" + hitCount + "</cnt>"); } 

    var zone='';
    zone = getNamedQueryParameter (queryString, "_zone");
    if (!zone) {
       zone = getNamedQueryParameter (queryString, "zone");
    }
    if (zone) { cookieValue += ("<z>" + zone + "</z>"); }

    var anchorValue='';
    anchorValue = getNamedQueryParameter (queryString, "_docanchor");
    if (anchorValue) { cookieValue += ("<av>" + anchorValue + "</av>"); }

    var alertKey='';
    alertKey = getNamedQueryParameter (queryString, "_alertKey");
    if (alertKey) { cookieValue += ("<ak>"+ alertKey + "</ak>"); }

    var webUserId='';
    webUserId = getNamedQueryParameter (queryString, "_wid");
    if (webUserId) { cookieValue += ("<wid>" + webUserId + "</wid>"); }

    var errMsg='';
    errMsg = getNamedQueryParameter (queryString, "_errMsg");
    if (errMsg) { cookieValue += ("<err>" + errMsg + "</err>"); }

    var reqId='';
    reqId = getNamedQueryParameter (queryString, "_reqId");
    if (reqId) { cookieValue += ("<req>" + reqId + "</req>"); }

    var crossRefDocId='';
    crossRefDocId = getNamedQueryParameter (queryString, "_xRefDocId");
    if (crossRefDocId) { cookieValue += ("<cid>" + crossRefDocId + "</cid>"); }

    var origPii='';
    origPii = getNamedQueryParameter (queryString, "_origPii");
    if (origPii) { cookieValue += ("<opi>" + origPii + "</opi>"); }

    var refTag='';
    refTag = getNamedQueryParameter (queryString, "artImgPref");
    if (refTag) { cookieValue += ("<rt>" + refTag + "</rt>"); }

    var refWorkId='';
    refWorkId = getNamedQueryParameter (queryString, "_cid");
    if (refWorkId) { cookieValue += ("<rwi>" + refWorkId + "</rwi>"); }

    var refWorkHierarchyId='';
    refWorkHierarchyId = getNamedQueryParameter (queryString, "_hierId");
    if (refWorkHierarchyId) { cookieValue += ("<rhi>" + refWorkHierarchyId + "</rhi>"); }

    var explodeListStr='';
    explodeListStr = getNamedQueryParameter (queryString, "_explode");
    if (explodeListStr) { cookieValue += ("<exp>" + explodeListStr + "</exp>"); }

    var indexTypeCode='';
    indexTypeCode = getNamedQueryParameter (queryString, "_idxType");
    if (indexTypeCode) { cookieValue += ("<ind>" + indexTypeCode + "</ind>"); }

    var refLink='';
    refLink = getNamedQueryParameter (queryString, "_refLink");
    if (refLink) { cookieValue += ("<rfl>" + refLink + "</rfl>"); }

    var alpha='';
    alpha = getNamedQueryParameter (queryString, "_alpha");
    if (alpha) { cookieValue += ("<alp>" + alpha + "</alp>"); }

    var dateTime = getCurrentDateTime();
    if (dateTime) { cookieValue += ("<rdt>" + dateTime + "</rdt>"); }

    var overrideIP='';
    overrideIP = getNamedQueryParameter (queryString, "overrideIP");
    if (overrideIP) { cookieValue += ("<oip>" + overrideIP + "</oip>"); }

   var nextPrvButton='';
   nextPrvButton = getNamedQueryParameter (queryString, "nextPrevTag");
   if (nextPrvButton) { cookieValue += ("<np>" + nextPrvButton + "</np>"); }

   var originContentType='';
   originContentType  = getNamedQueryParameter (queryString, "originContentFamily");
   if (originContentType) { cookieValue += ("<oct>" + originContentType + "</oct>"); }
 
  }
  createCookie ("SD_ART_LINK_STATE", cookieValue);

}

  
function createCookie(cookieName, value) {
    var cookieStart = "<e><q>science</q>";
    var cookieEnd = "</e>";
    var cookieValue;
    if (value) {
        cookieValue = cookieStart;
        cookieValue += value;
        cookieValue += cookieEnd;
    }
    var hostName = document.location.hostname;
    hostName.toLowerCase();
    var domain = '';
    if (hostName.indexOf ('sciencedirect.com') != -1) {
        domain = '.sciencedirect.com';
    } else if (hostName.indexOf('.lexisnexis.com') != -1) {
        domain = '.lexisnexis.com';
    }
    var finalCookie= cookieName+"="+cookieValue+";path=/";
    if (domain) {
       finalCookie += ";domain=" + domain;
    }
    document.cookie = finalCookie; 
}

function getCurrentDateTime() {
  var currentTime = new Date();
  var month = currentTime.getMonth();
  var day = currentTime.getDate();
  var year = currentTime.getFullYear();
  var hours = currentTime.getHours();
  var mins = currentTime.getMinutes();
  var secs = currentTime.getSeconds();

  var dateTime = year + "/" + month + "/" + day + "/" + hours + ":" + mins + ":" + secs;
  return dateTime;
}

function openPDF(url, event) {
 var newWidth;
 var newHeight;
 if (document.body.clientWidth) {
    newWidth=((document.body.clientWidth*90)/100);
    newHeight=document.body.clientHeight;
 } else { //makes ie happy
    newWidth=((document.documentElement.clientWidth*90)/100);
    newHeight=document.documentElement.clientHeight;
 }
 var pdfWin;
 pdfWin=window.open(url,'newPdfWin','width='+newWidth+',height='+newHeight+',resizable=yes,left=50,top=50');
 pdfWin.focus();
}

function suggestedArt(url, event) {
  var obj = document.getElementById('suggestedPdfList');
  if(obj.length < 1) { return; }
  var ajaxReq = $.get(url, function(response) {
    // Length is checked for 5 since each line in the template
    // will have end of line character for empty responses
    if (response && response.length > 5) {  
      obj.style.display = 'block';
      obj.innerHTML = response;
      var obj1 = document.getElementById('pdfModalWindow');
      obj1.style.display = 'block';
      obj1.style.height = $(window).height()+"px";
      alignSuggestedArticleBox();
    }
  });
}

function setOptOutFlag(url) {
  try {
    $.post(url);
  } catch (e) {
  }
  closePopup ();
}

function closePopup() {
  document.getElementById('suggestedPdfList').style.display = 'none';
  document.getElementById('pdfModalWindow').style.display = 'none';
}
function showDetails(pii, absUrl){
  var toHide = "trunc_" + pii;
  var toShow = "citation_" + pii;
  var absId = "abs_" + pii;
  $('li.pdfAbs').hide();
  $('li.citationDetails').hide();
  $('li.wrapperLi').show();
//  hideElementsByClassName('pdfAbs', 'li');
//  hideElementsByClassName('citationDetails', 'li');
//  showElementsByClassName('wrapperLi', 'li');

  document.getElementById(toHide).style.display = 'none';
  document.getElementById(toShow).style.display = 'block';

  // Retrieve Abstract
  var obj = document.getElementById(absId);
  if(obj.length < 1) { return; }
    if (obj.innerHTML == "") {
      var ajaxReq = $.get(absUrl, function(response) {
        if (response) {
          obj.style.display = 'block';
          obj.innerHTML=response;
          alignSuggestedArticleBox();
        }
      });
    } else {
      obj.style.display = 'block';
      alignSuggestedArticleBox();
    }
}

function hideElementsByClassName(className, tag)  {
  var all = getElementsByClassName(document, tag, className);
  for(var k=0;k<all.length;k++) {
    all[k].style.display = "none";
  }
}

function showElementsByClassName(className, tag, startIndex)  {
  var all = getElementsByClassName(document, tag, className);
  var idx =0;
  if (startIndex!=null){
   idx = 1;
   }
  for(var k=idx;k<all.length;k++) {
    all[k].style.display = "inline";
  }
}

function alignSuggestedArticleBox() {
  var x=0, y=1;
  var msgBox = document.getElementById('pdfModalWindowMsgBox');
  var winWidth = $(window).width();
  var winHeight = $(window).height();
  var top = (winHeight - msgBox.offsetHeight)/2;
  var left = (winWidth - msgBox.offsetWidth)/2;
  var pos = getScrollXY();
  if (pos) {
      top = top+pos[y];
      left = left+pos[x];
  }
  msgBox.style.top = top + 'px';
  msgBox.style.left = left + 'px';
 $("#modalBoxDisplay").focus();
}

function getScrollXY() {
  var x=0, y=1;
  var pos = new Array(2);
  var scrOfX = 0, scrOfY = 0;
  if( typeof( window.pageYOffset ) == 'number' ) {
    //Netscape compliant
    scrOfY = window.pageYOffset;
   scrOfX = window.pageXOffset;
  } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
    //DOM compliant
    scrOfY = document.body.scrollTop;
    scrOfX = document.body.scrollLeft;
  } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
    scrOfX = document.documentElement.scrollLeft;
  }
  pos[x] = scrOfX;
  pos[y] = scrOfY;

  return pos;
}
// End of PDFKing

function flipAlertSettings (id, currObj) {
  var obj = document.getElementById (id);
    if (obj.style.display == 'none') {
      obj.style.display = 'block';
      currObj.className = 'regMinus';
      currObj.innerHTML = "Hide alert & other settings.&nbsp;&nbsp;&nbsp;&nbsp;";
    } else {
      obj.style.display = 'none';
      currObj.className = 'regPlus';
      currObj.innerHTML = "Show alert & other settings.&nbsp;&nbsp;&nbsp;&nbsp;";
    }
}

//ce:e-component
var ECC = {
  selectorDisplayCount:10,
  audioPlayerWidth:318,
  audioPlayerHeight:29,
  videoPlayerWidth:320,
  videoPlayerHeight:266,
  reqFlashVersion:"9.0.0",
  reqMajorVersion:9,
  reqMinorVersion:0,
  videoNoFlashWidth:318,
  videoNoFlashHeight:260,
  audioPlayerURL:"/page/flash/AudioPlayer.swf",
  videoPlayerURL:"/page/flash/VideoPlayer.swf"
};
var EComponent = {
  videos: null,
  others: null,
  audios: null,
  needFlash: false,
  init: function() {
    if($('.MMCvAUDIO').length+
       $('.MMCvOTHER').length+
       $('.MMCvVIDEO').length==0) {
      return;
    }
    
    var fv = swfobject.getFlashPlayerVersion();
    if(ECC.reqMajorVersion==0 || ECC.reqMajorVersion > fv.major || (ECC.reqMajorVersion == fv.major && ECC.reqMinorVersion>fv.minor)) {
      this.needFlash = 'true';
      this.initNoFlash('version_mismatch');
    }
    else {
    this.audios = $('.MMCvAUDIO');
    $('.MMCvAUDIO').each(function() {
      swfobject.embedSWF(SDM.urlPrefix+ECC.audioPlayerURL,
                         $(this).siblings('div').attr('id'),
                         ECC.audioPlayerWidth,
                         ECC.audioPlayerHeight,
                         ECC.reqFlashVersion,
                         false,
                         false,  //flashvars
                         {menu: "false",
                          play: "false",
                          bgcolor: "0xFFF",
                          allowscriptaccess:"always",
                          wmode: "opaque",
                          flashvars: $(this).attr('mmcvflashvars')});
    });
    this.others = $('.MMCvOTHER');
    this.videos = $('.MMCvVIDEO');
    $('.MMCvVIDEO').each(function() {
      swfobject.embedSWF(SDM.urlPrefix+ECC.videoPlayerURL,
                         $(this).siblings('div').attr('id'),
                         ECC.videoPlayerWidth,
                         ECC.videoPlayerHeight,
                         ECC.reqFlashVersion,
                         false,
                         false, //flashvars
                         {menu:"false",
                          play: "false",
                          bgcolor:"0xFFF",
                          allowscriptaccess:"always",
                          allowFullScreen:"true",
                          wmode:"opaque",
                          flashvars:$(this).attr('mmcvflashvars')});
    });
    }
    this.buildMMClabelanchor();
    if(SDM.suppContentBox==true) this.buildWidget();
  }, // EComponent.init
  buildWidget: function() {
    if($('.MMCvVIDEO').length > 0) {
      $('#boxEComponent .mmTabs').append(this.buildTabHTML('Video'));
      this.buildTabContents('Video');
      this.buildViewDownloadLinks('Video');
    }
    if($('.MMCvAUDIO').length > 0) {
      $('#boxEComponent .mmTabs').append(this.buildTabHTML('Audio'));
      this.buildTabContents('Audio');
      this.buildViewDownloadLinks('Audio');
    }
    if($('.MMCvOTHER').length > 0) {
      $('#boxEComponent .mmTabs').append(this.buildTabHTML('Other'));
      this.buildTabContents('Other');
      this.buildViewDownloadLinks('Other');
    }

    //Pick the default
    if($('.MMCvVIDEO').length > 0) {
      this.setTabContents('Video', 1);
    }
    else if($('.MMCvAUDIO').length > 0) {
      this.setTabContents('Audio', 1);
    }
    else {
      this.setTabContents('Other', 1);
    }
    $('#boxEComponentSpacer').show();
    $('#boxEComponent').show();
  },
  setTab: function(t) {
    $('.mmTab').removeClass('mmTabActive').attr('href', '');
    $('.mmTab a').attr('href', "");
    
    $('#mmTab'+t).addClass('mmTabActive');
    $('#mmTab'+t+' a').removeAttr('href');

  },
  setViewer: function(t, i) {
    var cap = $('#mmNotTab'+t + ' .mmCaption');
    if(t=='Video') {
      if(this.needFlash=='true') {
        this.setViewerNeedFlash(t,i);
        return;
      }
      var fv = $($('.MMCv'+t.toUpperCase())[i-1]).attr('mmcvflashvars');
      swfobject.embedSWF(SDM.urlPrefix+ECC.videoPlayerURL,
                         'mmPlayer'+t,
                         254,
                         214,
                         ECC.reqFlashVersion,
                         false,
                         false, //flashvars
                         {menu:"false",
                          play: "false",
                          bgcolor:"0xFFF",
                          allowscriptaccess:"always",
                          allowFullScreen:"true",
                          wmode:"opaque",
                          flashvars:fv});
      var str= $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.caption').html();
//OLD      var str= $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.MMCvCAPTION_SRC').html();
      if(str==undefined) str='';
      $('#mmNotTab'+t+' .mmCaption').html(str);
      cap.css('border-width', '0px');
    }
    else if(t=='Audio') {
      if(this.needFlash=='true') {
        this.setViewerNeedFlash(t,i);
        return;
      }
      cap.html('');
      var fv = $($('.MMCv'+t.toUpperCase())[i-1]).attr('mmcvflashvars');
      swfobject.embedSWF(SDM.urlPrefix+ECC.audioPlayerURL,
                         'mmPlayer'+t,
                         254,
                         ECC.audioPlayerHeight,
                         ECC.reqFlashVersion,
                         false,
                         false, //flashvars
                         {menu:"false",
                          play: "false",
                          bgcolor:"0xFFF",
                          allowscriptaccess:"always",
                          allowFullScreen:"true",
                          wmode:"opaque",
                          flashvars:fv});
      var urlStr = $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.mmc_'+t.toLowerCase()+' a').attr('href');
      if(urlStr==undefined) urlStr = $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('[class^="mmc_"] a').attr('href');
      var thumb = $($('.MMCv'+t.toUpperCase())[i-1]).attr('mmcimageurl');
      var thumbStr = '<a href="' + urlStr + '"><img class="thumb" src="' + thumb + '"></a>';
      var str= $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.caption').html();
//OLD      var str= $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.MMCvCAPTION_SRC').html();
      if(str==undefined)str="";

      cap.prepend('<div class="cutCap">'+str+'</div>').prepend(thumbStr);
      $('#mmNotTab'+t + ' .mmInner').find('.cutCap').text( $('#mmNotTab'+t + ' .mmInner').find('.cutCap').text().slice(0,170) );
      $('#mmNotTab'+t + ' .mmInner').prepend( cap );
      cap.css('border-width', '1px');
    }
    else {
      var urlStr = $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.mmc_'+t.toLowerCase()+' a').attr('href');
      if(urlStr==undefined) urlStr = $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('[class^="mmc_"] a').attr('href');
      var thumb = $($('.MMCv'+t.toUpperCase())[i-1]).attr('mmcimageurl');
      var thumbStr = '<a href="' + urlStr + '"><img class="thumb" src="' + thumb + '"></a>';
      var str= $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.caption').html();
//OLD      var str= $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.MMCvCAPTION_SRC').html();
      if(str==undefined) str="";
//      str=str.slice(0,170);
      $('#mmNotTab'+t+' .mmCaption').html(thumbStr+str);
    }

  },
  setViewerNeedFlash: function(t, i) {
    var urlStr = $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('.mmc_'+t.toLowerCase()+' a').attr('href');
    var tStr = t.toLowerCase();
    var iStr = "mmc_mpg.gif";
    if(t=="Audio") iStr = "mmc_mp3.gif";
    $('#mmPlayer'+t).html(
      '<div class="mmNeedFlash">' +
      '  To view this ' + tStr + ', you need to download the <a href="http://get.adobe.com/flashplayer">latest Adobe&reg; Flash Player</a>.' +
      '  <br><br>' +
      '  Note: You can download the original ' + tStr + ' using the "Download this ' + tStr + '" link below or view it in a new window by clicking the ' + tStr + ' icon below. ' +
      '  <br><br><a style="cursor:pointer" onclick="openNS(\'' + urlStr + '\',700,500); return false;">' +
      '  <img style="border:0px;" src="/science/page/static/science/' + iStr + '"></a></div>'
    );
  },
  setViewWithin: function(t, i) {
    $($('#mmNotTab'+t).find('.mmViewWithin a')[0]).click(function() {
      $('#rightColumn').moveTo($($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().attr('id'));
      return false;
    });
    var urlStr = $($('.MMCv'+t.toUpperCase())[i-1]).parent().parent().find('[class^="mmc_"] a').attr('href');
    $($('#mmNotTab'+t).find('.mmViewWithin a')[1]).attr('href',urlStr);
  },
  setSelector: function(t, i, o) {
    var n=$('.MMCv'+t.toUpperCase()).length;

      if(i==n) {
         $('#mmNotTab'+t).find('.mmSelectorNext').addClass('mmSelectorNextDisabled')
                                               .attr('data-disabled', 'true');
      }
      else {
         $('#mmNotTab'+t).find('.mmSelectorNext').removeClass('mmSelectorNextDisabled')
                                               .attr('data-disabled', 'false');
      }
      if(i==1) {
         $('#mmNotTab'+t).find('.mmSelectorPrev').addClass('mmSelectorPrevDisabled')
                                                .attr('data-disabled', 'true');
      }
      else {
         $('#mmNotTab'+t).find('.mmSelectorPrev').removeClass('mmSelectorPrevDisabled')
                                               .attr('data-disabled', 'false');
      }
      
    var wn = ECC.selectorDisplayCount;
    if(n>wn && o  == $('#mmNotTab'+t).find('.mmSelectorNext')[0] ) {
      if($($('#mmNotTab'+t+' .mmSelectorNum .selNum')[i-1]).css('display')=='none') {
        $($('#mmNotTab'+t+' .mmSelectorNum .selNum')[i-1]).show();
        $($('#mmNotTab'+t+' .mmSelectorNum .selNum')[i-wn-1]).hide();
        $('#mmNotTab'+t+' .mmSelectorNum .prevDots').show();
        if(i==n)  $('#mmNotTab'+t+' .mmSelectorNum .nextDots').hide();
      }
    }
    
    if(n>wn && o  == $('#mmNotTab'+t).find('.mmSelectorPrev')[0] ) {
      if($($('#mmNotTab'+t+' .mmSelectorNum .selNum')[i-1]).css('display')=='none') {
        $($('#mmNotTab'+t+' .mmSelectorNum .selNum')[i-1]).show();
        $($('#mmNotTab'+t+' .mmSelectorNum .selNum')[i+wn-1]).hide();
        $('#mmNotTab'+t+' .mmSelectorNum .nextDots').show();
        if(i==1)  $('#mmNotTab'+t+' .mmSelectorNum .prevDots').hide();
      }
    }
    
    $($('#mmNotTab'+t+' .mmSelectorNum .selNum').css('font-weight', 'normal')[i-1]).css('font-weight', 'bold');
  },
  setTabContentsArrow:function(t, i, o) {
    if( o  == $('#mmNotTab'+t).find('.mmSelectorNext')[0] &&
        $('#mmNotTab'+t).find('.mmSelectorNext').attr('data-disabled')=='true') {
      return;   
    }
    if( o  == $('#mmNotTab'+t).find('.mmSelectorPrev')[0] &&
        $('#mmNotTab'+t).find('.mmSelectorPrev').attr('data-disabled')=='true') {
      return;   
    }
    this.setTabContents(t, i, o);
  },
  setTabContents: function(t, i, o) {
    if(i==='+1') i=($('#boxEComponent').attr('data-index')*1)+1;
    else if(i==='-1') i=($('#boxEComponent').attr('data-index')*1)-1;
    this.setTab(t);
    this.setSelector(t, i, o);
    this.setViewer(t, i);
    this.setViewWithin(t, i);
    $('#boxEComponent .mmNotTabs').hide();
    $('#mmNotTab'+t).show();    
    $('#boxEComponent').attr('data-index', i);
    $('#boxEComponent').attr('data-type', t);
  },
  buildTabHTML: function(t) {
      if(t=='Other')
        return '<span id="mmTab' + t + '" class="mmTab" onClick="EComponent.setTabContents(\'' + t.toString() + '\', 1);return false;"><a href="">' + t + ' files (' + $('.MMCv'+t.toUpperCase()).length + ')</a></span>';
      else
        return '<span id="mmTab' + t + '" class="mmTab" onClick="EComponent.setTabContents(\'' + t.toString() + '\', 1);return false;"><a href="">' + t + ' (' + $('.MMCv'+t.toUpperCase()).length + ')</a></span>';
  }, //builtTab
  buildSelectorsHTML: function(t, s, n) {
    var str = "";
    if(n<ECC.selectorDisplayCount) {
      while(s<=n) {
        str+='<a class="selNum" href="" onClick="EComponent.setTabContents(\'' + t.toString() + '\',' + s + ');return false;">' + s + '</a>';
        s++;
      }
    }
    else {
      str+='<span class="prevDots" style="display:none">...</span>';
      while(s<=ECC.selectorDisplayCount) {
        str+='<a class="selNum" href="" onClick="EComponent.setTabContents(\'' + t.toString() + '\',' + s + ');return false;">' + s + '</a>';
        s++;
      }
      while(s<=n) {
        str+='<a class="selNum" href="" style="display:none" onClick="EComponent.setTabContents(\'' + t.toString() + '\',' + s + ');return false;">' + s + '</a>';
        s++;
      }
      str+='<span class="nextDots">...</span>';
    }
    return str;
  },
  buildViewDownloadLinks: function(t) {
    var o = $('#mmNotTab'+t).find('.mmViewWithin');
    if(t=='Other') t='File';
      o.html(
      '<a href="" style="">View within article</a>' +
      '<a href="" style="float:right;">Download this ' + t.toLowerCase() + '</a>'
    );
  },
  buildTabContents: function(t) {
    $('#mmNotTab'+t).html(
      '<div class="mmSelector">' +
      '  <div class="mmSelectorInner">' +
      '    <div class="mmSelectorPrev" onClick="EComponent.setTabContentsArrow(\'' + t.toString() + '\',\'-1\', this);return false;"></div>' +
      '    <div class="mmSelectorNum">'+ this.buildSelectorsHTML(t, 1, $('.MMCv'+t.toUpperCase()).length) +'</div>' +
      '    <div class="mmSelectorNext" onClick="EComponent.setTabContentsArrow(\'' + t.toString() + '\',\'+1\', this);return false;"></div>' +
      '  </div>' +
      '</div>' +
      '<div class="mmInner">' +
      '  <div id="mmPlayer' + t +'" class="mmPlayer"></div>' +
      '  <div class="mmCaption">I am the caption</div>' +
      '  <div class="mmViewWithin"></div>' +
      '</div>'
    );
  } , // buildWidgetTabContents
  buildMMClabelanchor: function(){
      $('dl.ecomponent').each(function(i){
	      var thisObj = $(this);
		  var downLinkObj = thisObj.find(".MMCvLINK");
		  var captionObj = thisObj.find(".MMCvLABEL_SRC a");
		  if(downLinkObj && captionObj){
		      var downLinkUrl = $(downLinkObj).attr('href');
			  $(captionObj).attr('href',downLinkUrl);
		  }
	  });	
  },
  initNoFlash: function(str){
	//Do something
  }
}

//BEGIN ggcon.js
function google_ad_request_done(google_ads) {
    var s = '';
    var i;

    if (google_ads.length == 0) {
      return;
    }

    var feedbackURL = '';
    if(google_info != null && google_info.feedback_url.length > 0) {
        feedbackURL = google_info.feedback_url;
    }
    if (google_ads[0].type == "image") {
      s += '<a href="' + google_ads[0].url +
              '" target="_top" title="go to ' + google_ads[0].visible_url +
              '"><img border="0" src="' + google_ads[0].image_url +
              '"width="' + google_ads[0].image_width +
              '"height="' + google_ads[0].image_height + '"></a>';
    } else if (google_ads[0].type == "flash") {
      s += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
              ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"' +
              ' WIDTH="' + google_ad.image_width +
              '" HEIGHT="' + google_ad.image_height + '">' +
              '<PARAM NAME="movie" VALUE="' + google_ad.image_url + '">' +
              '<PARAM NAME="quality" VALUE="high">' +
              '<PARAM NAME="AllowScriptAccess" VALUE="never">' +
              '<EMBED src="' + google_ad.image_url +
              '" WIDTH="' + google_ad.image_width +
              '" HEIGHT="' + google_ad.image_height + 
              '" TYPE="application/x-shockwave-flash"' + 
              ' AllowScriptAccess="never" ' + 
              ' PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer"></EMBED></OBJECT>';
    } else if (google_ads[0].type == "text") {
      if(google_ads.length>1 && google_ads.length<4) {
       s += '<div class="googleAds" style="background-color:#FFFFFF;">'
        s += '<div style="margin-bottom:-2px;_padding-bottom: 2px; width: 100%;border-bottom: 1px solid #CCCCCC; font-family: arial; font-size: 12px;">';
        s += '<div style="padding: 4px; border-bottom: 1px solid #CCCCCC; background-color:#EEEEEE">';
        s += '<img class="closeX" src="/sd/btn_xclose.gif" ';
        s += 'onmouseout="javascript:this.src=\'/sd/btn_xclose.gif\';"';
        s += 'onmouseover="javascript:this.src=\'/sd/btn_xclose_hov.gif\';"';
        s += 'onclick="ArticlePage.hideGGCON();"/>';
        if(feedbackURL.length > 0) {
          s += '<a href="' + feedbackURL + '" target="_blank">Sponsored Links</a>';
        }
        else {
          s += 'Sponsored Links';
        }
         s += '</div>';

        for(i=0; i < google_ads.length; ++i) {
                s += '<div style="margin: 5px;width:30%;float:left;">';
                s += '<a href="' + google_ads[i].url + '" ' +
                                  'onmouseout="window.status=\'\'" ' +
                                  'onmouseover="window.status=\'go to ' +
                                  google_ads[i].visible_url + '\'" ' +
                                  '>' +
                                  google_ads[i].line1 + '</a><br>' +
                                  '<span style="color:#000000">' +
                                  google_ads[i].line2 + '&nbsp;<br>' +
                                  google_ads[i].line3 + '<br></span>' +
                                  '<span style="color:#008000">' +
                                  google_ads[i].visible_url + '</span><br>';
                s += '</div>';
        }
      }
      else {
        $('#ggcon').css({border:'1px solid #cccccc'});
        s += '<div style="background-color:#FFFFFF; padding-top: 0px; padding-bottom: 0px; padding-left: 0px; padding-right: 0px">'
        s += '<div style="width: 100%;border: 0px solid #CCCCCC; font-family: arial; font-size: 12px;">';
        s += '<div style="padding: 4px; border-bottom: 1px solid #CCCCCC; background-color:#EEEEEE">';
        if(feedbackURL.length > 0) {
          s += '<a href="' + feedbackURL + '" target="_blank">Sponsored Links</a>';
        }
        else {
          s += 'Sponsored Links';
        }
        s += '</div>';
        if (google_ads.length == 1) {
            /*
             * Partners should adjust text sizes
             * so ads occupy the majority of ad space.
             */
            s += '<div style="margin: 5px">';
            s += '<a href="' + google_ads[0].url + '" ' +
                            'onmouseout="window.status=\'\'" ' +
                            'onmouseover="window.status=\'go to ' +
                            google_ads[0].visible_url + '\'" ' +
                            '>' +
                            google_ads[0].line1 + '</a><br>' +
                            '<span style="color:#000000">' +
                            google_ads[0].line2 + '&nbsp;' +
                            google_ads[0].line3 + '<br></span>' +
                            '<span style="color:#008000">' +
                            google_ads[0].visible_url + '</span><br>';
            s += '</div>';
        } else if (google_ads.length > 1) {
            /*
             * For text ads, append each ad to the string.
             */
            for(i=0; i < google_ads.length; ++i) {
                s += '<div style="margin: 5px">';
                s += '<a href="' + google_ads[i].url + '" ' +
                                  'onmouseout="window.status=\'\'" ' +
                                  'onmouseover="window.status=\'go to ' +
                                  google_ads[i].visible_url + '\'" ' +
                                  '>' +
                                  google_ads[i].line1 + '</a><br>' +
                                  '<span style="color:#000000">' +
                                  google_ads[i].line2 + '&nbsp;' +
                                  google_ads[i].line3 + '<br></span>' +
                                  '<span style="color:#008000">' +
                                  google_ads[i].visible_url + '</span><br>';
                s += '</div>';
            }
        }
        s += '</div></div>';
      }
    }
    ArticlePage.moveGGCON(s);
    return;
}
//END ggcon.js

//Author Hover start
var ajaxReq;
var hoverId;
var timerId;
var linkBufObj;
var linkBufObjLeft;
var authId;
var timerIdAuth;

function clearAuthTimeout() {
   if(hoverId != null) {
      clearTimeout(hoverId);
      clearTimeout(timerIdAuth);
      document.getElementById('authorLinkHover').style.display = "block";
   }
}

function closeAuth() {
   if (timerId != null) {
      clearTimeout(timerId);
   }

   if (timerIdAuth != null) {
      clearTimeout(timerIdAuth);
   }

   hoverId = setTimeout("closeAuthHover()", 300);
}


function closeAuthHover() {
  document.getElementById('authorLinkHover').style.display = "none";
}

function displayAuth (url,obj) {
  if (hoverId != null) {
     clearTimeout(hoverId);
  }  
  linkBufObj = obj;
  if($('#leftColumn').css('display') != 'none'){
    linkBufObjLeft = 280;
  } else {
  //This is when the left column is collapsed.
    linkBufObjLeft = 22;
  }
  var str = 'displayAuthHover("'+url+'")';
  timerIdAuth =  setTimeout(str, 300);
  timerId = setTimeout('displayErrorMsg("'+obj+'")', 10000);
}

function displayErrorMsg(obj) {
  clearTimeout(timerId);
  var d = $('#authorLinkHover');
  if(d.length < 1) { return; }
  d.html("<div style=\"padding:7px;\"><div style=\"font-style:italic;font-size:11px;color:#000000;\">Author details are not currently available</div><div style=\"border-bottom:1px solid #cccccc;line-height:1px;margin-bottom:3px;\"></div><div style=\"font-style:italic;text-align:right;font-size:11px;color:#cccccc;\">Provided by Scopus</div></div>");
}

var objAuth = new Object();

var AuthorHover = {
  init: function() {
    var ps = $(".authHoverAnchor")
    ps.mouseover(function(event) {
      var t = $(event.currentTarget);
      displayAuth(t.attr("authHoverURL"), event.currentTarget);
    });
    ps.mouseout(function(event) {
      closeAuth();
    });
  }
} //AuthorHover
$(document).ready(function() {AuthorHover.init();});

function displayAuthHover(url) {
  var d = $('#authorLinkHover');
  if(d.length < 1) { return; }
  assignPosition(d);
  d.css("display", "block");

  var temp = url.split("/");
  authName = temp[4];
  
  var decodeAuthName = decodeURIComponent(authName);

  var temp1, authFullName;
  if (decodeAuthName.indexOf(",") != -1) {
    var temp1 = decodeAuthName.split(", ");
    var lastName = temp1[0];
    var firstName = temp1[1];
    authFullName = firstName + " " + lastName;
  } else {
    authFullName = decodeAuthName;
  }
  var authNameEncoded = encodeURIComponent(authFullName);

  temp[4] = authNameEncoded;
  var finalURL = temp[0]+"/"+temp[1]+"/"+temp[2]+"/"+temp[3]+"/"+temp[4]; 
  var decodeUrl = decodeURIComponent(finalURL);
  
  //Get author name from url
  var startAuthPos = decodeUrl.lastIndexOf("/");
  var authorName = decodeUrl.substring(startAuthPos+1);
      
  //Get author id from url
  var endPos = finalURL.lastIndexOf("/");
  var startPos = finalURL.lastIndexOf("/", endPos-1);

  authId = finalURL.substring(startPos+1, endPos);

  var resText = "";
  if (objAuth["'"+authId+"'"] != null && objAuth["'"+authId+"'"].length > 0) {
     resText = objAuth["'"+authId+"'"];
  }
   
  if (resText.length == 0) {
    $('#authorLinkHover').html("<div style=\"padding: 7px;\"><div style=\"margin-bottom:7px; font-size: 12px;\"><span  style=\"color: #999999;\">Articles (...)</span><span style=\"margin-left: 5px; margin-right: 5px;\">|</span><span style=\"color: #999999;\">References (...)</span><span style=\"margin-left: 5px; margin-right: 5px;\">|</span><span style=\"color: #999999;\">Cited by (...)</span></div><div style=\"margin-bottom: 7px; font-size: 11px;\"><span style=\"color: #999999;\">Author profile</span>&nbsp;of&nbsp;"+ authorName +"</div><div style=\"border-bottom: 1px solid rgb(204, 204, 204); line-height: 1px; margin-bottom: 3px;\"></div><div style=\"font-style: italic; text-align: right; font-size: 11px; color: rgb(204, 204, 204);\">Provided by Scopus</div></div>");
  }
    
  //for performance
  if (resText.length > 0) {
     clearTimeout(timerId);
     var d = $('#authorLinkHover');
     if(d.length < 1) { return; }
     d.html(resText);
     assignPosition(d);
     return;
  }

  ajaxReq = new $.get(url, function(response) { 
      var d = $('#authorLinkHover');
      clearTimeout(timerId);
      if(d.length < 1) { return; }
      objAuth["'"+authId+"'"] = response.responseText;
      d.html(response);
      assignPosition(d);
    });
} //displayAuthHover()

function assignPosition(d)
{
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
     d.css("left", Number(linkBufObj.offsetLeft + linkBufObjLeft) + "px");
     var linkId = linkBufObj.id;
     var linkNum = linkId.substring(9,linkId.length);
     var numPrev = Number(linkNum) - 1;
     var numPrevs = Number(linkNum) - 2;
     var numNext = Number(linkNum) + 1;
     var prevEle = document.getElementById("authname_" + numPrev);
     var nextEle = document.getElementById("authname_" + numNext);
     var prevestEle = document.getElementById("authname_" + numPrevs);
     var posPrev;
     var posNext;
     if(prevEle != null){
      posPrev = findPosY(prevEle);
     } else {
      posPrev = findPosY(linkBufObj);
     }
     if(posPrev ==  findPosY(linkBufObj)){
      d.css("top", findPosY(linkBufObj) + linkBufObj.offsetHeight + 5 + "px");
     } else {
       if(nextEle != null){
        posNext = findPosY(nextEle);
       } else {
        if(prevestEle != null && posPrev == findPosY(prevestEle) ){
         posNext  = findPosY(linkBufObj) + 27;
        } else {
         posNext  = findPosY(linkBufObj);
        }
       }
       d.css("top", posNext + linkBufObj.offsetHeight + 5 + "px");
     }
     d.css("display", "block");

  } else {
     d.css("left", Number(linkBufObj.offsetLeft + linkBufObjLeft) + "px");
     d.css("top", findPosY(linkBufObj) + linkBufObj.offsetHeight + 2 + "px");
     d.css("display", "block");
  }
}



function textBoxCE(textObj,imptr) {
  var child=document.getElementById(textObj);
  var imgChild=document.getElementById(imptr);
  if(child.style.display!="block") {
    child.style.display="block";
    imgChild.src="/scidirimg/minus.gif";
  }
  else{
    child.style.display="none";
    imgChild.src="/scidirimg/plus.gif";
  }
}

function toggleFigLblMMCStyling()
{
  var restylableContainers;
  var currentReStylableDivs;
  var currentLabelDivs;

  restylableContainers = getElementsByClassName(document,
                                                'DIV',
                                                'textboxdefault');

  for(var k=0;k<restylableContainers.length;k++) {
    currentLabelDivs = getElementsByClassName(restylableContainers[k],
                                              'SPAN',
                                              'nodefault');

    if (currentLabelDivs.length == 0) {
      restylableContainers[k].style.background = 'none';
      restylableContainers[k].style.border = '0 none';
      restylableContainers[k].style.margin = '0 0 0 15px';
    }
  }
}

function findPosY(obj) {
  var curtop = 0;
  if(obj.offsetParent) {
    while(1) {
      curtop += obj.offsetTop;
      if(!obj.offsetParent) { break; }
        obj = obj.offsetParent;
      }
  }
  else if(obj.y) {
    curtop += obj.y;
  }
  return curtop;
}
//Auth hover End

// extra stuff that needed to be moved over from sdO.js

function hideModalBox(){
  document.getElementById("modalBoxDisplay").style.display="none";
}

function setCenterAlign() {
  var msgBox = document.getElementById('modalWindowMsgBox');
  var winWidth = getWindowWidth();
  var winHeight = getWindowHeight();
  var top = (winHeight - msgBox.offsetHeight)/2;
  var left = (winWidth - msgBox.offsetWidth)/2;
  msgBox.style.top = top + 'px';
  msgBox.style.left = left + 'px';
  document.getElementById('modalWindow').style.height = winHeight + "px";
}

function getWindowHeight() {
  var myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myHeight = window.innerHeight;
  } else if( document.documentElement &&
    ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 6 compatible
    myHeight = document.body.clientHeight;
  }
  return myHeight;
}

function getWindowWidth() {
  var myWidth = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
  }
  else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
  }
  else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
   //IE 6 compatible
   myWidth = document.body.clientWidth;
  }
  return myWidth;
};

function requestHeightAdjust(id, h) {
  if(h==0) { $('#' + id).height(h); }
  $('#' + id + ' iframe').height(h+20);
}

function buildRelatedResults() {
    var relatedArtURL=SDM.urlPrefix +'/mlkt/rslts/'+SDM.pii+'/Art'
    var relatedRefURL=SDM.urlPrefix +'/mlkt/rslts/'+SDM.pii+'/Ref'
    var relatedArtBox=$('#boxRelatedArt');
    var relatedRefBox=$('#boxRelatedRef');
    
    $.get(relatedArtURL, function(res) {
        if (res){
            relatedArtBox.css("display", "block")
                         .html(res);
            $('#mlktListArt').prepend('<div id="mlktArtListBubbles"></div>');
        }
        else {
            relatedArtBox.remove();
        }
    });
    
    if(SDM.relatedRefAvail==true) {
        $.get(relatedRefURL, function(res) {
            if (res){
                relatedRefBox.css("display", "block")
                             .html(res);
                $('#mlktListRef').prepend('<div id="mlktRefListBubbles"></div>');
            }
            else {
                relatedRefBox.remove();
            }
        }); 
    } 
}

function buildCitedByBox() {
    var citedByURL=SDM.urlPrefix +'/citedby/rslts/'+SDM.pii;
    var citedByBox=$('#boxCitedByBuilt');
    
    $.get(citedByURL, function(res) {
        if (res){
            citedByBox.css("display", "block")
                      .html(res);
            $('#mlktListCited').prepend('<div id="mlktCiteListBubbles"></div>');
        }
        else {
            citedByBox.remove();
        }
    });
}
