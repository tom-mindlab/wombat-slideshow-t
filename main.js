import './slideshow.less'
import { screen, utils, controls } from 'wombat'
import template from './slideshow.html'

var CONFIG,
	ONCOMPLETE,
	STIMULI,
	IMAGES,
	_mainScreen,
	_display
export default function (config, cb) {

	CONFIG = config
	ONCOMPLETE = cb

	async.series([

		prepareConfig,
		prepareUI,
		fadeToBlack

	], function () {
		next()
	})

}

var priorBackground;

function fadeToBlack(cb) {

	bindInputs(CONFIG.advance_behavior.inputs);
	priorBackground = _mainScreen.css('background-color')

	_mainScreen.animate({
		backgroundColor: '#000'
	}, 2000, function () {
		_display.domElement.fadeIn('fast', cb)
	})
}


function fadeFromBlack(cb) {

	Mousetrap.reset();
	_mainScreen.animate({
		backgroundColor: priorBackground
	}, 2000, screen.exit('fade', cb))
}



function next() {

	// Finishing condition
	if (_.isEmpty(STIMULI)) return fadeFromBlack(ONCOMPLETE)

	var nextStimuli = STIMULI.shift()

	var nextImage = IMAGES[nextStimuli.name].img

	_display.set(nextImage)
	_display.show()

	utils.delay(nextStimuli.duration, function () {
		_display.hide()
		utils.delay(1000, next)
	})
}

function bindInputs(inputs) {
	Mousetrap.reset();
	for (const key of inputs.keys) {
		Mousetrap.bind(key, next);
		console.log(key);
	}
}

function prepareConfig(cb) {


	console.log(CONFIG)

	var stimuli = _.map(CONFIG.stimuli, function (s) {
		if (!s.duration) s.duration = CONFIG.duration || 3000
		return s
	})

	if (!stimuli.length == CONFIG.stimuli.length) throw alert('Dupli2te stimuli names')

	stimuli = utils.repeat(stimuli, CONFIG.repeats || 1)

	if (CONFIG.randomise == true) stimuli = utils.shuffle(stimuli)

	STIMULI = stimuli // outer scope reference
	utils.preloadImages(CONFIG.stimuli, function (images) {
		console.log(images)
		IMAGES = images
		cb()
	})

}



function prepareUI(cb) {

	_mainScreen = $(template).clone()

	_display = controls.display(_mainScreen.find('.display'))
	_display.hide()

	screen.enter(_mainScreen, 'fade', cb)

}
