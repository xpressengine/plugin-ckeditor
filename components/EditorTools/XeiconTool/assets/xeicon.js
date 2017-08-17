XEeditor.tools.define({
	id : 'editortool/xeicon_tool@xeicon',
	events: {
		iconClick: function(targetEditor, cbAppendToolContent) {
			var cWindow = window.open(xeiconToolURL.get('popup'), 'createPopup', "width=980,height=600,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no");

			$(cWindow).on('load', function() {
				cWindow.targetEditor = targetEditor;
				cWindow.appendToolContent = cbAppendToolContent;
			});
		},
		elementDoubleClick: function() {
			var _$this = $(this);

			var cWindow = window.open(xeiconToolURL.get('edit_popup'), 'editPopup', "width=980,height=600,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no");

			$(cWindow).on('load', function() {
				cWindow.$target = _$this;
			});
		},
		beforeSubmit: function(targetEditor) {
			$(targetEditor.document.$.body).find('[xe-tool-id="editortool/xeicon_tool@xeicon"]').css('cursor', '');
		},
		editorLoaded: function(targetEditor) {
			$(targetEditor.document.$.body).find('[xe-tool-id="editortool/xeicon_tool@xeicon"]').css('cursor', 'pointer');
		}
	},
	css: function() {
		return xeiconToolURL.get('css');
	},
	props: {
		name: 'XEIcon',
		options: {
			label: 'XEIcon',
			command: 'openXEIcon'
		},
		addEvent: {
			doubleClick: true
		}
	}
});