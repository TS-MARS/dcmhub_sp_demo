"use strict";

var oConn = $.hdb.getConnection();


var sField = $.request.parameters.get('field');
var sTable = $.request.parameters.get('table');
var where = $.request.parameters.get('where');

 if (where !==""){
 var sQuery = "SELECT TOP 10000 " + sField + " FROM \"core.models::" + sTable +"\" WHERE "+where;
 }else{
 var sQuery = "SELECT TOP 10000 " + sField + " FROM \"core.models::" + sTable +"\"";
 }
 console.log(sQuery);
var oResultSet = oConn.executeQuery(sQuery);


	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(oResultSet,null,2));


oConn.close();