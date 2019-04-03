<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
}
</script>

<template>
    <!-- Footer -->
    <footer
        class="pt-5 border-top px-2"
        v-if="block && block.enabled"
        :style="buildStyle(block.settings, { 'background-color': 'colorBg', color: 'colorText' })"
    >
        <div class="container grid-lg">
            <div class="columns">
                <div class="col-4 col-sm-12 mb-4">
                    <h5 class="mb-3">{{ block.settings.links.title }}</h5>
                    <div v-for="item in block.settings.links.items" :key="item.name">
                        <a :href="item.link">
                            {{ item.name }}
                        </a>
                    </div>
                </div>
                <div class="col-4 col-sm-12 mb-4">
                    <h5 class="mb-3">{{ block.settings.text.title }}</h5>
                    <div v-html="block.settings.text.text"></div>
                </div>
                <div class="col-4 col-sm-12 mb-4">
                    <h5 class="mb-2">
                        {{ block.settings.newsletter.title }}
                    </h5>
                    <form class="pt-1">
                        <div class="form-group">
                            <label for="email" class="form-label">
                                Email address
                            </label>
                            <input
                                type="email"
                                class="form-input mb-2"
                                aria-describedby="emailHelp"
                                placeholder="Enter email"
                            />
                            <button type="submit" class="btn btn-block">
                                Subscribe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </footer>
</template>
