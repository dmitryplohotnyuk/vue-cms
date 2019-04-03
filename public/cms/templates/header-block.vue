<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
    computed: {
        headerStyle() {
            const colors = this.landing.theme.colors
            const color = colors.colorBg || colors.brand || '#fff'
            return 'background-color: ' + color
        },
    },
}
</script>

<template>
    <header v-if="block && block.enabled" class="navbar p-2" :style="headerStyle">
        <section class="navbar-section grow show-xs">
            <a
                class="btn btn-action show-xs mr-5"
                href="#"
                v-if="block.settings.menu && block.settings.menu.length"
                @click.prevent="$emit('sidebar')"
            >
                <i class="icon icon-menu"></i>
            </a>
        </section>
        <section class="navbar-section shrink">
            <img
                v-if="block.settings.logoImage"
                class="img-fit-contain"
                :src="block.settings.logoImage"
                :width="block.settings.logoImageWidth"
                alt=""
            />
            <a
                href="/"
                class="navbar-brand mr-2 text-clip no-content-margin"
                :style="buildStyle(landing.theme.colors, { color: 'headerBrand' })"
                v-html="block.settings.brandName"
            >
            </a>
        </section>
        <section class="navbar-section hide-xs" v-if="block.settings.menu">
            <a
                class="btn btn-link"
                v-for="item in block.settings.menu"
                :key="item.name"
                :href="item.link"
                :style="buildStyle(landing.theme.colors, { color: 'headerLinks' })"
            >
                {{ item.name }}
            </a>
        </section>
    </header>
</template>
