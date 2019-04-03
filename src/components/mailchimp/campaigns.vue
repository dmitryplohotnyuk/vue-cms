<script>
import { mapState, mapActions } from 'vuex'
import CampaignForm from '@/components/mailchimp/campaign-form'

export default {
    name: 'MailchimpCampaigns',
    components: { CampaignForm },
    data() {
        return {
            loading: false,
            showForm: false,
            campaignId: null,
            deleteId: null,
            showDeleteSuccess: false,
            showConfirm: false,
            sendId: null,
            showSendSuccess: false,
            showSendConfirm: false,
        }
    },
    computed: {
        ...mapState({
            campaigns: state => state.mailchimp.campaigns,
        }),
        headers() {
            return [
                {
                    name: 'title',
                    text: this.$t('title'),
                    align: 'left',
                    value: 'title',
                },
                {
                    name: 'status',
                    text: this.$t('status'),
                    align: 'left',
                    value: 'status',
                },
                {
                    name: 'actions',
                    align: 'right',
                },
            ]
        },
    },
    watch: {
        deleteId: function(val) {
            this.showConfirm = !!val
        },
        showConfirm: function(val) {
            if (!val && this.deleteId) {
                this.deleteId = null
            }
        },
        sendId: function(val) {
            this.showSendConfirm = !!val
        },
        showSendConfirm: function(val) {
            if (!val && this.sendId) {
                this.sendId = null
            }
        },
    },
    mounted() {
        if (!this.campaigns.length) {
            this.loading = true
            this.getMailchimpCampaigns()
                .then(() => {
                    this.loading = false
                })
                .catch(this._handleError)
        }
    },
    methods: {
        ...mapActions([
            'resetError',
            'getMailchimpCampaigns',
            'startLoading',
            'finishLoading',
            'deleteMailchimpCampaign',
            'sendMailchimpCampaign',
        ]),
        _handleError() {
            this.loading = false
            this.finishLoading()
        },
        handleEditClick(id) {
            this.showForm = true
            this.campaignId = id
        },
        tryToDelete() {
            if (!this.deleteId) return
            this.sending = true
            this.resetError()

            return this.deleteMailchimpCampaign({ id: this.deleteId })
                .then(() => {
                    this.showConfirm = false
                    this.sending = false
                    this.showDeleteSuccess = true
                })
                .catch(this._handleError)
        },
        tryToSend() {
            if (!this.sendId) return
            this.sending = true
            this.resetError()

            return this.sendMailchimpCampaign({ id: this.sendId })
                .then(() => {
                    this.showSendConfirm = false
                    this.sending = false
                    this.showSendSuccess = true
                })
                .catch(this._handleError)
        },
    },
}
</script>

<template>
    <v-layout fluid row wrap class="pa-0">
        <k-dialog lazy v-model="showConfirm" width="600">
            <v-card>
                <v-card-title class="headline">
                    {{ 'Are you sure you want to delete this campaign?' | translate }}
                    <v-spacer />
                    <v-btn flat small icon @click="showConfirm = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn flat @click="deleteId = null" id="btn-delete-campaign-cancel">
                        {{ 'cancel' | translate }}
                    </v-btn>
                    <v-btn
                        color="red"
                        class="white-text"
                        id="btn-delete-campaign-confirm"
                        @click="tryToDelete"
                    >
                        {{ 'delete' | translate }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </k-dialog>
        <k-dialog lazy v-model="showSendConfirm" width="600">
            <v-card>
                <v-card-title class="headline">
                    {{ 'Are you sure you want to send this campaign?' | translate }}
                    <v-spacer />
                    <v-btn flat small icon @click="showSendConfirm = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn flat @click="sendId = null" id="btn-send-campaign-cancel">
                        {{ 'cancel' | translate }}
                    </v-btn>
                    <v-btn
                        color="red"
                        class="white-text"
                        id="btn-send-campaign-confirm"
                        @click="tryToSend"
                    >
                        {{ 'send' | translate }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </k-dialog>
        <k-dialog lazy persistent v-model="showForm" width="600">
            <campaign-form
                v-if="showForm"
                :id="campaignId"
                @close="showForm = false"
                @saved="showForm = false"
            />
        </k-dialog>
        <v-flex xs12>
            <v-tooltip max-width="300" bottom>
                <v-btn
                    icon
                    dense
                    flat
                    slot="activator"
                    open-delay="300"
                    class="primary ma-0 mb-3"
                    @click="showForm = true"
                >
                    <v-icon>add</v-icon>
                </v-btn>
                <span class="text-capitalize">{{ 'create campaign' | translate }}</span>
            </v-tooltip>
            <v-card>
                <v-data-table
                    :headers="headers"
                    :items="campaigns"
                    :loading="loading"
                    disable-initial-sort
                    hide-actions
                >
                    <template slot="headerCell" slot-scope="props">
                        <span class="text-capitalize">{{ props.header.text }}</span>
                    </template>
                    <template slot="items" slot-scope="props">
                        <td class="text-xs-left">{{ props.item.title || 'Untitled' }}</td>
                        <td class="text-xs-left">{{ props.item.status | translate }}</td>
                        <td class="text-right">
                            <v-btn
                                v-if="props.item.status === 'save'"
                                flat
                                icon
                                small
                                @click="sendId = props.item.id"
                            >
                                <v-icon>email</v-icon>
                            </v-btn>
                            <v-btn flat icon small @click="handleEditClick(props.item.id)">
                                <v-icon>edit</v-icon>
                            </v-btn>
                            <v-btn flat icon small color="danger" @click="deleteId = props.item.id">
                                <v-icon>close</v-icon>
                            </v-btn>
                        </td>
                    </template>
                    <template slot="no-data" class="text-center">
                        <div class="text-center">{{ 'no data' | translate }}</div>
                    </template>
                    <template slot="no-results" :value="true">
                        <div class="text-center">{{ 'No matching records found' | translate }}</div>
                    </template>
                </v-data-table>
            </v-card>
        </v-flex>
        <v-snackbar v-model="showDeleteSuccess">
            <span>{{ 'Campaign deleted successfully' | translate }}</span>
        </v-snackbar>
        <v-snackbar v-model="showSendSuccess">
            <span>{{ 'Campaign sent successfully' | translate }}</span>
        </v-snackbar>
    </v-layout>
</template>
