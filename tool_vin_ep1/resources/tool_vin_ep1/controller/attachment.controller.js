sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function (Controller, JSONModel, NumberFormat) {
	"use strict";

	return Controller.extend("tool_vin_ep1.controller.attachment", {
		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode
			var oView = this.getView();
			var busyDialog = oView.byId("BusyDialog");
			busyDialog.setVisible(true);
			busyDialog.open();
			this._getDocObj().then(function (oModel) {
				var oSelectModel = oView.byId("dropdown");
				oSelectModel.setModel(oModel);
				busyDialog.close();
				busyDialog.setVisible(false);
			});
		},

		onEnter: function (e) {
			var oTableModel = new JSONModel();
			var oView = this.getView();
			var ob_id = e.mParameters.value;
			
			// ObjectId wildcards support
			ob_id = ob_id.replaceAll('%','%25');
			ob_id = ob_id.replaceAll('*','%25');
			// ObjectId empty spaces support
			ob_id = ob_id.replaceAll(' ','%20');			
			
			var ob_type = oView.byId("dropdown").getSelectedItem().mProperties.key;
			var busyDialog = this.getView().byId("BusyDialog");
			busyDialog.setVisible(true);
			busyDialog.open();

			this._getFileList(ob_id, ob_type).then(function (oModel) {
				var oTableModel = oView.byId("AttachListTable");
				oView.setModel(oModel);
				oTableModel.setModel(oModel);
				busyDialog.close();
				busyDialog.setVisible(false);
			});
		},

		onClick: function (e) {
			var that = this;
			var filename = e.oSource.oParent.mAggregations.cells[2].mProperties.text;
		    var arcDocId = filename.split('.')[0];
			var contentRep = e.oSource.oParent.mAggregations.cells[3].mProperties.text;

			switch(contentRep) {
			
				// BLOB attachments stored into ZTRUE_POINTER
				case ' ':
				case 'AD':
				case 'OF':	
				case 'DE':						
					this._openBlobAttachment(filename);
					break;
				
				// Saperion Content Server
				case 'Y1':
				case 'Y2':
					var url = this._getSaperionUrl(arcDocId);
					this._openUrlDocLink(url);
					break;
					
				// Imagemaster Content Server
				case 'A1':
				case 'A2':
				case 'A5':
					var url = this._getImagemasterUrl(arcDocId, contentRep);
					this._openUrlDocLink(url);
					break;
			} 		
		},
		
		_getSaperionUrl: function(arcDocId) {
			var url = "https://" + window.location.host + "/archlink.xsjs?arc_doc_id=" + arcDocId;
			return url;
		},
		
		_getImagemasterUrl: function(arcDocId, contentRep) {
			var url = "https://" + window.location.host + "/api/archlink/" +contentRep + "/" + arcDocId;
			return url;
		},
		
		_openUrlDocLink: function(url) {
			$.get({
				url: url,
				success: function (resp) {
					var data = resp;
					if (data && data.hasOwnProperty("docLink")) {
						var win = window.open(data.docLink, '_blank');
						win.focus();
					} else {
						console.error("error: ", data);
					}
				},
				async: false // to make it synchronous
			});
		},
		
		_openBlobAttachment: function (filename) {
			var that = this;
			var filePages = that._getFilePages(filename);

			for (var i = 1; i <= filePages; i++) {
				open("/attachments.xsjs?file=" + filename.replace('%','*') + "&page=" + Number(i));
			}
		},

		_getFileList: function (ob_id, ob_type) {
			var oAttachModel = this.getOwnerComponent().getModel("attachSet");
			var oTableModel = new JSONModel();
			var oDataColumn = {
				header: [],
				rows: []
			};
			var that = this;

			//init files dataset: this will load the business objects into the application DB table
			that._loadFiles(ob_id,ob_type);

			oDataColumn.header.push({
				BUSINESS_OBJECT_ID: "Business Object ID",
				DESCRIPTION: "Description",
				CREATE_DATE: "Create Date",
				FILENAME: "File Name",
				CONTENT_REP: "Content Rep.",
				FILETYPE: "File Type"
			});

			return new Promise(function (resolve, reject) {
				oAttachModel.read("/attachParameters(IP_BO_ID='" + ob_id + "',IP_BO='" + ob_type + "')/Results", {
					success: function (oResult) {
						//return Unique values from the xsodata service, removing duplicates
						var result = oResult.results.reduce((unique, o) => {
						//var result = oResult.results.reduce(function(unique, o) {
							if (!unique.some(obj => obj.BUSINESS_OBJECT_ID === o.BUSINESS_OBJECT_ID && obj.CREATE_DATE === o.CREATE_DATE && obj.DESCRIPTION ===
									o.DESCRIPTION && obj.FILENAME === o.FILENAME && obj.FILETYPE === o.FILETYPE)) {
								unique.push(o);
							}
							return unique;
						}, []);
						oResult.results = result;
						var filename = '';

						for (var i = 0; i < oResult.results.length; i++) {
							filename = '';
							if (that._getFilename(oResult.results[i].FILENAME_CUSTOM) == true) {
								filename = oResult.results[i].FILENAME_CUSTOM;
							} else if (that._getFilename(oResult.results[i].FILENAME_ETL) == true) {
								filename = oResult.results[i].FILENAME_ETL;
							} else if (that._getFilename(oResult.results[i].FILENAME_CR) == true) {
								filename = oResult.results[i].FILENAME_CR;
							}
							
							oDataColumn.rows.push({
								BUSINESS_OBJECT_ID: oResult.results[i].OBJNO,
								DESCRIPTION: oResult.results[i].DESCRIPTION,
								CREATE_DATE: oResult.results[i].CREATE_DATE,
								FILENAME: filename,
								CONTENT_REP: oResult.results[i].CONTENT_REP,
								FILETYPE: oResult.results[i].FILETYPE
							});
						}
						oTableModel.setData({
							columns: oDataColumn.header,
							rows: oDataColumn.rows
						});
						oTableModel.setSizeLimit(oDataColumn.rows.length);
						resolve(oTableModel);
					},
					error: function (oError) {
						oDataColumn = "";
						oTableModel.setData(oDataColumn);
						resolve(oTableModel);
						alert("Please refresh the page. An error has ocurred." + oError.message);
					}
				});
			});
		},

		_getFilename: function (filename) {
			var ret;
			$.get({
				url: "https://" + window.location.host + "/doesFileExist.xsjs?file=" + filename,
				success: function (data) {
					if (data == "true") {
						ret = true;
					} else {
						ret = false;
					}
				},
				async: false // to make it synchronous
			});
			return ret;
		},

		_getFilePages: function (filename) {
			var ret;
			$.get({
				url: "https://" + window.location.host + "/getFilePages.xsjs?file=" + filename,
				success: function (data) {
					ret = parseInt(data);
				},
				async: false // to make it synchronous
			});
			return ret;
		},

		_getDocObj: function () {
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oObjModel = oComponent.getModel("objSet");
			var oDropModel = new JSONModel();
			var oDataColumn = {
				rows: []
			};

			return new Promise(function (resolve, reject) {
				var oSelectModel = new JSONModel();
				oObjModel.read("/objParameters(IP_LANG='E')/Results", {
					success: function (oResult) {
						for (var i = 0; i < oResult.results.length; i++) {
							oDataColumn.rows.push({
								columnText: oResult.results[i].STEXT,
								columnTable: oResult.results[i].NAME
							});
						}
						oSelectModel.setData(oDataColumn);
						resolve(oSelectModel);
					},
					error: function (oError) {
						alert("Please refresh the page. An error has ocurred." + oError.message);
					}
				});

			});
		},
			_loadFiles: function (ob_id, ob_type) {
			$.get({
				url: "https://" + window.location.host + "/loadAttachments.xsjs?SapObject=" + ob_type + "&ObjectId=" + ob_id,
				success: function (data) {
					//TODO: handle data
				},
				async: false // to make it synchronous
			});
		}		
	});
});