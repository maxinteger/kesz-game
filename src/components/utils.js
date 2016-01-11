import _ from 'lodash';


export let tap = x => { console.log(x); return x; };


export function permutation(a){
	if (a.length === 0 ) return [[]];
	let [xs, ...xxs] = a;
	return _(xs).map(x => _(permutation(xxs)).map( y => [x].concat(y)).run() ).flatten().run();
}
