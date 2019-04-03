<script>
import { mapActions } from 'vuex'

import KDialog from '@/components/dialog'
import ContactInput from '@/components/cost/contactInput'

export default {
    components: { KDialog, ContactInput },
    props: ['displayContact', 'contactId', 'contactKey', 'revert', 'title', 'icon'],
    data() {
        return {
            showForm: false,
            selectedContact: null,
        }
    },
    computed: {
        filterContacts() {
            return this.contactKey == 'company_id' && !this.revert
                ? contact => contact.is_company
                : contact => !contact.is_company
        },
    },
    tasks(t) {
        return {
            save: t(async function() {
                const { id } = this.selectedContact || {}
                const params = this.revert
                    ? {
                          id,
                          key: this.contactKey,
                          parentId: this.contactId,
                      }
                    : {
                          id: this.contactId,
                          key: this.contactKey,
                          parentId: id,
                      }
                await this.linkContacts(params)
                this.showForm = false
                this.$emit('saved', this.selectedContact)
            }).flow('drop'),
            remove: t(async function() {
                const { id } = this.displayContact || {}
                const params = this.revert
                    ? {
                          id,
                          key: this.contactKey,
                          parentId: null,
                      }
                    : {
                          id: this.contactId,
                          key: this.contactKey,
                          parentId: null,
                      }
                await this.linkContacts(params)
                this.showForm = false
                this.selectedContact = null
                this.$emit('saved', this.selectedContact)
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions(['linkContacts']),
    },
}
</script>
<template>
    <div>
        <v-list-tile v-if="displayContact" class="py-1">
            <v-list-tile-avatar>
                <v-icon>{{ icon }}</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
                <v-list-tile-title>
                    <router-link
                        :to="{
                            name: 'contacts',
                            params: {
                                id: displayContact.id,
                            },
                        }"
                    >
                        {{ displayContact.name }} {{ displayContact.first_name }}
                        {{ displayContact.last_name }}
                    </router-link>
                </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action @click="remove.run()" class="shrink">
                <v-btn icon ripple :loading="remove.isActive">
                    <v-icon color="danger">close</v-icon>
                </v-btn>
            </v-list-tile-action>
        </v-list-tile>
        <v-list-tile v-else avatar @click="showForm = true" ripple>
            <v-list-tile-content>
                <v-list-tile-title class="text-capitalize">
                    {{ 'associate contact' | translate }}
                </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action class="mr-1">
                <v-btn icon ripple outline small color="primary">
                    <v-icon small>add</v-icon>
                </v-btn>
            </v-list-tile-action>
        </v-list-tile>
        <k-dialog
            lazy
            persistent
            v-model="showForm"
            transition="dialog-bottom-transition"
            max-width="500"
        >
            <v-card v-if="showForm">
                <v-card-title class="title text-capitalize">
                    <span>{{ 'associate contact' | translate }}</span>
                    <v-spacer />
                    <v-btn flat small icon @click="showForm = false" class="ma-0">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pt-0">
                    <v-layout row wrap>
                        <v-flex xs12>
                            <contact-input
                                :label="'Select' | translate"
                                v-model="selectedContact"
                                :is_company="true"
                                :filter="filterContacts"
                            />
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions class="pt-0 px-3 pb-3">
                    <v-spacer />
                    <v-btn flat @click.native="showForm = false">
                        {{ 'cancel' | translate }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        @click.native="save.run()"
                        :disabled="!selectedContact || save.isActive"
                        :loading="save.isActive"
                    >
                        {{ 'save' | translate }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </k-dialog>
    </div>
</template>
<style lang="scss" scoped></style>
