<template>
    <v-card class="position-absolute ma-4 glass-card" :class="padding" :style="positionStyles">
        <slot></slot>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    position: {
        type: String,
        default: 'bottom' // 'top', 'bottom'
    },
    padding: {
        type: String,
        default: 'pa-3'
    }
});

const positionStyles = computed(() => {
    const base: Record<string, any> = {
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.8) !important',
        backdropFilter: 'blur(10px)'
    };
    
    if (props.position === 'top') {
        Object.assign(base, { top: 0, left: '340px' });
    } else if (props.position === 'bottom') {
        Object.assign(base, { bottom: 0, left: '340px' });
    }
    
    return base;
});
</script>

<style scoped>
.glass-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
</style>
