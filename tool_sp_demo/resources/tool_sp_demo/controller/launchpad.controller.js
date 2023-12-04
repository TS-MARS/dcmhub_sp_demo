sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("tool_sp_demo.controller.launchpad", {
		onInit: function () {
		},
		onPressReporting: function () {
				this._router = sap.ui.core.UIComponent.getRouterFor(this);
				this._router.navTo("reporting");
		}
	});
});