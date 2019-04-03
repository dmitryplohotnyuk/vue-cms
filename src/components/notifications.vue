<script>
export default {
    name: 'Notifications',
    data: function() {
        return {
            details: null,
            tabIndex: 0,
        }
    },

    computed: {
        notifications() {
            return this.$store.state.notifications.list.filter(item => item.type !== 'Announcement')
        },
        announcements() {
            return this.$store.state.notifications.list
                .filter(item => item.type == 'Announcement')
                .map(item => {
                    const div = document.createElement('div')
                    div.innerHTML = item.body
                    const titleEl = div.querySelector('h2')
                    const _title = titleEl && titleEl.innerText
                    const subtitleEl = div.querySelector('.subtitle')
                    const _subtitle = subtitleEl && subtitleEl.innerText
                    if (titleEl) {
                        titleEl.remove()
                    }
                    const _html = div.innerHTML
                    return {
                        _title,
                        _subtitle,
                        _html,
                        ...item,
                    }
                })
        },
    },

    created() {
        this.$store
            .dispatch('getNotifications')
            .then(() => this.markAsRead())
            .then(() => {
                const latestAnnouncement =
                    Array.isArray(this.announcements) && this.announcements[0]
                this.details = latestAnnouncement || null
            })
            .catch(() => {
                return
            })
    },

    watch: {
        tabIndex() {
            this.markAsRead()
        },
    },

    methods: {
        goToAction(url) {
            if (!url) return
            this.$router.push(url)
        },
        /**
         * Marks notifications or announcements as read depending on active tab
         */
        markAsRead() {
            const notifications = this.tabIndex === 0 ? this.announcements : this.notifications
            const unreadNotifications = notifications.filter(n => {
                return !n.read_at
            })
            if (!unreadNotifications.length) return
            this.$store.dispatch('markNotificationsRead', unreadNotifications)
        },
    },
}
</script>

<template>
    <v-card class="pa-0" v-if="notifications.length || announcements.length">
        <v-tabs grow v-model="tabIndex" color="blue-grey lighten-5" slider-color="indigo">
            <v-tab
                ripple
                class="tab title text-capitalize"
                active-class="indigo--text text--darken-1"
            >
                <span class="tab-title">{{ 'announcements' | translate }}</span>
            </v-tab>
            <v-tab
                ripple
                class="tab title text-capitalize"
                active-class="indigo--text text--darken-1"
            >
                <span class="tab-title">{{ 'notifications' | translate }}</span>
            </v-tab>
            <v-tab-item>
                <v-card flat v-if="details">
                    <v-card-title primary-title class="headline mb-0">
                        <span v-if="details._title">{{ details._title }}</span>
                        <span v-else>{{ 'Announcement' | translate }}</span>
                    </v-card-title>
                    <v-card-actions class="px-3">
                        <v-btn color="accent" flat outline small @click="details = null">
                            <v-icon>keyboard_arrow_left</v-icon>
                            <span class="ml-1"> {{ 'go back' | translate }} </span>
                        </v-btn>
                        <v-spacer />
                        <v-btn small flat disabled>
                            <v-icon>update</v-icon>
                            <span class="ml-1 text-xs-right">{{
                                details.created_at | relative
                            }}</span>
                        </v-btn>
                    </v-card-actions>
                    <v-card-text>
                        <div v-html="details._html" class="announcement"></div>
                    </v-card-text>
                </v-card>
                <v-card v-else>
                    <v-list three-line class="pt-1">
                        <template v-for="(announcement, i) in announcements">
                            <v-list-tile
                                :key="`announcemet-${i}`"
                                @click.stop="details = announcement"
                            >
                                <v-list-tile-content>
                                    <v-list-tile-title>
                                        <span v-if="announcement._title">
                                            {{ announcement._title }}
                                        </span>
                                        <span v-else>{{ 'Announcement' | translate }}</span>
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>
                                        {{ announcement._subtitle }}
                                    </v-list-tile-sub-title>
                                </v-list-tile-content>
                                <v-list-tile-action v-if="announcement.created_at">
                                    <v-list-tile-action-text>
                                        {{ announcement.created_at | relative }}
                                    </v-list-tile-action-text>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-divider v-if="i < announcements.length - 1" :key="i" />
                        </template>
                    </v-list>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-list two-line class="pt-1">
                    <template v-for="(notification, i) in notifications">
                        <v-list-tile
                            :key="`notification-${i}`"
                            ripple
                            @click.stop="goToAction(notification.action_url)"
                        >
                            <v-list-tile-avatar>
                                <v-icon>{{ notification.icon }}</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ notification.body }}</v-list-tile-title>
                                <v-list-tile-sub-title v-if="notification.action_text">
                                    <span class="text--primary">{{
                                        notification.action_text | translate
                                    }}</span>
                                    &mdash;{{ notification.created_at | relative }}
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-divider v-if="i < notifications.length - 1" :key="i" />
                    </template>
                </v-list>
            </v-tab-item>
        </v-tabs>
    </v-card>
</template>

<style lang="scss">
.announcement {
    img,
    iframe {
        display: block;
        margin: 16px auto;
        max-width: 100%;
    }
}
</style>
