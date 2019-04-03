<script>
import RichEditor from '@/components/cms/tinymce'
import ColorPicker from '@/components/cms/editors/colorPicker'

import LinksList from '@/components/cms/editors/linksList'

export default {
    components: {
        LinksList,
        RichEditor,
        ColorPicker,
    },
    props: ['block'],
    data() {
        return {}
    },
}
</script>

<template>
    <div v-if="block">
        <v-card>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-switch
                            class="ma-0"
                            :label="'Enabled' | translate"
                            v-model="block.enabled"
                        ></v-switch>
                    </v-flex>
                    <v-flex xs12>
                        <color-picker
                            v-model="block.settings.colorBg"
                            :label="'Background' | translate"
                        />
                    </v-flex>
                    <v-flex xs12>
                        <color-picker
                            v-model="block.settings.colorText"
                            :label="'Text' | translate"
                        />
                    </v-flex>
                    <v-flex xs12>
                        <h3 class="subheading">{{ 'Quick links' | translate }}</h3>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                            v-model="block.settings.links.title"
                            :label="'Heading' | translate"
                        />
                    </v-flex>
                    <v-flex xs12>
                        <h3 class="subheading">{{ 'Menu items' | translate }}</h3>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <links-list :items="block.settings.links.items" />
        </v-card>

        <v-divider></v-divider>

        <v-card>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12>
                        <h3 class="subheading">{{ 'Text' | translate }}</h3>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                            v-model="block.settings.text.title"
                            :label="'Heading' | translate"
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
                            <rich-editor v-model="block.settings.text.text" preset="inline" />
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>

        <v-divider></v-divider>

        <v-card>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12>
                        <h3 class="subheading">{{ 'Newsletter' | translate }}</h3>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                            v-model="block.settings.newsletter.title"
                            :label="'Heading' | translate"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </div>
</template>

<style lang="scss" scoped></style>
