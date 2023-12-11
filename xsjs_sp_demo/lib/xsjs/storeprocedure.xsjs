function showData(inMandt, inBukrs, inBelnr, inGjahr) {
  $.response.contentType = "application/json";

  var connection = $.hdb.getConnection();

  // Load procedure of specific schema
  var procedure = connection.loadProcedure("RM", "SP_BKFP");

  var results = procedure({
    IN_MANDT: inMandt, // 800,
    IN_BUKRS: inBukrs, // 3000,
    IN_BELNR: inBelnr, // 1900000270,
    IN_GJAHR: inGjahr  // 2013,
  });
  var body = JSON.stringify(results);

  $.response.status = $.net.http.OK;
  $.response.contentType = "application/json";
  $.response.setBody(body);

  connection.close();
}

var mandt = $.request.parameters.get("MANDT");
var bukrs = $.request.parameters.get("BUKRS");
var belnr = $.request.parameters.get("BELNR");
var gjahr = $.request.parameters.get("GJAHR");

showData(mandt, bukrs, belnr, gjahr);
