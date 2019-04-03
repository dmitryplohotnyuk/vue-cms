<script>
import { mapActions } from 'vuex'

export default {
    props: ['value', 'label', 'required', 'readonly', 'filter', 'hideDetails', 'loading'],
    data() {
        return {
            search: null,
            pagination: {
                rowsPerPage: 10,
            },
            proxy: {},
        }
    },
    computed: {
        contacts() {
            const filter = this.filter || (o => o)
            let { contacts } = this.$store.state.contacts.list
            return (
                contacts && contacts.filter(filter).map(o => ({ id: o.id, name: this.getName(o) }))
            )
        },
        model: {
            get() {
                return (
                    (Array.isArray(this.contacts) && this.contacts.find(o => o.id == this.proxy)) ||
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
        inputFieldName() {
            return 'contact-' + this._uid
        },
    },
    mounted() {
        // TODO: load project owner contacts
        this.load.run()
        this.proxy = this.value
    },
    watch: {
        search: function() {
            this.load.run()
        },
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
                let { search, pagination } = this
                let params = { pagination }
                if (search && search != 'N/A') params.search = search
                try {
                    await this.getContacts(params)
                } catch (e) {
                    this.model = this.$t('contact deleted')
                    this.handleError(e)
                }
            })
                // Don't allow repeat calls to fire (one flip at a time!).
                .flow(
                    'restart',
                    { delay: 300 }
                ),
        }
    },
    methods: {
        ...mapActions(['getContacts', 'handleError']),
        onChange(value) {
            let data = value && value.id ? value : value ? { name: value } : null
            this.$emit('input', data)
        },
        getName(c) {
            let name = c.name
                ? c.name
                : c.last_name || c.first_name
                ? c.last_name + ' ' + c.first_name
                : ''
            return name ? name : c.email ? c.email : 'N/A'
        },
    },
}
</script>
<template>
    <v-combobox
        v-model="model"
        :items="contacts"
        :label="label"
        :search-input.sync="search"
        :loading="load.isActive || loading"
        :required="required"
        :readonly="readonly"
        item-text="name"
        item-value="id"
        dense
        :clearable="!readonly"
        :hide-details="hideDetails"
        hide-no-data
        no-filter
        :name="inputFieldName"
    >
    </v-combobox>
</template>
<style lang="scss" scoped></style>
