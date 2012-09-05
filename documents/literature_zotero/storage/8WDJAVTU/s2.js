if (typeof VYRE === "undefined") {
    var VYRE = {};
    VYRE.name = "VYRE";
    VYRE.version = 0.1;
    VYRE.VyreVersion = 4310;
}

/**
 * Main Ajax Search Class <br/>
 * @author Siavash Etemadieh
 * @constructor
 * $Id: AjaxSearchFramework.js 10287 2007-11-14 13:36:50Z ash $
 * @param {Object} settings an object which contains settings for an Ajax Search<br/>
 * @class AjaxSearch
 */

VYRE.AjaxSearch = function (settings) {
    /**
     * Contains paginationElement properties
     * @property paginationElements
     */
    this.paginationElements = {
        count: -1,
        divider: "....",
        nextLink: "Next »",
        previousLink: "« Previous",
        range:3,
        resultsPerPage: 10,
        currentPage:0,
        alwaysRender: true
    };
    /**
     * @property containers
     * Contains ids for the containers needed by the Ajax Search
     */
    this.containers = {
        searchResults: 'searchResults',
        pagination: 'paginationContainer',
        resultCountInput: 'countValue',
        loadingBox: 'loadingDiv',
        plugins: 'sortBar'
    };    
    this.containerNamespace = null;
    
    if(JSONstring) {
        JSONstring.compactOutput=true;
        JSONstring.detectCirculars=false;
        JSONstring.restoreCirculars=false;
    }
    /**
     * Search Adapter
     * @property searchAdapter
     * @type Object
     * @private
     */
    this.searchAdapter = new VYRE.SearchAdapter(this,settings);
    this.searchAdapter.setStoreIds(settings.storeId);
    /**
     * Pagination Object which deals with the pagination
     * for the Ajax Search
     * @type Object
     * @default VYRE.Pagination()
     * @private
     */
    this.pagination = new VYRE.Pagination(this);
    /**
     * Stores Attribute objects to be used in lucene query
     * @type Object
     * @default new VYRE.Utils.ArrayList()
     */
    this.attributes = new VYRE.Utils.ArrayList();
    /**
     * Stores SavedSearch objects to be used in lucene query
     * @type Object
     * @default new VYRE.Utils.ArrayList()
     */
    this.savedSearches = new VYRE.Utils.ArrayList();
    /**
     * Stores instances of plugins to be used with the Ajax Search
     * @type Object
     * @default new VYRE.Utils.ArrayList()
     */
    this.plugins = new VYRE.Utils.ArrayList();
    /**
     * Stores instance of invokeLaterPlugins to be used
     * @type Object
     * @default new VYRE.Utils.ArrayList()
     */
    this.invokeLaterPlugins = new VYRE.Utils.ArrayList();
    /**
     * Stores functions to be called once a search has been returned
     * @type Object
     * @default new VYRE.Utils.ArrayList()
     */
    this.callBackFunctions = new VYRE.Utils.ArrayList();
    /**
     * Loader to handle the loading box which appears
     * when responses from the server are been waited on
     * @type Object
     * @default new VYRE.Loader(500)
     * @private
     */
    this.loader = new VYRE.Loader(this,0);
    /**
     * Taxonomy object to manage interactions with the taxonomy
     * @type Object
     * @default null
     * @private
     */
    //this.taxonomy = null; DEPRECATED
    this.taxonomyController = new VYRE.TaxonomyController();
    /**
     * Cookie name to be used for reading + writing cookies
     * @type String
     * @default ''
     * @private
     */
    this.cookieName = "";
      /**
     * Cookie Expiration (Days);
     * @type Int
     * @default
     * @private
     */
     this.cookieExpiration = 0;
    /**
     * Boolean to active lightweightCookies
     * @type boolean
     * @default false
     * @private
     */
    this.lightweightCookie = false;
    /**
     * Stores primary filter plugin
     * @type Object
     * @default null
     * @private
     */
    this.primaryFilter = null;
    /**
     * A boolean to indicate that a search can be run immediately
     * @type boolean
     * @default true
     * @private
     */
    this.canSearch = true;
    /**
     * A boolean to indicate that a search is waiting to be run
     * @type boolean
     * @default false
     * @private
     */
    this.searchWaiting = false;
    this.timer = new VYRE.Utils.Timer();
    this.responseType = "XML";
};


VYRE.AjaxSearch.prototype = {

    /**
     * Internal Method to run a search
     * @method performSearch
     * @private
     */
    performSearch: function(){
        if(this.canSearch && this.searchWaiting) {
            this.canSearch = false;
            this.searchWaiting = false;
            this.loader.start();
            this.makeLuceneQuery();
            this.timer.start();
            this.searchAdapter.search();
        }
    },

    /**
     * Function to be used for searching,
     * tells the instance that a search is now waiting.
     * @method search
     * @public
     */
    search: function() {
        VYRE.Utils.Logger.info("Searching....");
        this.searchWaiting =true;
        this.performSearch();
    },
    
    /**
     * performs a search with defauled pagination page defaulted to 1
     * @method sortedSearch
     * @public
     */
    sortedSearch: function(){
        VYRE.Utils.Logger.info("running Sorted Search..");
        this.defaultSort();
        this.search();
    },
    
    resultHandler : function (xml) {
        VYRE.Utils.Logger.log("Ajax Request duration: "+this.timer.stop() +"ms");
        VYRE.Utils.Logger.info("recieved results from server...");

        if(this.responseType == "JSON") {
            this.JSONHandler(xml);
        } else {
            this.displaySearchResults(xml);
        }
        this.callBackFunctions.each(function(func, index){
            if(typeof func == "function") {  func(); }
        });
        this.runInvokeLaterPlugins();
        this.runPlugins(this.getConfiguration(), true);
        this.canSearch = true;
        this.performSearch();
        this.writeCookie();
    },
    
    JSONHandler : function (json) {
    },
    /**
     * Processes xml response from the server and
     * runs plugins, cookie etc
     * @method displaySearchResults
     * @param {String} xml returned by the server
     * @private
     */
    displaySearchResults: function(xml) {

        VYRE.Utils.getContainer(this.containers.searchResults,this.containerNamespace,"div");
        var searchResultsContainer =  VYRE.Utils.getContainer(this.containers.searchResults,this.containerNamespace,"div");
        if(searchResultsContainer) {  
          searchResultsContainer.innerHTML = xml;
        } else {
          VYRE.Utils.Logger.warn("SearchResults Container '"+this.containers.searchResults+"' not found!");
        }
        var resultCount = VYRE.Utils.getContainer(this.containers.resultCountInput,this.containerNamespace,"input");
        if(resultCount) {
            this.paginationElements.count = resultCount.value;
        } else {
          VYRE.Utils.Logger.warn("countValue input '"+this.containers.resultCountInput+"' not found!");
        }
        this.loader.stop();
        
        if( this.paginationElements.resultsPerPage != -1 && (this.paginationElements.count > this.paginationElements.resultsPerPage
            || this.paginationElements.alwaysRender == true)) {
          this.pagination.render( VYRE.Utils.getContainer(this.containers.pagination,this.containerNamespace,"div"));
          this.pagination.render(VYRE.Utils.getContainer(this.containers.pagination+"2",this.containerNamespace,"div"));
        } else {
            var pag1  = VYRE.Utils.getContainer(this.containers.pagination,this.containerNamespace,"div");
            if(pag1) {pag1.innerHTML ="";}
            var pag2 = VYRE.Utils.getContainer(this.containers.pagination+"2",this.containerNamespace,"div");
            if(pag2) {pag2.innerHTML ="";}
        }
    },
    
    /**
     * Writes a JSON String to a cookie with the latest
     * settings of the ajax search
     * @method writeCookie
     */
    writeCookie: function() {
        if(this.cookieName.length>0) {
            var JSONCookie = JSONstring.make(this.getConfiguration());
            VYRE.Utils.Logger.info("writing Cookie...");
            if(this.cookieExpiration >0) {
                VYRE.Utils.Cookie.create(this.cookieName,JSONCookie,this.cookieExpiration);
            } else {
                VYRE.Utils.Cookie.create(this.cookieName,JSONCookie);
            }
        }
    },
    
    /**
     * Reads and processes the stored Cookie
     * @method readCookie
     */
    readCookie: function () {
        if(this.cookieName.length>0) {
            if(VYRE.Utils.Cookie.read(this.cookieName)) {
                VYRE.Utils.Logger.info("reading Cookie...");
                this.setConfiguration(JSONstring.toObject(VYRE.Utils.Cookie.read(this.cookieName)));
            }
        }
    },
    
    /**
     * Returns a config object based on the settings
     * within the ajax search
     * @method getConfiguration
     * @return {Object} config settings
     */
    getConfiguration: function() {
        var config = {
            resultsPerPage: this.paginationElements.resultsPerPage,
            sortDesc: this.searchAdapter.searchConfig.sortDesc,
            sortField: this.searchAdapter.searchConfig.sortField,
            sortLocale: this.searchAdapter.searchConfig.sortLocale,
            startIndex: this.searchAdapter.searchQuery.startIndex,
            endIndex: this.searchAdapter.searchQuery.endIndex,
            currentPage: this.paginationElements.currentPage,
            savedSearches:this.savedSearches.toArray(),
            attributes:this.attributes.toArray(),
            xslId: this.searchAdapter.searchConfig.xslId
        };
        if(this.searchAdapter.searchType == 'user'){
            config.realmId = this.searchAdapter.searchQuery.realmId;
        }
        else if(this.searchAdapter.searchType == 'content') {
            if(this.taxonomyController.size() > 0){
                config.taxonomyString= this.taxonomyController.getTaxonomyString();
                config.connector = this.taxonomyController.getConnector();
            }
            config.storeIds = this.searchAdapter.getStoreIds();
        }
        return config;
    },

    /**
     * Persists settings from a config object to the ajax search instance
     * @method setConfiguration
     * @param {Object} config settings to be persisted
     */
    setConfiguration: function(config){
        VYRE.Utils.Logger.info("Setting Configuration...");
        this.setResultCount(config.resultsPerPage);
        this.searchAdapter.searchConfig.sortDesc =config.sortDesc;
        this.searchAdapter.searchConfig.sortField = config.sortField;
        if ( config.sortLocale ) {
            this.searchAdapter.searchConfig.sortLocale = config.sortLocale;
        }
        this.searchAdapter.searchConfig.xslId = config.xslId;
        if(this.lightweightCookie === false) {
            VYRE.Utils.Logger.info("Setting Non-Lightweight Configuration Settings..");
            this.savedSearches.fromArray(config.savedSearches);
            this.attributes.fromArray(config.attributes);
            if(this.searchAdapter.searchType == "user"){
                this.searchAdapter.searchQuery.realmId = config.realmId;
            }
            else if(this.searchAdapter.searchType == "content") {
               if(this.taxonomyController.size() >0) {
                   this.taxonomyController.setConnector(config.connector) ;
                   this.taxonomyController.populate(config.taxonomyString);
               }
               this.searchAdapter.setStoreIds(config.storeIds);

            }
            this.searchAdapter.searchQuery.startIndex = config.startIndex;
            this.searchAdapter.searchQuery.endIndex = config.endIndex;
            this.paginationElements.currentPage = config.currentPage;
        }
    },
    
    /**
     * updates the containers object
     * @method updateContainers
     * @param {Object} containers object
     */
    updateContainers: function(containers) {
        VYRE.Utils.Logger.info("updatingContainers...");
        this.containers = containers;
    },
    
    setContainerNamespace : function(id) {
        this.containerNamespace = id;
    },
     
    /**
     * Attaches Onclick to perform a search to
     * the html element with the specified id
     * @method registerSubmit
     * @param {String} elementId id of the html element
     */
    registerSubmit: function(elementId){
        var ajaxSearch = this;
        if(VYRE.Utils.elementExists(elementId)){
        	VYRE.Utils.addEvent(VYRE.Utils.gE(elementId), "click",function () {
        		ajaxSearch.sortedSearch();
        	});
        }
    },

    /**
     * Instanstiates a Taxonomy class based on the portletId
     * specified
     * @method registerTaxonomy
     * @param {String} portletId Id of the Searchportlet with the taxonomy
     */
    registerTaxonomy: function(portletId) {
        if(this.searchAdapter.searchType == "content") {
            var taxonomy = new VYRE.Taxonomy(this,portletId);
            taxonomy.initialise();
            this.taxonomyController.addTaxonomy(taxonomy);
        } else{
            VYRE.Utils.Logger.warn("Cannot Register Taxonomy for User realm");
        }
    },
    
    /**
     * Attaches Onclick event to reset the search
     * @method registerReset
     * @param {String} elementId id of the html element
     */
    registerReset: function(elementId){
        var ajaxSearch = this;
        if(VYRE.Utils.elementExists(elementId)){
        	VYRE.Utils.addEvent(VYRE.Utils.gE(elementId), "click",function () {
        		ajaxSearch.reset();
        	});;
        }
    },

    /**
     * Resets the search
     * @method reset
     */
    reset: function(){
        VYRE.Utils.Logger.info("Resetting Search...");
        if(this.taxonomyController.size() > 0){
            this.taxonomyController.clear();
        }
        this.savedSearches.clear();
        this.attributes.clear();
        this.sortedSearch();
    },

    /**
     * Adds a plugin to the instance, must implement 3 methods
     * 1. getHTHML()
     * 2. loadConfig()
     * 3. initialise()
     * @method addPlugin
     * @param {Object} plugin the plugin to be added
     * @return {Boolean} successful/not successful
     */
    addPlugin: function(plugin) {
        var pluginContainer = VYRE.Utils.getContainer(this.containers.plugins,this.containerNamespace,"div");
        if(plugin.initialise && plugin.getHTML && plugin.loadConfig) {
            this.plugins.add(plugin);
            var node = plugin.getHTML(this);

            if(plugin.elementId && VYRE.Utils.gE(plugin.elementId)) {
                if ( node !== null ) {
                  VYRE.Utils.gE(plugin.elementId).appendChild(node);
                }
                plugin.initialise();
                return true;
            } else if(pluginContainer != null) {
                if ( node !== null ) {
                  pluginContainer.appendChild(node);
                }
                plugin.initialise();
                return true;
            } else {
                VYRE.Utils.Logger.warn("No Container to append Plugin to");
            }
        } else{
            VYRE.Utils.Logger.warn("Invalid Plugin, please provide the mandatory methods - initialise, getHTML, loadConfig");
        }
        return false;
    },

    /**
     * Adds a plugin to be invoked after a search
     * has been recieved, must implement the invokeLater() method
     * @method addInvokeLaterPlugin
     * @param {Object} plugin the plugin to be added
     */
    addInvokeLaterPlugin: function(plugin) {
       if(plugin.invokeLater) {
           this.invokeLaterPlugins.add(plugin);
           plugin.initialise(this);
       } else{
          VYRE.Utils.Logger.warn("Invalid Plugin, please provide the mandatory method - invokeLater");
       }
    },

    /**
     * Runs all the plugin's loadConfig() method
     * @method runPlugins
     * @param {Object} config the latest view of the instance
     * @param {Boolean} noSort sort/nosort
     */
    runPlugins: function(config,noSort) {
        //VYRE.Utils.Logger.info("Running Plugins");
        for(var i=0; i<this.plugins.size(); i++) {
           if(this.plugins.get(i).loadConfig) {
               this.plugins.get(i).loadConfig(config,noSort);
           }
        }
    },

    /**
     * Runs all invokeLaterPlugin's
     * @method runInvokeLaterPlugins
     */
    runInvokeLaterPlugins: function(){
       //VYRE.Utils.Logger.info("Running Invoke Later Plugins...");
       this.invokeLaterPlugins.each(function(ob,index){
          if(ob.invokeLater) {ob.invokeLater();}
       });
    },

    /**
     * Processes Url Queries, looks for primary + category
     * values;
     * @method processUrlQuery
     */
    processUrlQuery: function() {
        VYRE.Utils.Logger.info("Processing Url Query..");
        var primaryValue = "";
        var categories = [];
        var urlQueries = VYRE.Utils.getURLParameters();
        if(urlQueries.length >0) {
            for(var i = 0; i < urlQueries.length; i++) {
                if(urlQueries[i].name == "category") {
                   categories.push(urlQueries[i].value);
                } else if (urlQueries[i].name == "primary") {
                   primaryValue = urlQueries[i].value;
                }
            }
            if(categories.length > 0 || primaryValue.length > 0) {
                if(this.taxonomyController.size() > 0) {
                    this.taxonomyController.populate(categories.join(","));
                }
                if(this.primaryFilter) {
                    this.primaryFilter.changeValue(primaryValue);
                }
                this.cookieName="";
                return true;
            }
        } else {
            return false;
        }
        return false;
    },
    
    /**
     * generates Lucene Query String
     * and prepares the searchAdapter for its earch
     * @method makeLuceneQuery
     * @private
     */
    makeLuceneQuery:function(){
        var luceneQuery = '';
        if(this.savedSearches.size() > 0 ) {
            for(var i = 0;i<this.savedSearches.size();i++) {
                if(this.savedSearches.get(i).value) {
                   luceneQuery += " AND ("+this.savedSearches.get(i).value+")";
                }
            }
        }
        if(this.attributes.size() > 0 ) {
            for(var i = 0;i<this.attributes.size();i++) {
                if(this.attributes.get(i).value) {
                    luceneQuery += " AND (";
                    if(this.attributes.get(i).name != ''){
                        luceneQuery += this.attributes.get(i).name+":";
                    }
                    luceneQuery += "("+ this.attributes.get(i).value+"))";
                }
            }
        }
        if(this.taxonomyController.size() > 0 && this.taxonomyController.getTaxonomyString().trim() !="") {
            var taxArray = this.taxonomyController.getTaxonomyString().split(",");
            luceneQuery += " AND (";
            for(var i = 0;i< taxArray.length ;i++) {
                if(taxArray[i] !="") {
                    if(i!=0) {
                        luceneQuery+=" "+this.taxonomyController.getConnector()+" ";
                    }
                    luceneQuery += "categoryIds:"+taxArray[i] +" ";
                }
            }
            luceneQuery += ")";
        }
        VYRE.Utils.Logger.info("LuceneQuery = "+this.searchAdapter.savedSearch+luceneQuery);
        this.searchAdapter.luceneQuery =luceneQuery;
    },
    
    setResponseType : function(responseType) {
    	this.responseType = responseType;
    },
    
    getResponseType : function () {
    	return this.responseType;
    },
    /**
     * initialises a new loader with a
     * specified delay
     * @method setloader
     * @param {int} delay
     */
    setLoader: function(delay){
        VYRE.Utils.Logger.info("Setting Loader delay: "+delay +"ms");
        this.loader = new VYRE.Loader(this,delay);
    },
    
    /**
     * sets the default saved search
     * used by the searchAdapter
     * @method setSavedSearch
     * @param {String} value the new saved saved search
     */
    setSavedSearch: function(value){
        VYRE.Utils.Logger.info("Setting Default Saved Search: "+value);
        this.searchAdapter.savedSearch = value;
    },
    
    /**
     * sets The primary filter plugin
     * @method setPrimaryfilter
     * @param {Object} primary filter the filter plugin to be set
     */
    setPrimaryFilter: function(primaryFilter){
        if(this.addPlugin(primaryFilter)) {
            this.primaryFilter = primaryFilter;
        }
    },
    
    /**
     * returns the primary filter
     * @method getPrimaryFilter
     * @return {Object} primary filter
     */
    getPrimaryFilter: function() {
        return this.primaryFilter;
    },

    /**
     * sets the start/end index and the current page
     * for the pagination
     * @method setSortRange
     * @param {int} startIndex
     * @param {int} endIndex
     * @param {int} currentPage
     */
    setSortRange: function(startIndex,endIndex,currentPage){
        VYRE.Utils.Logger.info("setting sort range startIndex= "+startIndex+",  endIndex= "+endIndex +", currentPage= "+currentPage);
        this.searchAdapter.searchQuery.startIndex = startIndex;
        this.searchAdapter.searchQuery.endIndex = endIndex;
        this.paginationElements.currentPage = currentPage;
    },

    /**
     * Sets the realmId for the User Search
     * @method setRealmId
     * @param {String|int} value the realmId
     */
    setRealmId: function(value){
        VYRE.Utils.Logger.info("Setting RealmId: "+ value);
        this.searchAdapter.setRealmId(value);
    },

    /**
     * Sets the lucene operator to be used for the
     * taxonomy 'AND || OR'
     * @method setConnector
     * @param {String} connector
     */
    setConnector : function(connector) {
      if(this.taxonomyController.size() > 0) {
          VYRE.Utils.Logger.info("Setting taxonomy connector: "+ connector);
          this.taxonomyController.setConnector( connector);
      }
    },

    /**
     * Returns the lucene operator used on the taxonomy
     * @method getConnector
     * @return {String} connector
     */
    getConnector: function(){
      if(this.taxonomyController.size() > 0){
          return this.taxonomyController.getConnector();
      }
      return '';
    },

    /**
     * Sets the xslId to render the xml results
     * on the server
     * @method setXslId
     * @param {String} value the XslId
     */
    setXslId: function(value) {
      VYRE.Utils.Logger.info("Setting xslId: "+value);
      this.searchAdapter.searchConfig.xslId = value;
    },

    /**
     * returns the xslId used to transform results
     * @method getXslId
     * @return XslId
     */
    getXslId: function() {
      return this.searchAdapter.searchConfig.xslId;
    },


    /**
     * Sets the results per page count
     * @method setResultCount
     * @param {int} the new count
     * @param {Boolean} sort/nosort
     */
    setResultCount: function (value,noSort) {
      VYRE.Utils.Logger.info("Setting Result Count: " + value);
      this.paginationElements.resultsPerPage = value;
      if(value == -1) {
          this.setSortRange(-1,-1,-1);
      }
      this.defaultSort(noSort);
    },
	
	setResultsPerPage : function (value, noSort) {
		this.setResultCount(value,noSort);
	},
    /**
     * Returns how many results per page
     * are displayed
     * @method getResultCount
     * @return resultsPerPage
     */
    getResulsPerPage: function() {
      return this.paginationElements.resultsPerPage;
    },

    /**
     * Sets whether the results should be sorted
     * descending
     * @method setDescending
     * @param {Boolean} value
     */
    setDescending: function(value) {
      VYRE.Utils.Logger.info("Setting descending: "+value.toString());
      this.searchAdapter.searchConfig.sortDesc = value;
    },

    /**
     * Returns the descending value of the search instance
     * @method isDescending
     * @return {Boolean} sortDesc
     */
    isDescending: function() {
      return this.searchAdapter.searchConfig.sortDesc;
    },

    /**
     * Sets the sort field to be used by the search
     * @method setSortField
     * @param {String} value
     */
    setSortField: function(value) {
      VYRE.Utils.Logger.info("Setting Sort Field: "+value);
      this.searchAdapter.searchConfig.sortField = value;
    },

    /**
     * Returns the sort field used by the search
     * @method getSortField
     * @return {String} sortField
     */
    getSortField: function(){
      return this.searchAdapter.searchConfig.sortField;
    },

    /**
     * Sets the sort locale to be used by the search
     * @method setSortLocale
     * @param {String} value
     */
    setSortLocale: function( value ) {
      VYRE.Utils.Logger.info("Setting Sort Locale: " + value);
      this.searchAdapter.searchConfig.sortLocale = value;
    },

    /**
     * Returns the sort locale used by the search
     * @method getSortLocale
     * @return {String} sortLocale
     */
    getSortLocale: function() {
      return this.searchAdapter.searchConfig.sortLocale;
    },

    /**
     * Sets the cookieName
     * @method setCookieName
     * @param {String} cookieName
     */
    setCookieName: function(name) {
      VYRE.Utils.Logger.info("Setting CookieName: "+name);
      this.cookieName = name;
    },

    /**
     * returns the cookieName
     * @method getCookieName
     * @return {String} cookieName
     */
    getCookieName: function() {
      return this.cookieName;
    },

    /**
     * Sets lightweightCookies
     * @method setLightweightCookie
     * @param {Boolean} value
     */
    setLightweightCookie: function(value) {
      VYRE.Utils.Logger.info("Setting lightweightCookie: "+value);
      this.lightweightCookie =value;
    },

    /**
     * Sets cookie expiration
     * @method setCookieExpiration
     * @param {int} value
     */
    setCookieExpiration: function(value) {
      this.cookieExpiration = value;
      VYRE.Utils.Logger.info("Cookie Expiration set to: "+value+" days..");
    },

    /**
     * Returns the searchAdapter
     * @method getSearchAdapter
     * @return {Object} searchAdapter
     */
    getSearchAdapter: function() {
      return this.searchAdapter;
    },

    /**
     * Returns the SearchConfig
     * @method getSearchConfig
     * @return searchConfig
     */
    getSearchConfig: function() {
      return this.searchAdapter.searchConfig;
    },

    /**
     * Defaults the pagination to page1
     * @method defaultSort
     * @param {Boolean} noSort
     */
    defaultSort: function (noSort) {
       if(!noSort && this.resultsPerPage != -1) {         
           VYRE.Utils.Logger.info("Default Sort");
           this.setSortRange(0,this.paginationElements.resultsPerPage -1,0);
      }
    }
};

/**
 * @private
 * @class
 */
VYRE.SearchAdapter = function (ajaxSearch, searchSettings) {
    this.ajaxSearch = ajaxSearch;
    this.searchType = searchSettings.searchType;
    this.searchConfig = null;
    this.searchQuery = null;
    this.searcher = null;
    this.savedSearch ="";
    this.luceneQuery ="";

    if(this.searchType == "content") {
        this.gateway = new ContentGateway(searchSettings.gatewayId);
        this.searchConfig = new ContentSearcherConfig();

        if(typeof searchSettings.loadContentAndMetadata !="undefined") {
          this.searchConfig.loadContentAndMetadata = searchSettings.loadContentAndMetadata;
        }
        if(typeof searchSettings.showTaxonomyTree !="undefined") {
          this.searchConfig.showTaxonomyTree = searchSettings.showTaxonomyTree;
        }
        this.searchConfig.loadLinkedItems = searchSettings.loadLinkedItems || this.searchConfig.loadLinkedItems;
        this.searchConfig.loadLinkedContent = searchSettings.loadLinkedContent || this.searchConfig.loadLinkedContent;
        this.searchConfig.loadLinkedUsers = searchSettings.loadLinkedUsers || this.searchConfig.loadLinkedUsers;
        this.searchConfig.loadItemLists = searchSettings.loadItemLists || this.searchConfig.loadItemLists;
        this.searchConfig.loadLocalizations = searchSettings.loadLocalizations || this.searchConfig.loadLocalizations;

        this.searcher = new ContentSearcher(this.gateway, this.searchConfig);
        this.savedSearch = "(active:true)";
        this.searchQuery = new ContentQuery(this.luceneQuery);

    } else if (this.searchType == "user") {
        this.gateway = new UserGateway(searchSettings.gatewayId);
        this.searchConfig = new UserSearcherConfig();

        this.searchConfig.loadLinkedItems = searchSettings.loadLinkedItems || this.searchConfig.loadLinkedItems ;
        this.searchConfig.loadLinkedContentAndMetadata = searchSettings.loadLinkedContentAndMetadata || this.searchConfig.loadLinkedContentAndMetadata;

        this.searcher = new UserSearcher(this.gateway,this.searchConfig);
        this.savedSearch = "(all:1)";
        this.searchQuery = new UserQuery(this.luceneQuery);
        this.setRealmId(searchSettings.realmId);
    }

    if(this.searchType =="content" || this.searchType == "user") {
        this.searchConfig.xslId = searchSettings.xslId;
        this.gateway.pageId = searchSettings.pageId;
        this.gateway.contextPath = searchSettings.contextPath;
        this.gateway.displayItemId = searchSettings.displayItemId || this.gateway.displayItemId;
        this.searcher.errorHandler = function () {
           VYRE.Utils.Logger.warn("Ajax request failed");
        };
    }

    if(this.searcher != null) {
        this.searcher.resultHandler = function(ajaxSearch){
            return function(xml) {
                ajaxSearch.resultHandler(xml);
            };
        }(this.ajaxSearch);
    }
};

VYRE.SearchAdapter.prototype = {
    /**
     * @private
     */
    search: function(){
        if(this.luceneQuery !=''){
            this.searchQuery.defaultQuery = this.savedSearch + this.luceneQuery;
        } else {
            this.searchQuery.defaultQuery = this.savedSearch;
        }
        if(this.ajaxSearch.getResponseType() == "JSON") {
        	this.searcher.searchJSON(this.searchQuery);
        } else {
        	this.searcher.search(this.searchQuery);
        }
    },
    /**
     * @private
     */
    setStoreIds: function(storeId,noSort) {
        if(this.searchType == "content"){
            this.searchQuery.contentStoreIds =[];
            if ( typeof storeId.indexOf != 'undefined' && storeId.indexOf(",") != -1 ) {

              // searching multiple stores
              var ids = storeId.split(",");
              for ( var i = 0; i < ids.length; i++ ) {
                if ( ids[i] != '' ) {
                  this.searchQuery.addContentStoreId(ids[i]);
                }
              }
            } else {
              this.searchQuery.addContentStoreId(storeId);
            }
            this.ajaxSearch.defaultSort(noSort);
            VYRE.Utils.Logger.info("setting StoreIds");
        }
    },
    /**
     * @private
     */
    setRealmId: function(realmId) {
        if(this.searchType == "user"){
            this.searchQuery.realmId = realmId;
        }
    },
    /**
     * @private
     */
    getStoreIds: function() {
        if(this.searchType == "content" && this.searchQuery.contentStoreIds.length>0) {
            return this.searchQuery.contentStoreIds.join(",");
        }
        return "";
    }
};

/**
 * @class
 * @constructor
 */
VYRE.SavedSearch =  VYRE.Attribute = UrlParameter = function(name,value){
    this.name = name;
    this.value = value;
    this.equals = function(ob) {
        return ob.name == this.name;
    };
};

/**
 * @private
 */
VYRE.Loader = function(ajaxSearch,delay){
    this.ajaxSearch = ajaxSearch;
    this.show = true;
    this.delay = delay;
    this.div = VYRE.Utils.createElement({tag:'div', className:'loadingDiv'});
    this.appended = false;
    this.timeoutId = null;
};

VYRE.Loader.prototype = {
    /**
     * @private
     */
    start: function(){
        this.show = true;
        this.timeoutId = setTimeout(this.showLoader(this),this.delay);
    },
    /**
     * @private
     */
    showLoader: function(instance){
        return function() {
            if(instance.show == true) {
                var element = VYRE.Utils.getContainer(instance.ajaxSearch.containers.loadingBox,instance.ajaxSearch.containerNamespace,"div")
                if(element != null) {
                    element.style.display = "block";
                } else {
                  if(instance.appended == false) {
                    //document.body.childNodes[0].appendChild(instance.div);
                  }
                  instance.div.style.display = "block";
                  this.appended = true;
                  VYRE.Utils.Logger.warn("loaderContainer doesnt exist, creating custom one..."); 
                }
            }
        };
    },
    stop: function(){
        clearTimeout(this.timeoutId);
        this.show = false;
        var element = VYRE.Utils.getContainer(this.ajaxSearch.containers.loadingBox,this.ajaxSearch.containerNamespace,"div")
        if(element != null || this.appended == true) {
            element.style.display = "none";
        } else {
          this.div.style.display = "none";
        }
   }
};

VYRE.TaxonomyController = function() {
    this.taxonomyInstances = new VYRE.Utils.ArrayList();
};

VYRE.TaxonomyController.prototype = {
    
    addTaxonomy: function (taxonomy) {
        this.taxonomyInstances.add(taxonomy);
    },
    
    size: function(){
        return this.taxonomyInstances.size();
    },
    
    clear: function() {
        this.taxonomyInstances.each(function(item, index) {
            item.clear();
        });
    },
    
    populate: function(taxString) {
        this.taxonomyInstances.each(function(item, index) {
            item.populate(taxString);
        });
    },
    
    getTaxonomyString: function () {
        var categoryArray = [];
        this.taxonomyInstances.each(function(item, index) {
            var singleCatArray = item.getTaxonomyString().split(",");
            if(singleCatArray[0].length >0 ) {
                categoryArray = categoryArray.concat(singleCatArray);
            }
        });
        return categoryArray.join(",");
    },
    
    setConnector: function (connector){
        this.taxonomyInstances.each(function(item, index) {
            item.connector = connector; 
        });
    },
    getConnector: function() {
        if(this.taxonomyInstances.size() > 0) {
            return this.taxonomyInstances.get(0).connector;
        }
        return null;
    }
    
};

/**
 * @private
 */
VYRE.Taxonomy =function(ajaxSearch,portletId) {
    this.ajaxSearch = ajaxSearch;
    this.portletId = portletId;
    this.HIDDEN_TAXONOMY_VALUE = 'SearchPortlet_user_input_selected_categories.key_';
    this.baseSelect=null;
    this.baseInstance = null;
    this.connector = "AND";
};



VYRE.Taxonomy.Templates = function (){
    if(typeof VYRE.VyreVersion != undefined && VYRE.VyreVersion >= 4310) {
        return {
            base : "this.baseSelect = categorySelectortaxonomy_{portletId}.addOrRemoveCategory;", 
            baseInstance : "this.baseInstance = categorySelectortaxonomy_{portletId}",
            select : "categorySelectortaxonomy_{portletId}.addOrRemoveCategory = this.selectCategory(this);",
            clear : "categorySelectortaxonomy_{portletId}.clear()",
            populate : "categorySelectortaxonomy_{portletId}.addOrRemoveCategory('{catId}',taxonomy_{portletId}_cat_{catId});"          
        }
    } else {
        return {
            base : "this.baseSelect = selectCategory_{portletId};", 
            baseInstance : "this.baseInstance = selectCategory_{portletId} ",
            select : "selectCategory_{portletId} = this.selectCategory(this);",
            clear : "categorySelector_{portletId}.clear()",
            populate : "selectCategory_{portletId}('{catId}',catTree_{portletId}_{catId});"         
        }
    }
}();


VYRE.Taxonomy.prototype = {
    /**
     * @private
     */
    initialise: function(){
        try{
          eval(VYRE.Taxonomy.Templates.base.supplant({portletId : this.portletId}));
          eval(VYRE.Taxonomy.Templates.baseInstance.supplant({portletId : this.portletId}));
          eval(VYRE.Taxonomy.Templates.select.supplant({portletId : this.portletId}));
          VYRE.Utils.Logger.info("Initialising Taxonomy...");
          this.clear();
        } catch(e) {
           VYRE.Utils.Logger.warn("Error occured when overriding taxonomy method");
        }
    },
    /**
     * @private
     */
    getTaxonomyString: function(){
        var taxonomyString = VYRE.Utils.getElementValue(this.HIDDEN_TAXONOMY_VALUE + this.portletId);
        VYRE.Utils.Logger.info("Taxonomy String: "+taxonomyString);
        return taxonomyString;
    },
    /**
     * @private
     */
    clear: function() {
        try{
          eval(VYRE.Taxonomy.Templates.clear.supplant({portletId : this.portletId}));
          VYRE.Utils.Logger.info("Clearing Taxonomy");
        } catch(e) {
          VYRE.Utils.Logger.warn("Error occured when clearing taxonomy");
        }
    },
    /**
     * @private
     */
    populate: function (taxString) {
        if(taxString.length>0 && this.portletId) {
            taxArray = taxString.split(",");
            VYRE.Utils.Logger.info("Populating Taxonomy...");
            for(var i=0;i<taxArray.length;i++) {
                try{;
                    eval(VYRE.Taxonomy.Templates.populate.supplant({portletId : this.portletId, catId : taxArray[i]}));
                } catch(e) {
                    VYRE.Utils.Logger.warn("Error occured when populating taxonomy");
                    VYRE.Utils.Logger.warn("EvalString = " + (VYRE.Taxonomy.Templates.populate.supplant({portletId : this.portletId, catId : taxArray[i]})));
                }
            }
        }
    },
    /**
     * @private
     */
    selectCategory: function (taxonomyInstance){
        return function(catId,treeName,doNotSearch){
            if(typeof VYRE.VyreVersion != undefined && VYRE.VyreVersion >= 4310){
                taxonomyInstance.baseSelect.apply(taxonomyInstance.baseInstance,[catId,treeName]);          
            } else {
                taxonomyInstance.baseSelect(catId,treeName);
            }
            if(!doNotSearch) {
                taxonomyInstance.ajaxSearch.sortedSearch();
            }
        };
    },
    
    equals : function (ob) {
        if(typeof ob.portletId != "undefined") {
            return this.portletId == ob.portletId;
        }
        return false;
    }
};

/**
 * @private
 */
VYRE.Pagination = function (ajaxSearch) {
    this.ajaxSearch = ajaxSearch;
};

VYRE.Pagination.prototype = {

  /**
   * @private
   */
  render: function(element) {
  
      var paginationElements = this.ajaxSearch.paginationElements;
      if(element) {
          var divider = document.createElement("p");
          if(typeof paginationElements.divider == "object" ) {
              divider.appendChild(paginationElements.divider);        
          } else {
              divider.appendChild(document.createTextNode(paginationElements.divider));
          }
          var mod = paginationElements.count % paginationElements.resultsPerPage;
          var pages = Math.ceil( paginationElements.count/paginationElements.resultsPerPage );
          var paginationHolder = document.createElement("div");
          paginationHolder.className="pagination";

          /**
          * Previous Link
          */
          if(paginationElements.currentPage >0) {
            var prevStart = (paginationElements.currentPage-1) * paginationElements.resultsPerPage;
            var prevEnd = prevStart + paginationElements.resultsPerPage-1;
            if(prevEnd > paginationElements.count-1) {
              prevEnd = paginationElements.count-1;
            }
            this.createLink(paginationHolder,prevStart,prevEnd,paginationElements.currentPage-1,paginationElements.previousLink,"previous");
          } else {
            var p1 = document.createElement("p");
            p1.className = "pPrev";
            if(typeof paginationElements.previousLink == "object") {
              p1.appendChild( paginationElements.previousLink.cloneNode(true));             
            } else {
              p1.appendChild(document.createTextNode( paginationElements.previousLink));
            }
            paginationHolder.appendChild(p1);
          }

          /**
          * Page number Links
          */
          if( pages> paginationElements.range +8  && paginationElements.currentPage <paginationElements.range+4 ) {

            this.createLinks(paginationHolder,0,paginationElements.range+5 );
            paginationHolder.appendChild(divider);
            this.createLinks(paginationHolder,pages-2,pages);

          } else if (pages>paginationElements.range+8 && paginationElements.currentPage >=paginationElements.range+4 ) {

            this.createLinks(paginationHolder,0,2);
            paginationHolder.appendChild(divider.cloneNode(true));

            var endPage = paginationElements.currentPage +paginationElements.range+2 ;
            if(endPage > pages) {
              endPage = pages;
            }
            this.createLinks(paginationHolder,paginationElements.currentPage-paginationElements.range-1 ,endPage);
            if(endPage == pages-1) {
              this.createLinks(paginationHolder,endPage,pages);
            }else if( paginationElements.currentPage+paginationElements.range+2  < pages) {
              if(paginationElements.currentPage+paginationElements.range+4  != pages ) {
                paginationHolder.appendChild(divider.cloneNode(true));
              }
              this.createLinks(paginationHolder,pages-2,pages);
            }
          } else {
              this.createLinks(paginationHolder, 0,pages);
          }

          /**
          * Next Link
          */
          if(paginationElements.currentPage <pages-1) {
            var nextStart = (paginationElements.currentPage+1) * paginationElements.resultsPerPage;
            var nextEnd = nextStart + paginationElements.resultsPerPage-1;

            if(nextEnd > paginationElements.count-1) {
              nextEnd = paginationElements.count-1;
            }
            this.createLink(paginationHolder,nextStart,nextEnd,paginationElements.currentPage+1,paginationElements.nextLink,"next");
          } else {
            var p2 = document.createElement("p");
            p2.className="pNext";
            if(typeof paginationElements.nextLink == "object") {
               p2.appendChild(paginationElements.nextLink.cloneNode(true));             
            } else {
              p2.appendChild(document.createTextNode(paginationElements.nextLink));
            }
            paginationHolder.appendChild(p2);
          }
          element.innerHTML ="";
          element.appendChild(paginationHolder);

      } else {
        VYRE.Utils.Logger.warn("Pagination Container not Found");
      }
  },
  /**
   * @private
   */
  createLinks: function(paginationHolder, start, end){
      for(var i = start; i < end; i++) {
        var startIndex = i*this.ajaxSearch.paginationElements.resultsPerPage;
        var endIndex = startIndex + this.ajaxSearch.paginationElements.resultsPerPage-1 ;

        if(endIndex > this.ajaxSearch.paginationElements.count-1) {
          endIndex = this.ajaxSearch.paginationElements.count-1;
        }
        if(this.ajaxSearch.paginationElements.currentPage != i) {
          this.createLink(paginationHolder,startIndex,endIndex,i,i+1);
        } else {
          var b1 = document.createElement("b");
          b1.innerHTML = i+1;
          paginationHolder.appendChild(b1);
        }
      }
  },
  /**
   * @private
   */
  createLink: function(paginationHolder,sI,eI,current,innerText,elementClass) {
      var element = document.createElement("a");
      if(elementClass) {
        element.className = elementClass;
      }
      VYRE.Utils.addEvent(element,"mousedown",function(ajaxSearch,s,e,curr) {
        return function () {
          ajaxSearch.setSortRange(s,e,curr);
          ajaxSearch.search();
        };
      }(this.ajaxSearch,sI,eI,current));
    if(typeof innerText == "object") {
      element.appendChild(innerText.cloneNode(true));     
    } else {
        element.appendChild( document.createTextNode(innerText));
    }
      paginationHolder.appendChild(element);
  }
};



VYRE.Date = function(){
  this.date = new Date();
};


VYRE.Date.prototype = {

  LuceneToVyre : function(str, isUSDate) {
      this.setLuceneString(str);
      return this.getVyreString(isUSDate);
  },
  
  VyreToLucene : function(str, isUSDate) {
      this.setVyreString(str,isUSDate);
      return this.getLuceneString();
  },
  
  
  setLuceneString : function( str ) {
      this.date.setYear( parseInt(str.substring(0,4)));
      this.date.setMonth( parseInt( str.substring(4,6),10)-1 );
      this.date.setDate( parseInt(str.substring(6,8),10) );   
      if(str.substring(8,10) && str.substring(10,12)) {
          this.date.setHours( parseInt(str.substring(8,10),10) );
          this.date.setMinutes( parseInt(str.substring(10,12),10) );
      } else {
          this.date.setHours(0);
          this.date.setMinutes(0);
      }
  },
  
  setVyreString : function( str , isUSDate ) {
      var dateArr1 = str.split(" ");
      if(dateArr1[0]) {
        var dateArr2 = dateArr1[0].split(".");
        if(dateArr2.length == 3) {
           this.date.setYear( parseInt(dateArr2[2]) );
         if(isUSDate && isUSDate == true) {
           this.date.setMonth( parseInt(dateArr2[0], 10) -1 );
           this.date.setDate( parseInt(dateArr2[1], 10) );
         } else {
           this.date.setMonth( parseInt(dateArr2[1], 10) -1 );
           this.date.setDate( parseInt(dateArr2[0], 10) );
         }
        }
      }
      if(dateArr1[1]) {
          this.date.setHours( parseInt(dateArr1[1].split(":")[0],10) );
          this.date.setMinutes( parseInt(dateArr1[1].split(":")[1],10) );
      } else {
          this.date.setHours(0);
          this.date.setMinutes(0);
      }      
  }, 
  
  getVyreString : function(isUSDate) {
      var str = "";
      if(isUSDate && isUSDate ==true) {
        str = this.addLeadingZero(this.date.getMonth()+1) +"."+this.addLeadingZero(this.date.getDate())+"."+ (this.date.getFullYear());      
      } else {
        str = this.addLeadingZero(this.date.getDate())+"."+this.addLeadingZero(this.date.getMonth()+1)+"."+ (this.date.getFullYear());            
      }
      str +=" "+this.addLeadingZero(this.date.getHours())+":" + this.addLeadingZero(this.date.getMinutes());     
      return str;      
  },
  
  getLuceneString : function() {
     return    this.addLeadingZero(this.date.getFullYear())+
               this.addLeadingZero(this.date.getMonth()+1)+
               this.addLeadingZero(this.date.getDate()) +
               this.addLeadingZero(this.date.getHours())+
               this.addLeadingZero(this.date.getMinutes()+1) +"00";
               
  }, 
  
  setJSDate : function(date) {
    this.date = date;
  },
  
  getJSDate : function(){
    return this.date;
  },
  addDays : function(days) {
    this.date.setDate(this.date.getDate() + days);
  },
  
  daysDifference: function(vyreDate) {
    return VYRE.Utils.daysBetween(this.date, vyreDate.getJSDate());
  },
  addLeadingZero : function(num) {
    if(num <10) { return "0"+num;}
    else { return ""+num};
  }
};

/**
 * Add replaceAll method to String class
 */
if(typeof(String.prototype.replaceAll) != "function") {
    String.prototype.replaceAll = function(a,b){
       return this.split(a).join(b);
    };
}
/**
 * Add push method to Array Class(ie5)
 */
if(typeof(Array.prototype.push) != "function") {
    Array.prototype.push = function(ob){
        this[this.length] = ob;
    };
}

if (typeof String.prototype.trim == "undefined") {
    String.prototype.trim = function () {
        var s = this.replace(/^\s*/, "");
        return s.replace(/\s*$/, "");
    };
}
if (typeof Date.prototype.getFullYear == "undefined") {
  Date.prototype.getFullYear = function() {
    var y = this.getYear();
    if (y < 1900) y += 1900;
    return y;
  };
}
if (typeof String.prototype.supplant == "undefined") {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}
/**
 * @public
 * @singleton
 */
VYRE.Utils = {
    
    
      getElementsByClassName: function(oElm, strTagName, strClassName){
        var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
        var arrReturnElements = new Array();
        strClassName = strClassName.replace(/-/g, "\-");
        var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
        var oElement;
        for(var i=0; i<arrElements.length; i++){
          oElement = arrElements[i];
          if(oRegExp.test(oElement.className)){
            arrReturnElements.push(oElement);
          }
        }
        return (arrReturnElements);
      },
      getFirstElementByClassName: function(oElm, strTagName, strClassName){
        var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
        strClassName = strClassName.replace(/-/g, "\-");
        var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
        var oElement;
        for(var i=0; i<arrElements.length; i++){
          oElement = arrElements[i];
          if(oRegExp.test(oElement.className)){
            return oElement;
          }
        }
        return null;
      },
      getContainer : function(container,  containerNamespace , tagType) {
          if(containerNamespace != null) {
              var currentElement = VYRE.Utils.gE(containerNamespace);
              if(currentElement != null){
                  return  VYRE.Utils.getFirstElementByClassName(currentElement,tagType,container);
              }
          } else {
            return this.gE(container);           
          }
      },
      gE: function(id) {
        return document.getElementById(id);
      },
      elementExists: function(id) {
        return (this.gE(id) != null);
      },
      show: function(id) {
        if(this.elementExists(id)) {
          this.gE(id).style.display = "block";
        }
      },
      hide: function(id) {
        if(this.elementExists(id)) {
          this.gE(id).style.display = "none";
        }
      },
      setHTML: function(id,html) {
        if(this.elementExists(id)) {
          this.gE(id).innerHTML = html;
        }
      },
      getElementValue: function(id) {
        if(this.elementExists(id)) {
          return this.gE(id).value;
        }
        return '';
      },
      clearFormAction: function(portletId){
        if(this.gE("portlet.search.view_"+portletId)){
         this.gE("portlet.search.view_"+portletId).action='';
         this.gE("portlet.search.view_"+portletId).onsubmit = function() { return false;};
        }
      },
      addLoadEvent: function(func) {
        var oldonload = window.onload;
        if (typeof window.onload != 'function') {
         window.onload = func;
        } else {
         window.onload = function() {
           if (oldonload) {
             oldonload();
           }
           func();
         };
        }
      },
      
      purge : function(d) {
        if(( VYRE.Utils.getBrowserName()=="Microsoft Internet Explorer") &&
           (VYRE.Utils.getBrowserVersion() <= 6))
        {
             var a = d.attributes, i, l, n;
             if (a) {
                l = a.length;
                 for (i = 0; i < l; i += 1) {
                     n = a[i].name;
                     if (typeof d[n] === 'function') {
                         d[n] = null;
                     }
                 }
             }
             a = d.childNodes;
             if (a) {
                 l = a.length;
                 for (i = 0; i < l; i += 1) {
                     purge(d.childNodes[i]);
                 }
             }
        }
      },
      addEnterKeyListener: function(element, func){
        if(this.elementExists(element)) {
           this.gE(element).value = '';
            if (document.layers){ document.captureEvents(Event.KEYDOWN);}
            this.gE(element).onkeydown = function(func) {
              return function (evt) {
                if (!evt) {var evt = window.event;}
                if(evt.keyCode){ keyCode = evt.keyCode; }//for IE
                if(evt.which) {keyCode = evt.which;} //for other browsers
                if (keyCode == 13) {
                    func();
                }
              };
            }(func);
        }
      },
      /**
       * a = action :"add","remove","swap"
       * o = html element
       * c1 = className 1
       * c2 = className 2(when action = "swap")
       */
      editClassName: function(a,o,c1,c2) {
        switch (a){
        case 'swap':
          o.className=!this.editClassName('check',o,c1)?o.className.replace(c2,c1):o.className.replace(c1,c2);
        break;
        case 'add':
          if(!this.editClassName('check',o,c1)){o.className+=o.className?' '+c1:c1;}
        break;
        case 'remove':
          if(this.editClassName('check',o,c1)){
            var rep=o.className.match(' '+c1)?' '+c1:c1;
            o.className=o.className.replace(rep,'');
          }
        break;
        case 'check':
          return new RegExp('\\b'+c1+'\\b').test(o.className);
        break;
        }
      },
      getBrowserName: function () {
        return navigator.appName;
      },
      getBrowserVersion: function() {
          return  parseFloat(navigator.appVersion);
      },
      getURLParameters: function() {
          var url = window.location.href;
          var urlParameters = [];
          if(url.indexOf("?") != -1) {
            var queryStrings = url.split("?")[1].split("&");
            for(var i = 0; i< queryStrings.length; i++) {
              var params = queryStrings[i].split("=");
              if(params.length ==2) {
                urlParameters.push(new UrlParameter(params[0],params[1].replaceAll("\+"," ")));
              }
            }
          }
          return urlParameters;
      },
      getURLValue: function(value){
        var queryParams = this.getURLParameters();
        for(var i =0;i<queryParams.length;i++){
          if(queryParams[i].name == value){
            return queryParams[i].value;
          }
        }
        return null;
      },
      getURLValues: function(value) {
        var queryParams = this.getURLParameters();
        var arr = null;
        for(var i = 0; i<queryParams.length; i++){
          if(queryParams[i].name == value) {
            if(arr == null){
              arr = new Array();
            }
            arr.push(queryParams[i].value);
          }
        }
        return arr;
  }, 
  makeImage: function(imageSrc){
  return this.createElement({tag:'img',src:imageSrc});
  },
  createElement : function(properties) {
    var element = null;
    if(properties && properties.tag) {
      element = document.createElement(properties.tag);
    if(properties.src) {element.setAttribute("src", properties.src);}
    if(properties.className) {element.className = properties.className;}
    if(properties.innerText) {element.appendChild(document.createTextNode(properties.innerText));}
    if(properties.id) {element.setAttribute("id",properties.id);}
    if(properties.type) {element.setAttribute("type",properties.type);}
    if(properties.href) {element.setAttribute("href",properties.href);}
    if(properties.value) {element.value = properties.value;}
    }
    return element;
  },
  daysBetween : function(date1, date2) {
  // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);
    
    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY);
  },
  addEvent : function( obj, type, fn ) {
	if ( obj.attachEvent ) {
	    obj['e'+type+fn] = fn;
	    obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
	    obj.attachEvent( 'on'+type, obj[type+fn] );
	  } else
    obj.addEventListener( type, fn, false );
  },
  removeEvent:function( obj, type, fn ) {
	if ( obj.detachEvent ) {
	    obj.detachEvent( 'on'+type, obj[type+fn] );
	    obj[type+fn] = null;
	} else
	    obj.removeEventListener( type, fn, false );
   }
};
/**
 * @public
 * @singleton
 * @static
 */
VYRE.Utils.Logger ={
    /**
     * @private
     */
    logging : false,
    customLogging:false,
    setLogging: function(value){
      this.logging = value;
    },
    write: function(message,type) {
      if(this.logging == true) {
          var currentTime = new Date();
          var timeString = "["+currentTime.toLocaleTimeString()+"] ";
          if(typeof console !='undefined' && navigator.appCodeName =="Mozilla") {
              try{
                console[type](timeString+message);
              } catch (e){}         
          } 
         if(typeof DebugConsole !="undefined" && this.customLogging ==true) {
             DebugConsole.log(timeString+message)
         }
          
      }
    },
    info: function(message) {
      this.write(message,"info");
    },
    warn: function(message) {
      this.write(message,"warn");
    },
    error: function (message) {
      this.write(message,"error");
    },
    log: function(message) {
      this.write(message,"log");
    }
};

VYRE.Utils.Timer = function() {
    var startTime;
    var end;
    var lastTiming = 0;
};

VYRE.Utils.Timer.prototype = {
    
    start: function(){
        this.startTime = new Date();
    },
    
    stop: function() {
        this.end = new Date();
        this.lastTiming = this.end.getTime() - this.startTime.getTime();
        return this.lastTiming;
    },
    
    getLastTiming : function() {
        return this.lastTiming;
    }
};

/**
 * @class
 * @constructor
 */
VYRE.Utils.ArrayList = function() {
    /**
     * @private
     */
    this.aList = new Array();
}
VYRE.Utils.ArrayList.prototype = {
    add: function(ob){
        this.aList.push(ob);
    },
    set: function(ob) {
        var objectExists = false;
        if(ob.equals) {
            for(var i = 0;i<this.aList.length;i++) {
                if(ob.equals) {
                    if(ob.equals(this.aList[i])) {
                        this.aList[i] = ob;
                        objectExists = true;
                    }
                }
            }
            if(objectExists == false) {
                this.add(ob);
            }
        }

    },
    remove: function(ob){
        for(var i = 0;i<this.aList.length;i++) {
            if(ob.equals) {
                if(ob.equals(this.aList[i])) {
                    this.aList.splice(i,1);
                }
            }
        }     
    },
    clear:function(){
        this.aList = new Array();
    },
    get: function(index) {
        if(index < this.aList.length) {
            return this.aList[index];
        }
        VYRE.Utils.Logger.warn("Array - Index out of bounds");
    },
    contains: function(ob) {
        if(ob.equals) {
            for(var i = 0;i<this.aList.length;i++) {
                if(ob.equals) {
                    if(ob.equals(this.aList[i]) == true) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    each: function(func) {
        if(typeof func =="function") {
           for(var i = 0;i<this.aList.length;i++) {
               func(this.aList[i], i);
           }
        }
    },
    size: function() {
        return this.aList.length;
    },
    toArray: function(){
        return this.aList.concat();//concat() is same as clone()
    },
    fromArray: function(arr){
        this.aList = arr.concat();//concat() is same as clone()
    }
};


/**
 * @singleton
 * @static
 */
 VYRE.Utils.Cookie = {
    create: function(name,value,days){
      if (days) {
         var date = new Date();
         date.setTime(date.getTime()+(days*24*60*60*1000));
         var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = name+"="+value+expires+"; path=/";
    },
    read: function(name) {
       var nameEQ = name + "=";
       var ca = document.cookie.split(';');
       for(var i=0;i < ca.length;i++) {
         var c = ca[i];
         while (c.charAt(0)==' ') c = c.substring(1,c.length);
         if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
       }
       return null;
    },
    erase: function(name) {
      createCookie(name,"",-1);
    }
 }


VYRE.Plugins = {};

/**
 * @class
 * @constructor
 */
VYRE.Plugins.CountPlugin = function(counts,label,index) {
    /**
    * @private
    */
    this.label = label;
    /**
     * @private
     */    
    this.counts = counts;
    /**
     * @private
     */    
    this.ajaxSearch = null;
    /**
     * @private
     */    
    this.divs = new Array();
    /**
     * @private
     */    
    this.index = index;
  }


  VYRE.Plugins.CountPlugin.prototype = {
      
      /**
       * @ignore
       */
      initialise: function (){
        this.changeCount(this.counts[this.index],false);
      },

      /**
       * @ignore
       */
      getHTML: function(ajaxSearch) {
        this.ajaxSearch = ajaxSearch;
        var itemsPerPage = document.createElement("div");
        itemsPerPage.setAttribute("id","itemsPerPage");
        var label = document.createElement("label")
        label.appendChild(document.createTextNode(this.label));
        itemsPerPage.appendChild(label);
        for(var i = 0;i<this.counts.length;i++) {
          var div = document.createElement("div");
          div.appendChild(document.createTextNode(""+this.counts[i]));
          div.className = "itemCount";
          VYRE.Utils.addEvent(div,"mousedown",function (instance, count) {
            return function () {
              instance.changeCount(count, true);
            }
          }(this,this.counts[i]));
          itemsPerPage.appendChild(div);
          this.divs.push(div);
        }
        return itemsPerPage;
      },

      /**
       * @ignore
       */
      loadConfig: function(config, noSort) {
        this.changeCount(config.resultsPerPage,false,noSort);
      },

      /**
       * @ignore
       */
      changeCount: function (count, search,noSort) {
        for(var i = 0;i<this.counts.length;i++) {
          if(this.counts[i] == count ) {
            VYRE.Utils.editClassName("add",this.divs[i],"countActive");
            this.ajaxSearch.setResultCount(this.counts[i],noSort);
            if(search) {
              this.ajaxSearch.search();
            }
          } else {
            VYRE.Utils.editClassName("remove",this.divs[i],"countActive");
          }
        }

      }
  };

/**
 * To be used with table sort
 * @class
 * @constructor
 */
 Header = function(ind,sort, defaultDescending) {
     this.index = ind;
     this.sortField = sort;
     this.defaultDescending = false;
     if(typeof defaultDescending !== "undefined") {
        this.defaultDescending = defaultDescending;
     }
     this.equals = function(ob) {
         return this.sortField == ob.sortField;
     }
 }

/**
 * @class
 * @constructor
 */
 VYRE.Plugins.TableSorter = function(headers,tableId) {
     /**
     * @private
     */
     this.headers = headers;
        /**
     * @private
     */
    
     this.tableId = tableId;
     /**
     * @private
     */
     this.ajaxSearch = null;
 }


 VYRE.Plugins.TableSorter.prototype = {
     
    /**
     * @ignore
     */
    initialise: function(ajaxSearch) {
        this.ajaxSearch = ajaxSearch;
    },
    /**
     * @ignore
     */
    invokeLater: function(){
      var element = VYRE.Utils.getContainer(this.tableId,this.ajaxSearch.containerNamespace,"table");
      if(element) {
        var ths = element.getElementsByTagName("th");
        for(var i = 0;i<this.headers.length; i++) {
          if(ths[this.headers[i].index]) {
            if(( VYRE.Utils.getBrowserName()=="Microsoft Internet Explorer") && (VYRE.Utils.getBrowserVersion() <= 5.5)) {
              ths[this.headers[i].index].style.cursor = "hand";
            } else {
              ths[this.headers[i].index].style.cursor = "pointer";
            }
             VYRE.Utils.editClassName("add",ths[this.headers[i].index],"sortable");
             
            if(this.ajaxSearch.getSortField() == this.headers[i].sortField) {
              if(this.ajaxSearch.isDescending() == true) {
                VYRE.Utils.editClassName("remove",ths[this.headers[i].index],"up");
                VYRE.Utils.editClassName("add",ths[this.headers[i].index],"down");
              } else {
                VYRE.Utils.editClassName("remove",ths[this.headers[i].index],"down");
                VYRE.Utils.editClassName("add",ths[this.headers[i].index],"up");
              }
            } else {
              VYRE.Utils.editClassName("remove",ths[this.headers[i].index],"up");
              VYRE.Utils.editClassName("remove",ths[this.headers[i].index],"down");
            }

            VYRE.Utils.addEvent(ths[this.headers[i].index],"mousedown", function(ajaxSearch, header) {
              return function() {
                if(ajaxSearch.getSortField() == header.sortField) {
                  ajaxSearch.setDescending(!ajaxSearch.isDescending());
                } else {
                  ajaxSearch.setSortField(header.sortField);
                  ajaxSearch.setDescending(header.defaultDescending);
                }
                ajaxSearch.sortedSearch();
              }
            }(this.ajaxSearch, this.headers[i]));
          }
        }
      } else {
         VYRE.Utils.Logger.warn("Tablesort table cannot be found!");
      }
    }

 };

 /**
  * To Be used with filter plugin
  * @class
  * @constructor
  * id = HTML Element Id (selectbox/inputbox etc)
  * searchAttribute =lucene prefix(name, att34, ITEM_LINK_DEF2 etc)
  * type = input type (text/select/radio)
  */
 FilterPluginField = function( id, searchAttribute, type ) {
   this.id = id;
   this.searchAttribute = searchAttribute;
   if ( type ) {
     this.type = type;
   } else {
     this.type = "select";
   }
 }
 FilterPluginField.prototype.equals = function(ob){
    if(ob.equals && ob.searchAttribute){
       return this.searchAttribute == ob.searchAttribute;
    }
    return false;
 }

/**
 * @class 
 * @constructor
 */
 VYRE.Plugins.FilterPlugin = function( field,search) {
    /**
     * @private
     */
    this.searchInstance = null;
    /**
     * @private
     */
    this.field = field;
    if(this.field.id == null) {
      VYRE.Utils.Logger.warn("Filter Plugin contains undefined Id");
    }
   if(search) {
     this.doSearch = search;
   }
 }


 VYRE.Plugins.FilterPlugin.prototype = {
   
   /**
    * @ignore
    */
   initialise: function() {
   },
   
   /**
    * @ignore
    */
   getHTML: function(searchInstance) {
     this.searchInstance = searchInstance;
     this.searchInstance.attributes.set(new VYRE.Attribute(this.field.searchAttribute, ""));
   if(VYRE.Utils.gE(this.field.id)){
       if ( this.field.type == 'select' ) {
         VYRE.Utils.addEvent(VYRE.Utils.gE(this.field.id),"change", function(instance) {
           return function () {
             instance.changeValue(this[this.selectedIndex].value);
             if(instance.doSearch) {
                instance.searchInstance.sortedSearch();
             }
           }
         }(this));
  
       } else if ( this.field.type == 'text' ) {
         VYRE.Utils.addEnterKeyListener(this.field.id,this.sortedSearch(this));
         VYRE.Utils.addEvent(VYRE.Utils.gE(this.field.id),"change", function(instance) {
           return function () {
             instance.changeValue(this.value);
           }
         }(this));
  
       } else if ( this.field.type == 'checkbox' ) {
         VYRE.Utils.addEvent(VYRE.Utils.gE(this.field.id),"click", function(instance) {
           return function () {
         if ( this.checked ) {
               instance.changeValue("1");
         } else {
           instance.changeValue("0");
         }
             if(instance.doSearch) {
                instance.searchInstance.sortedSearch();
             }
           }
         }(this));
  
       } else {
         VYRE.Utils.Logger.warn("field type '" + this.field.type + "' is not supported");
       }
     } else {
        VYRE.Utils.Logger.warn("'"+this.field.id+"' does not exist");
     }
     return null;
   },

   /**
    * @ignore
    */
   loadConfig: function( config ) {
     if ( config.attributes.length == 0) {
       this.changeValue("");
       if ( this.field.type == 'checkbox' ) {
     VYRE.Utils.gE(this.field.id).checked = false;
     } else {
         VYRE.Utils.gE(this.field.id).value = "";
     }
     } else {
      for ( var i = 0; i < config.attributes.length; i++ ) {
       if ( config.attributes[i].name == this.field.searchAttribute ) {
     this.changeValue(config.attributes[i].value);
     if ( this.field.type == 'checkbox' ) {
       if ( config.attributes[i].value == '1' ) {
         VYRE.Utils.gE(this.field.id).checked = true;
         } else {
       VYRE.Utils.gE(this.field.id).checked = false;
       }
     } else {
           VYRE.Utils.gE(this.field.id).value = config.attributes[i].value;
       }
       }
      }
     }
   },
   
   /**
    * @ignore
    */
   sortedSearch: function(instance){
     return function(){
        instance.changeValue(VYRE.Utils.getElementValue(instance.field.id));
        instance.searchInstance.sortedSearch();
     }
   },
   
   /**
    * @ignore
    */
   changeValue: function( value ) {
     this.searchInstance.attributes.set(new VYRE.Attribute(this.field.searchAttribute,value));
   }
};

  /**
   * @class
   * @constructor
   */
  VYRE.Plugins.SortPlugin = function(descs,sortFields,index) {
    /**
     * @private
     */
    this.descs = descs;
    /**
     * @private
     */
    this.sortFields = sortFields;
    /**
     * @private
     */
    this.ajaxSearch = null;
    /**
     * @private
     */    
    this.index = index;
    /**
     * @private
     */    
    this.divs = new Array();
  }

  VYRE.Plugins.SortPlugin.prototype = {
      
      /**
       * @ignore
       */
      initialise: function (){
        this.changeSort(this.descs[this.index],this.sortFields[this.index],false);
      },

      /**
       * @ignore
       */
      getHTML: function(ajaxSearch) {
        this.ajaxSearch = ajaxSearch;
        var sortBy = document.createElement("div");
        sortBy.setAttribute("id","sortBy");
        var label = document.createElement("label");
        label.appendChild(document.createTextNode("Date: "));
        sortBy.appendChild(label);
        for(var i=0;i<this.sortFields.length;i++) {
          if(i ==2) {
            var label2 = document.createElement("label");
            label2.appendChild(document.createTextNode("Name: "));
            sortBy.appendChild(label2);
          }
          var div = document.createElement("div");
          div.className = "sortBy";
          innerDiv = document.createElement("div");
          innerDiv.appendChild(document.createTextNode(" "));
          if(i%2 == 0) {
            innerDiv.className = "up";
          } else {
            innerDiv.className = "down";
          }
          div.appendChild(innerDiv);
          VYRE.Utils.addEvent(div,"mousedown", function (instance, desc, sort) {
            return function () {
              instance.changeSort(desc,sort, true);
            }
          }(this,this.descs[i],this.sortFields[i]));
          sortBy.appendChild(div);
          this.divs.push(div);
        }
        return sortBy;
      },

      /**
       * @ignore
       */
      loadConfig: function(config,noSort) {
        this.changeSort(config.sortDesc,config.sortField,false,noSort);
      },

      /**
       * @ignore
       */
      changeSort: function (desc,sort, search,noSort) {
        for(var i=0;i<this.divs.length;i++) {
          if(this.descs[i] == desc && this.sortFields[i] == sort ) {
            VYRE.Utils.editClassName("add",this.divs[i],"sortByActive");
            this.ajaxSearch.setDescending(this.descs[i],noSort);
            this.ajaxSearch.setSortField(this.sortFields[i],noSort);
            if(search) {
              this.ajaxSearch.sortedSearch();
            }
          } else {
             VYRE.Utils.editClassName("remove",this.divs[i],"sortByActive");
          }
        }
      }
  };

  /**
  * View object for view switching - Used with ListPlugin
  * @class View
  * @param {String} name of the view
  * @param {Object} xslId which displays the view
  * @constructor
  */
  View = function(name,xslId) {
    this.name = name;
    this.xslId = xslId;
    this.equals = function(ob){
        return this.xslId == ob.xslId;
    }
  }

  /**
  * Class to change view of a list
  * @class ListPlugin
  * @constructor
  * @param {Array} xsls:Array of View obkects
  * @param {Object} instance:AjaxSearch INstance
  * @param {int} index:Initialises with specified index
  */
  VYRE.Plugins.ListPlugin = function(xsls,index) {
    /**
     * @private
     */
    this.xsls = xsls;
    /**
     * @private
     */
    this.index = index;
    /**
     * @private
     */
    this.divs = new Array();
  }

  /**
  * Method declarations for @class ListPlugin
  */
  VYRE.Plugins.ListPlugin.prototype = {

      /**
      * Initialises a Default state
      * @method initialise
      * @ignore
      */
      initialise: function() {
        this.changeList(this.xsls[this.index].xslId,false);
      },

      /**
      * Creates html nodes and attaches events for the plugin
      * @method getHTML
      * @return {HTML Element} html node to append
      * @ignore
      */
      getHTML: function(ajaxSearch){
        this.ajaxSearch = ajaxSearch;
        list = document.createElement("div");
        list.setAttribute("id","listview");
        var label = document.createElement("label");
        label.appendChild(document.createTextNode("View: "));
        list.appendChild(label);
        for(var i=0; i<this.xsls.length;i++) {
          var div = document.createElement("div");
          div.appendChild(document.createTextNode(this.xsls[i].name));
          div.className = "listview";
          VYRE.Utils.addEvent(div, "mousedown",function (instance, xslId) {
            return function () {
              instance.changeList(xslId, true);
            }
          }(this,this.xsls[i].xslId));
          list.appendChild(div);
          this.divs.push(div);
        }
        return list;
      },

      /**
      * Callback methods from AjaxSearch, used for plugins and triggers
      * @method loadConfig
      * @ignore
      * @param {Object} Config: Object passed from AjaxSearch
      */
      loadConfig: function(config) {
        this.changeList(config.xslId,false);
      },

      /**
      * Changes the view
      * @method changeList
      * @param {int} xslId: new xslId to be displayed
      * @param {Boolean} search: if yes, performs search
      * @ignore
      */
      changeList: function(xslId, search) {
        for(var i=0;i<this.xsls.length;i++) {
          if(this.xsls[i].xslId == xslId ) {
            VYRE.Utils.editClassName("add",this.divs[i],"xslActive");
            this.ajaxSearch.setXslId(this.xsls[i].xslId);
            if(search) {
              this.ajaxSearch.search();
            }
          } else {
            VYRE.Utils.editClassName("remove",this.divs[i],"xslActive");
          }
        }
      }

  };//** End of ListPlugin Methods **/


DateRangeField = function(attributeId, lowerId, upperId, dateTime) {
  this.attributeId = attributeId;
  this.lowerId = lowerId;
  this.upperId = upperId;
  if(dateTime) {
    this.dateTime = true;
  } else {
    this.dateTime = false;
  }
};

VYRE.Plugins.DateRange = function( dateRangeField,search, isUSDate) {
    /**
     * @private
     */
    this.ajaxSearch = null;
    /**
     * @private
     */
    this.isUSDate = isUSDate;
    this.dateRangeField = dateRangeField;
    if(search) {
       this.doSearch = search;
    }
 }


 VYRE.Plugins.DateRange.prototype = {
   
   /**
    * @ignore
    */
   initialise: function() {
   },
   
   /**
    * @ignore
    */
   getHTML: function(ajaxSearch) {
     this.ajaxSearch = ajaxSearch;
     this.ajaxSearch.attributes.set(new VYRE.Attribute(this.dateRangeField.attributeId, ""));

      if(VYRE.Utils.gE(this.dateRangeField.upperId) && VYRE.Utils.gE(this.dateRangeField.lowerId)) {
        VYRE.Utils.addEvent(VYRE.Utils.gE(this.dateRangeField.lowerId),"change", function(instance){
           return function(){
            instance.change(true);
           } 
        }(this));
		VYRE.Utils.addEvent(VYRE.Utils.gE(this.dateRangeField.upperId),"change", function(instance){
		   return function(){
			instance.change(true);
		   } 
        }(this));
        VYRE.Utils.addEnterKeyListener(this.dateRangeField.upperId,this.sortedSearch(this));
        VYRE.Utils.addEnterKeyListener(this.dateRangeField.lowerId,this.sortedSearch(this));        
      }    

      return null;
   },

   /**
    * @ignore
    */
   loadConfig: function( config ) {
     if(config.attributes.length == 0) {
      VYRE.Utils.gE(this.dateRangeField.lowerId).value = "";
      VYRE.Utils.gE(this.dateRangeField.upperId).value = "";      
     } else {
       for(var i = 0; i<config.attributes.length; i++) {
        if(config.attributes[i].name == this.dateRangeField.attributeId) {
        var dateArr = config.attributes[i].value.replaceAll("[","").replaceAll("]","").split(" TO ");
        if(dateArr && dateArr[0] && dateArr[1]) {
          var fromDate = new VYRE.Date();
          var toDate = new VYRE.Date();
          var fromDateString = fromDate.LuceneToVyre(dateArr[0],this.isUSDate);
          var toDateString = toDate.LuceneToVyre(dateArr[1],this.isUSDate);
          if(!this.dateTime) {
            fromDateString = fromDateString.substring(0,10);
            toDateString = toDateString.substring(0,10);
          }
          if(VYRE.Utils.gE(this.dateRangeField.upperId) && VYRE.Utils.gE(this.dateRangeField.lowerId)) {
            VYRE.Utils.gE(this.dateRangeField.lowerId).value = fromDateString;
            VYRE.Utils.gE(this.dateRangeField.upperId).value = toDateString;
          }
        }     
        this.change();
        }
       }
     }
   },
   
   /**
    * @ignore
    */
   sortedSearch: function(instance){
     return function(){
        instance.change(true);
     }
   },
   
   /**
    * @ignore
    */
   change: function(search) {
     if(VYRE.Utils.gE(this.dateRangeField.upperId) && VYRE.Utils.gE(this.dateRangeField.lowerId)) {     
        var upperDateValue = VYRE.Utils.gE(this.dateRangeField.upperId).value;
        var lowerDateValue = VYRE.Utils.gE(this.dateRangeField.lowerId).value;
        if(upperDateValue != "" && lowerDateValue != "") {
          var lowerDate = new VYRE.Date();
          var upperDate = new VYRE.Date();
          var savedSearchString = "["+lowerDate.VyreToLucene(lowerDateValue,this.isUSDate)+" TO "+upperDate.VyreToLucene(upperDateValue,this.isUSDate)+"]";
          this.ajaxSearch.attributes.set(new VYRE.Attribute(this.dateRangeField.attributeId,savedSearchString));
          if(search) {
            this.ajaxSearch.sortedSearch();
          }
        }
     }
   }

   
};

  SortableAttribute = function(sortId, sortName) {
    this.sortId = sortId;
    this.sortName = sortName;
    this.equals = function(ob) {
        return this.sortId == ob.sortId;
    };
 
  };
  
  
  VYRE.Plugins.SortSelect = function(sortableAttributes, search) {
  
      this.sortableAttributes = sortableAttributes;
      this.sortableAttributesList = new VYRE.Utils.ArrayList();
      this.sortableAttributesList.fromArray(this.sortableAttributes);
      this.ajaxSearch = null;
      this.selectBox;    
      if(search) {
        this.doSearch = true;      
      } else {
        this.doSearch = false;
      }
      this.asc = null;
      this.desc = null;
  };
  
  VYRE.Plugins.SortSelect.prototype = {
    
      initialise: function(){
      },
      
      getHTML: function(ajaxSearch){
          this.ajaxSearch = ajaxSearch;
          var divContainer = document.createElement("div");
          divContainer.className = "sortablePlugin";
          var label = document.createElement("label");
          label.appendChild(document.createTextNode("Sort: "));         
          divContainer.appendChild(label);
          this.selectBox = document.createElement("select");
          var option = document.createElement("option");
          option.value= "";
          this.selectBox.appendChild(option);
          for(var i = 0; i< this.sortableAttributes.length; i++) {
            var option = document.createElement("option");
            if(this.sortableAttributes[i].sortId) {
                option.value = this.sortableAttributes[i].sortId;
            }
            option.appendChild(document.createTextNode(this.sortableAttributes[i].sortName));
            this.selectBox.appendChild(option);
          }
          VYRE.Utils.addEvent(this.selectBox,"change", function(instance) {
              return function(){
                instance.ajaxSearch.setSortField(this.value);
                instance.change();
                if(instance.doSearch) {
                  instance.ajaxSearch.sortedSearch();
                }
              };
          }(this));
          divContainer.appendChild(this.selectBox);
          
          this.asc = document.createElement("div");   
          var padder = document.createElement("div");
          padder.appendChild(document.createTextNode(" "));         
          this.asc.appendChild(padder);
          this.asc.className = "sortable";
          VYRE.Utils.addEvent(this.asc,"mousedown", function(instance) {
            return function(){
              instance.toggle();
                if(instance.doSearch) {
                  instance.ajaxSearch.sortedSearch();
                }
            };
          }(this));
          divContainer.appendChild(this.asc);          
          return divContainer;
      },
      
      loadConfig : function(config){
        if(config.sortField) {
          var tempAttribute = new SortableAttribute(config.sortField,"");
          if(this.sortableAttributesList.contains(tempAttribute)) {
            this.selectBox.value = config.sortField;
            this.ajaxSearch.setSortField(this.selectBox.value);
          } else {
            this.selectBox.value = "";
          }
          this.change(config.sortDesc);
        }
      },
      
      change : function(isDescending){
          if(typeof isDescending != "undefined") {
              this.ajaxSearch.setDescending(isDescending);
            if(this.asc) {
              if(isDescending) {
                 VYRE.Utils.editClassName("add",this.asc,"down");        
                 VYRE.Utils.editClassName("remove",this.asc,"up");  
              } else {
                 VYRE.Utils.editClassName("add",this.asc,"up");        
                 VYRE.Utils.editClassName("remove",this.asc,"down");  
              }
            }
          }
      },
      toggle: function(){
        this.change(!this.ajaxSearch.isDescending());
      }
  };
  

  Connector = function(name,connector) {
    this.name = name;
    this.connector = connector;
    this.equals = function(ob){
        return this.connector == ob.connector;
    }
  }

  VYRE.Plugins.ConnectorPlugin = function(connectors,label,index) {
    /**
     * @private
     */
    this.connectors = connectors;
    /**
     * @private
     */
    this.label = label;
    this.index = index;
    /**
     * @private
     */
    this.divs = new Array();
    this.ajaxSearch = null;
  }


  VYRE.Plugins.ConnectorPlugin.prototype = {

      initialise: function() {
        this.change(this.connectors[this.index].connector,false);
      },

      getHTML: function(ajaxSearch){
        this.ajaxSearch = ajaxSearch;
        list = document.createElement("div");
        list.setAttribute("id","listview");
        var label = document.createElement("label");
        label.appendChild(document.createTextNode(this.label));
        list.appendChild(label);
        for(var i=0; i<this.connectors.length;i++) {
          var div = document.createElement("div");
          div.appendChild(document.createTextNode(this.connectors[i].name));
          div.className = "listview";
          VYRE.Utils.addEvent(div,"mousedown",function (instance, connector) {
            return function () {
              instance.change(connector, true);
            }
          }(this,this.connectors[i].connector));
          list.appendChild(div);
          this.divs.push(div);
        }
        return list;
      },


      loadConfig: function(config) {
        this.change(config.connector,false);
      },


      change: function(connector, search) {
        for(var i=0;i<this.connectors.length;i++) {
          if(this.connectors[i].connector == connector ) {
            VYRE.Utils.editClassName("add",this.divs[i],"xslActive");
            this.ajaxSearch.setConnector(this.connectors[i].connector);
            if(search) {
              this.ajaxSearch.sortedSearch();
            }
          } else {
            VYRE.Utils.editClassName("remove",this.divs[i],"xslActive");
          }
        }
      }

  };
  
  ContentStore = function (storeId, storeName,xslId) {
	this.storeId = storeId;
	this.storeName = storeName
	this.xslId = xslId;

};

ContentStore.prototype = {
	equals : function (ob){
		if(ob.storeId) {
			return this.storeId == ob.storeId;
		}
	},
	toString : function(){
		return this.storeId +" " + this.xslId;
	}
};

  VYRE.Plugins.StoreSelect = function(contentStores, label) {
      this.contentStores = contentStores;
      this.label = label;
      this.ajaxSearch = null;
      this.selectBox = null;
  };
  
	VYRE.Plugins.StoreSelect.prototype = {

		initialise: function(){
		},

		getHTML: function(ajaxSearch){
			var self = this;
			this.ajaxSearch = ajaxSearch;
			var div = VYRE.Utils.createElement({tag:"div",className:"StorePlugin"});
			div.appendChild(VYRE.Utils.createElement({tag:"label",innerText:this.label}));
			this.selectBox = VYRE.Utils.createElement({tag:"select"});
			for(var i = 0; i< this.contentStores.length; i++){
				var contentStore = this.contentStores[i];
				var option = VYRE.Utils.createElement({
					tag:"option",
					value:contentStore.storeId,
					innerText:contentStore.storeName
				});
				this.selectBox.appendChild(option);
			}
			VYRE.Utils.addEvent(this.selectBox, "change", function () {
				self.change(this[this.selectedIndex].value);
				self.ajaxSearch.sortedSearch();
			});

			div.appendChild(this.selectBox);
			return div;
		},

		loadConfig : function(config){
			if(config.storeIds != undefined) {
				this.change(config.storeIds);
				this.selectBox.value = config.storeIds;
			}
		},

		change : function(storeId){
			for(var i = 0; i< this.contentStores.length; i++) {
				var contentStore = this.contentStores[i];
				if(contentStore.storeId == storeId) {
					this.ajaxSearch.getSearchAdapter().setStoreIds(storeId);
					this.ajaxSearch.setXslId(contentStore.xslId);
				}
			}
		}
  };
  
  
  
  
