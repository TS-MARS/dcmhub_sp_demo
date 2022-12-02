sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var LocalCurrency = BlockBase.extend("tool_rosemontexport_final.blocks.localCurrency.LocalCurrency", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "tool_rosemontexport_final.blocks.localCurrency.LocalCurrency",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "tool_rosemontexport_final.blocks.localCurrency.LocalCurrency",
					type: ViewType.XML
				}
			}
		}
	});
	return LocalCurrency;
}, true);