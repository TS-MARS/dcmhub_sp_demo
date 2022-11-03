sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("tool_svh_hp1.controller.launchpad", {
		onInit: function () {
		},
		onPressReporting: function () {
				this._router = sap.ui.core.UIComponent.getRouterFor(this);
				this._router.navTo("reporting");
		},
		onPressAdhocQuery: function () {
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.navTo("adhocQuery");
		},
		onPressAttachment: function () {
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.navTo("attachment");
    	},
    	onPressFinance: function () {
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.navTo("finance");
		}    	
	});
});