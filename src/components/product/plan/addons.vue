<script>
import ListMixin from '@/components/cms/editors/listMixin'

export default {
    mixins: [ListMixin],
    props: ['addons'],
    data() {
        return {
            // form validation state
            valid: false,
            // form data
            title: '',
            price: '',
            // validation rules
            rules: {
                title: [v => !!v || this.$t('Required Field')],
                price: [v => !!v || this.$t('Required Field')],
            },
            items: this.addons || [],
        }
    },
    watch: {
        addons(addons) {
            //do something when addons value changes
            this.items = addons || []
        },
    },
    methods: {
        resetValidation() {
            this.$nextTick(() => this.$refs.form.resetValidation())
        },
        reset() {
            this.title = ''
            this.price = ''
            this.resetValidation()
        },
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            const { title, price } = this
            this.items.push({
                title,
                price,
            })
            this.$emit('change', this.items)
            this.reset()
        },
        remove(index) {
            const { items } = this
            items.splice(index, 1)
            this.$emit('change', this.items)
        },
    },
}
</script>

<template>
    <div>
        <v-list two-line dense>
            <v-list-tile v-for="(item, index) in items" :key="index">
                <v-list-tile-content>
                    <v-list-tile-title> {{ item.title }} </v-list-tile-title>
                    <v-list-tile-sub-title>{{ item.price }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action @click="remove(index)">
                    <v-btn icon ripple>
                        <v-icon>delete</v-icon>
                    </v-btn>
                </v-list-tile-action>
            </v-list-tile>
        </v-list>
        <v-container class="py-0 px-3" grid-list-xl>
            <v-form @submit.prevent="submit" v-model="valid" ref="form" lazy-validation>
                <v-layout row wrap align-center>
                    <v-flex>
                        <v-text-field
                            :label="'Title' | translate"
                            v-model="title"
                            :rules="rules.title"
                            required
                        ></v-text-field>
                    </v-flex>
                    <v-flex>
                        <v-text-field
                            :label="'Price' | translate"
                            v-model="price"
                            :rules="rules.price"
                            type="number"
                            required
                        ></v-text-field>
                    </v-flex>
                    <v-flex shrink>
                        <v-btn icon color="accent" class="ma-0" type="submit">
                            <v-icon>playlist_add_check</v-icon>
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-form>
        </v-container>
    </div>
</template>

<style lang="scss" scoped></style>
