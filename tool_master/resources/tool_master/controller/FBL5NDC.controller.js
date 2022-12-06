sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("tool_master.controller.FBL5NDC", {
		onInit: function () {
				// var oComponent = this.getOwnerComponent();          //Returns the Component
				// var oF10Model = oComponent.getModel("F10Set");			
				// this.getView().setModel(oF10Model);
				this.getView().addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode
		},

		onNavButtonPressMain: function () {

			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.navTo("launchpad", {}, true);

		},
		// Next button on the main page at the footer. Navigates to the main table content display
		onPressNext: function (oEvent) {

		   var oView = this.getView(); 
		   var oController = oView.getController();
		   var mandt = oView.byId("mandt").getValue();
		   var bukrs = oView.byId("bukrs").getValue();
		   var kunnr_von = oView.byId("kunnr_von").getValue();
		   if (kunnr_von === "")
		   {
		   	kunnr_von = " ";
		   }
		   var p_hkont = oView.byId("p_hkont").getValue();
		   
		   if(this.getView().byId("R1").getSelected()){
				var debistatus ="open Items";
				var debistatus ="1";
                    }
                    else if(this.getView().byId("R2").getSelected()){
				var debistatus ="cleared Items";
				var debistatus ="2";
                    }
                    else if(this.getView().byId("R3").getSelected()){
				var debistatus ="all Items";
				var debistatus ="3";
                    }
//		   var debistatus = this.getView().byId("GroupA").getSelectedButton();//.getText();
//		   var debistatus ="open Items";
//		   var debistatus = oView.byId("debistatus").getValue();
		   var stichtag = oView.byId("stichtag").getValue();
		   var apstichtag = oView.byId("apstichtag").getValue();
		   var apbudatvon = oView.byId("apbudatvon").getValue();
		   var apbudatbis = oView.byId("apbudatbis").getValue();
		   var alpbudatvon = oView.byId("alpbudatvon").getValue();
		   var alpbudatbis = oView.byId("alpbudatbis").getValue();
		   var reportname = "FI2000ARDC";

//		var source = "/pentaho?mandt="+mandt+"&bukrs="+bukrs+"&kunnr_von="+kunnr_von+"&p_hkont="+p_hkont+"&debistatus="+debistatus+"&stichtag="+stichtag+"&apstichtag="+apstichtag+"&apbudatvon="+apbudatvon
//		+"&apbudatbis="+apbudatbis+"&alpbudatvon="+alpbudatvon+"&alpbudatbis="+alpbudatbis;
		var source = "/pentaho?portalInterceptorAppId=tool_master&mandt="+mandt+"&bukrs="+bukrs+"&kunnr_von="+kunnr_von+"&p_hkont="+p_hkont+"&debistatus="+debistatus+"&stichtag="+stichtag+"&apstichtag="+apstichtag+"&apbudatvon="+apbudatvon
		+"&apbudatbis="+apbudatbis+"&alpbudatvon="+alpbudatvon+"&alpbudatbis="+alpbudatbis+"&reportname="+reportname;		
		  //  $.ajax({
		  //      url : '/pentaho',
		  //      type: 'GET',
		  //      data: {"P_WERKS": oClient},
				// crossDomain: true,
		  //      success : function(data) {
						var _pdfurl = source;
							this.oPDFViewer = new sap.m.PDFViewer();
							this.oPDFViewer.setSource(_pdfurl);
							this.oPDFViewer.open();
		        // },
		        // error : function(data){
		        //     console.log("Error");
		        // }
//		    });		   
		},		

		onNavButtonPress: function (oEvent) {
			this.byId("pageContainer").to(this.getView().createId("page1"));
			this.byId("nextButtonId").setVisible(true);
		}	
		
	});
});