define(function(require,exports,module){(function(){'use strict';if(typeof($)==='undefined')throw new Error('ZUI requires jQuery');if(!$.zui)$.zui=function(obj){if($.isPlainObject(obj)){$.extend($.zui,obj);}};var lastUuidAmend=0;$.zui({uuid:function(){return(new Date()).getTime()*1000+(lastUuidAmend++)%1000;},callEvent:function(func,event,proxy){if($.isFunction(func)){if(proxy!==undefined){func=$.proxy(func,proxy);}
var result=func(event);if(event)event.result=result;return!(result!==undefined&&(!result));}
return 1;},clientLang:function(){var lang;var config=window.config;if(typeof(config)!='undefined'&&config.clientLang){lang=config.clientLang;}else{var hl=$('html').attr('lang');lang=hl?hl:(navigator.userLanguage||navigator.userLanguage||'zh_cn');}
return lang.replace('-','_').toLowerCase();}});$.fn.callEvent=function(name,event,model){var $this=$(this);var dotIndex=name.indexOf('.zui.');var shortName=dotIndex<0?name:name.substring(0,dotIndex);var e=$.Event(shortName,event);if((model===undefined)&&dotIndex>0){model=$this.data(name.substring(dotIndex+1));}
if(model&&model.options){var func=model.options[shortName];if($.isFunction(func)){$.zui.callEvent(func,e,model);}}
$this.trigger(e);return e;};}());+function(){'use strict';var Button=function(element,options){this.$element=$(element)
this.options=$.extend({},Button.DEFAULTS,options)
this.isLoading=false}
Button.DEFAULTS={loadingText:'loading...'}
Button.prototype.setState=function(state){var d='disabled'
var $el=this.$element
var val=$el.is('input')?'val':'html'
var data=$el.data()
state=state+'Text'
if(!data.resetText)$el.data('resetText',$el[val]())
$el[val](data[state]||this.options[state])
setTimeout($.proxy(function(){if(state=='loadingText'){this.isLoading=true
$el.addClass(d).attr(d,d)}else if(this.isLoading){this.isLoading=false
$el.removeClass(d).removeAttr(d)}},this),0)}
Button.prototype.toggle=function(){var changed=true
var $parent=this.$element.closest('[data-toggle="buttons"]')
if($parent.length){var $input=this.$element.find('input')
if($input.prop('type')=='radio'){if($input.prop('checked')&&this.$element.hasClass('active'))changed=false
else $parent.find('.active').removeClass('active')}
if(changed)$input.prop('checked',!this.$element.hasClass('active')).trigger('change')}
if(changed)this.$element.toggleClass('active')}
var old=$.fn.button
$.fn.button=function(option){return this.each(function(){var $this=$(this)
var data=$this.data('zui.button')
var options=typeof option=='object'&&option
if(!data)$this.data('zui.button',(data=new Button(this,options)))
if(option=='toggle')data.toggle()
else if(option)data.setState(option)})}
$.fn.button.Constructor=Button
$.fn.button.noConflict=function(){$.fn.button=old
return this}
$(document).on('click.zui.button.data-api','[data-toggle^=button]',function(e){var $btn=$(e.target)
if(!$btn.hasClass('btn'))$btn=$btn.closest('.btn')
$btn.button('toggle')
e.preventDefault()})}();+function(){'use strict';var dismiss='[data-dismiss="alert"]'
var zuiname='zui.alert';var Alert=function(el){$(el).on('click',dismiss,this.close)}
Alert.prototype.close=function(e){var $this=$(this)
var selector=$this.attr('data-target')
if(!selector){selector=$this.attr('href')
selector=selector&&selector.replace(/.*(?=#[^\s]*$)/,'')}
var $parent=$(selector)
if(e)e.preventDefault()
if(!$parent.length){$parent=$this.hasClass('alert')?$this:$this.parent()}
$parent.trigger(e=$.Event('close.'+zuiname))
if(e.isDefaultPrevented())return
$parent.removeClass('in')
function removeElement(){$parent.trigger('closed.'+zuiname).remove()}
$.support.transition&&$parent.hasClass('fade')?$parent.one($.support.transition.end,removeElement).emulateTransitionEnd(150):removeElement()}
var old=$.fn.alert
$.fn.alert=function(option){return this.each(function(){var $this=$(this)
var data=$this.data(zuiname)
if(!data)$this.data(zuiname,(data=new Alert(this)))
if(typeof option=='string')data[option].call($this)})}
$.fn.alert.Constructor=Alert
$.fn.alert.noConflict=function(){$.fn.alert=old
return this}
$(document).on('click.'+zuiname+'.data-api',dismiss,Alert.prototype.close)}();+function(){'use strict';var zuiname='zui.tab'
var Tab=function(element){this.element=$(element)}
Tab.prototype.show=function(){var $this=this.element
var $ul=$this.closest('ul:not(.dropdown-menu)')
var selector=$this.attr('data-target')||$this.attr('data-tab')
if(!selector){selector=$this.attr('href')
selector=selector&&selector.replace(/.*(?=#[^\s]*$)/,'')}
if($this.parent('li').hasClass('active'))return
var previous=$ul.find('.active:last a')[0]
var e=$.Event('show.'+zuiname,{relatedTarget:previous})
$this.trigger(e)
if(e.isDefaultPrevented())return
var $target=$(selector)
this.activate($this.parent('li'),$ul)
this.activate($target,$target.parent(),function(){$this.trigger({type:'shown.'+zuiname,relatedTarget:previous})})}
Tab.prototype.activate=function(element,container,callback){var $active=container.find('> .active')
var transition=callback&&$.support.transition&&$active.hasClass('fade')
function next(){$active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active')
element.addClass('active')
if(transition){element[0].offsetWidth
element.addClass('in')}else{element.removeClass('fade')}
if(element.parent('.dropdown-menu')){element.closest('li.dropdown').addClass('active')}
callback&&callback()}
transition?$active.one($.support.transition.end,next).emulateTransitionEnd(150):next()
$active.removeClass('in')}
var old=$.fn.tab
$.fn.tab=function(option){return this.each(function(){var $this=$(this)
var data=$this.data(zuiname)
if(!data)$this.data(zuiname,(data=new Tab(this)))
if(typeof option=='string')data[option]()})}
$.fn.tab.Constructor=Tab
$.fn.tab.noConflict=function(){$.fn.tab=old
return this}
$(document).on('click.zui.tab.data-api','[data-toggle="tab"], [data-tab]',function(e){e.preventDefault()
$(this).tab('show')})}();+function(){'use strict';function transitionEnd(){var el=document.createElement('bootstrap')
var transEndEventNames={WebkitTransition:'webkitTransitionEnd',MozTransition:'transitionend',OTransition:'oTransitionEnd otransitionend',transition:'transitionend'}
for(var name in transEndEventNames){if(el.style[name]!==undefined){return{end:transEndEventNames[name]}}}
return false}
$.fn.emulateTransitionEnd=function(duration){var called=false
var $el=this
$(this).one('bsTransitionEnd',function(){called=true})
var callback=function(){if(!called)$($el).trigger($.support.transition.end)}
setTimeout(callback,duration)
return this}
$(function(){$.support.transition=transitionEnd()
if(!$.support.transition)return
$.event.special.bsTransitionEnd={bindType:$.support.transition.end,delegateType:$.support.transition.end,handle:function(e){if($(e.target).is(this))return e.handleObj.handler.apply(this,arguments)}}})}();+function(){'use strict';var zuiname='zui.collapse'
var Collapse=function(element,options){this.$element=$(element)
this.options=$.extend({},Collapse.DEFAULTS,options)
this.transitioning=null
if(this.options.parent)this.$parent=$(this.options.parent)
if(this.options.toggle)this.toggle()}
Collapse.DEFAULTS={toggle:true}
Collapse.prototype.dimension=function(){var hasWidth=this.$element.hasClass('width')
return hasWidth?'width':'height'}
Collapse.prototype.show=function(){if(this.transitioning||this.$element.hasClass('in'))return
var startEvent=$.Event('show.'+zuiname)
this.$element.trigger(startEvent)
if(startEvent.isDefaultPrevented())return
var actives=this.$parent&&this.$parent.find('.in')
if(actives&&actives.length){var hasData=actives.data(zuiname)
if(hasData&&hasData.transitioning)return
actives.collapse('hide')
hasData||actives.data(zuiname,null)}
var dimension=this.dimension()
this.$element.removeClass('collapse').addClass('collapsing')[dimension](0)
this.transitioning=1
var complete=function(){this.$element.removeClass('collapsing').addClass('in')[dimension]('auto')
this.transitioning=0
this.$element.trigger('shown.'+zuiname)}
if(!$.support.transition)return complete.call(this)
var scrollSize=$.camelCase(['scroll',dimension].join('-'))
this.$element.one($.support.transition.end,$.proxy(complete,this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])}
Collapse.prototype.hide=function(){if(this.transitioning||!this.$element.hasClass('in'))return
var startEvent=$.Event('hide.'+zuiname)
this.$element.trigger(startEvent)
if(startEvent.isDefaultPrevented())return
var dimension=this.dimension()
this.$element[dimension](this.$element[dimension]())[0].offsetHeight
this.$element.addClass('collapsing').removeClass('collapse').removeClass('in')
this.transitioning=1
var complete=function(){this.transitioning=0
this.$element.trigger('hidden.'+zuiname).removeClass('collapsing').addClass('collapse')}
if(!$.support.transition)return complete.call(this)
this.$element[dimension](0).one($.support.transition.end,$.proxy(complete,this)).emulateTransitionEnd(350)}
Collapse.prototype.toggle=function(){this[this.$element.hasClass('in')?'hide':'show']()}
var old=$.fn.collapse
$.fn.collapse=function(option){return this.each(function(){var $this=$(this)
var data=$this.data(zuiname)
var options=$.extend({},Collapse.DEFAULTS,$this.data(),typeof option=='object'&&option)
if(!data)$this.data(zuiname,(data=new Collapse(this,options)))
if(typeof option=='string')data[option]()})}
$.fn.collapse.Constructor=Collapse
$.fn.collapse.noConflict=function(){$.fn.collapse=old
return this}
$(document).on('click.'+zuiname+'.data-api','[data-toggle=collapse]',function(e){var $this=$(this),href
var target=$this.attr('data-target')||e.preventDefault()||(href=$this.attr('href'))&&href.replace(/.*(?=#[^\s]+$)/,'')
var $target=$(target)
var data=$target.data(zuiname)
var option=data?'toggle':$this.data()
var parent=$this.attr('data-parent')
var $parent=parent&&$(parent)
if(!data||!data.transitioning){if($parent)$parent.find('[data-toggle=collapse][data-parent="'+parent+'"]').not($this).addClass('collapsed')
$this[$target.hasClass('in')?'addClass':'removeClass']('collapsed')}
$target.collapse(option)})}();(function(){'use strict';var desktopLg=1200,desktop=992,tablet=768,cssNames={desktop:'screen-desktop',desktopLg:'screen-desktop-wide',tablet:'screen-tablet',phone:'screen-phone',isMobile:'device-mobile',isDesktop:'device-desktop',touch:'is-touchable'};var $window=$(window);var resetCssClass=function(){var width=$window.width();$('html').toggleClass(cssNames.desktop,width>=desktop&&width<desktopLg).toggleClass(cssNames.desktopLg,width>=desktopLg).toggleClass(cssNames.tablet,width>=tablet&&width<desktop).toggleClass(cssNames.phone,width<tablet).toggleClass(cssNames.isMobile,width<desktop).toggleClass(cssNames.touch,'ontouchstart'in document.documentElement).toggleClass(cssNames.isDesktop,width>=desktop);};$window.resize(resetCssClass);resetCssClass();}());(function(){'use strict';var browseHappyTip={'zh_cn':'您的浏览器版本过低，无法体验所有功能，建议升级或者更换浏览器。 <a href="http://browsehappy.com/" target="_blank" class="alert-link">了解更多...</a>','zh_tw':'您的瀏覽器版本過低，無法體驗所有功能，建議升級或者更换瀏覽器。<a href="http://browsehappy.com/" target="_blank" class="alert-link">了解更多...</a>','en':'Your browser is too old, it has been unable to experience the colorful internet. We strongly recommend that you upgrade a better one. <a href="http://browsehappy.com/" target="_blank" class="alert-link">Learn more...</a>'};var Browser=function(){var ie=this.isIE()||this.isIE10()||false;if(ie){for(var i=10;i>5;i--){if(this.isIE(i)){ie=i;break;}}}
this.ie=ie;this.cssHelper();};Browser.prototype.cssHelper=function(){var ie=this.ie,$html=$('html');$html.toggleClass('ie',ie).removeClass('ie-6 ie-7 ie-8 ie-9 ie-10');if(ie){$html.addClass('ie-'+ie).toggleClass('gt-ie-7 gte-ie-8 support-ie',ie>=8).toggleClass('lte-ie-7 lt-ie-8 outdated-ie',ie<8).toggleClass('gt-ie-8 gte-ie-9',ie>=9).toggleClass('lte-ie-8 lt-ie-9',ie<9).toggleClass('gt-ie-9 gte-ie-10',ie>=10).toggleClass('lte-ie-9 lt-ie-10',ie<10);}};Browser.prototype.tip=function(showCoontent){var $browseHappy=$('#browseHappyTip');if(!$browseHappy.length){$browseHappy=$('<div id="browseHappyTip" class="alert alert-dismissable alert-danger-inverse alert-block" style="position: relative; z-index: 99999"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button><div class="container"><div class="content text-center"></div></div></div>');$browseHappy.prependTo('body');}
$browseHappy.find('.content').html(showCoontent||this.browseHappyTip||browseHappyTip[$.zui.clientLang()||'zh_cn']);};Browser.prototype.isIE=function(version){if(version===10)return this.isIE10();var b=document.createElement('b');b.innerHTML='';return b.getElementsByTagName('i').length===1;};Browser.prototype.isIE10=function(){return(false);};$.zui({browser:new Browser()});$(function(){if(!$('body').hasClass('disabled-browser-tip')){if($.zui.browser.ie&&$.zui.browser.ie<8){$.zui.browser.tip();}}});}());(function(){'use strict';Date.ONEDAY_TICKS=24*3600*1000;if(!Date.prototype.format){Date.prototype.format=function(format){var date={'M+':this.getMonth()+1,'d+':this.getDate(),'h+':this.getHours(),'m+':this.getMinutes(),'s+':this.getSeconds(),'q+':Math.floor((this.getMonth()+3)/3),'S+':this.getMilliseconds()};if(/(y+)/i.test(format)){format=format.replace(RegExp.$1,(this.getFullYear()+'').substr(4-RegExp.$1.length));}
for(var k in date){if(new RegExp('('+k+')').test(format)){format=format.replace(RegExp.$1,RegExp.$1.length==1?date[k]:('00'+date[k]).substr((''+date[k]).length));}}
return format;};}
if(!Date.prototype.addMilliseconds){Date.prototype.addMilliseconds=function(value){this.setTime(this.getTime()+value);return this;};}
if(!Date.prototype.addDays){Date.prototype.addDays=function(days){this.addMilliseconds(days*Date.ONEDAY_TICKS);return this;};}
if(!Date.prototype.clone){Date.prototype.clone=function(){var date=new Date();date.setTime(this.getTime());return date;};}
if(!Date.isLeapYear){Date.isLeapYear=function(year){return(((year%4===0)&&(year%100!==0))||(year%400===0));};}
if(!Date.getDaysInMonth){Date.getDaysInMonth=function(year,month){return[31,(Date.isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];};}
if(!Date.prototype.isLeapYear){Date.prototype.isLeapYear=function(){return Date.isLeapYear(this.getFullYear());};}
if(!Date.prototype.clearTime){Date.prototype.clearTime=function(){this.setHours(0);this.setMinutes(0);this.setSeconds(0);this.setMilliseconds(0);return this;};}
if(!Date.prototype.getDaysInMonth){Date.prototype.getDaysInMonth=function(){return Date.getDaysInMonth(this.getFullYear(),this.getMonth());};}
if(!Date.prototype.addMonths){Date.prototype.addMonths=function(value){var n=this.getDate();this.setDate(1);this.setMonth(this.getMonth()+value);this.setDate(Math.min(n,this.getDaysInMonth()));return this;};}
if(!Date.prototype.getLastWeekday){Date.prototype.getLastWeekday=function(day){day=day||1;var d=this.clone();while(d.getDay()!=day){d.addDays(-1);}
d.clearTime();return d;};}
if(!Date.prototype.isSameDay){Date.prototype.isSameDay=function(date){return date.toDateString()===this.toDateString();};}
if(!Date.prototype.isSameWeek){Date.prototype.isSameWeek=function(date){var weekStart=this.getLastWeekday();var weekEnd=weekStart.clone().addDays(7);return date>=weekStart&&date<weekEnd;};}
if(!Date.prototype.isSameYear){Date.prototype.isSameYear=function(date){return this.getFullYear()===date.getFullYear();};}}());(function(){'use strict';if(!String.prototype.format){String.prototype.format=function(args){var result=this;if(arguments.length>0){var reg;if(arguments.length<=2&&typeof(args)=='object'){for(var key in args){if(args[key]!==undefined){reg=new RegExp('('+(arguments[1]?arguments[1].replace('0',key):'{'+key+'}')+')','g');result=result.replace(reg,args[key]);}}}else{for(var i=0;i<arguments.length;i++){if(arguments[i]!==undefined){reg=new RegExp('({['+i+']})','g');result=result.replace(reg,arguments[i]);}}}}
return result;};}
if(!String.prototype.isNum){String.prototype.isNum=function(s){if(s!==null){var r,re;re=/\d*/i;r=s.match(re);return(r==s)?true:false;}
return false;};}})();(function(){'$:nomunge';var elems=$([]),jq_resize=$.resize=$.extend($.resize,{}),timeout_id,str_setTimeout='setTimeout',str_resize='resize',str_data=str_resize+'-special-event',str_delay='delay',str_throttle='throttleWindow';jq_resize[str_delay]=250;jq_resize[str_throttle]=true;$.event.special[str_resize]={setup:function(){if(!jq_resize[str_throttle]&&this[str_setTimeout]){return false;}
var elem=$(this);elems=elems.add(elem);$.data(this,str_data,{w:elem.width(),h:elem.height()});if(elems.length===1){loopy();}},teardown:function(){if(!jq_resize[str_throttle]&&this[str_setTimeout]){return false;}
var elem=$(this);elems=elems.not(elem);elem.removeData(str_data);if(!elems.length){clearTimeout(timeout_id);}},add:function(handleObj){if(!jq_resize[str_throttle]&&this[str_setTimeout]){return false;}
var old_handler;function new_handler(e,w,h){var elem=$(this),data=$.data(this,str_data)||{};data.w=w!==undefined?w:elem.width();data.h=h!==undefined?h:elem.height();old_handler.apply(this,arguments);};if($.isFunction(handleObj)){old_handler=handleObj;return new_handler;}else{old_handler=handleObj.handler;handleObj.handler=new_handler;}}};function loopy(){timeout_id=window[str_setTimeout](function(){elems.each(function(){var elem=$(this),width=elem.width(),height=elem.height(),data=$.data(this,str_data);if(width!==data.w||height!==data.h){elem.trigger(str_resize,[data.w=width,data.h=height]);}});loopy();},jq_resize[str_delay]);};})();+function(){'use strict';var zuiname='zui.scrollspy'
function ScrollSpy(element,options){var href
var process=$.proxy(this.process,this)
this.$element=$(element).is('body')?$(window):$(element)
this.$body=$('body')
this.$scrollElement=this.$element.on('scroll.'+zuiname+'.data-api',process)
this.options=$.extend({},ScrollSpy.DEFAULTS,options)
if(!this.selector)this.selector=(this.options.target||((href=$(element).attr('href'))&&href.replace(/.*(?=#[^\s]+$)/,''))||'')+' .nav li > a'
this.offsets=$([])
this.targets=$([])
this.activeTarget=null
this.refresh()
this.process()}
ScrollSpy.DEFAULTS={offset:10}
ScrollSpy.prototype.refresh=function(){var offsetMethod=this.$element[0]==window?'offset':'position'
this.offsets=$([])
this.targets=$([])
var self=this
var $targets=this.$body.find(this.selector).map(function(){var $el=$(this)
var href=$el.data('target')||$el.attr('href')
var $href=/^#./.test(href)&&$(href)
return($href&&$href.length&&$href.is(':visible')&&[[$href[offsetMethod]().top+(!$.isWindow(self.$scrollElement.get(0))&&self.$scrollElement.scrollTop()),href]])||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){self.offsets.push(this[0])
self.targets.push(this[1])})}
ScrollSpy.prototype.process=function(){var scrollTop=this.$scrollElement.scrollTop()+this.options.offset
var scrollHeight=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight
var maxScroll=scrollHeight-this.$scrollElement.height()
var offsets=this.offsets
var targets=this.targets
var activeTarget=this.activeTarget
var i
if(scrollTop>=maxScroll){return activeTarget!=(i=targets.last()[0])&&this.activate(i)}
if(activeTarget&&scrollTop<=offsets[0]){return activeTarget!=(i=targets[0])&&this.activate(i)}
for(i=offsets.length;i--;){activeTarget!=targets[i]&&scrollTop>=offsets[i]&&(!offsets[i+1]||scrollTop<=offsets[i+1])&&this.activate(targets[i])}}
ScrollSpy.prototype.activate=function(target){this.activeTarget=target
$(this.selector).parentsUntil(this.options.target,'.active').removeClass('active')
var selector=this.selector+'[data-target="'+target+'"],'+
this.selector+'[href="'+target+'"]'
var active=$(selector).parents('li').addClass('active')
if(active.parent('.dropdown-menu').length){active=active.closest('li.dropdown').addClass('active')}
active.trigger('activate.'+zuiname)}
var old=$.fn.scrollspy
$.fn.scrollspy=function(option){return this.each(function(){var $this=$(this)
var data=$this.data(zuiname)
var options=typeof option=='object'&&option
if(!data)$this.data(zuiname,(data=new ScrollSpy(this,options)))
if(typeof option=='string')data[option]()})}
$.fn.scrollspy.Constructor=ScrollSpy
$.fn.scrollspy.noConflict=function(){$.fn.scrollspy=old
return this}
$(window).on('load',function(){$('[data-spy="scroll"]').each(function(){var $spy=$(this)
$spy.scrollspy($spy.data())})})}();(function(){'use strict';var lsName='localStorage';var storage,dataset,pageName='page_'+window.location.pathname+window.location.search;var Store=function(){this.slience=true;try{if((lsName in window)&&window[lsName]&&window[lsName].setItem){this.enable=true;storage=window[lsName];}}catch(e){}
if(!this.enable){dataset={};storage={getLength:function(){var length=0;$.each(dataset,function(){length++;});return length;},key:function(index){var key,i=0;$.each(dataset,function(k){if(i===index){key=k;return false;}
i++;});return key;},removeItem:function(key){delete dataset[key];},getItem:function(key){return dataset[key];},setItem:function(key,val){dataset[key]=val;},clear:function(){dataset={};}};}
this.storage=storage;this.page=this.get(pageName,{});};Store.prototype.pageSave=function(){if($.isEmptyObject(this.page)){this.remove(pageName);}else{var forDeletes=[],i;for(i in this.page){var val=this.page[i];if(val===null)
forDeletes.push(i);}
for(i=forDeletes.length-1;i>=0;i--){delete this.page[forDeletes[i]];}
this.set(pageName,this.page);}};Store.prototype.pageRemove=function(key){if(typeof this.page[key]!='undefined'){this.page[key]=null;this.pageSave();}};Store.prototype.pageClear=function(){this.page={};this.pageSave();};Store.prototype.pageGet=function(key,defaultValue){var val=this.page[key];return(defaultValue!==undefined&&(val===null||val===undefined))?defaultValue:val;};Store.prototype.pageSet=function(objOrKey,val){if($.isPlainObject(objOrKey)){$.extend(true,this.page,objOrKey);}else{this.page[this.serialize(objOrKey)]=val;}
this.pageSave();};Store.prototype.check=function(){if(!this.enable){if(!this.slience)throw new Error('Browser not support localStorage or enable status been set true.');}
return this.enable;};Store.prototype.length=function(){if(this.check()){return storage.getLength?storage.getLength():storage.length;}
return 0;};Store.prototype.removeItem=function(key){storage.removeItem(key);return this;};Store.prototype.remove=function(key){return this.removeItem(key);};Store.prototype.getItem=function(key){return storage.getItem(key);};Store.prototype.get=function(key,defaultValue){var val=this.deserialize(this.getItem(key));if(typeof val==='undefined'||val===null){if(typeof defaultValue!=='undefined'){return defaultValue;}}
return val;};Store.prototype.key=function(index){return storage.key(index);};Store.prototype.setItem=function(key,val){storage.setItem(key,val);return this;};Store.prototype.set=function(key,val){if(val===undefined)return this.remove(key);this.setItem(key,this.serialize(val));return this;};Store.prototype.clear=function(){storage.clear();return this;};Store.prototype.forEach=function(callback){var length=this.length();for(var i=length-1;i>=0;i--){var key=storage.key(i);callback(key,this.get(key));}
return this;};Store.prototype.getAll=function(){var all={};this.forEach(function(key,val){all[key]=val;});return all;};Store.prototype.serialize=function(value){if(typeof value==='string')return value;return JSON.stringify(value);};Store.prototype.deserialize=function(value){if(typeof value!=='string')return undefined;try{return JSON.parse(value);}catch(e){return value||undefined;}};$.zui({store:new Store()});}());(function(){'use strict';var Draggable=function(element,options){this.$=$(element);this.options=this.getOptions(options);this.init();};Draggable.DEFAULTS={container:'body',move:true};Draggable.prototype.getOptions=function(options){options=$.extend({},Draggable.DEFAULTS,this.$.data(),options);return options;};Draggable.prototype.init=function(){this.handleMouseEvents();};Draggable.prototype.handleMouseEvents=function(){var $e=this.$,BEFORE='before',DRAG='drag',FINISH='finish',setting=this.options,startPos,cPos,startOffset,mousePos,moved;var mouseDown=function(event){if($.isFunction(setting[BEFORE])){var isSure=setting[BEFORE]({event:event,element:$e});if(isSure===false)return;}
var $container=$(setting.container),pos=$e.offset();cPos=$container.offset();startPos={x:event.pageX,y:event.pageY};startOffset={x:event.pageX-pos.left+cPos.left,y:event.pageY-pos.top+cPos.top};mousePos=$.extend({},startPos);moved=false;$e.addClass('drag-ready');$(document).bind('mousemove',mouseMove).bind('mouseup',mouseUp);event.preventDefault();if(setting.stopPropagation){event.stopPropagation();}};var mouseMove=function(event){moved=true;var mX=event.pageX,mY=event.pageY;var dragPos={left:mX-startOffset.x,top:mY-startOffset.y};$e.removeClass('drag-ready').addClass('dragging');if(setting.move){$e.css(dragPos);}
if($.isFunction(setting[DRAG])){setting[DRAG]({event:event,element:$e,startOffset:startOffset,pos:dragPos,offset:{x:mX-startPos.x,y:mY-startPos.y},smallOffset:{x:mX-mousePos.x,y:mY-mousePos.y}});}
mousePos.x=mX;mousePos.y=mY;if(setting.stopPropagation){event.stopPropagation();}};var mouseUp=function(event){$(document).unbind('mousemove',mouseMove).unbind('mouseup',mouseUp);if(!moved){$e.removeClass('drag-ready');return;}
var endPos={left:event.pageX-startOffset.x,top:event.pageY-startOffset.y};$e.removeClass('drag-ready').removeClass('dragging');if(setting.move){$e.css(endPos);}
if($.isFunction(setting[FINISH])){setting[FINISH]({event:event,element:$e,startOffset:startOffset,pos:endPos,offset:{x:event.pageX-startPos.x,y:event.pageY-startPos.y},smallOffset:{x:event.pageX-mousePos.x,y:event.pageY-mousePos.y}});}
event.preventDefault();if(setting.stopPropagation){event.stopPropagation();}};if(setting.handle){$e.on('mousedown',setting.handle,mouseDown);}else{$e.on('mousedown',mouseDown);}};$.fn.draggable=function(option){return this.each(function(){var $this=$(this);var data=$this.data('zui.draggable');var options=typeof option=='object'&&option;if(!data)$this.data('zui.draggable',(data=new Draggable(this,options)));if(typeof option=='string')data[option]();});};$.fn.draggable.Constructor=Draggable;}());(function(){'use strict';var Droppable=function(element,options){this.$=$(element);this.options=this.getOptions(options);this.init();};Droppable.DEFAULTS={container:'body',deviation:5,sensorOffsetX:0,sensorOffsetY:0};Droppable.prototype.getOptions=function(options){options=$.extend({},Droppable.DEFAULTS,this.$.data(),options);return options;};Droppable.prototype.callEvent=function(name,params){return $.zui.callEvent(this.options[name],params,this);};Droppable.prototype.init=function(){this.handleMouseEvents();};Droppable.prototype.handleMouseEvents=function(){var $e=this.$,self=this,setting=this.options,BEFORE='before';this.$triggerTarget=(setting.trigger?($.isFunction(setting.trigger)?setting.trigger($e):$e.find(setting.trigger)).first():$e);this.$triggerTarget.on('mousedown',function(event){if($.isFunction(setting[BEFORE])){var isSure=setting[BEFORE]({event:event,element:$e});if(isSure===false)return;}
var $targets=$.isFunction(setting.target)?setting.target($e):$(setting.target),target=null,shadow=null,$container=$(setting.container).first(),isIn=false,isSelf=true,oldCssPosition,startOffset=$e.offset(),startMouseOffset={left:event.pageX,top:event.pageY};var containerOffset=$container.offset();var clickOffset={left:startMouseOffset.left-startOffset.left,top:startMouseOffset.top-startOffset.top};var lastMouseOffset={left:startMouseOffset.left,top:startMouseOffset.top};$e.addClass('drag-from');$(document).bind('mousemove',mouseMove).bind('mouseup',mouseUp);event.preventDefault();function mouseMove(event){var mouseOffset={left:event.pageX,top:event.pageY};if(Math.abs(mouseOffset.left-startMouseOffset.left)<setting.deviation&&Math.abs(mouseOffset.top-startMouseOffset.top)<setting.deviation)return;if(shadow===null)
{var cssPosition=$container.css('position');if(cssPosition!='absolute'&&cssPosition!='relative'&&cssPosition!='fixed'){oldCssPosition=cssPosition;$container.css('position','relative');}
shadow=$e.clone().removeClass('drag-from').addClass('drag-shadow').css({position:'absolute',width:$e.outerWidth(),transition:'none'}).appendTo($container);$e.addClass('dragging');self.callEvent('start',{event:event,element:$e});}
var offset={left:mouseOffset.left-clickOffset.left,top:mouseOffset.top-clickOffset.top};var position={left:offset.left-containerOffset.left,top:offset.top-containerOffset.top};shadow.css(position);lastMouseOffset.left=mouseOffset.left;lastMouseOffset.top=mouseOffset.top;var isNew=false;isIn=false;if(!setting.flex){$targets.removeClass('drop-to');}
var newTarget=null;$targets.each(function(){var t=$(this);var tPos=t.offset();var tW=t.outerWidth(),tH=t.outerHeight(),tX=tPos.left+setting.sensorOffsetX,tY=tPos.top+setting.sensorOffsetY;if(mouseOffset.left>tX&&mouseOffset.top>tY&&mouseOffset.left<(tX+tW)&&mouseOffset.top<(tY+tH)){if(newTarget)newTarget.removeClass('drop-to');newTarget=t;if(!setting.nested)return false;}});if(newTarget){isIn=true;var id=newTarget.data('id');if($e.data('id')!=id)isSelf=false;if(target===null||(target.data('id')!==id&&(!isSelf)))isNew=true;target=newTarget;if(setting.flex){$targets.removeClass('drop-to');}
target.addClass('drop-to');}
if(!setting.flex){$e.toggleClass('drop-in',isIn);shadow.toggleClass('drop-in',isIn);}else if(target!==null&&target.length){isIn=true;}
self.callEvent('drag',{event:event,isIn:isIn,target:target,element:$e,isNew:isNew,selfTarget:isSelf,clickOffset:clickOffset,offset:offset,position:{left:offset.left-containerOffset.left,top:offset.top-containerOffset.top},mouseOffset:mouseOffset});event.preventDefault();}
function mouseUp(event){if(oldCssPosition){$container.css('position',oldCssPosition);}
if(shadow===null){$e.removeClass('drag-from');$(document).unbind('mousemove',mouseMove).unbind('mouseup',mouseUp);self.callEvent('always',{event:event,cancel:true});return;}
if(!isIn)target=null;var isSure=true,mouseOffset={left:event.pageX,top:event.pageY};var offset={left:mouseOffset.left-clickOffset.left,top:mouseOffset.top-clickOffset.top};var moveOffset={left:mouseOffset.left-lastMouseOffset.left,top:mouseOffset.top-lastMouseOffset.top};lastMouseOffset.left=mouseOffset.left;lastMouseOffset.top=mouseOffset.top;var eventOptions={event:event,isIn:isIn,target:target,element:$e,isNew:(!isSelf)&&target!==null,selfTarget:isSelf,offset:offset,mouseOffset:mouseOffset,position:{left:offset.left-containerOffset.left,top:offset.top-containerOffset.top},lastMouseOffset:lastMouseOffset,moveOffset:moveOffset};isSure=self.callEvent('beforeDrop',eventOptions);if(isSure&&isIn){self.callEvent('drop',eventOptions);}
$(document).unbind('mousemove',mouseMove).unbind('mouseup',mouseUp);$targets.removeClass('drop-to');$e.removeClass('dragging').removeClass('drag-from');shadow.remove();self.callEvent('finish',eventOptions);self.callEvent('always',eventOptions);event.preventDefault();}});};Droppable.prototype.reset=function(){this.$triggerTarget.off('mousedown');this.handleMouseEvents();};$.fn.droppable=function(option){return this.each(function(){var $this=$(this);var data=$this.data('zui.droppable');var options=typeof option=='object'&&option;if(!data)$this.data('zui.droppable',(data=new Droppable(this,options)));if(typeof option=='string')data[option]();});};$.fn.droppable.Constructor=Droppable;}());+function(){'use strict';var zuiname='zui.modal'
var Modal=function(element,options){this.options=options
this.$body=$(document.body)
this.$element=$(element)
this.$backdrop=this.isShown=null
this.scrollbarWidth=0
if(typeof this.options.moveable==='undefined'){this.options.moveable=this.$element.hasClass('modal-moveable');}
if(this.options.remote){this.$element.find('.modal-content').load(this.options.remote,$.proxy(function(){this.$element.trigger('loaded.'+zuiname)},this))}}
Modal.VERSION='3.2.0'
Modal.TRANSITION_DURATION=300
Modal.BACKDROP_TRANSITION_DURATION=150
Modal.DEFAULTS={backdrop:true,keyboard:true,show:true,position:'fit'}
Modal.prototype.toggle=function(_relatedTarget,position){return this.isShown?this.hide():this.show(_relatedTarget,position)}
Modal.prototype.ajustPosition=function(position){if(typeof position==='undefined')position=this.options.position;if(typeof position==='undefined')return;var $dialog=this.$element.find('.modal-dialog');var half=Math.max(0,($(window).height()-$dialog.outerHeight())/2);var topPos=position=='fit'?(half*2/3):(position=='center'?half:position);if($dialog.hasClass('modal-moveable')){var pos=null;if(this.options.rememberPos){if(this.options.rememberPos===true){pos=this.$element.data('modal-pos');}else if($.zui.store){pos=$.zui.store.pageGet(zuiname+'.rememberPos');}}
if(!pos){pos={left:Math.max(0,($(window).width()-$dialog.outerWidth())/2),top:topPos};}
$dialog.css(pos);}else{$dialog.css('margin-top',topPos);}}
Modal.prototype.setMoveale=function(){if(!$.fn.draggable)console.error('Moveable modal requires draggable.js.');var that=this;var options=that.options;var $dialog=that.$element.find('.modal-dialog').removeClass('modal-dragged');$dialog.toggleClass('modal-moveable',options.moveable);if(!that.$element.data('modal-moveable-setup')){$dialog.draggable({container:that.$element,handle:'.modal-header',before:function(){$dialog.css('margin-top','').addClass('modal-dragged');},finish:function(e){if(options.rememberPos){that.$element.data('modal-pos',e.pos);if($.zui.store&&options.rememberPos!==true){$.zui.store.pageSet(zuiname+'.rememberPos',e.pos);}}}});}}
Modal.prototype.show=function(_relatedTarget,position){var that=this
var e=$.Event('show.'+zuiname,{relatedTarget:_relatedTarget})
that.$element.trigger(e)
if(that.isShown||e.isDefaultPrevented())return
that.isShown=true
if(that.options.moveable)that.setMoveale();that.checkScrollbar()
that.$body.addClass('modal-open')
that.setScrollbar()
that.escape()
that.$element.on('click.dismiss.'+zuiname,'[data-dismiss="modal"]',$.proxy(that.hide,that))
that.backdrop(function(){var transition=$.support.transition&&that.$element.hasClass('fade')
if(!that.$element.parent().length){that.$element.appendTo(that.$body)}
that.$element.show().scrollTop(0)
if(transition){that.$element[0].offsetWidth}
that.$element.addClass('in').attr('aria-hidden',false)
that.ajustPosition(position);that.enforceFocus()
var e=$.Event('shown.'+zuiname,{relatedTarget:_relatedTarget})
transition?that.$element.find('.modal-dialog').one('bsTransitionEnd',function(){that.$element.trigger('focus').trigger(e)}).emulateTransitionEnd(Modal.TRANSITION_DURATION):that.$element.trigger('focus').trigger(e)})}
Modal.prototype.hide=function(e){if(e)e.preventDefault()
e=$.Event('hide.'+zuiname)
this.$element.trigger(e)
if(!this.isShown||e.isDefaultPrevented())return
this.isShown=false
this.$body.removeClass('modal-open')
this.resetScrollbar()
this.escape()
$(document).off('focusin.'+zuiname)
this.$element.removeClass('in').attr('aria-hidden',true).off('click.dismiss.'+zuiname)
$.support.transition&&this.$element.hasClass('fade')?this.$element.one('bsTransitionEnd',$.proxy(this.hideModal,this)).emulateTransitionEnd(Modal.TRANSITION_DURATION):this.hideModal()}
Modal.prototype.enforceFocus=function(){$(document).off('focusin.'+zuiname).on('focusin.'+zuiname,$.proxy(function(e){if(this.$element[0]!==e.target&&!this.$element.has(e.target).length){this.$element.trigger('focus')}},this))}
Modal.prototype.escape=function(){if(this.isShown&&this.options.keyboard){$(document).on('keydown.dismiss.'+zuiname,$.proxy(function(e){if(e.which==27){var et=$.Event('escaping.'+zuiname)
var result=this.$element.triggerHandler(et,'esc')
if(result!=undefined&&(!result))return
this.hide()}},this))}else if(!this.isShown){$(document).off('keydown.dismiss.'+zuiname)}}
Modal.prototype.hideModal=function(){var that=this
if(that.$element.hasClass('custom'))this.$element.remove(); else	this.$element.hide();
this.backdrop(function(){that.$element.trigger('hidden.'+zuiname)})}
Modal.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove()
this.$backdrop=null}
Modal.prototype.backdrop=function(callback){var that=this
var animate=this.$element.hasClass('fade')?'fade':''
if(this.isShown&&this.options.backdrop){var doAnimate=$.support.transition&&animate
this.$backdrop=$('<div class="modal-backdrop '+animate+'" />').appendTo(this.$body)
this.$element.on('mousedown.dismiss.'+zuiname,$.proxy(function(e){if(e.target!==e.currentTarget)return
this.options.backdrop=='static'?this.$element[0].focus.call(this.$element[0]):this.hide.call(this)},this))
if(doAnimate)this.$backdrop[0].offsetWidth
this.$backdrop.addClass('in')
if(!callback)return
doAnimate?this.$backdrop.one('bsTransitionEnd',callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION):callback()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass('in')
var callbackRemove=function(){that.removeBackdrop()
callback&&callback()}
$.support.transition&&this.$element.hasClass('fade')?this.$backdrop.one('bsTransitionEnd',callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION):callbackRemove()}else if(callback){callback()}}
Modal.prototype.checkScrollbar=function(){if(document.body.clientWidth>=window.innerWidth)return
this.scrollbarWidth=this.scrollbarWidth||this.measureScrollbar()}
Modal.prototype.setScrollbar=function(){var bodyPad=parseInt((this.$body.css('padding-right')||0),10)
if(this.scrollbarWidth)this.$body.css('padding-right',bodyPad+this.scrollbarWidth)}
Modal.prototype.resetScrollbar=function(){this.$body.css('padding-right','')}
Modal.prototype.measureScrollbar=function(){var scrollDiv=document.createElement('div')
scrollDiv.className='modal-scrollbar-measure'
this.$body.append(scrollDiv)
var scrollbarWidth=scrollDiv.offsetWidth-scrollDiv.clientWidth
this.$body[0].removeChild(scrollDiv)
return scrollbarWidth}
function Plugin(option,_relatedTarget,position){return this.each(function(){var $this=$(this)
var data=$this.data(zuiname)
var options=$.extend({},Modal.DEFAULTS,$this.data(),typeof option=='object'&&option)
if(!data)$this.data(zuiname,(data=new Modal(this,options)))
if(typeof option=='string')data[option](_relatedTarget,position)
else if(options.show)data.show(_relatedTarget,position)})}
var old=$.fn.modal
$.fn.modal=Plugin
$.fn.modal.Constructor=Modal
$.fn.modal.noConflict=function(){$.fn.modal=old
return this}
$(document).on('click.'+zuiname+'.data-api','[data-toggle="modal"]',function(e){var $this=$(this)
var href=$this.attr('href')
var $target=null
try{$target=$($this.attr('data-target')||(href&&href.replace(/.*(?=#[^\s]+$)/,'')));}catch(ex){return}
if(!$target.length)return;var option=$target.data(zuiname)?'toggle':$.extend({remote:!/#/.test(href)&&href},$target.data(),$this.data())
if($this.is('a'))e.preventDefault()
$target.one('show.'+zuiname,function(showEvent){if(showEvent.isDefaultPrevented())return
$target.one('hidden.'+zuiname,function(){$this.is(':visible')&&$this.trigger('focus')})})
Plugin.call($target,option,this,$this.data('position'))})}();(function(){'use strict';if(!$.fn.modal)throw new Error('Modal trigger requires modal.js');var NAME='zui.modaltrigger',STR_AJAX='ajax',ZUI_MODAL='.zui.modal',STR_STRING='string';var ModalTrigger=function(options,$trigger){options=$.extend({},ModalTrigger.DEFAULTS,$.ModalTriggerDefaults,$trigger?$trigger.data():null,options);this.isShown;this.$trigger=$trigger;this.options=options;this.id=$.zui.uuid();};ModalTrigger.DEFAULTS={type:'custom',height:'auto',name:'triggerModal',fade:true,position:'fit',showHeader:true,delay:0,backdrop:true,keyboard:true,waittime:0,loadingIcon:'icon-spinner-indicator'};ModalTrigger.prototype.init=function(options){var that=this;if(options.url){if(!options.type||(options.type!=STR_AJAX&&options.type!='iframe')){options.type=STR_AJAX;}}
if(options.remote){options.type=STR_AJAX;if(typeof options.remote===STR_STRING)options.url=options.remote;}else if(options.iframe){options.type='iframe';if(typeof options.iframe===STR_STRING)options.url=options.iframe;}else if(options.custom){options.type='custom';if(typeof options.custom===STR_STRING){var $doms;try{$doms=$(options.custom);}catch(e){}
if($doms&&$doms.length){options.custom=$doms;}else if($.isFunction(window[options.custom])){options.custom=window[options.custom];}}}
var $modal=$('#'+options.name);if($modal.length){if(!that.isShown)$modal.off(ZUI_MODAL);$modal.remove();}
$modal=$('<div id="'+options.name+'" class="modal modal-trigger">'+(typeof options.loadingIcon==='string'&&options.loadingIcon.indexOf('icon-')===0?('<div class="icon icon-spin loader '+options.loadingIcon+'"></div>'):options.loadingIcon)+'<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button class="close" data-dismiss="modal">×</button><h4 class="modal-title"><i class="modal-icon"></i> <span class="modal-title-name"></span></h4></div><div class="modal-body"></div></div></div></div>').appendTo('body').data(NAME,that);var bindEvent=function(optonName,eventName){var handleFunc=options[optonName];if($.isFunction(handleFunc))$modal.on(eventName+ZUI_MODAL,handleFunc);};bindEvent('onShow','show');bindEvent('shown','shown');bindEvent('onHide','hide');bindEvent('hidden','hidden');bindEvent('loaded','loaded');$modal.on('shown'+ZUI_MODAL,function(){that.isShown=true;}).on('hidden'+ZUI_MODAL,function(){that.isShown=false;});this.$modal=$modal;this.$dialog=$modal.find('.modal-dialog');if(options.mergeOptions)this.options=options;};ModalTrigger.prototype.show=function(option){var options=$.extend({},this.options,{url:this.$trigger?(this.$trigger.attr('href')||this.$trigger.attr('data-url')||this.$trigger.data('url')):this.options.url},option);this.init(options);var that=this,$modal=this.$modal,$dialog=this.$dialog,custom=options.custom;var $body=$dialog.find('.modal-body').css('padding',''),$header=$dialog.find('.modal-header'),$content=$dialog.find('.modal-content');$modal.toggleClass('fade',options.fade).addClass(options.cssClass).toggleClass('modal-loading',!this.isShown);$dialog.toggleClass('modal-md',options.size==='md').toggleClass('modal-sm',options.size==='sm').toggleClass('modal-lg',options.size==='lg').toggleClass('modal-fullscreen',options.size==='fullscreen');$header.toggle(options.showHeader);$header.find('.modal-icon').attr('class','modal-icon icon-'+options.icon);$header.find('.modal-title-name').html(options.title||'');if(options.size&&options.size==='fullscreen'){options.width='';options.height='';}
var resizeDialog=function(){clearTimeout(this.resizeTask);this.resizeTask=setTimeout(function(){that.ajustPosition();},100);};var readyToShow=function(delay,callback){if(typeof delay==='undefined')delay=options.delay;return setTimeout(function(){$dialog=$modal.find('.modal-dialog');if(options.width&&options.width!='auto'){$dialog.css('width',options.width);}
if(options.height&&options.height!='auto'){$dialog.css('height',options.height);if(options.type==='iframe')$body.css('height',$dialog.height()-$header.outerHeight());}
that.ajustPosition(options.position);$modal.removeClass('modal-loading');if(options.type!='iframe'){$dialog.off('resize.'+NAME).on('resize.'+NAME,resizeDialog);}
callback&&callback();},delay);};if(options.type==='custom'&&custom){if($.isFunction(custom)){var customContent=custom({modal:$modal,options:options,modalTrigger:that,ready:readyToShow});if(typeof customContent===STR_STRING){$body.html(customContent);readyToShow();}}else if(custom instanceof $){$body.html($('<div>').append(custom.clone()).html());readyToShow();}else{$body.html(custom);readyToShow();}}else if(options.url){var onLoadBroken=function(){var brokenContent=$modal.callEvent('broken'+ZUI_MODAL,that,that);if(brokenContent){$body.html(typeof(brokenContent)=='object'?'加载超时，请检查网络或联系管理员.':brokenContent);console && console.error("页面加载超时：",brokenContent);}else{$body.html('加载超时，请检查网络或联系管理员.');}};$modal.attr('ref',options.url);if(options.type==='iframe'){$modal.addClass('modal-iframe');this.firstLoad=true;var iframeName='iframe-'+options.name;$header.detach();$body.detach();$content.empty().append($header).append($body);$body.css('padding',0).html('<iframe id="'+iframeName+'" name="'+iframeName+'" src="'+options.url+'" frameborder="no"  allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"  allowtransparency="true" scrolling="auto" style="width: 100%; height: 100%; left: 0px;"></iframe>');if(options.waittime>0){that.waitTimeout=readyToShow(options.waittime,onLoadBroken);}
var frame=document.getElementById(iframeName);frame.onload=frame.onreadystatechange=function(){if(that.firstLoad)$modal.addClass('modal-loading');if(this.readyState&&this.readyState!='complete')return;that.firstLoad=false;if(options.waittime>0){clearTimeout(that.waitTimeout);}
try{$modal.attr('ref',frame.contentWindow.location.href);var frame$=window.frames[iframeName].$;if(frame$&&options.height==='auto'&&options.size!='fullscreen'){var $framebody=frame$('body').addClass('body-modal');if(options.iframeBodyClass)$framebody.addClass(options.iframeBodyClass);var ajustFrameSize=function(check){$modal.removeClass('fade');var height=$framebody.outerHeight();if(check===true&&options.onlyIncreaseHeight){height=Math.max(height,$body.data('minModalHeight')||0);$body.data('minModalHeight',height);}
$body.css('height',height);if(options.fade)$modal.addClass('fade');readyToShow();};$modal.callEvent('loaded'+ZUI_MODAL,{modalType:'iframe',jQuery:frame$},null);setTimeout(ajustFrameSize,100);$framebody.off('resize.'+NAME).on('resize.'+NAME,resizeDialog);}else{readyToShow();}
frame$.extend({closeModal:window.closeModal});}catch(e){readyToShow();}};}else{$.get(options.url,function(data){try{var $data=$(data);if($data.hasClass('modal-dialog')){$dialog.replaceWith($data);}else if($data.hasClass('modal-content')){$dialog.find('.modal-content').replaceWith($data);}else{$body.wrapInner($data);}}catch(e){$modal.html(data);}
$modal.callEvent('loaded'+ZUI_MODAL,{modalType:STR_AJAX},that);readyToShow();}).error(onLoadBroken);}}
$modal.modal({show:'show',backdrop:options.backdrop,moveable:options.moveable,keyboard:options.keyboard});};ModalTrigger.prototype.close=function(callback,redirect){if(callback||redirect){this.$modal.on('hidden'+ZUI_MODAL,function(){if($.isFunction(callback))callback();if(typeof redirect===STR_STRING){if(redirect==='this')window.location.reload();else window.location=redirect;}});}
this.$modal.modal('hide');};ModalTrigger.prototype.toggle=function(options){if(this.isShown)this.close();else this.show(options);};ModalTrigger.prototype.ajustPosition=function(position){this.$modal.modal('ajustPosition',position||this.options.position);};$.zui({ModalTrigger:ModalTrigger,modalTrigger:new ModalTrigger()});$.fn.modalTrigger=function(option,settings){return $(this).each(function(){var $this=$(this);var data=$this.data(NAME),options=$.extend({title:$this.attr('title')||$this.text(),url:$this.attr('href'),type:$this.hasClass('iframe')?'iframe':''},$this.data(),$.isPlainObject(option)&&option);if(!data)$this.data(NAME,(data=new ModalTrigger(options,$this)));if(typeof option==STR_STRING)data[option](settings);else if(options.show)data.show(settings);$this.on((options.trigger||'click')+'.toggle.'+NAME,function(e){data.toggle(options);if($this.is('a'))e.preventDefault();});});};var old=$.fn.modal;$.fn.modal=function(option,settings){return $(this).each(function(){var $this=$(this);if($this.hasClass('modal'))old.call($this,option,settings);else $this.modalTrigger(option,settings);});};var getModal=function(modal){var modalType=typeof(modal);if(modalType==='undefined'){modal=$('.modal.modal-trigger');}else if(modalType===STR_STRING){modal=$(modal);}
if(modal&&(modal instanceof $))return modal;return null;};var closeModal=function(modal,callback,redirect){if($.isFunction(modal)){var oldModal=redirect;redirect=callback;callback=modal;modal=oldModal;}
modal=getModal(modal);if(modal&&modal.length){modal.each(function(){$(this).data(NAME).close(callback,redirect);});}};var ajustModalPosition=function(position,modal){modal=getModal(modal);if(modal&&modal.length){modal.modal('ajustPosition',position);}};$.zui({closeModal:closeModal,ajustModalPosition:ajustModalPosition});$(document).on('click.'+NAME+'.data-api','[data-toggle="modal"]',function(e){var $this=$(this);var href=$this.attr('href');var $target=null;try{$target=$($this.attr('data-target')||(href&&href.replace(/.*(?=#[^\s]+$)/,'')));}catch(ex){}
if(!$target||!$target.length){if(!$this.data(NAME)){$this.modalTrigger({show:true,});}else{$this.trigger('.toggle.'+NAME);}}
if($this.is('a')){e.preventDefault();}});}());+function(){'use strict';var Tooltip=function(element,options){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null
this.init('tooltip',element,options)}
Tooltip.DEFAULTS={animation:true,placement:'top',selector:false,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:'hover focus',title:'',delay:0,html:false,container:false}
Tooltip.prototype.init=function(type,element,options){this.enabled=true
this.type=type
this.$element=$(element)
this.options=this.getOptions(options)
var triggers=this.options.trigger.split(' ')
for(var i=triggers.length;i--;){var trigger=triggers[i]
if(trigger=='click'){this.$element.on('click.'+this.type,this.options.selector,$.proxy(this.toggle,this))}else if(trigger!='manual'){var eventIn=trigger=='hover'?'mouseenter':'focus'
var eventOut=trigger=='hover'?'mouseleave':'blur'
this.$element.on(eventIn+'.'+this.type,this.options.selector,$.proxy(this.enter,this))
this.$element.on(eventOut+'.'+this.type,this.options.selector,$.proxy(this.leave,this))}}
this.options.selector?(this._options=$.extend({},this.options,{trigger:'manual',selector:''})):this.fixTitle()}
Tooltip.prototype.getDefaults=function(){return Tooltip.DEFAULTS}
Tooltip.prototype.getOptions=function(options){options=$.extend({},this.getDefaults(),this.$element.data(),options)
if(options.delay&&typeof options.delay=='number'){options.delay={show:options.delay,hide:options.delay}}
return options}
Tooltip.prototype.getDelegateOptions=function(){var options={}
var defaults=this.getDefaults()
this._options&&$.each(this._options,function(key,value){if(defaults[key]!=value)options[key]=value})
return options}
Tooltip.prototype.enter=function(obj){var self=obj instanceof this.constructor?obj:$(obj.currentTarget)[this.type](this.getDelegateOptions()).data('zui.'+this.type)
clearTimeout(self.timeout)
self.hoverState='in'
if(!self.options.delay||!self.options.delay.show)return self.show()
self.timeout=setTimeout(function(){if(self.hoverState=='in')self.show()},self.options.delay.show)}
Tooltip.prototype.leave=function(obj){var self=obj instanceof this.constructor?obj:$(obj.currentTarget)[this.type](this.getDelegateOptions()).data('zui.'+this.type)
clearTimeout(self.timeout)
self.hoverState='out'
if(!self.options.delay||!self.options.delay.hide)return self.hide()
self.timeout=setTimeout(function(){if(self.hoverState=='out')self.hide()},self.options.delay.hide)}
Tooltip.prototype.show=function(content){var e=$.Event('show.zui.'+this.type)
if((content||this.hasContent())&&this.enabled){this.$element.trigger(e)
if(e.isDefaultPrevented())return
var $tip=this.tip()
this.setContent(content)
if(this.options.animation)$tip.addClass('fade')
var placement=typeof this.options.placement=='function'?this.options.placement.call(this,$tip[0],this.$element[0]):this.options.placement
var autoToken=/\s?auto?\s?/i
var autoPlace=autoToken.test(placement)
if(autoPlace)placement=placement.replace(autoToken,'')||'top'
$tip.detach().css({top:0,left:0,display:'block'}).addClass(placement)
this.options.container?$tip.appendTo(this.options.container):$tip.insertAfter(this.$element)
var pos=this.getPosition()
var actualWidth=$tip[0].offsetWidth
var actualHeight=$tip[0].offsetHeight
if(autoPlace){var $parent=this.$element.parent()
var orgPlacement=placement
var docScroll=document.documentElement.scrollTop||document.body.scrollTop
var parentWidth=this.options.container=='body'?window.innerWidth:$parent.outerWidth()
var parentHeight=this.options.container=='body'?window.innerHeight:$parent.outerHeight()
var parentLeft=this.options.container=='body'?0:$parent.offset().left
placement=placement=='bottom'&&pos.top+pos.height+actualHeight-docScroll>parentHeight?'top':placement=='top'&&pos.top-docScroll-actualHeight<0?'bottom':placement=='right'&&pos.right+actualWidth>parentWidth?'left':placement=='left'&&pos.left-actualWidth<parentLeft?'right':placement
$tip.removeClass(orgPlacement).addClass(placement)}
var calculatedOffset=this.getCalculatedOffset(placement,pos,actualWidth,actualHeight)
this.applyPlacement(calculatedOffset,placement)
this.$element.trigger('shown.zui.'+this.type)}}
Tooltip.prototype.applyPlacement=function(offset,placement){var replace
var $tip=this.tip()
var width=$tip[0].offsetWidth
var height=$tip[0].offsetHeight
var marginTop=parseInt($tip.css('margin-top'),10)
var marginLeft=parseInt($tip.css('margin-left'),10)
if(isNaN(marginTop))marginTop=0
if(isNaN(marginLeft))marginLeft=0
offset.top=offset.top+marginTop
offset.left=offset.left+marginLeft
$tip.offset(offset).addClass('in')
var actualWidth=$tip[0].offsetWidth
var actualHeight=$tip[0].offsetHeight
if(placement=='top'&&actualHeight!=height){replace=true
offset.top=offset.top+height-actualHeight}
if(/bottom|top/.test(placement)){var delta=0
if(offset.left<0){delta=offset.left*-2
offset.left=0
$tip.offset(offset)
actualWidth=$tip[0].offsetWidth
actualHeight=$tip[0].offsetHeight}
this.replaceArrow(delta-width+actualWidth,actualWidth,'left')}else{this.replaceArrow(actualHeight-height,actualHeight,'top')}
if(replace)$tip.offset(offset)}
Tooltip.prototype.replaceArrow=function(delta,dimension,position){this.arrow().css(position,delta?(50*(1-delta/dimension)+"%"):'')}
Tooltip.prototype.setContent=function(content){var $tip=this.tip()
var title=content||this.getTitle()
if(this.options.tipId)$tip.attr('id',this.options.tipId)
if(this.options.tipClass)$tip.addClass(this.options.tipClass)
$tip.find('.tooltip-inner')[this.options.html?'html':'text'](title)
$tip.removeClass('fade in top bottom left right')}
Tooltip.prototype.hide=function(){var that=this
var $tip=this.tip()
var e=$.Event('hide.zui.'+this.type)
function complete(){if(that.hoverState!='in')$tip.detach()}
this.$element.trigger(e)
if(e.isDefaultPrevented())return
$tip.removeClass('in')
$.support.transition&&this.$tip.hasClass('fade')?$tip.one($.support.transition.end,complete).emulateTransitionEnd(150):complete()
this.$element.trigger('hidden.zui.'+this.type)
return this}
Tooltip.prototype.fixTitle=function(){var $e=this.$element
if($e.attr('title')||typeof($e.attr('data-original-title'))!='string'){$e.attr('data-original-title',$e.attr('title')||'').attr('title','')}}
Tooltip.prototype.hasContent=function(){return this.getTitle()}
Tooltip.prototype.getPosition=function(){var el=this.$element[0]
return $.extend({},(typeof el.getBoundingClientRect=='function')?el.getBoundingClientRect():{width:el.offsetWidth,height:el.offsetHeight},this.$element.offset())}
Tooltip.prototype.getCalculatedOffset=function(placement,pos,actualWidth,actualHeight){return placement=='bottom'?{top:pos.top+pos.height,left:pos.left+pos.width/2-actualWidth/2}:placement=='top'?{top:pos.top-actualHeight,left:pos.left+pos.width/2-actualWidth/2}:placement=='left'?{top:pos.top+pos.height/2-actualHeight/2,left:pos.left-actualWidth}:{top:pos.top+pos.height/2-actualHeight/2,left:pos.left+pos.width}}
Tooltip.prototype.getTitle=function(){var title
var $e=this.$element
var o=this.options
title=$e.attr('data-original-title')||(typeof o.title=='function'?o.title.call($e[0]):o.title)
return title}
Tooltip.prototype.tip=function(){return this.$tip=this.$tip||$(this.options.template)}
Tooltip.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find('.tooltip-arrow')}
Tooltip.prototype.validate=function(){if(!this.$element[0].parentNode){this.hide()
this.$element=null
this.options=null}}
Tooltip.prototype.enable=function(){this.enabled=true}
Tooltip.prototype.disable=function(){this.enabled=false}
Tooltip.prototype.toggleEnabled=function(){this.enabled=!this.enabled}
Tooltip.prototype.toggle=function(e){var self=e?$(e.currentTarget)[this.type](this.getDelegateOptions()).data('zui.'+this.type):this
self.tip().hasClass('in')?self.leave(self):self.enter(self)}
Tooltip.prototype.destroy=function(){this.hide().$element.off('.'+this.type).removeData('zui.'+this.type)}
var old=$.fn.tooltip
$.fn.tooltip=function(option,params){return this.each(function(){var $this=$(this)
var data=$this.data('zui.tooltip')
var options=typeof option=='object'&&option
if(!data)$this.data('zui.tooltip',(data=new Tooltip(this,options)))
if(typeof option=='string')data[option](params)})}
$.fn.tooltip.Constructor=Tooltip
$.fn.tooltip.noConflict=function(){$.fn.tooltip=old
return this}}();+function(){'use strict';var Popover=function(element,options){this.init('popover',element,options)}
if(!$.fn.tooltip)throw new Error('Popover requires tooltip.js')
Popover.DEFAULTS=$.extend({},$.fn.tooltip.Constructor.DEFAULTS,{placement:'right',trigger:'click',content:'',template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'})
Popover.prototype=$.extend({},$.fn.tooltip.Constructor.prototype)
Popover.prototype.constructor=Popover
Popover.prototype.getDefaults=function(){return Popover.DEFAULTS}
Popover.prototype.setContent=function(){var $tip=this.tip()
var target=this.getTarget()
if(target){if(target.find('.arrow').length<1)
$tip.addClass('no-arrow')
$tip.html(target.html())
return}
var title=this.getTitle()
var content=this.getContent()
$tip.find('.popover-title')[this.options.html?'html':'text'](title)
$tip.find('.popover-content')[this.options.html?'html':'text'](content)
$tip.removeClass('fade top bottom left right in')
if(this.options.tipId)$tip.attr('id',this.options.tipId)
if(this.options.tipClass)$tip.addClass(this.options.tipClass)
if(!$tip.find('.popover-title').html())$tip.find('.popover-title').hide()}
Popover.prototype.hasContent=function(){return this.getTarget()||this.getTitle()||this.getContent()}
Popover.prototype.getContent=function(){var $e=this.$element
var o=this.options
return $e.attr('data-content')||(typeof o.content=='function'?o.content.call($e[0]):o.content)}
Popover.prototype.getTarget=function(){var $e=this.$element
var o=this.options
var target=$e.attr('data-target')||(typeof o.target=='function'?o.target.call($e[0]):o.target)
return(target&&true)?(target=='$next'?$e.next('.popover'):$(target)):false}
Popover.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find('.arrow')}
Popover.prototype.tip=function(){if(!this.$tip)this.$tip=$(this.options.template)
return this.$tip}
var old=$.fn.popover
$.fn.popover=function(option){return this.each(function(){var $this=$(this)
var data=$this.data('zui.popover')
var options=typeof option=='object'&&option
if(!data)$this.data('zui.popover',(data=new Popover(this,options)))
if(typeof option=='string')data[option]()})}
$.fn.popover.Constructor=Popover
$.fn.popover.noConflict=function(){$.fn.popover=old
return this}}();+function(){'use strict';var zuiname='zui.dropdown';var backdrop='.dropdown-backdrop'
var toggle='[data-toggle=dropdown]'
var Dropdown=function(element){var $el=$(element).on('click.'+zuiname,this.toggle)}
Dropdown.prototype.toggle=function(e){var $this=$(this)
if($this.is('.disabled, :disabled'))return
var $parent=getParent($this)
var isActive=$parent.hasClass('open')
clearMenus()
if(!isActive){if('ontouchstart'in document.documentElement&&!$parent.closest('.navbar-nav').length){$('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click',clearMenus)}
$parent.trigger(e=$.Event('show.'+zuiname))
if(e.isDefaultPrevented())return
$parent.toggleClass('open').trigger('shown.'+zuiname)
$this.focus()}
return false}
Dropdown.prototype.keydown=function(e){if(!/(38|40|27)/.test(e.keyCode))return
var $this=$(this)
e.preventDefault()
e.stopPropagation()
if($this.is('.disabled, :disabled'))return
var $parent=getParent($this)
var isActive=$parent.hasClass('open')
if(!isActive||(isActive&&e.keyCode==27)){if(e.which==27)$parent.find(toggle).focus()
return $this.click()}
var $items=$('[role=menu] li:not(.divider):visible a',$parent)
if(!$items.length)return
var index=$items.index($items.filter(':focus'))
if(e.keyCode==38&&index>0)index--
if(e.keyCode==40&&index<$items.length-1)index++
if(!~index)index=0
$items.eq(index).focus()}
function clearMenus(){$(backdrop).remove()
$(toggle).each(function(e){var $parent=getParent($(this))
if(!$parent.hasClass('open'))return
$parent.trigger(e=$.Event('hide.'+zuiname))
if(e.isDefaultPrevented())return
$parent.removeClass('open').trigger('hidden.'+zuiname)})}
function getParent($this){var selector=$this.attr('data-target')
if(!selector){selector=$this.attr('href')
selector=selector&&/#/.test(selector)&&selector.replace(/.*(?=#[^\s]*$)/,'')}
var $parent;try{$parent=selector&&$(selector);}catch(e){}
return $parent&&$parent.length?$parent:$this.parent()}
var old=$.fn.dropdown
$.fn.dropdown=function(option){return this.each(function(){var $this=$(this)
var data=$this.data('dropdown')
if(!data)$this.data('dropdown',(data=new Dropdown(this)))
if(typeof option=='string')data[option].call($this)})}
$.fn.dropdown.Constructor=Dropdown
$.fn.dropdown.noConflict=function(){$.fn.dropdown=old
return this}
var apiName=zuiname+'.data-api'
$(document).on('click.'+apiName,clearMenus).on('click.'+apiName,'.dropdown form',function(e){e.stopPropagation()}).on('click.'+apiName,toggle,Dropdown.prototype.toggle).on('keydown.'+apiName,toggle+', [role=menu]',Dropdown.prototype.keydown)}();+function(){'use strict';var Carousel=function(element,options){this.$element=$(element)
this.$indicators=this.$element.find('.carousel-indicators')
this.options=options
this.paused=this.sliding=this.interval=this.$active=this.$items=null
this.options.pause=='hover'&&this.$element.on('mouseenter',$.proxy(this.pause,this)).on('mouseleave',$.proxy(this.cycle,this))}
Carousel.DEFAULTS={interval:5000,pause:'hover',wrap:true,touchable:true}
Carousel.prototype.touchable=function(){if(!this.options.touchable)return;this.$element.on('touchstart touchmove touchend',touch);var touchStartX,touchStartY;var that=this;function touch(event){var event=event||window.event;if(event.originalEvent)event=event.originalEvent;var carousel=$(this);switch(event.type){case"touchstart":touchStartX=event.touches[0].pageX;touchStartY=event.touches[0].pageY;break;case"touchend":var distanceX=event.changedTouches[0].pageX-touchStartX;var distanceY=event.changedTouches[0].pageY-touchStartY;if(Math.abs(distanceX)>Math.abs(distanceY)){handleCarousel(carousel,distanceX);if(Math.abs(distanceX)>10){event.preventDefault();}}else{var $w=$(window);$('body,html').animate({scrollTop:$w.scrollTop()-distanceY},400)}
break;}}
function handleCarousel(carousel,distance){if(distance>10)that.prev();else if(distance<-10)that.next();}}
Carousel.prototype.cycle=function(e){e||(this.paused=false)
this.interval&&clearInterval(this.interval)
this.options.interval&&!this.paused&&(this.interval=setInterval($.proxy(this.next,this),this.options.interval))
return this}
Carousel.prototype.getActiveIndex=function(){this.$active=this.$element.find('.item.active')
this.$items=this.$active.parent().children()
return this.$items.index(this.$active)}
Carousel.prototype.to=function(pos){var that=this
var activeIndex=this.getActiveIndex()
if(pos>(this.$items.length-1)||pos<0)return
if(this.sliding)return this.$element.one('slid',function(){that.to(pos)})
if(activeIndex==pos)return this.pause().cycle()
return this.slide(pos>activeIndex?'next':'prev',$(this.$items[pos]))}
Carousel.prototype.pause=function(e){e||(this.paused=true)
if(this.$element.find('.next, .prev').length&&$.support.transition.end){this.$element.trigger($.support.transition.end)
this.cycle(true)}
this.interval=clearInterval(this.interval)
return this}
Carousel.prototype.next=function(){if(this.sliding)return
return this.slide('next')}
Carousel.prototype.prev=function(){if(this.sliding)return
return this.slide('prev')}
Carousel.prototype.slide=function(type,next){var $active=this.$element.find('.item.active')
var $next=next||$active[type]()
var isCycling=this.interval
var direction=type=='next'?'left':'right'
var fallback=type=='next'?'first':'last'
var that=this
if(!$next.length){if(!this.options.wrap)return
$next=this.$element.find('.item')[fallback]()}
this.sliding=true
isCycling&&this.pause()
var e=$.Event('slide.zui.carousel',{relatedTarget:$next[0],direction:direction})
if($next.hasClass('active'))return
if(this.$indicators.length){this.$indicators.find('.active').removeClass('active')
this.$element.one('slid',function(){var $nextIndicator=$(that.$indicators.children()[that.getActiveIndex()])
$nextIndicator&&$nextIndicator.addClass('active')})}
if($.support.transition&&this.$element.hasClass('slide')){this.$element.trigger(e)
if(e.isDefaultPrevented())return
$next.addClass(type)
$next[0].offsetWidth
$active.addClass(direction)
$next.addClass(direction)
$active.one($.support.transition.end,function(){$next.removeClass([type,direction].join(' ')).addClass('active')
$active.removeClass(['active',direction].join(' '))
that.sliding=false
setTimeout(function(){that.$element.trigger('slid')},0)}).emulateTransitionEnd(600)}else{this.$element.trigger(e)
if(e.isDefaultPrevented())return
$active.removeClass('active')
$next.addClass('active')
this.sliding=false
this.$element.trigger('slid')}
isCycling&&this.cycle()
return this}
var old=$.fn.carousel
$.fn.carousel=function(option){return this.each(function(){var $this=$(this)
var data=$this.data('zui.carousel')
var options=$.extend({},Carousel.DEFAULTS,$this.data(),typeof option=='object'&&option)
var action=typeof option=='string'?option:options.slide
if(!data)$this.data('zui.carousel',(data=new Carousel(this,options)))
if(typeof option=='number')data.to(option)
else if(action)data[action]()
else if(options.interval)data.pause().cycle()
if(options.touchable)data.touchable()})}
$.fn.carousel.Constructor=Carousel
$.fn.carousel.noConflict=function(){$.fn.carousel=old
return this}
$(document).on('click.zui.carousel.data-api','[data-slide], [data-slide-to]',function(e){var $this=$(this),href
var $target=$($this.attr('data-target')||(href=$this.attr('href'))&&href.replace(/.*(?=#[^\s]+$)/,''))
var options=$.extend({},$target.data(),$this.data())
var slideIndex=$this.attr('data-slide-to')
if(slideIndex)options.interval=false
$target.carousel(options)
if(slideIndex=$this.attr('data-slide-to')){$target.data('zui.carousel').to(slideIndex)}
e.preventDefault()})
$(window).on('load',function(){$('[data-ride="carousel"]').each(function(){var $carousel=$(this)
$carousel.carousel($carousel.data())})})}();(function(){'use strict';$.zui.imgReady=(function(){var list=[],intervalId=null,tick=function(){var i=0;for(;i<list.length;i++){list[i].end?list.splice(i--,1):list[i]();}!list.length&&stop();},stop=function(){clearInterval(intervalId);intervalId=null;};return function(url,ready,load,error){var onready,width,height,newWidth,newHeight,img=new Image();img.src=url;if(img.complete){ready.call(img);load&&load.call(img);return;}
width=img.width;height=img.height;img.onerror=function(){error&&error.call(img);onready.end=true;img=img.onload=img.onerror=null;};onready=function(){newWidth=img.width;newHeight=img.height;if(newWidth!==width||newHeight!==height||newWidth*newHeight>1024){ready.call(img);onready.end=true;}};onready();img.onload=function(){!onready.end&&onready();load&&load.call(img);img=img.onload=img.onerror=null;};if(!onready.end){list.push(onready);if(intervalId===null)intervalId=setInterval(tick,40);}};})();}());(function(){'use strict';if(!$.fn.modalTrigger)throw new Error('modal & modalTrigger requires for lightbox');if(!$.zui.imgReady)throw new Error('imgReady requires for lightbox');var Lightbox=function(element,options){this.$=$(element);this.options=this.getOptions(options);this.init();};Lightbox.DEFAULTS={modalTeamplate:'<div class="icon-spinner icon-spin loader"></div><div class="modal-dialog"><button class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button><button class="controller prev"><i class="icon icon-chevron-left"></i></button><button class="controller next"><i class="icon icon-chevron-right"></i></button><img class="lightbox-img" src="{image}" alt="" data-dismiss="modal" /><div class="caption"><div class="content">{caption}<div></div></div>'};Lightbox.prototype.getOptions=function(options){var IMAGE='image';options=$.extend({},Lightbox.DEFAULTS,this.$.data(),options);if(!options[IMAGE]){options[IMAGE]=this.$.attr('src')||this.$.attr('href')||this.$.find('img').attr('src');this.$.data(IMAGE,options[IMAGE]);}
return options;};Lightbox.prototype.init=function(){this.bindEvents();};Lightbox.prototype.initGroups=function(){var groups=this.$.data('groups');if(!groups){groups=$('[data-toggle="lightbox"][data-group="'+this.options.group+'"], [data-lightbox-group="'+this.options.group+'"]');this.$.data('groups',groups);groups.each(function(index){$(this).attr('data-group-index',index);});}
this.groups=groups;this.groupIndex=parseInt(this.$.data('group-index'));};Lightbox.prototype.bindEvents=function(){var $e=this.$,that=this;var options=this.options;if(!options.image)return false;$e.modalTrigger({type:'custom',name:'lightboxModal',position:'center',custom:function(e){that.initGroups();var modal=e.modal,groups=that.groups,groupIndex=that.groupIndex;modal.addClass('modal-lightbox').html(options.modalTeamplate.format(options)).toggleClass('lightbox-with-caption',typeof options.caption=='string').removeClass('lightbox-full').data('group-index',groupIndex);var dialog=modal.find('.modal-dialog'),winWidth=$(window).width();$.zui.imgReady(options.image,function(){dialog.css({width:Math.min(winWidth,this.width)});if(winWidth<(this.width+30))modal.addClass('lightbox-full');e.ready(200);});modal.find('.prev').toggleClass('show',groups.filter('[data-group-index="'+(groupIndex-1)+'"]').length>0);modal.find('.next').toggleClass('show',groups.filter('[data-group-index="'+(groupIndex+1)+'"]').length>0);modal.find('.controller').click(function(){var $this=$(this);var id=modal.data('group-index')+($this.hasClass('prev')?-1:1);var $e=groups.filter('[data-group-index="'+id+'"]');if($e.length){var image=$e.data('image'),caption=$e.data('caption');modal.addClass('modal-loading').data('group-index',id).toggleClass('lightbox-with-caption',typeof caption=='string').removeClass('lightbox-full');modal.find('.lightbox-img').attr('src',image);modal.find('.caption > .content').text(caption);winWidth=$(window).width();$.zui.imgReady(image,function(){dialog.css({width:Math.min(winWidth,this.width)});if(winWidth<(this.width+30))modal.addClass('lightbox-full');e.ready();});}
modal.find('.prev').toggleClass('show',groups.filter('[data-group-index="'+(id-1)+'"]').length>0);modal.find('.next').toggleClass('show',groups.filter('[data-group-index="'+(id+1)+'"]').length>0);return false;});}});};$.fn.lightbox=function(option){var defaultGroup='group'+(new Date()).getTime();return this.each(function(){var $this=$(this);var options=typeof option=='object'&&option;if(typeof options=='object'&&options.group){$this.attr('data-lightbox-group',options.group);}else if($this.data('group')){$this.attr('data-lightbox-group',$this.data('group'));}else{$this.attr('data-lightbox-group',defaultGroup);}
$this.data('group',$this.data('lightbox-group'));var data=$this.data('zui.lightbox');if(!data)$this.data('zui.lightbox',(data=new Lightbox(this,options)));if(typeof option=='string')data[option]();});};$.fn.lightbox.Constructor=Lightbox;$(function(){$('[data-toggle="lightbox"]').lightbox();});}());(function(){'use strict';var id=0;var template='<div class="messager messager-{type} {placement}" style="display: none"><div class="messager-content"></div><div class="messager-actions"></div></div>';var defaultOptions={type:'default',placement:'top',time:2000,parent:'body',icon:null,close:true,fade:true,scale:true};var all={};var Messager=function(message,options){if($.isPlainObject(message)){options=message;message=options.message;}
var that=this;that.id=options.id||(id++);var oldMessager=all[that.id];if(oldMessager)oldMessager.destory();all[that.id]=that;options=that.options=$.extend({},defaultOptions,options);that.message=(options.icon?'<i class="icon-'+options.icon+' icon"></i> ':'')+message;that.$=$(template.format(options)).toggleClass('fade',options.fade).toggleClass('scale',options.scale).attr('id','messager-'+that.id);if(options.cssClass)that.$.addClass(options.cssClass);var hasCloseAction=false;var $actions=that.$.find('.messager-actions');var appendAction=function(action){var $btn=$('<button type="button" class="action action-'+action.name+'"/>');if(action.name==='close')$btn.addClass('close');if(action.html!==undefined){$btn.html(action.html);}
if(action.icon!==undefined){$btn.append('<i class="action-icon icon-'+action.icon+'"/>');}
if(action.text!==undefined){$btn.append('<span class="action-text">'+action.text+'</span>');}
if(action.tooltip!==undefined){$btn.attr('title',action.tooltip).tooltip();}
$btn.data('action',action);$actions.append($btn);};if(options.actions){$.each(options.actions,function(idx,action){if(action.name===undefined)action.name=idx;if(action.name=='close')hasCloseAction=true;appendAction(action);});}
if(!hasCloseAction&&options.close){appendAction({name:'close',html:'&times;'});}
that.$.on('click','.action',function(e){var action=$(this).data('action'),result;if(options.onAction){result=options.onAction.call(this,action.name,action,that);if(result===false)return;}
if($.isFunction(action.action)){result=action.action.call(this,that);if(result===false)return;}
that.hide();e.stopPropagation();});that.$.on('click',function(e){if(options.onAction){result=options.onAction.call(this,'content',null,that);if(result===true)that.hide();}});var $content=that.$.find('.messager-content').html(that.message);if(options.contentClass)$content.addClass(options.cssClass);that.$.data('zui.messager',that);if(options.show&&that.message!==undefined){that.show();}};Messager.prototype.update=function(message,newOptions){var that=this;var options=that.options;that.$.removeClass('messager-'+options.type);if(newOptions){options=$.extend(options,newOptions);}
that.$.addClass('messager-'+options.type);if(message){that.message=(options.icon?'<i class="icon-'+options.icon+' icon"></i> ':'')+message;that.$.find('.messager-content').html(that.message);}};Messager.prototype.show=function(message,callback){var that=this,options=this.options;if(that.isShow){that.hide(function(){that.show(message,callback);});return;}
if(that.hiding){clearTimeout(that.hiding);that.hiding=null;}
if($.isFunction(message)){var oldCallback=callback;callback=message;if(oldCallback!==undefined){message=oldCallback;}}
that.update(message);var placement=options.placement;var $parent=$(options.parent);var $holder=$parent.children('.messagers-holder.'+placement);if(!$holder.length){$holder=$('<div/>').attr('class','messagers-holder '+placement).appendTo($parent);}
$holder.append(that.$);if(placement==='center'){var offset=$(window).height()-$holder.height();$holder.css('top',Math.max(-offset,offset/2));}
that.$.show().addClass('in');if(options.time){that.hiding=setTimeout(function(){that.hide();},options.time);}
that.isShow=true;callback&&callback();return that;};Messager.prototype.hide=function(callback,immediately){if(callback===true){immediately=true;callback=null;}
var that=this;if(that.$.hasClass('in')){that.$.removeClass('in');var removeMessager=function(){var $parent=that.$.parent();that.$.detach();if(!$parent.children().length)$parent.remove();callback&&callback(true);};if(immediately)removeMessager();else setTimeout(removeMessager,200);}else{callback&&callback(false);}
that.isShow=false;};Messager.prototype.destory=function(){var that=this;that.hide(true);that.$.remove();that.$=null;delete all[that.id];};Messager.all=all;var hideMessage=function(){$('.messager').each(function(){var msg=$(this).data('zui.messager');if(msg&&msg.hide)msg.hide(true);});};var showMessage=function(message,options){if(typeof options==='string'){options={type:options};}
options=$.extend({},options);if(options.id===undefined)hideMessage();var msg=all[options.id]||new Messager(message,options);msg.show();return msg;};var getOptions=function(options){return(typeof options==='string')?{placement:options}:options;};var zuiMessager={show:showMessage,hide:hideMessage};$.each({primary:0,success:'ok-sign',info:'info-sign',warning:'warning-sign',danger:'exclamation-sign',important:0,special:0},function(name,icon){zuiMessager[name]=function(message,options){return showMessage(message,$.extend({type:name,icon:icon||null},getOptions(options)));};});$.zui({Messager:Messager,showMessager:showMessage,messager:zuiMessager});}());(function(){'use strict';var Menu=function(element,options){this.$=$(element);this.options=this.getOptions(options);this.init();};Menu.DEFAULTS={auto:false,foldicon:'icon-chevron-right'};Menu.prototype.getOptions=function(options){options=$.extend({},Menu.DEFAULTS,this.$.data(),options);return options;};Menu.prototype.init=function(){var children=this.$.children('.nav');children.find('.nav').closest('li').addClass('nav-parent');children.find('.nav > li.active').closest('li').addClass('active');children.find('.nav-parent > a').append('<i class="'+this.options.foldicon+' nav-parent-fold-icon"></i>');this.handleFold();};Menu.prototype.handleFold=function(){var auto=this.options.auto;var $menu=this.$;this.$.on('click','.nav-parent > a',function(event){if(auto){$menu.find('.nav-parent.show').find('.nav').slideUp(function(){$(this).closest('.nav-parent').removeClass('show');});$menu.find('.icon-rotate-90').removeClass('icon-rotate-90');}
var li=$(this).closest('.nav-parent');if(li.hasClass('show')){li.find('.icon-rotate-90').removeClass('icon-rotate-90');li.find('.nav').slideUp(function(){$(this).closest('.nav-parent').removeClass('show');});}else{li.find('.nav-parent-fold-icon').addClass('icon-rotate-90');li.find('.nav').slideDown(function(){$(this).closest('.nav-parent').addClass('show');});}
event.preventDefault();return false;});};$.fn.menu=function(option){return this.each(function(){var $this=$(this);var data=$this.data('zui.menu');var options=typeof option=='object'&&option;if(!data)$this.data('zui.menu',(data=new Menu(this,options)));if(typeof option=='string')data[option]();});};$.fn.menu.Constructor=Menu;$(function(){$('[data-toggle="menu"]').menu();});}());(function(){'use strict';var hexReg=/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,N255=255,N360=360,N100=100,STR_STRING='string',STR_OBJECT='object',namedColors={aliceblue:'#f0f8ff',antiquewhite:'#faebd7',aqua:'#00ffff',aquamarine:'#7fffd4',azure:'#f0ffff',beige:'#f5f5dc',bisque:'#ffe4c4',black:'#000000',blanchedalmond:'#ffebcd',blue:'#0000ff',blueviolet:'#8a2be2',brown:'#a52a2a',burlywood:'#deb887',cadetblue:'#5f9ea0',chartreuse:'#7fff00',chocolate:'#d2691e',coral:'#ff7f50',cornflowerblue:'#6495ed',cornsilk:'#fff8dc',crimson:'#dc143c',cyan:'#00ffff',darkblue:'#00008b',darkcyan:'#008b8b',darkgoldenrod:'#b8860b',darkgray:'#a9a9a9',darkgreen:'#006400',darkkhaki:'#bdb76b',darkmagenta:'#8b008b',darkolivegreen:'#556b2f',darkorange:'#ff8c00',darkorchid:'#9932cc',darkred:'#8b0000',darksalmon:'#e9967a',darkseagreen:'#8fbc8f',darkslateblue:'#483d8b',darkslategray:'#2f4f4f',darkturquoise:'#00ced1',darkviolet:'#9400d3',deeppink:'#ff1493',deepskyblue:'#00bfff',dimgray:'#696969',dodgerblue:'#1e90ff',firebrick:'#b22222',floralwhite:'#fffaf0',forestgreen:'#228b22',fuchsia:'#ff00ff',gainsboro:'#dcdcdc',ghostwhite:'#f8f8ff',gold:'#ffd700',goldenrod:'#daa520',gray:'#808080',green:'#008000',greenyellow:'#adff2f',honeydew:'#f0fff0',hotpink:'#ff69b4',indianred:'#cd5c5c',indigo:'#4b0082',ivory:'#fffff0',khaki:'#f0e68c',lavender:'#e6e6fa',lavenderblush:'#fff0f5',lawngreen:'#7cfc00',lemonchiffon:'#fffacd',lightblue:'#add8e6',lightcoral:'#f08080',lightcyan:'#e0ffff',lightgoldenrodyellow:'#fafad2',lightgray:'#d3d3d3',lightgreen:'#90ee90',lightpink:'#ffb6c1',lightsalmon:'#ffa07a',lightseagreen:'#20b2aa',lightskyblue:'#87cefa',lightslategray:'#778899',lightsteelblue:'#b0c4de',lightyellow:'#ffffe0',lime:'#00ff00',limegreen:'#32cd32',linen:'#faf0e6',magenta:'#ff00ff',maroon:'#800000',mediumaquamarine:'#66cdaa',mediumblue:'#0000cd',mediumorchid:'#ba55d3',mediumpurple:'#9370db',mediumseagreen:'#3cb371',mediumslateblue:'#7b68ee',mediumspringgreen:'#00fa9a',mediumturquoise:'#48d1cc',mediumvioletred:'#c71585',midnightblue:'#191970',mintcream:'#f5fffa',mistyrose:'#ffe4e1',moccasin:'#ffe4b5',navajowhite:'#ffdead',navy:'#000080',oldlace:'#fdf5e6',olive:'#808000',olivedrab:'#6b8e23',orange:'#ffa500',orangered:'#ff4500',orchid:'#da70d6',palegoldenrod:'#eee8aa',palegreen:'#98fb98',paleturquoise:'#afeeee',palevioletred:'#db7093',papayawhip:'#ffefd5',peachpuff:'#ffdab9',peru:'#cd853f',pink:'#ffc0cb',plum:'#dda0dd',powderblue:'#b0e0e6',purple:'#800080',red:'#ff0000',rosybrown:'#bc8f8f',royalblue:'#4169e1',saddlebrown:'#8b4513',salmon:'#fa8072',sandybrown:'#f4a460',seagreen:'#2e8b57',seashell:'#fff5ee',sienna:'#a0522d',silver:'#c0c0c0',skyblue:'#87ceeb',slateblue:'#6a5acd',slategray:'#708090',snow:'#fffafa',springgreen:'#00ff7f',steelblue:'#4682b4',tan:'#d2b48c',teal:'#008080',thistle:'#d8bfd8',tomato:'#ff6347',turquoise:'#40e0d0',violet:'#ee82ee',wheat:'#f5deb3',white:'#ffffff',whitesmoke:'#f5f5f5',yellow:'#ffff00',yellowgreen:'#9acd32'};var isUndefined=function(x){return x===undefined;};var isNotUndefined=function(x){return!isUndefined(x);};var convertToInt=function(x){return parseInt(x);};var convertToRgbInt=function(x){return convertToInt(clamp(number(x),N255));};var Color=function(r,g,b,a){var that=this;that.r=that.g=that.b=0;that.a=1;if(isNotUndefined(a))that.a=clamp(number(a),1);if(isNotUndefined(r)&&isNotUndefined(g)&&isNotUndefined(b)){that.r=convertToRgbInt(r);that.g=convertToRgbInt(g);that.b=convertToRgbInt(b);}else if(isNotUndefined(r)){var type=typeof(r);if(type==STR_STRING){r=r.toLowerCase();if(r==='transparent'){that.a=0;}else if(namedColors[r]){this.rgb(hexToRgb(namedColors[r]));}else{that.rgb(hexToRgb(r));}}else if(type=='number'&&isUndefined(g)){that.r=that.g=that.b=convertToRgbInt(r);}else if(type==STR_OBJECT&&isNotUndefined(r.r)){that.r=convertToRgbInt(r.r);if(isNotUndefined(r.g))that.g=convertToRgbInt(r.g);if(isNotUndefined(r.b))that.b=convertToRgbInt(r.b);if(isNotUndefined(r.a))that.a=clamp(number(r.a),1);}else if(type==STR_OBJECT&&isNotUndefined(r.h)){var hsl={h:clamp(number(r.h),N360),s:1,l:1,a:1};if(isNotUndefined(r.s))hsl.s=clamp(number(r.s),1);if(isNotUndefined(r.l))hsl.l=clamp(number(r.l),1);if(isNotUndefined(r.a))hsl.a=clamp(number(r.a),1);that.rgb(hslToRgb(hsl));}}};Color.prototype.rgb=function(rgb){var that=this;if(isNotUndefined(rgb)){if(typeof(rgb)==STR_OBJECT){if(isNotUndefined(rgb.r))that.r=convertToRgbInt(rgb.r);if(isNotUndefined(rgb.g))that.g=convertToRgbInt(rgb.g);if(isNotUndefined(rgb.b))that.b=convertToRgbInt(rgb.b);if(isNotUndefined(rgb.a))that.a=clamp(number(rgb.a),1);}else{var v=convertToInt(number(rgb));that.r=v;that.g=v;that.b=v;}
return that;}else return{r:that.r,g:that.g,b:that.b,a:that.a};};Color.prototype.hue=function(hue){var that=this;var hsl=that.toHsl();if(isUndefined(hue))return hsl.h;else{hsl.h=clamp(number(hue),N360);that.rgb(hslToRgb(hsl));return that;}};Color.prototype.darken=function(amount){var that=this;var hsl=that.toHsl();hsl.l-=amount/N100;hsl.l=clamp(hsl.l,1);that.rgb(hslToRgb(hsl));return that;};Color.prototype.clone=function(){var that=this;return new Color(that.r,that.g,that.b,that.a);};Color.prototype.lighten=function(amount){return this.darken(-amount);};Color.prototype.fade=function(amount){this.a=clamp(amount/N100,1);return this;};Color.prototype.spin=function(amount){var hsl=this.toHsl();var hue=(hsl.h+amount)%N360;hsl.h=hue<0?N360+hue:hue;return this.rgb(hslToRgb(hsl));};Color.prototype.toHsl=function(){var that=this;var r=that.r/N255,g=that.g/N255,b=that.b/N255,a=that.a;var max=Math.max(r,g,b),min=Math.min(r,g,b);var h,s,l=(max+min)/2,d=max-min;if(max===min){h=s=0;}else{s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
h/=6;}
return{h:h*N360,s:s,l:l,a:a};};Color.prototype.luma=function(){var r=this.r/N255,g=this.g/N255,b=this.b/N255;r=(r<=0.03928)?r/12.92:Math.pow(((r+0.055)/1.055),2.4);g=(g<=0.03928)?g/12.92:Math.pow(((g+0.055)/1.055),2.4);b=(b<=0.03928)?b/12.92:Math.pow(((b+0.055)/1.055),2.4);return 0.2126*r+0.7152*g+0.0722*b;};Color.prototype.saturate=function(amount){var hsl=this.toHsl();hsl.s+=amount/N100;hsl.s=clamp(hsl.s);return this.rgb(hslToRgb(hsl));};Color.prototype.desaturate=function(amount){return this.saturate(-amount);};Color.prototype.contrast=function(dark,light,threshold){if(isUndefined(light))light=new Color(N255,N255,N255,1);else light=new Color(light);if(isUndefined(dark))dark=new Color(0,0,0,1);else dark=new Color(dark);if(dark.luma()>light.luma()){var t=light;light=dark;dark=t;}
if(this.a<0.5)return dark;if(isUndefined(threshold))threshold=0.43;else threshold=number(threshold);if(this.luma()<threshold){return light;}else{return dark;}};Color.prototype.hexStr=function(){var r=this.r.toString(16),g=this.g.toString(16),b=this.b.toString(16);if(r.length==1)r='0'+r;if(g.length==1)g='0'+g;if(b.length==1)b='0'+b;return'#'+r+g+b;};Color.prototype.toCssStr=function(){var that=this;if(that.a>0){if(that.a<1){return'rgba('+that.r+','+that.g+','+that.b+','+that.a+')';}else{return that.hexStr();}}else{return'transparent';}};Color.isColor=isColor;Color.names=namedColors;function hexToRgb(hex){hex=hex.toLowerCase();if(hex&&hexReg.test(hex)){var i;if(hex.length===4){var hexNew='#';for(i=1;i<4;i+=1){hexNew+=hex.slice(i,i+1).concat(hex.slice(i,i+1));}
hex=hexNew;}
var hexChange=[];for(i=1;i<7;i+=2){hexChange.push(convertToInt('0x'+hex.slice(i,i+2)));}
return{r:hexChange[0],g:hexChange[1],b:hexChange[2],a:1};}else{throw new Error('Wrong hex string! (hex: '+hex+')');}}
function isColor(hex){return typeof(hex)===STR_STRING&&(hex.toLowerCase()==='transparent'||namedColors[hex.toLowerCase()]||hexReg.test($.trim(hex.toLowerCase())));}
function hslToRgb(hsl){var h=hsl.h,s=hsl.s,l=hsl.l,a=hsl.a;h=(number(h)%N360)/N360;s=clamp(number(s));l=clamp(number(l));a=clamp(number(a));var m2=l<=0.5?l*(s+1):l+s-l*s;var m1=l*2-m2;var r={r:hue(h+1/3)*N255,g:hue(h)*N255,b:hue(h-1/3)*N255,a:a};return r;function hue(h){h=h<0?h+1:(h>1?h-1:h);if(h*6<1){return m1+(m2-m1)*h*6;}else if(h*2<1){return m2;}else if(h*3<2){return m1+(m2-m1)*(2/3-h)*6;}else{return m1;}}}
function fit(n,end,start){if(isUndefined(start))start=0;if(isUndefined(end))end=N255;return Math.min(Math.max(n,start),end);}
function clamp(v,max){return fit(v,max);}
function number(n){if(typeof(n)=='number')return n;return parseFloat(n);}
$.zui({Color:Color});}());(function(){'use strict';var name='zui.tree';var globalId=0;var Tree=function(element,options){this.name=name;this.$=$(element);this.getOptions(options);this._init();};var DETAULT_ACTIONS={sort:{template:'<a class="sort-handler" href="javascript:;"><i class="icon icon-move"></i></a>'},add:{template:'<a href="javascript:;"><i class="icon icon-plus"></i></a>'},edit:{template:'<a href="javascript:;"><i class="icon icon-pencil"></i></a>'},"delete":{template:'<a href="javascript:;"><i class="icon icon-trash"></i></a>'}};function formatActions(actions,parentActions){if(actions===false)return actions;if(!actions)return parentActions;if(actions===true){actions={add:true,"delete":true,edit:true,sort:true};}else if(typeof actions==='string'){actions=actions.split(',');}
var _actions;if($.isArray(actions)){_actions={};$.each(actions,function(idx,action){if($.isPlainObject(action)){_actions[action.action]=action;}else{_actions[action]=true;}});actions=_actions;}
if($.isPlainObject(actions)){_actions={};$.each(actions,function(name,action){if(action){_actions[name]=$.extend({type:name},DETAULT_ACTIONS[name],$.isPlainObject(action)?action:null);}else{_actions[name]=false;}});actions=_actions;}
return parentActions?$.extend(true,{},parentActions,actions):actions;}
function createActionEle(action,name,template){name=name||action.type;return $(template||action.template).addClass('tree-action').attr($.extend({'data-type':name,title:action.title||''},action.attr)).data('action',action);}
Tree.DEFAULTS={animate:null,initialState:'normal',toggleTemplate:'<i class="list-toggle icon"></i>',};Tree.prototype.add=function(rootEle,items,expand,disabledAnimate,notStore){var $e=$(rootEle),$ul,options=this.options;if($e.is('li')){$ul=$e.children('ul');if(!$ul.length){$ul=$('<ul/>');$e.append($ul);this._initList($ul,$e);}}else{$ul=$e;}
if($ul){var that=this;if(!$.isArray(items)){items=[items];}
$.each(items,function(idx,item){var $li=$('<li/>').data(item).appendTo($ul);if(item.id!==undefined)$li.attr('data-id',item.id);var $wrapper=options.itemWrapper?$(options.itemWrapper===true?'<div class="tree-item-wrapper"/>':options.itemWrapper).appendTo($li):$li;if(item.html){$wrapper.html(item.html)}else if($.isFunction(that.options.itemCreator)){var itemContent=that.options.itemCreator($li,item);if(itemContent!==true&&itemContent!==false)$wrapper.html(itemContent);}else if(item.url){$wrapper.append($('<a/>',{href:item.url}).text(item.title||item.name));}else{$wrapper.append($('<span/>').text(item.title||item.name));}
that._initItem($li,item.idx||idx,$ul,item);if(item.children&&item.children.length){that.add($li,item.children);}});this._initList($ul);if(expand&&!$ul.hasClass('tree')){that.expand($ul.parent('li'),disabledAnimate,notStore);}}};Tree.prototype.reload=function(data){var that=this;if(data){that.$.empty();that.add(that.$,data);}
if(that.isPreserve)
{if(that.store.time){that.$.find('li:not(.tree-action-item)').each(function(){var $li=$(this);that[that.store[$li.data('id')]?'expand':'collapse']($li,true,true);});}}};Tree.prototype._initList=function($list,$parentItem,idx,data){var that=this;if(!$list.hasClass('tree')){$parentItem=($parentItem||$list.closest('li')).addClass('has-list');if(!$parentItem.find('.list-toggle').length){$parentItem.prepend(this.options.toggleTemplate);}
idx=idx||$parentItem.data('idx');}else{idx=0;$parentItem=null;}
$list.attr('data-idx',idx||0).children('li:not(.tree-action-item)').each(function(index){that._initItem($(this),index+1,$list);});data=data||($parentItem?$parentItem.data():null);var actions=formatActions(data?data.actions:null,this.actions);if(actions){if(actions.add&&actions.add.templateInList!==false){var $actionItem=$list.children('li.tree-action-item');if(!$actionItem.length){$('<li class="tree-action-item"/>').append(createActionEle(actions.add,'add',actions.add.templateInList)).appendTo($list);}else{$actionItem.detach().appendTo($list);}}
if(actions.sort){$list.sortable($.extend({dragCssClass:'tree-drag-holder',trigger:'.sort-handler',selector:'li:not(.tree-action-item)',finish:function(e){that.callEvent('action',{action:actions.sort,$list:$list,target:e.target,item:data});}},actions.sort.options,$.isPlainObject(this.options.sortable)?this.options.sortable:null));}}
if($parentItem&&($parentItem.hasClass('open')||(data&&data.open))){$parentItem.addClass('open in');}};Tree.prototype._initItem=function($item,idx,$parentList,data){if(idx===undefined){var $pre=$item.prev('li');idx=$pre.length?($pre.data('idx')+1):1;}
$parentList=$parentList||$item.closest('ul');$item.attr('data-idx',idx);if(!$item.data('id')){var id=idx;if(!$parentList.hasClass('tree')){id=$parentList.parent('li').data('id')+'-'+id;}
$item.attr('data-id',id);}
data=data||$item.data();var actions=formatActions(data.actions,this.actions);if(actions){var $actions=$item.find('.tree-actions');if(!$actions.length){$actions=$('<div class="tree-actions"/>').appendTo(this.options.itemWrapper?$item.find('.tree-item-wrapper'):$item);$.each(actions,function(actionName,action){if(action)$actions.append(createActionEle(action,actionName));});}}
var $children=$item.children('ul');if($children.length){this._initList($children,$item,idx,data);}};Tree.prototype._init=function(){var options=this.options,that=this;this.actions=formatActions(options.actions);this.$.addClass('tree');if(options.animate)this.$.addClass('tree-animate');this._initList(this.$);var initialState=options.initialState;var isPreserveEnable=$.zui&&$.zui.store&&$.zui.store.enable;if(isPreserveEnable){this.selector=name+'::'+(options.name||'')+'#'+(this.$.attr('id')||globalId++);this.store=$.zui.store[options.name?'get':'pageGet'](this.selector,{});}
if(initialState==='preserve'){if(isPreserveEnable)this.isPreserve=true;else this.options.initialState=initialState='normal';}
this.reload(options.data);if(isPreserveEnable)this.isPreserve=true;if(initialState==='expand'){this.expand();}else if(initialState==='collapse'){this.collapse();}
this.$.on('click','.list-toggle,a[href="#"],.tree-toggle',function(e){var $li=$(this).parent('li');that.callEvent('hit',{target:$li,item:$li.data()});that.toggle($li);e.preventDefault();}).on('click','.tree-action',function(){var $action=$(this);var action=$action.data();if(action.action)action=action.action;if(action.type==='sort')return;var $li=$action.closest('li:not(.tree-action-item)');that.callEvent('action',{action:action,target:this,$item:$li,item:$li.data()});});};Tree.prototype.preserve=function($li,id,expand){if(!this.isPreserve)return;if($li){id=id||$li.data('id');expand=expand===undefined?$li.hasClass('open'):false;if(expand)this.store[id]=expand;else delete this.store[id];this.store.time=new Date().getTime();$.zui.store[this.options.name?'set':'pageSet'](this.selector,this.store);}else{var that=this;this.store={};this.$.find('li').each(function(){that.preserve($(this));});}};Tree.prototype.expand=function($li,disabledAnimate,notStore){if($li){$li.addClass('open');if(!disabledAnimate&&this.options.animate){setTimeout(function(){$li.addClass('in');},10);}else{$li.addClass('in');}}else{$li=this.$.find('li.has-list').addClass('open in');}
if(!notStore)this.preserve($li);this.callEvent('expand',$li,this);};Tree.prototype.show=function($lis,disabledAnimate,notStore){var that=this;$lis.each(function(){var $li=$(this);that.expand($li,disabledAnimate,notStore);if($li){var $ul=$li.parent('ul');while($ul&&$ul.length&&!$ul.hasClass('tree')){var $parentLi=$ul.parent('li');if($parentLi.length){that.expand($parentLi,disabledAnimate,notStore);$ul=$parentLi.parent('ul');}else{$ul=false;}}}});};Tree.prototype.collapse=function($li,disabledAnimate,notStore){if($li){if(!disabledAnimate&&this.options.animate){$li.removeClass('in');setTimeout(function(){$li.removeClass('open');},300);}else{$li.removeClass('open in');}}else{$li=this.$.find('li.has-list').removeClass('open in');}
if(!notStore)this.preserve($li);this.callEvent('collapse',$li,this);};Tree.prototype.toggle=function($li){var collapse=($li&&$li.hasClass('open'))||$li===false||($li===undefined&&this.$.find('li.has-list.open').length);this[collapse?'collapse':'expand']($li);};Tree.prototype.getOptions=function(options){this.options=$.extend({},Tree.DEFAULTS,this.$.data(),options);if(this.options.animate===null&&this.$.hasClass('tree-animate')){this.options.animate=true;}};Tree.prototype.toData=function($ul,filter){if($.isFunction($ul)){filter=$ul;$ul=null;}
$ul=$ul||this.$;var that=this;return $ul.children('li:not(.tree-action-item)').map(function(){var $li=$(this);var data=$li.data();delete data['zui.droppable'];var $children=$li.children('ul');if($children.length)data.children=that.toData($children);return $.isFunction(filter)?filter(data,$li):data;}).get();};Tree.prototype.callEvent=function(name,params){var result;if($.isFunction(this.options[name])){result=this.options[name](params,this);}
this.$.trigger($.Event(name+'.'+this.name,params));return result;};$.fn.tree=function(option,params){return this.each(function(){var $this=$(this);var data=$this.data(name);var options=typeof option=='object'&&option;if(!data)$this.data(name,(data=new Tree(this,options)));if(typeof option=='string')data[option](params);});};$.fn.tree.Constructor=Tree;$(function(){$('[data-ride="tree"]').tree();});}());});