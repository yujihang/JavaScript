/*
 * version 1.0
 * Date 2016/09/02 11:30:00
 * */
(function(factory) {
	'use strict';
	if(typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(window, document);
		});
	} else if(typeof exports !== 'undefined') {
		module.exports = factory(window, document);
	} else {
		window.RichEditor = factory(window, document);
	}
})(function() {
	'use strict';
	var RichEditor = function(container, params) {
		params = params || {};
		var options = {
			width: 900,
			height: 500,
			borderColor: "#ddd",
			buttons: {
				heading: {
					title: "标题",
					icon: "\uf1dc",
					click: function() {
						var h = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
						r.closeModal();
						var html = '<div class="editor-heading">';
						h.forEach(function(h) {
							html += '<' + h + ' data-h="' + h + '">' + h + '</' + h + '>';
						});
						html += '</div>';

						function HClick() {
							var h = document.querySelector('.editor-heading');
							h = h.childNodes;
							/*console.log('h',h);*/
							/*修改，迭代Nodelist最好使用length属性初始化第二个变量，避免无限循环*/
							for(var i=0, len=h.length; i < len; i++){
								addEvent(h[i], 'click', function() {
									var h = this.getAttribute('data-h');
									r.execCommand('formatBlock', '<' + h + '>');  /*formatBlock使用指定的HTML标签来格式化选择的文本块*/
									r.closeModal();
								}, false);
							}
							/*h.forEach(function(v) {
								addEvent(v, 'click', function() {
									var h = this.getAttribute('data-h');
									r.execCommand('formatBlock', '<' + h + '>');
									r.closeModal();
								}, false);
							});*/
						};
						r.openModal.call(this, html, HClick);
					}
				},
				code: {
					title: "引用",
					icon: "\uf10d",
					click: function() {
						var html='<blockquote class="editor-block"><p><br></p></blockquote>';
						r.execCommand('insertHTML',html);
						var p=document.createElement('p');
						p.innerHTML='<br>';
						et.appendChild(p);
					}
				},
				bold: {
					title: "加粗",
					icon: "\uf032",
					click: function() {
						r.execCommand('bold');
					}
				},
				italic: {
					title: "斜体",
					icon: "\uf033",
					click: function() {
						r.execCommand('italic');
					}
				},
				underline: {
					title: "下划线",
					icon: "\uf0cd",
					click: function() {
						r.execCommand('underline');
					}
				},
				strikethrough: {
					title: "删除线",
					icon: "\uf0cc",
					click: function() {
						r.execCommand('strikethrough');
					}
				},
				foreColor: {
					title: "字体颜色",
					icon: "\uf1fc",
					click: function() {
						var color = new r.colorPicker('foreColor');
						r.openModal.call(this, color.addColorBoard(), color.clickEvent);
					}
				},
				backColor: {
					title: "背景色",
					icon: "\uf043",
					click: function() {
						var color = new r.colorPicker('hiliteColor');
						r.openModal.call(this, color.addColorBoard(), color.clickEvent);
					}
				},
				justifyLeft: {
					title: "居左",
					icon: "\uf036",
					click: function() {
						r.execCommand('justifyLeft');
					}
				},
				justifyCenter: {
					title: "居中",
					icon: "\uf037",
					click: function() {
						r.execCommand('justifyCenter');
					}
				},
				justifyRight: {
					title: "居右",
					icon: "\uf038",
					click: function() {
						r.execCommand('justifyRight');
					}
				},
				justifyFull: {
					title: "两端对齐",
					icon: "\uf039",
					click: function() {
						r.execCommand('justifyFull');
					}
				},
				insertOrderedList: {
					title: "有序列表",
					icon: "\uf0cb",
					click: function() {
						r.execCommand('insertOrderedList');
					}
				},
				insertUnorderedList: {
					title: "无序列表",
					icon: "\uf0ca",
					click: function() {
						r.execCommand('insertUnorderedList');
					}
				},
				indent:{
					title:"indent",
					icon:"\uf03c",
					click:function(){
						r.execCommand('indent');
					}
				},
				outdent:{
					title:"outdent",
					icon:"\uf03b",
					click:function(){
						r.execCommand('outdent');
					}
				},
				createLink: {
					title: "链接",
					icon: "\uf0c1",
					click: function() {
						r.closeModal();
						var html = '<input type="text" placeholder="www.example.com" class="editor-link-input"/> <button type="button" class="editor-confirm">确认</button>';

						function btnClick() {
							var confirm = document.querySelector('.editor-confirm');
							addEvent(confirm, 'click', function() {
								var link = document.querySelector('.editor-link-input');
								if(link.value.trim() != '') {  /*获取字符串副本*/
									var a = '<a href="' + link.value + '" target="_blank">' + link.value + '</a>';
									r.execCommand('insertHTML', a);
									r.closeModal();
								};
							}, false);
						};
						r.openModal.call(this, html, btnClick);
					}
				},
				insertImage: {
					title: "插入图片",
					icon: "\uf03e",
					click: function() {
						r.closeModal();
						var html = '<div class="editor-file">图片上传<input type="file" name="photo" accept="image/*" class="editor-file-input"/></div>';  /*指定MIME类型为图像，以便在load事件中把它保存为数据URL*/
						r.openModal.call(this, html, r.fileInput);
					}
				},
				emotion: {
					title: "表情",
					icon: "\uf118",
					click: function() {
						r.closeModal();
						r.drawEmotion.call(this);
					}
				},
				fullscreen: {
					title: "全屏",
					icon: "\uf066",
					click: function() {
						r.toggleFullScreen();
					}
				},
				save: {
					title: "保存",
					icon: "\uf0c7"
				}
			}
		};
		var selectedRange = null;
		var originParams = {};
		var et = null;
		var toolbarTop = null;
		for(var param in params) {
			if(typeof params[param] === 'object' && params[param] != null) {
				originParams[param] = {};
				for(var deepParam in params[param]) {
					originParams[param][deepParam] = params[param][deepParam];
				};
			} else {
				originParams[param] = params[param];
			}
		};
		for(var def in options) {  /*遍历options,看传进来的params有没有options中的属性,有就覆盖*/
			if(typeof params[def] === 'object') {
				for(var deepDef in options[def]) {
					if(typeof params[def][deepDef] === "object") {
						for(var ddDef in options[def][deepDef]) {
							if(typeof params[def][deepDef][ddDef] === 'undefined') {
								params[def][deepDef][ddDef] = options[def][deepDef][ddDef];
							}
						};
					} else if(def !== "buttons") {
						params[def][deepDef] = options[def][deepDef];
					}
				};
			} else if(typeof params[def] === 'undefined') {
				params[def] = options[def];
			}
		};
		//添加addEventlistener事件
		var addEvent = function(element, type, handler, useCapture) {/*判断使用1级DOM还是2级DOM并兼容IE*/
			if(element.addEventListener) {
				element.addEventListener(type, handler, useCapture ? true : false);
			} else if(element.attachEvent) {
				element.attachEvent('on' + type, handler);
			} else if(element != window){
				element['on' + type] = handler;
			}
		};
		var removeEvent = function(element, type, handler, useCapture) { /*移除事件监听*/
			if(element.removeEventListener) {
				element.removeEventListener(type, handler, useCapture ? true : false);
			} else if(element.detachEvent) {
				element.detachEvent('on' + type, handler);
			} else if(element != window){
				element['on' + type] = null;
			}
		};
		// http://www.cristinawithout.com/content/function-trigger-events-javascript
		/*没用*/
		var fireEvent = function(element, type, bubbles, cancelable) {
			if(document.createEvent) {
				var event = document.createEvent('Event');
				event.initEvent(type, bubbles !== undefined ? bubbles : true, cancelable !== undefined ? cancelable : false);
				element.dispatchEvent(event);
			} else if(document.createEventObject) { //IE
				var event = document.createEventObject();
				element.fireEvent('on' + type, event);
			} else if(typeof(element['on' + type]) == 'function'){
				element['on' + type]();
			}
		};
		// prevent default
		var cancelEvent = function(e) {
			if(e.preventDefault){
				e.preventDefault();
			}
			else{
				e.returnValue = false;
			}
			if(e.stopPropagation){
				e.stopPropagation();
			}
			else{
				e.cancelBubble = true;
			}
			return false;
		};
		var r = this;
		r.params = params;
		r.originalParams = originParams;
		r.drawTool = function(toolbarTop) {/*添加工具栏中的选项*/
			var buttons = r.params.buttons;
			for(var btn in buttons) {
				var btnA = document.createElement("a");
				btnA.className = "re-toolbar-icon";
				btnA.setAttribute("title", buttons[btn]["title"]);
				btnA.setAttribute("data-edit", btn);
				btnA.innerHTML = buttons[btn]["icon"];
				toolbarTop.appendChild(btnA);
			};
		};
		/*表情*/
		r.drawEmotion = function() {
			var list_smilies = ['smile', 'smiley', 'yum', 'relieved', 'blush', 'anguished', 'worried', 'sweat',
				'unamused', 'sweat_smile', 'sunglasses', 'wink', 'relaxed', 'scream', 'pensive',
				'persevere', 'mask', 'no_mouth', 'kissing_closed_eyes', 'kissing_heart', 'hushed',
				'heart_eyes', 'grin', 'frowning', 'flushed', 'fearful', 'dizzy_face', 'disappointed_relieved',
				'cry', 'confounded', 'cold_sweat', 'angry', 'anguished', 'broken_heart', 'beetle', 'good', 'no', 'beer',
				'beers', 'birthday', 'bow', 'bomb', 'coffee', 'cocktail', 'gun', 'metal', 'moon'
			];
			var html = '';
			
			for(var i=0,len=list_smilies.length;i<len;i++){
				html += '<img src="images/emotion/' + list_smilies[i] + '.png" class="emotion" width="20" height="20" alt="" />';
			}			
			/*list_smilies.forEach(function(v) {
				html += '<img src="images/emotion/' + v + '.png" class="emotion" width="20" height="20" alt="" />';
			});*/
			r.openModal.call(this, html);

			function add() {  /*必须有服务器才能显示*/
				console.log('this.src',this.src);
				var img = '<img src="' + this.src + '" class="emotion" width="20" height="20" alt="" />';
				document.execCommand('insertHTML', true, img);
				r.closeModal();
			};
			var emotion = document.querySelectorAll('.emotion');
			for(var i=0,len=emotion.length;i<len;i++){
				addEvent(emotion[i], 'click', add, false);			
			}
			/*emotion.forEach(function(e) {
				addEvent(e, 'click', add, false);
			});*/
		};
		/*全屏*/
		r.toggleFullScreen = function() {
			if(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
				var docElm = document.documentElement;
				if(docElm.requestFullscreen) {
					docElm.requestFullscreen();
				} else if(docElm.mozRequestFullScreen) {
					docElm.mozRequestFullScreen();
				} else if(docElm.webkitRequestFullScreen) {
					docElm.webkitRequestFullScreen();
				} else if(elem.msRequestFullscreen) {
					elem.msRequestFullscreen();
				};
			} else {/*已经开启全屏*/
				if(document.exitFullscreen) {
					document.exitFullscreen();
				} else if(document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if(document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				} else if(document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			};
		};
		r.execCommand = function(command, param) {
			r.selections.restoreSelection();
			et.focus();
			if(!arguments[1]) {
				param = null;
			};
			document.execCommand(command, false, param);
		};
		r.selections = {
			getCurrentRange: function() {/*获取选中的范围*/
				//获取当前range
				if(window.getSelection) {
					//使用 window.getSelection() 方法获取鼠标划取部分的起始位置和结束位置
					var sel = window.getSelection();
					if(sel.rangeCount > 0){
						//通过selection对象的getRangeAt方法来获取selection对象的某个Range对象
						return sel.getRangeAt(0);
					}
					
				} else if(document.selection) {/*如果没有window.getSelection*/
					var sel = document.selection;
					return sel.createRange();
				}
				return null;
			},
			saveSelection: function() {
				selectedRange = r.selections.getCurrentRange();
			},
			restoreSelection: function() { //当你点击了工具条时，当前焦点也就改变了，所以我们需要恢复前一个焦点位置
				var selection = window.getSelection(); /*获得selection对象*/
				if(selectedRange) {
					try {
						selection.removeAllRanges();  /*移除选区*/
					} catch(ex) {
						document.body.createTextRange().select();
						document.selection.empty();
					};
					selection.addRange(selectedRange);   /*将指定的DOM范围添加到选区*/
				}
			},
			getSelectionHTML: function() {
				if(window.getSelection) {
					var sel = window.getSelection();
					if(sel.rangeCount > 0) {
						return sel;
					}
				}
			}
		};
		/*没用*/
		var getSelectionRect = function() {
			if(window.getSelection) {
				var sel = window.getSelection();
				if(!sel.rangeCount) {
					return false;
				}
				var range = sel.getRangeAt(0).cloneRange();
			}
		};
		/*上传文件*/
		r.fileInput = function() {
			var fi = document.querySelector('.editor-file-input');

			function change(e) {
				var files = e.target.files;
				var file = null;
				var url = null;
				
				/*var reader=new FileReader();
				if(files && files.length > 0){
					reader.readAsDataURL(files[0]);
					console.log('reader.result',reader.result);
					var img = '<img src="' + reader.result + '"/>';
					document.execCommand('insertHTML', false, img);
				}*/
				if(files && files.length > 0) {
					file = files[0];
					try {
						var fileReader = new FileReader();
						fileReader.onload = function(e) {
							url = e.target.result;
							console.log('url',url);
							var img = '<img src="' + url + '"/>';
							document.execCommand('insertHTML', false, img);
							/*document.execCommand('insertimage', false, url);*/
						}
						fileReader.readAsDataURL(file);
					} catch(e) {

					}
				}
				r.closeModal();
			};
			fi.onchange = change;
		};
		r.toolClick = function() {
			var toolbtn = document.querySelectorAll('a[data-edit]');   /*匹配CSS选择符，含All找所有*/
			for(var i = 0; i < toolbtn.length; i++) {
				addEvent(toolbtn[i], "click", function(e) {
					var btn = r.params.buttons;
					var name = this.getAttribute("data-edit");
					if(typeof btn[name]["click"] !== 'undefined') { /*每个工具栏选项都含有一个click属性*/
						r.selections.restoreSelection();  /*重置为上个range*/
						btn[name].click.call(this);  /*使用call方法扩充函数，调用btn[name].click函数*/
						r.selections.saveSelection();
					} else {

					}
					e.stopPropagation();
				}, false);  /*冒泡阶段被调用*/
			}

		};
		r.getStyle = function(dom, attr) {/*getComputedStyle()方法，返回一个对象，其中包含当前元素的所有计算的样式；
											IE不支持getComputedStyle()方法，在IE中每个具有style属性的元素还有一个currentStyle属性，
											它包含当前元素全部计算后的样式*/
			var value = dom.currentStyle ? dom.currentStyle[attr] : getComputedStyle(dom, false)[attr];
			return parseFloat(value);
		};
		r.openModal = function(html, fn) {  /*打开模态框*/
			r.modal = document.createElement('div');
			r.modal.className = 'editor-modal';
			r.modal.innerHTML = html;  /*每个模态框内容不同*/
			r.parent.appendChild(r.modal);
			var left = this.offsetLeft + (r.getStyle(this, 'width') - r.getStyle(r.modal, 'width')) / 2;    /*按钮的宽度,模态框的宽度*/
			left < 0 ? left = 3 : '';
			r.modal.style.left = left + 'px';
			if(fn) {
				fn();
			}
		};
		r.closeModal = function() {  /*关闭模态框*/
			if(r.modal != null) {
				r.parent.removeChild(r.modal);
				r.modal = null;
			}
		};
		r.isInModal = function(e) {
			if(r.modal != null) {
				var node = e.target;   /*点的谁就是谁*/
				var isIn = false;
				var modal = document.querySelector('.editor-modal');
				while(typeof node !== 'undefined' && node.nodeName != '#document') {
					if(node === modal) {  /*判断点击的是不是模态框*/
						isIn = true;
						break;
					}
					node = node.parentNode;
				};
				if(!isIn) {  /*点的模态框之外的范围,则关闭*/
					r.closeModal();
				}
			}
		};
		r.init = function() {
			r.parent = document.getElementById(container.replace("#", "")); /*替换掉#号*/
			var defaultValue = r.parent.innerHTML;
			r.parent.innerHTML = '';
			r.parent.className += " re-container"; /*前面有空格*/
			r.parent.style.boxSizing = "border-box";
			r.parent.style.border = "1px solid " + r.params.borderColor;
			r.parent.style.width = r.params.width + "px";
			r.parent.style.height = r.params.height + "px";
			et = document.createElement("div");
			et.className = "re-editor";   /*位于工具栏下的文本编辑框*/
			et.setAttribute("tabindex", 1);
			et.setAttribute("contenteditable", true);/*contenteditable 属性的出现，让我们可以将任何元素设置成可编辑状态。*/
			et.setAttribute('spellcheck', false);
			et.innerHTML = defaultValue;   /*将默认HTML写进该编辑框*/
			toolbarTop = document.createElement("div");
			toolbarTop.className = "re-toolbar re-toolbar-top";  /*工具栏*/
			toolbarTop.style.backgroundColor = r.params.toolBg;
			r.parent.appendChild(toolbarTop);
			r.parent.appendChild(et);
			r.drawTool(toolbarTop);
			r.toolClick();
			addEvent(window, 'click', r.isInModal, false);
			addEvent(et, "keyup", function(e) {/*键盘鼠标up获取选区*/
				r.selections.saveSelection();
			}, false);
			addEvent(et, "mouseup", function(e) {
				r.selections.saveSelection();
			}, false);
			var addActiveClass = function() {
				this.parentNode.classList.add('active');
			};
			var removeActiveClass = function() {
				this.parentNode.classList.remove('active');
			};
			addEvent(et, "focus", addActiveClass);
			addEvent(et, "blur", removeActiveClass);

			var topHeight = document.querySelector(".re-toolbar-top").offsetHeight;  /*offsetHeight元素的高度*/
			et.style.height = (r.params.height - topHeight) + "px";
		};
		/*颜色选择*/
		r.colorPicker = function(command) {
			var HSVtoRGB = function(h, s, v) {
				var r, g, b, i, f, p, q, t;
				i = Math.floor(h * 6);
				f = h * 6 - i;
				p = v * (1 - s);
				q = v * (1 - f * s);
				t = v * (1 - (1 - f) * s);
				switch(i % 6) {
					case 0:
						r = v, g = t, b = p;
						break;
					case 1:
						r = q, g = v, b = p;
						break;
					case 2:
						r = p, g = v, b = t;
						break;
					case 3:
						r = p, g = q, b = v;
						break;
					case 4:
						r = t, g = p, b = v;
						break;
					case 5:
						r = v, g = p, b = q;
						break;
				}
				var hr = Math.floor(r * 255).toString(16);  /*转换为16进制*/
				var hg = Math.floor(g * 255).toString(16);
				var hb = Math.floor(b * 255).toString(16);
				return '#' + (hr.length < 2 ? '0' : '') + hr +   /*转换为字符串*/
					(hg.length < 2 ? '0' : '') + hg +
					(hb.length < 2 ? '0' : '') + hb;
			};

			this.addColorBoard = function() {
				var table = document.createElement('table');
				table.setAttribute('cellpadding', 0);
				table.setAttribute('cellspacing', 0);
				table.setAttribute('unselectable', 'on');
				table.style.border = '1px solid #d9d9d9';
				table.setAttribute('id', 'color-board');
				for(var row = 1; row < 15; ++row) // should be '16' - but last line looks so dark
				{
					var rows = document.createElement('tr');  /*行*/
					for(var col = 0; col < 25; ++col) // last column is grayscale
					{
						var color;
						if(col == 24) {/*使最后一列变灰，且随着行数的增加颜色越来越深*/
							var gray = Math.floor(255 / 13 * (14 - row)).toString(16);   /*(255/13)*13从255变到0*/
							var hexg = (gray.length < 2 ? '0' : '') + gray;  /*gray的值在不断往上叠加*/
							color = '#' + hexg + hexg + hexg;
						} else {
							var hue = col / 24;
							var saturation = row <= 8 ? row / 8 : 1;
							var value = row > 8 ? (16 - row) / 8 : 1;
							color = HSVtoRGB(hue, saturation, value);
						}
						var td = document.createElement('td');   /*列*/
						td.setAttribute('title', color);
						td.style.cursor = 'url(di.ico),crosshair';
						td.setAttribute('unselectable', 'on');
						td.style.backgroundColor = color;
						td.width = 12;
						td.height = 12;
						rows.appendChild(td);
					}
					table.appendChild(rows);
				};
				var box = document.createElement('div');
				box.appendChild(table);
				return box.innerHTML;
			};
			this.clickEvent = function() {
				var tds = document.getElementById('color-board');
				tds = tds.childNodes[0].getElementsByTagName('td');  /*每个节点都有一个childNodes属性,其中保存着NodeList对象*/
				for(var i = 0; i < tds.length; i++) {/*childNodes[0]是tbody,找到里面所有的td，且tbody是创建table后自动添加的*/
					addEvent(tds[i], 'click', function() {
						var color = this.getAttribute('title');
						r.execCommand(command, color);
						r.closeModal();
					}, false);
				}
			}
		};

		r.init();
		return r;
	};
	RichEditor.prototype = {
		getHTML: function() {
			var et = document.querySelector('.re-editor');
			return et.innerHTML;
		},
		getText: function() {
			var et = document.querySelector('.re-editor');
			return et.textContent;
		}
	};
	return RichEditor;
});