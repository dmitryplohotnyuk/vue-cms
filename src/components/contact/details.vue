<script>
import { mapState, mapActions } from 'vuex'

import ContactForm from '@/components/contact/form'
import KConfirm from '@/components/confirm'
import LinkedContact from '@/components/contact/linkedContact'
import ContactSns from '@/components/contact/sns'
import ContactAddress from '@/components/contact/address'
import KDialog from '@/components/dialog'

export default {
    name: 'Details',
    components: {
        KDialog,
        KConfirm,
        ContactForm,
        LinkedContact,
        ContactSns,
        ContactAddress,
    },
    props: {
        id: {
            type: String,
        },
    },
    filters: {
        url: function(value) {
            if (!value) return ''
            value = value.toString()
            return value.startsWith('http://') || value.startsWith('https://')
                ? value
                : 'http://' + value
        },
    },
    data() {
        return {
            contact: {},
            email: null,
            showProjectAddSuccess: false,
            showProjectRemoveSuccess: false,
            showMemberAddSuccess: false,
            showMemberRemoveSuccess: false,
            showForm: false, // show contact form dialog
            showImageForm: false,
            birthdayDialog: false,
            contactData: {},
            editNotes: false, // notes inline edit flag
        }
    },

    computed: {
        ...mapState({
            user: state => state.account.user,
            project: state => state.projects.current,
            industries: state => state.account.industries,
        }),
        currency() {
            return this.$store.getters.currency
        },
        isOwner() {
            return this.contact.user_id == this.user.id
        },
        locale() {
            return this.$root.lang == 'en' ? 'en-us' : 'ja-jp'
        },
        historyEntries() {
            return [
                { key: 'last_contact_at', caption: this.$t('Contacted') },
                { key: 'registered_at', caption: this.$t('Registered') },
                { key: 'created_at', caption: this.$t('Contact created') },
                { key: 'deleted_at', caption: this.$t('Contact deleted') },
                { key: 'updated_at', caption: this.$t('Contact updated') },
                { key: 'last_visited_at', caption: this.$t('Last visited at') },
                { key: 'trial_ends_at', caption: this.$t('Trial ended') },
            ]
                .map(({ key, caption }) => ({
                    key,
                    caption,
                    date: this.contact[key],
                }))
                .filter(({ date }) => !!date)
                .sort((a, b) => (a.date > b.date ? -1 : 1))
        },
        sns() {
            return (
                (this.contactData &&
                    this.contactData.meta &&
                    !Array.isArray(this.contactData.meta.social) &&
                    this.contactData.meta.social) ||
                {}
            )
        },
        contact_name() {
            let c = this.contact
            if (c.is_company) {
                return c.name || c.email
            }
            if (c.last_name || c.first_name) {
                return this.$root.lang == 'ja'
                    ? c.last_name + ' ' + c.first_name
                    : c.first_name + ' ' + c.last_name
            }
            return c.name || c.email
        },
    },

    watch: {
        contact() {
            this.contactData = { ...this.contact }
        },
    },

    mounted() {
        if (!this.id) return this.$router.push({ name: 404 })
        if (this.id != this.contact.id) {
            this.load.run()
        }
        if (!this.industries.length) {
            this.$store.dispatch('getIndustries')
        }
    },

    tasks(t) {
        return {
            load: t(async function() {
                this.startLoading()
                this.contact = await this.getContact(this.id)
                this.finishLoading()
            }).flow('drop'),
            refresh: t(async function() {
                this.contact = await this.getContact(this.id)
            }).flow('drop'),
            remove: t(async function() {
                await this.deleteContact(this.id)
                this.$router.push('/contacts')
            }).flow('drop'),
            update: t(async function(contactData) {
                await this.updateContact(contactData)
                this.contact = await this.getContact(this.id)
            }).flow('drop'),
        }
    },

    methods: {
        ...mapActions([
            'resetError',
            'getContacts',
            'getContact',
            'deleteContact',
            'updateContact',
            'getProjects',
            'startLoading',
            'finishLoading',
        ]),
        noop() {},
        saveSNS(social) {
            const meta = this.contactData.meta
                ? {
                      ...this.contactData.meta,
                      social,
                  }
                : { social }
            this.contactData = { ...this.contactData, meta }
            this.save()
        },
        save() {
            this.update.run({ ...this.contact, ...this.contactData })
        },
        afterSave() {
            this.showForm = false
            this.refresh.run()
        },
        addContact() {
            this.$emit('edit', { source: 'kinchaku' })
        },
    },
}
</script>

<template>
    <div>
        <k-dialog
            lazy
            persistent
            v-model="showForm"
            transition="dialog-bottom-transition"
            max-width="1200"
        >
            <contact-form
                v-if="showForm"
                :data="contact"
                @close="showForm = false"
                @saved="afterSave"
            />
        </k-dialog>
        <v-layout row wrap>
            <v-flex xs12 md12>
                <v-toolbar
                    :class="{ 'blue-grey lighten-5': !$root.dark }"
                    class="v-toolbar__content--nopadding px-3"
                    flat
                >
                    <router-link v-if="id" to="/contacts" class="hidden-xs-only">
                        <v-tooltip max-width="300" bottom v-if="id">
                            <v-btn icon slot="activator" to="/contacts">
                                <v-icon>arrow_back</v-icon>
                            </v-btn>
                            <span class="text-capitalize">{{ 'contact list' | translate }}</span>
                        </v-tooltip>
                    </router-link>
                    <v-toolbar-title class="text-capitalize">
                        {{ 'contact details' | translate }}
                    </v-toolbar-title>
                    <v-spacer />
                    <v-tooltip max-width="300" left>
                        <v-btn
                            icon
                            dense
                            flat
                            slot="activator"
                            open-delay="300"
                            class="primary ma-0"
                            @click="addContact"
                        >
                            <v-icon>add</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'add new record' | translate }}</span>
                    </v-tooltip>
                </v-toolbar>
            </v-flex>
        </v-layout>
        <v-container grid-list-lg fill-height fluid class="pa-3">
            <v-layout row wrap>
                <v-flex xs12 md4>
                    <v-toolbar color="indigo" dark class="mb-0 v-toolbar__content--nopadding px-3">
                        <v-toolbar-side-icon disabled>
                            <v-icon v-if="contact.is_company">business</v-icon>
                            <v-icon v-else>person</v-icon>
                        </v-toolbar-side-icon>
                        <v-toolbar-title>
                            <span class="title text-capitalize">{{ contact_name }}</span>
                        </v-toolbar-title>
                        <v-spacer />
                        <v-tooltip max-width="300" open-delay="500" bottom>
                            <v-btn icon @click="showForm = true" slot="activator">
                                <v-icon>edit</v-icon>
                            </v-btn>
                            <span class="text-capitalize">{{ 'edit contact' | translate }}</span>
                        </v-tooltip>
                    </v-toolbar>
                    <v-card>
                        <v-card-actions class="ma-0 pa-3">
                            <v-tooltip
                                v-if="contact.status"
                                max-width="300"
                                open-delay="500"
                                bottom
                            >
                                <v-chip
                                    label
                                    outline
                                    default
                                    slot="activator"
                                    disabled
                                    class="text-capitalize ml-0 my-0"
                                >
                                    {{ contact.status | translate }}
                                </v-chip>
                                <span class="text-capitalize"> {{ 'status' | translate }} </span>
                            </v-tooltip>

                            <v-tooltip max-width="300" open-delay="500" bottom>
                                <v-chip
                                    label
                                    outline
                                    default
                                    slot="activator"
                                    :color="contact.accepts_marketing ? 'teal' : 'red'"
                                    disabled
                                    class="text-capitalize ml-0 my-0"
                                >
                                    <v-icon
                                        left
                                        :color="contact.accepts_marketing ? 'teal' : 'red'"
                                    >
                                        send
                                    </v-icon>
                                    <span class="text-capitalize">
                                        {{ 'newsletters' | translate }}
                                    </span>
                                </v-chip>
                                <span v-if="contact.accepts_marketing" class="text-capitalize">
                                    {{ 'accepts marketing' | translate }}
                                </span>
                                <span v-else class="text-capitalize">
                                    {{ 'doesn`t accept marketing' | translate }}
                                </span>
                            </v-tooltip>

                            <v-tooltip
                                max-width="300"
                                open-delay="500"
                                bottom
                                v-if="contact.is_vendor"
                            >
                                <v-chip
                                    label
                                    outline
                                    default
                                    slot="activator"
                                    color="warning"
                                    disabled
                                    class="text-capitalize ml-0 my-0"
                                >
                                    {{ 'vendor' | translate }}
                                </v-chip>
                                <span class="text-capitalize"> {{ 'vendor' | translate }} </span>
                            </v-tooltip>
                        </v-card-actions>

                        <div style="cursor: pointer;">
                            <k-dialog
                                lazy
                                persistent
                                v-model="showImageForm"
                                fullscreen
                                hide-overlay
                                transition="dialog-bottom-transition"
                                max-width="400"
                            >
                                <v-card>
                                    <v-card-title class="title text-capitalize">
                                        <span>{{ 'edit image' | translate }}</span>
                                        <v-spacer />
                                        <v-btn
                                            flat
                                            small
                                            icon
                                            @click="showImageForm = false"
                                            class="ma-0"
                                        >
                                            <v-icon>close</v-icon>
                                        </v-btn>
                                    </v-card-title>
                                    <v-img
                                        v-if="contactData.contact_image"
                                        cover
                                        :src="contactData.contact_image"
                                        height="200px"
                                    />
                                    <v-card-text>
                                        <v-layout row wrap>
                                            <v-flex xs12>
                                                <v-text-field
                                                    v-model="contactData.contact_image"
                                                    type="url"
                                                    :label="'image URL' | translate"
                                                    class="text-capitalize"
                                                    autofocus
                                                />
                                            </v-flex>
                                        </v-layout>
                                    </v-card-text>
                                    <v-card-actions class="pt-0 px-3 pb-3">
                                        <v-spacer />
                                        <v-btn
                                            flat
                                            @click.native="
                                                contactData.contact_image = contact.contact_image
                                                showImageForm = false
                                            "
                                        >
                                            {{ 'cancel' | translate }}
                                        </v-btn>
                                        <v-btn
                                            color="primary"
                                            dark
                                            :loading="update.isActive"
                                            @click.native="
                                                save()
                                                showImageForm = false
                                            "
                                        >
                                            {{ 'save' | translate }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </k-dialog>
                            <v-img
                                v-if="contactData.contact_image"
                                contain
                                :src="contactData.contact_image"
                                height="200px"
                                @click="showImageForm = true"
                            />
                            <v-layout v-else align-center justify-space-around wrap column>
                                <v-avatar
                                    color="grey lighten-1"
                                    class="ma-3"
                                    size="80"
                                    @click="showImageForm = true"
                                >
                                    <v-icon size="48" dark>image</v-icon>
                                </v-avatar>
                            </v-layout>
                        </div>
                        <v-card-text class="px-0">
                            <v-chip
                                v-if="contact.subscribed"
                                small
                                dark
                                disabled
                                color="cyan"
                                text-color="white"
                                class="text-capitalize ml-0 my-0"
                            >
                                <v-avatar><v-icon>check_circle</v-icon></v-avatar>
                                {{ 'subscribed' | translate }}
                            </v-chip>
                            <v-list two-line class="py-0">
                                <v-list-tile v-if="contact.name_katakana">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'katakana' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ contact.name_katakana }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>

                                <v-divider v-if="contact.email" />

                                <v-list-tile v-if="contact.email">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'email' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            <a :href="`mailto:${contact.email}`">
                                                {{ contact.email }}
                                            </a>
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>

                                <v-divider v-if="contact.phone" />

                                <v-list-tile v-if="contact.phone">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'phone' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            <a :href="`tel:${contact.phone}`">
                                                {{ contact.phone }}
                                            </a>
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>

                                <v-divider />
                            </v-list>
                        </v-card-text>
                        <v-list class="pa-0" light>
                            <v-list-group prepend-icon="location_on">
                                <v-list-tile slot="activator">
                                    <v-list-tile-content>
                                        <v-list-tile-title class="text-capitalize">
                                            {{ 'address' | translate }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <contact-address :contact="contact" />
                            </v-list-group>
                        </v-list>
                        <v-list class="pa-0" light>
                            <v-list-group prepend-icon="info_outline">
                                <v-list-tile slot="activator">
                                    <v-list-tile-content>
                                        <v-list-tile-title class="text-capitalize">
                                            {{ 'extra info' | translate }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.birthday" class="py-1 mt-1">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'birthday' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ contact.birthday }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.gender" class="py-1">
                                    <v-list-tile-content class="text-capitalize">
                                        <v-list-tile-sub-title class="grey--text">
                                            {{ 'gender' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ contact.gender | translate }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.website" class="py-1">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'website' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            <a
                                                target="_blank"
                                                rel="nofollow noopener noreferrer"
                                                :href="contact.website | url"
                                            >
                                                {{ contact.website }}
                                            </a>
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.language" class="py-1">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'preferred language' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            <span v-if="contact.language == 'ja'">日本語</span>
                                            <span v-else>English</span>
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.source" class="py-1">
                                    <v-list-tile-content class="text-capitalize">
                                        <v-list-tile-sub-title class="grey--text">
                                            {{ 'contact source' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ contact.source }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.created_at" class="py-1">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'created at' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ contact.created_at }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile v-if="contact.updated_at" class="py-1">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="text-capitalize grey--text">
                                            {{ 'updated at' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ contact.updated_at }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list-group>
                        </v-list>
                        <v-list class="pa-0" light>
                            <v-list-group prepend-icon="group">
                                <v-list-tile slot="activator">
                                    <v-list-tile-content>
                                        <v-list-tile-title class="text-capitalize">
                                            {{ 'associated contacts' | translate }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>

                                <div v-if="!contact.is_company">
                                    <v-subheader class="text-capitalize">
                                        <v-flex class="px-0">
                                            {{ 'related company' | translate }}
                                        </v-flex>
                                    </v-subheader>
                                    <linked-contact
                                        icon="business"
                                        :displayContact="contact.company"
                                        :contactId="contact.id"
                                        contactKey="company_id"
                                        @saved="refresh.run()"
                                    />
                                </div>
                                <div v-if="contact.is_company">
                                    <linked-contact
                                        v-for="childContact in contact.contacts"
                                        :key="childContact.id"
                                        icon="person"
                                        :displayContact="childContact"
                                        :contactId="contact.id"
                                        :revert="true"
                                        :contactKey="
                                            contact.is_company ? 'company_id' : 'parent_id'
                                        "
                                        @saved="refresh.run()"
                                    />
                                    <linked-contact
                                        icon="person"
                                        :displayContact="null"
                                        :contactId="contact.id"
                                        :revert="true"
                                        :contactKey="
                                            contact.is_company ? 'company_id' : 'parent_id'
                                        "
                                        @saved="refresh.run()"
                                    />
                                </div>
                            </v-list-group>
                        </v-list>
                        <contact-sns :items="sns" @save="saveSNS" class="px-3 mb-3" />
                        <v-card-actions class="grey lighten-5 pa-3">
                            <k-confirm
                                title="Delete this record?"
                                question="This action cannot be undone. The record will be permanently deleted."
                                :max-width="500"
                                @confirm="remove.run()"
                            >
                                <v-btn
                                    flat
                                    icon
                                    small
                                    slot="button"
                                    color="danger"
                                    class="ma-0"
                                    :loading="remove.isActive"
                                >
                                    <v-icon>delete</v-icon>
                                </v-btn>
                            </k-confirm>
                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <v-flex xs12 md8>
                    <v-card class="mb-3">
                        <v-card-title class="title text-capitalize">
                            {{ 'notes' | translate }}
                            <v-spacer />
                            <v-btn
                                v-if="editNotes"
                                flat
                                icon
                                outline
                                class="ma-0"
                                @click="
                                    save()
                                    editNotes = !editNotes
                                "
                            >
                                <v-icon small>save</v-icon>
                            </v-btn>
                            <v-btn v-else flat icon outline class="ma-0" @click="editNotes = true">
                                <v-icon small>edit</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-textarea
                                v-if="editNotes"
                                name="notes"
                                :placeholder="'Start typing to add a note' | translate"
                                v-model="contactData.notes"
                                class="text-capitalize"
                                auto-grow
                            />
                            <div v-else style="white-space: pre-line">{{ contactData.notes }}</div>
                        </v-card-text>
                    </v-card>

                    <v-card class="mb-3">
                        <v-card-title class="title text-capitalize">
                            {{ 'timeline' | translate }}
                            <v-spacer />
                            <v-btn flat icon outline class="ma-0">
                                <v-icon small>history</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <v-timeline dense>
                                <v-timeline-item
                                    v-for="historyItem in historyEntries"
                                    :key="historyItem.key"
                                    color="accent"
                                >
                                    <v-card elevation="1">
                                        <v-card-title class="title">
                                            {{ historyItem.caption }}
                                        </v-card-title>
                                        <v-card-text class="pt-0">
                                            {{ historyItem.date | format('YYYY/MM/DD') }}
                                        </v-card-text>
                                    </v-card>
                                </v-timeline-item>
                            </v-timeline>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
