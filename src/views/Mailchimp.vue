<script>
import appConfig from '@/app.config'
import MailchimpLists from '@/components/mailchimp/lists'
import MailchimpCampaigns from '@/components/mailchimp/campaigns'
import MailchimpTemplates from '@/components/mailchimp/templates'

export default {
    components: { MailchimpLists, MailchimpCampaigns, MailchimpTemplates },
    props: {},
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'Mailchimp',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Mailchimp',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            tab: 0,
        }
    },
    computed: {},
    methods: {},
}
</script>

<template>
    <Layout>
        <div transition="fadeIn" class="pa-3">
            <div class="headline text-capitalize">
                {{ 'mailchimp' | translate }}
            </div>
            <v-divider class="mb-3 mt-1" />
            <v-tabs slot="extension" v-model="tab" grow class="elevation-1">
                <v-tabs-slider color="primary" />
                <v-tab key="campaigns" class="text-capitalize">{{ 'campaigns' | translate }}</v-tab>
                <v-tab key="lists" class="text-capitalize">{{ 'lists' | translate }}</v-tab>
                <v-tab key="templates" class="text-capitalize">{{ 'templates' | translate }}</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab" class="mt-3">
                <v-tab-item key="campaigns">
                    <mailchimp-campaigns />
                </v-tab-item>
                <v-tab-item key="lists">
                    <mailchimp-lists />
                </v-tab-item>
                <v-tab-item key="templates">
                    <mailchimp-templates />
                </v-tab-item>
            </v-tabs-items>
        </div>
    </Layout>
</template>
