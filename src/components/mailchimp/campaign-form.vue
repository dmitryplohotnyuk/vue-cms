<script>
import { mapActions, mapState } from 'vuex'

export default {
    props: ['id'],
    data() {
        return {
            campaignData: {
                title: null,
                subject_line: null,
                reply_to: null,
                from_name: null,
                list_id: null,
                template_id: null,
            },
            sending: false,
            valid: false,
            rules: {
                title: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 60) ||
                        this.$t('Title must be at most 150 characters long'),
                    v =>
                        (v && v.length >= 3) || this.$t('Title must be at least 3 characters long'),
                ],
                subject_line: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 60) ||
                        this.$t('Subject must be at most 150 characters long'),
                    v =>
                        (v && v.length >= 3) ||
                        this.$t('Subject must be at least 3 characters long'),
                ],
                reply_to: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 60) ||
                        this.$t('Reply to must be at most 150 characters long'),
                    v =>
                        (v && v.length >= 3) ||
                        this.$t('Reply to field must be at least 3 characters long'),
                ],
                from_name: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && v.length <= 60) ||
                        this.$t('From name must be at most 150 characters long'),
                    v =>
                        (v && v.length >= 3) ||
                        this.$t('From name must be at least 3 characters long'),
                ],
                list_id: [v => !!v || this.$t('Required Field')],
                template_id: [v => !!v || this.$t('Required Field')],
            },
        }
    },
    computed: {
        ...mapState({
            campaigns: state => state.mailchimp.campaigns,
            lists: state => state.mailchimp.lists,
            templates: state => state.mailchimp.templates,
        }),
        locale() {
            return this.$root.lang == 'en' ? 'en-us' : 'ja-jp'
        },
    },
    mounted() {
        const campaign = this.campaigns.find(item => item.id === this.id)

        if (campaign) {
            this.campaignData = { ...campaign }
        }
    },
    methods: {
        ...mapActions(['resetError', 'createMailchimpCampaign', 'updateMailchimpCampaign']),
        _handleError() {
            this.sending = false
        },
        tryToSave() {
            if (this.id) {
                return this.tryToUpdate()
            }

            return this.tryToCreate()
        },
        tryToCreate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            this.createMailchimpCampaign({ data: this.campaignData })
                .then(() => {
                    this.sending = false
                    this.$emit('close')
                })
                .catch(this._handleError)
        },
        tryToUpdate() {
            this.resetError()
            this.sending = false

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            this.updateMailchimpCampaign({ data: this.campaignData, id: this.id })
                .then(() => {
                    this.sending = false
                    this.$emit('close')
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
            <span>{{ id === null ? 'Create campaign' : 'Edit campaign' | translate }}</span>
            <v-spacer />
            <v-btn flat small icon @click="$emit('close')" class="ma-0">
                <v-icon>close</v-icon>
            </v-btn>
        </v-card-title>

        <v-form v-model="valid" @submit.prevent="tryToSave" ref="form">
            <v-layout row wrap class="pa-3">
                <v-flex xs12>
                    <v-text-field
                        id="title"
                        :label="'title' | translate"
                        :rules="rules.title"
                        required
                        v-model="campaignData.title"
                        class="text-capitalize"
                    />
                    <v-text-field
                        id="subject_line"
                        :label="'subject' | translate"
                        :rules="rules.subject_line"
                        required
                        v-model="campaignData.subject_line"
                        class="text-capitalize"
                    />
                    <v-text-field
                        id="reply_to"
                        :label="'reply to' | translate"
                        :rules="rules.reply_to"
                        required
                        v-model="campaignData.reply_to"
                        class="text-capitalize"
                    />
                    <v-text-field
                        id="from_name"
                        :label="'from name' | translate"
                        :rules="rules.from_name"
                        required
                        v-model="campaignData.from_name"
                        class="text-capitalize"
                    />
                    <v-select
                        v-model="campaignData.list_id"
                        solo
                        :label="'list' | translate"
                        :placeholder="'Select list' | translate"
                        class="text-truncate"
                        :items="lists"
                        item-text="name"
                        item-value="id"
                        :rules="rules.list_id"
                    />
                    <v-select
                        v-model="campaignData.template_id"
                        solo
                        :label="'template' | translate"
                        :placeholder="'Select template' | translate"
                        class="text-truncate"
                        :items="templates"
                        item-text="name"
                        item-value="id"
                        :rules="rules.template_id"
                    />
                </v-flex>
            </v-layout>
            <v-card-actions class="pt-0 px-3 pb-3">
                <v-spacer />
                <v-tooltip max-width="300" bottom class="mb-0">
                    <v-btn slot="activator" :disabled="sending" flat type="submit" class="primary">
                        {{ 'save' | translate }}
                    </v-btn>
                </v-tooltip>
            </v-card-actions>
        </v-form>
    </v-card>
</template>
