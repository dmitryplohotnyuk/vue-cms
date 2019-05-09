## Installation

```bash
# Install dependencies from package.json
yarn install
```

## Dev server

```bash
# Launch the dev server
yarn serve

# Launch the dev server and automatically open it in
# your default browser when ready
yarn serve --open
```

### Developing locally

By default dev api is used, you can put
```
VUE_APP_BASE_URI=http://localhost:8000/api
```

in `.env.local` to switch to local backend.

## Generators

This project includes generators to speed up common development tasks. Commands include:

```bash
# Generate a new component with adjacent unit test
yarn new component

# Generate a new view component with adjacent unit test
yarn new view

# Generate a new layout component with adjacent unit test
yarn new layout

# Generate a new Vuex module with adjacent unit test
yarn new module

# Generate a new utility function with adjacent unit test
yarn new util

# Generate a new end-to-end spec
yarn new e2e
```

Update existing or create new generators in the `_templates` folder, with help from the [Hygen docs](http://www.hygen.io/).

## CSS

For our styles, we're using SCSS and CSS modules, which you can activate by adding the `lang="scss"` and `module` attributes to style tags in Vue components:

```html
<style lang="scss" scoped>
  /* Styles go here */
</style>
```

### SCSS

SCSS is a superset of CSS, meaning any valid CSS is _also_ valid SCSS. This allows you to easily copy properties from other sources, without having to reformat it. It also means you can stick to writing the CSS you're still comfortable with while you're learning to use more advanced SCSS features.

I specifically recommend reading about:

* [Variables](http://sass-lang.com/guide#topic-2)
* [Nesting](http://sass-lang.com/guide#topic-3)
* [Operators](http://sass-lang.com/guide#topic-8)

Just those features cover at least 95% of use cases.

### Importing global modules

To import files from `node_modules` using aliases, Webpack's [css-loader](https://github.com/webpack-contrib/css-loader) requires adding `~` to the beginning of a module name to denote that it's an global (not relative) file reference. For example:

```scss
@import '~font-awesome/scss/font-awesome';
```

### Design variables and tooling

All our [variables](https://sass-lang.com/guide#topic-2), [placeholder classes](https://sass-lang.com/guide#topic-7), [mixins](https://sass-lang.com/guide#topic-6), and other design tooling are in the `src/design` folder. Each of these files define variables, prefixed with the name of the file, then combined in `src/design/index.scss`. This combined file is aliased as `@design` for convenience and can be imported into SCSS using:

```scss
@import '@design';
```

This makes all our design variables available in your component or SCSS file.

> NOTE: The `src/design` folder should never contain code that compiles to actual CSS, as that CSS would be duplicated across every component the file is imported into.

### Global CSS

Typically, only [`src/app.vue`](src/app.vue) should ever contain global CSS and even that should only include base element styles and utility classes (e.g. for grid management).

