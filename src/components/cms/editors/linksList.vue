<script>
import { mapState, mapActions } from 'vuex'
import ListMixin from '@/components/cms/editors/listMixin'
import KDialog from '@/components/dialog'

export default {
    mixins: [ListMixin],
    components: { KDialog },
    props: ['items'],
    data() {
        return {
            // form validation state
            valid: false,
            // form data
            name: '',
            link: '',
            // validation rules
            rules: {
                name: [v => !!v || this.$t('Required Field')],
                link: [
                    v => !!v || this.$t('Required Field'),
                    v =>
                        (v && ['/', 'http://', 'https://'].some(prefix => v.startsWith(prefix))) ||
                        this.$t('Link must be valid relative or absolute URL'),
                ],
            },
            // dialog state
            isOpen: false,
            editIndex: null,
        }
    },
    computed: {
        ...mapState({
            pages: state => state.cms.pages,
        }),
        selectedPage() {
            const { pages } = this
            return Array.isArray(pages) && pages.find(p => p.url == this.link)
        },
    },
    mounted() {
        if (!(this.pages && this.pages.length)) {
            this.getCMSPages().catch(this.handleError)
        }
    },
    methods: {
        ...mapActions(['getCMSPages', 'handleError']),
        resetValidation() {
            this.$nextTick(() => this.$refs.form.resetValidation())
        },
        add() {
            this.name = ''
            this.link = ''
            this.editIndex = null
            this.isOpen = true
            this.resetValidation()
        },
        edit(index) {
            const item = this.items[index]
            this.name = item.name
            this.link = item.link
            this.editIndex = index
            this.isOpen = true
            this.resetValidation()
        },
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            const { name, link, editIndex } = this
            if (typeof editIndex === 'number') {
                const item = this.items[editIndex]
                item.name = name
                item.link = link
            } else {
                this.items.push({
                    name,
                    link,
                })
            }
            this.isOpen = false
        },
    },
}
</script>

<template>
    <div>
        <v-list two-line dense>
            <v-list-tile v-for="(item, index) in items" :key="item.name">
                <v-list-tile-action>
                    <v-btn-toggle>
                        <v-btn flat @click="down(index)">
                            <v-icon>keyboard_arrow_down</v-icon>
                        </v-btn>
                        <v-btn flat @click="up(index)">
                            <v-icon>keyboard_arrow_up</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </v-list-tile-action>

                <v-list-tile-content>
                    <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>
                        {{ 'Link' | translate }}: {{ item.link }}
                    </v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action @click="edit(index)">
                    <v-btn icon ripple> <v-icon>edit</v-icon></v-btn>
                </v-list-tile-action>
                <v-list-tile-action @click="remove(index)">
                    <v-btn icon ripple>
                        <v-icon>delete</v-icon>
                    </v-btn>
                </v-list-tile-action>
            </v-list-tile>
            <v-list-tile avatar @click="add" ripple>
                <v-list-tile-action>
                    <v-icon>add_circle_outline</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>{{ 'Add menu item' | translate }}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>

        <k-dialog v-model="isOpen" persistent max-width="500px" lazy>
            <v-form @submit.prevent="submit" v-model="valid" ref="form" lazy-validation>
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ 'Edit menu item' | translate }}</span>
                    </v-card-title>
                    <v-card-text class="pt-0">
                        <v-container class="pa-0" grid-list-lg>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-text-field
                                        :label="'Name' | translate"
                                        v-model="name"
                                        :rules="rules.name"
                                        required
                                        autofocus
                                    ></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <!-- <v-autocomplete
                                        :label="'Link' | translate"
                                        :items="pages"
                                        v-model="link"
                                        :rules="rules.link"
                                        item-text="title"
                                        item-value="url"
                                    /> -->
                                    <v-combobox
                                        :label="'Link' | translate"
                                        :items="pages"
                                        v-model="link"
                                        :return-object="false"
                                        :rules="rules.link"
                                        item-text="title"
                                        item-value="url"
                                        clearable
                                        hide-no-data
                                        no-filter
                                        :hint="selectedPage && selectedPage.title"
                                        persistent-hint
                                    >
                                    </v-combobox>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions class="pt-0 px-3 pb-3">
                        <v-spacer></v-spacer>
                        <v-btn flat @click.native="isOpen = false">
                            {{ 'close' | translate }}
                        </v-btn>
                        <v-btn color="primary" type="submit" dark>
                            {{ 'save' | translate }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </k-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
