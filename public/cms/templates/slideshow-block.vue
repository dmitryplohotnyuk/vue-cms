<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
}
</script>

<template>
    <!-- Slideshow -->
    <div v-if="block && block.enabled" id="carouselSlideshow" class="carousel">
        <!-- carousel locator -->
        <input
            :checked="index == 0"
            :id="'slide-' + (index + 1)"
            v-for="(item, index) in block.settings.items"
            :key="index"
            v-if="item.enabled"
            class="carousel-locator"
            type="radio"
            name="carousel-radio"
            hidden=""
        />

        <!-- carousel container -->
        <div class="carousel-container">
            <!-- carousel item -->
            <figure
                class="carousel-item"
                v-for="(item, index) in block.settings.items"
                :key="index"
                v-if="item.enabled"
            >
                <img
                    class="img-responsive rounded"
                    :src="
                        item.settings.backgroundImage || 'https://via.placeholder.com/600x400.png'
                    "
                    :alt="item.settings.heading"
                />
                <figcaption class="figure-caption text-center text-light">
                    <h5>{{ item.settings.heading }}</h5>
                    <p>{{ item.settings.text }}</p>
                </figcaption>
            </figure>
        </div>
        <!-- carousel navigation -->
        <div class="carousel-nav">
            <label
                v-for="(item, index) in block.settings.items"
                :key="index"
                v-if="item.enabled"
                class="nav-item text-hide c-hand"
                :for="'slide-' + (index + 1)"
            >
                {{ index + 1 }}
            </label>
        </div>
    </div>
</template>
