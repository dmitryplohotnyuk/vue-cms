<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
    data() {
        return {
            translations: {
                'Personal Details': '個人情報',
                Next: '次に',
                'First Name': 'お名前',
                'Last Name': '苗字',
                'Email Adress': 'メール',
                'agree to Terms of Use': '利用規約に同意する',
            },
        }
    },
    methods: {
        translate: function(key) {
            const language = this.block.settings.language
            if (language == 'en') {
                return key
            }
            return this.translations[key] || key
        },
    },
}
</script>

<template>
    <!-- Form -->
    <div
        class="container py-5"
        :style="buildStyle(block.settings, { 'background-color': 'colorBg' })"
    >
        <h2 class="mb-4 text-center">
            <div
                class="no-content-margin"
                v-html="block.settings.title || translate('Personal Details')"
            />
        </h2>
        <form
            class="col-mx-auto"
            :style="
                block.settings.maxWidthLimited ? 'max-width: ' + block.settings.maxWidth + 'px' : ''
            "
            action="/"
            method="post"
            @submit.prevent=""
        >
            <div
                class="form-group"
                v-for="(field, index) in block.settings.fields"
                v-if="field.enabled"
                :key="index"
                :class="{ 'form-check': field.type == 'iagree' }"
            >
                <label v-if="field.type == 'iagree'" class="">
                    <input
                        v-if="field.type == 'iagree'"
                        type="checkbox"
                        :required="field.required"
                        :id="field.name"
                        :name="field.name"
                    />
                    <a :href="field.link" rel="noreferrer noopener" target="_blank">
                        {{ translate(field.label) }}
                    </a>
                </label>
                <label
                    v-if="field.type != 'iagree' && field.label"
                    :for="field.name"
                    class="form-label"
                >
                    {{ translate(field.label) }}
                </label>
                <input
                    v-if="field.type != 'iagree'"
                    :type="field.type"
                    class="form-input"
                    :id="field.name"
                    :name="field.name"
                    :aria-describedby="field.label"
                    :required="field.required"
                />
                <span v-if="field.description" class="form-input-hint text-muted">
                    {{ field.description }}
                </span>
            </div>
            <div class="mt-4 text-center">
                <button type="submit" class="btn btn-lg btn-primary">
                    {{ block.settings.buttonLabel || translate('Next') }}
                </button>
            </div>
        </form>
    </div>
</template>
