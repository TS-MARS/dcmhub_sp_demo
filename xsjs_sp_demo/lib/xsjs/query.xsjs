function showData(field, table = "DUMMY", where) {
  $.response.contentType = "application/json";

  var connection = $.hdb.getConnection();

  // Load procedure of specific schema
  var results = connection.executeQuery(
    `SELECT CURRENT_SCHEMA "current schema" FROM ${table} WHERE ${where};`
  );

  var body = JSON.stringify(results);

  $.response.status = $.net.http.OK;
  $.response.contentType = "application/json";
  $.response.setBody(body);

  connection.close();
}

var mandt = $.request.parameters.get("field");
var belnr = $.request.parameters.get("table");
var gjahr = $.request.parameters.get("where");

showData(mandt, belnr, gjahr);
