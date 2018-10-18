

export default class Animator {
	constructor(state) {
		this.state = {
			onStart: null,
			onUpdate: null,
			onStop: null,
			ease: (x) => x,
			transitionDuration: 1000,
			period: 20,
			...state
		};

		this.intervalTimer = null;
		this.startTime = null;
	}

	_doEasing(){
		const {from, to, ease, transitionDuration} = this.state;
		const percent = (Date.now() - this.startTime) / transitionDuration;
		percent = Math.min(Math.max(percent, 0), 1)
		percent = ease(percent);
		return from * (1 - percent) + to * percent;
	}

	_startAnimate() {
		this.startTime = Date.now().getTime();
    	this.intervalTimer = window.setInterval(this._updateAnimate, this.state.period);
    	if(this.state.onStart)
			this.state.onStart();
	}

	_updateAnimate(){
		const current_value = this._doEasing();
		if(this.state.onUpdate)
			this.state.onUpdate(current_value);
		
		if(((Date.now().getTime() - this.startTime) > this.state.transitionDuration) || current_value >= 1){
			this._stopAnimate();
		}
	}

	_stopAnimate() {
		this.startTime = null;
		window.clearTimeout(this.intervalTimer);
		if(this.state.onStop)
			this.state.onStop();

		this.state = {
			...this.state,
			from: this.state.to,
			to: this.state.from
		}
	}



	animate(state){
		const this.state = {
			...this.state,
			state
		}

		this._startAnimate();
	}
}

function animator(state){
	return new Animator(state);
}