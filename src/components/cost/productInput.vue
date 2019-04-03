<script>
function randId() {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    return randLetter + Date.now()
}

export default {
    props: ['value', 'label', 'required', 'readonly', 'rules', 'hideDetails'],
    data() {
        return {
            search: null,
            proxy: {},
        }
    },
    computed: {
        products() {
            let products = this.$store.state.products.list
            let data = []
            // create products list with plans
            // due to bug in vuetify every element need to have unique'ish id
            products &&
                products.forEach(p => {
                    if (p.plans.length) {
                        data.push({ header: p.name, id: p.id, name: p.name, slug: p.slug })
                        p.plans
                            .filter(pl => pl.product_id == p.id)
                            .forEach((pl, i) => {
                                data.push({ ...pl, product: p.name, slug: p.slug })
                                if (i === p.plans.length - 1) {
                                    data.push({ divider: true, id: randId() })
                                }
                            })
                    } else {
                        data.push({ id: p.id, name: p.name })
                        data.push({ divider: true, id: randId() })
                    }
                })
            return data
        },
        model: {
            get() {
                return (
                    (Array.isArray(this.products) && this.products.find(o => o.id == this.proxy)) ||
                    this.proxy
                )
            },
            set(value) {
                this.$nextTick(() => {
                    if (value && !value.id) {
                        this.proxy = { name: value }
                    } else {
                        this.proxy = value
                    }
                })
            },
        },
    },
    mounted() {
        // TODO: load project owner products
        if (!this.products.length) this.load.run()
        this.proxy = this.value
    },
    watch: {
        value(val) {
            this.proxy = val
        },
        proxy(val) {
            this.$emit('input', val ? val : null)
        },
    },
    tasks(t) {
        return {
            load: t(async function() {
                try {
                    await this.$store.dispatch('getProducts')
                } catch (e) {
                    this.$store.dispatch('handleError', e)
                }
            }).flow(
                'restart',
                { delay: 300 }
            ),
        }
    },
    methods: {
        getName(c) {
            let name = c.name
                ? c.name
                : c.last_name || c.first_name
                ? c.last_name + ' ' + c.first_name
                : ''
            return name ? name : c.email ? c.email : 'N/A'
        },
        filter(item, queryText) {
            if (typeof queryText != String) return false
            return (
                (item.name &&
                    item.name.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1) ||
                (item.slug &&
                    item.slug.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1) ||
                (item.product &&
                    item.product.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1)
            )
        },
    },
}
</script>

<template>
    <v-combobox
        height="26px"
        v-model="model"
        :items="products"
        :label="label"
        :loading="load.isActive"
        :required="required"
        :readonly="readonly"
        :filter="filter"
        :rules="rules"
        item-text="name"
        item-value="id"
        dense
        solo
        :clearable="!readonly"
        :hide-details="hideDetails"
        hide-no-data
    />
</template>
