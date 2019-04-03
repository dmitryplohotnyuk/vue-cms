<script>
import formatDate from '@/utils/format-date'
import formatCurrency from '@/utils/format-currency'
/*
 * Mixin contains format methods.
 */
export default {
    methods: {
        formatDate(date, format) {
            return formatDate(date, format)
        },
        formatCurrency(value, currency, option) {
            return formatCurrency(value, currency, option)
        },
    },
}
</script>
