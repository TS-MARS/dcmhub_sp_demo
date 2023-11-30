/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

$.import("xsjs", "session");
var SESSIONINFO = $.xsjs.session;

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
*/
function usersCreate(param) {

	try {
		var after = param.afterTableName;

		//Get Input New Record Values
		var pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");
		var rs = null;
		var User = SESSIONINFO.recordSetToJSON(pStmt.executeQuery(), "Details");
		var applicationuser = $.session.getUsername();
		pStmt.close();

		pStmt = param.connection.prepareStatement("insert into \"CS.UiPersonalizationTable\" (\"USERNAME\", \"SUBAPPLICATIONID\", \"TABNAME\") values(?,?,?)");

		pStmt.setString(1,applicationuser);
		pStmt.setString(2, User.Details[0].SUBAPPLICATIONID.toString());
		pStmt.setString(3, User.Details[0].TABNAME.toString());

		pStmt.executeUpdate();
		pStmt.close();
		//		}
	} catch (e) {
		console.error(e);
		throw e;
	}
}