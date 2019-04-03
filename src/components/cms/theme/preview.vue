<script>
import { mapState, mapActions } from 'vuex'

export default {
    components: {},
    props: {
        preview: {
            // preview data
            type: Object,
            default: () => ({}),
        },
        pages: {
            // array of pages
            type: Array,
            default: null,
        },
        load: {
            // vuency task
            default: null,
        },
        save: {
            // vuency task
            default: null,
        },
    },
    data() {
        return {
            // editor tab
            tabIndex: 0,
            // iframe max width
            iframeWidth: 2,
        }
    },
    computed: {
        ...mapState({
            // current kickstart project
            project: state => state.projects.current,
        }),
    },
    methods: {
        ...mapActions([]),
    },
}
</script>
<template>
    <v-container class="pa-0 theme-container" grid-list-lg fluid>
        <v-layout v-if="load.isActive" row wrap>
            <v-flex class="progress-bar">
                <v-progress-linear color="indigo" height="4" class="ma-0" indeterminate />
            </v-flex>
        </v-layout>
        <v-layout v-else-if="load.lastResolved" column fill-height>
            <v-flex shrink>
                <v-toolbar dense flat>
                    <v-toolbar-title>KICKSTART</v-toolbar-title>
                    <v-toolbar-items>
                        <v-btn
                            exact
                            flat
                            :to="{
                                name: 'project',
                                params: { id: project.id, view: 'kickstart' },
                            }"
                        >
                            {{ 'home' | translate }}
                        </v-btn>
                    </v-toolbar-items>
                    <v-spacer />
                    <v-toolbar-items>
                        <v-menu offset-y v-if="pages">
                            <v-btn flat slot="activator">
                                {{ preview.page.title }}
                                <v-icon small right>keyboard_arrow_down</v-icon>
                            </v-btn>
                            <v-list>
                                <v-list-tile
                                    v-for="(item, index) in pages"
                                    :key="index"
                                    :to="{
                                        name: 'project',
                                        params: {
                                            id: project.id,
                                            view: 'cms',
                                            subview: 'theme',
                                            entity: item.id,
                                        },
                                    }"
                                >
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </v-toolbar-items>
                    <v-divider class="mx-2" vertical />
                    <v-btn-toggle mandatory v-model="iframeWidth">
                        <v-btn flat :value="1"><v-icon>smartphone</v-icon></v-btn>
                        <v-btn flat :value="4"><v-icon>tablet</v-icon></v-btn>
                        <v-btn flat :value="2"><v-icon>laptop</v-icon></v-btn>
                        <v-btn flat :value="3"><v-icon>fullscreen</v-icon></v-btn>
                    </v-btn-toggle>
                    <v-divider class="mx-2" vertical />
                    <v-toolbar-items class="hidden-xs-and-down">
                        <v-btn
                            v-if="save"
                            flat
                            outline
                            color="primary"
                            dark
                            :loading="save.isActive"
                            @click="save.run()"
                        >
                            {{ 'save' | translate }}
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
            </v-flex>

            <v-layout row wrap class="ma-0 theme-layout">
                <v-flex
                    xs12
                    sm5
                    md4
                    lg3
                    class="text-xs-center text-sm-left"
                    v-if="iframeWidth != 3"
                    fill-height
                >
                    <div class="fill-height scroll">
                        <slot></slot>
                    </div>
                </v-flex>
                <v-flex
                    xs12
                    class="text-xs-center"
                    :class="{ 'sm7 md8 lg9': iframeWidth != 3 }"
                    fill-height
                >
                    <div
                        class="landing fill-height elevation-1"
                        :class="'landing-size-' + iframeWidth"
                    >
                        <slot name="preview"></slot>
                    </div>
                </v-flex>
            </v-layout>
        </v-layout>
        <v-snackbar v-if="save" v-model="save.lastResolved" color="success" bottom>
            {{ 'Settings updated successfully!' | translate }}
        </v-snackbar>
    </v-container>
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
