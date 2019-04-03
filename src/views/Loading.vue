<script>
export default {
    page() {
        return {
            title: this.$t('Loading page...'),
            meta: [{ name: 'description', content: this.$t('Loading page...') }],
        }
    },
}
</script>

<template>
    <Layout>
        <transition appear><spinner /></transition>
    </Layout>
</template>

<style lang="scss" module>
@import '@/design/index.scss';

.loadingIcon {
    @extend %typography-xxlarge;

    display: block;
    margin: 0 auto;

    // stylelint-disable-next-line selector-class-pattern
    &:global(.v-enter-active) {
        transition: opacity 1s;
    }
    // stylelint-disable-next-line selector-class-pattern
    &:global(.v-enter) {
        opacity: 0;
    }
}
</style>
