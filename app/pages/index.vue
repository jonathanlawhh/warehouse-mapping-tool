<template>
    <div class="landing-page">
        <!-- Background Elements -->
        <div class="animated-background">
            <div class="grid-overlay"></div>
            <div class="glow-sphere sphere-1"></div>
            <div class="glow-sphere sphere-2"></div>

            <div class="floating-cubes-container">
                <div v-for="n in 8" :key="n" :class="['floating-cube', `cube-${n}`]"></div>
            </div>
        </div>

        <v-main class="position-relative z-index-1" style="min-height: 95vh">
            <!-- Hero Header -->
            <v-container class="pt-16 pb-12">
                <v-row justify="center">
                    <v-col cols="12" md="8" class="text-center">
                        <h1 class="text-h1 font-weight-black mb-6 title-glow">
                            Warehouse <span class="text-primary">Tools</span>
                        </h1>
                        <p class="text-h5 text-medium-emphasis mx-auto mb-12 max-width-700">
                            Digital twins and spatial intelligence for the next generation of logistics efficiency.
                        </p>
                    </v-col>
                </v-row>

                <!-- Main Apps Selection -->
                <v-row justify="center" align="stretch" class="app-selection-row">
                    <!-- Equipment Utilization Training -->
                    <v-col cols="12" md="5" lg="4" class="d-flex">
                        <v-hover v-slot="{ isHovering, props }">
                            <v-card v-bind="props" :elevation="isHovering ? 24 : 4" class="app-card flex-grow-1"
                                to="/equ" rounded="xl" :class="{ 'card-active': isHovering }">
                                <div class="card-glass-overlay"></div>
                                <div class="card-content pa-8">
                                    <v-avatar color="primary" size="84" class="mb-6 elevation-8 icon-container">
                                        <v-icon icon="mdi-truck-cargo-container" size="42"></v-icon>
                                    </v-avatar>
                                    <h2 class="text-h4 font-weight-bold mb-4">Equipment Utilization Training</h2>
                                    <p class="text-body-1 text-medium-emphasis mb-6">
                                        3D simulator for container loading and forklift training.
                                        Optimize space utilization and operational safety in a risk-free digital
                                        environment.
                                    </p>
                                    <div class="d-flex align-center mt-auto">
                                        <span
                                            class="text-primary font-weight-bold text-uppercase letter-spacing-1">Launch
                                            Simulator</span>
                                        <v-icon icon="mdi-arrow-right" color="primary"
                                            class="ml-2 arrow-animation"></v-icon>
                                    </div>
                                </div>
                            </v-card>
                        </v-hover>
                    </v-col>

                    <!-- Warehouse Mapping Visualizer -->
                    <v-col cols="12" md="5" lg="4" class="d-flex">
                        <v-hover v-slot="{ isHovering, props }">
                            <v-card v-bind="props" :elevation="isHovering ? 24 : 4" class="app-card flex-grow-1"
                                to="/mapping" rounded="xl" :class="{ 'card-active': isHovering }">
                                <div class="card-glass-overlay"></div>
                                <div class="card-content pa-8">
                                    <v-avatar color="primary" size="84" class="mb-6 elevation-8 icon-container">
                                        <v-icon icon="mdi-view-quilt-outline" size="42"></v-icon>
                                    </v-avatar>
                                    <h2 class="text-h4 font-weight-bold mb-4">Warehouse Mapping Visualizer</h2>
                                    <p class="text-body-1 text-medium-emphasis mb-6">
                                        Full-scale 3D digital twin of your warehouse facility.
                                        Visualize storage locations, monitor occupancy, and identify layout anomalies
                                        instantly.
                                    </p>
                                    <div class="d-flex align-center mt-auto">
                                        <span class="text-primary font-weight-bold text-uppercase letter-spacing-1">Open
                                            Visualizer</span>
                                        <v-icon icon="mdi-arrow-right" color="primary"
                                            class="ml-2 arrow-animation"></v-icon>
                                    </div>
                                </div>
                            </v-card>
                        </v-hover>
                    </v-col>
                </v-row>
            </v-container>

            <!-- Features Quick Look -->
            <v-container class="py-16">
                <v-divider class="mb-16 opacity-10"></v-divider>
                <v-row>
                    <v-col cols="12" sm="4" class="px-6">
                        <div class="feature-item">
                            <v-icon icon="mdi-lightning-bolt" color="primary" class="mb-4"></v-icon>
                            <h3 class="text-h6 font-weight-bold mb-2">High Performance</h3>
                            <p class="text-body-2 text-disabled">Optimized for handling millions of spatial data points
                                with zero lag.</p>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="4" class="px-6">
                        <div class="feature-item">
                            <v-icon icon="mdi-cube-outline" color="primary" class="mb-4"></v-icon>
                            <h3 class="text-h6 font-weight-bold mb-2">3D Real-time</h3>
                            <p class="text-body-2 text-disabled">Powered by Three.js for immersive visualizations.</p>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="4" class="px-6">
                        <div class="feature-item">
                            <v-icon icon="mdi-database-import" color="primary" class="mb-4"></v-icon>
                            <h3 class="text-h6 font-weight-bold mb-2">Data Driven</h3>
                            <p class="text-body-2 text-disabled">Seamlessly import your warehouse layouts via CSV.</p>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <!-- Footer -->
        <v-footer>
            <v-container class="mt-4">
                <v-row class="mb-4">
                    <v-col cols="12" md="4">
                        <p>[
                            <v-btn variant="text" size="small" href="https://jonathanlawhh.com/" target="_blank">
                                <strong>Jonathan Law Hui Hao</strong>
                            </v-btn>
                            ]
                        </p>
                    </v-col>
                    <v-col cols="12" md="8">
                        <p class="text-right">
                            [
                            <v-btn variant="text" size="small" href="https://jonathanlawhh.com/works/ai/"
                                target="_blank">Other
                                Projects
                            </v-btn>
                            ,
                            <v-btn variant="text" size="small"
                                href="https://github.com/jonathanlawhh/warehouse-mapping-tool" target="_blank">Source
                                Code
                            </v-btn>
                            ,
                            <v-btn variant="text" size="small" href="https://jonathanlawhh.medium.com/"
                                target="_blank">Blog</v-btn>
                            ]
                        </p>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>
    </div>
</template>

<script setup lang="ts">
/**
 * Redesigned index home page for Warehouse Tools.
 * Features a modern, premium look with glassmorphism and animated background.
 */

useHead({
    title: 'Warehouse Tools | Advanced Spatial Optimization',
    meta: [
        { name: 'description', content: 'Digital twins and spatial intelligence for modern logistics. Equipment utilization and warehouse mapping visualizer.' }
    ]
})
</script>

<style scoped>
.landing-page {
    background-color: #020617;
    min-height: 100vh;
    color: white;
    position: relative;
    overflow-x: hidden;
}

.animated-background {
    position: fixed;
    inset: 0;
    z-index: 0;
}

.grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(to right, rgba(255, 77, 0, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 77, 0, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
}

.glow-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.15;
    z-index: 0;
}

.sphere-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #ff4d00, transparent);
    top: -200px;
    right: -100px;
    animation: drift 20s infinite alternate ease-in-out;
}

.sphere-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #ff7f00, transparent);
    bottom: -150px;
    left: -100px;
    animation: drift 25s infinite alternate-reverse ease-in-out;
}

@keyframes drift {
    from {
        transform: translate(0, 0);
    }

    to {
        transform: translate(100px, 50px);
    }
}

/* Floating Cubes Styling */
.floating-cubes-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.floating-cube {
    position: absolute;
    width: 40px;
    height: 40px;
    background: rgba(255, 77, 0, 0.05);
    border: 1px solid rgba(255, 77, 0, 0.2);
    backdrop-filter: blur(4px);
    border-radius: 8px;
    animation: float-around 15s infinite ease-in-out;
    box-shadow: 0 0 15px rgba(255, 77, 0, 0.05);
}

.cube-1 {
    top: 15%;
    left: 10%;
    --tx: 30px;
    --ty: -50px;
    animation-delay: 0s;
}

.cube-2 {
    top: 25%;
    right: 15%;
    --tx: -40px;
    --ty: 60px;
    animation-delay: -2s;
    width: 60px;
    height: 60px;
}

.cube-3 {
    bottom: 20%;
    left: 20%;
    --tx: 50px;
    --ty: 40px;
    animation-delay: -5s;
    width: 30px;
    height: 30px;
}

.cube-4 {
    bottom: 15%;
    right: 10%;
    --tx: -60px;
    --ty: -30px;
    animation-delay: -7s;
}

.cube-5 {
    top: 60%;
    left: 5%;
    --tx: 20px;
    --ty: 80px;
    animation-delay: -3s;
    width: 50px;
    height: 50px;
}

.cube-6 {
    top: 40%;
    right: 5%;
    --tx: -30px;
    --ty: -40px;
    animation-delay: -8s;
}

.cube-7 {
    top: 5%;
    right: 40%;
    --tx: 10px;
    --ty: 20px;
    animation-delay: -10s;
    width: 25px;
    height: 25px;
}

.cube-8 {
    bottom: 40%;
    right: 30%;
    --tx: -40px;
    --ty: 40px;
    animation-delay: -4s;
}

@keyframes float-around {

    0%,
    100% {
        transform: translate(0, 0) rotate(0deg);
    }

    50% {
        transform: translate(var(--tx), var(--ty)) rotate(180deg);
    }
}

/* UI Elements */
.z-index-1 {
    z-index: 1;
}

.title-glow {
    text-shadow: 0 0 20px rgba(255, 77, 0, 0.3), 0 0 40px rgba(255, 77, 0, 0.1);
    letter-spacing: -2px;
}

.max-width-700 {
    max-width: 700px;
}

.app-card {
    background: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(12px);
    overflow: hidden;
    position: relative;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.card-glass-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
    pointer-events: none;
}

.app-card:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 77, 0, 0.3) !important;
    background: rgba(15, 23, 42, 0.8) !important;
}

.icon-container {
    transition: all 0.4s ease;
}

.app-card:hover .icon-container {
    transform: scale(1.1) rotate(5deg);
    background-color: #ff4d00 !important;
}

.arrow-animation {
    transition: transform 0.3s ease;
}

.app-card:hover .arrow-animation {
    transform: translateX(5px);
}

.letter-spacing-1 {
    letter-spacing: 1px;
}

.feature-item {
    transition: transform 0.3s ease;
}

.feature-item:hover {
    transform: translateY(-5px);
}

.border-t {
    border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

@media (max-width: 960px) {
    .text-h1 {
        font-size: 3rem !important;
    }
}
</style>
