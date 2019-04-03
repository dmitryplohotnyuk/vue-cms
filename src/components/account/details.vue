<script>
export default {
    name: 'AccountDetails',
    data() {
        return {
            valid: false,
            showSuccess: false,
            edit: {},
            rules: {
                name: [
                    v => !!v || this.$t('Name is required'),
                    v =>
                        (v && v.length <= 150) ||
                        this.$t('Name must be at most 150 characters long'),
                    v => (v && v.length >= 2) || this.$t('Name must be at least 2 characters long'),
                ],
            },
        }
    },

    computed: {
        user() {
            return this.$store.state.account.user
        },
    },

    mounted() {
        this.edit = Object.assign({}, this.user)
    },

    tasks(t) {
        return {
            update: t(async function() {
                this.$store.dispatch('resetError')
                if (!this.$refs.form.validate()) return Promise.resolve(false)
                await this.$store.dispatch('updateUser', this.edit).then(() => {
                    this.showSuccess = true
                })
            }).flow('drop'),
        }
    },
}
</script>

<template>
    <v-layout row wrap align-start justify-center>
        <v-flex sm12 md6 class="px-1">
            <v-form v-model="valid" @submit.prevent="update.run()" ref="form">
                <v-card>
                    <v-card-title primary-title class="px-3 pt-3 pb-0">
                        <h2 class="title font-weight-regular text-capitalize">
                            {{ 'profile' | translate }}
                        </h2>
                    </v-card-title>
                    <v-container class="pa-3">
                        <v-text-field
                            v-model="edit.name"
                            class="text-capitalize"
                            :label="'name' | translate"
                            :rules="rules.name"
                        />
                        <v-text-field
                            class="text-capitalize"
                            :label="'email' | translate"
                            type="email"
                            :value="user.email"
                            readonly
                            disabled
                        />
                        <v-checkbox
                            v-model="edit.on_mail_list"
                            :label="'Subscribed to our newsletter' | translate"
                        />
                    </v-container>

                    <v-card-actions class="pb-3 px-3 pt-0">
                        <v-spacer />
                        <v-tooltip max-width="300" bottom>
                            <v-btn
                                slot="activator"
                                flat
                                dark
                                class="primary"
                                type="submit"
                                :disabled="update.isActive"
                                :loading="update.isActive"
                            >
                                {{ 'save' | translate }}
                            </v-btn>
                            <span>{{ 'Click to save your profile details.' | translate }}</span>
                        </v-tooltip>
                    </v-card-actions>
                </v-card>
                <v-snackbar v-model="showSuccess">
                    {{ 'Account details saved successfully' | translate }}
                </v-snackbar>
            </v-form>
        </v-flex>
    </v-layout>
</template>
