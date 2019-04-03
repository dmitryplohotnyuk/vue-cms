<script>
import { mapState } from 'vuex'
import ProjectForm from '@/components/project/form'
import KConfirm from '@/components/confirm'

export default {
    components: { KConfirm, ProjectForm },
    data: () => ({
        showConfirm: false,
        projectSaved: false,
    }),
    computed: {
        ...mapState({
            user: state => state.account.user,
            project: state => state.projects.current,
        }),
    },
    mounted() {},

    tasks(t) {
        return {
            remove: t(async function() {
                await this.$store
                    .dispatch('deleteProject', this.project.id)
                    .catch(this._handleError)
                    .then(() => {
                        this.$store.dispatch('getProjects')
                        this.$router.push({
                            name: 'dashboard',
                            params: { projectDeleted: true },
                        })
                    })
            }).flow('drop'),
        }
    },
    methods: {
        _handleError() {
            this.remove.cancel()
        },
    },
}
</script>

<template>
    <v-layout row wrap align-start justify-center v-if="project">
        <v-flex xs12>
            <v-toolbar
                :class="{ 'blue-grey lighten-5': !$root.dark }"
                class="mb-0 v-toolbar__content--nopadding px-3"
                flat
            >
                <v-toolbar-title class="text-capitalize">
                    {{ 'settings' | translate }}
                </v-toolbar-title>
            </v-toolbar>
        </v-flex>
        <v-flex sm12 md8 lg7 class="py-3">
            <project-form :data="project" @saved="projectSaved = true" />

            <v-flex class="mt-3" v-if="user.id === project.user_id">
                <v-card>
                    <v-card-title class="title font-weight-regular text-capitalize">
                        {{ 'delete project' | translate }}
                    </v-card-title>
                    <v-container class="px-3 py-0">
                        <p v-if="$root.lang == 'en'" class="text-left">
                            Once you delete your project, there is no going back. Please be certain.
                        </p>
                        <p v-else class="text-left">
                            Kinchakuに入力されたすべてのデータを削除します。
                            復元が不可能になりますので、プロジェクトを削除する前にCSVをダウンロードすることをおすすめします。
                        </p>
                    </v-container>
                    <v-card-actions class="pt-0 px-3 pb-3">
                        <v-spacer />
                        <k-confirm
                            title="Are you sure you want to delete this project?"
                            question="This means deleting all it's associated data."
                            :max-width="600"
                            @confirm="remove.run()"
                        >
                            <v-btn
                                slot="button"
                                color="error"
                                :loading="remove.isActive"
                                :disabled="remove.isActive"
                            >
                                {{ 'delete' | translate }}
                            </v-btn>
                        </k-confirm>
                    </v-card-actions>
                </v-card>
            </v-flex>

            <v-snackbar v-model="projectSaved">
                {{ 'Project updated successfully!' | translate }}
            </v-snackbar>
        </v-flex>
    </v-layout>
</template>
