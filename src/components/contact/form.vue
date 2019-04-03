<script>
import { mapState, mapActions } from 'vuex'
import omit from 'lodash/omit'

import capitalize from '@/utils/capitalize'
import ContactInput from '@/components/cost/contactInput'

export default {
    components: {
        ContactInput,
    },
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
        append(string1, string2) {
            return String(string1) + String(string2)
        },
    },
    data() {
        return {
            contact: {
                name: '',
                email: '',
                status: 'new',
                name_katakana: null,
                birthday: null,
                website: null,
                phone: null,
                is_company: false,
                accepts_marketing: false,
                meta: [],
                notes: null,
            },
            sending: false,
            dialog: false,
            valid: false,
            rules: {
                name: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 150) ||
                        this.$t('Name must be at most 150 characters long'),
                ],
                katakana: [
                    v => {
                        const pattern = /^[ア-ン゛゜ァ-ォャ-ョー「」、]+$/
                        return !v || pattern.test(v) || this.$t('Please input katakana only')
                    },
                ],
                email: [
                    v => {
                        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                        return !v || pattern.test(v) || this.$t('Must be a valid email')
                    },
                ],
            },
            statuses: ['new', 'subscriber', 'lead', 'opportunity', 'customer', 'fan', 'other'],
        }
    },

    computed: {
        ...mapState({
            industries: state => state.account.industries,
        }),
        locale() {
            return this.$root.lang == 'en' ? 'en-us' : 'ja-jp'
        },
    },

    mounted() {
        //do something after mounting vue instance
        if (!this.industries.length) {
            this.$store.dispatch('getIndustries')
        }
    },

    created() {
        if (this.data.id) {
            this.contact = Object.assign({}, this.data)
        }
    },

    methods: {
        ...mapActions(['resetError', 'createContact', 'updateContact', 'getContacts']),
        _handleError() {
            this.sending = false
        },

        tryToSave: function() {
            if (this.contact.id) {
                return this.tryToUpdate()
            }
            return this.tryToCreate()
        },

        tryToCreate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.createContact(omit(this.contact, ['company']))
                .then(data => {
                    this.sending = false
                    this.$refs.form.reset()
                    this.$emit('created', data && data.contact)
                    this.getContacts()
                    return true
                })
                .catch(this._handleError)
        },

        tryToUpdate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.updateContact(this.contact)
                .then(() => {
                    this.sending = false
                    this.$emit('saved', true)
                    this.getContacts()
                })
                .catch(this._handleError)
        },

        translateValues(values) {
            return values.map(value => {
                let str = this.$t(value)
                return {
                    text: capitalize(str),
                    value: value,
                }
            })
        },

        handleStatusChange(status) {
            // set `accepts_marketing` automatically for status === 'subscriber'
            if (status === 'subscriber') {
                // check
                this.contact.accepts_marketing = true
            }
        },
        onCompanyChange(companyContact) {
            this.contact.company_id = (companyContact && companyContact.id) || null
        },
    },
}
</script>

<template>
    <v-form v-model="valid" @submit.prevent="tryToSave" ref="form">
        <v-card>
            <v-toolbar light>
                <v-btn icon @click="$emit('close')"><v-icon>close</v-icon></v-btn>
                <v-toolbar-title>
                    <span v-if="!contact.id" class="title font-weight-regular text-capitalize pb-0">
                        {{ 'contact' | translate }} | {{ 'add new record' | translate }}
                    </span>
                    <span v-else class="title font-weight-regular text-capitalize pb-0">
                        {{ 'contact' | translate }} | {{ 'update record' | translate }}
                    </span>
                </v-toolbar-title>
                <v-spacer />
                <v-tooltip max-width="300" left class="mb-0">
                    <v-btn slot="activator" :disabled="sending" type="submit" class="primary mr-0">
                        <v-icon class="mr-1">save</v-icon>
                        {{ 'save' | translate }}
                    </v-btn>
                    <span>{{ 'Save your record details.' | translate }}</span>
                </v-tooltip>
            </v-toolbar>
            <div class="progress-bar">
                <v-progress-linear
                    v-if="sending"
                    color="indigo"
                    height="5"
                    class="ma-0"
                    indeterminate
                />
            </div>
            <v-card-text>
                <v-container fluid grid-list-lg class="pa-0">
                    <v-layout wrap row fill-height class="pa-0 ma-0">
                        <v-flex xs12 sm6 md8>
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <v-switch
                                        :label="'company contact' | translate"
                                        v-model="contact.is_company"
                                        class="text-capitalize"
                                    ></v-switch>
                                </v-flex>
                                <v-flex xs12 sm12 md4 v-if="!contact.is_company">
                                    <v-text-field
                                        :label="'last name' | translate | append(' *')"
                                        :maxlength="50"
                                        :rules="rules.name"
                                        counter
                                        required
                                        v-model="contact.last_name"
                                        prepend-icon="title"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 sm12 md4 v-if="!contact.is_company">
                                    <v-text-field
                                        :label="'first name' | translate | append(' *')"
                                        :maxlength="50"
                                        :rules="rules.name"
                                        counter
                                        required
                                        v-model="contact.first_name"
                                        prepend-icon="title"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 sm12 md4 v-if="contact.is_company">
                                    <v-text-field
                                        id="name"
                                        :label="'company name' | translate | append(' *')"
                                        :maxlength="50"
                                        :rules="rules.name"
                                        counter
                                        required
                                        v-model="contact.name"
                                        prepend-icon="title"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 sm12 md4>
                                    <v-text-field
                                        id="namek"
                                        :label="'katakana' | translate"
                                        :rules="rules.katakana"
                                        :maxlength="50"
                                        counter=""
                                        v-model="contact.name_katakana"
                                        prepend-icon="title"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 sm12 md4>
                                    <v-text-field
                                        :label="'email' | translate"
                                        :rules="rules.email"
                                        :maxlength="50"
                                        type="email"
                                        required
                                        v-model="contact.email"
                                        prepend-icon="@"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 sm12 md4>
                                    <v-text-field
                                        :label="'phone' | translate"
                                        :rules="rules.phone"
                                        v-model="contact.phone"
                                        prepend-icon="phone"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 sm12 md4 v-if="!contact.is_company">
                                    <v-dialog
                                        ref="dialog"
                                        v-model="dialog"
                                        :return-value.sync="contact.birthday"
                                        persistent
                                        lazy
                                        full-width
                                        width="290px"
                                    >
                                        <v-text-field
                                            slot="activator"
                                            v-model="contact.birthday"
                                            class="text-capitalize"
                                            :label="'birthday' | translate"
                                            prepend-icon="event"
                                            readonly
                                            clearable
                                        />
                                        <v-date-picker
                                            v-model="contact.birthday"
                                            scrollable
                                            :locale="locale"
                                        >
                                            <v-spacer />
                                            <v-btn flat color="primary" @click="dialog = false">
                                                {{ 'cancel' | translate }}
                                            </v-btn>
                                            <v-btn
                                                flat
                                                class="primary"
                                                @click="$refs.dialog.save(contact.birthday)"
                                            >
                                                OK
                                            </v-btn>
                                        </v-date-picker>
                                    </v-dialog>
                                </v-flex>
                                <v-flex xs12 sm12 md4 v-if="contact.is_company">
                                    <v-autocomplete
                                        v-model="contact.industry_id"
                                        dense
                                        clearable
                                        class="text-capitalize"
                                        :label="'industry category' | translate"
                                        :items="industries"
                                        item-text="title"
                                        item-value="id"
                                        prepend-icon="business"
                                        hide-details
                                    />
                                </v-flex>
                                <v-flex xs12 md4>
                                    <v-text-field
                                        :label="'website' | translate"
                                        v-model="contact.website"
                                        type="url"
                                        prepend-icon="http"
                                        class="text-capitalize"
                                    />
                                </v-flex>
                                <v-flex xs12 md4>
                                    <v-select
                                        v-model="contact.language"
                                        :items="[
                                            { text: 'English', value: 'en' },
                                            { text: '日本語', value: 'ja' },
                                        ]"
                                        :label="'preferred language' | translate"
                                        prepend-icon="language"
                                        class="text-capitalize"
                                        hide-details
                                    ></v-select>
                                </v-flex>
                                <v-flex xs12 md4 v-if="!contact.is_company">
                                    <p class="text-capitalize mb-0">{{ 'gender' | translate }}</p>
                                    <v-radio-group
                                        v-model="contact.gender"
                                        class="mt-1"
                                        hide-details
                                        row
                                    >
                                        <v-radio :label="'male' | translate" value="male"></v-radio>
                                        <v-radio
                                            :label="'female' | translate"
                                            value="female"
                                        ></v-radio>
                                    </v-radio-group>
                                </v-flex>
                                <v-flex xs12>
                                    <v-checkbox
                                        :label="'This contact is a Vendor' | translate"
                                        v-model="contact.is_vendor"
                                        class="my-2"
                                        hide-details
                                    />
                                </v-flex>
                            </v-layout>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-card flat light class="pa-3 grey lighten-3">
                                <contact-input
                                    :label="'Related company' | translate"
                                    v-model="contact.company"
                                    :filter="contact => contact.is_company"
                                    @input="onCompanyChange"
                                />
                                <v-select
                                    v-model="contact.status"
                                    :items="translateValues(statuses)"
                                    class="text-capitalize"
                                    :label="'contact status' | translate"
                                    required
                                    @change="handleStatusChange"
                                />
                                <v-checkbox
                                    :label="'accepts marketing' | translate"
                                    v-model="contact.accepts_marketing"
                                    class="text-capitalize"
                                />
                                <v-combobox
                                    v-model="contact.tags"
                                    :items="contact.tags"
                                    :label="'tags' | translate"
                                    multiple
                                    chips
                                    class="text-capitalize"
                                />
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
        </v-card>
    </v-form>
</template>
