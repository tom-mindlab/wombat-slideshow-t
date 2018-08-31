import Mousetrap from "mousetrap";
import $ from "jquery";
import ldShuffle from "lodash/shuffle";

export class ImageDisplayer {
    constructor(stimuli) {
        if (!Array.isArray(stimuli)) {
            throw new TypeError("ImageDisplayer contructor requires array of items");
        }
        this.stimuli = stimuli;
    }

    get images() {
        return this.stimuli.map(stim => stim.image);
    }

    get paths() {
        return this.stimuli.map(stim => stim.path);
    }

    async slideshow(dom_container, inputs, default_duration, duration_key, randomise) {
        dom_container.querySelectorAll(`img.image-displayer`).forEach(element => {
            element.remove();
        });
        const display_stim = (randomise) ? ldShuffle(this.stimuli) : this.stimuli;
        for (const stim of display_stim) {
            const display_image = stim.image.cloneNode();
            display_image.className = `image-displayer`;
            const d_duration = (typeof default_duration === `undefined`) ? 0 : default_duration;
            const duration = (typeof stim[`${duration_key}`] === `undefined`) ? d_duration : stim[`${duration_key}`];
            dom_container.appendChild(display_image);
            await new Promise(res => $(dom_container).fadeIn(200, res));
            await Promise.race([asycSetTimeout(duration), receiveInput(inputs, dom_container)]);
            await new Promise(res => $(dom_container).fadeOut(200, res));
            dom_container.removeChild(display_image);
        }
    }
}

function asycSetTimeout(ms_delay) {
    return new Promise(res => setTimeout(res, ms_delay));
}

function receiveInput(inputs, target_container) {
    const mouse_button_mappings = new Map();
    mouse_button_mappings.set(0, `left`);
    mouse_button_mappings.set(1, `middle`);
    mouse_button_mappings.set(2, `right`);

    return new Promise(res => {
        for (const key of inputs.keys) {
            Mousetrap.bind([key.toLowerCase(), key.toUpperCase()], res);
        }

        target_container.addEventListener(`click`, (click_event) => {
            for (const mouse_button of inputs.mouse) {
                if (mouse_button_mappings.get(click_event.button) === mouse_button.toLowerCase()) {
                    res();
                }
            }

        })

    });
}


export function pathToImage(path) {
    return new Promise(res => {
        const image = new Image();
        image.addEventListener(`load`, () => res(image));
        image.src = path;
    })
}

export function pathsToImages(paths) {
    const output_images = [];

    for (const path of paths) {
        output_images.push(pathToImage(path));
    }
    return Promise.all(output_images);
}