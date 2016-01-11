import _ from 'lodash';
import Bacon from 'baconjs';

import Card from './card';
import Player from './player';
import {permutation} from './utils';


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
	OPTIONS = [
		['rect', 'oval', 'wave'],		//shape
		['red', 'green', 'blue'],		//color
		['full', 'mix', 'none'],		//fill
		[1, 2, 3]						//count
	];


export default Object.assign(Object.create(null), {
	init(root){
		this.rootEl = root;
		this.changeBus = new Bacon.Bus();
		this.deck = this.createDeck();
		this.selectedCards = [];
		this.activePlayer = Object.create(Player).initPlayer(root, PASTELS.orange).activate();
		this.addCards();
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
		this.changeBus.push({message: 'addCard'});
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
