<script>
import { mapActions } from 'vuex'

export default {
    props: ['data'],
    data() {
        return {
            stripe: {
                project: null,
                secret: null,
            },
            sending: false,
            valid: false,
            rules: {
                url: [v => !!v || this.$t('Required Field')],
            },
        }
    },

    computed: {
        projects() {
            return this.$store.state.projects.list
        },
    },

    created() {
        if (this.data && this.data.id) {
            this.stripe = Object.assign({}, this.data)
        }
    },

    methods: {
        ...mapActions(['resetError', 'saveStripe']),

        _handleError() {
            this.sending = false
        },

        tryToSave() {
            this.resetError()
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true
            this.saveStripe(this.stripe)
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
            <span>Stripe {{ 'integration' | translate }}</span>
            <v-spacer />
            <v-btn flat small icon @click="$emit('close')" class="ma-0">
                <v-icon>close</v-icon>
            </v-btn>
        </v-card-title>
        <v-form v-model="valid" @submit.prevent="tryToSave" ref="form">
            <v-layout row wrap class="pa-3">
                <v-flex xs12 md12>
                    <v-select
                        v-model="stripe.project"
                        :items="projects"
                        :disabled="sending"
                        :label="'project' | translate"
                        item-text="title"
                        item-value="id"
                        required
                        class="text-capitalize"
                    />
                    <v-text-field
                        v-model="stripe.secret"
                        class="text-capitalize"
                        :label="'signing secret' | translate"
                        :disabled="sending"
                        append-icon="lock"
                    >
                        <v-menu slot="append-outer" open-on-hover max-width="300" left bottom>
                            <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                            <v-card>
                                <v-card-text>
                                    <span v-if="$root.lang == 'en'">
                                        Before you can verify signatures, you need to retrieve your
                                        endpoint's secret from your Dashboard's
                                        <a
                                            href="https://stripe.com/docs/webhooks/signatures"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Webhooks settings</a
                                        >. Signing secret allows you to validate that the events
                                        were sent by Stripe and not by a third party.
                                    </span>
                                    <span v-else>
                                        署名を検証する前に、ダッシュボードの<a
                                            href="https://stripe.com/docs/webhooks/signatures"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            >Webhooks</a
                                        >設定からエンドポイントの秘密を取得する必要があります。署名シークレットを使用すると、イベントがサード・パーティではなくストライプによって送信されたことを確認できます
                                    </span>
                                </v-card-text>
                            </v-card>
                        </v-menu>
                    </v-text-field>
                </v-flex>
            </v-layout>
            <v-card-actions class="pt-0 px-3 pb-3">
                <v-spacer />
                <v-btn :disabled="sending" flat @click="$emit('close')" class="mr-3">
                    {{ 'cancel' | translate }}
                </v-btn>
                <v-tooltip bottom class="mb-0">
                    <v-btn slot="activator" :disabled="sending" flat type="submit" class="primary">
                        {{ 'save' | translate }}
                    </v-btn>
                    <span>{{ 'Save your webhook details.' | translate }}</span>
                </v-tooltip>
            </v-card-actions>
        </v-form>
    </v-card>
</template>
