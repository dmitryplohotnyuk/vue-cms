<script>
import { mapState } from 'vuex'
import ListMixin from '@/components/cms/editors/listMixin'
import ColorPicker from '@/components/cms/editors/colorPicker'
import RichEditor from '@/components/cms/tinymce'
import KDialog from '@/components/dialog'

export default {
    mixins: [ListMixin],
    components: {
        KDialog,
        ColorPicker,
        RichEditor,
    },
    props: ['block'],
    data() {
        return {
            // form validation state
            valid: false,
            // form data
            formData: null,
            // validation rules
            rules: {
                label: [],
            },
            // dialog state
            isOpen: false,
            editIndex: null,
        }
    },
    computed: {
        ...mapState({
            // all pages for selection
            pages: state => state.cms.pages,
        }),
        items() {
            return this.block.settings.fields
        },
    },
    methods: {
        resetValidation() {
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.resetValidation()
            })
        },
        add() {
            this.formData = { label: '', required: false, enabled: true, description: '' }
            this.editIndex = null
            this.isOpen = true
            this.resetValidation()
        },
        edit(index) {
            const item = this.items[index]
            this.formData = { ...item }
            this.editIndex = index
            this.isOpen = true
            this.resetValidation()
        },
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            const { editIndex, formData } = this
            if (typeof editIndex === 'number') {
                const item = this.items[editIndex]
                const newItem = { ...item, ...formData }
                this.$set(this.items, editIndex, newItem)
            } else {
                this.items.push({
                    name: 'field-' + this.items.length,
                    type: 'text',
                    optional: true,
                    ...formData,
                })
            }
            this.isOpen = false
        },
    },
}
</script>
<template>
    <div>
        <v-card>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-switch
                            class="ma-0"
                            :label="'Enabled' | translate"
                            v-model="block.enabled"
                            :disabled="true"
                        ></v-switch>
                    </v-flex>
                    <v-flex xs12>
                        <p class="text-capitalize">{{ 'template' | translate }}</p>
                        <v-radio-group v-model="block.settings.language" :mandatory="false">
                            <v-radio label="English" value="en"></v-radio>
                            <v-radio label="日本語" value="ja"></v-radio>
                        </v-radio-group>
                    </v-flex>
                    <v-flex xs12>
                        <color-picker
                            v-model="block.settings.colorBg"
                            :label="'Background' | translate"
                        />
                    </v-flex>
                    <v-flex xs12>
                        <v-switch
                            class="ma-0"
                            :label="'Limit form width' | translate"
                            v-model="block.settings.maxWidthLimited"
                        ></v-switch>
                    </v-flex>
                    <v-flex xs12>
                        <v-subheader
                            class="px-0 body-1 font-weight-regular mb-1"
                            style="height: auto"
                        >
                            {{ 'Heading' | translate }}
                        </v-subheader>
                        <v-card light flat>
                            <rich-editor v-model="block.settings.title" preset="inline" />
                        </v-card>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                            v-model="block.settings.buttonLabel"
                            :label="'Button label' | translate"
                        />
                    </v-flex>
                    <transition name="scale-transition">
                        <v-flex xs12 v-if="block.settings.maxWidthLimited">
                            <v-slider
                                class="ma-0"
                                v-model="block.settings.maxWidth"
                                :label="'Max form width' | translate"
                                step="1"
                                min="320"
                                max="960"
                                thumb-label
                            ></v-slider>
                        </v-flex>
                    </transition>
                </v-layout>
            </v-card-text>
            <v-list two-line dense class="pt-0">
                <v-list-tile v-for="(field, index) in items" :key="field.name">
                    <v-list-tile-action style="align-items: flex-start; min-width: 32px">
                        <v-icon :disabled="!field.optional" @click="up(index)">
                            keyboard_arrow_up
                        </v-icon>
                        <v-icon :disabled="!field.optional" @click="down(index)">
                            keyboard_arrow_down
                        </v-icon>
                    </v-list-tile-action>

                    <v-list-tile-content>
                        <v-list-tile-title>
                            <span v-if="field.label">{{ field.label }}</span> <span v-else>-</span>
                        </v-list-tile-title>
                        <v-list-tile-sub-title>
                            <span v-if="field.required">{{ 'required' | translate }}</span>
                            <span v-else>{{ 'optional' | translate }}</span>
                        </v-list-tile-sub-title>
                    </v-list-tile-content>

                    <v-list-tile-action style="flex-direction: row; align-items: center;">
                        <v-btn @click="edit(index)" icon ripple :disabled="!field.optional">
                            <v-icon>edit</v-icon></v-btn
                        >
                        <v-btn
                            @click="remove(index)"
                            icon
                            ripple
                            :disabled="!field.optional || field.type == 'iagree'"
                        >
                            <v-icon>delete</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile avatar @click="add" ripple>
                    <v-list-tile-action style="align-items: center; min-width: 32px">
                        <v-icon>add_circle_outline</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ 'Add field' | translate }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-card>

        <k-dialog v-model="isOpen" persistent max-width="500px" lazy>
            <v-form
                v-if="formData"
                @submit.prevent="submit"
                v-model="valid"
                ref="form"
                lazy-validation
            >
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ 'Edit form field' | translate }}</span>
                    </v-card-title>
                    <v-card-text class="pt-0">
                        <v-container class="pa-0" grid-list-lg>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-text-field
                                        :label="'Label' | translate"
                                        v-model="formData.label"
                                        :rules="rules.label"
                                        required
                                        autofocus
                                    ></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-textarea
                                        v-model="formData.description"
                                        :label="'Description' | translate"
                                        rows="3"
                                    ></v-textarea>
                                </v-flex>
                                <v-flex xs12 v-if="formData.type == 'iagree'">
                                    <v-autocomplete
                                        :label="'Link' | translate"
                                        :items="pages"
                                        v-model="formData.link"
                                        :rules="[v => !!v || this.$t('Required Field')]"
                                        item-text="title"
                                        item-value="url"
                                    />
                                </v-flex>
                                <v-flex xs6>
                                    <v-switch
                                        :label="'Enabled' | translate"
                                        v-model="formData.enabled"
                                    ></v-switch>
                                </v-flex>
                                <v-flex xs6>
                                    <v-switch
                                        :label="'Required' | translate"
                                        v-model="formData.required"
                                    ></v-switch>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions class="pt-0 px-3 pb-3">
                        <v-spacer></v-spacer>
                        <v-btn flat @click.native="isOpen = false">
                            {{ 'close' | translate }}
                        </v-btn>
                        <v-btn color="primary" type="submit" dark> {{ 'save' | translate }} </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </k-dialog>
    </div>
</template>
<style lang="scss" scoped></style>
