<script>
export default {
    name: 'history',

    mounted() {
        this.$store.dispatch('getUploadHistory')
    },

    computed: {
        uploadHistory() {
            return this.$store.state.uploads.upload_history
        },
    },

    methods: {
        iconClass(status) {
            if (status === 'invalid') {
                return 'danger'
            } else if (status === 'pending') {
                return 'primary'
            }
            return ''
        },
        statusClass(status) {
            if (status === 'invalid') {
                return 'danger--text'
            } else if (status === 'pending') {
                return 'primary--text'
            }
            return 'text--secondary'
        },
    },
}
</script>

<template>
    <v-card v-if="uploadHistory.length">
        <v-list two-line class="pt-0">
            <v-subheader class="headline text--primary text-capitalize">
                {{ 'csv upload history' | translate }}
            </v-subheader>
            <template v-for="(file, i) in uploadHistory">
                <v-list-tile :key="`file-${i}`" ripple>
                    <v-flex xs1>
                        <v-list-tile-avatar>
                            <v-icon> {{ `attachment` }} </v-icon>
                        </v-list-tile-avatar>
                    </v-flex>
                    <v-flex xs3>
                        <v-list-tile-content dark color="secondary">
                            <v-list-tile-title>{{ file.filename }}</v-list-tile-title>
                            <v-list-tile-sub-title v-if="file.status === 'invalid'">
                                <v-btn
                                    small
                                    color="primary"
                                    class="ma-0"
                                    :to="{ name: 'mapping', params: { type: file.type } }"
                                >
                                    {{ 'remap fields' | translate }}
                                </v-btn>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-flex>
                    <v-flex xs2>
                        <v-list-tile-content dark color="secondary">
                            <span class="text--secondary">{{ file.created_at }}</span>
                        </v-list-tile-content>
                    </v-flex>
                    <v-flex xs3>
                        <v-list-tile-content dark color="secondary">
                            <span class="text--secondary">{{ file.size }}</span>
                        </v-list-tile-content>
                    </v-flex>
                    <v-flex xs1>
                        <v-list-tile-content color="secondary">
                            <v-icon :color="iconClass(file.status)">{{ file.icon }}</v-icon>
                        </v-list-tile-content>
                    </v-flex>
                    <v-flex xs2>
                        <v-list-tile-content dark color="secondary">
                            <span :class="statusClass(file.status)">{{ file.status }}</span>
                        </v-list-tile-content>
                    </v-flex>
                </v-list-tile>
                <v-divider v-if="i < uploadHistory.length - 1" :key="i" />
            </template>
        </v-list>
    </v-card>
</template>
