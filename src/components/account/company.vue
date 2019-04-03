<script>
import postal_code from 'japan-postal-code'
import countries from '@/countries.json'
import months from '@/months.json'

export default {
    name: 'UserCompany',
    data() {
        return {
            valid: false,
            showSuccess: false,
            edit: {},
            company: {},
            companySizes: [
                {
                    text: '1-9',
                    value: 1,
                },
                {
                    text: '10-19',
                    value: 2,
                },
                {
                    text: '20-49',
                    value: 3,
                },
                {
                    text: '50-99',
                    value: 4,
                },
                {
                    text: '100-499',
                    value: 5,
                },
            ],
            countries,
            top_industry: null,
            m_industry: null,
            s_industry: null,
            fiscal_start: null,
            fiscal_end: null,
            rules: {
                name: [
                    v => !!v || this.$t('Name is required'),
                    v =>
                        (v && v.length <= 150) ||
                        this.$t('Name must be at most 150 characters long'),
                    v => (v && v.length >= 2) || this.$t('Name must be at least 2 characters long'),
                ],
                katakana: [
                    v => {
                        const pattern = /^[ア-ン゛゜ァ-ォャ-ョー「」、0-9 -]+$/
                        return !v || pattern.test(v) || this.$t('Please input katakana only')
                    },
                ],
                fiscal_start: [
                    v =>
                        !v ||
                        (v > 0 && v < 11) ||
                        this.$t('Fiscal start month should be between January and December'),
                ],
                fiscal_end: [
                    v =>
                        !v ||
                        (v > 0 && v < 11) ||
                        this.$t('Fiscal end month should be between January and December'),
                ],
            },
        }
    },
    computed: {
        industries() {
            return this.$store.state.account.industries
        },
        top_industries() {
            return this.industries.filter(i => i.parent_id == 0)
        },
        m_industries() {
            return this.industries.filter(i => i.parent_id == this.top_industry)
        },
        s_industries() {
            return this.edit.industry_id
                ? this.industries
                : this.industries.filter(i => i.parent_id == this.m_industry)
        },
        filtered_industries() {
            return this.edit.industry_code
                ? this.industries
                : this.industries.filter(i => i.parent_id == this.s_industry)
        },
        month_items() {
            return months.map(item => {
                return {
                    value: item.value,
                    text: this.$t(item.text),
                }
            })
        },
    },

    mounted() {
        if (!this.company.id) {
            this.getCompany.run()
        }
        if (!this.industries.length) {
            this.$store.dispatch('getIndustries').then(() => {
                if (this.company && this.company.industry) {
                    this.edit.industry_id = this.company.industry.id
                }
            })
        }
        if (!this.edit.id) {
            this.edit.country = 'JP'
        }
    },

    tasks(t) {
        return {
            getCompany: t(async function() {
                this.company = await this.$store.dispatch('getUserCompany')
                this.edit = Object.assign({}, this.company)
            }).flow('drop'),
            save: t(async function() {
                this.$store.dispatch('resetError')
                if (!this.$refs.form.validate()) return Promise.resolve(false)
                delete this.edit.industry
                if (this.edit.country != 'JP') this.edit.industry_id = null
                if (!this.edit.country) {
                    this.edit.country = null
                }
                await this.$store.dispatch('updateUserCompany', this.edit).then(() => {
                    this.showSuccess = true
                })
            }).flow('drop'),
        }
    },
    methods: {
        getPostalCode(zip) {
            if (this.edit.country != 'JP') return
            postal_code.get(zip, address => {
                if (address) {
                    this.edit.city = address.city
                    this.edit.state = address.prefecture
                    this.edit.address = address.street
                }
            })
        },
        industryFilter(item, queryText, itemText) {
            const hasValue = val => (val != null ? val : '')

            const text = hasValue(itemText)
            const query = hasValue(queryText)

            return (
                text
                    .toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1 ||
                item.code.toLowerCase().indexOf(query.toString().toLowerCase()) > -1
            )
        },
        countryFilter(item, queryText, itemText) {
            const hasValue = val => (val != null ? val : '')

            const text = hasValue(itemText)
            const query = hasValue(queryText)

            return (
                text
                    .toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1 ||
                item.id.toLowerCase().indexOf(query.toString().toLowerCase()) > -1
            )
        },
    },
}
</script>

<template>
    <v-layout row wrap align-start justify-center>
        <v-flex sm12 md6 class="px-1">
            <v-form
                v-if="!getCompany.isActive"
                v-model="valid"
                @submit.prevent="save.run()"
                ref="form"
            >
                <v-card>
                    <v-card-title primary-title class="px-3 pt-3 pb-0">
                        <h2 class="title font-weight-regular text-capitalize">
                            {{ 'company info' | translate }}
                        </h2>
                    </v-card-title>
                    <v-container fluid grid-list-md class="pa-3">
                        <v-layout row wrap>
                            <v-flex xs12 sm12 md6>
                                <v-text-field
                                    v-model="edit.name"
                                    class="text-capitalize"
                                    :label="'company name' | translate"
                                    :rules="rules.name"
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6 v-if="edit.country == 'JP'">
                                <v-text-field
                                    v-model="edit.name_katakana"
                                    class="text-capitalize"
                                    :label="'katakana' | translate"
                                    :rules="rules.katakana"
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs12 sm12 md6>
                                <v-select
                                    v-model="edit.size"
                                    class="text-capitalize"
                                    :items="companySizes"
                                    :label="'company size' | translate"
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6 v-if="edit.country == 'JP'">
                                <v-autocomplete
                                    v-if="!edit.industry_id || m_industry"
                                    v-model="top_industry"
                                    dense
                                    clearable
                                    id="input-account-company-industry"
                                    class="text-capitalize"
                                    :label="'top industry category' | translate"
                                    :items="top_industries"
                                    item-text="title"
                                    item-value="id"
                                    :filter="industryFilter"
                                />
                                <v-autocomplete
                                    v-else
                                    v-model="edit.industry_id"
                                    dense
                                    clearable
                                    class="text-capitalize"
                                    :label="'industry category' | translate"
                                    :items="s_industries"
                                    item-text="title"
                                    item-value="id"
                                    :filter="industryFilter"
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout
                            row
                            wrap
                            v-if="edit.country == 'JP' && (top_industry || m_industry)"
                        >
                            <v-flex xs12 sm12 md6 v-if="top_industry">
                                <v-autocomplete
                                    v-model="m_industry"
                                    dense
                                    clearable
                                    class="text-capitalize"
                                    :label="'industry category' | translate"
                                    :items="m_industries"
                                    item-text="title"
                                    item-value="id"
                                    :filter="industryFilter"
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6 v-if="m_industry">
                                <v-autocomplete
                                    v-model="edit.industry_id"
                                    dense
                                    clearable
                                    class="text-capitalize"
                                    :label="'industry category' | translate"
                                    :items="s_industries"
                                    item-text="title"
                                    item-value="id"
                                    :filter="industryFilter"
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs12 sm12 md6>
                                <v-text-field
                                    v-model="edit.zip"
                                    class="text-capitalize"
                                    :label="'zip code' | translate"
                                    @input="getPostalCode(edit.zip)"
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6>
                                <v-autocomplete
                                    v-model="edit.country"
                                    dense
                                    clearable
                                    id="input-account-company-country"
                                    class="text-capitalize"
                                    :label="'country' | translate"
                                    :items="countries"
                                    :item-text="$root.lang"
                                    item-value="id"
                                    :filter="countryFilter"
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs12 sm12 md6>
                                <v-text-field
                                    v-model="edit.state"
                                    class="text-capitalize"
                                    :label="'prefecture' | translate"
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6>
                                <v-text-field
                                    v-model="edit.city"
                                    class="text-capitalize"
                                    :label="'city' | translate"
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs12 sm12 md6>
                                <v-text-field
                                    v-model="edit.address"
                                    class="text-capitalize"
                                    :label="'address' | translate"
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6>
                                <v-text-field
                                    v-model="edit.other"
                                    class="text-capitalize"
                                    :label="'other' | translate"
                                />
                            </v-flex>
                        </v-layout>
                        <v-card-title class="pa-0">
                            <h2 class="title font-weight-regular text-capitalize">
                                {{ 'fiscal year' | translate }}
                            </h2>
                        </v-card-title>
                        <v-layout row wrap>
                            <v-flex xs12 sm12 md6>
                                <v-select
                                    v-model="edit.fiscal_start"
                                    class="text-capitalize"
                                    :items="month_items"
                                    :label="'starts on' | translate"
                                    :rules="rules.fiscal_start"
                                    clearable
                                />
                            </v-flex>
                            <v-flex xs12 sm12 md6>
                                <v-select
                                    v-model="edit.fiscal_end"
                                    class="text-capitalize"
                                    :items="month_items"
                                    :label="'ends on' | translate"
                                    :rules="rules.fiscal_end"
                                    clearable
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>

                    <v-card-actions class="pb-3 px-3 pt-0">
                        <v-spacer />
                        <v-tooltip max-width="300" bottom>
                            <v-btn
                                slot="activator"
                                flat
                                dark
                                class="primary"
                                type="submit"
                                :disabled="save.isActive"
                                :loadin="save.isActive"
                            >
                                {{ 'save' | translate }}
                            </v-btn>
                            <span>{{ 'Click to save your company details.' | translate }}</span>
                        </v-tooltip>
                    </v-card-actions>
                </v-card>
                <v-snackbar v-if="showSuccess" v-model="showSuccess">
                    {{ 'Account details saved successfully' | translate }}
                </v-snackbar>
            </v-form>
            <div v-else class="text-center"><spinner /></div>
        </v-flex>
    </v-layout>
</template>
