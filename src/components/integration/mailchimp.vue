<script>
import { mapActions } from 'vuex'

export default {
    props: ['data'],
    filters: {
        formatValues(values) {
            return Object.keys(values).map(value => {
                return {
                    text: values[value],
                    value: Number(value),
                }
            })
        },
    },
    data() {
        return {
            mailchimp: {
                key: null,
                enabled: true,
            },
            sending: false,
            valid: false,
            rules: {
                key: [v => !!v || this.$t('Required Field')],
            },
        }
    },

    computed: {},

    created() {
        if (this.data && this.data.id) {
            this.mailchimp = Object.assign({}, this.data)
        }
    },

    methods: {
        ...mapActions(['resetError', 'getIntegrations', 'createMailchimp', 'updateMailchimp']),
        _handleError() {
            this.sending = false
        },

        tryToSave: function() {
            if (this.mailchimp.id) {
                return this.tryToUpdate()
            }
            return this.tryToCreate()
        },

        tryToCreate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.createMailchimp(this.mailchimp)
                .then(() => {
                    this.sending = false
                    this.$emit('saved', true)
                    return true
                })
                .catch(this._handleError)
        },

        tryToUpdate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.updateMailchimp(this.mailchimp)
                .then(() => {
                    this.sending = false
                    this.$emit('saved', true)
                })
                .catch(this._handleError)
        },
    },
}
</script>

<template>
    <v-card>
        <div class="progress-bar">
            <v-progress-linear
                v-if="sending"
                color="indigo"
                height="5"
                class="ma-0"
                indeterminate
            />
        </div>
        <v-card-title class="title font-weight-regular text-capitalize pb-0">
            <span>Mailchimp {{ 'integration' | translate }}</span>
            <v-spacer />
            <v-btn flat small icon @click="$emit('close')" class="ma-0">
                <v-icon>close</v-icon>
            </v-btn>
        </v-card-title>
        <v-form v-model="valid" @submit.prevent="tryToSave" ref="form">
            <v-layout row wrap class="pa-3">
                <v-flex xs12 md12>
                    <v-text-field
                        :label="'Mailchimp API key' | translate"
                        required
                        :rules="rules.key"
                        v-model="mailchimp.key"
                        append-icon="lock"
                    />
                </v-flex>
            </v-layout>
            <v-card-actions class="pt-0 px-3 pb-3">
                <v-spacer />
                <v-btn :disabled="sending" flat @click="$emit('close')" class="mr-3">
                    {{ 'cancel' | translate }}
                </v-btn>
                <v-btn slot="activator" :disabled="sending" flat type="submit" class="primary">
                    {{ 'save' | translate }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>
