import Mousetrap from "mousetrap";
import $ from "jquery";

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

    async slideshow(dom_container, inputs, default_duration, duration_key) {
        dom_container.querySelectorAll(`img.image-displayer`).forEach(element => {
            element.remove();
        });
        for (const stim of this.stimuli) {
            const display_image = stim.image.cloneNode();
            display_image.className = `image-displayer`;
            const d_duration = (typeof default_duration === `undefined`) ? 0 : default_duration;
            const duration = (typeof stim[`${duration_key}`] === `undefined`) ? d_duration : stim[`${duration_key}`];
            dom_container.appendChild(display_image);
            await new Promise(res => $(dom_container).fadeIn(200, res));
            await Promise.race([asycSetTimeout(duration), receiveInput(inputs)]);
            await new Promise(res => $(dom_container).fadeOut(200, res));
            dom_container.removeChild(display_image);
        }
    }
}

function asycSetTimeout(ms_delay) {
    return new Promise(res => setTimeout(res, ms_delay));
}

function receiveInput(inputs) {
    return new Promise(res => {
        Mousetrap.reset();
        for (const input of inputs) {
            Mousetrap.bind([input.toLowerCase(), input.toUpperCase()], res);
        }
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