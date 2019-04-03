<script>
import appConfig from '@/app.config'

import { mapActions } from 'vuex'

export default {
    props: ['service', 'op', 'token'],

    page() {
        return this.page_meta
    },

    data: function() {
        return {
            valid: false,
            user: {
                name: '',
                email: '',
                password: '',
                language: this.$root.lang,
            },
            sending: false,
            redirect: false,
            showForm: false,
            emailSuccess: false,
            resetSuccess: false,
            rules: {
                name: [
                    v => !!v || this.$t('Name is required'),
                    v =>
                        (v && v.length <= 150) ||
                        this.$t('Name must be at most 150 characters long'),
                    v => (v && v.length >= 2) || this.$t('Name must be at least 2 characters long'),
                ],
                email: [
                    v => !!v || this.$t('Required Field'),
                    v => /.+@.+/.test(v) || this.$t('Must be a valid email'),
                ],
                password: [
                    v => !!v || this.$t('Required Field'),
                    v => (v && v.length >= 6) || this.$t('Must be at least 6 characters'),
                ],
                password_confirmation: [
                    v => !!v || this.$t('Required Field'),
                    v => v == this.user.password || this.$t('Passwords do not match'),
                ],
            },
        }
    },

    computed: {
        page_meta() {
            if (this.$route.name == 'signup') {
                return this.$root.lang == 'ja'
                    ? {
                          title: '新規アカウント登録',
                          meta: [
                              {
                                  name: 'description',
                                  content: 'ユーザーアカウント登録は無料です。',
                              },
                          ],
                      }
                    : {
                          title: 'Sign up',
                          meta: [
                              {
                                  name: 'description',
                                  content: 'Sign up for a free account in KINCHAKU.',
                              },
                          ],
                      }
            }
            if (this.$route.name == 'reset') {
                return this.$root.lang == 'ja'
                    ? {
                          title: 'パスワード再発行',
                          meta: [
                              {
                                  name: 'description',
                                  content:
                                      '登録済みのメールアドレスへパスワード再発行用のURLを送信します.',
                              },
                          ],
                      }
                    : {
                          title: 'Password Reset',
                          meta: [
                              {
                                  name: 'description',
                                  content:
                                      'We will send a message to your email address with the password reset URL.',
                              },
                          ],
                      }
            }
            if (this.$route.name == 'signin') {
                return this.$root.lang == 'ja'
                    ? {
                          title: 'ログイン',
                          meta: [
                              {
                                  name: 'description',
                                  content: '継続課金型ビジネスを支援するKINCHAKUへログイン。',
                              },
                          ],
                      }
                    : {
                          title: 'Sign in',
                          meta: [
                              {
                                  name: 'description',
                                  content:
                                      'Sign into your account to manage your subscription business and analyze your business data',
                              },
                          ],
                      }
            }
            return this.$root.lang == 'ja'
                ? {
                      title: `Authorize on ${appConfig.title}`,
                      meta: [{ name: 'description', content: appConfig.descriptionJA }],
                  }
                : {
                      title: `Authorize on ${appConfig.title}`,
                      meta: [{ name: 'description', content: appConfig.description }],
                  }
        },
        is_mirror_layout() {
            return ['request', 'reset'].includes(this.showForm)
        },
    },

    watch: {
        $route: 'checkRoute',
    },

    created() {
        this.checkRoute()
    },

    methods: {
        ...mapActions([
            'resetError',
            'signIn',
            'requestReset',
            'reset',
            'signUp',
            'oauthCallback',
            'oauthRedirect',
        ]),
        _handleError() {
            this.sending = false
        },

        checkRoute() {
            this.resetError()
            switch (this.service) {
                case 'microsoft':
                case 'google':
                case 'facebook':
                    if (!this.op) {
                        this.sending = true
                        this.oauthRedirect(this.service)
                            .then(({ url }) => {
                                window.setTimeout(() => {
                                    this.redirect = url
                                }, 5000)
                                window.location = url
                            })
                            .catch(this._handleError)
                    } else if (this.op == 'callback') {
                        this.sending = true
                        var params = this.$route.query
                        params.language = this.$root.lang
                        this.oauthCallback({ params, service: this.service })
                            .then(this.getUser)
                            .then(user => {
                                this.$root.changeLanguage(user.language)
                                this.$router.push(this.$route.query.redirect || '/')
                            })
                            .catch(this._handleError)
                    }
                    break
                default:
                    if (this.$route.name == 'signup') {
                        this.showForm = 'signup'
                    } else if (this.$route.name == 'reset' && this.token) {
                        this.showForm = 'reset'
                    } else if (this.$route.name == 'reset') {
                        this.showForm = 'request'
                    } else {
                        this.showForm = 'signin'
                    }
                    return
            }
        },

        tryToSignIn() {
            this.resetError()
            this.user.language = this.$root.lang

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.signIn(this.user)
                .then(this.getUser)
                .then(user => {
                    this.sending = false
                    this.$root.changeLanguage(user.language)
                    this.$router.push(this.$route.query.redirect || '/')
                })
                .catch(this._handleError)
        },

        tryToRequest() {
            this.resetError()

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.requestReset(this.user.email)
                .then(() => {
                    this.sending = false
                    this.emailSuccess = true
                })
                .catch(this._handleError)
        },

        tryToReset() {
            this.resetError()
            this.user.token = this.token
            this.user.language = this.$root.lang

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            return this.reset(this.user)
                .then(this.getUser)
                .then(user => {
                    this.sending = false
                    this.resetSuccess = true
                    this.$root.changeLanguage(user.language)
                    this.$router.push('/')
                })
                .catch(this._handleError)
        },

        tryToSignUp() {
            this.sending = false
            this.resetError()

            if (!this.$refs.form.validate()) return Promise.resolve(false)
            this.sending = true

            this.user.language = this.$root.lang || 'ja'

            return this.signUp(this.user)
                .then(this.getUser)
                .then(() => {
                    this.sending = false
                    this.$router.push(this.$route.query.redirect || '/')
                })
                .catch(this._handleError)
        },
    },
}
</script>

<template>
    <Layout class="white-bg">
        <v-container fill-height fluid>
            <v-layout row wrap fill-height>
                <v-flex v-if="!is_mirror_layout" md5 hidden-sm-and-down>
                    <v-container align-center justify-center column fill-height>
                        <v-flex class="text-md-right">
                            <img src="@/assets/images/reg-1.svg" />
                        </v-flex>
                    </v-container>
                </v-flex>
                <v-flex
                    xs12
                    :class="
                        is_mirror_layout
                            ? 'offset-sm2 sm8 offset-md1 md4 pa-3'
                            : 'offset-sm2 sm8 md5 lg4'
                    "
                    fill-height
                >
                    <v-layout
                        :justify-space-between="!is_mirror_layout"
                        :justify-center="is_mirror_layout"
                        column
                    >
                        <v-flex class="mt-5">
                            <div v-if="sending" class="text-center">
                                <h3 v-if="op" class="text-capitalize">
                                    {{ 'Authenticating...' | translate }}
                                </h3>
                                <spinner /> <br />

                                <a v-if="redirect" :href="redirect">
                                    {{
                                        'Please click here if you are not automatically redirected.'
                                            | translate
                                    }}
                                </a>
                            </div>
                            <div v-if="showForm">
                                <transition name="fade" appear>
                                    <div v-if="showForm == 'request'">
                                        <h1
                                            class="headline mb-1 indigo-text font-bold text-capitalize"
                                        >
                                            {{ 'reset your password' | translate }}
                                        </h1>

                                        <div v-if="!emailSuccess">
                                            <v-form
                                                ref="form"
                                                v-model="valid"
                                                @submit.prevent="tryToRequest"
                                            >
                                                <v-text-field
                                                    v-model="user.email"
                                                    class="text-capitalize"
                                                    :label="'email' | translate"
                                                    :rules="rules.email"
                                                    type="email"
                                                    required
                                                />
                                                <div class="">
                                                    <v-btn
                                                        class="mx-0 mb-3"
                                                        color="primary"
                                                        :disabled="sending"
                                                        type="submit"
                                                    >
                                                        {{ 'send password reset link' | translate }}
                                                    </v-btn>
                                                </div>
                                            </v-form>
                                            <div>
                                                <router-link to="/signup">
                                                    {{ "Don't have an account yet?" | translate }}
                                                </router-link>
                                            </div>
                                        </div>
                                        <div v-else>
                                            <div v-if="$root.lang == 'en'">
                                                <h5>
                                                    Please check your email at {{ user.email }} for
                                                    the link to reset your password. This link will
                                                    expire in 24 hours.
                                                </h5>
                                                <h5>If you can’t find the email in your inbox:</h5>
                                                <h5>
                                                    <ul>
                                                        <li>Check your SPAM or JUNK folder.</li>
                                                        <li>
                                                            Contact your company’s network
                                                            administrator for assistance. Your
                                                            system’s network settings may be
                                                            blocking certain incoming email.
                                                        </li>
                                                        <li>
                                                            or
                                                            <a href="mailto:support@kinchaku.com">
                                                                Contact us
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </h5>
                                            </div>
                                            <div v-else>
                                                <h5>
                                                    パスワード再設定用リンクを

                                                    {{ user.email }}

                                                    に送信しました。このリンクの有効期間は24時間です。
                                                </h5>
                                                <h5>もしメールが見つからない場合は...</h5>
                                                <h5>
                                                    <ul>
                                                        <li>
                                                            スパムフォルダや迷惑メールフォルダに届いていないかご確認ください。
                                                        </li>
                                                        <li>
                                                            また企業や組織宛のメールアドレスの場合、メールシステムやネットワークの管理者にご確認ください
                                                        </li>
                                                        <li>
                                                            または、
                                                            <a href="mailto:support@kinchaku.com">
                                                                こちらからお問合わせください。
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </h5>
                                            </div>
                                            <!-- <p>TODO: help text here</p> -->
                                        </div>
                                    </div>
                                    <div v-else-if="showForm === 'reset'">
                                        <h3 class="text-capitalize">
                                            {{ 'update password' | translate }}
                                        </h3>
                                        <v-form
                                            ref="form"
                                            v-model="valid"
                                            class="mt-2 mb-5"
                                            @submit.prevent="tryToReset"
                                        >
                                            <v-text-field
                                                v-model="user.email"
                                                class="text-capitalize"
                                                :label="'email' | translate"
                                                :rules="rules.email"
                                                type="email"
                                            />
                                            <v-text-field
                                                v-model="user.password"
                                                class="text-capitalize"
                                                :label="'password' | translate"
                                                :rules="rules.password"
                                                type="password"
                                            />
                                            <v-text-field
                                                v-model="user.password_confirmation"
                                                :label="'password confirmation' | translate"
                                                :rules="rules.password_confirmation"
                                                class="text-capitalize"
                                                type="password"
                                            />
                                            <v-btn
                                                class="mx-0"
                                                color="primary"
                                                :disabled="sending"
                                                type="submit"
                                            >
                                                {{ 'save updates' | translate }}
                                            </v-btn>
                                        </v-form>
                                    </div>
                                    <div v-else-if="showForm == 'signup'">
                                        <h1
                                            class="headline text-center mb-1 indigo-text font-bold text-capitalize"
                                        >
                                            {{ 'create account' | translate }}
                                        </h1>
                                        <v-form
                                            ref="form"
                                            v-model="valid"
                                            @submit.prevent="tryToSignUp"
                                        >
                                            <v-text-field
                                                v-model="user.name"
                                                id="name"
                                                class="text-capitalize"
                                                :label="'name' | translate"
                                                :rules="rules.name"
                                            />
                                            <v-text-field
                                                v-model="user.email"
                                                id="email"
                                                :label="'email' | translate"
                                                :rules="rules.email"
                                                type="email"
                                                class="text-capitalize"
                                            />
                                            <v-text-field
                                                v-model="user.password"
                                                id="password"
                                                class="text-capitalize"
                                                :label="'password' | translate"
                                                :rules="rules.password"
                                                type="password"
                                            />
                                            <p v-if="$root.lang == 'en'" class="text-muted mt-2">
                                                By signing up, you agree to our
                                                <a
                                                    href="https://kinchaku.com/resources/terms-conditions/"
                                                    target="_blank"
                                                    >Terms & Conditions</a
                                                >
                                                and that you have read our
                                                <a
                                                    href="https://kinchaku.com/resources/privacy/"
                                                    target="_blank"
                                                    >Privacy Policy</a
                                                >.
                                            </p>
                                            <p v-else class="text-muted mt-2">
                                                アカウントを登録することで<a
                                                    href="https://kinchaku.com/resources/terms-conditions/"
                                                    target="_blank"
                                                    >利用規約</a
                                                >
                                                および<a
                                                    href="https://kinchaku.com/resources/privacy/"
                                                    target="_blank"
                                                    >プライバシーポリシー</a
                                                >に 同意したものとみなします。
                                            </p>
                                            <v-layout
                                                align-center
                                                justify-center
                                                column
                                                class="mb-2"
                                            >
                                                <v-btn
                                                    class="mb-3 mx-0"
                                                    color="primary"
                                                    :disabled="sending"
                                                    type="submit"
                                                >
                                                    {{ 'create account' | translate }}
                                                </v-btn>
                                            </v-layout>
                                        </v-form>
                                    </div>
                                    <div v-else>
                                        <h1
                                            class="headline text-center mb-1 indigo-text font-bold text-capitalize"
                                        >
                                            {{ 'Welcome back!' | translate }}
                                        </h1>

                                        <v-form
                                            ref="form"
                                            v-model="valid"
                                            @submit.prevent="tryToSignIn"
                                        >
                                            <v-text-field
                                                v-model="user.email"
                                                id="email"
                                                class="text-capitalize"
                                                :label="'email' | translate"
                                                :rules="rules.email"
                                                type="email"
                                                required
                                            />
                                            <v-text-field
                                                v-model="user.password"
                                                id="password"
                                                class="text-capitalize"
                                                :label="'password' | translate"
                                                :rules="rules.password"
                                                type="password"
                                                required
                                            />
                                            <v-layout
                                                align-center
                                                justify-center
                                                column
                                                class="mb-2"
                                            >
                                                <v-btn
                                                    class="mb-3 mx-0"
                                                    color="primary"
                                                    :disabled="sending"
                                                    type="submit"
                                                >
                                                    {{ 'sign in' | translate }}
                                                </v-btn>
                                            </v-layout>
                                        </v-form>
                                    </div>
                                </transition>
                                <div
                                    v-if="showForm === 'signup' || showForm === 'signin'"
                                    class="text-xs-center"
                                >
                                    <router-link to="/reset">
                                        {{ 'Forgot your password?' | translate }}
                                    </router-link>
                                </div>
                                <div v-if="showForm === 'signup'" class="text-xs-center">
                                    <router-link to="/signin">
                                        {{ 'Already have an account?' | translate }}
                                    </router-link>
                                </div>
                                <div v-if="showForm === 'signin'" class="text-xs-center">
                                    <router-link to="/signup">
                                        {{ "Don't have an account yet?" | translate }}
                                    </router-link>
                                </div>
                            </div>
                        </v-flex>
                        <v-layout align-center justify-center column fill-height>
                            <v-flex v-if="!is_mirror_layout && !op" class="mt-3">
                                <h4
                                    v-if="showForm === 'signin'"
                                    class="subheading mt-3 mb-1
                                    text-xs-center"
                                >
                                    {{ 'Or use your social account to sign in' | translate }}:
                                </h4>
                                <h4
                                    v-if="showForm === 'signup'"
                                    class="subheading mt-3 mb-1 text-xs-center"
                                >
                                    {{ 'Or use your social account to sign up' | translate }}:
                                </h4>
                                <div>
                                    <v-btn
                                        to="/auth/google"
                                        :disabled="sending"
                                        class="sbutton ml-0 mr-3 white black--text"
                                    >
                                        <img
                                            src="@/assets/images/google-logo.svg"
                                            alt="Google"
                                            style="margin: 0 5px 0 -12px; height: 40px"
                                        />
                                        <span>Google</span>
                                    </v-btn>
                                    <v-btn
                                        to="/auth/microsoft"
                                        class="sbutton ml-0 white black--text"
                                        :disabled="sending"
                                    >
                                        <img
                                            src="@/assets/images/ms-logo.svg"
                                            alt="Microsoft"
                                            style="margin: 0 5px 0 -10px;"
                                        />
                                        <span>Microsoft</span>
                                    </v-btn>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-layout>
                </v-flex>
                <v-flex v-if="is_mirror_layout" hidden-sm-and-down offset-md1 md5>
                    <v-container align-center justify-center column>
                        <v-flex><img src="@/assets/images/reg-2.svg"/></v-flex>
                    </v-container>
                </v-flex>
            </v-layout>
        </v-container>
    </Layout>
</template>

<style lang="scss" scoped>
h3 {
    font-size: 24px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: normal;
    color: #212121;
    margin: 0 0 16px;
}
h5 {
    margin: 0 0 8px;
    opacity: 0.76;
    font-size: 13px;
    line-height: 1.85;
    font-weight: normal;
    color: rgb(33, 33, 33);
}
.theme--dark h5 {
    color: #fff;
}
.caption {
    opacity: 0.76;
}
.theme--dark .h5caption {
    color: white;
}
.body-1 {
    color: rgba(33, 33, 33, 0.7);
}
.text-muted {
    font-size: 12px;
    line-height: 1.33;
    color: rgb(33, 33, 33);
    opacity: 0.7;
}
.theme--dark .text-muted {
    color: white;
}
.router-link {
    display: block;
    font-size: 13px;
    line-height: 1.85;
    letter-spacing: normal;
    color: rgb(48, 63, 159);
    margin: 0 0 3px;
}
.sbutton {
    padding-left: 10px;
    img {
        height: 36px;
        margin: 0 5px 0 0;
    }
}
</style>
