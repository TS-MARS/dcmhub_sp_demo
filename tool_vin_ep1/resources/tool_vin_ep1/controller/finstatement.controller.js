sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/format/NumberFormat",	
	"sap/ui/core/BusyIndicator",
	"sap/m/SearchField",
	"sap/ui/model/type/String",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/m/Token"	
//], function (Controller, JSONModel, Filter, FilterOperator, FilterType, ExportTypeCSV, exportLibrary, Spreadsheet) {
], function (Controller, JSONModel, Filter, FilterOperator, FilterType, ExportTypeCSV, NumberFormat,BusyIndicator,SearchField,String, exportLibrary, Spreadsheet, Token) {
//	var EdmType = exportLibrary.EdmType;
	return Controller.extend("tool_vin_ep1.controller.finstatement", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oFinanceModel = oComponent.getModel("FinanceSet");
			this.getView().setModel(oFinanceModel);	
			this._oClient = this.getView().byId("client");
			this._oCompanyCode = this.getView().byId("companycode");
			this._oChart = this.getView().byId("chart");
			this._oChart.setTokens(
				[new sap.m.Token({
					key: "ZGUH",
					text: "ZGUH(ZGUH)"
				})]
			);
			this._oLedger = this.getView().byId("ledger");
			this._oLedger.setTokens(
				[new sap.m.Token({
					key: "00",
					text: "00(00)"
				})]
			);				
			this._oVersion = this.getView().byId("version");
			this._oVersion.setTokens(
				[new sap.m.Token({
					key: "Z440",
					text: "Z440(Z440)"
				})]
			);	
			this._oLanguage = this.getView().byId("language");
			this._oLanguage.setTokens(
				[new sap.m.Token({
					key: "D",
					text: "D(D)"
				})]
			);	
			this._oAccount = this.getView().byId("account");
			this._oRyear = this.getView().byId("Ryear");
			this._oRyear.setTokens(
				[new sap.m.Token({
					key: "2017",
					text: "2017(2017)"
				})]
			);				
			this._oCyear = this.getView().byId("Cyear");
			this._oPeriodfrom = this.getView().byId("periodfrom");
			this._oPeriodto = this.getView().byId("periodto");
			this._oBusArea = this.getView().byId("barea");
			this.getView().addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode

			var that = this;
			var oPersonalizationService = sap.ushell.Container.getService("Personalization");
			var oScope = {
				keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
				writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
				clientStorageAllowed: true,
				validity: Infinity
			};
			var variantModel;
			oPersonalizationService.getContainer("sap.ushell.variant.FinState_vin_ep1", oScope, oComponent)
				.fail(function () {
					jQuery.sap.log.error("Loading personalization data failed.");
				})
				.done(function (oContainer) {
					that._oContainer = oContainer;
					variantModel = new sap.ui.model.json.JSONModel(oContainer.getItemKeys());
					that.getView().setModel(variantModel, "variants");
				});
		},
		
		onNavButtonPressMain: function () {

			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.navTo("launchpad", {}, true);

		},		

		onNavButtonPress: function (oEvent) {
			this.byId("pageContainer").to(this.getView().createId("page1"));
			this.byId("nextButtonId").setVisible(true);
		},		
		onPressNext: function (oEvent) {
			//Validation Call
			if(!this.inputValidation()){
				return false;
			}
			var that = this;
			BusyIndicator.show(0);
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oFinanceModel = oComponent.getModel("FinanceSet");
//			this.getView().setModel(oFinanceModel);
			
			var oView = this.getView();
			var oController = oView.getController();
			var oClient = oView.byId("client").getValue();
			var cCodetokens = oView.byId("companycode").getTokens();
			if(cCodetokens.length !== 0){
			var oCCode = oView.byId("companycode").getTokens()[0].getKey();
			}
			else{
				oCCode = "%25";
			}
			var oChart = oView.byId("chart").getTokens()[0].getKey();
			var oVersion = oView.byId("version").getTokens()[0].getKey();
			var oLedger = oView.byId("ledger").getTokens()[0].getKey();
			var oLanguage = oView.byId("language").getTokens()[0].getKey();
			var acctokens = oView.byId("account").getTokens();
			if(acctokens.length !== 0){
			var oAccount = oView.byId("account").getTokens()[0].getKey();
			}
			else{
				oAccount  = "%25";
			}
			var oRYear = oView.byId("Ryear").getTokens()[0].getKey();
			var oPeriodFrom = oView.byId("periodfrom").getValue();
			var oPeriodTo = oView.byId("periodto").getValue();
			var ctokens = oView.byId("Cyear").getTokens();
			if(ctokens.length !== 0){
			var oCYear = oView.byId("Cyear").getTokens()[0].getKey();
			}
			var bareatokens = oView.byId("barea").getTokens();
			if(bareatokens.length !== 0){
			var oBArea = oView.byId("barea").getTokens()[0].getKey();
			}
			else{
				oBArea = "%25";
			}
			var dataInput = 
			[{"oClient":oClient,"oCCode":oCCode,"oChart":oChart,"oVersion":oVersion,"oLedger":oLedger,"oLanguage":oLanguage,"oAccount":oAccount,
				"oRYear":oRYear,"oPeriodFrom":oPeriodFrom,"oPeriodTo":oPeriodTo,"oCYear":oCYear,"oBArea":oBArea
			}];
			var oInputModel = new JSONModel(dataInput);
			this.getView().setModel(oInputModel,"oInputModel");

			
			// If company code input has no value, default a wildcard
			// so the backend will inteprate as ALL
			if(oCCode === ""){
				oCCode = "%25";
			}
			else{
				var n = oCCode.indexOf("*");
				if(n !== -1)//There is a hit
				{
					oCCode.replace("*","%25");
				}
			}
		
			var oTableModel = new JSONModel();
			var oFinTree = [];
			var oFinTreeEnd = [];
			var ofaglext = [];
			var ofaglext1 = [];
 			var pPomise1 = new Promise((resolve, reject) => {
// 				// var oModel = new JSONModel("model/fintree.json");
// 				// oModel.attachRequestCompleted(function (oResult, oData) {
// 				// 	oFinTree = oResult.getSource().getData().d.results;
// 				// 	resolve();
// 				// });
 	//			oFinanceModel.read("/RF011QParameters(IP_MANDT='" + oClient + "',IP_VERSN='" + oVersion + "',IP_SPRAS='" + oLanguage + "')/Results", {	
  				oFinanceModel.read("/fintreeParameters(IP_MANDT='" + oClient + "',IP_VERSN='" + oVersion + "',IP_SPRAS='" + oLanguage + "')/Results", {						
// //					filters: aFilters,
				    sorters:  [new sap.ui.model.Sorter("ID")],
 					success: function (oResult) {
	
 						for (var i = 0; i < oResult.results.length; i++) {
 							var property = oResult.results[i];
							  if(property.TXTYP === 'A' ||  property.TXTYP === 'K' || property.TXTYP === null){
							  	oFinTree.push(property);
							  }	
							  if(property.TXTYP === 'E')
							  {
							  	oFinTreeEnd.push(property);
							  }
 								
 						}	
 						
 						
 						resolve();
 					},
 					error: function (oError) {
 						//
 					that.onPressNext();
 					}
 				});				
				
 			}).then(function(result)
 			{
 				
 			
			
//			pPromise1.then( (val)=>{
			var pPomise2 = new Promise((resolve, reject) => {
				// var oModel1 = new JSONModel("model/faglext.json");
				// oModel1.attachRequestCompleted(function (oResult, oData) {
				// 	ofaglext1 = oResult.getSource().getData().d.results
				// 	resolve();
				// });					
 			var oDataColumn = {
 				header:[],
 				rows: []
 			};
			var aFilter = [];
 			var aAccountTokens = that._oAccount.getTokens();
			aAccountTokens.map(function (oToken) {
				if (oToken.data("range")) {
					var oRange = oToken.data("range");
					aFilter.push(new Filter({
						path: "RACCT",
						operator: oRange.exclude ? "NE" : oRange.operation,
						value1: oRange.value1,
						value2: oRange.value2
					}));
				} else {
					aFilter.push(new Filter({
						path: "RACCT",
						operator: "EQ",
						value1: oToken.getKey()
					}));
				}
			});

 			var aCompanyTokens = that._oCompanyCode.getTokens();
			aCompanyTokens.map(function (oToken) {
				if (oToken.data("range")) {
					var oRange = oToken.data("range");
					aFilter.push(new Filter({
						path: "BUKRS",
						operator: oRange.exclude ? "NE" : oRange.operation,
						value1: oRange.value1,
						value2: oRange.value2
					}));
				} else {
					aFilter.push(new Filter({
						path: "BUKRS",
						operator: "EQ",
						value1: oToken.getKey()
					}));
				}
			});			
 			
 				oFinanceModel.read("/finstructureParameters(IP_MANDT='" + oClient + "',IP_GJAHR='" + oRYear + "',IP_KTOPL='"+oChart+"',IP_SPRAS='"+oLanguage+"',IP_VERSN='"+oVersion+"',IP_RLDNR='"+oLedger+"',IP_BUKRS='"+oCCode+"',IP_GJAHR2='" + oCYear + "',IP_RBUSA='" + oBArea + "')/Results", {				
 	//	oFinanceModel.read("/finstructureParameters(IP_MANDT='" + oClient + "',IP_GJAHR='" + oRYear + "',IP_KTOPL='"+oChart+"',IP_SPRAS='"+oLanguage+"',IP_VERSN='"+oVersion+"',IP_RLDNR='"+oLedger+"',IP_GJAHR2='" + oCYear + "',IP_RACCT='" + oAccount + "',IP_RBUSA='" + oBArea + "')/Results", {		
 //					urlParameters: {$top:2000},
					filters: aFilter,
					sorters:  [new sap.ui.model.Sorter("ERGSL")],
 					success: function (oResult) {
					//	var oLocale = sap.ui.getCore().getConfiguration().getLanguage();
					//	var oFloatFormat = NumberFormat.getFloatInstance(oLocale); 	
						
 						 for (var i = 0; i < oResult.results.length; i++) {
 						 	var property = oResult.results[i];
 						 	ofaglext.push(property); 
 						 }
		 			var oDataColumn = {
		 				header:[],
		 				rows: []
		 			}; 			 
	 			
 						var total = 0.00;
 						var totalc = 0.00;
 						var curr;
						var oLocale = sap.ui.getCore().getConfiguration().getLanguage();
						//var oLocale = "en"; //Formatting in the backend comes in English, so to handle it correctly we set the local to en
						var oFloatFormat = NumberFormat.getFloatInstance({
						  maxFractionDigits: 2,
						  groupingEnabled: true,
						  groupingSeparator: ",",
						  decimalSeparator: "."
						}); 			 			
 						 	var amount = 0.00;
	 			//debugger;
 			 	//Display the financial structure
 			 	for (var k = 0; k < oFinTree.length; k++)
 			 	{

								var bsitemstore;
 			 		var property = oFinTree[k];

 			 		//Skip first record
 			 		if(k !== 0)
 			 		{
 			 			//This is only processed at the end of a group or FS Items
 			 			if(property.ERGSL !== prevProperty.ERGSL){
 			 				// loop through the amount fields and add the balance accounts.
 			 				
 			 				for (var l = 0; l< ofaglext.length; l++)
 							{
 								var bsitem= ofaglext[l];
  								var amountHSL = 0.00;
								var amountTSL = 0.00;	
								var amountHSLc = 0.00;
								var amountTSLc = 0.00;
 								
 								if(bsitem.ERGSL === prevProperty.ERGSL)
 								{
 		 				 			amountHSL += oFloatFormat.parse(bsitem.HSLVT);
							 	//	amountTSL += oFloatFormat.parse(bsitem.TSLVT);
							 		amountHSLc += oFloatFormat.parse(bsitem.HSLVT_1);
							 	//	amountTSLc += oFloatFormat.parse(bsitem.TSLVT_1);	
							 		
							 			 for (var j = oPeriodFrom; j <= oPeriodTo; j++) {
										 	switch (j){
										 		case "1":
										 			amountHSL += oFloatFormat.parse(bsitem.HSL01);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL01);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL01_1);
										// 			amountTSLc += oFloatFormat.parse(bsitem.TSL01_1);
										 			break;
										 		case 2:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL02);
										// 			amountTSL += oFloatFormat.parse(bsitem.TSL02);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL02_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL02_1);
										 			break;
										 		case 3:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL03);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL03);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL03_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL03_1);
										 			break;
										 		case 4:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL04);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL04);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL04_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL04_1);
										 			break;
										 		case 5:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL05);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL05);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL05_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL05_1);
										 			break;
										 		case 6:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL06);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL06);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL06_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL06_1);
										 			break;
										 		case 7:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL07);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL07);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL07_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL07_1);
										 			break;
										 		case 8:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL08);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL08);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL08_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL08_1);
										 			break;
										 		case 9:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL09);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL09);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL09_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL09_1);
										 			break;
										 		case 10:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL10);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL10);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL10_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL10_1);
										 			break;
										 		case 11:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL11);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL11);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL11_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL11_1);
										 			break;
										 		case 12:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL12);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL12);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL12_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL12_1);
										 			break;
										 		case 13:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL13);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL13);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL13_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL13_1);
										 			break;
										 		case 14:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL14);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL14);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL14_1);
										 	//		amountTSLc += oFloatFormat.parse(bsitem.TSL14_1);
										 			break;
										 		case 15:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL15);
										 	//		amountTSL += oFloatFormat.parse(bsitem.TSL15);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL15);
										 	//		amountTSLc += oFloatFormat.parse(bsitem.TSL15);
										 			break;
										 		case 16:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL16);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL16);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL16);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL16);
										 			break;
							 			 	}
							 			 } 						
							 	 	if(amountHSL !== 0.00 || amountHSLc !== 0.00){
							 	 		amountHSL = amountHSL;
							 	 		amountHSLc = amountHSLc;
 								 		total += amountHSL;
 								 		totalc += amountHSLc;
  						 	     	    bsitem.TXT45 = bsitem.TXT50;
 								      	bsitem.CC_1 = Math.round(amountHSL*100)/100;
 								      	bsitem.CC_2 = Math.round(amountHSLc*100)/100;
 								      	bsitem.CC_3 = Math.round((amountHSL - amountHSLc)*100)/100;
 								      	if(amountHSLc !== 0.00)
 								      	{
 								      		bsitem.CC_4 = bsitem.CC_3/amountHSLc * 100;
 								      	}
 								      	curr = bsitem.RTCUR;
 								      	oDataColumn.rows.push(bsitem);
							 	 	}
 								 }
 							}

  							//After period and leaf loop - total the amount
 							if (totalc !== 0.00 || total !== 0.00 )
 						 		 	{
 						 		 	prevProperty.CC_1 = Math.round(total*100)/100;	
 						 		 	prevProperty.CC_2 = Math.round(totalc*100)/100;
 						 		 	prevProperty.CC_3 = Math.round((total - totalc)*100)/100;
 						 		 	if( totalc !== 0.00)
 						 		 	{
 						 		 		prevProperty.CC_4 = prevProperty.CC_3/totalc * 100;	
 						 		 	}

 						 			prevProperty.RACCT = "";
 						 			prevProperty.TXTYP = "T";
 						 			prevProperty.RTCUR = curr;
 						 			for (var m = 0; m < oFinTreeEnd.length; m++)
 						 			{
 						 				
 						 				if(prevProperty.ERGSL === oFinTreeEnd[m].ERGSL)
 						 				{
 						 					prevProperty.TXT45 = oFinTreeEnd[m].TXT45;
 						 				}
 						 			} 						 			
  					 		 		oDataColumn.rows.push(prevProperty);
  					 		 		total = 0.00;
 						 			totalc = 0.00;
 						 		 	}
 			 			}			
 			 		}
 			 		//Store the previous property
 			 	//	var prevProperty = JSON.parse(JSON.stringify(property));

 			 		if(property.TXTYP === 'A'){
 			 			oDataColumn.rows.push(property);
 			 		}
 			 		

 			 		var prevProperty = $.extend( {}, property );
 			 	}
 			 	// Last row processing
 						    total = 0.00;
 						 	totalc = 0.00;
 						 	
 			 				for (var l = 0; l< ofaglext.length; l++)
 							{
 								var bsitem= ofaglext[l];
  								var amountHSL = 0.00;
								var amountTSL = 0.00;	
								var amountHSLc = 0.00;
								var amountTSLc = 0.00;
 								
 								if(bsitem.ERGSL === prevProperty.ERGSL)
 								{
 		 				 			amountHSL += oFloatFormat.parse(bsitem.HSLVT);
							 	//	amountTSL += oFloatFormat.parse(bsitem.TSLVT);
							 		amountHSLc += oFloatFormat.parse(bsitem.HSLVT_1);
							 	//	amountTSLc += oFloatFormat.parse(bsitem.TSLVT_1);	
							 		
							 			 for (var j = oPeriodFrom; j <= oPeriodTo; j++) {
										 	switch (j){
										 		case "1":
										 			amountHSL += oFloatFormat.parse(bsitem.HSL01);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL01);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL01_1);
										// 			amountTSLc += oFloatFormat.parse(bsitem.TSL01_1);
										 			break;
										 		case 2:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL02);
										// 			amountTSL += oFloatFormat.parse(bsitem.TSL02);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL02_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL02_1);
										 			break;
										 		case 3:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL03);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL03);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL03_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL03_1);
										 			break;
										 		case 4:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL04);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL04);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL04_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL04_1);
										 			break;
										 		case 5:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL05);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL05);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL05_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL05_1);
										 			break;
										 		case 6:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL06);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL06);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL06_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL06_1);
										 			break;
										 		case 7:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL07);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL07);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL07_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL07_1);
										 			break;
										 		case 8:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL08);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL08);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL08_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL08_1);
										 			break;
										 		case 9:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL09);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL09);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL09_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL09_1);
										 			break;
										 		case 10:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL10);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL10);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL10_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL10_1);
										 			break;
										 		case 11:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL11);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL11);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL11_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL11_1);
										 			break;
										 		case 12:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL12);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL12);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL12_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL12_1);
										 			break;
										 		case 13:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL13);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL13);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL13_1);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL13_1);
										 			break;
										 		case 14:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL14);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL14);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL14_1);
										 	//		amountTSLc += oFloatFormat.parse(bsitem.TSL14_1);
										 			break;
										 		case 15:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL15);
										 	//		amountTSL += oFloatFormat.parse(bsitem.TSL15);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL15);
										 	//		amountTSLc += oFloatFormat.parse(bsitem.TSL15);
										 			break;
										 		case 16:
										 			amountHSL += oFloatFormat.parse(bsitem.HSL16);
										 //			amountTSL += oFloatFormat.parse(bsitem.TSL16);
										 			amountHSLc += oFloatFormat.parse(bsitem.HSL16);
										 //			amountTSLc += oFloatFormat.parse(bsitem.TSL16);
										 			break;
							 			 	}
							 			 } 						
							 	 	if(amountHSL !== 0.00 || amountHSLc !== 0.00){
							 	 		amountHSL = amountHSL;
							 	 		amountHSLc = amountHSLc;
 								 		total += amountHSL;
 								 		totalc += amountHSLc;
  						 	     	    bsitem.TXT45 = bsitem.TXT50;
 								      	bsitem.CC_1 = Math.round(amountHSL*100)/100;
 								      	bsitem.CC_2 = Math.round(amountHSLc*100)/100;
 								      	bsitem.CC_3 = Math.round((amountHSL - amountHSLc)*100)/100;
 								      	if(amountHSLc !== 0.00)
 								      	{
 								      		bsitem.CC_4 = bsitem.CC_3/amountHSLc * 100;
 								      	}
 								      	oDataColumn.rows.push(bsitem);
							 	 	}
 								 }
 							}
  							//After period and leaf loop - total the amount
 							if (totalc !== 0.00 || total !== 0.00 )
 						 		 	{
 						 		 	prevProperty.CC_1 = total;	
 						 		 	prevProperty.CC_2 = totalc;
 						 		 	prevProperty.CC_3 = total - totalc;
 						 		 	if( totalc !== 0.00)
 						 		 	{
 						 		 		prevProperty.CC_4 = prevProperty.CC_3/totalc * 100;	
 						 		 	}

 						 			prevProperty.RACCT = "";
 						 			prevProperty.TXTYP = "T";
 						 			prevProperty.RTCUR = curr;
 						 			// Get the ending text
 						 			for (var m = 0; m < oFinTreeEnd.length; m++)
 						 			{
 						 				
 						 				if(prevProperty.ERGSL === oFinTreeEnd[m].ERGSL)
 						 				{
 						 					prevProperty.TXT45 = oFinTreeEnd[m].TXT45;
 						 				}
 						 			}
 						 			prevProperty.TXTYP = "T";
  					 		 		oDataColumn.rows.push(prevProperty);
  					 		 		total = 0.00;
 						 			totalc = 0.00;
 						 		 	}
 				// End of process of last row		 		 	
 			 	oTableModel.setData(oDataColumn);
			 	oView.setModel(oTableModel,"data");
				BusyIndicator.hide();
 							resolve();
 						},
 					error: function (oError) {BusyIndicator.hide();}
// //					ofaglext = oResult.getSource().getData().d.results
// //					resolve();
					
 				});
 			});//.then(function(result)

 			});
			//close promise
//			);
	 			this.byId("pageContainer").to(this.getView().createId("page2"));
	 			this.byId("nextButtonId").setVisible(false); 	

				

			},
			//Validation Function
			inputValidation: function () {
			var Combobox = [
				this.getView().byId("client")
			];
			var Tokens = [

				this.getView().byId("chart"),
				this.getView().byId("version"),
				this.getView().byId("language"),
				this.getView().byId("Ryear"),
				this.getView().byId("ledger")
			];
			var Input = [
				this.getView().byId("periodfrom"),
				this.getView().byId("periodto")
			];
			var validationerror = false;

			jQuery.each(Combobox, function (i, input) {
				if (!input.getSelectedKey()) {
					input.setValueState("Error");
					validationerror = true;

				} else {
					input.setValueState("None");
				}
			});
			jQuery.each(Tokens, function (i, input) {
				if (!input.getTokens().length) {
					input.setValueState("Error");
					validationerror = true;

				} else {
					input.setValueState("None");
				}
			});
			jQuery.each(Input, function (i, input) {
				if (!input.getValue()) {
					input.setValueState("Error");
					validationerror = true;

				} else {
					input.setValueState("None");
				}
			});
			if (validationerror) {
				return false;
			}
			else{
				return true;
			}

		},
		showCompanyCode: function () {
			var self = this;
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: self.getView().getModel("i18n").getResourceBundle().getText("client"),
					template: "MANDT"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("companycode"),
					template: "BUKRS"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("companyname"),
					template: "BUTXT"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldCompanyCode = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogCompanyCode = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.CompanyCodeFragment", this);
			this.getView().addDependent(this._oValueHelpDialogCompanyCode);
			this._oValueHelpDialogCompanyCode.setRangeKeyFields([{
				label: self.getView().getModel("i18n").getResourceBundle().getText("companycode"),
				key: "BUKRS",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogCompanyCode.getTableAsync().then(function (t) {
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}
				var a;
				this._oValueHelpDialogCompanyCode.getFilterBar().setBasicSearch(this._oBasicSearchFieldCompanyCode);
				this.getView().getModel().read("/t001", {
					filters: [new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					})],
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogCompanyCode.update();
			}.bind(this));
			this._oValueHelpDialogCompanyCode.setTokens(this._oCompanyCode.getTokens());
			this._oValueHelpDialogCompanyCode.open();
		},
		onValueHelpOkPress: function (e) {
			var t = e.getParameter("tokens");
			this._oCompanyCode.setTokens(t);
			this._oValueHelpDialogCompanyCode.close();
		},
		onValueHelpCancelPress: function () {
			this._oValueHelpDialogCompanyCode.close();
		},
		onValueHelpAfterClose: function () {
			this._oValueHelpDialogCompanyCode.destroy();
		},
		onFilterBarSearchCompanyCode: function (e) {
			var t = this._oBasicSearchFieldCompanyCode.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "MANDT",
					operator: FilterOperator.Contains,
					value1: t
				}), new Filter({
					path: "BUKRS",
					operator: FilterOperator.Contains,
					value1: t
				}), new Filter({
					path: "BUTXT",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableCompanyCode(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableCompanyCode: function (e) {
			var t = this._oValueHelpDialogCompanyCode;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
		showAccount: function () {
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Client",
					template: "MANDT"
				}, {
					label: "Chart of Accounts",
					template: "KTOPL"
				}, {
					label: "Account",
					template: "SAKNR"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldAccount = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogAccount = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.AccountFragment", this);
			this.getView().addDependent(this._oValueHelpDialogAccount);
			this._oValueHelpDialogAccount.setRangeKeyFields([{
				label: "Account",
				key: "SAKNR",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 20
				})
			}]);
			this._oValueHelpDialogAccount.getTableAsync().then(function (t) {
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}

				var p = this._oCompanyCode.getTokens()[0].getKey();
				if (p == "") {
					p = null;
				}
				var a;
				this._oValueHelpDialogAccount.getFilterBar().setBasicSearch(this._oBasicSearchFieldAccount);
				this.getView().getModel().read("/ska1", {
					filters: [new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					})],
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogAccount.update();
			}.bind(this));
			this._oValueHelpDialogAccount.setTokens(this._oAccount.getTokens());
			this._oValueHelpDialogAccount.open();
		},
		onValueHelpOkPressAccount: function (e) {
			var t = e.getParameter("tokens");
			this._oAccount.setTokens(t);
			this._oValueHelpDialogAccount.close();
		},
		onValueHelpCancelPressAccount: function () {
			this._oValueHelpDialogAccount.close();
		},
		onValueHelpAfterCloseAccount: function () {
			this._oValueHelpDialogAccount.destroy();
		},
		onFilterBarSearchAccount: function (e) {
			var t = this._oBasicSearchFieldAccount.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "MANDT",
					operator: FilterOperator.Contains,
					value1: t
				}), new Filter({
					path: "SAKNR",
					operator: FilterOperator.Contains,
					value1: t
				}), new Filter({
					path: "KTOPL",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableAccount(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableAccount: function (e) {
			var t = this._oValueHelpDialogAccount;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
		showChart: function () {
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Client",
					template: "MANDT"
				}, {
					label: "Chart of Accounts",
					template: "KTOPL"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldChart = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogChart = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.ChartFragment", this);
			this.getView().addDependent(this._oValueHelpDialogChart);
			this._oValueHelpDialogChart.setRangeKeyFields([{
				label: "Chart",
				key: "KTOPL",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogChart.getTableAsync().then(function (t) {
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}

		
				var a;
				this._oValueHelpDialogChart.getFilterBar().setBasicSearch(this._oBasicSearchFieldChart);
				this.getView().getModel().read("/chart", {
					filters: [new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					})],
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogChart.update();
			}.bind(this));
			this._oValueHelpDialogChart.setTokens(this._oChart.getTokens());
			this._oValueHelpDialogChart.open();
		},
		onValueHelpOkPressChart: function (e) {
			var t = e.getParameter("tokens");
			this._oChart.setTokens(t);
			this._oValueHelpDialogChart.close();
		},
		onValueHelpCancelPressChart: function () {
			this._oValueHelpDialogChart.close();
		},
		onValueHelpAfterCloseChart: function () {
			this._oValueHelpDialogChart.destroy();
		},
		onFilterBarSearchChart: function (e) {
			var t = this._oBasicSearchFieldChart.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "MANDT",
					operator: FilterOperator.Contains,
					value1: t
				}),  new Filter({
					path: "KTOPL",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableChart(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableChart: function (e) {
			var t = this._oValueHelpDialogChart;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
		showLedger: function () {
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Client",
					template: "MANDT"
				}, {
					label: "Ledger",
					template: "RLDNR"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldLedger = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogLedger = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.LedgerFragment", this);
			this.getView().addDependent(this._oValueHelpDialogLedger);
			this._oValueHelpDialogLedger.setRangeKeyFields([{
				label: "Ledger",
				key: "RLDNR",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogLedger.getTableAsync().then(function (t) {
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}

		
				var a;
				this._oValueHelpDialogLedger.getFilterBar().setBasicSearch(this._oBasicSearchFieldLedger);
				this.getView().getModel().read("/ledger", {
					filters: [new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					})],
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogLedger.update();
			}.bind(this));
			this._oValueHelpDialogLedger.setTokens(this._oLedger.getTokens());
			this._oValueHelpDialogLedger.open();
		},
		onValueHelpOkPressLedger: function (e) {
			var t = e.getParameter("tokens");
			this._oLedger.setTokens(t);
			this._oValueHelpDialogLedger.close();
		},
		onValueHelpCancelPressLedger: function () {
			this._oValueHelpDialogLedger.close();
		},
		onValueHelpAfterCloseLedger: function () {
			this._oValueHelpDialogLedger.destroy();
		},
		onFilterBarSearchLedger: function (e) {
			var t = this._oBasicSearchFieldLedger.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "MANDT",
					operator: FilterOperator.Contains,
					value1: t
				}),  new Filter({
					path: "RLDNR",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableLedger(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableLedger: function (e) {
			var t = this._oValueHelpDialogLedger;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
			showLanguage: function () {
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "LanguageKey",
					template: "SPRAS"
				}, {
					label: "LanguageCode",
					template: "LAISO"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldLanguage = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogLanguage = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.LanguageFragment", this);
			this.getView().addDependent(this._oValueHelpDialogLanguage);
			this._oValueHelpDialogLanguage.setRangeKeyFields([{
				label: "Language",
				key: "SPRAS",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogLanguage.getTableAsync().then(function (t) {
				
				var a;
				this._oValueHelpDialogLanguage.getFilterBar().setBasicSearch(this._oBasicSearchFieldLanguage);
				this.getView().getModel().read("/language", {
					
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogLanguage.update();
			}.bind(this));
			this._oValueHelpDialogLanguage.setTokens(this._oLanguage.getTokens());
			this._oValueHelpDialogLanguage.open();
		},
		onValueHelpOkPressLanguage: function (e) {
			var t = e.getParameter("tokens");
			this._oLanguage.setTokens(t);
			this._oValueHelpDialogLanguage.close();
		},
		onValueHelpCancelPressLanguage: function () {
			this._oValueHelpDialogLanguage.close();
		},
		onValueHelpAfterCloseLanguage: function () {
			this._oValueHelpDialogLanguage.destroy();
		},
		onFilterBarSearchLanguage: function (e) {
			var t = this._oBasicSearchFieldLanguage.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "SPRAS",
					operator: FilterOperator.Contains,
					value1: t
				}),  new Filter({
					path: "LAISO",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableLanguage(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableLanguage: function (e) {
			var t = this._oValueHelpDialogLanguage;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
		showVersion: function () {
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Client",
					template: "MANDT"
				}, {
					label: "Version",
					template: "VERSN"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldVersion = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogVersion = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.VersionFragment", this);
			this.getView().addDependent(this._oValueHelpDialogVersion);
			this._oValueHelpDialogVersion.setRangeKeyFields([{
				label: "Version",
				key: "VERSN",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogVersion.getTableAsync().then(function (t) {
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}

		
				var a;
				this._oValueHelpDialogVersion.getFilterBar().setBasicSearch(this._oBasicSearchFieldVersion);
				this.getView().getModel().read("/version", {
					filters: [new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					})],
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogVersion.update();
			}.bind(this));
			this._oValueHelpDialogVersion.setTokens(this._oVersion.getTokens());
			this._oValueHelpDialogVersion.open();
		},
		onValueHelpOkPressVersion: function (e) {
			var t = e.getParameter("tokens");
			this._oVersion.setTokens(t);
			this._oValueHelpDialogVersion.close();
		},
		onValueHelpCancelPressVersion: function () {
			this._oValueHelpDialogVersion.close();
		},
		onValueHelpAfterCloseVersion: function () {
			this._oValueHelpDialogVersion.destroy();
		},
		onFilterBarSearchVersion: function (e) {
			var t = this._oBasicSearchFieldVersion.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "MANDT",
					operator: FilterOperator.Contains,
					value1: t
				}),  new Filter({
					path: "VERSN",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableVersion(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableVersion: function (e) {
			var t = this._oValueHelpDialogVersion;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
		showYear: function (event) {
			var that=this;
			this._field = event.getSource();
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Year",
					template: "GJAHR"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldYear = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogYear = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.YearFragment", this);
			this.getView().addDependent(this._oValueHelpDialogYear);
			this._oValueHelpDialogYear.setRangeKeyFields([{
				label: "Year",
				key: "GJAHR",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogYear.getTableAsync().then(function (t) {
				

		
				var a;
				this._oValueHelpDialogYear.getFilterBar().setBasicSearch(this._oBasicSearchFieldYear);
				BusyIndicator.show(0);
				this.getView().getModel().read("/year", {
					
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
						BusyIndicator.hide();
				that._oValueHelpDialogYear.update();
					}
				});
			t.setModel(e, "columns");
			}.bind(this));
			this._oValueHelpDialogYear.setTokens(this._field.getTokens());
			this._oValueHelpDialogYear.open();
		},
		onValueHelpOkPressYear: function (e) {
			var t = e.getParameter("tokens");
			this._field.setTokens(t);
			this._oValueHelpDialogYear.close();
		},
		onValueHelpCancelPressYear: function () {
			this._oValueHelpDialogYear.close();
		},
		onValueHelpAfterCloseYear: function () {
			this._oValueHelpDialogYear.destroy();
		},
		onFilterBarSearchYear: function (e) {
			var t = this._oBasicSearchFieldYear.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [  new Filter({
					path: "GJAHR",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableYear(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableYear: function (e) {
			var t = this._oValueHelpDialogYear;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},
		showBarea: function (event) {
			var that=this;
			this._field = event.getSource();
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Client",
					template: "MANDT"
				}, {
					label: "Business Area",
					template: "GSBER"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldBarea = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogBarea = sap.ui.xmlfragment("tool_vin_ep1.view.fragment.BusinessareaFragment", this);
			this.getView().addDependent(this._oValueHelpDialogBarea);
			this._oValueHelpDialogBarea.setRangeKeyFields([{
				label: "Business Area",
				key: "GSBER",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 20
				})
			}]);
			this._oValueHelpDialogBarea.getTableAsync().then(function (t) {
				
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}
				
				var a;
				this._oValueHelpDialogBarea.getFilterBar().setBasicSearch(this._oBasicSearchFieldBarea);
				BusyIndicator.show(0);
				this.getView().getModel().read("/barea", {
					filters: [new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					})],					
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
						BusyIndicator.hide();
				that._oValueHelpDialogBarea.update();
					}
				});
			t.setModel(e, "columns");
			}.bind(this));
			this._oValueHelpDialogBarea.setTokens(this._field.getTokens());
			this._oValueHelpDialogBarea.open();
		},
		onValueHelpOkPressBarea: function (e) {
			var t = e.getParameter("tokens");
			this._field.setTokens(t);
			this._oValueHelpDialogBarea.close();
		},
		onValueHelpCancelPressBarea: function () {
			this._oValueHelpDialogBarea.close();
		},
		onValueHelpAfterCloseBarea: function () {
			this._oValueHelpDialogBarea.destroy();
		},
		onFilterBarSearchBarea: function (e) {
			var t = this._oBasicSearchFieldBarea.getValue(),
				o = e.getParameter("selectionSet");
			var a = o.reduce(function (e, t) {
				if (t.getValue()) {
					e.push(new Filter({
						path: t.getName(),
						operator: FilterOperator.Contains,
						value1: t.getValue()
					}));
				}
				return e;
			}, []);
			a.push(new Filter({
				filters: [new Filter({
					path: "MANDT",
					operator: FilterOperator.Contains,
					value1: t
				}),  new Filter({
					path: "GSBER",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableBarea(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableBarea: function (e) {
			var t = this._oValueHelpDialogBarea;
			t.getTableAsync().then(function (o) {
				if (o.bindRows) {
					o.getBinding("rows").filter(e);
				}
				if (o.bindItems) {
					o.getBinding("items").filter(e);
				}
				t.update();
			});
		},		
		onSaveVariant: function (oEvent) {
			var variant = {
				"client": this.getView().byId("client").getValue(),
				"periodfrom": this.getView().byId("periodfrom").getValue(),
				"periodto": this.getView().byId("periodto").getValue()
			};
			var aCompanyCodeTokens = this._oCompanyCode.getTokens();
			variant.companycode = [];
			aCompanyCodeTokens.map(function (oToken) {
				
					variant.companycode.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});
			
			var aAccountTokens = this._oAccount.getTokens();
			variant.account = [];
			aAccountTokens.map(function (oToken) {
				
					variant.account.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});			
			var aChartTokens = this._oChart.getTokens();
			variant.chart = [];
			aChartTokens.map(function (oToken) {
				
					variant.chart.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});
			var aLedgerTokens = this._oLedger.getTokens();
			variant.ledger = [];
			aLedgerTokens.map(function (oToken) {
				
					variant.ledger.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});
			var aVersionTokens = this._oVersion.getTokens();
			variant.version = [];
			aVersionTokens.map(function (oToken) {
				
					variant.version.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});
			var aLanguageTokens = this._oLanguage.getTokens();
			variant.language = [];
			aLanguageTokens.map(function (oToken) {
				
					variant.language.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});
			var aRyearTokens = this._oRyear.getTokens();
			variant.Ryear = [];
			aRyearTokens.map(function (oToken) {
				
					variant.Ryear.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});
			var aCyearTokens = this._oCyear.getTokens();
			variant.Cyear = [];
			aCyearTokens.map(function (oToken) {
				
					variant.Cyear.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});

			var aBareaTokens = this._oBusArea.getTokens();
			variant.Barea = [];
			aBareaTokens.map(function (oToken) {
				
					variant.Barea.push({
					"key": oToken.getKey(),
					"text": oToken.getText(),
					"range" : oToken.data("range")
				});
				
			});			
			
			this._oContainer.setItemValue(oEvent.getParameters("name").name, variant);
			this._oContainer.save()
				.fail(function () {

				})
				.done(function () {

				});
		},
		onDeleteVariant: function (sdelItem) {
			for(var i=0;i<sdelItem.length;i++){
			this._oContainer.delItem(sdelItem[i]);
			}
			this._oContainer.save()
				.fail(function () {

				})
				.done(function () {

				});
		},
		onChange: function (oEvent) {
			
			var changedVariant = this._oContainer.getItemValue(oEvent.getSource().getSelectionKey());
			if(oEvent.getSource().getSelectionKey()=="*standard*"){
			this.standardVariantReset();
			}
			else{
			this._oClient.setSelectedKey(changedVariant.client);
			this._oPeriodfrom.setValue(changedVariant.periodfrom);
			this._oPeriodto.setValue(changedVariant.periodto);
			
			var tokens = [];
			for(var i=0;i<changedVariant.companycode.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.companycode[i].key,
						text: changedVariant.companycode[i].text
					}).data("range",changedVariant.companycode[i].range));
				
			}
			this._oCompanyCode.setTokens(tokens);
			
			tokens = [];
			for(var i=0;i<changedVariant.account.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.account[i].key,
						text: changedVariant.account[i].text
					}).data("range",changedVariant.account[i].range));
				
			}
			this._oAccount.setTokens(tokens);

			var tokens = [];
			for(var i=0;i<changedVariant.chart.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.chart[i].key,
						text: changedVariant.chart[i].text
					}).data("range",changedVariant.chart[i].range));
				
			}
			this._oChart.setTokens(tokens);
			
			tokens = [];
			for(var i=0;i<changedVariant.version.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.version[i].key,
						text: changedVariant.version[i].text
					}).data("range",changedVariant.version[i].range));
				
			}
			this._oVersion.setTokens(tokens);
			
			tokens = [];
			for(var i=0;i<changedVariant.language.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.language[i].key,
						text: changedVariant.language[i].text
					}).data("range",changedVariant.language[i].range));
				
			}
			this._oLanguage.setTokens(tokens);
			
			tokens = [];
			for(var i=0;i<changedVariant.ledger.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.ledger[i].key,
						text: changedVariant.ledger[i].text
					}).data("range",changedVariant.ledger[i].range));
				
			}
			this._oLedger.setTokens(tokens);
			
			tokens = [];
			for(var i=0;i<changedVariant.Ryear.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.Ryear[i].key,
						text: changedVariant.Ryear[i].text
					}).data("range",changedVariant.Ryear[i].range));
				
			}
			this._oRyear.setTokens(tokens);
			
			tokens = [];
			for(var i=0;i<changedVariant.Cyear.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.Cyear[i].key,
						text: changedVariant.Cyear[i].text
					}).data("range",changedVariant.Cyear[i].range));
				
			}
			this._oCyear.setTokens(tokens);
			tokens = [];
			for(var i=0;i<changedVariant.Barea.length;i++)
			{
				tokens.push(new sap.m.Token({
						key: changedVariant.Barea[i].key,
						text: changedVariant.Barea[i].text
					}).data("range",changedVariant.Barea[i].range));
				
			}
			this._oBusArea.setTokens(tokens);			
			}
		},
		onManage : function(oEvent){
			this.onDeleteVariant(oEvent.getParameters().deleted);
		},
		standardVariantReset: function () {
			this._oClient.setValue("");
		
			this._oCompanyCode.destroyTokens();
			this._oAccount.destroyTokens();
			this._oChart.destroyTokens();
			this._oLedger.destroyTokens();
			this._oVersion.destroyTokens();
			this._oLanguage.destroyTokens();
			this._oRyear.destroyTokens();
			this._oCyear.destroyTokens();
			this._oPeriodfrom.setValue("");
			this._oPeriodto.setValue("")
			this._oBusArea.destroyTokens();
		},
		//Excel Export Start
		onExportPress: function () {
			const binding = this.byId("tableId").getBinding("rows");
			new Spreadsheet({
				workbook: {
					columns: this.createColumns()
				},
				dataSource: binding.getModel().getProperty(binding.getPath()),
				fileName: "FinStatement.xlsx",
			}).build();
		},

		createColumns: function () {
			var that = this;
			return [{
				label: that.getView().getModel("i18n").getResourceBundle().getText("fsitem"),
				property: "ERGSL"
			}, {
				label: that.getView().getModel("i18n").getResourceBundle().getText("plitem"),
				property: "RACCT"

			}, {
				label: that.getView().getModel("i18n").getResourceBundle().getText("textbs"),
				property: "TXT45"
			}, {
				label: that.getView().getModel("i18n").getResourceBundle().getText("reportingperiod"),
				property: "CC_1",
				type : sap.ui.export.EdmType.Number,
				scale : 2

			}, {
				label: that.getView().getModel("i18n").getResourceBundle().getText("comparedperiod"),
				property: "CC_2",
				type : sap.ui.export.EdmType.Number,
				scale : 2
			}, {
				label: that.getView().getModel("i18n").getResourceBundle().getText("absdif"),
				property: "CC_3",
				type : sap.ui.export.EdmType.Number,
				scale : 2

			}, {
				label: that.getView().getModel("i18n").getResourceBundle().getText("reldif"),
				property: "CC_4",
				type : sap.ui.export.EdmType.Number,
				scale : 2

			}];
		},
		//Excel Export End		
		onChangeValue: function (oEvent) {

			var id = oEvent.getParameters("id");
			var oInput = oEvent.getSource();
			
			//Input text
			var iText = id.value;
			var from;
			var to;
			var operation;
			var boolean;
			var range = false;
			// Check if there are any conditions entered by user
			
			//Check for range
			var n = iText.indexOf("...");
			if(n !== -1)//There is a hit
			{
				range = true;
				from = iText.substring(0,n);
				to = iText.substring(n+3,iText.length);
				operation = sap.ui.model.FilterOperator.BT;
				oInput.addToken(
					new Token({text: iText, key: "range_0"}).data("range",{
						"exclude": false,
						"operation":operation,
						"keyField": iText,
						"value1": from,
						"value2": to
					})
					);				
			}
			// Check for wildcards
			var n = iText.indexOf("*");
			if(n !== -1)//There is a hit
			{
				range = true;
				operation = sap.ui.model.FilterOperator.Contains;
				//Check if the wildcard is at the start
				boolean = iText.startsWith("*")
				
				if(boolean === true){
					boolean = iText.endsWith("*");
					if(boolean === true){
					operation = sap.ui.model.FilterOperator.Contains
					from = iText.substring(1,iText.length-1);
					}
					else{
					operation = sap.ui.model.FilterOperator.EndsWith
					from = iText.substring(1,iText.length);
					}
				}
				else
				{
				//Check if the wildcard is at the end
				boolean = iText.endsWith("*");
				if(boolean === true && operation === sap.ui.model.FilterOperator.EndsWith){
					operation = sap.ui.model.FilterOperator.Contains
					from = iText.substring(1,iText.length-1);
				}
				else{
					operation = sap.ui.model.FilterOperator.StartsWith
					from = iText.substring(0,iText.length-1);
				 }
				}
				to = "";
				oInput.addToken(
					new Token({text: iText, key: "range_0"}).data("range",{
						"exclude": false,
						"operation":operation,
						"keyField": iText,
						"value1": from,
						"value2": to
					})
					);				
			}			

			var n = iText.indexOf("<");
			if(n !== -1)//There is a hit
			{
				range = true;
				var n = iText.search("<=");
				if(n !== -1)//There is a hit
				{
					from = iText.substring(2,iText.length);
					operation = sap.ui.model.FilterOperator.LE;
					oInput.addToken(
						new Token({text: iText, key: "range_0"}).data("range",{
							"exclude": false,
							"operation":operation,
							"keyField": iText,
							"value1": from,
							"value2": ''
						})
						);				
				}	
				else{
				from = iText.substring(1,iText.length);
				operation = sap.ui.model.FilterOperator.LT;
				oInput.addToken(
					new Token({text: iText, key: "range_0"}).data("range",{
						"exclude": false,
						"operation":operation,
						"keyField": iText,
						"value1": from,
						"value2": ''
					})
					);	
				}
			}

				var n = iText.indexOf(">");
			if(n !== -1)//There is a hit
			{
				range = true;
				var n = iText.search(">=");
				if(n !== -1)//There is a hit
				{
					from = iText.substring(2,iText.length);
					operation = sap.ui.model.FilterOperator.GE;
					oInput.addToken(
						new Token({text: iText, key: "range_0"}).data("range",{
							"exclude": false,
							"operation":operation,
							"keyField": iText,
							"value1": from,
							"value2": ''
						})
						);				
				}	
				else{

					from = iText.substring(1,iText.length);
					operation = sap.ui.model.FilterOperator.GT;
					oInput.addToken(
						new Token({text: iText, key: "range_0"}).data("range",{
							"exclude": false,
							"operation":operation,
							"keyField": iText,
							"value1": from,
							"value2": ''
						})
						);	
				}
			}		
			var n = iText.indexOf("!(=");
			if(n !== -1)//There is a hit
			{
				range = true;
				from = iText.substring(3,iText.length-1);
				operation = sap.ui.model.FilterOperator.NE;
				oInput.addToken(
					new Token({text: iText, key: "range_0"}).data("range",{
						"exclude": true,
						"operation":operation,
						"keyField": iText,
						"value1": from,
						"value2": ''
					})
					);				
			}
			if(range === false)
			{
				var key = id.value;
				var desc = key +" ("+key+")";
				oInput.addToken(
					new Token({text: desc, key: key})
					);				
			}

			 	oInput.setValue("");
		}		
	});
});