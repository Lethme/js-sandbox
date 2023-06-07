<template>
    <HomeView/>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUnmounted, ref} from 'vue';
import HomeView from "@/views/HomeView/HomeView.vue";
import {useStore} from "vuex";

export default defineComponent({
    name: 'App',
    components: {HomeView},
    setup() {
        const store = useStore();

        onMounted(async () => {
            await store.dispatch('loadTabs');
            await store.dispatch('setAutoSave', true);
        });
    },
});
</script>
