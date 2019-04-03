<script>
export default {
    computed: {
        languageClass() {
            return this.$root.lang === 'en' ? 'flag-icon-jp' : 'flag-icon-gb'
        },
        theme() {
            return 'default'
        },
    },
    methods: {
        changeTheme(theme) {
            this.$root.changeTheme(theme)
        },
    },
}
</script>

<template>
    <v-footer class="page-footer" height="auto">
        <v-layout
            wrap
            align-center
            :column="$vuetify.breakpoint.xsOnly"
            :reverse="$vuetify.breakpoint.xsOnly"
        >
            <v-flex xs12 sm3 md3 lg3>
                <v-layout align-center row wrap :justify-center="$vuetify.breakpoint.xsOnly">
                    <v-btn
                        target="blank"
                        class="accent--text"
                        icon
                        href="https://facebook.com/kinchaku/"
                    >
                        <img src="/img/footer/facebook.svg" alt="" height="20" />
                    </v-btn>
                    <v-btn
                        class="accent--text"
                        icon
                        target="blank"
                        href="https://join.slack.com/t/kinchaku/shared_invite/enQtNDc1NzQ2ODIwMzA5LTY5YTJhZTBkYTIzNzY0ZDQ3MzBlYWVjODg4YjlkZGM4M2VlZWZmY2JhY2Q5YzY2N2FiZDQ1ZTM2ZGZlMDVhMTg"
                    >
                        <img src="/img/footer/slack.svg" alt="" height="20" />
                    </v-btn>
                    <v-btn
                        target="blank"
                        class="accent--text"
                        icon
                        href="https://kinchaku.com/blog/"
                    >
                        <img src="/img/footer/rss.svg" alt="" height="20" />
                    </v-btn>
                </v-layout>
            </v-flex>
            <v-flex xs12 sm4 md5 lg6 class="px-3 py-2 text-center">
                © Kinchaku. <span class="ml-2">All rights reserved.</span>
            </v-flex>
            <v-flex xs12 sm5 md4 lg3 class="text-center text-sm-right">
                <v-menu v-if="$root.dev">
                    <v-btn class="ma-0" slot="activator" flat>{{ 'theme' | translate }}</v-btn>
                    <v-list>
                        <v-list-tile @click="changeTheme('dark')">{{
                            'Dark' | translate
                        }}</v-list-tile>
                        <v-list-tile @click="changeTheme('default')">
                            {{ 'Default' | translate }}
                        </v-list-tile>
                    </v-list>
                </v-menu>
                <v-tooltip max-width="300" top>
                    <v-btn
                        slot="activator"
                        class="accent--text"
                        icon
                        href="https://kinchaku.com/resources/privacy/"
                    >
                        <v-icon>security</v-icon>
                    </v-btn>
                    <span>{{ 'Privacy Policy' | translate }}</span>
                </v-tooltip>
                <v-tooltip max-width="300" top>
                    <v-btn
                        slot="activator"
                        class="accent--text"
                        icon
                        href="https://kinchaku.com/resources/terms-conditions/"
                    >
                        <v-icon>view_list</v-icon>
                    </v-btn>
                    <span>{{ 'Terms and Conditions' | translate }}</span>
                </v-tooltip>
                <v-tooltip max-width="300" left>
                    <v-menu offset-y top left slot="activator">
                        <v-btn slot="activator" id="btn-language" class="accent--text" icon>
                            <v-icon>language</v-icon>
                        </v-btn>
                        <v-list class="py-0">
                            <v-list-tile
                                slot="default"
                                @click="$emit('language', 'en')"
                                :inactive="$root.lang == 'en'"
                                :class="{ 'language--active': $root.lang == 'en' }"
                            >
                                <v-list-tile-avatar
                                    ><i class="flag-icon flag-icon-gb"
                                /></v-list-tile-avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>English</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile
                                @click="$emit('language', 'ja')"
                                :inactive="$root.lang == 'ja'"
                                :class="{ 'language--active': $root.lang == 'ja' }"
                            >
                                <v-list-tile-avatar
                                    ><i class="flag-icon flag-icon-jp"
                                /></v-list-tile-avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>日本語</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                    <span>Change language</span>
                </v-tooltip>
            </v-flex>
        </v-layout>
    </v-footer>
</template>

<style lang="scss" scoped>
.social-link {
    height: 36px;
    width: 36px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
