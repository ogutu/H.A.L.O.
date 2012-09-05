var ERA_RC=window.ERA_RC||{};ERA_RC.resource=function()
{var $={};return{init:function(){var elname="ERA_RC"
var hasBlockID=window.era_rc!=undefined&&window.era_rc.BlockID;var blockID=hasBlockID?"_"+window.era_rc.BlockID.replace(/[^-\w.]/g,''):"";blockID=blockID.substr(0,20);var elementID=elname+blockID;for(var i=1;i<25;i++){if(document.getElementById(elementID))
elementID=elname+i+blockID;else
break;}
var layoutClass="";if(window.era_rc!=undefined&&window.era_rc.Layout&&window.era_rc.Layout.toLowerCase()=='horizontal')
layoutClass='eraLayoutHorizontal';var content="<div class='eraLinksBlock "+layoutClass+"' id='"+elementID+"'></div>";var container=null;if(window.era_rc!=undefined&&window.era_rc.ContainerID)
container=document.getElementById(window.era_rc.ContainerID);if(container!=null)
container.innerHTML=content;else
document.write(content);$.placeHolder=document.getElementById(elementID);if(window.era_rc!=undefined)
window.era_rc.vis=ERA_RC.resource.getVisible($.placeHolder);$.clickHandler=window.era_rc!=undefined?window.era_rc.ClickHandler:null;},getContent:function(content){$.placeHolder.innerHTML=content.value;if(content.adguids!=undefined){window.top.era_rc_global=window.top.era_rc_global||{adindex:0,adguids:''};window.top.era_rc_global.adindex++;window.top.era_rc_global.adguids+=content.adguids;}
var a=$.placeHolder.getElementsByTagName('a');if(a!=null)
for(var i=0;i<a.length;i++)
if(a[i].className=='vsw-ad-item'){a[i].href=a[i].href+"&vis="+ERA_RC.resource.getVisible(a[i]);if($.clickHandler)
a[i].onclick=$.clickHandler;}},getVisible:function(el){try{var top=el.offsetTop;var left=el.offsetLeft;var width=el.offsetWidth;var height=el.offsetHeight;while(el.offsetParent){el=el.offsetParent;top+=el.offsetTop;left+=el.offsetLeft;}
var qm=document.documentElement.scrollTop==0;var im=document.documentElement.clientWidth==0;var yo=window.pageYOffset||(qm?document.body.scrollTop:document.documentElement.scrollTop);var xo=window.pageXOffset||(qm?document.body.scrollLeft:document.documentElement.scrollLeft);var iw=window.innerWidth||(im?document.body.clientWidth:document.documentElement.clientWidth);var ih=window.innerHeight||(im?document.body.clientHeight:document.documentElement.clientHeight);var vis=top<(yo+ih)&&left<(xo+iw)&&(top+height)>yo&&(left+width)>xo;return vis?'T':'F';}
catch(e){return'U'};}};}();ERA_RC.resource.init();(function()
{var ERA_INTERFACE_LINK='/ERALinks/Default.aspx';var DEFAULT_DOMAIN='sciencedirect.verticalsearchworks.com';var DEFAULT_CSS_URL='CSS/HtmlRelatedLinks.css';function WriteCSS(current_window,current_document)
{if(DEFAULT_CSS_URL!="")
{current_document.write("<link href='"+DEFAULT_CSS_URL+"' type='text/css' rel='stylesheet' />");}}
function GetCustomContentID()
{var targetText = location.href;
var pattern;
var matchResult;
pattern = new RegExp("http://www.sciencedirect.com/science/article/pii/([A-Z0-9]+)", "i");
matchResult = pattern.exec(targetText);
if (matchResult != null)
{
return matchResult[1];
}
return '';}
function GetUseIFrame(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["UseIFrame"]!=null)
{var val=current_window.era_rc["UseIFrame"].toLowerCase();if(val=='no'||val=='false')return false;}
return(false);}
function GetEraDomain(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["ERADomain"]!=null)
{return"http://"+(current_window.era_rc["ERADomain"])+ERA_INTERFACE_LINK;}
return"http://"+DEFAULT_DOMAIN+ERA_INTERFACE_LINK;}
function GetEraBlockHeight(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["Height"]!=null)
{return current_window.era_rc["Height"];}
return(500);}
function GetEraBlockWidth(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["Width"]!=null)
{return current_window.era_rc["Width"];}
return(500);}
function GetEraMaxItems(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["MaxRelatedItems"]!=null)
{return current_window.era_rc["MaxRelatedItems"];}
return(4);}
function GetClickTag(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["ClickTag"]!=null)
{return encodeURIComponent(current_window.era_rc["ClickTag"]);}
return"";}
function GetEraSortType(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["SortBy"]!=null)
{return current_window.era_rc["SortBy"];}
return'Rank';}
function GetPubID(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["PubID"]!=null)
{return current_window.era_rc["PubID"];}
return'';}
function GetContentType(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["ContentType"]!=null)
{return current_window.era_rc["ContentType"];}
return'SSMicrosites';}
function GetContentId(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["ContentId"]!=null)
{return(current_window.era_rc["ContentId"]);}
else if(current_window.era_rc!=null&&current_window.era_rc["CategoryIDs"]!=null)
{return'0&categoryids='+current_window.era_rc["CategoryIDs"];}
else if(IsTestMode(current_window)&&current_window.era_rc["Test"]=='true')
{return'0';}
else
{return GetCustomContentID();}}
function GetStylesheet(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["OverrideCss"]!=null)
{return(current_window.era_rc["OverrideCss"]);}
return'';}
function GetStyleId(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["StyleId"]!=null)
{return(current_window.era_rc["StyleId"]);}
return'';}
function IsTestMode(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["Test"]!=null)
{return current_window.era_rc["Test"];}
return(false);}
function DisplayEraFrame(eraLink,current_document,current_window)
{current_document.write("<iframe name='era_relatedLinks' width='"+GetEraBlockWidth(current_window)+"' height='"+GetEraBlockHeight(current_window)+"' frameborder='0' src='"+eraLink+"' marginwidth='0' marginheight='0' scrolling='no'>");current_document.write("</iframe>");}
function DisplayEraJavaScript(eraLink,current_document,current_window)
{current_document.write("<script charset=\"utf-8\" type=\"text/javascript\" src=\""+eraLink+"\"></script>");}
function GetStringWithQuotes(checkString)
{return checkString!=null?'"'+checkString+'"':'""'}
function GetReferrer(current_window,current_document)
{if('url'.toLowerCase()=='referrer'||window!=top)
{return current_document.referrer;}
return current_window.location.href;}
function IsValidUrl(current_window,current_document)
{return true}
function GetBlockId(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["BlockID"]!=null)
{return current_window.era_rc["BlockID"];}
return'';}
function GetVisibility(current_window)
{if(current_window.era_rc!=null&&current_window.era_rc["vis"]!=null)
{return current_window.era_rc["vis"];}
return'U';}
function CreateEraLink(current_window,current_document)
{if(IsValidUrl(current_window,current_document))
{var eraLink=GetEraDomain(current_window)+"?";eraLink+="ContentId="+(GetContentId(current_window));if(GetPubID(current_window)!='')
{eraLink+="&PubID="+GetPubID(current_window);}
eraLink+="&numrequests=1&";eraLink+="req1="+GetContentType(current_window)+"||";eraLink+=GetEraMaxItems(current_window)+"|";eraLink+="SortBy:"+GetEraSortType(current_window);eraLink+="&Referrer="+encodeURIComponent(GetReferrer(current_window,current_document));if(IsTestMode(current_window))
{eraLink+="&Test="+IsTestMode(current_window);}
if(GetStyleId(current_window)!='')
{eraLink+="&StyleId="+GetStyleId(current_window);}
if(GetClickTag(current_window)!='')
{eraLink+="&ClickTag="+GetClickTag(current_window);}
if(GetStylesheet(current_window)!='')
{eraLink+="&OverrideCss="+GetStylesheet(current_window);}
if(GetBlockId(current_window)!='')
{eraLink+="&BlockID="+GetBlockId(current_window);}
eraLink+="&Vis="+GetVisibility(current_window);if(window.top.era_rc_global!=undefined)
{if(window.top.era_rc_global.adguids!=null){var adguids=window.top.era_rc_global.adguids;if(adguids.charAt(adguids.length-1)=='|')
adguids=adguids.substr(0,adguids.length-1);eraLink+="&AdGuids="+adguids;eraLink+="&BlockIndex="+window.top.era_rc_global.adindex;}}
if(GetUseIFrame(current_window))
{eraLink+="&OutputType=html";DisplayEraFrame(eraLink,current_document,current_window);}
else
{eraLink+="&OutputType=javascript";DisplayEraJavaScript(eraLink,current_document,current_window);}}
current_window.era_rc=null;}
function EraMain()
{var current_window=window;var current_document=document;CreateEraLink(current_window,current_document);}
EraMain();})()