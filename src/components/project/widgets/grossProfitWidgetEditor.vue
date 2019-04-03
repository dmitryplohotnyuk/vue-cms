<script>
import { mapGetters } from 'vuex'
import GrossFrofitMarginChart from '@/components/project/widgets/grossFrofitMarginChart'
import { getWidget, saveWidget } from '@/utils/widgets'

export default {
    components: {
        GrossFrofitMarginChart,
    },
    props: ['projectId'],
    data() {
        return {
            goal: null,
            margin: 0,
            valid: false,
            rules: {
                goal: [v => (v && v > 0) || this.$t('Must be greater than 0')],
                margin: [
                    v => (v && v > 0) || this.$t('Must be greater than 0'),
                    v => (v && v < 100) || this.$t('Must be below 100'),
                ],
            },
            isNew: true,
        }
    },
    computed: {
        ...mapGetters(['currency']),
        widget() {
            const { projectId, goal, margin } = this
            return {
                name: 'gross-profit-margin',
                projectId,
                goal,
                margin,
                enabled: true,
            }
        },
    },
    watch: {
        projectId(projectId, oldProjetId) {
            if (projectId !== oldProjetId) {
                this.reset()
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.reset()
        })
    },
    methods: {
        tryToSave() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            const { widget } = this
            saveWidget(widget)
            this.$emit('submit', widget, 'gross-profit-margin')
        },
        reset() {
            const widget = getWidget('gross-profit-margin', this.projectId) || {}
            this.isNew = !widget.projectId
            const { margin = 0, goal } = widget
            this.margin = margin
            this.goal = goal
        },
    },
}
</script>

<template>
    <v-form v-model="valid" @submit.prevent="tryToSave" ref="form">
        <v-card>
            <v-card-title class="headline text-capitalize pt-3 pb-0">
                {{ 'gross profit / gross margin' | translate }}
                <v-spacer />
                <v-btn flat small icon @click="$emit('close')" class="ma-0">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12 md4 class="pl-2">
                        <v-tooltip max-width="300" bottom>
                            <v-text-field
                                class="mb-3"
                                v-model="goal"
                                :label="'Gross Profit Goal' | translate"
                                autofocus
                                slot="activator"
                                type="number"
                                min="0"
                                :step="currency == '￥' ? 1 : 0.01"
                                required
                                :rules="rules.goal"
                            ></v-text-field>
                            <span>
                                {{
                                    'The profit after deducting costs associated with making and selling its products or services.'
                                        | translate
                                }}
                            </span>
                        </v-tooltip>
                        <v-tooltip max-width="300" bottom>
                            <div slot="activator">
                                <v-subheader class="pa-0 font-weight-regular subheading mb-3">
                                    {{ 'Gross Profit Margin Goal (%)' | translate }}
                                </v-subheader>
                                <v-slider
                                    class="mt-0 mx-1"
                                    v-model="margin"
                                    thumb-label="always"
                                    thumb-size="24"
                                    step="1"
                                    required
                                    :rules="rules.margin"
                                ></v-slider>
                            </div>
                            <span>
                                {{
                                    'Proportion of money left over from revenues after accounting for the cost of goods sold.'
                                        | translate
                                }}
                            </span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex xs12 md1 class="text-md-center">
                        <v-divider vertical class="hidden-sm-and-down"></v-divider>
                        <v-divider horizontal class="hidden-md-and-up my-3"></v-divider>
                    </v-flex>
                    <v-flex xs12 md7>
                        <v-layout row wrap>
                            <v-flex xs12 sm6 class="mb-3">
                                <v-subheader class="px-0">
                                    <v-layout row wrap>
                                        <v-flex xs12 class="text-uppercase mb-1">
                                            {{ 'Gross Profit Goal' | translate }}
                                        </v-flex>
                                        <v-flex xs12 class="title">
                                            {{ widget.goal | currency(currency) }}
                                        </v-flex>
                                    </v-layout>
                                </v-subheader>
                            </v-flex>
                            <v-flex xs12 sm6 class="mb-3">
                                <v-subheader class="px-0">
                                    <v-layout row wrap>
                                        <v-flex xs12 class="text-uppercase mb-1">
                                            {{ 'Gross Profit Margin Goal' | translate }}
                                        </v-flex>
                                        <v-flex xs12 class="title"> {{ widget.margin }}% </v-flex>
                                    </v-layout>
                                </v-subheader>
                            </v-flex>
                        </v-layout>
                        <GrossFrofitMarginChart />
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-card-actions class="pt-0 pb-3 px-3">
                <v-spacer></v-spacer>
                <v-btn class="danger--text" flat @click="reset"> {{ 'reset' | translate }} </v-btn>
                <v-btn color="primary" dark flat type="submit">
                    <span v-if="isNew">{{ 'create widget' | translate }}</span>
                    <span v-else>{{ 'update widget' | translate }}</span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<style lang="scss" scoped></style>
