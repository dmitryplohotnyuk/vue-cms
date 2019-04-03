<script>
import { mapState } from 'vuex'
// import CmsPlans from '@/components/cms/plans'
// import CmsThemeEditor from '@/components/cms/theme/themeEditor'
import CmsBeaconEditor from '@/components/cms/beacon/beaconEditor'
// import CmsPagesList from '@/components/cms/pages/list'
// import CmsPagesCreate from '@/components/cms/pages/create'
// import CmsPagesEdit from '@/components/cms/pages/edit'

export default {
    components: {
        // CmsPlans,
        // CmsThemeEditor,
        CmsBeaconEditor,
        // CmsPagesList,
        // CmsPagesCreate,
        // CmsPagesEdit,
    },
    props: ['subview', 'entity'],
    data() {
        return {}
    },
    computed: {
        currency() {
            return this.$store.getters.currency
        },
        ...mapState({
            project: state => state.projects.current,
        }),
    },
    methods: {},
}
</script>
<template>
    <div>
        <v-container v-if="!subview" grid-list-lg>
            <h1>KICKSTART!</h1>
            <v-layout row wrap>
                <!--v-flex xs12 sm4>
                    <v-card color="blue-grey darken-2" class="white--text">
                        <v-card-title primary-title>
                            <div>
                                <div class="headline text-capitalize">
                                    {{ 'plans' | translate }}
                                </div>
                                <span>Some text here...</span>
                            </div>
                        </v-card-title>
                        <v-card-actions>
                            <v-btn
                                flat
                                dark
                                :to="{
                                    name: 'project',
                                    params: { id: project.id, view: 'kickstart', subview: 'plans' },
                                }"
                                class="text-uppercase"
                            >
                                {{ 'modify' | translate }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <v-flex xs12 sm4>
                    <v-card color="cyan darken-2" class="white--text">
                        <v-card-title primary-title>
                            <div>
                                <div class="headline text-capitalize">
                                    {{ 'theme' | translate }}
                                </div>
                                <span>Some text here...</span>
                            </div>
                        </v-card-title>
                        <v-card-actions>
                            <v-btn
                                flat
                                dark
                                :to="{
                                    name: 'project',
                                    params: { id: project.id, view: 'kickstart', subview: 'theme' },
                                }"
                                class="text-uppercase"
                            >
                                {{ 'customize' | translate }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <v-flex xs12 sm4>
                    <v-card color="purple darken-3" class="white--text">
                        <v-card-title primary-title>
                            <div>
                                <div class="headline text-capitalize">
                                    {{ 'pages' | translate }}
                                </div>
                                <span>Some text here...</span>
                            </div>
                        </v-card-title>
                        <v-card-actions>
                            <v-btn
                                flat
                                dark
                                :to="{
                                    name: 'project',
                                    params: { id: project.id, view: 'kickstart', subview: 'pages' },
                                }"
                                class="text-uppercase"
                            >
                                {{ 'manage' | translate }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex-->
                <v-flex xs12 sm4>
                    <v-card
                        color="green darken-3"
                        class="white--text pointer"
                        @click="
                            $router.push({
                                name: 'project',
                                params: {
                                    id: project.id,
                                    view: 'kickstart',
                                    subview: 'beacon',
                                },
                            })
                        "
                    >
                        <v-card-title primary-title>
                            <div>
                                <div class="headline text-capitalize">
                                    {{ 'beacon' | translate }}
                                </div>
                                <span>Beacon description</span>
                            </div>
                        </v-card-title>
                        <v-card-actions class="px-3">
                            <span class="text-uppercase">{{ 'customize' | translate }}</span>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
        <cms-plans v-else-if="subview == 'plans'" />
        <cms-theme-editor v-else-if="subview == 'theme'" :pageId="entity" />
        <cms-beacon-editor v-else-if="subview == 'beacon'" />
        <cms-pages-list v-else-if="subview == 'pages' && !entity" />
        <cms-pages-create v-else-if="subview == 'pages' && entity === 'create'" />
        <cms-pages-edit v-else-if="subview == 'pages' && entity !== 'create'" :pageId="entity" />
    </div>
</template>

<style lang="scss" scoped>
.landing {
    margin: 0 auto;
    transition: all 150ms ease;
    max-width: 100%;
    &.max-width-360 {
        max-width: 360px;
    }
    iframe {
        border: none;
        width: 100%;
        min-height: 850px;
    }
}
</style>
