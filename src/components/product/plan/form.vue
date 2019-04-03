<script>
import PlanAddonsForm from '@/components/product/plan/addons'

export default {
    components: { PlanAddonsForm },
    filters: {
        append(string1, string2) {
            return String(string1) + String(string2)
        },
    },
    props: {
        product: {},
        plan: {
            default: () => ({
                currency: 'jpy',
                trial_days: 0,
            }),
        },
        save: {},
    },
    data() {
        return {
            // form validation state
            valid: false,
            // validation rules
            rules: {
                name: [v => !!v || this.$t('Required Field')],
                trial_days: [
                    v =>
                        !v ||
                        (v >= 0 && v <= 720) ||
                        this.$t('The trial period must be between 0 and 720 days'),
                ],

                currency: [v => !!v || this.$t('Required Field')],
                interval: [v => !!v || this.$t('Required Field')],
                interval_count: [v => (!!v && v > 0) || this.$t('Required Field')],
            },
            currencyItems: [
                { text: 'JPY', value: 'jpy' },
                { text: 'USD', value: 'usd' },
                { text: 'EUR', value: 'eur' },
            ],
            // hide all the fields beside description and Title
            free: false,
            withAddons: false,
        }
    },
    computed: {
        formData() {
            if (this.plan) {
                return { ...this.plan }
            } else {
                return { currency: 'jpy', trial_days: 0, payment_type: this.product.payment_type }
            }
        },
        billing_interval_options() {
            return [
                { value: 'once', text: this.$t('Once') },
                { value: 'day', text: this.$t('Daily') },
                { value: 'week', text: this.$t('Weekly') },
                { value: 'month', text: this.$t('Monthly') },
                { value: 'quarter', text: this.$t('Every 3 months') },
                { value: 'semiannual', text: this.$t('Every 6 months') },
                { value: 'year', text: this.$t('Yearly') },
            ]
        },
    },
    watch: {
        // set free flag if pln.amount == 0
        'plan.amount'(amount) {
            this.free = !amount
        },
        // turn off addons form if plan has no addons
        'plan.addons'(addons) {
            this.withAddons = addons && addons.length > 0
        },
        // however reset `free` and `withAddons` for new plan
        'plan.id'(id) {
            if (!id) {
                this.free = false
                this.withAddons = false
            }
        },
    },
    tasks(t) {
        return {
            save: t(async function(data) {
                try {
                    if (data.id) {
                        await this.$store.dispatch('updatePlan', data)
                    } else {
                        data.product_id = this.product.id
                        await this.$store.dispatch('createPlan', data)
                    }
                    this.$emit('saved')
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
        }
    },
    methods: {
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.save.run(this.formData)
        },
        changeAddons(addons) {
            this.$set(this.formData, 'addons', addons)
        },
    },
}
</script>

<template>
    <div>
        <v-form @submit.prevent="submit" v-model="valid" ref="form" lazy-validation>
            <v-card>
                <v-card-title class="title text-capitalize">
                    <span v-if="formData.id">
                        {{ 'plan' | translate }} | {{ 'update record details' | translate }}
                    </span>
                    <span v-else>
                        {{ 'plan' | translate }} | {{ 'add new record' | translate }}
                    </span>
                    <v-spacer />
                    <v-btn flat small icon @click="$emit('close')" class="ma-0">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-list two-line>
                    <v-list-tile class="teal lighten-5">
                        <v-list-tile-avatar color="white">
                            <v-icon color="teal">local_mall</v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-sub-title class="text-capitalize">
                                {{ 'linked to product:' | translate }}
                            </v-list-tile-sub-title>
                            <v-list-tile-title>{{ product.name }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-card-text class="pt-0">
                    <v-container grid-list-lg class="pa-0">
                        <v-layout row wrap class="mb-0">
                            <v-flex xs12 sm6>
                                <v-text-field
                                    v-model="formData.name"
                                    :rules="rules.name"
                                    autofocus
                                    :hint="
                                        `This won't be visible to customers, but will help you find this plan later.`
                                            | translate
                                    "
                                >
                                    <template v-slot:label>
                                        <span class="text-capitalize">
                                            {{ 'title' | translate | append(' *') }}
                                        </span>
                                    </template>
                                </v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6>
                                <v-switch
                                    :label="'This is a Free plan' | translate"
                                    v-model="free"
                                    hide-details
                                />
                            </v-flex>
                            <v-flex xs12>
                                <v-textarea
                                    v-model="formData.description"
                                    :label="'description' | translate"
                                    class="text-capitalize"
                                    rows="1"
                                    auto-grow
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout v-if="!free" row wrap class="mb-0">
                            <v-flex xs12 sm6 v-if="!formData.id">
                                <v-layout row wrap>
                                    <v-flex xs12 sm4>
                                        <v-select
                                            :items="currencyItems"
                                            v-model="formData.currency"
                                            :label="'currency' | translate | append(' *')"
                                            class="text-capitalize"
                                        />
                                    </v-flex>
                                    <v-flex xs12 sm8>
                                        <v-text-field
                                            v-model="formData.amount"
                                            :label="'price' | translate"
                                            class="text-capitalize"
                                            type="number"
                                            min="0"
                                        />
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <v-flex xs12 sm6 v-if="!formData.id">
                                <v-tooltip bottom max-width="300">
                                    <v-select
                                        slot="activator"
                                        class="text-capitalize"
                                        :label="'billing interval' | translate | append(' *')"
                                        v-model="formData.interval"
                                        :rules="rules.interval"
                                        :items="billing_interval_options"
                                        clearable
                                    />
                                    <span>
                                        <span v-if="$root.lang == 'en'">
                                            This is an interval between charges. If set Monthly and
                                            customer subscribed on 2nd of the month he will always
                                            be billed on the 2nd.
                                        </span>
                                        <span v-else>
                                            サブスクライバーが利用プランに対する支払間隔。
                                        </span>
                                    </span>
                                </v-tooltip>
                            </v-flex>

                            <v-flex xs12 sm6 :md6="!formData.id">
                                <v-layout row wrap>
                                    <v-flex xs12 sm4>
                                        <v-text-field
                                            v-model="formData.trial_days"
                                            :rules="rules.trial_days"
                                            type="number"
                                            :label="'Trial period' | translate"
                                            :suffix="'days' | translate"
                                            :hint="
                                                `Subscriptions to this plan will automatically start with a defined free trial period.`
                                                    | translate
                                            "
                                        />
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <v-flex v-if="!free" xs12 sm6>
                                <v-text-field
                                    v-model="formData.payment_id"
                                    :label="'pricing plan ID' | translate"
                                    class="text-capitalize"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-container fluid class="indigo lighten-5 mb-3 py-2 px-3" grid-list-lg>
                    <v-layout row align-center>
                        <v-flex shrink>
                            <v-switch
                                v-model="withAddons"
                                color="primary"
                                hide-details
                                class="ma-0"
                            />
                        </v-flex>
                        <v-flex>
                            <h5 class="title indigo--text text-capitalize">
                                {{ 'one–time charges' | translate }}
                            </h5>
                            <div class="black--text" v-if="$root.lang == 'en'">
                                Does your recurring plan have one-time charges, like a membership
                                fee, key money, security deposit, etc.? Add them now or manage later
                                in the Plan Details.
                            </div>
                            <div class="black--text" v-else>
                                サブスクリプションプランに、入会金などの初期費用がある場合有効にしてください。
                            </div>
                        </v-flex>
                    </v-layout>
                </v-container>
                <plan-addons-form
                    v-if="withAddons"
                    :addons="formData.addons"
                    @change="changeAddons"
                    class="mb-3"
                />
                <v-card-actions class="pt-0 px-3 pb-3">
                    <v-spacer />
                    <v-btn flat @click.native="$emit('close')">{{ 'cancel' | translate }}</v-btn>
                    <v-btn color="primary" type="submit" dark :loading="save.isActive">
                        <span v-if="formData.id">{{ 'update' | translate }} </span>
                        <span v-else>{{ 'submit' | translate }} </span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
        <v-snackbar v-model="save.lastResolved" color="success" bottom>
            {{ 'Plan saved successfully!' | translate }}
        </v-snackbar>
    </div>
</template>
