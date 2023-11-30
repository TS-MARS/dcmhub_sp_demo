sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var DocumentCurrency = BlockBase.extend("tool_sp_demo.blocks.documentCurrency.DocumentCurrency", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "tool_sp_demo.blocks.documentCurrency.DocumentCurrency",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "tool_sp_demo.blocks.documentCurrency.DocumentCurrency",
					type: ViewType.XML
				}
			}
		}
	});
	return DocumentCurrency;
}, true);