<script>
import { mapState } from 'vuex'
import CmsPageEditor from '@/components/cms/pages/pageEditor'

export default {
    components: {
        CmsPageEditor,
    },
    computed: {
        ...mapState({
            project: state => state.projects.current,
        }),
    },
    methods: {},
}
</script>
<template>
    <div class="">
        <div class="pb-3">
            <v-layout row wrap class="headline text-capitalize">
                <v-flex grow> {{ 'Create page' | translate }} </v-flex>
                <v-flex shrink>
                    <v-btn
                        flat
                        :to="{
                            name: 'project',
                            params: { id: project.id, view: 'cms', subview: 'pages' },
                        }"
                    >
                        <v-icon left>arrow_back</v-icon>
                        {{ 'pages' | translate }}
                    </v-btn>
                </v-flex>
            </v-layout>
            <v-divider />
        </div>
        <div>
            <cms-page-editor />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
