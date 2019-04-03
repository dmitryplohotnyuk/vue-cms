<script>
import { mapState, mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import omit from 'lodash/omit'

import getBannerCode from '@/components/cms/beacon/bannerCode.js'
import BeaconColorsEditor from '@/components/cms/beacon/editors/colors'
import BeaconBannerEditor from '@/components/cms/beacon/editors/banner'
import BeaconActivationEditor from '@/components/cms/beacon/editors/activation'
import BeaconPopupEditor from '@/components/cms/beacon/editors/popup'
import ThemePreview from '@/components/cms/theme/preview'

export default {
    components: {
        BeaconColorsEditor,
        BeaconBannerEditor,
        BeaconPopupEditor,
        BeaconActivationEditor,
        ThemePreview,
    },
    data() {
        return {
            // page data for preview
            beacon: null,
            popupStep: 0,
        }
    },
    computed: {
        ...mapState({
            products: state => state.products.list,
            // current kickstart project
            project: state => state.projects.current,
        }),
        allPlans() {
            return (
                this.products &&
                this.products
                    .reduce((plans, product) => plans.concat(product.plans || []), [])
                    .reduce((result, plan) => {
                        result[plan.id] = plan
                        return result
                    }, {})
            )
        },
        preview() {
            // create new object to force `sendData` every time `landing` changes
            if (!this.beacon) {
                return null
            }
            const preview = cloneDeep(this.beacon)
            preview.script_url = this.$root.dev
                ? 'https://dev.kinchaku.com/aizu'
                : 'https://app.kinchaku.com/aizu'

            preview.bannerCode = getBannerCode(
                {
                    ...preview,
                    settings: {
                        ...pick(preview.settings, ['text', 'button_text', 'text_size']),
                        bar_color: preview.settings.background_color,
                        text_color: preview.settings.primary_color,
                    },
                },
                this.$t
            )
            preview.plans = preview.plans || []
            preview.plans = preview.plans.map(o => ({ ...this.allPlans[o.id], ...o }))

            return preview
        },
        banner_code() {
            return this.preview && this.preview.bannerCode
        },
        popup_iframe_URL() {
            let origin = ''
            switch (process.env.VUE_APP_ENV) {
                case 'local':
                    origin = 'http://localhost:8000'
                    break
                case 'dev':
                    origin = 'https://dev.kinchaku.com'
                    break
                default:
                    origin = ''
            }
            return origin + `/kickstart/${this.project.id}/preview/?step=${this.popupStep}`
        },
        default_beacon() {
            return {
                is_enabled: true,
                project_id: this.project.id,
                settings: {
                    primary_color: '#C3C3C3',
                    background_color: '',
                    text: '',
                    enable_beacon: true,
                    text_size: '1.7rem',
                    button_text: 'アカウント登録',
                    subscribe_text: '選ぶ',
                    modal_lg: false,
                },
            }
        },
    },
    watch: {
        preview: function() {
            this.sendData('banner')
            this.sendData('popup')
        },
    },
    mounted() {
        this.load.run()
        window.addEventListener('message', this.onMessage, false)
        this.$store.dispatch('getProducts')
    },
    beforeDestroy: function() {
        window.removeEventListener('message', this.onMessage, false)
    },
    tasks(t) {
        return {
            load: t(async function() {
                this.beacon = (await this.getProjectBeacon(this.project.id)) || this.default_beacon
            }).flow('drop'),
            save: t(async function() {
                if (this.beacon.id) {
                    await this.updateBeacon(omit(this.beacon, ['script_url', 'project']))
                } else {
                    await this.createBeacon(omit(this.beacon, ['script_url', 'project']))
                }
                this.beacon = await this.getProjectBeacon(this.project.id)
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions(['handleError', 'getProjectBeacon', 'createBeacon', 'updateBeacon']),
        onMessage(event) {
            if (event.data.type != 'getData') return
            this.sendData(event.data.sender)
        },
        sendData(blockName) {
            this.$refs[blockName] &&
                this.$refs[blockName].contentWindow.postMessage(
                    {
                        call: 'setData',
                        value: JSON.stringify(this.preview),
                    },
                    '*' //use exact targetOrigin in future
                )
        },
    },
}
</script>
<template>
    <theme-preview :load="load" v-if="load.lastResolved">
        <v-card>
            <v-card-text>
                <v-layout row wrap align-center class="mb-2">
                    <v-flex grow>
                        <h3 class="subheading first-capitalize">{{ 'color theme' | translate }}</h3>
                    </v-flex>
                    <v-btn color="primary" small @click="save.run()">
                        {{ 'save' | translate }}
                    </v-btn>
                </v-layout>
                <beacon-colors-editor :block="beacon" />
                <v-divider class="mt-2 mb-3" />
                <h3 class="subheading mb-2 first-capitalize">{{ 'design banner' | translate }}</h3>
                <beacon-banner-editor :block="beacon" />
                <v-divider class="mt-2 mb-3" />
                <h3 class="subheading mb-2 first-capitalize">
                    {{ 'select plans to display in the popup window' | translate }}
                </h3>
                <beacon-popup-editor :beacon="beacon" />
                <v-divider class="mt-2 mb-3" />
                <h3 class="subheading mb-2 first-capitalize">{{ 'step preview' | translate }}</h3>
                <v-btn-toggle mandatory v-model="popupStep" class="mb-2">
                    <v-btn flat :value="0">
                        <span class="first-capitalize">{{ 'plans' }}</span>
                    </v-btn>
                    <v-btn flat :value="1">
                        <span class="first-capitalize">{{ 'sign in' }}</span>
                    </v-btn>
                    <v-btn flat :value="2">
                        <span class="first-capitalize">{{ 'subscription' }}</span>
                    </v-btn>
                </v-btn-toggle>
                <v-divider class="mt-2 mb-3" />
                <beacon-activation-editor :bannerCode="banner_code" @activate="save.run()" />
            </v-card-text>
        </v-card>

        <template slot="preview">
            <v-container fluid class="pa-0" fill-height>
                <v-layout column fill-height>
                    <v-flex class="py-0" shrink>
                        <iframe
                            allowTransparency
                            style="height: 60px; min-height: 10%"
                            ref="banner"
                            scrolling="yes"
                            sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-modals"
                            tabindex="-1"
                            src="/cms/beacon-preview/widget-preview.html"
                        ></iframe>
                    </v-flex>
                    <v-flex class="py-0" grow>
                        <iframe
                            allowTransparency
                            ref="popup"
                            scrolling="yes"
                            sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-modals"
                            tabindex="-1"
                            :src="popup_iframe_URL"
                        ></iframe>
                    </v-flex>
                </v-layout>
            </v-container>
        </template>

        <v-snackbar v-model="save.lastResolved" color="success" bottom>
            {{ 'Settings updated successfully!' | translate }}
        </v-snackbar>
    </theme-preview>
</template>

<style lang="scss" scoped>
iframe {
    border: none;
    width: 100%;
    height: 100%;
    min-height: 400px;
}
</style>
