<script>
import { mapState, mapActions } from 'vuex'

export default {
    name: 'MailchimpTemplates',
    components: {},
    data() {
        return {
            loading: false,
        }
    },
    computed: {
        ...mapState({
            templates: state => state.mailchimp.templates,
        }),
        headers() {
            return [
                {
                    name: 'name',
                    text: this.$t('name'),
                    align: 'left',
                    value: 'name',
                },
            ]
        },
    },
    watch: {},
    mounted() {
        if (!this.templates.length) {
            this.loading = true
            this.getMailchimpTemplates()
                .then(() => {
                    this.loading = false
                })
                .catch(this._handleError)
        }
    },
    methods: {
        ...mapActions(['resetError', 'getMailchimpTemplates', 'startLoading', 'finishLoading']),
        _handleError() {
            this.loading = false
            this.finishLoading()
        },
    },
}
</script>

<template>
    <v-layout fluid row wrap class="pa-0">
        <v-flex xs12>
            <v-card>
                <v-data-table
                    :headers="headers"
                    :items="templates"
                    :loading="loading"
                    disable-initial-sort
                    hide-actions
                >
                    <template slot="headerCell" slot-scope="props">
                        <span class="text-capitalize">{{ props.header.text }}</span>
                    </template>
                    <template slot="items" slot-scope="props">
                        <td class="text-xs-left">
                            {{ props.item.name }}
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
    </v-layout>
</template>
