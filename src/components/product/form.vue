<script>
export default {
    filters: {
        append(string1, string2) {
            return String(string1) + String(string2)
        },
    },
    props: {
        product: {
            default: () => ({
                payment_type: 'stripe',
            }),
        },
        noTitle: {
            type: Boolean,
        },
    },
    data() {
        return {
            // form validation state
            valid: false,
            // validation rules
            rules: {
                name: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 60) ||
                        this.$t('The value must be less than or equal {count} characters.', {
                            count: 60,
                        }),
                ],
                unit_label: [],
                statement_descriptor: [],
            },
        }
    },
    computed: {
        formData() {
            return { ...this.product }
        },
    },
    tasks(t) {
        return {
            save: t(async function(data) {
                try {
                    if (data.id) {
                        await this.$store.dispatch('updateProduct', data)
                    } else {
                        await this.$store.dispatch('createProduct', data)
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
    },
}
</script>

<template>
    <v-form @submit.prevent="submit" v-model="valid" ref="form" lazy-validation>
        <v-card>
            <v-card-title v-if="!noTitle" class="title text-capitalize">
                <span v-if="formData.id">
                    {{ 'product' | translate }} | {{ 'update record details' | translate }}
                </span>
                <span v-else>
                    {{ 'product' | translate }} | {{ 'add new record' | translate }}
                </span>
                <v-spacer />
                <v-btn flat small icon @click="$emit('close')" class="ma-0">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text :class="{ 'pt-0': !noTitle }">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-text-field
                            v-model="formData.name"
                            :rules="rules.name"
                            :label="'product name' | translate | append(' *')"
                            class="text-capitalize"
                            autofocus
                        />
                    </v-flex>
                    <v-flex xs12>
                        <v-textarea
                            v-model="formData.description"
                            :label="'description' | translate"
                            class="text-capitalize"
                            rows="3"
                        ></v-textarea>
                    </v-flex>
                    <!--v-flex xs12 sm6 class="pr-3">
                        <v-text-field
                            v-model="formData.unit_label"
                            :rules="rules.unit_label"
                            :label="'unit label' | translate"
                            class="text-capitalize"
                        />
                    </v-flex>
                    <v-flex xs12 sm6>
                        <v-text-field
                            v-model="formData.statement_descriptor"
                            :rules="rules.statement_descriptor"
                            :label="'statement descriptor' | translate"
                            class="text-capitalize"
                        />, 'square', 'pay.jp'
                    </v-flex-->
                    <v-flex xs12 class="blue-grey lighten-5 pa-3">
                        <div v-if="$root.lang == 'en'" class="pa-0">
                            If you have
                            <router-link to="/integrations">Stripe integration</router-link>
                            enabled you can associate this product with the already created product
                            in Stripe for automatic Revenue tracking.
                        </div>
                        <div v-else class="pa-0">
                            <router-link to="/integrations">Stripeインテグレーション</router-link>
                            との自動連携が有効になっていれば、ここで登録したプロダクトと、
                            Stripeで登録したプロダクトが紐づけれるので、取引を自動的に収益データへ反映させることができます。
                        </div>
                    </v-flex>
                    <v-flex xs12 sm6>
                        <v-select
                            v-model="formData.payment_type"
                            :items="['stripe']"
                            :label="'payment system' | translate"
                            hide-details
                            class="text-capitalize pr-3"
                            :menu-props="{ contentClass: 'text-capitalize' }"
                            clearable
                        />
                    </v-flex>
                    <v-flex xs12 sm6>
                        <v-text-field
                            v-model="formData.payment_id"
                            :label="'product ID' | translate"
                            class="text-capitalize"
                            hide-details
                        >
                            <v-menu slot="append-outer" open-on-hover max-width="300" left bottom>
                                <v-icon slot="activator" size="19" class="mt-1">help</v-icon>
                                <v-card>
                                    <v-card-text>
                                        <span v-if="$root.lang == 'en'">
                                            ID is a unique identifier which was auto-generated by
                                            Stripe. You can find Product ID in the Product Details
                                            Panel of your Stripe account.
                                        </span>
                                        <span v-else>
                                            Product IDは、Stripe > Billing > Product >
                                            Detailsにて確認できます。
                                        </span>
                                    </v-card-text>
                                </v-card>
                            </v-menu>
                        </v-text-field>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-card-actions class="pt-0 px-3 pb-3">
                <v-spacer />
                <v-btn flat @click.native="$emit('close')">{{ 'cancel' | translate }}</v-btn>
                <v-btn color="primary" type="submit" dark :loading="save.isActive">
                    <span v-if="formData.id">{{ 'update' | translate }} </span>
                    <span v-else>{{ 'create' | translate }} </span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>
