sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("tool_master.controller.launchpad", {
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
		onPressFD10N: function () {
				this._router = sap.ui.core.UIComponent.getRouterFor(this);
				this._router.navTo("FD10N");
		},
		onPressFK10N: function () {
				this._router = sap.ui.core.UIComponent.getRouterFor(this);
				this._router.navTo("FK10N");
		},
		onPressFS10N: function () {
				this._router = sap.ui.core.UIComponent.getRouterFor(this);
				this._router.navTo("FS10N");
		},
		onPressFD11N: function () {
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.navTo("FD11N");
		}  	
	});
});