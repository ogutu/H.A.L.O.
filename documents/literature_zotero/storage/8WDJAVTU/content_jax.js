
/* +-----------------------------------------------------------------+ */
/* | Item DAO                                                        | */
/* +-----------------------------------------------------------------+ */
var vyreItemDAOs = new Array();

function ItemDAO( contentGateway ) {
	this.gateway = contentGateway;
	this.xslId = 0;
	this.resultHandler = null;
	this.errorHandler = function() {
	    alert("Failed.");
	};
	
	this.loadContentAndMetadata = true;
	this.loadLinkedItems = false;
	this.loadLinkedContent = false;
	this.loadLinkedUsers = false;
	this.loadLinkedUsersPicture = false;	
	this.loadItemLists = false;
	this.loadLocalizations = false;
	this.showTaxonomyTree = false;
	this.loadVersionHistory = false;
	this.loadVersionContent = false;
    this.loadCreatorPicture = false;
    this.loadModifierPicture = false;
    this.loadLinkedItemsCreatorPicture = false;
    this.loadLinkedItemsModifierPicture = false;
    this.loadLinkDefinitionIds = "";
	
	vyreItemDAOs[contentGateway.id] = this;
}

ItemDAO.prototype.getControlParams = function() {
	var params = '&loadContentAndMetadata=' + this.loadContentAndMetadata
		+ '&loadLinkedItems=' + this.loadLinkedItems
		+ '&loadLinkedContent=' + this.loadLinkedContent
		+ '&loadLinkedUsers=' + this.loadLinkedUsers
		+ '&loadLinkedUsersPicture=' + this.loadLinkedUsersPicture		
		+ '&loadItemLists=' + this.loadItemLists
		+ '&loadLocalizations=' + this.loadLocalizations
		+ '&showTaxonomyTree=' + this.showTaxonomyTree
		+ '&loadVersionHistory=' + this.loadVersionHistory
		+ '&loadVersionContent=' + this.loadVersionContent
        + '&loadCreatorPicture=' + this.loadCreatorPicture
        + '&loadModifierPicture=' + this.loadModifierPicture
        + '&loadLinkedItemsCreatorPicture=' + this.loadLinkedItemsCreatorPicture
        + '&loadLinkedItemsModifierPicture=' + this.loadLinkedItemsModifierPicture
        + '&loadLinkDefinitionIds=' + this.loadLinkDefinitionIds
		;
    if ( this.useCache ){
        params += '&useCache=true'
                + this.cacheTimeout != null ? '&cacheTimeout=' + this.cacheTimeout : ''
                + this.cacheCron != null ? '&cacheCron=' + this.cacheCron : ''
                + this.cacheScope != null ? '&cacheScope=' + this.cacheScope : ''
        ;
    }
    return params;

};

ItemDAO.prototype.get = function( itemId, itemVersion ) {
	var parameters = '&type=get'
		+ '&itemId=' + itemId
		+ '&itemVersion=' + itemVersion
		+ '&xslId=' + this.xslId
		+ this.getControlParams()
		;

	// send the request
	this.gateway.sendSynchronousXMLHttpRequest(parameters, new Function("xml", "vyreItemDAOResultListener('" + this.gateway.id + "', xml)"), this.errorHandler);
};
ItemDAO.prototype.getActive = function( itemId ) {
	var parameters = '&type=getActive'
		+ '&itemId=' + itemId
		+ '&xslId=' + this.xslId
		+ this.getControlParams()
		;

	// send the request
	this.gateway.sendSynchronousXMLHttpRequest(parameters, new Function("xml", "vyreItemDAOResultListener('" + this.gateway.id + "', xml)"), this.errorHandler);
};

function vyreItemDAOResultListener(gatewayId, xml) {
	var dao = vyreItemDAOs[gatewayId];
	if ( dao.resultHandler != null ) {
		if ( dao.xslId == 0 ) {
			// send the XML
			dao.resultHandler(xml);
		} else {
			// send the HTML as a string
            var nodes = xml.getElementsByTagName('ajax-response')[0].childNodes;
            var html ="";
            for (var i = 0; i < nodes.length; i++) {     // to handle FF-specific behaviour when response is > 4096 bytes
                var node = nodes[i];
                if( typeof node.data != "undefined" ) {
                    html += node.data;
                }
            }
			dao.resultHandler(html);
		}
	} else {
		alert('No result handler was specified!');
	}
}

/* +-----------------------------------------------------------------+ */
/* | Content Searcher Configuration                                  | */
/* +-----------------------------------------------------------------+ */

function ContentSearcherConfig() {
	this.loadContentAndMetadata = true;
	this.loadLinkedItems = false;
	this.loadLinkedContent = false;
	this.loadLinkedUsers = false;
	this.loadLinkedUsersPicture = false;
	this.loadItemLists = false;
	this.loadLocalizations = false;
	this.xslId = 0;
	this.sortField = 'score';
	this.sortDesc = false;
	this.showTaxonomyTree = false;
	this.loadVersionHistory = false;
	this.loadVersionContent = false;
    this.loadCreatorPicture = false;
    this.loadModifierPicture = false;
    this.loadLinkedItemsCreatorPicture = false;
    this.loadLinkedItemsModifierPicture = false;
    this.loadLinkDefinitionIds = "";
    this.useCache = false;
    this.cacheTimeout = null;
    this.cacheCron = null;
    this.cacheScope = null;
    this.searchIndex = 'active';
}

ContentSearcherConfig.prototype.getParams = function() {
	var params = '&loadContentAndMetadata=' + this.loadContentAndMetadata
		+ '&loadLinkedItems=' + this.loadLinkedItems
		+ '&loadLinkedContent=' + this.loadLinkedContent
		+ '&loadLinkedUsers=' + this.loadLinkedUsers
		+ '&loadLinkedUsersPicture=' + this.loadLinkedUsersPicture
		+ '&loadItemLists=' + this.loadItemLists
		+ '&loadLocalizations=' + this.loadLocalizations
		+ '&xslId=' + this.xslId
		+ '&sortField=' + this.sortField
		+ '&sortDesc=' + this.sortDesc
		+ '&showTaxonomyTree=' + this.showTaxonomyTree
		+ '&loadVersionHistory=' + this.loadVersionHistory
		+ '&loadVersionContent=' + this.loadVersionContent
        + '&loadCreatorPicture=' + this.loadCreatorPicture
        + '&loadModifierPicture=' + this.loadModifierPicture
        + '&loadLinkedItemsCreatorPicture=' + this.loadLinkedItemsCreatorPicture
        + '&loadLinkedItemsModifierPicture=' + this.loadLinkedItemsModifierPicture    
        + '&searchIndex=' + this.searchIndex
        + '&loadLinkDefinitionIds=' + this.loadLinkDefinitionIds
		;
		
	if ( this.sortLocale ) {
		params += '&sortLocale=' + this.sortLocale;
	}
    if ( this.useCache ){
        params += '&useCache=true'
                + (this.cacheTimeout != null ? '&cacheTimeout=' + this.cacheTimeout : '')
                + (this.cacheCron != null ? '&cacheCron=' + this.cacheCron : '')
                + (this.cacheScope != null ? '&cacheScope=' + this.cacheScope : '')
        ;
    }
    
	return params;
};

/* +-----------------------------------------------------------------+ */
/* | Content Searcher Query                                          | */
/* +-----------------------------------------------------------------+ */

function ContentQuery( str ) {
	this.defaultQuery = str;
	this.contentStoreIds = new Array();
	this.startIndex = -1;
	this.endIndex = -1;
}

ContentQuery.prototype.clear = function() {
	this.defaultQuery = '';
	this.contentStoreIds = new Array();
	this.startIndex = -1;
	this.endIndex = -1;
};

ContentQuery.prototype.addContentStoreId = function( id ) {
	this.contentStoreIds[this.contentStoreIds.length++] = id;
};

/* +-----------------------------------------------------------------+ */
/* | Content Searcher                                                | */
/* +-----------------------------------------------------------------+ */
var vyreContentSearchers = new Array();

function ContentSearcher( contentGateway, searcherConfig ) {
	this.gateway = contentGateway;
	this.config = searcherConfig;
	this.resultHandler = function(xml) {
		alert(xml);
	};
	this.errorHandler = function() {
	    alert("Failed.");
	};
	
	vyreContentSearchers[contentGateway.id] = this;
}

ContentSearcher.prototype.search = function( query ) {

	var parameters = '&type=search'
		+ '&query=' + query.defaultQuery
		+ '&startIndex=' + query.startIndex
		+ '&endIndex=' + query.endIndex
		+ this.config.getParams()
		;
		
	// add content store ids
	var ids = '';
	for ( var i = 0; i < query.contentStoreIds.length; i = i + 1 ) {
		if ( i > 0 ) {
			ids += ',';
		}
		ids += query.contentStoreIds[i];
	}
	parameters += '&contentStoreIds=' + ids;

	// send the request
	this.gateway.sendSynchronousXMLHttpRequest(parameters, new Function("xml", "vyreContentSearcherResultListener('" + this.gateway.id + "', xml)"), this.errorHandler);
};

ContentSearcher.prototype.contentExport = function( exportId, query ) {

	var parameters = '&type=contentExport'
		+ '&query=' + query.defaultQuery
		+ '&exportId=' + exportId
		+ '&startIndex=' + query.startIndex
		+ '&endIndex=' + query.endIndex
		+ this.config.getParams()
		;
		
	// add content store ids
	var ids = '';
	for ( var i = 0; i < query.contentStoreIds.length; i = i + 1 ) {
		if ( i > 0 ) {
			ids += ',';
		}
		ids += query.contentStoreIds[i];
	}
	parameters += '&contentStoreIds=' + ids;

	// send the request
	this.gateway.sendSynchronousXMLHttpRequest(parameters, new Function("xml", "vyreContentSearcherResultListener('" + this.gateway.id + "', xml)"), this.errorHandler);
};


function vyreContentSearcherResultListener(gatewayId, xml) {
	var contentSearcher = vyreContentSearchers[gatewayId];
	if ( contentSearcher.resultHandler != null ) {
		if ( contentSearcher.config.xslId == 0 ) {
			// send the XML
			contentSearcher.resultHandler(xml);
		} else {
			// send the HTML as a string
            var nodes = xml.getElementsByTagName('ajax-response')[0].childNodes;
            var html ="";
            for (var i = 0; i < nodes.length; i++) {      // to handle FF-specific behaviour when response is > 4096 bytes
                var node = nodes[i];
                if( typeof node.data != "undefined" ) {
                    html += node.data;
                }
            }
			contentSearcher.resultHandler(html);
		}
	} else {
		alert('No result handler was specified!');
	}
}

/* +-----------------------------------------------------------------+ */
/* | Content Gateway                                                 | */
/* +-----------------------------------------------------------------+ */
function ContentGateway( gatewayId ) {
	this.id = gatewayId;
	this.pageId = 0;
    this.portletId = 0;
	this.displayItemId = 0;
	this.contextPath = '';
	this.servletPath = (document.location.href.indexOf('vyre4') != -1) ? 
        '/vyre4/servlet/ajax' : 
        '/servlet/ajax';
}

/**
 * Internal function for sending a synchronous http post.
 *
 * @param parameters the parameters that are to be posted
 */
ContentGateway.prototype.sendSynchronousXMLHttpRequest = function(parameters, handlerFunction, errorHandler) {

	var formParams = 'action=contentGateway'
		+ '&gatewayId=' + this.id
		+ '&contextPath=' + this.contextPath
		+ '&pageId=' + this.pageId
        + '&portletId=' + this.portletId             
		+ '&displayItemId=' + this.displayItemId
		+ parameters;
		;

	var req = this.createXMLHttpRequest();
	if ( req ) {
		req.open("POST", this.servletPath, true);
		req.onreadystatechange = function() {
			if ( req.readyState == 4 ) {
				if ( req.status == 200 ) {
					handlerFunction(req.responseXML);
				} else {
					errorHandler();
				}
			}
		};
		req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		req.send(formParams);
	} else {
		alert("This action is not supported on this browser.");
	}
};

/**
 * Internal function for creating an XMLHttpRequest instance in a 
 * platform independent way.
 */
ContentGateway.prototype.createXMLHttpRequest = function() {

	var req = false;
    // branch for native XMLHttpRequest object
    if ( window.XMLHttpRequest ) {
    	try {
			req = new XMLHttpRequest();
        } catch(e) {
			req = false;
        }
    // branch for IE/Windows ActiveX version
    } else if ( window.ActiveXObject ) {
       	try {
        	req = new ActiveXObject("Msxml2.XMLHTTP");
      	} catch(e) {
        	try {
          		req = new ActiveXObject("Microsoft.XMLHTTP");
        	} catch(e) {
          		req = false;
        	}
		}
    }
    return req;
};