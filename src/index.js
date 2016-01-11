import _ from 'lodash';
import $ from 'jquery';
import Bacon from 'baconjs';

import Manager from './components/manager';

$.fn.asEventStream = Bacon.$.asEventStream;



$(function () {

	Manager.init($('#deck'));
	let $doc = $(document);

	$doc
		.asEventStream('click', '.card')
		.map('.currentTarget')
		.onValue( (target) => Manager.toggleCard($(target).data('card')) );

	$doc
		.asEventStream('click', '#add-more')
		.onValue( () => Manager.addCards(4) );

	$(window)
		.asEventStream('keydown')
		.map('.keyCode')
		.onValue( e => console.log(e));

	Manager
		.changeBus
		.startWith(0)
		.map( () => 'Possible solutions: ' + Manager.getSolutions().length)
		.assign($('#possible-solutions'), 'text');

});

