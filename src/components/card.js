import $ from 'jquery';
import SVG from 'svg.js';

const COLORS = {
	red: '#C23B22',
	green: '#03C03C',
	blue: '#779ECB'
};


let mixFillPattern = function(color) {
	return function (add) {
		add.rect(20,20).fill('#fff');
		add.ellipse(10, 10).fill(color);
		add.ellipse(5, 5).fill(color).move(10,10);
	}
};


export default Object.assign(Object.create(null), {
	initCard(root, shape, color, fill, count){
		Object.assign(this, {
			root, shape, color, fill, count,
			active: false,
			used: false,
			selected: false,
			el: $('<div>')
		});

		this.el.data('card', this);

		return this;
	},

	activate(){
		this.active = true;
		this.root.append(this.el);
	},

	deactivate(){
		this.toggle(false);
		this.active = false;
		this.used = true;
		this.el.remove();
	},

	toggle(value){
		value = value === void 0 ? !this.selected : value;
		this.selected = value;
		this.el.toggleClass('selected', value);
		return value;
	},

	draw(){
		this.el.addClass('card', this.shape, this.fill, this.color, 'count-' + this.count);
		let width = 100,
			height = 30,
			color = COLORS[this.color],
			draw = SVG(this.el.get(0));

		draw.viewbox(0, 0, 120, 175);

		for (let i = 1; i <= this.count; i++){
			let shape;
			switch(this.shape){
				case 'rect': shape = draw.rect(width, height).radius(5, 5); break;
				case 'oval': shape = draw.ellipse(width, height); break;
				case 'wave': shape = draw.path('m 90.511719,1022.2832 c -8.670526,0.09 -8.53283,7.3444 -14.296875,10.1992 ' +
					'-6.312687,3.0339 -13.264888,0.6164 -22.015625,-5.2969 -13.387354,-9.0464 -31.585043,-2.8854 ' +
					'-40.898438,1.5684 -7.0337012,3.2452 -15.4181678,15.3501 -8.7130111,21.7662 9.5547971,5.6873 ' +
					'13.0187121,-5.1611 19.1837141,-8.2349 6.311606,-3.0184 13.11405,-0.3448 22.029297,5.3281 ' +
					'13.749262,8.7489 31.599798,2.8641 40.91211,-1.6113 13.465679,-8.6027 15.931639,-22.9908 ' +
					'3.798828,-23.7188 z');
					break;
			}

			let fill;
			switch(this.fill){
				case 'full': fill = color; break;
				case 'mix': fill = draw.pattern(15, 15, mixFillPattern(color)); break;
				case 'none': fill = '#fff'; break;
			}

			shape
				.fill(fill)
				.attr({
					stroke: color,
					'stroke-width': 3
				})
				.center(width / 2, height / 2)
				.move(10, (200 / (this.count+1)) * i - height );

		}
	}
});
