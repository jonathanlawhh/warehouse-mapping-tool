<template>
    <div>
        <!-- Navigation Drawer for Controls -->
        <AppSidebar app-link="/mapping" app-icon="mdi-map">
            <template #default>
                <div class="mb-6 mt-16">
                    <div class="text-overline mb-2">Import Goods</div>
                    <v-file-input label="Upload CSV File" prepend-icon="mdi-file-upload" accept=".csv"
                        variant="outlined" density="compact" hide-details @change="handleCSVUpload"></v-file-input>
                    <div class="text-caption mt-1 text-medium-emphasis">
                        Format: id, name, length, width, height, weight, color
                    </div>
                    <v-btn href="/template/equ_template.csv" download target="_blank"
                        variant="text" size="small" color="primary" class="mt-2 px-0 font-weight-bold"
                        prepend-icon="mdi-download">
                        Download Template
                    </v-btn>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Inventory</div>
                    <div class="text-caption text-medium-emphasis mb-2">Select goods to load</div>

                    <div class="goods-list">
                        <v-card v-for="good in inventoryGoods" :key="good.index"
                            class="mb-2 cursor-pointer transition-fast-in-fast-out"
                            :class="{ 'border-primary': selectedGoodId === good.id + '_' + good.index, 'opacity-50': good.hidden }"
                            variant="outlined" @click="selectGood(good, $event)">
                            <v-card-text class="pa-3 d-flex align-center">
                                <v-avatar :color="good.color" size="32" class="mr-3 rounded"></v-avatar>
                                <div>
                                    <div class="font-weight-bold text-body-2">{{ good.name }}</div>
                                    <div class="text-caption text-medium-emphasis">
                                        {{ good.length }}x{{ good.width }}x{{ good.height }}mm • {{ good.weight }}kg
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </div>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Actions</div>
                    <v-row dense>
                        <v-col cols="12">
                            <v-btn color="success" class="mb-2" block @click="completeLoading">Complete Loading</v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn color="warning" variant="outlined" block @click="undoLast">Undo</v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn color="error" variant="outlined" block @click="resetLoader">Reset</v-btn>
                        </v-col>
                    </v-row>
                </div>
            </template>
        </AppSidebar>

        <!-- Main Content (3D Canvas) -->
        <v-main class="bg-black pa-0">

            <!-- Floating Header Stats -->
            <AppOverlay position="top" padding="pa-4" style="min-width: 400px;">
                <div class="d-flex justify-space-between align-center">
                    <div class="stat-item text-center">
                        <div class="text-caption text-medium-emphasis">Total Volume</div>
                        <div class="text-h6 font-weight-bold"><span class="text-primary">{{ stats.volume }}</span> <span
                                class="text-caption">m³</span></div>
                    </div>
                    <v-divider vertical class="mx-4"></v-divider>
                    <div class="stat-item text-center">
                        <div class="text-caption text-medium-emphasis">Total Weight</div>
                        <div class="text-h6 font-weight-bold"><span class="text-secondary">{{ stats.weight }}</span>
                            <span class="text-caption">kg</span>
                        </div>
                    </div>
                    <v-divider vertical class="mx-4"></v-divider>
                    <div class="stat-item flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">Occupancy ({{ stats.utilization }}%)</div>
                        <v-progress-linear :model-value="stats.utilization" color="primary" height="8"
                            rounded></v-progress-linear>
                    </div>
                </div>
            </AppOverlay>

            <!-- Instructions Toast -->
            <AppOverlay position="bottom" padding="pa-3">
                <div class="d-flex align-center">
                    <v-icon color="info" class="mr-2">mdi-information</v-icon>
                    <div class="text-body-2">Select a good and press <v-chip size="x-small">E</v-chip> to place. Press
                        <v-chip size="x-small">R</v-chip> to rotate. Use <v-chip size="x-small">WASD</v-chip> to fly.
                    </div>
                </div>
            </AppOverlay>

            <div ref="container" class="canvas-container"></div>

            <!-- Completion Modal -->
            <v-dialog v-model="completionModal" max-width="400" persistent>
                <v-card class="pa-4 text-center glass-card" style="background: rgba(15, 23, 42, 0.95) !important;">
                    <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
                    <h2 class="text-h4 font-weight-bold mb-6">Loading Complete!</h2>

                    <v-row class="mb-6 text-left">
                        <v-col cols="6" class="py-2 border-b">
                            <span class="text-medium-emphasis">Items Loaded:</span>
                        </v-col>
                        <v-col cols="6" class="py-2 border-b text-right font-weight-bold">
                            {{ stats.count }}
                        </v-col>
                        <v-col cols="6" class="py-2 border-b">
                            <span class="text-medium-emphasis">Utilization:</span>
                        </v-col>
                        <v-col cols="6" class="py-2 border-b text-right font-weight-bold">
                            {{ stats.utilization }}%
                        </v-col>
                        <v-col cols="6" class="py-2 border-b">
                            <span class="text-medium-emphasis">Total Weight:</span>
                        </v-col>
                        <v-col cols="6" class="py-2 border-b text-right font-weight-bold">
                            {{ stats.weight }} kg
                        </v-col>
                    </v-row>

                    <v-btn color="primary" block size="large" @click="restartTraining">Restart Training</v-btn>
                </v-card>
            </v-dialog>

        </v-main>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CONFIG, INITIAL_GOODS, LoadingManager } from '~/utils/simulator';

useHead({
    title: 'Equipment Utilization | Warehouse Mapping Tool'
});

const container = ref(null);
const completionModal = ref(false);

const stats = reactive({
    volume: '0.00',
    weight: '0',
    utilization: '0.0',
    count: 0
});

const inventoryGoods = ref([]);
const selectedGoodId = ref(null);

let scene, camera, renderer, controls;
let manager;
let selectedGood = null;
let selectedSampleMesh = null;
let rotationY = 0;
const loadedMeshes = [];
const sampleMeshes = [];
const placementHistory = [];
let ghostGroup, ghostMesh;

const keys = { w: false, a: false, s: false, d: false };
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function initThree() {
    if (!container.value) return;

    manager = new LoadingManager();

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(-10, 5, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    ghostGroup = new THREE.Group();
    scene.add(ghostGroup);

    createContainer();
    initInventory();
    createSamples();

    animate();
}

function createContainer() {
    const { length, width, height } = CONFIG.container;
    const s = CONFIG.scale;

    const geometry = new THREE.BoxGeometry(length * s, height * s, width * s);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0x00f2ff,
        transparent: true,
        opacity: 0.3
    }));
    line.position.y = (height * s) / 2;
    scene.add(line);

    const floorGeo = new THREE.PlaneGeometry(length * s, width * s);
    const floorMat = new THREE.MeshPhongMaterial({
        color: 0x0a0a1a,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
}

let currentGoods = [...INITIAL_GOODS];

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.trim().split('\n');
        if (lines.length < 2) return;
        const results = [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const colMap = {};
        headers.forEach((h, i) => colMap[h] = i);
        for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',');
            if (vals.length < 5) continue;
            results.push({
                id: String(vals[colMap['id'] || 0]).trim(),
                name: String(vals[colMap['name'] || 1]).trim(),
                length: parseInt(vals[colMap['length'] || 2]) || 0,
                width: parseInt(vals[colMap['width'] || 3]) || 0,
                height: parseInt(vals[colMap['height'] || 4]) || 0,
                weight: parseInt(vals[colMap['weight'] || 5]) || 0,
                color: String(vals[colMap['color'] || 6]).trim() || '#ffffff'
            });
        }
        if (results.length > 0) {
            currentGoods = results;
            resetLoader();
            initInventory();
            createSamples();
        }
    };
    reader.readAsText(file);
}

function initInventory() {
    inventoryGoods.value = currentGoods.map((g, i) => ({ ...g, index: i, hidden: false }));
}

function createSamples() {
    sampleMeshes.forEach(m => scene.remove(m));
    sampleMeshes.length = 0;

    const s = CONFIG.scale;
    currentGoods.forEach((good, index) => {
        const geo = new THREE.BoxGeometry(good.length * s, good.height * s, good.width * s);
        const mat = new THREE.MeshPhongMaterial({ color: good.color, transparent: true, opacity: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { goodId: good.id, index };

        mesh.position.set(-8, (good.height * s) / 2, (index - 2) * 1);
        scene.add(mesh);
        sampleMeshes.push(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
        mesh.add(line);
    });
}

function selectGood(good) {
    if (good.hidden) return;
    selectedGoodId.value = good.id + '_' + good.index;
    selectedGood = good;
    selectedSampleMesh = sampleMeshes.find(m => m.userData.index === good.index);
    rotationY = 0;
    updateGhost();
}

function updateGhost(isValid = true) {
    ghostGroup.clear();
    if (!selectedGood) return;

    const s = CONFIG.scale;
    const isRotated = Math.round(rotationY / (Math.PI / 2)) % 2 !== 0;
    const l = isRotated ? selectedGood.width : selectedGood.length;
    const w = isRotated ? selectedGood.length : selectedGood.width;
    const h = selectedGood.height;

    const geo = new THREE.BoxGeometry(l * s, h * s, w * s);
    const ghostColor = isValid ? selectedGood.color : 0xff3333;

    const mat = new THREE.MeshPhongMaterial({
        color: ghostColor,
        transparent: true,
        opacity: 0.5,
        shininess: 10
    });
    ghostMesh = new THREE.Mesh(geo, mat);
    ghostMesh.userData.lastValid = isValid;

    const edges = new THREE.EdgesGeometry(geo);
    const outlineColor = isValid ? 0x00f2ff : 0xff0000;
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: outlineColor }));
    ghostMesh.add(line);

    ghostGroup.add(ghostMesh);
}

function getPlacementPoint() {
    if (!selectedGood) return null;
    raycaster.setFromCamera(mouse, camera);

    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeHit = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(floorPlane, planeHit)) {
        const s = CONFIG.scale;
        let highestY = 0;

        const isRotated = Math.round(rotationY / (Math.PI / 2)) % 2 !== 0;
        const l = isRotated ? selectedGood.width : selectedGood.length;
        const w = isRotated ? selectedGood.length : selectedGood.width;

        const halfL = (l * s) / 2;
        const halfW = (w * s) / 2;

        const gMinX = planeHit.x - halfL;
        const gMaxX = planeHit.x + halfL;
        const gMinZ = planeHit.z - halfW;
        const gMaxZ = planeHit.z + halfW;

        for (const mesh of loadedMeshes) {
            const bbox = new THREE.Box3().setFromObject(mesh);
            const overlapX = gMinX < bbox.max.x && gMaxX > bbox.min.x;
            const overlapZ = gMinZ < bbox.max.z && gMaxZ > bbox.min.z;

            if (overlapX && overlapZ) {
                if (bbox.max.y > highestY) highestY = bbox.max.y;
            }
        }
        return new THREE.Vector3(planeHit.x, highestY, planeHit.z);
    }
    return null;
}

function placeGood(point) {
    if (!selectedGood) return;

    const s = CONFIG.scale;
    const isRotated = Math.round(rotationY / (Math.PI / 2)) % 2 !== 0;
    const l = isRotated ? selectedGood.width : selectedGood.length;
    const w = isRotated ? selectedGood.length : selectedGood.width;
    const h = selectedGood.height;

    const orientedGood = { ...selectedGood, length: l, width: w, height: h };

    const logicPos = {
        x: point.x / s,
        y: (point.y / s) + (h / 2) + s,
        z: point.z / s
    };

    const result = manager.addGood(orientedGood, logicPos);

    if (result.success) {
        const geo = new THREE.BoxGeometry(l * s, h * s, w * s);
        const mat = new THREE.MeshPhongMaterial({
            color: orientedGood.color,
            transparent: true,
            opacity: 0.9,
            shininess: 100
        });
        const mesh = new THREE.Mesh(geo, mat);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true }));
        mesh.add(line);

        mesh.position.set(point.x, point.y + (h * s) / 2, point.z);
        scene.add(mesh);
        loadedMeshes.push(mesh);

        placementHistory.push({
            mesh: mesh,
            goodIndex: selectedGood.index,
            sampleMesh: selectedSampleMesh
        });

        // Hide from inventory
        const invGood = inventoryGoods.value.find(g => g.index === selectedGood.index);
        if (invGood) invGood.hidden = true;

        if (selectedSampleMesh) {
            selectedSampleMesh.visible = false;
        }

        selectedGood = null;
        selectedGoodId.value = null;
        selectedSampleMesh = null;
        ghostGroup.clear();

        updateUI();
    }
}

function updateUI() {
    stats.volume = manager.totalVolume.toFixed(2);
    stats.weight = manager.totalWeight.toFixed(0);
    stats.utilization = manager.getUtilization().toFixed(1);
    stats.count = manager.loadedGoods.length;
}

function onMouseMove(event) {
    if (!selectedGood || !container.value) return;

    const rect = container.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const point = getPlacementPoint();
    if (point) {
        const s = CONFIG.scale;
        const isRotated = Math.round(rotationY / (Math.PI / 2)) % 2 !== 0;
        const l = isRotated ? selectedGood.width : selectedGood.length;
        const w = isRotated ? selectedGood.length : selectedGood.width;
        const h = selectedGood.height;

        const logicPos = {
            x: point.x / s,
            y: (point.y / s) + (h / 2) + s,
            z: point.z / s
        };

        const orientedGood = { ...selectedGood, length: l, width: w, height: h };
        const isValid = manager.isValidPlacement(orientedGood, logicPos);

        if (ghostMesh && ghostMesh.userData.lastValid !== isValid) {
            updateGhost(isValid);
            ghostMesh.userData.lastValid = isValid;
        }

        ghostGroup.position.set(point.x, point.y + (h * s) / 2, point.z);
        ghostGroup.visible = true;
    } else {
        ghostGroup.visible = false;
    }
}

function onKeyDown(event) {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = true;

    if (key === 'e') {
        if (!selectedGood) return;
        const point = getPlacementPoint();
        if (point) placeGood(point);
    }

    if (key === 'r') {
        if (selectedGood) {
            rotationY += Math.PI / 2;
            updateGhost();
        }
    }
}

function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = false;
}

function completeLoading() {
    updateUI();
    completionModal.value = true;
}

function undoLast() {
    if (placementHistory.length === 0) return;

    const lastPlacement = placementHistory.pop();
    manager.undoLastGood();

    scene.remove(lastPlacement.mesh);
    const index = loadedMeshes.indexOf(lastPlacement.mesh);
    if (index > -1) loadedMeshes.splice(index, 1);

    const invGood = inventoryGoods.value.find(g => g.index === lastPlacement.goodIndex);
    if (invGood) invGood.hidden = false;
    if (lastPlacement.sampleMesh) lastPlacement.sampleMesh.visible = true;

    updateUI();
}

function resetLoader() {
    manager.reset();
    loadedMeshes.forEach(m => scene.remove(m));
    loadedMeshes.length = 0;
    placementHistory.length = 0;

    sampleMeshes.forEach(m => { m.visible = true; });
    inventoryGoods.value.forEach(g => { g.hidden = false; });

    selectedGood = null;
    selectedGoodId.value = null;
    ghostGroup.clear();
    updateUI();
}

function restartTraining() {
    completionModal.value = false;
    resetLoader();
}

function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);

    const moveSpeed = 0.2;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    if (keys.w) camera.position.addScaledVector(direction, moveSpeed);
    if (keys.s) camera.position.addScaledVector(direction, -moveSpeed);
    if (keys.a) camera.position.addScaledVector(right, moveSpeed);
    if (keys.d) camera.position.addScaledVector(right, -moveSpeed);

    controls.update();
    renderer.render(scene, camera);
}

function handleResize() {
    if (!camera || !renderer || !container.value) return;
    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

onMounted(() => {
    // Wait for DOM to register layout logic
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    initThree();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    renderer?.dispose();
});

</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
    cursor: crosshair;
}

.goods-list {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;
}

/* Customize scrollbar */
.goods-list::-webkit-scrollbar {
    width: 6px;
}

.goods-list::-webkit-scrollbar-track {
    background: transparent;
}

.goods-list::-webkit-scrollbar-thumb {
    background-color: rgba(255, 77, 0, 0.5);
    border-radius: 4px;
}

.cursor-pointer {
    cursor: pointer;
}

.border-primary {
    border-color: rgb(var(--v-theme-primary)) !important;
    background-color: rgba(var(--v-theme-primary), 0.1);
}

.glass-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
</style>
