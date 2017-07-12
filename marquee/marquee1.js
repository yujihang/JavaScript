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
			a.translateY -= s;
			b.translateY -= s;
			if(a.translateY <= -w) {
				a.translateY = w;
			};
			if(b.translateY <= -w) {
				b.translateY = w;
			};
			setTransform(a, 'translate(0,' + a.translateY + 'px)');
			setTransform(b, 'translate(0,' + b.translateY + 'px)');
		}, 80);
	};
	var marquee = document.querySelectorAll('.marquee-box1');//querySelectorAll返回所以匹配元素
	for(var i = 0; i < marquee.length; i++) {
		var m = marquee[i];
		var inner = m.querySelector('.marquee-inner1');
		var height = inner.offsetHeight;  //offsetWidth偏移量
		var bheight = m.offsetHeight;//外层不动，内层div在移动
		if(bheight < height * 2) {  //体现出循环，避免后面剩余太多空白
			var clone = inner.cloneNode(true);  //cloneNode，创建节点的拷贝，并返回该副本，如果您需要克隆所有后代，请把 deep 参数设置 true
			m.appendChild(clone); //追加显示
			var ax = 3;
			setTransform(clone, 'translate(0,' + height + 'px)');//平移到被克隆对象之后
			inner.translateY = 0;
			clone.translateY = height;
			anim(m, inner, clone, ax, height);
			m.addEventListener('mouseover', function() {
				clearInterval(this.timer);
			});
			m.addEventListener('mouseout', function() {
				anim(m, inner, clone, ax, height);
			});
		}
	}
}();