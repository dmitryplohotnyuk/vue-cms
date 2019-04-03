<script>
import snsIcon from '@/components/contact/snsIcon'
import KDialog from '@/components/dialog'

export default {
    components: { snsIcon, KDialog },
    props: {
        items: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            // dialog state
            isEdit: false,
            // form validation state
            valid: false,
            // form data
            value: '',
            // validation rules
            rules: {
                value: [],
            },
            editType: null,
        }
    },
    computed: {
        types() {
            return [
                { value: 'facebook', text: 'Facebook' },
                { value: 'twitter', text: 'Twitter' },
                { value: 'instagram', text: 'Instagram' },
                { value: 'line', text: 'Line' },
            ]
        },
        typeCaption() {
            const typeItem = this.types.find(o => o.value == this.editType)
            return typeItem && typeItem.text
        },
    },
    methods: {
        resetValidation() {
            this.$nextTick(() => this.$refs.form && this.$refs.form.resetValidation())
        },
        edit(editType) {
            const value = this.items[editType]
            this.editType = editType
            this.value = value
            this.isEdit = true
            this.resetValidation()
        },
        save() {
            this.items[this.editType] = this.value
            this.isEdit = false
            this.$emit('save', this.items)
        },
        remove() {
            this.items[this.editType] = null
            this.isEdit = false
            this.$emit('save', this.items)
        },
    },
}
</script>

<template>
    <div>
        <k-dialog v-model="isEdit" persistent max-width="500px" lazy>
            <v-form @submit.prevent="save" v-model="valid" ref="form" lazy-validation>
                <v-card>
                    <v-card-title class="pb-2">
                        <span class="headline text-capitalize">
                            {{ 'social account' | translate }} | {{ 'update' | translate }}
                        </span>
                        <v-spacer />
                        <v-btn flat small icon @click="isEdit = false" class="ma-0">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class="pt-0">
                        <v-chip class="mb-2">{{ typeCaption }}</v-chip>
                        <v-container class="pa-0" grid-list-lg>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-text-field
                                        :label="typeCaption"
                                        v-model="value"
                                        :rules="rules.value"
                                        required
                                        autofocus
                                        clearable
                                    />
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions class="pt-0 px-3 pb-3">
                        <v-btn v-if="items[editType]" color="error" flat @click.native="remove">
                            {{ 'delete' | translate }}
                        </v-btn>
                        <v-spacer />
                        <v-btn flat @click.native="isEdit = false">
                            {{ 'cancel' | translate }}
                        </v-btn>
                        <v-btn color="primary" type="submit" :disabled="!value">
                            {{ 'save' | translate }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </k-dialog>
        <v-layout row wrap justify-start class="mt-2">
            <v-flex shrink v-for="type in types" :key="type.value">
                <v-menu
                    offset-y
                    top
                    nudge-top="1"
                    open-on-hover
                    close-delay="100"
                    :disabled="!items[type.value]"
                >
                    <sns-icon
                        slot="activator"
                        :value="items[type.value]"
                        :type="type.value"
                        @add="edit(type.value)"
                    />

                    <v-btn flat icon small @click="edit(type.value)"> <v-icon>edit</v-icon> </v-btn>
                </v-menu>
            </v-flex>
        </v-layout>
    </div>
</template>

<style lang="scss" scoped></style>
