<script>
import { mapState, mapActions } from 'vuex'
import formatDateRelative from '@/utils/format-date-relative'

import ContactForm from '@/components/contact/form'

export default {
    name: 'ContactList',
    components: { ContactForm },
    data() {
        return {
            showCreateSuccess: false,
            showDeleteSuccess: false,
            contact: {
                source: 'kinchaku',
            },
            search: '',
            pagination: {
                rowsPerPage: 5,
                sortBy: 'created_at',
                descending: true,
            },
            contactsPerPageItems: [5, 10, 25, 50],
            applied_tags: [],
            showForm: false, // show contact form dialog
        }
    },
    computed: {
        ...mapState({
            user: state => state.account.user,
            contacts: state => state.contacts.list,
            tags: state => state.contacts.tags,
            metrics: state => state.contacts.metrics,
            project: state => state.projects.current,
            show_metrics: state => state.contacts.showMetrics,
        }),

        headers() {
            return [
                {
                    name: 'name',
                    text: this.$t('name'),
                    align: 'left',
                    sortable: false,
                    value: 'name',
                },
                { text: this.$t('email'), value: 'email' },
                { text: this.$t('tel'), value: 'phone' },
                { text: this.$t('status'), value: 'status' },
                { text: this.$t('source'), value: 'source' },
                { text: this.$t('created'), value: 'created_at', align: 'right' },
            ]
        },

        rows() {
            const { contacts } = this.contacts || {}
            if (!Array.isArray(contacts)) {
                return []
            }
            return contacts.map(c => {
                let fullName = 'N/A'
                if (c.is_company) {
                    fullName = c.name || c.email
                } else {
                    if (c.last_name || c.first_name) {
                        fullName =
                            this.$root.lang == 'ja'
                                ? c.last_name + ' ' + c.first_name
                                : c.first_name + ' ' + c.last_name
                    } else {
                        fullName = c.name || c.email
                    }
                }
                return { ...c, fullName, relative: this.relative(c.created_at) }
            })
        },
        trend_values() {
            return Object.values(this.metrics.trend.trend || {})
        },
    },

    watch: {
        pagination: {
            handler(pagination) {
                this.load.run({ search: this.search, pagination, tags: this.applied_tags })
            },
            deep: true,
        },
        search: function(search) {
            this.load.run({ search, pagination: this.pagination, tags: this.applied_tags })
        },
        applied_tags: function(tags) {
            this.load.run({ search: this.search, pagination: this.pagination, tags })
        },
        show_metrics: function(val) {
            if (!val) return
            this.getCreatedTrend()
        },
    },

    mounted() {
        this.getContactsTags()
    },
    tasks(t) {
        return {
            load: t(async function(params) {
                this.getShowMetrics().then(showMetrics => {
                    if (showMetrics) {
                        this.getCreatedTrend()
                    }
                }) // sync action - without promises
                await this.getContacts(params)
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions([
            'handleError',
            'createContact',
            'getContacts',
            'getContactsTags',
            'getCreatedTrend',
            'setShowMetrics',
            'getShowMetrics',
        ]),
        relative(date) {
            return formatDateRelative(date, this.$root.lang)
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
                @saved="showForm = false"
            />
        </k-dialog>
        <v-layout row wrap>
            <v-flex xs12 md12>
                <v-toolbar
                    :class="{ 'blue-grey lighten-5': !$root.dark }"
                    class="mb-0 v-toolbar__content--nopadding px-3"
                    flat
                >
                    <v-toolbar-title class="text-capitalize">
                        {{ 'contacts' | translate }}
                    </v-toolbar-title>
                    <v-spacer />
                    <v-tooltip bottom>
                        <v-menu
                            slot="activator"
                            :dark="$root.dark"
                            lazy
                            nudge-left="250"
                            offset-x
                            offset-y
                        >
                            <v-btn icon dense flat outline ripple slot="activator">
                                <v-icon>widgets</v-icon>
                            </v-btn>

                            <v-card>
                                <v-list class="widget-menu py-0">
                                    <v-list-tile @click="setShowMetrics(!show_metrics)">
                                        <v-list-tile-action>
                                            <v-checkbox
                                                :input-value="show_metrics"
                                                hide-details
                                                color="accent"
                                            />
                                        </v-list-tile-action>
                                        <v-list-tile-title class="text-capitalize">
                                            {{ 'new contacts counter' | translate }}
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-card>
                        </v-menu>
                        <span class="text-capitalize">{{ 'widgets' | translate }}</span>
                    </v-tooltip>
                    <v-divider vertical class="mx-3" />
                    <v-tooltip max-width="300" bottom>
                        <v-btn
                            icon
                            dense
                            flat
                            slot="activator"
                            open-delay="300"
                            class="primary ma-0"
                            @click="showForm = true"
                        >
                            <v-icon>add</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'add new record' | translate }}</span>
                    </v-tooltip>
                </v-toolbar>
            </v-flex>
        </v-layout>
        <v-layout fluid row wrap class="pa-3">
            <v-flex xs12 md5 class="pt-0 pb-3">
                <!-- <v-content> -->
                <!-- v-tooltip bottom>
                        <v-btn
                            icon
                            dense
                            flat
                            slot="activator"
                            open-delay="300"
                            class="primary ma-0 ml-3"
                        >
                            <v-icon>file_upload</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'upload CSV' | translate }}</span>
                    </v-tooltip -->
                <!-- v-tooltip bottom>
                        <v-btn
                            icon
                            v-if="project_length"
                            dense
                            flat
                            slot="activator"
                            open-delay="300"
                            class="primary ma-0 ml-3"
                            @click="downloadCSV"
                        >
                            <v-icon>file_download</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'download CSV' | translate }}</span>
                    </v-tooltip -->
                <!-- </v-content> -->
                <v-card
                    v-if="show_metrics && metrics && metrics.trend"
                    class="ma-0 pa-0"
                    max-width="300"
                >
                    <v-card-title class="pb-0">
                        <v-layout row wrap align-center>
                            <v-flex xs12 class="caption grey--text text-uppercase">
                                {{ 'new contacts' | translate }}
                            </v-flex>
                            <v-flex xs12>
                                <span
                                    class="display-2 font-weight-black"
                                    v-text="metrics.trend.value"
                                ></span>
                            </v-flex>
                        </v-layout>
                    </v-card-title>
                    <v-sheet>
                        <v-sparkline
                            :value="trend_values"
                            color="indigo"
                            line-width="4"
                            padding="1"
                            padding-bottom="0"
                            style="margin-bottom: -6px;margin-left: 1px"
                        />
                    </v-sheet>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                        <v-combobox
                            :items="tags"
                            v-model="applied_tags"
                            small-chips
                            clearable
                            flat
                            multiple
                            single-line
                            auto-select-first
                            hide-details
                            hide-selected
                            prepend-icon="filter_list"
                            dense
                            deletable-chips
                            :placeholder="'Tags' | translate"
                        />
                        <v-spacer />
                        <v-text-field
                            v-model="search"
                            append-icon="search"
                            :label="'filter' | translate"
                            single-line
                            class="text-capitalize"
                            clearable
                            hide-details
                        />
                    </v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="rows"
                        :pagination.sync="pagination"
                        :rows-per-page-items="contactsPerPageItems"
                        :total-items="contacts.total"
                        :loading="load.isActive"
                        disable-initial-sort
                    >
                        <template slot="headerCell" slot-scope="props">
                            <span class="text-capitalize">{{ props.header.text }}</span>
                        </template>
                        <template slot="items" slot-scope="props">
                            <tr
                                class="pointer"
                                @click="
                                    $router.push({
                                        name: 'contacts',
                                        params: {
                                            id: props.item.id,
                                        },
                                    })
                                "
                            >
                                <td class="text-xs-left">
                                    <router-link
                                        :to="{
                                            name: 'contacts',
                                            params: {
                                                id: props.item.id,
                                            },
                                        }"
                                    >
                                        <span class="text-no-wrap">{{ props.item.fullName }}</span>
                                    </router-link>
                                </td>
                                <td>{{ props.item.email }}</td>
                                <td>{{ props.item.phone }}</td>
                                <td class="text-capitalize">{{ props.item.status | translate }}</td>
                                <td class="text-capitalize">{{ props.item.source | translate }}</td>
                                <td align="right">
                                    <span :title="props.item.created_at | format('YYYY/MM/DD')">{{
                                        props.item.relative
                                    }}</span>
                                </td>
                            </tr>
                        </template>
                        <template slot="no-data" class="text-center">
                            <div class="text-center">{{ 'no data' | translate }}</div>
                        </template>
                        <template slot="no-results" :value="true">
                            <div class="text-center">
                                {{ 'No matching records found' | translate }}
                            </div>
                        </template>
                    </v-data-table>
                </v-card>
            </v-flex>
            <v-snackbar v-model="showDeleteSuccess">
                <span>{{ 'Contact deleted successfully' | translate }}</span>
            </v-snackbar>
        </v-layout>
    </div>
</template>
