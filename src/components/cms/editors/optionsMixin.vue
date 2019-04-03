<script>
/*
 * Mixin with different select options for CMS.
 */
export default {
    computed: {
        options() {
            return {
                yAlignment: [
                    { value: 'top', text: this.$t('top') },
                    { value: 'center', text: this.$t('center') },
                    { value: 'bottom', text: this.$t('bottom') },
                ],
                xAlignment: [
                    { value: 'left', text: this.$t('left') },
                    { value: 'center', text: this.$t('center') },
                    { value: 'right', text: this.$t('right') },
                ],
                sizes: [
                    { value: 'small', text: this.$t('small') },
                    { value: 'medium', text: this.$t('medium') },
                    { value: 'large', text: this.$t('large') },
                ],
                sizesML: [
                    { value: 'medium', text: this.$t('medium') },
                    { value: 'large', text: this.$t('large') },
                ],
            }
        },
    },
}
</script>
