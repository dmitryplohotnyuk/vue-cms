<script>
import { mapGetters } from 'vuex'
import GrossFrofitMarginChart from '@/components/project/widgets/grossFrofitMarginChart'

export default {
    components: {
        GrossFrofitMarginChart,
    },
    props: ['name', 'title', 'widget'],
    data() {
        return {}
    },
    computed: {
        ...mapGetters(['currency']),
    },
}
</script>

<template>
    <v-card v-if="widget && widget.enabled">
        <v-card-title class="title text-capitalize grey-text text-darken-1 pt-3 pb-0">
            <v-layout row align-center>
                <v-flex>{{ title }}</v-flex>
                <v-menu left>
                    <v-btn icon small slot="activator" class="ma-0">
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                    <v-list class="text-capitalize">
                        <v-list-tile @click="$emit('edit')">
                            <v-list-tile-title>{{ 'edit' | translate }}</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile @click="$emit('delete')">
                            <v-list-tile-title>{{ 'remove' | translate }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-layout>
        </v-card-title>
        <v-card-text>
            <v-layout row wrap class="pt-3">
                <v-flex xs12 class="mb-3 py-0">
                    <v-subheader class="px-0">
                        <v-layout row wrap>
                            <v-flex xs12 class="text-uppercase mb-1 py-0">
                                <span v-if="name === 'gross-profit-margin'">
                                    {{ 'Gross Profit Goal' | translate }}
                                </span>
                            </v-flex>
                            <v-flex xs1 class="title py-0" style="color: #5C6CC0">
                                <span v-if="name === 'gross-profit-margin'">
                                    {{ widget.goal | currency(currency) }}
                                </span>
                            </v-flex>
                        </v-layout>
                    </v-subheader>
                </v-flex>
                <v-flex xs12 class="mb-3 py-0">
                    <v-subheader class="px-0">
                        <v-layout row wrap>
                            <v-flex xs12 class="text-uppercase mb-1 py-0">
                                <span v-if="name === 'gross-profit-margin'">
                                    {{ 'Gross Profit Margin Goal' | translate }}
                                </span>
                            </v-flex>
                            <v-flex xs12 class="title py-0" style="color: #B3BCEC">
                                <span v-if="name === 'gross-profit-margin'">
                                    {{ widget.margin }}%
                                </span>
                            </v-flex>
                        </v-layout>
                    </v-subheader>
                </v-flex>
            </v-layout>

            <GrossFrofitMarginChart v-if="widget.name === 'gross-profit-margin'" />
        </v-card-text>
    </v-card>
</template>
