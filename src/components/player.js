
export default Object.assign(Object.create(null), {
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
