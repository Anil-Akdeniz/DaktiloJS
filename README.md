# DaktiloJS

DaktiloJS is a lightweight JavaScript library that creates typewriter-style text animations with customizable typing speed, deleting speed, sound effects, and more. Perfect for creating engaging user interfaces or enhancing storytelling on your website.

---

## Features

- Typing animation with customizable speed.
- Deleting animation for characters or full text.
- Blinking cursor with adjustable style and speed.
- Optional looping for continuous animations.
- Adaptive sound effects that adjust to user proximity.
- Easy-to-use queue-based configuration for precise control.

---

## Installation

Add DaktiloJS to your project:

```html
<script src="path/to/daktilojs.js"></script>
```

---

## Basic Usage

Add an element to your HTML and initialize DaktiloJS:

```html
<div class="daktilojs"></div>

<script>
DaktiloJS.init('.daktilojs', {
    sentences: ['Welcome to DaktiloJS!', 'Typewriter animations made easy.'],
    typeSpeed: 100,
    deleteSpeed: 50,
    pauseBetween: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '|',
});
</script>
```

---

## Options

| Option                   | Type        | Default                     | Description                                                                 |
|--------------------------|-------------|-----------------------------|-----------------------------------------------------------------------------|
| `typeSpeed`              | `number`    | `100`                       | Typing speed in milliseconds per character.                                |
| `deleteSpeed`            | `number`    | `50`                        | Deleting speed in milliseconds per character.                              |
| `pauseBetween`           | `number`    | `2000`                      | Pause duration (ms) between typing actions.                                |
| `loop`                   | `boolean`   | `true`                      | Enables or disables looping of animations.                                 |
| `sentences`              | `string[]`  | `[]`                        | Array of sentences to display.                                             |
| `sound`                  | `boolean`   | `false`                     | Enables typing sound effects.                                              |
| `soundFile`              | `string`    | Embedded sound file         | Custom typing sound file (optional).                                       |
| `carriageReturnSound`    | `string`    | Embedded sound file         | Custom carriage return sound file (optional).                              |
| `soundLevel`             | `number`    | `0.5`                       | Volume level for sound effects (0 to 1).                                   |
| `showCursor`             | `boolean`   | `true`                      | Enables or disables the blinking cursor.                                   |
| `cursorChar`             | string      | `<code>&#124;</code>`                      | Character used as the cursor.                                             |
| `cursorBlinkDuration`    | `number`    | `700`                       | Cursor blink duration in milliseconds.                                     |
| `startDelay`             | `number`    | `0`                         | Delay (ms) before the animation starts.                                    |
| `debugger`               | `boolean`   | `false`                     | Enables debugging logs in the console.                                     |
| `showSoundPrompt`        | `boolean`   | `false`                     | Displays a sound activation prompt.                                        |
| `soundPromptPosition`    | `string`    | `'bottom-right'`            | Position of the sound prompt (`'top-left'`, `'top-right'`, etc.).           |
| `adaptiveSound`          | `boolean`   | `false`                     | Adjusts sound volume based on distance from the screen center.             |

---

## Queue Configuration

The `queue` option allows you to define specific actions, such as typing, deleting, and pausing, in a sequential manner.

### Example with Queue

```javascript
DaktiloJS.init('.daktilojs', {
    queue: [
        'Hello, DaktiloJS!',
        { type: 'pause', duration: 1000 },
        { type: 'delete', chars: 6 },
        'World!',
        { type: 'pause', duration: 2000 },
        { type: 'deleteAll' },
    ],
    typeSpeed: 100,
    deleteSpeed: 30,
    loop: true,
});
```

### Supported Actions in Queue

- **`type`**: Specifies text to type.
  ```json
  { type: 'type', string: 'Hello, World!' }
  ```
- **`delete`**: Deletes a specific number of characters.
  ```json
  { type: 'delete', chars: 6 }
  ```
- **`deleteAll`**: Deletes all text.
  ```json
  { type: 'deleteAll' }
  ```
- **`pause`**: Adds a delay before the next action.
  ```json
  { type: 'pause', duration: 2000 }
  ```

---

## Advanced Example

Take advantage of advanced options:

```html
<div class="daktilojs"></div>

<script>
DaktiloJS.init('.daktilojs', {
    sentences: ['Advanced Example', 'Powered by DaktiloJS'],
    typeSpeed: 120,
    deleteSpeed: 80,
    pauseBetween: 3000,
    loop: true,
    sound: true,
    adaptiveSound: true,
    soundLevel: 0.5,
    showCursor: true,
    cursorChar: '_',
    cursorBlinkDuration: 500,
    startDelay: 1000,
    debugger: true,
    showSoundPrompt: true,
    soundPromptPosition: 'bottom-right',
});
</script>
```

---

## License

This library is available under the [MIT License](LICENSE).

---

## Contribution

Feel free to fork, submit issues, or contribute to the repository. Your input is welcome!

