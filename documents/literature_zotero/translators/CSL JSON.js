{
	"translatorID": "bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7",
	"translatorType": 3,
	"label": "CSL JSON",
	"creator": "Simon Kornblith",
	"target": "json",
	"minVersion": "3.0b3",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcs",
	"lastUpdated": "2012-07-11 16:55:00"
}

var parsedData;
function detectImport() {
	const CSL_TYPES = {"article":true, "article-journal":true, "article-magazine":true,
		"article-newspaper":true, "bill":true, "book":true, "broadcast":true,
		"chapter":true, "dataset":true, "entry":true, "entry-dictionary":true,
		"entry-encyclopedia":true, "figure":true, "graphic":true, "interview":true,
		"legal_case":true, "legislation":true, "manuscript":true, "map":true,
		"motion_picture":true, "musical_score":true, "pamphlet":true,
		"paper-conference":true, "patent":true, "personal_communication":true,
		"post":true, "post-weblog":true, "report":true, "review":true, "review-book":true,
		"song":true, "speech":true, "thesis":true, "treaty":true, "webpage":true};
		
	var str, json = "";
	
	// Read in the whole file at once, since we can't easily parse a JSON stream. The 
	// chunk size here is pretty arbitrary, although larger chunk sizes may be marginally
	// faster. We set it to 1MB.
	while((str = Z.read(1048576)) !== false) json += str;
	
	try {
		parsedData = JSON.parse(json);	
	} catch(e) {
		Zotero.debug(e);
		return false;
	}
	
	if(typeof parsedData !== "object") return false;
	if(!(parsedData instanceof Array)) parsedData = [parsedData];
	
	for(var i=0; i<parsedData.length; i++) {
		var item = parsedData[i];
		if(typeof item !== "object" || !item.type || !(item.type in CSL_TYPES)) {
			return false;
		}
	}
	return true;
}

function doImport() {
	for(var i=0; i<parsedData.length; i++) {
		var item = new Z.Item();
		ZU.itemFromCSLJSON(item, parsedData[i]);
		item.complete();
	}
}

function doExport() {
	var item, data = [];
	while(item = Z.nextItem()) data.push(ZU.itemToCSLJSON(item));
	Z.write(JSON.stringify(data, null, "\t"));
}