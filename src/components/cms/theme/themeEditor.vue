<script>
import { mapState, mapActions } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import AnnouncementEditor from '@/components/cms/editors/announcement'
import HeaderEditor from '@/components/cms/editors/header'
import HeroEditor from '@/components/cms/editors/hero'
import PlansEditor from '@/components/cms/editors/plans'
import SlideshowEditor from '@/components/cms/editors/slideshow'
import FooterEditor from '@/components/cms/editors/footer'
import ColorsEditor from '@/components/cms/editors/colors'
import RichEditor from '@/components/cms/editors/rich'
import SubscriptionEditor from '@/components/cms/editors/subscription'
import FormBuilder from '@/components/cms/editors/formBuilder'
import ThemePreview from '@/components/cms/theme/preview'

export default {
    components: {
        AnnouncementEditor,
        HeaderEditor,
        HeroEditor,
        PlansEditor,
        SlideshowEditor,
        FooterEditor,
        ColorsEditor,
        RichEditor,
        SubscriptionEditor,
        FormBuilder,
        ThemePreview,
    },
    props: ['pageId'],
    data() {
        return {
            // editor tab
            tabIndex: 0,
            // iframe max width
            iframeWidth: 2,
            // page data for preview
            landing: {
                theme: null,
                page: null,
            },
            windowIndex: 0,
        }
    },
    computed: {
        ...mapState({
            // current page
            page: state => state.cms.page,
            // all pages for selection
            pages: state => state.cms.pages,
            // current kickstart project
            project: state => state.projects.current,
            // plans for homepage rendering
            plans: state => state.cms.plans,
            // general theme settings
            theme: state => state.cms.theme,
        }),
        preview() {
            // create new object to force `sendData` every time `landing` changes
            const preview = cloneDeep(this.landing)
            preview.data = {
                plans: this.plans,
            }
            return preview
        },
        blocks() {
            const pageBlocks = this.landing.page.blocks
            const { header, footer } = this.landing.theme.blocks
            return [header, ...pageBlocks, footer]
        },
    },
    watch: {
        pageId(pageId, oldPageId) {
            //do something when propertyToWatch value changes
            if (pageId !== oldPageId) {
                this.load.run()
            }
        },
        preview: function() {
            this.sendData()
        },
    },
    mounted() {
        this.load.run()
        this.sendData()
        window.addEventListener('message', this.onMessage, false)
    },
    beforeDestroy: function() {
        window.removeEventListener('message', this.onMessage, false)
    },
    tasks(t) {
        // Vuency concurrent tasks
        // see https://ency.now.sh/vuency/usage
        return {
            load: t(async function() {
                try {
                    await this.getCMSPages()
                    if (!this.pageId) {
                        const defaultPage = this.pages.find(p => p.type == 'home')
                        this.$router.push({
                            name: 'project',
                            params: {
                                id: this.project.id,
                                view: 'cms',
                                subview: 'theme',
                                entity: defaultPage.id,
                            },
                        })
                    }
                    await Promise.all([this.getCMSPage(this.pageId), this.getCMSTheme()])
                    this.landing.page = cloneDeep(this.page)
                    this.landing.theme = cloneDeep(this.theme)
                    if (!this.plans.length) {
                        await this.getCMSPlans()
                        this.initPlansSettings()
                    } else {
                        this.initPlansSettings()
                    }
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
            save: t(async function() {
                try {
                    const { page, theme } = this.landing
                    const pageData = { ...this.page, blocks: page.blocks }
                    await Promise.all([this.updateCMSPage(pageData), this.updateCMSTheme(theme)])
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions([
            'getCMSPlans',
            'getCMSPages',
            'getCMSPage',
            'updateCMSPage',
            'updateCMSTheme',
            'getCMSTheme',
            'handleError',
        ]),
        onMessage(event) {
            if (event.data != 'getData') return
            this.sendData()
        },
        sendData() {
            this.$refs['landingframe'] &&
                this.$refs['landingframe'].contentWindow.postMessage(
                    {
                        call: 'setData',
                        value: JSON.stringify(this.preview),
                    },
                    window.location
                )
        },
        initPlansSettings() {
            if (!Array.isArray(this.landing.page.blocks)) return
            const plansBlock = this.landing.page.blocks.find(block => block.type == 'plans')
            if (!plansBlock) return
            plansBlock.settings.individualSettings = this.plans.map(() => ({
                headerColorBg: '#fff',
                headerColor: '',
                colorBg: '#fff',
                color: '',
                buttonColorBg: '',
            }))
        },
    },
}
</script>
<template>
    <theme-preview v-if="preview" :preview="preview" :load="load" :save="save" :pages="pages">
        <v-window v-if="load.lastResolved" v-model="windowIndex">
            <v-window-item>
                <v-tabs v-if="load.lastResolved" v-model="tabIndex" grow mandatory>
                    <v-tab ripple> {{ 'Sections' | translate }} </v-tab>
                    <v-tab ripple> {{ 'Theme settings' | translate }} </v-tab>
                    <v-tab-item :transition="false" :reverse-transition="false">
                        <v-list>
                            <v-list-tile
                                v-for="(block, index) in blocks"
                                :key="index"
                                :disabled="block.type == 'content'"
                                @click="windowIndex = index + 1"
                            >
                                <v-list-tile-content>
                                    <v-list-tile-title class="text-capitalize">
                                        {{ block.type | translate }}
                                    </v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </v-tab-item>
                    <v-tab-item :transition="false" :reverse-transition="false">
                        <v-card flat class="pt-3">
                            <v-card-text>
                                <colors-editor :colors="landing.theme.colors" />
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs>
            </v-window-item>
            <v-window-item v-for="(block, index) in blocks" :key="index + 1">
                <v-card flat>
                    <v-card-actions class="pa-3">
                        <v-btn flat icon class="ma-0" @click="windowIndex = 0">
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <v-flex shrink class="text-capitalize">
                            {{ block.type | translate }}
                        </v-flex>
                    </v-card-actions>
                </v-card>
                <!-- <component :is="block.type + '-editor'" v-if="block.type !== 'content'"></component> -->
                <announcement-editor v-if="block.type == 'announcement'" :block="block" />
                <header-editor v-if="block.type == 'header'" :block="block" />
                <hero-editor v-if="block.type == 'hero'" :block="block" />
                <rich-editor v-if="block.type == 'rich'" :block="block" />
                <plans-editor v-if="block.type == 'plans'" :block="block" :data="plans" />
                <slideshow-editor v-if="block.type == 'slideshow'" :block="block" />
                <subscription-editor v-if="block.type == 'subscription'" :block="block" />
                <footer-editor v-if="block.type == 'footer'" :block="block" />
                <form-builder v-if="block.type == 'form'" :block="block" />
            </v-window-item>
        </v-window>
        <template slot="preview">
            <iframe
                ref="landingframe"
                name="landingframe"
                scrolling="yes"
                sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-modals"
                tabindex="-1"
                src="/cms/preview.html"
            ></iframe>
        </template>

        <v-snackbar v-model="save.lastResolved" color="success" bottom>
            {{ 'Page updated successfully!' | translate }}
        </v-snackbar>
    </theme-preview>
</template>

<style lang="scss" scoped>
@media (min-width: 600px) {
    .theme-container {
        height: calc(100vh - 120px);
    }
    .theme-layout {
        max-height: calc(100vh - 192px);
    }
}
.scroll {
    overflow-y: auto;
    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: #ddd;
    }

    &::-webkit-scrollbar-thumb {
        background: #666;
    }
}
.landing {
    margin: 0 auto;
    transition: all 150ms ease;
    max-width: 100%;
    max-height: 100%;
    &.landing-size-1 {
        max-width: 360px;
        max-height: 640px;
    }
    &.landing-size-4 {
        max-width: 1024px;
        max-height: 768px;
    }
    iframe {
        border: none;
        width: 100%;
        height: 100%;
        min-height: 400px;
    }
}
</style>
