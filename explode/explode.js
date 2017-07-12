(function() {
	var Explode = function(container, params) {
		'use strict';
		var n = this;
		if(!(this instanceof Explode)) return new Explode(container, params);
		var defaults = {
			img: 'chi2.png',
			type: 1
		};
		params = params || {};    /*有参数传递进来赋给params,没有为空*/
		var originalParams = {};  /*备份传进来的params*/
		for(var param in params) {  /*遍历params*/
			if(typeof params[param] === 'object') {  /*如果是对象,继续遍历该对象,再赋值*/
				originalParams[param] = {};
				for(var deepParam in params[param]) {
					originalParams[param][deepParam] = params[param][deepParam];
				}
			} else {  /*不是对象,直接赋值*/
				originalParams[param] = params[param];
			}
		};
		for(var def in defaults) {   /*遍历默认的参数，如果传入的参数没有定义到，则把默认值加进来，若已定义，则默认值没用*/
			if(typeof params[def] === 'undefined') {  /*比如:如果params[img]没有定义,则使用默认值*/
				params[def] = defaults[def];
			} else if(typeof params[def] === 'object') {
				for(var deepDef in defaults[def]) {
					if(typeof params[def][deepDef] === 'undefined') {
						params[def][deepDef] = defaults[def][deepDef];
					}
				}
			}
		};
		n.params = params;
		n.originalParams = originalParams;  
		n.container = typeof container === 'string' ? document.querySelectorAll(container) : container;
		if(!n.container || (n.container.length && n.container.length == 0)) return; /*没有container直接return*/
		if(n.container.length && n.container.length > 1) { /*有container且个数大于1*/
			var s = [];
			for(var i = 0; i < n.container.length; i++) {
				s.push(new Explode(n.container[i], params));
			};
			return s;
		};
		n.container = n.container[0] || n.container;   /*有且仅有一个container*/

		var width = n.params.width;
		var height = n.params.height;
		var wWidth = document.body.clientWidth;
		var wHeight = document.body.clientHeight;

		n.container.width = width;
		n.container.height = height;
		var ctx = n.container.getContext('2d');
		var c = document.createElement('canvas');
		var ct = c.getContext('2d');   /*用于绘制图片或文字*/
		var items = [];
		var picture = null;
		var requestId = null;
		var total = 0;
		var getRandom = function(max, min) {
			min = arguments[1] || 0;
			return Math.floor(Math.random() * (max - min + 1) + min); /*取min和max之间的随机数*/
		};

		function cutSlice() {/*cutSlice()方法，实现粒子动画，让其往最终位置运动*/
			ctx.clearRect(0, 0, n.container.width, n.container.height);
			for(var i = 0; i < c.width * c.height; i++) {
				var item = items[i];
				var targetX = item.targetX;
				var targetY = item.targetY;
				var currentX = item.currentX;
				var currentY = item.currentY;
				var ax = false;
				var ay = false;
				if(!item.isLock) {
					if(Math.abs(targetX - currentX) <= .5) {
						item.currentX = targetX;
						ax = true;
					} else {
						item.currentX += (targetX - currentX) * item.ax;
					};
					if(Math.abs(targetY - currentY) <= .5) {
						item.currentY = targetY;
						ay = true;
					} else {
						item.currentY += (targetY - currentY) * item.ay;
					};
					if(ax && ay) {/*只有ax和ay同时到达终点时，total才会减1*/
						total--;
						item.isLock = true;
					}
				};
				var ix = item.currentX;
				var iy = item.currentY;
				ctx.putImageData(item.data, ix, iy); /*putImageData() 方法将图像数据（从指定的 ImageData 对象）放回画布上。*/
			};
			if(total > 0) {
				requestId = requestAnimationFrame(cutSlice); /*不用设置间隔,反复调用*/
			} else {
				cancelAnimationFrame(requestId);

			};
		}

		function Item(data, targetX, targetY, currentX, currentY) {/*创建一个Item构造函数，用来放置每一个粒子*/
			this.data = data;
			this.targetX = targetX; /*聚合的最终位置*/
			this.targetY = targetY;
			this.currentX = currentX;/*当前位置*/
			this.currentY = currentY;
			this.ax = .13 - Math.random() * .06;  /*ax和ay分别表示运动速度*/
			this.ay = .16 - Math.random() * .08;
		}

		function drawCanvas() {
			if(n.params.type == 2) {  /*针对图片*/
				picture = new Image();
				picture.crossOrigin = "";
				picture.onload = function() {
					var pw = picture.width;
					var ph = picture.height;
					c.width = pw;   /*设置canvas的宽度*/
					c.height = ph;
					ct.drawImage(picture, 0, 0, pw, ph, 0, 0, pw, ph);  /*把图像中的某个区域绘制到上下文中，源图像（起点和宽高），上下文中的起点和宽高*/
					draw(pw, ph);
				};
				picture.src = n.params.img;
			} else {  /*针对文字*/
				var word = n.params.text;
				ct.font = '60px Arial';   /*这里指定用于测文本宽度*/
				var w = ct.measureText(word).width;   /*测文本宽度*/
				var h = 100;
				c.width = w;
				c.height = h;
				ct.fillStyle = 'deepskyblue';
				ct.font = '60px Arial';   /*这里指定用于绘制文本，应与之前设置保持一致*/
//				ct.textAlign = 'center';
				ct.textBaseline = 'middle';
				ct.fillText(word, 0, 50);  /*绘制文本,这里为什么没有直接绘制上去？而要调用draw？？？*/
				draw(w, h);
			}

			function draw(pw, ph) {/*draw 方法用来分解粒子，先分成cols 列和rows 行，每一个粒子高度都为1，然后用
getImageData() 来获取ImageData对象，然后创建新的Item实例，然后添加到items数组中。*/
				var w = 1;
				var h = 1;
				var cols = Math.floor(pw / w);/*图片或文字的宽度高度*/
				var rows = Math.floor(ph / h);
				for(var i = 0; i < c.width * c.height; i++) {
					var x = Math.floor(i % cols); /*通过xy找到每一行的所有元素(0,0)(1,0)...(0,1)(1,1)(2,1)*/
					var y = Math.floor(i / cols);
					var data = ct.getImageData(x * w, y * h, w, h);/* 文字也能获取？？拷贝！取得原始图像数据,要取得取数据的画面区域的xy坐标以及该区域的像素宽度和高度，这里每次取1*1像素*/
					var vx = getRandom(300, -300);
					var vy = getRandom(500, -500); /*扩大范围，使图片周围也有粒子*/
					var item = new Item(data, x, y, x + vx, y + vy);
					items.push(item);
				};
				total = items.length;
				cutSlice();
			}
		}
		n.pageInit = function() {
			drawCanvas();
		};

		n.pageInit();
		return n;
	};
	window.Explode = Explode;
})();