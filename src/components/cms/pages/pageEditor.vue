<script>
import { mapState, mapActions } from 'vuex'

import RichEditor from '@/components/cms/tinymce'

export default {
    components: {
        RichEditor,
    },
    props: ['pageId'],
    data() {
        return {
            // rich editor options
            editorOptions: {
                plugins: 'table link paste fullscreen',
            },
            // form validation state
            valid: false,
            // form data
            newPage: {
                visible: true,
                type: 'page',
                url: '',
                title: '',
                content: '',
                metatags: {
                    title: '',
                    description: '',
                },
                blocks: [],
                menu: [],
            },
            // validation rules
            rules: {
                url: [v => !!v || this.$t('Required Field')],
                title: [v => !!v || this.$t('Required Field')],
                content: [v => !!v || this.$t('Required Field')],
            },
        }
    },
    computed: {
        ...mapState({
            project: state => state.projects.current,
            page: state => state.cms.page,
        }),
        formData() {
            if (this.pageId) {
                return { ...this.page }
            } else {
                return this.newPage
            }
        },
        isContentEditable() {
            return !this.pageId || (this.load.lastResolved && this.page.type == 'page')
        },
    },
    mounted() {
        this.load.run()
    },
    watch: {
        pageId(pageId, oldPageId) {
            //do something when propertyToWatch value changes
            if (pageId !== oldPageId) {
                this.load.run()
            }
        },
    },
    tasks(t) {
        return {
            load: t(async function() {
                try {
                    if (this.pageId) {
                        await this.getCMSPage(this.pageId)
                    }
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
            save: t(async function() {
                try {
                    if (this.formData.id) {
                        await this.updateCMSPage(this.formData)
                        this.$router.push({
                            name: 'project',
                            params: { id: this.project.id, view: 'cms', subview: 'pages' },
                        })
                    } else {
                        await this.createCMSPage(this.formData)
                        this.$router.push({
                            name: 'project',
                            params: { id: this.project.id, view: 'cms', subview: 'pages' },
                        })
                    }
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions([
            'createCMSPage',
            'updateCMSPage',
            'deleteCMSPage',
            'getCMSPage',
            'handleError',
        ]),
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.save.run()
        },
        cancel() {
            this.save.abort()
            this.$router.push({
                name: 'project',
                params: { id: this.project.id, view: 'cms', subview: 'pages' },
            })
        },
    },
}
</script>

<template>
    <div>
        <v-container v-if="load.isActive || save.isActive" class="pa-0">
            <div class="progress-bar">
                <v-progress-linear color="indigo" height="4" class="ma-0" indeterminate />
            </div>
        </v-container>
        <v-form
            v-else-if="load.lastResolved"
            @submit.prevent="submit"
            v-model="valid"
            ref="form"
            lazy-validation
        >
            <v-container class="pa-0" grid-list-lg>
                <v-layout wrap>
                    <v-flex xs12 sm8>
                        <v-card :id="'card-' + _uid" class="mb-3">
                            <v-card-title class="title">
                                {{ 'Page details' | translate }}
                            </v-card-title>
                            <v-card-text class="pt-0">
                                <v-layout v-if="isContentEditable" row wrap>
                                    <v-flex xs12>
                                        <v-text-field
                                            v-model="formData.title"
                                            :rules="rules.title"
                                            :label="'title' | translate"
                                            class="text-capitalize"
                                            autofocus
                                        />
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-text-field
                                            v-model="formData.url"
                                            :rules="rules.url"
                                            :label="'URL' | translate"
                                            class="text-capitalize"
                                        />
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-subheader
                                            class="px-0 body-1 font-weight-regular mb-1"
                                            style="height: auto"
                                        >
                                            {{ 'Text' | translate }}
                                        </v-subheader>
                                        <v-card light flat>
                                            <rich-editor
                                                v-model="formData.content"
                                                preset="full"
                                            ></rich-editor>
                                        </v-card>
                                    </v-flex>
                                </v-layout>
                                <v-alert v-else color="accent" icon="info" :value="true">
                                    {{ 'This page has no content' | translate }}
                                </v-alert>
                            </v-card-text>
                        </v-card>

                        <v-card class="mb-3">
                            <v-card-title class="title">
                                {{ 'Meta tags' | translate }}
                            </v-card-title>
                            <v-card-text class="pt-0">
                                <v-layout row wrap>
                                    <v-flex xs12>
                                        <v-text-field
                                            v-model="formData.metatags.title"
                                            :label="'title' | translate"
                                            class="text-capitalize"
                                        />
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-textarea
                                            v-model="formData.metatags.description"
                                            :label="'description' | translate"
                                            class="text-capitalize"
                                            rows="3"
                                        />
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex xs12 sm4>
                        <v-card class="mb-3">
                            <v-card-title class="title text-capitalize">
                                {{ 'visibility' | translate }}
                            </v-card-title>
                            <v-card-text class="pt-0">
                                <v-layout row wrap>
                                    <v-flex xs12>
                                        <v-switch
                                            :label="'Visible' | translate"
                                            v-model="formData.visible"
                                            :disabled="!isContentEditable"
                                        ></v-switch>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                        <v-card class="mb-3" v-if="formData.id">
                            <v-card-title class="title text-capitalize">
                                {{ 'Theme' | translate }}
                            </v-card-title>
                            <v-card-text>
                                <v-layout row wrap>
                                    <v-flex xs12>
                                        <v-btn
                                            class="ma-0"
                                            :to="{
                                                name: 'project',
                                                params: {
                                                    id: project.id,
                                                    view: 'cms',
                                                    subview: 'theme',
                                                    entity: page.id,
                                                },
                                            }"
                                        >
                                            {{ 'customize' | translate }}
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>

            <v-container class="pa-0" grid-list-lg>
                <v-layout row>
                    <v-divider class="mb-1"></v-divider>
                </v-layout>
                <v-layout>
                    <v-spacer></v-spacer>
                    <v-btn flat @click.native="cancel">{{ 'cancel' | translate }}</v-btn>
                    <v-btn color="primary" type="submit" dark :loading="save.isActive">
                        <span v-if="formData.id">{{ 'update' | translate }} </span>
                        <span v-else>{{ 'create' | translate }} </span>
                    </v-btn>
                </v-layout>
            </v-container>
        </v-form>
    </div>
</template>

<style lang="scss" scoped></style>
