<script>
import appConfig from '@/app.config'

export default {
    page: {
        // All subcomponent titles will be injected into this template.
        titleTemplate(title) {
            title = typeof title === 'function' ? title(this.$store) : title
            return title ? `${title} | ${appConfig.title}` : appConfig.title
        },
    },
}
</script>

<template>
    <div id="app">
        <v-app><router-view :key="$route.fullPath"/></v-app>
    </div>
</template>

<!-- This should generally be the only global CSS in the app. -->
<style lang="scss">
// Allow element/type selectors, because this is global CSS.
// stylelint-disable selector-max-type, selector-class-pattern

// Normalize default styles across browsers,
// https://necolas.github.io/normalize.css/
@import '~normalize.css/normalize.css';
// Style loading bar between pages.
// https://github.com/rstacruz/nprogress
@import '~nprogress/nprogress.css';

// Design variables and utilities from src/design.
@import '@/design/index.scss';
</style>
