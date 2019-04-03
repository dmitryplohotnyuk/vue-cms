<script>
/*
 * Mixin for list management.
 */
export default {
    methods: {
        arrayMove(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                let k = new_index - arr.length + 1
                while (k--) {
                    arr.push(undefined)
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
            return arr // for testing
        },
        up(index) {
            const { items } = this
            this.arrayMove(items, index, index <= 0 ? items.length - 1 : index - 1)
        },
        down(index) {
            const { items } = this
            this.arrayMove(items, index, index >= items.length - 1 ? 0 : index + 1)
        },
        remove(index) {
            const { items } = this
            items.splice(index, 1)
        },
    },
}
</script>
