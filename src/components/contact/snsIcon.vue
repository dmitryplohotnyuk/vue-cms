<script>
export default {
    name: 'snsIcon',
    props: ['type', 'value'],
    data() {
        return {}
    },
    computed: {
        types() {
            return {
                facebook: {
                    text: 'Facebook',
                    imgUrl: '/img/sns/facebook.svg',
                    prefix: 'https://www.facebook.com/',
                },
                twitter: {
                    text: 'Twitter',
                    imgUrl: '/img/sns/twitter.svg',
                    prefix: 'https://twitter.com/',
                },
                instagram: {
                    text: 'Instagram',
                    imgUrl: '/img/sns/instagram.svg',
                    prefix: 'https://www.instagram.com/',
                },
                line: {
                    text: 'Line',
                    imgUrl: '/img/sns/line.svg',
                    prefix: 'https://line.me/R/',
                },
            }
        },
        typeDetails() {
            return this.types[this.type]
        },
    },
}
</script>
<template>
    <v-tooltip bottom nudge-bottom="10">
        <span slot="activator">
            <a
                v-if="value"
                :href="typeDetails.prefix + value"
                target="_blank"
                rel="noreferrer noopener"
            >
                <v-avatar size="36" tile>
                    <img :src="typeDetails.imgUrl" :alt="typeDetails.text" />
                </v-avatar>
            </a>
            <v-avatar
                v-else
                size="36"
                tile
                :class="{ 'icon-disabled': !value }"
                @click="$emit('add')"
            >
                <img :src="typeDetails.imgUrl" :alt="typeDetails.text" />
            </v-avatar>
        </span>
        <span>
            <span v-if="value">{{ typeDetails.text }}</span>
            <span v-else>{{ 'Click to connect social account' | translate }}</span>
        </span>
    </v-tooltip>
</template>
<style lang="scss" scoped>
.icon-disabled {
    opacity: 0.38;
}
</style>
