import { screen, utils } from "wombat";
import languages from "./lang.json";
import "./slideshow-t.less";
import template from "./slideshow-t.html";

import Mousetrap from "mousetrap";

import { pathsToImages, ImageDisplayer } from "./ImageDisplayer";

async function resolveStimuli(stimuli) {
	const images = await pathsToImages(stimuli.map(stim => stim.path));
	const resolved_stimuli = [];
	for (const [index, stim] of stimuli.entries()) {
		resolved_stimuli.push(Object.assign({}, stim, { image: images[index] }));
	}
	return resolved_stimuli;
}

function generateControlsMessage(inputs) {
	let message = inputs.message.start;
	for (const [index, key] of inputs.keys.entries()) {
		message += `<kbd>${key}</kbd>`;
		message += (index === (inputs.keys.concat(inputs.mouse)).length - 1) ? ` ` : inputs.message.delim;
	}
	for (const [index, button] of inputs.mouse.entries()) {
		message += `<kbd>${button} mouse button</kbd>`;
		message += (index + inputs.keys.length === (inputs.keys.concat(inputs.mouse)).length - 1) ? ` ` : inputs.message.delim;
	}
	message += inputs.message.end;

	return message;
}

function asycSetTimeout(ms_delay) {
	return new Promise(res => setTimeout(res, ms_delay));
}

async function fadeBackgroundToColour(DOM, { colour = `#121212`, duration = 250 }) {
	DOM.setAttribute(`style`, `background-color: ${colour}; transition: background-color ${duration}ms linear`);
	await asycSetTimeout(duration);
}

function showScreen(screen_obj, screen_element) {
	screen_element.querySelector(`#title`).textContent = screen_obj.title;
	screen_element.querySelector(`#message`).textContent = screen_obj.message;
	const continue_button = screen_element.querySelector(`#continue`);
	continue_button.disabled = true;
	continue_button.value = screen_obj.continue.pending;

	screen_element.addEventListener(`continue_ready`, () => {
		continue_button.value = screen_obj.continue.ready;
		continue_button.disabled = false;
	});

}

export default async function (config, callback) {
	Mousetrap.reset();
	const lang = Object.assign({}, utils.buildLanguage(languages, config), config.language_options);
	const DOM = document.createElement(`div`);
	DOM.innerHTML = template;

	screen.enter(DOM, `fade`);

	const screen_element = DOM.querySelector('#screen');

	showScreen(config.screens.intro, screen_element);
	const image_displayer = new ImageDisplayer(await resolveStimuli(config.stimuli));
	screen_element.dispatchEvent((() => {
		return new CustomEvent(`continue_ready`);
	})());
	await new Promise(res => {
		screen_element.querySelector('#continue').onclick = () => {
			screen_element.style.display = `none`;
			res();
		};
	})

	await fadeBackgroundToColour(DOM.querySelector(`.slideshow-t`), config.background);
	DOM.querySelector(`#instruction-message`).style.visibility = `visible`;
	DOM.querySelector(`#display`).textContent = ``;
	DOM.querySelector(`#instruction-message`).innerHTML = generateControlsMessage(Object.assign(config.inputs, lang.inputs));
	if (config.inputs.keys.length === 0) {
		DOM.querySelector(`#instruction-message`).style.display = `none`;
	}
	await image_displayer.slideshow(DOM.querySelector(`#display`), config.inputs, config.default_duration, 'duration');
	DOM.querySelector(`#instruction-message`).remove();

	screen.exit(`fade`, () => {
		callback({}, []);
	})
}