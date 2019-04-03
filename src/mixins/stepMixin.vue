<script>
/*
 * Mixin contains format methods.
 */
export default {
    computed: {
        currency() {
            return this.$store.getters.currency
        },
        step() {
            if (this.currency == '￥') {
                return 1
            }
            return 0.01
        },
    },
}
</script>
