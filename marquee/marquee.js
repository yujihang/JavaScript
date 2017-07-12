; + function() {
	var setTransform = function(element, animation) {
		element.style.webkitTransform = animation;
		element.style.mozTransform = animation;
		element.style.oTransform = animation;
		element.style.msTransform = animation;
		element.style.transform = animation;
	};

	function anim(m, a, b, s, w) {
		m.timer = setInterval(function() {
			a.translateX -= s;
			b.translateX -= s;
			if(a.translateX <= -w) {
				a.translateX = w;
			};
			if(b.translateX <= -w) {
				b.translateX = w;
			};
			setTransform(a, 'translate(' + a.translateX + 'px,0)');
			setTransform(b, 'translate(' + b.translateX + 'px,0)');
		}, 80);
	};
	var marquee = document.querySelectorAll('.marquee-box');//querySelectorAll返回所以匹配元素
	for(var i = 0; i < marquee.length; i++) {
		//console.log('marquee.length',marquee.length);
		var m = marquee[i];
		var inner = m.querySelector('.marquee-inner');
		var width = inner.offsetWidth;  //offsetWidth偏移量
		var bWidth = m.offsetWidth;//外层不动，内层div在移动
		//console.log('width','bWidth',width,bWidth);
		if(bWidth < width * 2) {  //体现出循环，避免后面剩余太多空白
			var clone = inner.cloneNode(true);  //cloneNode，创建节点的拷贝，并返回该副本，如果您需要克隆所有后代，请把 deep 参数设置 true
			m.appendChild(clone); //追加显示
			var ax = 3;
			setTransform(clone, 'translate(' + width + 'px,0)');//平移到被克隆对象之后
			inner.translateX = 0;
			clone.translateX = width;
			anim(m, inner, clone, ax, width);
			m.addEventListener('mouseover', function() {
				clearInterval(this.timer);
			});
			m.addEventListener('mouseout', function() {
				anim(m, inner, clone, ax, width);
			});
		}
	}
}();