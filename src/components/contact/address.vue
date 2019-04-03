<script>
import { mapActions } from 'vuex'

import postal_code from 'japan-postal-code'
import countries from '@/countries.json'
import KConfirm from '@/components/confirm'

export default {
    name: 'ContactAddress',
    components: {
        KConfirm,
    },
    props: {
        contact: {
            type: Object,
            required: true,
        },
    },
    data() {
        const { addresses } = this.contact
        return {
            isEdit: false,
            edit: {},
            countries,
            addresses: addresses || [],
            editIndex: null,
            valid: false,
            rules: {
                role: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        !this.addresses.some(a => a.id !== this.edit.id && a.role == v) ||
                        this.$t('This label is already taken.'),
                ],
            },
        }
    },
    watch: {
        contact(contact) {
            this.addresses = [...contact.addresses]
        },
    },
    computed: {
        roles() {
            return [this.$t('main'), this.$t('work'), this.$t('home'), this.$t('other')]
        },
    },
    tasks(t) {
        return {
            load: t(async function() {
                this.addresses = await this.getContactAddresses(this.contact.id)
            }).flow('drop'),
            save: t(async function() {
                if (!this.$refs.form.validate()) return Promise.resolve(false)
                if (this.edit.id) {
                    await this.updateContactAddress({
                        ...this.edit,
                        contactId: this.contact.id,
                    })
                } else {
                    await this.createContactAddress({
                        ...this.edit,
                        contactId: this.contact.id,
                    })
                }
                this.addresses = await this.getContactAddresses(this.contact.id)
                this.isEdit = false
            }).flow('drop'),
            remove: t(async function(address) {
                await this.deleteContactAddress({ ...address, contactId: this.contact.id })
                this.addresses = await this.getContactAddresses(this.contact.id)
                this.isEdit = false
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions([
            'getContactAddresses',
            'createContactAddress',
            'updateContactAddress',
            'deleteContactAddress',
        ]),
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
        getPostalCode(zip) {
            if (this.edit.country != 'JP') return
            postal_code.get(zip, address => {
                if (address) {
                    this.edit.city = address.city
                    this.edit.state = address.prefecture
                    if (!this.edit.street) {
                        this.edit.street = address.street
                    }
                }
            })
        },
        change(address = { country: 'JP', role: this.$t('main') }) {
            this.edit = { ...address }
            this.isEdit = true
        },
        getCountryCaption(countryCode) {
            const country = this.countries.find(c => c.id == countryCode)
            return country && country[this.$root.lang]
        },
    },
}
</script>
<template>
    <div>
        <v-list three-line v-if="addresses && addresses.length">
            <v-list-tile avatar v-for="address in addresses" :key="address.id">
                <v-list-tile-action>
                    <v-btn flat icon @click="change(address)"><v-icon>edit</v-icon></v-btn>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title> {{ address.postcode }} </v-list-tile-title>
                    <v-list-tile-sub-title>
                        {{ getCountryCaption(address.country) }} {{ address.state }}
                        {{ address.city }} {{ address.street }} {{ address.other }}
                        <a href="tel:address.phone">{{ address.phone }}</a>
                    </v-list-tile-sub-title>
                    <v-list-tile-sub-title class="warning--text">
                        {{ address.role | translate }}
                    </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <k-confirm
                        title="Delete this record?"
                        question="This action cannot be undone. The record will be permanently deleted."
                        :max-width="500"
                        @confirm="remove.run(address)"
                    >
                        <v-btn flat icon slot="button" color="danger" :loading="remove.isActive">
                            <v-icon>delete</v-icon>
                        </v-btn>
                    </k-confirm>
                </v-list-tile-action>
            </v-list-tile>
        </v-list>
        <v-list-tile v-if="!addresses || addresses.length < 3" avatar @click="change()" ripple>
            <v-list-tile-content>
                <v-list-tile-title class="text-capitalize">
                    {{ 'add new record' | translate }}
                </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action class="mr-1">
                <v-btn icon ripple outline small color="primary">
                    <v-icon small>add</v-icon>
                </v-btn>
            </v-list-tile-action>
        </v-list-tile>
        <k-dialog v-model="isEdit" persistent max-width="600" lazy>
            <v-form v-if="isEdit" v-model="valid" @submit.prevent="save.run()" ref="form">
                <v-card>
                    <v-card-title class="title text-capitalize">
                        {{ 'address' | translate }}&nbsp;|&nbsp;
                        <span v-if="edit.id">{{ 'update record' | translate }}</span>
                        <span v-else>{{ 'add new record' | translate }}</span>
                        <v-spacer />
                        <v-btn flat small icon @click="isEdit = false" class="ma-0">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class="pt-0">
                        <v-container grid-list-lg class="mx-0 mb-0 pa-0">
                            <v-layout row wrap>
                                <v-flex xs12 sm6 md4>
                                    <v-combobox
                                        v-model="edit.role"
                                        :items="roles"
                                        :label="'label' | translate"
                                        :rules="rules.role"
                                        class="first-capitalize"
                                        :menu-props="{ contentClass: 'first-capitalize' }"
                                    >
                                        <template slot="selection" slot-scope="{ item }">
                                            <span class="first-capitalize">{{ item }}</span>
                                        </template>
                                    </v-combobox>
                                </v-flex>
                                <v-flex xs12 sm6 md4>
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
                                        :disabled="save.isActive"
                                        :filter="countryFilter"
                                    />
                                </v-flex>
                                <v-flex xs12 sm6 md4>
                                    <v-text-field
                                        v-model="edit.postcode"
                                        class="text-capitalize"
                                        :label="'zip code' | translate"
                                        :disabled="save.isActive"
                                        @input="getPostalCode(edit.postcode)"
                                        @paste="getPostalCode(edit.postcode)"
                                    />
                                </v-flex>

                                <v-flex xs12 sm6>
                                    <v-text-field
                                        v-model="edit.state"
                                        class="text-capitalize"
                                        :label="'prefecture' | translate"
                                        :disabled="save.isActive"
                                    />
                                </v-flex>
                                <v-flex xs12 sm6>
                                    <v-text-field
                                        v-model="edit.city"
                                        class="text-capitalize"
                                        :label="'city' | translate"
                                        :disabled="save.isActive"
                                    />
                                </v-flex>

                                <v-flex xs12 sm6>
                                    <v-text-field
                                        v-model="edit.street"
                                        class="text-capitalize"
                                        :label="'street' | translate"
                                        :disabled="save.isActive"
                                    />
                                </v-flex>
                                <v-flex xs12 sm6>
                                    <v-text-field
                                        v-model="edit.other"
                                        class="text-capitalize"
                                        :label="'further divisions' | translate"
                                        :disabled="save.isActive"
                                    />
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions class="pt-0 px-3 pb-3">
                        <v-spacer />
                        <v-btn color="primary" class="ma-0" type="submit" :loading="save.isActive">
                            {{ 'save' | translate }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </k-dialog>
    </div>
</template>
<style lang="scss" scoped></style>
