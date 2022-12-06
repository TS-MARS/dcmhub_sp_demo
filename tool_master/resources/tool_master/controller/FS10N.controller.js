sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/SearchField",
	"sap/ui/model/type/String",
	"sap/ui/core/BusyIndicator"	
], function (Controller, ODataModel, JSONModel, NumberFormat, Fragment, Filter, FilterOperator,SearchField,String,BusyIndicator) {
	"use strict";

	return Controller.extend("tool_master.controller.FS10N", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			this.getView().setModel(oF10Model);
			this.getView().addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode
			this._oClient = this.getView().byId("client");
			this._oCompanyCode = this.getView().byId("companycode");
			this._oAccount = this.getView().byId("account");
			this._oLedger = this.getView().byId("ledger");
			this._oYear = this.getView().byId("year");
			this._oDisplayCurr = this.getView().byId("displaycurr");
			
			var that = this;
			var oPersonalizationService = sap.ushell.Container.getService("Personalization");
			var oScope = {
				keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
				writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
				clientStorageAllowed: true,
				validity: Infinity
			};
			var variantModel;
			oPersonalizationService.getContainer("sap.ushell.variant.FS10N_master", oScope, oComponent)
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
		// Next button on the main page at the footer. Navigates to the main table content display
		onPressNext: function (oEvent) {
			BusyIndicator.show(0);
			var oView = this.getView();
			var oController = oView.getController();
			var oClient = oView.byId("client").getValue();
			var oCCode = this._oCompanyCode.getTokens()[0].getKey();
			var oAccount = this._oAccount.getTokens()[0].getKey();
			var oLedger = oView.byId("ledger").getValue();
			var oYear = oView.byId("year").getValue();
			var oDisplayCurr = oView.byId("displaycurr").getValue();
			//retrieve Company Code details
			this._getCompanyModel(oClient, oCCode, oAccount,oLedger, oYear).then(function (oDataColumn) {
				oController._getEntityName(oDataColumn).then(function (oCompanyModel) {
					oView.setModel(oCompanyModel, "company");
				});
			});
			//retrieve the content calculation
			this._modelCalculation(oClient, oCCode, oAccount,oLedger, oYear, oDisplayCurr).then(function (oModel) {
				var oTableModel = oView.byId("tableId");
				oView.setModel(oModel, "data");
				//	oTableModel.setModel(oModel);
			});
			// selection filter function call
			this.byId("pageContainer").to(this.getView().createId("page2"));
			this.byId("nextButtonId").setVisible(false);
			
		},

		onPressFilter: function (oEvent) {
			
			var oFilters = [];
			var oView = this.getView();
			var oController = oView.getController();

			// All these filters can be moved to its own methods later
			// basically does the same thing only input fields are different.
			if (oView.byId("profit").getValue() !== "")
			{
				var aproFilter = new sap.ui.model.Filter({
					path: "PRCTR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oView.byId("profit").getValue()
				});
				oFilters.push(aproFilter);				
			}

			if (oView.byId("segment").getValue() !== "")
			{
				var aSegFilter = new sap.ui.model.Filter({
					path: "SEGMENT",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oView.byId("segment").getValue()
				});
				oFilters.push(aSegFilter);				
			}
			
			if (oView.byId("busarea").getValue() !== "")
			{
				var aBusFilter = new sap.ui.model.Filter({
					path: "RBUSA",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oView.byId("busarea").getValue()
				});
				oFilters.push(aBusFilter);				
			}

			if (oView.byId("trade").getValue() !== "")
			{
				var aTradeFilter = new sap.ui.model.Filter({
					path: "RASSC",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oView.byId("trade").getValue()
				});
				oFilters.push(aTradeFilter);				
			}

			if (oView.byId("ttype").getValue() !== "")
			{
				var aTypeFilter = new sap.ui.model.Filter({
					path: "RMVCT",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oView.byId("ttype").getValue()
				});
				oFilters.push(aTypeFilter);				
			}			
			var oClient = oView.byId("client").getValue();
			var oCCode = oView.byId("cCode").getValue();
			var oAccount = oView.byId("account").getValue();
			var oLedger = oView.byId("ledger").getValue();
			var oYear = oView.byId("year").getValue();
			var oDisplayCurr = this.getView().byId("displaycurr");

			//retrieve the content calculation
			this._modelCalculation(oClient, oCCode, oAccount, oLedger, oYear, oDisplayCurr, oFilters ).then(function (oModel) {
				var oTableModel = oView.byId("tableId");
				oView.setModel(oModel, "data");
				
				//	oTableModel.setModel(oModel);
			});
		},

		onNavButtonPress: function (oEvent) {
			this.byId("pageContainer").to(this.getView().createId("page1"));
			this.byId("nextButtonId").setVisible(true);
		},

		_getCompanyModel: function (oClient, oCCode, oAccount,oLedger, oYear) {

			var oComponent = this.getOwnerComponent();
			var oF10Model = oComponent.getModel("F10Set");
			var oDataColumn = {
				company: []
			};

			var aFilters = [];
			var aClientFilter = new sap.ui.model.Filter({
				path: "MANDT",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oClient
			});
			aFilters.push(aClientFilter);

			var aCompanyFilter = new sap.ui.model.Filter({
				path: "BUKRS",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oCCode
			});
			aFilters.push(aCompanyFilter);

			return new Promise(function (resolve, reject) {
				oF10Model.read("/t001", {
					filters: aFilters,
					success: function (oResult) {
						for (var i = 0; i < oResult.results.length; i++) {
							var property = oResult.results[i];

							oDataColumn.company.push({
								columnClient: property.MANDT,
								columnCCode: property.BUKRS,
								columnName: property.BUTXT,
								columnCurrency: property.WAERS,
								columnCOA: property.KTOPL,
								columnAccount: oAccount,
								columnLedger: oLedger,
								columnYear: oYear
							});

						}
						//					oCompanyModel.setData(oDataColumn);						
						resolve(oDataColumn);
					},
					error: function (oError) {}

				});
			});
		},

		_getEntityName: function (oDataColumn) {
			var oComponent = this.getOwnerComponent();
			var oF10Model = oComponent.getModel("F10Set");
			var oCompanyModel = new JSONModel();

			var aFilters = [];
			var aClientFilter = new sap.ui.model.Filter({
				path: "MANDT",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oDataColumn.company[0].columnClient
			});
			aFilters.push(aClientFilter);

			var aCOAFilter = new sap.ui.model.Filter({
				path: "KTOPL",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oDataColumn.company[0].columnCOA
			});
			aFilters.push(aCOAFilter);
			
			var aAccountFilter = new sap.ui.model.Filter({
				path: "SAKNR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oDataColumn.company[0].columnAccount
			});
			aFilters.push(aAccountFilter);

			return new Promise(function (resolve, reject) {
				oF10Model.read("/ska1", {
					filters: aFilters,
					success: function (oResult) {
						for (var i = 0; i < oResult.results.length; i++) {
							var property = oResult.results[i];

							oDataColumn.company[0].columnAccount = (oDataColumn.company[0].columnAccount + " " + property.TXT50);

						}
						oCompanyModel.setData(oDataColumn);
						resolve(oCompanyModel);
					},
					error: function (oError) {}

				});
			});
		},
		// Process the selection input from the user
		// This will take in fours inputs which are:-
		// client(MANDT), Account Number (SAKNR), Company Code (BUKRS), Year(GJAHR)		
		_modelCalculation: function (oClient, oCCode, oAccount,oLedger, oYear, oDisplayCurr, oFilters) {

			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			var self = this;
			var oTableModel = new JSONModel();
			var oTableModelDoc = new JSONModel();
			//table Rows
			var oDataColumn = {
				header: [],
				rowslocal: [],
				rowsdocument: []
			};
			var debitTotal = 0.00,
				creditTotal = 0.00,
				balanceTotal = 0.00,
				calcTotal = 0.00;
			var debitTotaldoc = 0.00,
				creditTotaldoc = 0.00,
				balanceTotaldoc = 0.00,
				calcTotaldoc = 0.00;
			oDataColumn.header.push({
				columnClient: oClient,
				columnCCode: oCCode,
				columnAccount: oAccount,
				columnYear: oYear
			});
			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fs10nParameters(IP_MANDT='" + oClient + "',IP_ACCNT='" + oAccount + "',IP_BUKRS='" + oCCode + "',IP_GJAHR='" + oYear +
					"',IP_RLDNR='" + oLedger +"')/Results", {
						filters: oFilters,
						success: function (oResult) {
							//This whole function can be more efficient with the coding.
							var oLocale = new sap.ui.core.Locale("en-US");
							var oFloatFormat = NumberFormat.getFloatInstance(oLocale);
							// not the best javascript code but still learning. definitely will come back and recode to improve performance an
							// readibility. All direct coding until figure out how to iterate array as a group
							var period = "",
								debit = 0.00,
								credit = 0.00,
								balance = 0.00,
								calc = 0.00,
								prevcal = 0.00,
								currency = "";
							var period1 = "",
								debit1 = 0.00,
								credit1 = 0.00,
								balance1 = 0.00,
								calc1 = 0.00,
								prevcal1 = 0.00,
								currency1 = "";
							var period2 = "",
								debit2 = 0.00,
								credit2 = 0.00,
								balance2 = 0.00,
								calc2 = 0.00,
								prevcal2 = 0.00,
								currency2 = "";
							var period3 = "",
								debit3 = 0.00,
								credit3 = 0.00,
								balance3 = 0.00,
								calc3 = 0.00,
								prevcal3 = 0.00,
								currency3 = "";
							var period4 = "",
								debit4 = 0.00,
								credit4 = 0.00,
								balance4 = 0.00,
								calc4 = 0.00,
								prevcal4 = 0.00,
								currency4 = "";
							var period5 = "",
								debit5 = 0.00,
								credit5 = 0.00,
								balance5 = 0.00,
								calc5 = 0.00,
								prevcal5 = 0.00,
								currency5 = "";
							var period6 = "",
								debit6 = 0.00,
								credit6 = 0.00,
								balance6 = 0.00,
								calc6 = 0.00,
								prevcal6 = 0.00,
								currency6 = "";
							var period7 = "",
								debit7 = 0.00,
								credit7 = 0.00,
								balance7 = 0.00,
								calc7 = 0.00,
								prevcal7 = 0.00,
								currency7 = "";
							var period8 = "",
								debit8 = 0.00,
								credit8 = 0.00,
								balance8 = 0.00,
								calc8 = 0.00,
								prevcal8 = 0.00,
								currency8 = "";
							var period9 = "",
								debit9 = 0.00,
								credit9 = 0.00,
								balance9 = 0.00,
								calc9 = 0.00,
								prevcal9 = 0.00,
								currency9 = "";
							var period10 = "",
								debit10 = 0.00,
								credit10 = 0.00,
								balance10 = 0.00,
								calc10 = 0.00,
								prevcal10 = 0.00,
								currency10 = "";
							var period11 = "",
								debit11 = 0.00,
								credit11 = 0.00,
								balance11 = 0.00,
								calc11 = 0.00,
								prevcal11 = 0.00,
								currency11 = "";
							var period12 = "",
								debit12 = 0.00,
								credit12 = 0.00,
								balance12 = 0.00,
								calc12 = 0.00,
								prevcal12 = 0.00,
								currency12 = "";
							var period13 = "",
								debit13 = 0.00,
								credit13 = 0.00,
								balance13 = 0.00,
								calc13 = 0.00,
								prevcal13 = 0.00,
								currency13 = "";
							var period14 = "",
								debit14 = 0.00,
								credit14 = 0.00,
								balance14 = 0.00,
								calc14 = 0.00,
								prevcal14 = 0.00,
								currency14 = "";
							var period15 = "",
								debit15 = 0.00,
								credit15 = 0.00,
								balance15 = 0.00,
								calc15 = 0.00,
								prevcal15 = 0.00,
								currency15 = "";
							var period16 = "",
								debit16 = 0.00,
								credit16 = 0.00,
								balance16 = 0.00,
								calc16 = 0.00,
								prevcal16 = 0.00,
								currency16 = "";
								
							var perioddoc = "",
								debitdoc = 0.00,
								creditdoc = 0.00,
								balancedoc = 0.00,
								calcdoc = 0.00,
								prevcaldoc = 0.00,
								currencydoc = "";
							var period1doc = "",
								debit1doc = 0.00,
								credit1doc = 0.00,
								balance1doc = 0.00,
								calc1doc = 0.00,
								prevcal1doc = 0.00,
								currency1doc = "";
							var period2doc = "",
								debit2doc = 0.00,
								credit2doc = 0.00,
								balance2doc = 0.00,
								calc2doc = 0.00,
								prevcal2doc = 0.00,
								currency2doc = "";
							var period3doc = "",
								debit3doc = 0.00,
								credit3doc = 0.00,
								balance3doc = 0.00,
								calc3doc = 0.00,
								prevcal3doc = 0.00,
								currency3doc = "";
							var period4doc = "",
								debit4doc = 0.00,
								credit4doc = 0.00,
								balance4doc = 0.00,
								calc4doc = 0.00,
								prevcal4doc = 0.00,
								currency4doc = "";
							var period5doc = "",
								debit5doc = 0.00,
								credit5doc = 0.00,
								balance5doc = 0.00,
								calc5doc = 0.00,
								prevcal5doc = 0.00,
								currency5doc = "";
							var period6doc = "",
								debit6doc = 0.00,
								credit6doc = 0.00,
								balance6doc = 0.00,
								calc6doc = 0.00,
								prevcal6doc = 0.00,
								currency6doc = "";
							var period7doc = "",
								debit7doc = 0.00,
								credit7doc = 0.00,
								balance7doc = 0.00,
								calc7doc = 0.00,
								prevcal7doc = 0.00,
								currency7doc = "";
							var period8doc = "",
								debit8doc = 0.00,
								credit8doc = 0.00,
								balance8doc = 0.00,
								calc8doc = 0.00,
								prevcal8doc = 0.00,
								currency8doc = "";
							var period9doc = "",
								debit9doc = 0.00,
								credit9doc = 0.00,
								balance9doc = 0.00,
								calc9doc = 0.00,
								prevcal9doc = 0.00,
								currency9doc = "";
							var period10doc = "",
								debit10doc = 0.00,
								credit10doc = 0.00,
								balance10doc = 0.00,
								calc10doc = 0.00,
								prevcal10doc = 0.00,
								currency10doc = "";
							var period11doc = "",
								debit11doc = 0.00,
								credit11doc = 0.00,
								balance11doc = 0.00,
								calc11doc = 0.00,
								prevcal11doc = 0.00,
								currency11doc = "";
							var period12doc = "",
								debit12doc = 0.00,
								credit12doc = 0.00,
								balance12doc = 0.00,
								calc12doc = 0.00,
								prevcal12doc = 0.00,
								currency12doc = "";
							var period13doc = "",
								debit13doc = 0.00,
								credit13doc = 0.00,
								balance13doc = 0.00,
								calc13doc = 0.00,
								prevcal13doc = 0.00,
								currency13doc = "";
							var period14doc = "",
								debit14doc = 0.00,
								credit14doc = 0.00,
								balance14doc = 0.00,
								calc14doc = 0.00,
								prevcal14doc = 0.00,
								currency14doc = "";
							var period15doc = "",
								debit15doc = 0.00,
								credit15doc = 0.00,
								balance15doc = 0.00,
								calc15doc = 0.00,
								prevcal15doc = 0.00,
								currency15doc = "";
							var period16doc = "",
								debit16doc = 0.00,
								credit16doc = 0.00,
								balance16doc = 0.00,
								calc16doc = 0.00,
								prevcal16doc = 0.00,
								currency16doc = "";
							for (var i = 0; i < oResult.results.length; i++) {
								var property = oResult.results[i];
								
								if(property.RES_HCLCR === null){
									property.RES_HCLCR = "0.000";
								}
								if(property.RES_TSLCR === null){
									property.RES_TSLCR = "0.000";
								}
								if(property.RES_HCLDR === null){
									property.RES_HCLDR = "0.000";
								}
								if(property.RES_TSLDR === null){
									property.RES_TSLDR = "0.000";
								}
								// parse the amounts to decimal floats
								// oData returns as strings
								// Convert period 0 to Balance Carry Forward
								switch (property.PERIOD) {
								case "0":
									period = self.getView().getModel("i18n").getResourceBundle().getText("bcf");
									debit = 0;
									credit = 0;
									balance = 0;
									calc += oFloatFormat.parse(property.RES_HCLDR); // Balance carry forward is stored in the Debit field in the backend.
									prevcal = calc;
									currency = property.LOCCUR;
									if(property.DOCCUR === oDisplayCurr )
									{
									perioddoc = self.getView().getModel("i18n").getResourceBundle().getText("bcf");
									debitdoc = 0;
									creditdoc = 0;
									balancedoc = 0;
									calcdoc += oFloatFormat.parse(property.RES_TSLDR); // Balance carry forward is stored in the Debit field in the backend.
									prevcaldoc = calcdoc;
									currencydoc = property.DOCCUR;		
									}
									break;
								case "01":
									period1 = property.PERIOD;
									debit1 += +oFloatFormat.parse(property.RES_HCLDR);
									credit1 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance1 = +((debit1 - credit1).toFixed(2));
									calc1 = +((prevcal + balance1).toFixed(2));
									prevcal1 = calc1;
									currency1 = property.LOCCUR;
									if(property.DOCCUR === oDisplayCurr )
									{
									period1doc = property.PERIOD;
									debit1doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit1doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance1doc  = +((debit1doc - credit1doc).toFixed(2));
									calc1doc  = +((prevcaldoc + balance1doc).toFixed(2));
									prevcal1doc  = calc1doc ;
									currency1doc  = property.DOCCUR;
									}
									break;
								case "02":
									period2 = property.PERIOD;
									debit2 += +oFloatFormat.parse(property.RES_HCLDR);
									credit2 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance2 = +((debit2 - credit2).toFixed(2));
									calc2 = +((prevcal1 + balance2).toFixed(2));
									prevcal2 = calc2;
									currency2 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period2doc = property.PERIOD;
									debit2doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit2doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance2doc  = +((debit2doc - credit2doc).toFixed(2));
									calc2doc  = +((prevcal1doc + balance2doc).toFixed(2));
									prevcal2doc  = calc2doc ;
									currency2doc  = property.DOCCUR;	
									}
									break;
								case "03":
									period3 = property.PERIOD;
									debit3 += +oFloatFormat.parse(property.RES_HCLDR);
									credit3 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance3 = +((debit3 - credit3).toFixed(2));
									calc3 = +((prevcal2 + balance3).toFixed(2));
									prevcal3 = calc3;
									currency3 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period3doc = property.PERIOD;
									debit3doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit3doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance3doc  = +((debit3doc - credit3doc).toFixed(2));
									calc3doc  = +((prevcal2doc + balance3doc).toFixed(2));
									prevcal3doc  = calc3doc ;
									currency3doc  = property.DOCCUR;		
									}
									break;
								case "04":
									period4 = property.PERIOD;
									debit4 += +oFloatFormat.parse(property.RES_HCLDR);
									credit4 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance4 = +((debit4 - credit4).toFixed(2));
									calc4 = +((prevcal3 + balance4).toFixed(2));
									prevcal4 = calc4;
									currency4 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period4doc = property.PERIOD;
									debit4doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit4doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance4doc  = +((debit4doc - credit4doc).toFixed(2));
									calc4doc  = +((prevcal3doc + balance4doc).toFixed(2));
									prevcal4doc  = calc4doc ;
									currency4doc  = property.DOCCUR;	
									}
									break;
								case "05":
									period5 = property.PERIOD;
									debit5 += +oFloatFormat.parse(property.RES_HCLDR);
									credit5 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance5 = +((debit5 - credit5).toFixed(2));
									calc5 = +((prevcal4 + balance5).toFixed(2));
									prevcal5 = calc5;
									currency5 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period5doc = property.PERIOD;
									debit5doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit5doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance5doc  = +((debit5doc - credit5doc).toFixed(2));
									calc5doc  = +((prevcal4doc + balance5doc).toFixed(2));
									prevcal5doc  = calc5doc ;
									currency5doc  = property.DOCCUR;	
									}
									break;
								case "06":
									period6 = property.PERIOD;
									debit6 += +oFloatFormat.parse(property.RES_HCLDR);
									credit6 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance6 = +((debit6 - credit6).toFixed(2));
									calc6 = +((prevcal5 + balance6).toFixed(2));
									prevcal6 = calc6;
									currency6 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period6doc = property.PERIOD;
									debit6doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit6doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance6doc  = +((debit6doc - credit6doc).toFixed(2));
									calc6doc  = +((prevcal5doc + balance6doc).toFixed(2));
									prevcal6doc  = calc6doc ;
									currency6doc  = property.DOCCUR;		
									}
									break;
								case "07":
									period7 = property.PERIOD;
									debit7 += +oFloatFormat.parse(property.RES_HCLDR);
									credit7 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance7 = +((debit7 - credit7).toFixed(2));
									calc7 = +((prevcal6 + balance7).toFixed(2));
									prevcal7 = calc7;
									currency7 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period7doc = property.PERIOD;
									debit7doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit7doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance7doc  = +((debit7doc - credit7doc).toFixed(2));
									calc7doc  = +((prevcal6doc + balance7doc).toFixed(2));
									prevcal7doc  = calc7doc ;
									currency7doc  = property.DOCCUR;		
									}
									break;
								case "08":
									period8 = property.PERIOD;
									debit8 += +oFloatFormat.parse(property.RES_HCLDR);
									credit8 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance8 = +((debit8 - credit8).toFixed(2));
									calc8 = +((prevcal7 + balance8).toFixed(2));
									prevcal8 = calc8;
									currency8 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period8doc = property.PERIOD;
									debit8doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit8doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance8doc  = +((debit8doc - credit8doc).toFixed(2));
									calc8doc  = +((prevcal7doc + balance8doc).toFixed(2));
									prevcal8doc  = calc8doc ;
									currency8doc  = property.DOCCUR;	
									}
									break;
								case "09":
									period9 = property.PERIOD;
									debit9 += +oFloatFormat.parse(property.RES_HCLDR);
									credit9 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance9 = +((debit9 - credit9).toFixed(2));
									calc9 = +((prevcal8 + balance9).toFixed(2));
									prevcal9 = calc9;
									currency9 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period9doc = property.PERIOD;
									debit9doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit9doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance9doc  = +((debit9doc - credit9doc).toFixed(2));
									calc9doc  = +((prevcal8doc + balance9doc).toFixed(2));
									prevcal9doc  = calc9doc ;
									currency9doc  = property.DOCCUR;	
									}
									break;
								case "10":
									period10 = property.PERIOD;
									debit10 += +oFloatFormat.parse(property.RES_HCLDR);
									credit10 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance10 = +((debit10 - credit10).toFixed(2));
									calc10 = +((prevcal9 + balance10).toFixed(2));
									prevcal10 = calc10;
									currency10 = property.LOCCUR;

									if(property.DOCCUR === oDisplayCurr )
									{
									period10doc = property.PERIOD;
									debit10doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit10doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance10doc  = +((debit10doc - credit10doc).toFixed(2));
									calc10doc  = +((prevcal9doc + balance10doc).toFixed(2));
									prevcal10doc  = calc10doc ;
									currency10doc  = property.DOCCUR;	
									}
									break;
								case "11":
									period11 = property.PERIOD;
									debit11 += +oFloatFormat.parse(property.RES_HCLDR);
									credit11 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance11 = +((debit11 - credit11).toFixed(2));
									calc11 = +((prevcal10 + balance11).toFixed(2));
									prevcal11 = calc11;
									currency11 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period11doc = property.PERIOD;
									debit11doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit11doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance11doc  = +((debit11doc - credit11doc).toFixed(2));
									calc11doc  = +((prevcal10doc + balance11doc).toFixed(2));
									prevcal11doc  = calc11doc ;
									currency11doc  = property.DOCCUR;	
									}
									break;
								case "12":
									period12 = property.PERIOD;
									debit12 += +oFloatFormat.parse(property.RES_HCLDR);
									credit12 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance12 = +((debit12 - credit12).toFixed(2));
									calc12 = +((prevcal11 + balance12).toFixed(2));
									prevcal12 = calc12;
									currency12 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period12doc = property.PERIOD;
									debit12doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit12doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance12doc  = +((debit12doc - credit12doc).toFixed(2));
									calc12doc  = +((prevcal11doc + balance12doc).toFixed(2));
									prevcal12doc  = calc12doc ;
									currency12doc  = property.DOCCUR;		
									}
									break;
								case "13":
									period13 = property.PERIOD;
									debit13 += +oFloatFormat.parse(property.RES_HCLDR);
									credit13 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance13 = +((debit13 - credit13).toFixed(2));
									calc13 = +((prevcal12 + balance13).toFixed(2));
									prevcal13 = calc13;
									currency13 = property.LOCCUR;

									if(property.DOCCUR === oDisplayCurr )
									{
									period13doc = property.PERIOD;
									debit13doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit13doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance13doc  = +((debit13doc - credit13doc).toFixed(2));
									calc13doc  = +((prevcal12doc + balance13doc).toFixed(2));
									prevcal13doc  = calc13doc ;
									currency13doc  = property.DOCCUR;	
									}
									break;
								case "14":
									period14 = property.PERIOD;
									debit14 += +oFloatFormat.parse(property.RES_HCLDR);
									credit14 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance14 = +((debit14 - credit14).toFixed(2));
									calc14 = +((prevcal13 + balance14).toFixed(2));
									prevcal14 = calc14;
									currency14 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period14doc = property.PERIOD;
									debit14doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit14doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance14doc  = +((debit14doc - credit14doc).toFixed(2));
									calc14doc  = +((prevcal13doc + balance14doc).toFixed(2));
									prevcal14doc  = calc14doc ;
									currency14doc  = property.DOCCUR;	
									}
									break;
								case "15":
									period15 = property.PERIOD;
									debit15 += +oFloatFormat.parse(property.RES_HCLDR);
									credit15 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance15 = +((debit15 - credit15).toFixed(2));
									calc15 = +((prevcal14 + balance15).toFixed(2));
									prevcal15 = calc15;
									currency15 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period15doc = property.PERIOD;
									debit15doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit15doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance15doc  = +((debit15doc - credit15doc).toFixed(2));
									calc15doc  = +((prevcal14doc + balance15doc).toFixed(2));
									prevcal15doc  = calc15doc ;
									currency15doc  = property.DOCCUR;	
									}
									break;
								case "16":
									period16 = property.PERIOD;
									debit16 += +oFloatFormat.parse(property.RES_HCLDR);
									credit16 += +oFloatFormat.parse(property.RES_HCLCR) * -1;
									balance16 = +((debit16 - credit16).toFixed(2));
									calc16 = +((prevcal15 + balance16).toFixed(2));
									prevcal16 = calc16;
									currency16 = property.LOCCUR;
									
									if(property.DOCCUR === oDisplayCurr )
									{
									period16doc = property.PERIOD;
									debit16doc  += +oFloatFormat.parse(property.RES_TSLDR);
									credit16doc  += +oFloatFormat.parse(property.RES_TSLCR) * -1;
									balance16doc  = +((debit16doc - credit16doc).toFixed(2));
									calc16doc  = +((prevcal15doc + balance16doc).toFixed(2));
									prevcal16doc  = calc16doc ;
									currency16doc  = property.DOCCUR;	
									}
									break;
								}
							}
								// add all the column totals
								debitTotal = debit + debit1 + debit2 + debit3 + debit4 + debit5 + debit6 + debit7 + debit8 + debit9 + debit10 + debit11 +
									debit12 + debit13 + debit14 + debit15 + debit16;
								creditTotal = credit + credit1 + credit2 + credit3 + credit4 + credit5 + credit6 + credit7 + credit8 + credit9 + credit10 +
									credit11 + credit12 + credit13 + credit14 + credit15 + credit16;
								balanceTotal = balance + balance1 + balance2 + balance3 + balance4 + balance5 + balance6 + balance7 + balance8 + balance9 +
									balance10 + balance11 + balance12 + balance13 + balance14 + balance15 + balance16;
								calcTotal = calc16;	
								
								debitTotaldoc = debitdoc + debit1doc + debit2doc + debit3doc + debit4doc + debit5doc + debit6doc + debit7doc + debit8doc + debit9doc + debit10doc + debit11doc +
									debit12doc + debit13doc + debit14doc + debit15doc + debit16doc;
								creditTotaldoc = creditdoc + credit1doc + credit2doc + credit3doc + credit4doc + credit5doc + credit6doc + credit7doc + credit8doc + credit9doc + credit10doc +
									credit11doc + credit12doc + credit13doc + credit14doc + credit15doc + credit16doc;
								balanceTotaldoc = balancedoc + balance1doc + balance2doc + balance3doc + balance4doc + balance5doc + balance6doc + balance7doc + balance8doc + balance9doc +
									balance10doc + balance11doc + balance12doc + balance13doc + balance14doc + balance15doc + balance16doc;
								calcTotaldoc = calc16doc;									
							//Add all the totals to the end of the column 
							oDataColumn.rowslocal.push({
								columnPeriod: period,
								columnDebit: debit,
								columnCredit: credit,
								columnBalance: balance,
								columnCalc: calc,
								columnCurrency: currency
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period1,
								columnDebit: debit1,
								columnCredit: credit1,
								columnBalance: balance1,
								columnCalc: calc1,
								columnCurrency: currency1
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period2,
								columnDebit: debit2,
								columnCredit: credit2,
								columnBalance: balance2,
								columnCalc: calc2,
								columnCurrency: currency2
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period3,
								columnDebit: debit3,
								columnCredit: credit3,
								columnBalance: balance3,
								columnCalc: calc3,
								columnCurrency: currency3
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period4,
								columnDebit: debit4,
								columnCredit: credit4,
								columnBalance: balance4,
								columnCalc: calc4,
								columnCurrency: currency4
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period5,
								columnDebit: debit5,
								columnCredit: credit5,
								columnBalance: balance5,
								columnCalc: calc5,
								columnCurrency: currency5
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period6,
								columnDebit: debit6,
								columnCredit: credit6,
								columnBalance: balance6,
								columnCalc: calc6,
								columnCurrency: currency6
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period7,
								columnDebit: debit7,
								columnCredit: credit7,
								columnBalance: balance7,
								columnCalc: calc7,
								columnCurrency: currency7
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period8,
								columnDebit: debit8,
								columnCredit: credit8,
								columnBalance: balance8,
								columnCalc: calc8,
								columnCurrency: currency8
							});

							oDataColumn.rowslocal.push({
								columnPeriod: period9,
								columnDebit: debit9,
								columnCredit: credit9,
								columnBalance: balance9,
								columnCalc: calc9,
								columnCurrency: currency9
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period10,
								columnDebit: debit10,
								columnCredit: credit10,
								columnBalance: balance10,
								columnCalc: calc10,
								columnCurrency: currency10
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period11,
								columnDebit: debit11,
								columnCredit: credit11,
								columnBalance: balance11,
								columnCalc: calc11,
								columnCurrency: currency11
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period12,
								columnDebit: debit12,
								columnCredit: credit12,
								columnBalance: balance12,
								columnCalc: calc12,
								columnCurrency: currency12
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period13,
								columnDebit: debit13,
								columnCredit: credit13,
								columnBalance: balance13,
								columnCalc: calc13,
								columnCurrency: currency13
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period14,
								columnDebit: debit14,
								columnCredit: credit14,
								columnBalance: balance14,
								columnCalc: calc14,
								columnCurrency: currency14
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period15,
								columnDebit: debit15,
								columnCredit: credit15,
								columnBalance: balance15,
								columnCalc: calc15,
								columnCurrency: currency15
							});
							oDataColumn.rowslocal.push({
								columnPeriod: period16,
								columnDebit: debit16,
								columnCredit: credit16,
								columnBalance: balance16,
								columnCalc: calc16,
								columnCurrency: currency16
							});
							oDataColumn.rowslocal.push({
								columnPeriod: self.getView().getModel("i18n").getResourceBundle().getText("total"),
								columnDebit: debitTotal,
								columnCredit: creditTotal,
								columnBalance: balanceTotal,
								columnCalc: calcTotal,
								columnCurrency: currency16
							});
							
							//Add all the totals to the end of the column 
							oDataColumn.rowsdocument.push({
								columnPeriod: perioddoc,
								columnDebit: debitdoc,
								columnCredit: creditdoc,
								columnBalance: balancedoc,
								columnCalc: calcdoc,
								columnCurrency: currencydoc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period1doc,
								columnDebit: debit1doc,
								columnCredit: credit1doc,
								columnBalance: balance1doc,
								columnCalc: calc1doc,
								columnCurrency: currency1doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period2doc,
								columnDebit: debit2doc,
								columnCredit: credit2doc,
								columnBalance: balance2doc,
								columnCalc: calc2doc,
								columnCurrency: currency2doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period3doc,
								columnDebit: debit3doc,
								columnCredit: credit3doc,
								columnBalance: balance3doc,
								columnCalc: calc3doc,
								columnCurrency: currency3doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period4doc,
								columnDebit: debit4doc,
								columnCredit: credit4doc,
								columnBalance: balance4doc,
								columnCalc: calc4doc,
								columnCurrency: currency4doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period5doc,
								columnDebit: debit5doc,
								columnCredit: credit5doc,
								columnBalance: balance5doc,
								columnCalc: calc5doc,
								columnCurrency: currency5doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period6doc,
								columnDebit: debit6doc,
								columnCredit: credit6doc,
								columnBalance: balance6doc,
								columnCalc: calc6doc,
								columnCurrency: currency6doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period7doc,
								columnDebit: debit7doc,
								columnCredit: credit7doc,
								columnBalance: balance7doc,
								columnCalc: calc7doc,
								columnCurrency: currency7doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period8doc,
								columnDebit: debit8doc,
								columnCredit: credit8doc,
								columnBalance: balance8doc,
								columnCalc: calc8doc,
								columnCurrency: currency8doc
							});

							oDataColumn.rowsdocument.push({
								columnPeriod: period9doc,
								columnDebit: debit9doc,
								columnCredit: credit9doc,
								columnBalance: balance9doc,
								columnCalc: calc9doc,
								columnCurrency: currency9doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period10doc,
								columnDebit: debit10doc,
								columnCredit: credit10doc,
								columnBalance: balance10doc,
								columnCalc: calc10doc,
								columnCurrency: currency10doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period11doc,
								columnDebit: debit11doc,
								columnCredit: credit11doc,
								columnBalance: balance11doc,
								columnCalc: calc11doc,
								columnCurrency: currency11doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period12doc,
								columnDebit: debit12doc,
								columnCredit: credit12doc,
								columnBalance: balance12doc,
								columnCalc: calc12doc,
								columnCurrency: currency12doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period13doc,
								columnDebit: debit13doc,
								columnCredit: credit13doc,
								columnBalance: balance13doc,
								columnCalc: calc13doc,
								columnCurrency: currency13doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period14doc,
								columnDebit: debit14doc,
								columnCredit: credit14doc,
								columnBalance: balance14doc,
								columnCalc: calc14doc,
								columnCurrency: currency14doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period15doc,
								columnDebit: debit15doc,
								columnCredit: credit15doc,
								columnBalance: balance15doc,
								columnCalc: calc15doc,
								columnCurrency: currency15doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: period16doc,
								columnDebit: debit16doc,
								columnCredit: credit16doc,
								columnBalance: balance16doc,
								columnCalc: calc16doc,
								columnCurrency: currency16doc
							});
							oDataColumn.rowsdocument.push({
								columnPeriod: self.getView().getModel("i18n").getResourceBundle().getText("total"),
								columnDebit: debitTotaldoc,
								columnCredit: creditTotaldoc,
								columnBalance: balanceTotaldoc,
								columnCalc: calcTotaldoc,
								columnCurrency: currency16doc
							});							
							oTableModel.setData(oDataColumn);
							BusyIndicator.hide();
							resolve(oTableModel);
						},
						error: function (oError) {
							BusyIndicator.hide();
						}

					});

			});
		},
		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("BUKRS", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleSearchAccount: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("SAKNR", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleValueHelpCompany: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "tool_master.view.ValueHelpCompany",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					//					this._configValueHelpDialog();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				//				this._configValueHelpDialog();
				this._oValueHelpDialog.open();
			}
		},
		_configValueHelpDialog: function () {
			var sInputValue = this.byId("cCode").getValue(),
				oModel = this.getView().getModel("/t001"),
				aCompany = oModel.getProperty("/BUKRS");

			aCompany.forEach(function (oCompany) {
				oCompany.selected = (oCompany.Name === sInputValue);
			});
			oModel.setProperty("/t001", aCompany);
		},
		handleValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("cCode");

			if (oSelectedItem) {
				this.byId("cCode").setValue(oSelectedItem.getTitle());
			}

			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		handleValueHelpAccount: function () {
			if (!this._oValueHelpDialogCustomer) {
				Fragment.load({
					name: "tool_master.view.ValueHelpAccount",
					controller: this
				}).then(function (oValueHelpDialogAccount) {
					this._oValueHelpDialogAccount = oValueHelpDialogAccount;
					this.getView().addDependent(this._oValueHelpDialogAccount);
					//					this._configValueHelpDialog();
					this._oValueHelpDialogAccount.open();
				}.bind(this));
			} else {
				//				this._configValueHelpDialog();
				this._oValueHelpDialogAccount.open();
			}
		},
		handleValueHelpCloseAccount: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("account");

			if (oSelectedItem) {
				this.byId("account").setValue(oSelectedItem.getTitle());
			}

			if (!oSelectedItem) {
				oInput.resetProperty("value");
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
					label: self.getView().getModel("i18n").getResourceBundle().getText("companycode"),
					template: "BUTXT"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldCompanyCode = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogCompanyCode = sap.ui.xmlfragment("tool_master.view.fragment.CompanyCodeFragment", this);
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
		onSaveVariant: function (oEvent) {
			var variant = {
				"client": this._oClient.getValue(),
				"companycode": {
					"key": this._oCompanyCode.getTokens()[0].getKey(),
					"text": this._oCompanyCode.getTokens()[0].getText()
				},
				"account": {
					"key": this._oAccount.getTokens()[0].getKey(),
					"text": this._oAccount.getTokens()[0].getText()
				},
				"ledger":this._oLedger.getValue(),
				"year": this._oYear.getValue(),
				"displaycurr": this._oDisplayCurr.getValue()
			};
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
			this._oClient.setValue(changedVariant.client);
			this._oCompanyCode.setTokens(
				[new sap.m.Token({
					key: changedVariant.companycode.key,
					text: changedVariant.companycode.text
				})]
			);
			this._oAccount.setTokens(
				[new sap.m.Token({
					key: changedVariant.account.key,
					text: changedVariant.account.text
				})]
			);
			this._oLedger.setValue(changedVariant.ledger);
			this._oYear.setValue(changedVariant.year);
			this._oDisplayCurr.setValue(changedVariant.displaycurr);
			}
		},
		onManage : function(oEvent){
			this.onDeleteVariant(oEvent.getParameters().deleted);
		},
		standardVariantReset: function () {
			this._oClient.setValue("");
			this._oAccount.destroyTokens();
			this._oCompanyCode.destroyTokens();
			this._oLedger.setValue("");
			this._oYear.setValue("");
			this._oDisplayCurr.setValue("");
		},
		showAccount: function () {
			var self = this;
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: self.getView().getModel("i18n").getResourceBundle().getText("client"),
					template: "MANDT"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("chartofaccounts"),
					template: "KTOPL"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("account"),
					template: "SAKNR"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldAccount = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogAccount = sap.ui.xmlfragment("tool_master.view.fragment.AccountFragmentSingle", this);
			this.getView().addDependent(this._oValueHelpDialogAccount);
			this._oValueHelpDialogAccount.setRangeKeyFields([{
				label: self.getView().getModel("i18n").getResourceBundle().getText("account"),
				key: "SAKNR",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogAccount.getTableAsync().then(function (t) {

				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
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
		resetFields: function () {
			this.getView().byId("account").destroyTokens();
			this.getView().byId("companycode").destroyTokens();
		}
	});
});