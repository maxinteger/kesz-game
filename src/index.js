import _ from 'lodash';
import SVG from 'svg.js';
import $ from 'jquery';

const
	TURN_PER_CARD = 16,
	PASTELS = {
		'darkBlue': '#779ECB',
		'darkGreen': '#03C03C',
		'darkPurple': '#966FD6',
		'darkRed': '#C23B22',
		'lightPurple': '#B19CD9',
		'blue': '#AEC6CF',
		'brown': '#836953',
		'gray': '#CFCFC4',
		'green': '#77DD77',
		'magenta': '#F49AC2',
		'orange': '#FFB347',
		'pink': '#DEA5A4',
		'purple': '#B39EB5',
		'red': '#FF6961',
		'violet': '#CB99C9',
		'yellow': '#FDFD96'
	},
	COLORS = {
		red: '#C23B22',
		green: '#03C03C',
		blue: '#779ECB'
	},
	OPTIONS = [
		['rect', 'oval', 'wave'],		//shape
		['red', 'green', 'blue'],		//color
		['full', 'mix', 'none'],		//fill
		[1, 2, 3]						//count
	];


let tap = x => { console.log(x); return x; };


function permutation(a){
	if (a.length === 0 ) return [[]];
	let [xs, ...xxs] = a;
	return _(xs).map(x => _(permutation(xxs)).map( y => [x].concat(y)).run() ).flatten().run();
}

let mixFillPattern = function(color) {
	return function (add) {
		add.rect(20,20).fill('#fff');
		add.ellipse(10, 10).fill(color);
		add.ellipse(5, 5).fill(color).move(10,10);
	}
};

let Card = Object.assign(Object.create(null), {
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


let Player = Object.assign(Object.create(null), {
	initPlayer(root, color){
		Object.assign(this, {
			root, color,
			points: 0
		});
		return this;
	},

	activate(){
		this.root.css({color: this.color});
	}
});

let Manager = Object.assign(Object.create(null), {
	init(root){
		this.rootEl = root;
		this.deck = this.createDeck();
		this.addCards();
		this.selectedCards = [];
		this.activePlayer = Object.create(Player).initPlayer(root, PASTELS.orange).activate();
	},

	selectedPlayer(){

	},

	toggleCard(card){
		let state = card.toggle();
		if (state){
			this.selectedCards.push(card);
		} else {
			_.remove(this.selectedCards, card);
		}
		if (this.selectedCards.length === 3){
			if (this.validateSET(...this.selectedCards)){
				_.map(this.selectedCards, x => x.deactivate() );
				this.addCards(3);
				this.selectedPlayer.points += 1;
				console.log('Jee');
			} else {
				_.map(this.selectedCards, x => x.toggle(false) );
				console.log('Nop');
			}
			this.selectedCards = [];

		}
	},

	createDeck(){
		return _(permutation(OPTIONS))
			.map( opt => Object.create(Card).initCard(this.rootEl, ...opt) )
			.each( card => card.draw())
			.run();
	},

	addCards(num){
		_(this.deck)
			.filter(c => !c.active && !c.used)
			.sample(num || TURN_PER_CARD)
			.map( c => c.activate() )
			.run();
		$('#possible-solutions').text('Possible solutions: ' + this.getSolutions().length);
	},

	getSolutions(){
		let actives = _.filter(this.deck, 'active');

		return _(permutation([actives, actives, actives]))
			.filter( x => this.validateSET(...x) )
			.reduce( (acc, grp) => {
				if (!_.any(acc, x => _.all(x, _.include.bind(null, grp)))){
					acc.push(grp);
				}
				return acc;
			},[]);
	},

	validateSET(a, b, c){
		return a !== b && a !== c && b !== c && _(['shape', 'color', 'fill', 'count'])
				.all(x => (a[x] === b[x] && a[x] === c[x] && b[x] === c[x]) || (a[x] !== b[x] && a[x] !== c[x] && b[x] !== c[x]));
	}
});

$(function () {

	Manager.init($('#deck'));


	$(document)
		.on('click', '.card', function (event) {
			Manager.toggleCard($(this).data('card'));
		})
		.on('click', '#add-more', function () {
			Manager.addCards(4);
		});
});

