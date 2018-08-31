# Slideshow (1.0)

Wombat slideshow component. Huge images are scaled down, tiny images are scaled up somewhat.

## Input configuration:

- `"stimuli"`: Array of stimuli objects that will be displayed in the slideshow
  - `"{stim_object}"`:
    - `"name"`: The same of the stimuli
    - `"path"`: The URL of the stimuli image
    - `"min_duration"`: The minimum duration this stimuli should be displayed before becoming skippable via user input
    - `"duration"`: The duration the stimuli will be displayed for unless interrupted
- `"default_duration"`: The duration stimuli will be displayed for if they don't define this value for themselves
- `"repeats"`: How many times the full slideshow will be cycled through
- `"background"`: Settings for the document background
  - `"colour"`: The colour (in any valid css format) the background will be
  - `"duration"`: The transition time for the background to fade to the specified `"colour"`
- `"inputs"`: The inputs available to the user which allow them to advance the slideshow manually
  - `"mouse"`: Array of available mouse buttons (from `"left"`, `"middle"` or `"right"`, i.e `["left", "right"]`)
  - `"keys"`: Array of available keys (i.e `["space", "A"]`)
- `"randomise"`: Whether to randomise the stimuli order (`true` or `false`)
- `"language"`: The language to fallback to if configuration doesn't have specific overrides.
- `"language_options"`: The language overrides to apply

## Behavior:

- Display intro screen
- Wait for images to finish loading, then enable the continue button
  - `::User presses the continue button::`
- Clear the intro screen away, fade the background to the specified `"colour"` over the specified `"duration"`, begin the slideshow and display available controls to the user if any are specified.
- If `"repeats"` is greater than `0`, repeat up to the specified number
- Fade out, submit `META` and `DATA` objects *(both will be empty)*

## Output:

- `DATA`: An array object *(will be empty as we gather no information in this component)*
- `META`: An object representing user information to capture for future elements in the experiment *(will be empty like `DATA`)*