function showData() { //inMandt, inBelnr, inGjahr ) {
	$.response.contentType = "application/json";
	
	var connection = $.hdb.getConnection();
	
	// Load procedure of specific schema
	var procedure = connection.loadProcedure("RM", "hushnud2");
	
	var results = procedure(); //inMandt, inBelnr, inGjahr);
	var body = JSON.stringify(results);
	
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(body);
	
	connection.close();
}

// var mandt = $.request.parameters.get("MANDT");
// var belnr = $.request.parameters.get("BELNR");
// var gjahr = $.request.parameters.get("GJAHR");

showData(); //mandt, belnr, gjahr);