<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
    methods: {
        heroStyle: function(object) {
            var result = ''
            result += 'background-position: center ' + object.backgroundImageAlignment
            result += ';background-image: url(' + object.backgroundImage + ');'
            return result
        },
    },
}
</script>

<template>
    <div
        v-if="block && block.enabled"
        :style="heroStyle(block.settings)"
        class="d-flex flex-column justify-content-center hero text-center text-light p-relative"
        :class="{
            'hero-sm': block.settings.sectionHeight == 'small',
            'hero-lg': block.settings.sectionHeight == 'large',
        }"
    >
        <div class="hero-body px-4">
            <h1 :class="'hero-heading--' + block.settings.headingSize">
                <div class="no-content-margin" v-html="block.settings.heading" />
            </h1>
            <div
                :class="'hero-text--' + block.settings.textSize"
                class="mb-4 no-content-margin"
                v-html="block.settings.text"
            ></div>
            <a
                v-if="block.settings.buttonLabel && block.settings.buttonLink"
                :href="block.settings.buttonLink"
                class="btn btn-lg"
            >
                {{ block.settings.buttonLabel }}
            </a>
        </div>
    </div>
</template>
