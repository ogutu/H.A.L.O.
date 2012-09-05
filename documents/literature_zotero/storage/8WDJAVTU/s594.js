  function stopDef(e) {
if (e &&e.preventDefault) e.preventDefault();
else if (window.event && window.event.returnValue)
window.eventReturnValue = false;
}

 
 var AtoZLinks = {"All":"","A":"a*","B":"b*","C":"c*","D":"d*","E":"e*","F":"f*","G":"g*","H":"h*","I":"i*","J":"j*","K":"k*","L":"l*","M":"m*","N":"n*","O":"o*","P":"p*","Q":"q*","R":"r*","S":"s*","T":"t*","U":"u*","V":"v*","W":"w*","X":"x*","Y":"y*","Z":"z*"};

 var AtoMLinks = {"All":"","A":"a*","B":"b*","C":"c*","D":"d*","E":"e*","F":"f*","G":"g*","H":"h*","I":"i*","J":"j*","K":"k*","L":"l*","M":"m*"}
 var NtoZLinks = {"N":"n*","O":"o*","P":"p*","Q":"q*","R":"r*","S":"s*","T":"t*","U":"u*","V":"v*","W":"w*","X":"x*","Y":"y*","Z":"z*"};
 VYRE.Plugins.LinkSearch = function(settings) {
      this.lucenePrefix = null;
      this.links= null;
      
      if( typeof settings != "undefined" ) {
          for( var property in this) {
              if(typeof settings[property] != "undefined") {
                  this[property] = settings[property];
              }
          }
      }        
      this.inverseLinks = {};
      for(var link in this.links) {
        this.inverseLinks[this.links[link]] = link;
      }
      this.ajaxSearch = null;
      this.linksMap = {};
  };
  
VYRE.Plugins.LinkSearch.prototype = {

    initialise: function(){
    },

    getHTML: function(ajaxSearch){
        var self = this;
        this.ajaxSearch = ajaxSearch;
        var div = VYRE.Utils.createElement({tag:"div",className:"AtoZPlugin"});
        var ul = VYRE.Utils.createElement({tag:"ul"});
        var currentLi = null;
        for(var link in this.links) {
            var li = VYRE.Utils.createElement({tag:"li"});
            var a = VYRE.Utils.createElement({tag:"a", href:"#", innerText:link});
            this.linksMap[link] = a;
            VYRE.Utils.addEvent(a,"click", function (link) {
                return function (e) {
                    self.change(link);
                    self.ajaxSearch.sortedSearch();
                    stopDef(e);
                }
            }(link));
            li.appendChild(a);
            ul.appendChild(li);
            currentLi = li;
        }
        li.className="last";
        div.appendChild(ul);
        return div;
    },

    loadConfig : function(config){
        var found = false;
        for(var i =0; i< config.attributes.length; i++) {
            if(this.lucenePrefix == config.attributes[i].name) {
                found = true;
                this.change(this.inverseLinks[config.attributes[i].value]);
            }
        }
        if(!found) {this.change(this.inverseLinks[""]);}
    },

    change : function(activeLink){
		for(link in this.linksMap) {
			var a= this.linksMap[link]
			VYRE.Utils.editClassName("remove",a,"active");
        }
        if(typeof activeLink != "undefined") {
            this.ajaxSearch.attributes.set(new VYRE.Attribute(this.lucenePrefix,this.links[activeLink]));

            var activeA = this.linksMap[activeLink];
            if(activeA) {
                VYRE.Utils.editClassName("add",activeA,"active");
            }
        }
    }
  };
  
  
