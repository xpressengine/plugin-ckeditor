XEeditor.tools.define({
	id : 'editortool/iframe_tool@iframe',
	events: {
		iconClick: function(targetEditor, cbAppendToolContent) {
			var cWindow = window.open(iframeToolURL.get('popup'), 'createIframePopup', "width=450,height=500,directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no");

			$(cWindow).on('load', function() {
				cWindow.targetEditor = targetEditor;
				cWindow.appendToolContent = cbAppendToolContent;
			});
		},
		elementDoubleClick: function() {

		},
		beforeSubmit: function(targetEditor) {
			$(targetEditor.document.$.body).find('iframe[xe-tool-id="editortool/iframe_tool@iframe"]').each(function() {
				var $this = $(this);
				var src = $this.attr('src');
				var width = $this.attr('width');
				var height = $this.attr('height');
				var scrolling = $this.attr('scrolling');

				var $temp = $('<div />');
				var data = {
					src: src,
					width: width,
					height: height,
					scrolling: scrolling
				};

				$temp.attr('xe-tool-data', JSON.stringify(data).replace(/"/g, "'"));
				$temp.attr('xe-tool-id', 'editortool/iframe_tool@iframe');

				$this.after($temp[0]);
				$this.remove();
			});
		},
		editorLoaded: function(targetEditor) {
			$(targetEditor.document.$.body).find('div[xe-tool-id="editortool/iframe_tool@iframe"]').each(function() {
				var $this = $(this);
				var data = JSON.parse($this.attr('xe-tool-data').replace(/'/g, '"'));
				var $iframe = $('<iframe />');

				$iframe.attr('src', data.src);

				if(data.width) {
					$iframe.attr('width', data.width);
				}

				if(data.height) {
					$iframe.attr('height', data.height);
				}

				if(data.scrolling) {
					$iframe.attr('scrolling', data.scrolling);
				}

				$iframe.attr('xe-tool-id', "editortool/iframe_tool@iframe");
				$iframe.attr('xe-tool-data', JSON.stringify(data).replace(/"/g, "'"));

				$this.after($iframe);
				$this.remove();

			});
		}
	},
	css: function() {
		return [];
	},
	props: {
		name: 'XEIframe',
		options: {
			label: 'XEIframe',
			command: 'openXEIframeEditor'
		},
		addEvent: {
			doubleClick: false
		}
	}
});