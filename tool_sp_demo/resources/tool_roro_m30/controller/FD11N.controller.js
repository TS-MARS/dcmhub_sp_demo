sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/SearchField",
	"sap/ui/model/type/String"
], function (Controller, ODataModel, JSONModel, NumberFormat, Fragment, Filter, FilterOperator, SearchField, String) {
	"use strict";

	return Controller.extend("tool_sp_demo.controller.FD11N", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			this.getView().setModel(oF10Model);
			this._oClient = this.getView().byId("client");
			this._oCompanyCode = this.getView().byId("companycode");
			this._oCustomer = this.getView().byId("customer");
			this._oYear = this.getView().byId("year");
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
			oPersonalizationService.getContainer("sap.ushell.variant.FD11_sp_demo", oScope, oComponent)
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

			var oView = this.getView();
			var oController = oView.getController();
			var oClient = oView.byId("client").getValue();
			var oCCode = this._oCompanyCode.getTokens()[0].getKey();
			var oCustomer = this._oCustomer.getTokens()[0].getKey();
			//	   var oCCode = oView.byId("cCode").getValue();
			//	   var oCustomer = oView.byId("customer").getValue();
			var oYear = oView.byId("year").getValue();
			//retrieve Company Code details
			this._getCompanyModel(oClient, oCCode, oCustomer, oYear).then(function (oDataColumn) {

				oController._getEntityName(oDataColumn).then(function (oCompanyModel) {
					oView.setModel(oCompanyModel, "company");
				});

			});
			//retrieve the content calculation
			this._modelCalculation(oClient, oCCode, oCustomer, oYear).then(function (oModel) {
				var oTableModel = oView.byId("tableId");
				oView.setModel(oModel, "data");
				//	oTableModel.setModel(oModel);
			});
			this._modelCalculationSL(oClient, oCCode, oCustomer, oYear).then(function (oModel) {
				var oTableModel = oView.byId("tableIdSL");
				oView.setModel(oModel, "dataSL");
				//	oTableModel.setModel(oModel);
			});
			this._modelCalculationPH(oClient, oCCode, oCustomer).then(function (oModel) {
				var oTableModel = oView.byId("tableIdPH");
				oView.setModel(oModel, "dataPH");
				//	oTableModel.setModel(oModel);
			});
			this._modelCalculationOI(oClient, oCCode, oCustomer,oYear).then(function (oModel) {
				
				oView.setModel(oModel, "dataOI");
				//	oTableModel.setModel(oModel);
			});
			this._modelCalculationDI(oClient, oCCode, oCustomer, oYear).then(function (oModel) {
				var oTableModel = oView.byId("tableIdSL");
				oView.setModel(oModel, "dataDI");
				//	oTableModel.setModel(oModel);
			});
			//Group SL Account balance
			this._modelCalculationSL(oClient, "*", oCustomer, oYear).then(function (oModel) {
				var oTableModel = oView.byId("tableIdSL");
				oView.setModel(oModel, "dataSLG");
				//	oTableModel.setModel(oModel);
			});			
			this._modelCalculationDIG(oClient, oCCode, oCustomer, oYear).then(function (oModel) {
				var oTableModel = oView.byId("tableIdSL");
				oView.setModel(oModel, "dataDIG");
				//	oTableModel.setModel(oModel);
			});			
			// selection filter function call
			this.byId("pageContainer").to(this.getView().createId("page2"));
			this.byId("nextButtonId").setVisible(false);
		},

		onNavButtonPress: function (oEvent) {
			this.byId("pageContainer").to(this.getView().createId("page1"));
			this.byId("nextButtonId").setVisible(true);
		},

		_getCompanyModel: function (oClient, oCCode, oCustomer, oYear) {

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
								columnCustomer: oCustomer,
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

			var aCustomerFilter = new sap.ui.model.Filter({
				path: "KUNNR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oDataColumn.company[0].columnCustomer
			});
			aFilters.push(aCustomerFilter);

			return new Promise(function (resolve, reject) {
				oF10Model.read("/kna1", {
					filters: aFilters,
					success: function (oResult) {
						for (var i = 0; i < oResult.results.length; i++) {
							var property = oResult.results[i];

							oDataColumn.company[0].columnCustomer = (oDataColumn.company[0].columnCustomer + " " + property.NAME1 + " " + property.NAME2);

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
		// client(MANDT), Vendor Number (LIFNR), Company Code (BUKRS), Year(GJAHR)		
		_modelCalculation: function (oClient, oCCode, oCustomer, oYear) {
			var that = this;
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			//			var bcf = this.getOwnerComponent().getView().getModel("i18n").getResourceBundle().getText("bcf");
			var oTableModel = new JSONModel();

			//table Rows
			var oDataColumn = {
				header: [],
				rows: []
			};
			var debitTotal = 0.00,
				creditTotal = 0.00,
				balanceTotal = 0.00,
				calcTotal = 0.00,
				salesTotal = 0.00;

			oDataColumn.header.push({
				columnClient: oClient,
				columnCCode: oCCode,
				columnCustomer: oCustomer,
				columnYear: oYear
			});
			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fd11_1Parameters(IP_MANDT='" + oClient + "',IP_KUNNR='" + oCustomer + "',IP_BUKRS='" + oCCode + "',IP_GJAHR='" + oYear +
					"')/Results", {
						success: function (oResult) {
							var oLocale = sap.ui.getCore().getConfiguration().getLanguage();

							var oFloatFormat = NumberFormat.getFloatInstance(oLocale);
							var period = "",
								debit = 0.00,
								credit = 0.00,
								sales = 0.00,
								balance = 0.00,
								calc = 0.00,
								prevcal = 0.00;

							for (var i = 0; i < oResult.results.length; i++) {
								var property = oResult.results[i];
								// parse the amounts to decimal floats
								// oData returns as strings
								// Convert period 0 to Balance Carry Forward
								if (property.PERIOD === "0") {
									period = that.getView().getModel("i18n").getResourceBundle().getText("bcf");
									debit = 0;
									credit = 0;
									balance = 0;
									sales = 0;
									calc = oFloatFormat.parse(property.DEBIT); // Balance carry forward is stored in the Debit field in the backend.
									that._bcf = calc;
									prevcal = calc;
									//								sales = oFloatFormat.parse(property.SALES);	
								} else {
									period = property.PERIOD;
									debit = oFloatFormat.parse(property.DEBIT);
									credit = oFloatFormat.parse(property.CREDIT);
									sales = oFloatFormat.parse(property.SALES);
									balance = +((debit - credit).toFixed(2));
									calc = +((prevcal + balance).toFixed(2));
									prevcal = calc;
								}

								oDataColumn.rows.push({
									columnPeriod: period,
									columnDebit: debit,
									columnCredit: credit,
									columnBalance: balance,
									columnCalc: calc,
									columnSales: sales
								});

								// add all the column totals
								debitTotal += debit;
								creditTotal += credit;
								balanceTotal += balance;
								calcTotal = calc;
								salesTotal = salesTotal + sales;

							}
							//Add all the totals to the end of the column 
							oDataColumn.rows.push({
								columnPeriod: that.getView().getModel("i18n").getResourceBundle().getText("total"),
								columnDebit: debitTotal,
								columnCredit: creditTotal,
								columnBalance: balanceTotal,
								columnCalc: calcTotal,
								columnSales: salesTotal
							});
							that._debitTotal = debitTotal;
							that._creditTotal = creditTotal;
							that._calcTotal= calcTotal;
							oTableModel.setData(oDataColumn);
							resolve(oTableModel);
						},
						error: function (oError) {}

					});

			});
			
		},
		_modelCalculationSL: function (oClient, oCCode, oCustomer, oYear) {
			var that = this;
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			//			var bcf = this.getOwnerComponent().getView().getModel("i18n").getResourceBundle().getText("bcf");
			var oTableModel = new JSONModel();

			//table Rows
			var oDataColumn = {
				header: [],
				rows: []
			};
			var debitTotal = 0.00,
				creditTotal = 0.00,
				balanceTotal = 0.00,
				balancecarryTotal = 0.00;

			oDataColumn.header.push({
				columnClient: oClient,
				columnCCode: oCCode,
				columnCustomer: oCustomer,
				columnYear: oYear
			});
			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fd11slParameters(IP_MANDT='" + oClient + "',IP_KUNNR='" + oCustomer + "',IP_BUKRS='" + oCCode + "',IP_GJAHR='" + oYear +
					"')/Results", {
						success: function (oResult) {
							var oLocale = sap.ui.getCore().getConfiguration().getLanguage();

							var oFloatFormat = NumberFormat.getFloatInstance(oLocale);
							var transaction = "",
							balancecarry = 0.00,
								debit = 0.00,
								credit = 0.00,
								balance = 0.00;

							for (var i = 0; i < oResult.results.length; i++) {
								var property = oResult.results[i];
								// parse the amounts to decimal floats
								// oData returns as strings
								// Convert period 0 to Balance Carry Forward
								
									transaction = property.SHBKZ;
									debit = oFloatFormat.parse(property.SOLLL);
									credit = oFloatFormat.parse(property.HABNL);
									balancecarry = oFloatFormat.parse(property.SALDV);
									balance = +(balancecarry+debit - credit).toFixed(2);
									
								

								oDataColumn.rows.push({
									columnTransaction: transaction,
									columnBalancecarry : balancecarry,
									columnDebit: debit,
									columnCredit: credit,
									columnBalance: balance
								});

								// add all the column totals
								debitTotal += debit;
								creditTotal += credit;
								balanceTotal += balance;
								balancecarryTotal += balancecarry;
								

							}
							//Add all the totals to the end of the column 
							oDataColumn.rows.push({
								columnTransaction: that.getView().getModel("i18n").getResourceBundle().getText("total"),
								columnDebit: debitTotal,
								columnCredit: creditTotal,
								columnBalance: balanceTotal,
								columnBalancecarry : balancecarryTotal
							});
							that._gbalance = balancecarryTotal;
							oDataColumn.rows.push({
								columnTransaction: that.getView().getModel("i18n").getResourceBundle().getText("accbal"),
								columnDebit: that._debitTotal,
								columnCredit: that._creditTotal,
								columnBalance: that._bcf + (that._debitTotal-that._creditTotal),
								columnBalancecarry : that._bcf
							});
								
								oDataColumn.rows.push({
								columnTransaction: that.getView().getModel("i18n").getResourceBundle().getText("stotal"),
								columnDebit: debitTotal+that._debitTotal,
								columnCredit: creditTotal+that._creditTotal,
								columnBalance: balanceTotal+ (that._bcf + (that._debitTotal-that._creditTotal)),
								columnBalancecarry : that._bcf + balancecarryTotal
							});
							
							
							oTableModel.setData(oDataColumn);
							resolve(oTableModel);
						},
						error: function (oError) {}

					});

			});
		},
		_modelCalculationPH: function (oClient, oCCode, oCustomer) {
			var that = this;
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			//			var bcf = this.getOwnerComponent().getView().getModel("i18n").getResourceBundle().getText("bcf");
			var oTableModel = new JSONModel();

			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fd11phParameters(IP_MANDT='" + oClient + "',IP_KUNNR='" + oCustomer + "',IP_BUKRS='" + oCCode + "')/Results", {
						success: function (oResult) {
							
							var oData = [];
							var col;
							if(oResult.results.length>0){
							for(var i=1;i<=16;i++){
							
								if(i<10){
									col= "0"+i;
								}
								else{
								col=i;
								}
								var dataArray = {};
								dataArray.JAH = oResult.results[0]["JAH"+col];   
								dataArray.MON = oResult.results[0]["MON"+col];
								dataArray.AGS = oResult.results[0]["AGS"+col];
								dataArray.VZS = oResult.results[0]["VZS"+col];
								dataArray.AGN = oResult.results[0]["AGN"+col];
								dataArray.VZN = oResult.results[0]["VZN"+col];
								dataArray.ANZ = oResult.results[0]["ANZ"+col];
								oData.push(dataArray);
							}
							}
							oTableModel.setData(oData);
							resolve(oTableModel);
						},
						error: function (oError) {}

					});

			});
		},
			_modelCalculationOI: function (oClient, oCCode, oCustomer,oYear) {
			var that = this;
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			//			var bcf = this.getOwnerComponent().getView().getModel("i18n").getResourceBundle().getText("bcf");
			var oTableModel = new JSONModel();

			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fd11oiParameters(IP_MANDT='" + oClient + "',IP_KUNNR='" + oCustomer + "',IP_BUKRS='" + oCCode + "',IP_GJAHR='" + oYear +
					"')/Results", {
						success: function (oResult) {
							var amount=0,discount=0,count=0;
							for(var i=0;i<oResult.results.length;i++){
								amount+=oResult.results[i].DMBTR*1;
								discount+=oResult.results[i].SKNTO*1;
								count++;
							}
							
							oTableModel.setData([{"Amount":amount,"Discount":discount,"Count":count}]);
							resolve(oTableModel);
						},
						error: function (oError) {
							
						}

					});

			});
		},
			_modelCalculationDI: function (oClient, oCCode, oCustomer,oYear) {
			var that = this;
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			//			var bcf = this.getOwnerComponent().getView().getModel("i18n").getResourceBundle().getText("bcf");
			var oTableModel = new JSONModel();

			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fd11diParameters(IP_MANDT='" + oClient + "',IP_KUNNR='" + oCustomer + "',IP_BUKRS='" + oCCode + "',IP_GJAHR='" + oYear +
					"')/Results", {
						success: function (oResult) {
							
							oResult.results[0].TotalDeduct = oResult.results[0].UABZG*1 + oResult.results[0].BABZG*1;
							oResult.results[0].PerClearing = (oResult.results[0].UABZG*1 + oResult.results[0].BABZG*1)*100/oResult.results[0].KUMAG;
							oResult.results[0].AccountBal = that._calcTotal;
							oTableModel.setData(oResult.results);
							resolve(oTableModel);
						},
						error: function (oError) {
							
						}

					});

			});
		},
			_modelCalculationDIG: function (oClient, oCCode, oCustomer,oYear) {
			var that = this;
			var oComponent = this.getOwnerComponent(); //Returns the Component
			var oF10Model = oComponent.getModel("F10Set");
			//			var bcf = this.getOwnerComponent().getView().getModel("i18n").getResourceBundle().getText("bcf");
			var oTableModel = new JSONModel();

			return new Promise(function (resolve, reject) {

				oF10Model.read(
					"/fd11digParameters(IP_MANDT='" + oClient + "',IP_KUNNR='" + oCustomer + "',IP_GJAHR='" + oYear +
					"')/Results", {
						success: function (oResult) {
							
							oResult.results[0].TotalDeduct = that._gbalance;
							oResult.results[0].TotalRec = that._gbalance + that._calcTotal;
							oResult.results[0].AccountBal = that._calcTotal;
							oTableModel.setData(oResult.results);
							resolve(oTableModel);
						},
						error: function (oError) {
							
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

		handleSearchCustomer: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("KUNNR", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleValueHelpCompany: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "tool_sp_demo.view.ValueHelpCompany",
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
		handleValueHelpCustomer: function () {
			if (!this._oValueHelpDialogCustomer) {
				Fragment.load({
					name: "tool_sp_demo.view.ValueHelpCustomer",
					controller: this
				}).then(function (oValueHelpDialogCustomer) {
					this._oValueHelpDialogCustomer = oValueHelpDialogCustomer;
					this.getView().addDependent(this._oValueHelpDialogCustomer);
					//					this._configValueHelpDialog();
					this._oValueHelpDialogCustomer.open();
				}.bind(this));
			} else {
				//				this._configValueHelpDialog();
				this._oValueHelpDialogCustomer.open();
			}
		},
		handleValueHelpCloseCustomer: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("customer");

			if (oSelectedItem) {
				this.byId("customer").setValue(oSelectedItem.getTitle());
			}

			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},

		showCompanyCode: function () {
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: "Client",
					template: "MANDT"
				}, {
					label: "Company Code",
					template: "BUKRS"
				}, {
					label: "Company Name",
					template: "BUTXT"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldCompanyCode = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogCompanyCode = sap.ui.xmlfragment("tool_sp_demo.view.fragment.CompanyCodeFragment", this);
			this.getView().addDependent(this._oValueHelpDialogCompanyCode);
			this._oValueHelpDialogCompanyCode.setRangeKeyFields([{
				label: "Company Code",
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
		showCustomer: function () {
			var self = this;
			var e = new JSONModel();
			e.setData({
				cols: [{
					label: self.getView().getModel("i18n").getResourceBundle().getText("client"),
					template: "MANDT"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("customer"),
					template: "KUNNR"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("companycode"),
					template: "BUKRS"
				}, {
					label: self.getView().getModel("i18n").getResourceBundle().getText("customername"),
					template: "NAME1"
				}]
			});
			var t = e.getData().cols;
			this._oBasicSearchFieldCustomer = new SearchField({
				showSearchButton: false
			});
			this._oValueHelpDialogCustomer = sap.ui.xmlfragment("tool_sp_demo.view.fragment.CustomerFragment", this);
			this.getView().addDependent(this._oValueHelpDialogCustomer);
			this._oValueHelpDialogCustomer.setRangeKeyFields([{
				label: self.getView().getModel("i18n").getResourceBundle().getText("customer"),
				key: "KUNNR",
				type: "string",
				typeInstance: new String({}, {
					maxLength: 7
				})
			}]);
			this._oValueHelpDialogCustomer.getTableAsync().then(function (t) {
				var aFilters = [];
				var o = this.getView().byId("client")._getSelectedItemText();
				if (o == "") {
					o = null;
				}
				else
				{
					var oFilter = new sap.ui.model.Filter({
						path: "MANDT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: o
					});
					aFilters.push(oFilter);
				}
				var tokens = this._oCompanyCode.getTokens();
				if(tokens.length !== 0)
				{
					var p = this._oCompanyCode.getTokens()[0].getKey();
					if (p == "") {
						p = null;
					}
					else
					{
					var oFilter = new sap.ui.model.Filter({
						path: "BUKRS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: p
					});
					aFilters.push(oFilter);						

					}
				}
				var a;
				this._oValueHelpDialogCustomer.getFilterBar().setBasicSearch(this._oBasicSearchFieldCustomer);
				this.getView().getModel().read("/customer", {
					filters: aFilters,
					success: function (e, o) {
						a = new sap.ui.model.json.JSONModel(e.results);
						t.setModel(a);
						t.bindRows("/");
					}
				});
				t.setModel(e, "columns");
				this._oValueHelpDialogCustomer.update();
			}.bind(this));
			this._oValueHelpDialogCustomer.setTokens(this._oCustomer.getTokens());
			this._oValueHelpDialogCustomer.open();
		},
		onValueHelpOkPressCustomer: function (e) {
			var t = e.getParameter("tokens");
			this._oCustomer.setTokens(t);
			this._oValueHelpDialogCustomer.close();
		},
		onValueHelpCancelPressCustomer: function () {
			this._oValueHelpDialogCustomer.close();
		},
		onValueHelpAfterCloseCustomer: function () {
			this._oValueHelpDialogCustomer.destroy();
		},
		onFilterBarSearchCustomer: function (e) {
			var t = this._oBasicSearchFieldCustomer.getValue(),
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
					path: "KUNNR",
					operator: FilterOperator.Contains,
					value1: t
				}), new Filter({
					path: "NAME1",
					operator: FilterOperator.Contains,
					value1: t
				})],
				and: false
			}));
			this._filterTableCustomer(new Filter({
				filters: a,
				and: true
			}));
		},
		_filterTableCustomer: function (e) {
			var t = this._oValueHelpDialogCustomer;
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
			this.getView().byId("customer").destroyTokens();
			this.getView().byId("companycode").destroyTokens();
		},
		onSaveVariant: function (oEvent) {
			var variant = {
				"client": this._oClient.getValue(),
				"companycode": {
					"key": this._oCompanyCode.getTokens()[0].getKey(),
					"text": this._oCompanyCode.getTokens()[0].getText()
				},
				"customer": {
					"key": this._oCustomer.getTokens()[0].getKey(),
					"text": this._oCustomer.getTokens()[0].getText()
				},
				"year": this._oYear.getValue()
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
			this._oCustomer.setTokens(
				[new sap.m.Token({
					key: changedVariant.customer.key,
					text: changedVariant.customer.text
				})]
			);
			this._oYear.setValue(changedVariant.year);
			}
		},
		onManage : function(oEvent){
			this.onDeleteVariant(oEvent.getParameters().deleted);
		},
		standardVariantReset: function () {
			this._oClient.setValue("");
			this._oCustomer.destroyTokens();
			this._oCompanyCode.destroyTokens();
			this._oYear.setValue("");
		}

	});
});