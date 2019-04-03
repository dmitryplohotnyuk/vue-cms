<script>
import Uploader from '@/components/uploader'
import { getAccessToken } from '@/auth'
import { baseURL } from '@/api'

export default {
    name: 'popup',

    components: {
        Uploader,
    },

    props: {
        initialType: {
            type: String,
            required: true,
        },
        types: {
            type: Array,
            default: null,
        },
        plan: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            success: false,
            planSwitch: this.plan,
            type: this.initialType,
        }
    },
    computed: {
        project() {
            return this.$store.state.projects.current
        },
        upload_url() {
            return baseURL + `/records/${this.project.id}/${this.type}/upload`
        },
        headers() {
            return { 'X-Auth-Token': getAccessToken() }
        },
        params() {
            return { planned: this.planSwitch }
        },
    },
    methods: {
        onSuccess() {
            this.success = true
            this.$emit('success', true)
        },
        handleError(file, message) {
            if (!message.errors || !message.errors.message) return ''
            this.$emit('error', message.errors.message)
            return message.errors.message
        },
    },
}
</script>

<template>
    <v-card>
        <v-card-title>
            <v-spacer />
            <v-btn flat small icon @click="$emit('close')" class="ma-0">
                <v-icon>close</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text class="text-md-center px-3 py-0">
            <h2 class="headline pb-2">{{ 'Import your data' | translate }}</h2>
            <p
                class="px-4 darkgrey--text"
                v-translate="{
                    replace: { sample: $t('a sample CSV template') },
                    key:
                        'Drag and drop or browse to upload your CSV file. Download |{sample}| to see an example of the format required.',
                }"
            >
                <span /> <a target="_blank" href="/samples.zip"></a> <span />
            </p>
            <v-layout row wrap justify-center>
                <v-btn-toggle v-model="planSwitch" dense class="my-0 mx-2" mandatory>
                    <v-btn :value="true" outline>{{ 'budget' | translate }}</v-btn>
                    <v-btn :value="false" outline>{{ 'actual' | translate }}</v-btn>
                </v-btn-toggle>
                <v-btn-toggle
                    v-model="type"
                    dense
                    class="my-0 mx-2"
                    mandatory
                    v-if="types && types.length"
                >
                    <v-btn
                        color="primary"
                        :value="typeItem"
                        v-for="typeItem in types"
                        :key="typeItem"
                        outline
                        class="text-uppercase"
                    >
                        {{ typeItem | translate }}
                    </v-btn>
                </v-btn-toggle>
            </v-layout>
        </v-card-text>
        <div class="pa-3">
            <uploader
                :url="upload_url"
                :headers="headers"
                :params="params"
                :handleError="handleError"
                acceptedFiles=".csv,.zip,.gz"
                @fileUploaded="onSuccess"
            >
                <v-icon xLarge class="accent--text">inbox</v-icon>
                <p>{{ 'Browse' | translate }}</p>
                <p>{{ 'Upload .csv, .zip and .gz files up to 10mb' | translate }}</p>
            </uploader>
        </div>
        <v-card-actions class="pb-3 pt-0" v-if="success">
            <v-spacer />
            <v-btn color="primary" @click="$emit('close')">{{ 'close' | translate }}</v-btn>
            <v-spacer />
        </v-card-actions>
    </v-card>
</template>
