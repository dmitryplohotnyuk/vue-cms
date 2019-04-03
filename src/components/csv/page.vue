<script>
import { mapState, mapGetters } from 'vuex'

let emptyCosts = {
    cogs: {
        planned: true,
        type: 'cogs',
        category: 'labor',
        direct: true,
        auto: true,
        expense: true,
    },
    opex: {
        planned: true,
        type: 'opex',
        category: 'promotion',
        direct: true,
        auto: true,
        expense: true,
        subcategory: 'other',
    },
    launch: {
        planned: true,
        type: 'launch',
        category: 'labor',
        direct: true,
        auto: true,
        expense: true,
    },
    revenue: {
        planned: true,
        type: 'revenue',
        category: 'revenue',
        direct: true,
        auto: false,
        expense: false,
        name: 'Default',
    },
}

export default {
    name: 'page',

    data() {
        return {
            record: emptyCosts[this.type],
            cost: true,
            mockData: {
                fieldNames: 'user, org, base, overtime, social-welfare, yearly-bonus, pension',
                exampleData: 'alice smithee, HR, 7000000, 300, 0, 7000, 2000000',
            },
            mappedFields: {},
        }
    },

    props: {
        type: {
            type: String,
        },
    },

    computed: {
        //...mapState(['user', 'project', 'error']),
        ...mapState({
            user: state => state.account.user,
            project: state => state.projects.current,
            error: state => state.error.error,
        }),
        ...mapGetters(['currency']),
        categories() {
            switch (this.type) {
                case 'cogs':
                case 'launch':
                    return this.$store.state.projects.categories.cogs
                case 'cogm':
                    return this.$store.state.projects.categories.cogm
                case 'opex':
                    return this.$store.state.projects.categories.opex
                case 'revenue':
                    return this.$store.state.projects.categories.revenue
            }
            return []
        },
        category_titles() {
            return Object.keys(this.categories).map(k => {
                return {
                    ...this.categories[k],
                    title: this.$t(this.categories[k].title),
                    value: k,
                }
            })
        },
        category_fields() {
            return (
                this.categories[this.record.category] &&
                this.categories[this.record.category].fields
            )
        },
    },
}
</script>

<template>
    <v-container>
        <v-layout>
            <v-flex>
                <v-card>
                    <v-card-title class="primary white-text" primary-title>
                        <div class="headline">{{ 'CSV to actual costs' | translate }}</div>
                    </v-card-title>
                    <v-container class="primary">
                        <v-flex xs5>
                            <v-select
                                box
                                v-model="record.category"
                                :items="category_titles"
                                height="26px"
                                hide-details
                                item-text="title"
                                item-value="value"
                                :placeholder="'category' | translate"
                                class="text-truncate white"
                            />
                        </v-flex>
                    </v-container>
                    <v-container class="indigo darken-3" xs5>
                        <v-flex>
                            <v-radio-group v-model="cost" dark row>
                                <v-radio
                                    class="indigo darken-3"
                                    color="white"
                                    label="Direct cost"
                                    :value="true"
                                ></v-radio>
                                <v-radio
                                    class="indigo darken-3"
                                    color="white"
                                    label="Indirect cost"
                                    :value="false"
                                ></v-radio>
                            </v-radio-group>
                        </v-flex>
                    </v-container>
                    <v-container grid-list-md text-xs-center>
                        <v-layout row wrap>
                            <v-flex xs5>
                                <v-list two-line>
                                    <v-subheader class="text-uppercase">
                                        {{ 'csv fields' | translate }}
                                    </v-subheader>
                                    <v-list-tile
                                        :disabled="false"
                                        v-for="(field, index) in mockData.fieldNames.split(',')"
                                        :key="field.name"
                                    >
                                        <v-list-tile-content>
                                            <v-list-tile-title class="text-capitalize">
                                                <h3>{{ field }}</h3>
                                            </v-list-tile-title>
                                            <v-list-tile-sub-title>
                                                {{ mockData.exampleData.split(',')[index] }}
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                </v-list>
                            </v-flex>
                            <v-flex xs2>
                                <v-list>
                                    <v-subheader class="text-uppercase"></v-subheader>
                                    <v-list-tile
                                        :disabled="false"
                                        v-for="field in mockData.fieldNames.split(',')"
                                        :key="field.name"
                                        class="mb-4"
                                    >
                                        <svg
                                            width="70"
                                            height="30"
                                            viewBox="0 0 100 70"
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="center-block arrow"
                                        >
                                            <path
                                                d="M 0 15 L 35 15 L 35 0 L 100 35 L 35 70 L 35 55 L 0 55"
                                                fill="rgb(216, 216, 216)"
                                                stroke="none"
                                                stroke-width="3"
                                            />
                                        </svg>
                                    </v-list-tile>
                                </v-list>
                            </v-flex>
                            <v-flex xs5>
                                <v-list>
                                    <v-subheader class="text-uppercase">
                                        {{ 'kinchaku fields' | translate }}
                                    </v-subheader>
                                    <v-list-tile
                                        :disabled="false"
                                        v-for="field in mockData.fieldNames.split(',')"
                                        :key="field.name"
                                        class="mb-4"
                                    >
                                        <v-select
                                            v-model="mappedFields[field]"
                                            :items="category_fields"
                                            height="26px"
                                            hide-details
                                            item-text="title"
                                            item-value="name"
                                            :placeholder="'field' | translate"
                                            class="text-truncate"
                                        />
                                    </v-list-tile>
                                </v-list>
                            </v-flex>
                            <v-btn class="primary text-capitalize">
                                {{ 'add cost' | translate }}
                            </v-btn>
                        </v-layout>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>
