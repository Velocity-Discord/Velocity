# Contributing to Velocity

This document will provide guidelines and best practices for contributing to the Velocity project.

# Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Prerequisites](#prerequisites)
- [Styleguides](#styleguides)
    - [Git commits](#git-commits)
    - [JS formatting](#js-formatting)
    - [CSS formatting](#css-formatting)

# Code of Conduct

This project is governed by the [Code of Conduct from the Contributor Covenant](https://www.contributor-covenant.org/version/1/4/code-of-conduct.html). By participating and contributing, you are expected to uphold this code. Please report unacceptable behavior.

# Prerequisites

Velocity is split into two main scripts, the [main](https://github.com/Velocity-Discord/Velocity/blob/main/src/index.js) and the [preload](https://github.com/Velocity-Discord/Velocity/blob/main/src/preload.js). The main sets up Discord so that the preload script can be run and then the preload adds all our features.

On a Velocity release, we package the codebase into one file ([velocity.asar](https://github.com/Velocity-Discord/Velocity/blob/main/dist/velocity.asar))

**Pull Requests should NEVER include a bundled asar as we generate our own on release**

# Styleguides
## Git Commits
Git commits should adhere to the following rules.

- **Start with the title of the section being changed inside square brackets (if it is a general change they should be titled `[Core] ...`). (`[AddonManager] Fix plugin loading`)**
- Use present tense for the commit message. (Fix, Add, Remove, etc.)
- Use a short, descriptive message. (`[Settings] Add 'Updater' Settings Tab`)

## JS Formatting
The Velocity codebase uses [Prettier](https://prettier.io/) to format JS.

Ensure you have [Prettier installed and enabled before you start writing](https://prettier.io/docs/en/install.html)

General Rules:
- Use inline exports where possible.
```js
// use
module.exports = new (class ClassName {

})();

// not
class ClassName {

}

module.exports = ClassName;
```
- Wrap exports/main functionality in a class following the format below wherever possible.
```js
module.exports = new (class TacoManager {
    ...
})();
```
- Place Class properties in the following order:
    - `get`ters
    - plain properties
    - methods
- Place imports in the following order:
    - `VApi` imports. (should have an empty newline before the next sections)
    - Destructuring imports.
    - Local imports.
    - Module imports.
- All files that use `VApi` should use a special header:
```js
/**
 * @type {Api}
 */
const VApi = window.VApi;
```

## CSS Formatting
The Velocity codebase uses Stylelint to lint CSS.

Ensure you lint your CSS before you commit.

# Thank you for taking the time to contribute to Velocity!