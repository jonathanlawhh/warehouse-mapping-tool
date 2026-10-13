<template>
    <div>
        <!-- Navigation Drawer for Controls -->
        <AppSidebar app-link="/equ" app-icon="mdi-forklift">
            <template #default>
                <div class="mb-6 mt-16">
                    <div class="text-overline mb-2">Import Layout</div>
                    <v-file-input label="Upload CSV File" prepend-icon="mdi-file-upload" accept=".csv"
                        variant="outlined" density="compact" hide-details @change="handleCSVUpload"></v-file-input>
                    <div class="text-caption mt-1 text-medium-emphasis">
                        Format: x, y, z, zone, name, occupied, size_x, size_y, size_z
                    </div>
                    <v-btn href="/template/mapping_template.csv" download target="_blank"
                        variant="text" size="small" color="primary" class="mt-2 px-0 font-weight-bold"
                        prepend-icon="mdi-download">
                        Download Template
                    </v-btn>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Quick Stats</div>
                    <v-row dense>
                        <v-col cols="4">
                            <v-card variant="tonal" class="pa-2 text-center" color="primary">
                                <div class="text-caption">Total</div>
                                <div class="text-h6 font-weight-bold">{{ filteredCount }}</div>
                            </v-card>
                        </v-col>
                        <v-col cols="4">
                            <v-card variant="tonal" class="pa-2 text-center" color="error">
                                <div class="text-caption">Occupied</div>
                                <div class="text-h6 font-weight-bold">{{ filteredOccupiedCount }}</div>
                            </v-card>
                        </v-col>
                        <v-col cols="4">
                            <v-card variant="tonal" class="pa-2 text-center" color="secondary">
                                <div class="text-caption">Zones</div>
                                <div class="text-h6 font-weight-bold">{{ filteredZoneCount }}</div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Filters</div>
                    <v-list-subheader>Level Filter</v-list-subheader>
                    <v-slider v-model="levelFilter" :min="0" :max="maxLevels" :step="1" class="px-2" color="primary"
                        thumb-label track-color="surface-variant" @update:model-value="applyFilter">
                        <template v-slot:append>
                            <div class="text-body-2 font-weight-bold" style="width: 40px">
                                {{ levelFilter === 0 ? 'All' : levelFilter }}
                            </div>
                        </template>
                    </v-slider>

                    <v-autocomplete v-model="zoneFilter" :items="availableZones" density="compact" variant="outlined"
                        class="px-2" color="primary" multiple chips closable-chips clearable
                        placeholder="Search zones..." @update:model-value="applyFilter"></v-autocomplete>

                    <v-list-subheader>Occupancy Status</v-list-subheader>
                    <v-radio-group v-model="occupiedFilter" density="compact" class="px-2"
                        @update:model-value="applyFilter">
                        <v-radio label="Show All" value="all" color="primary"></v-radio>
                        <v-radio label="Occupied Only" value="occupied" color="error"></v-radio>
                        <v-radio label="Empty Only" value="empty" color="success"></v-radio>
                    </v-radio-group>

                    <v-divider class="my-3"></v-divider>

                    <v-switch v-model="visualizeOccupied" color="primary" density="compact" class="px-2"
                        label="Visualize Occupied" hide-details @update:model-value="updateColors"></v-switch>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="mb-6">
                    <div class="text-overline mb-2">Controls</div>
                    <v-row dense>
                        <v-col cols="12" class="mb-2" v-if="selectedData">
                            <v-card variant="tonal" color="info" class="pa-2">
                                <div class="text-caption text-medium-emphasis">Anchored Block</div>
                                <div class="text-body-2 font-weight-bold">{{ selectedData.name }}</div>
                                <div class="text-caption">Zone: {{ selectedData.zone }}</div>
                                <v-btn size="x-small" variant="text" color="error" class="px-0 mt-1" @click="clearAnchor">
                                    Clear Anchor
                                </v-btn>
                            </v-card>
                        </v-col>
                        <v-col cols="12">
                            <v-btn color="primary" variant="outlined" @click="resetView" block>Reset Camera</v-btn>
                        </v-col>
                    </v-row>
                </div>


            </template>
        </AppSidebar>

        <!-- Main Content (3D Canvas) -->
        <v-main class="bg-black pa-0">
            <AppOverlay position="bottom" padding="pa-3">
                <div class="d-flex align-center flex-wrap gap-2">
                    <v-icon color="info" class="mr-2">mdi-information</v-icon>
                    <div class="text-body-2">
                        Click block to <v-chip size="x-small" color="primary">Anchor Camera</v-chip>.
                        Use <v-chip size="x-small">W, A, S, D</v-chip> to fly.
                        Use <v-chip size="x-small">Q/E</v-chip> for up/down, <v-chip size="x-small">Shift</v-chip> for speed
                    </div>
                </div>
            </AppOverlay>
            <div ref="container" class="canvas-container">
                <!-- Tooltip Overlay -->
                <div v-if="hoveredData" class="custom-tooltip" :style="{
                    left: tooltipPos.x + 'px',
                    top: tooltipPos.y + 'px'
                }">
                    <div class="text-h6 mb-1">{{ hoveredData.name }}</div>
                    <v-chip :color="hoveredData.colorHex" size="small" class="font-weight-bold" variant="flat">
                        {{ hoveredData.zone }}
                    </v-chip>
                    <v-chip :color="hoveredData.occupied ? 'error' : 'success'" size="small"
                        class="font-weight-bold ml-2" variant="flat">
                        {{ hoveredData.occupied ? 'Occupied' : 'Empty' }}
                    </v-chip>
                </div>
            </div>
        </v-main>
    </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, onBeforeUnmount, ref, reactive, shallowRef } from 'vue';

useHead({
    title: 'Mapping | Warehouse Mapping Tool'
});

const CONFIG = {
    boxSize: { width: 1.0, height: 1.0, depth: 1.0 },
    gapBetweenRacks: 1,
    gapBetweenCompartments: 0.4,
    gapBetweenLevels: 0.2,
    colors: {
        background: 0x0f172a, // Rich modern tech slate navy
        box: 0x1e293b,
        boxEdge: 0x38bdf8,
        floor: 0x1e293b,     // Clean matte studio floor
    },
    rackSpacing: 8
};

const levelFilter = ref(0);
const zoneFilter = ref<string[]>([]);
const occupiedFilter = ref('all');
const visualizeOccupied = ref(false);
const maxLevels = ref(1);
const availableZones = ref<string[]>([]);
const locationData = shallowRef<any[]>([]);
const filteredCount = ref(0);
const filteredZoneCount = ref(0);
const filteredOccupiedCount = ref(0);
const hoveredData = ref<any>(null);
const tooltipPos = reactive({ x: 0, y: 0 });

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let instancedMesh: THREE.InstancedMesh | null = null;
let floor: THREE.Mesh | null = null;
const instanceDataMap = new Map<number, any>();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const selectedData = ref<any>(null);
let selectedInstanceId = -1;
let selectionBoxMesh: THREE.LineSegments | null = null;
let pointerDownPos = { x: 0, y: 0 };
let isCameraTransitioning = false;
let cameraLerpProgress = 0;
const cameraStartPos = new THREE.Vector3();
const cameraEndPos = new THREE.Vector3();
const targetStartPos = new THREE.Vector3();
const targetEndPos = new THREE.Vector3();
let hoveredInstanceId = -1;
const originalColor = new THREE.Color();
const highlightColor = new THREE.Color(0xffffff);
const sharedMatrix = new THREE.Matrix4();
const defaultCamPos = new THREE.Vector3(15, 90, 150);

const keys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };

function onKeyDown(event: KeyboardEvent) {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key as keyof typeof keys] = true;
    }
}

function onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key as keyof typeof keys] = false;
    }
}

function initThree() {
    if (!container.value) return;

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.background);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 90, 150);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false;
    container.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 600;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Uniform studio illumination (zero shadow, zero specular flare)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(60, 120, 80);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.5);
    fillLight.position.set(-60, 80, -60);
    fillLight.castShadow = false;
    scene.add(fillLight);

    // Completely matte, non-reflective floor with NO grid
    const floorGeometry = new THREE.PlaneGeometry(160, 160);
    const floorMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.floor
    });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    scene.add(floor);

    animate();
}

function renderLocations(locations: any[]) {
    if (!scene) return;

    clearAnchor();

    if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        (instancedMesh.material as THREE.Material).dispose();
        instancedMesh = null;
    }

    instanceDataMap.clear();

    if (locations.length === 0) return;

    const geometry = new THREE.BoxGeometry(
        CONFIG.boxSize.width,
        CONFIG.boxSize.height,
        CONFIG.boxSize.depth
    );
    // Crisp, bright matte material without specular reflections
    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        reflectivity: 0
    });

    instancedMesh = new THREE.InstancedMesh(geometry, material, locations.length);

    const color = new THREE.Color();

    const compWidth = CONFIG.boxSize.depth + CONFIG.gapBetweenCompartments;
    const levelHeight = CONFIG.boxSize.height + CONFIG.gapBetweenLevels;

    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let maxL = 0;
    const zoneSet = new Set<string>();

    for (let i = 0; i < locations.length; i++) {
        const data = locations[i];
        const r = data.x;
        const c = data.y;
        const l = data.z;

        const xPos = (r - 1) * CONFIG.rackSpacing;
        const zPos = (c - 1) * compWidth;
        const yPos = (CONFIG.boxSize.height / 2) + (l - 1) * levelHeight;

        const scaleX = data.size_x || 1;
        const scaleY = data.size_y || 1;
        const scaleZ = data.size_z || 1;

        const adjustedX = xPos + (scaleX - 1) * (CONFIG.boxSize.width / 2);
        const adjustedY = yPos + (scaleY - 1) * (CONFIG.boxSize.height / 2);
        const adjustedZ = zPos + (scaleZ - 1) * (CONFIG.boxSize.depth / 2);

        // Manual matrix composition (translation and scale)
        const te = sharedMatrix.elements;
        te[0] = scaleX; te[4] = 0; te[8] = 0; te[12] = adjustedX;
        te[1] = 0; te[5] = scaleY; te[9] = 0; te[13] = adjustedY;
        te[2] = 0; te[6] = 0; te[10] = scaleZ; te[14] = adjustedZ;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

        instancedMesh.setMatrixAt(i, sharedMatrix);

        const zoneInfo = getZoneColor(data.zone, data.occupied);
        data.colorHex = zoneInfo.colorHex;
        color.setHex(zoneInfo.hex);
        instancedMesh.setColorAt(i, color);

        if (xPos < minX) minX = xPos;
        if (xPos > maxX) maxX = xPos;
        if (zPos < minZ) minZ = zPos;
        if (zPos > maxZ) maxZ = zPos;
        if (l > maxL) maxL = l;
        zoneSet.add(data.zone);

        instanceDataMap.set(i, data);
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    instancedMesh.position.x = -centerX;
    instancedMesh.position.z = -centerZ;

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    if (floor && scene) {
        const spanX = (maxX !== -Infinity && minX !== Infinity) ? (maxX - minX) : 0;
        const spanZ = (maxZ !== -Infinity && minZ !== Infinity) ? (maxZ - minZ) : 0;

        const floorWidth = Math.max(160, spanX + 160);
        const floorDepth = Math.max(160, spanZ + 160);

        floor.geometry.dispose();
        floor.geometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
    }

    maxLevels.value = maxL;
    availableZones.value = Array.from(zoneSet).sort();
    filteredCount.value = locations.length;
    filteredZoneCount.value = zoneSet.size;
    filteredOccupiedCount.value = locations.filter(l => l.occupied).length;
}

function getMax(arr: number[]): number {
    if (arr.length === 0) return 0;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

function selectBlock(instanceId: number) {
    if (!instancedMesh || !scene || !controls || !camera) return;

    const data = instanceDataMap.get(instanceId);
    if (!data) return;

    selectedInstanceId = instanceId;
    selectedData.value = data;

    // Get block world position & scale from instanceMatrix and mesh position
    const mat = new THREE.Matrix4();
    instancedMesh.getMatrixAt(instanceId, mat);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    mat.decompose(pos, quat, scale);
    pos.add(instancedMesh.position);

    // Create or update bounding box wireframe highlight
    if (selectionBoxMesh) {
        scene.remove(selectionBoxMesh);
        selectionBoxMesh.geometry.dispose();
        (selectionBoxMesh.material as THREE.Material).dispose();
        selectionBoxMesh = null;
    }

    const boxGeo = new THREE.BoxGeometry(
        CONFIG.boxSize.width * scale.x * 1.05,
        CONFIG.boxSize.height * scale.y * 1.05,
        CONFIG.boxSize.depth * scale.z * 1.05
    );
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        linewidth: 2,
        depthTest: false,
        transparent: true,
        opacity: 0.95
    });
    selectionBoxMesh = new THREE.LineSegments(edges, lineMat);
    selectionBoxMesh.renderOrder = 999;
    selectionBoxMesh.position.copy(pos);
    scene.add(selectionBoxMesh);

    // Transition camera to anchor onto the block
    targetStartPos.copy(controls.target);
    targetEndPos.copy(pos);

    cameraStartPos.copy(camera.position);
    const currentOffset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const desiredDistance = THREE.MathUtils.clamp(currentOffset.length(), 20, 60);
    const dir = currentOffset.normalize();
    if (dir.lengthSq() < 0.001) {
        dir.set(0.5, 0.5, 1).normalize();
    }
    cameraEndPos.copy(pos).addScaledVector(dir, desiredDistance);

    cameraLerpProgress = 0;
    isCameraTransitioning = true;
}

function clearAnchor() {
    selectedData.value = null;
    selectedInstanceId = -1;
    if (selectionBoxMesh && scene) {
        scene.remove(selectionBoxMesh);
        selectionBoxMesh.geometry.dispose();
        (selectionBoxMesh.material as THREE.Material).dispose();
        selectionBoxMesh = null;
    }
}

function resetView() {
    clearAnchor();
    if (!controls || !camera) return;

    targetStartPos.copy(controls.target);
    targetEndPos.set(0, 0, 0);

    cameraStartPos.copy(camera.position);
    cameraEndPos.copy(defaultCamPos);

    cameraLerpProgress = 0;
    isCameraTransitioning = true;
}

const zoneColorCache = new Map<string, { hex: number, colorHex: string }>();
function getZoneColor(zoneName: string, isOccupied = false): { hex: number, colorHex: string } {
    const isDarkened = visualizeOccupied.value && isOccupied;
    const cacheKey = `${zoneName}_${isDarkened ? 'occ' : 'default'}`;
    if (!zoneName) return { hex: 0x64748b, colorHex: '#64748b' };
    const cached = zoneColorCache.get(cacheKey);
    if (cached) return cached;

    let hash = 0;
    for (let i = 0; i < zoneName.length; i++) {
        hash = zoneName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    // When visualizeOccupied is ON and occupied: darker tone (34% lightness, 90% saturation). Default: bright zone color (58% lightness, 80% saturation)
    const lightness = isDarkened ? 34 : 58;
    const saturation = isDarkened ? 90 : 80;
    const color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    const hex = color.getHex();
    const result = { hex, colorHex: '#' + color.getHexString() };
    zoneColorCache.set(cacheKey, result);
    return result;
}

function updateColors() {
    if (!instancedMesh) return;
    const color = new THREE.Color();
    const total = locationData.value.length;

    for (let i = 0; i < total; i++) {
        const data = instanceDataMap.get(i);
        if (!data) continue;
        const zoneInfo = getZoneColor(data.zone, data.occupied);
        data.colorHex = zoneInfo.colorHex;
        if (i !== hoveredInstanceId) {
            color.setHex(zoneInfo.hex);
            instancedMesh.setColorAt(i, color);
        }
    }
    if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
    }
}

function applyFilter() {
    if (!instancedMesh) return;
    const compWidth = CONFIG.boxSize.depth + CONFIG.gapBetweenCompartments;
    const levelHeight = CONFIG.boxSize.height + CONFIG.gapBetweenLevels;
    const boxHeightHalf = CONFIG.boxSize.height / 2;

    let count = 0;
    let occupiedCount = 0;
    const activeZones = new Set<string>();
    const zonesInLevel = new Set<string>();
    const zoneFilterSet = new Set(zoneFilter.value);
    const hasZoneFilter = zoneFilterSet.size > 0;
    const currentLevelFilter = levelFilter.value;
    const currentOccupiedFilter = occupiedFilter.value;
    const dataList = locationData.value;
    const total = dataList.length;

    const te = sharedMatrix.elements;

    for (let i = 0; i < total; i++) {
        const data = dataList[i];
        const levelMatch = (currentLevelFilter === 0) || (data.z === currentLevelFilter);

        if (levelMatch) {
            zonesInLevel.add(data.zone);
        }

        const zoneMatch = !hasZoneFilter || zoneFilterSet.has(data.zone);

        const occupancyMatch =
            (currentOccupiedFilter === 'all') ||
            (currentOccupiedFilter === 'occupied' && data.occupied) ||
            (currentOccupiedFilter === 'empty' && !data.occupied);

        if (levelMatch && zoneMatch && occupancyMatch) {
            count++;
            if (data.occupied) occupiedCount++;
            activeZones.add(data.zone);
            const xPos = (data.x - 1) * CONFIG.rackSpacing;
            const yPos = boxHeightHalf + (data.z - 1) * levelHeight;
            const zPos = (data.y - 1) * compWidth;

            const scaleX = data.size_x || 1;
            const scaleY = data.size_y || 1;
            const scaleZ = data.size_z || 1;

            const adjustedX = xPos + (scaleX - 1) * (CONFIG.boxSize.width / 2);
            const adjustedY = yPos + (scaleY - 1) * (CONFIG.boxSize.height / 2);
            const adjustedZ = zPos + (scaleZ - 1) * (CONFIG.boxSize.depth / 2);

            te[0] = scaleX; te[4] = 0; te[8] = 0; te[12] = adjustedX;
            te[1] = 0; te[5] = scaleY; te[9] = 0; te[13] = adjustedY;
            te[2] = 0; te[6] = 0; te[10] = scaleZ; te[14] = adjustedZ;
            te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
            instancedMesh.setMatrixAt(i, sharedMatrix);
        } else {
            // Set scale to 0
            te[0] = 0; te[4] = 0; te[8] = 0; te[12] = 0;
            te[1] = 0; te[5] = 0; te[9] = 0; te[13] = 0;
            te[2] = 0; te[6] = 0; te[10] = 0; te[14] = 0;
            te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
            instancedMesh.setMatrixAt(i, sharedMatrix);
        }
    }
    filteredCount.value = count;
    filteredOccupiedCount.value = occupiedCount;
    filteredZoneCount.value = activeZones.size;
    availableZones.value = Array.from(zonesInLevel).sort();
    instancedMesh.instanceMatrix.needsUpdate = true;
}

function animate() {
    if (!renderer || !scene || !camera) return;
    requestAnimationFrame(animate);

    if (keys.w || keys.a || keys.s || keys.d || keys.q || keys.e) {
        const flySpeed = keys.shift ? 8.0 : 3.0;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);

        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

        if (keys.w) {
            camera.position.addScaledVector(forward, flySpeed);
            controls?.target.addScaledVector(forward, flySpeed);
        }
        if (keys.s) {
            camera.position.addScaledVector(forward, -flySpeed);
            controls?.target.addScaledVector(forward, -flySpeed);
        }
        if (keys.a) {
            camera.position.addScaledVector(right, -flySpeed);
            controls?.target.addScaledVector(right, -flySpeed);
        }
        if (keys.d) {
            camera.position.addScaledVector(right, flySpeed);
            controls?.target.addScaledVector(right, flySpeed);
        }
        if (keys.q) {
            camera.position.addScaledVector(camera.up, -flySpeed);
            controls?.target.addScaledVector(camera.up, -flySpeed);
        }
        if (keys.e) {
            camera.position.addScaledVector(camera.up, flySpeed);
            controls?.target.addScaledVector(camera.up, flySpeed);
        }
    }

    if (isCameraTransitioning && controls && camera) {
        cameraLerpProgress += 0.04;
        if (cameraLerpProgress >= 1) {
            cameraLerpProgress = 1;
            isCameraTransitioning = false;
        }
        // Smooth ease-out cubic
        const t = 1 - Math.pow(1 - cameraLerpProgress, 3);
        camera.position.lerpVectors(cameraStartPos, cameraEndPos, t);
        controls.target.lerpVectors(targetStartPos, targetEndPos, t);
    }

    controls?.update();

    raycaster.setFromCamera(mouse, camera);

    if (instancedMesh) {
        const intersection = raycaster.intersectObject(instancedMesh);
        if (intersection.length > 0) {
            const instanceId = intersection[0].instanceId!;
            if (hoveredInstanceId !== instanceId) {
                if (hoveredInstanceId !== -1) {
                    const oldData = instanceDataMap.get(hoveredInstanceId);
                    if (oldData) {
                        originalColor.set(oldData.colorHex);
                        instancedMesh.setColorAt(hoveredInstanceId, originalColor);
                    }
                }
                hoveredInstanceId = instanceId;
                hoveredData.value = instanceDataMap.get(instanceId);
                instancedMesh.setColorAt(hoveredInstanceId, highlightColor);
                instancedMesh.instanceColor!.needsUpdate = true;
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (hoveredInstanceId !== -1) {
                const oldData = instanceDataMap.get(hoveredInstanceId);
                if (oldData) {
                    originalColor.set(oldData.colorHex);
                    instancedMesh.setColorAt(hoveredInstanceId, originalColor);
                    instancedMesh.instanceColor!.needsUpdate = true;
                }
                hoveredInstanceId = -1;
                hoveredData.value = null;
                document.body.style.cursor = 'default';
            }
        }
    }
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

function onPointerDown(event: MouseEvent) {
    pointerDownPos = { x: event.clientX, y: event.clientY };
}

function onPointerUp(event: MouseEvent) {
    const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    // Ignore drags
    if (dist > 5) return;
    if (!instancedMesh || !camera) return;

    // Use current raycaster to select clicked block
    const intersection = raycaster.intersectObject(instancedMesh);
    if (intersection.length > 0 && intersection[0].instanceId !== undefined) {
        const instanceId = intersection[0].instanceId;
        selectBlock(instanceId);
    }
}

function onPointerMove(event: MouseEvent) {
    if (!container.value) return;
    const rect = container.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    tooltipPos.x = event.clientX + 20;
    tooltipPos.y = event.clientY + 20;
}

function generateMockData() {
    const data = [];
    for (let x = 1; x <= 6; x++) {
        for (let y = 1; y <= 30; y++) {
            for (let z = 1; z <= 8; z++) {
                let zoneType = 'STORAGE';
                if (z <= 2) zoneType = 'PICKING';
                else if (z >= 5) zoneType = 'OVERFLOW';
                data.push({
                    x: x, y: y, z: z,
                    zone: `${zoneType}_${x}`,
                    name: `LOC-${x.toString().padStart(2, '0')}-${y.toString().padStart(2, '0')}-${z}`,
                    occupied: Math.random() > 0.8,
                    size_x: 1,
                    size_y: 1,
                    size_z: 1
                });
            }
        }
    }
    return data;
}

function handleCSVUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) return;
        const results = [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const colMap: any = {};
        headers.forEach((h, i) => colMap[h] = i);
        for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',');
            if (vals.length < 5) continue;
            const occupiedVal = String(vals[colMap['occupied'] || 5] || '').toLowerCase().trim();
            results.push({
                x: parseInt(vals[colMap['x'] || 0]) || 0,
                y: parseInt(vals[colMap['y'] || 1]) || 0,
                z: parseInt(vals[colMap['z'] || 2]) || 0,
                zone: String(vals[colMap['zone'] || 3]).toUpperCase().replaceAll('"', "").trim(),
                name: String(vals[colMap['name'] || 4]).toUpperCase().replaceAll('"', "").trim(),
                occupied: occupiedVal === 'true' || occupiedVal === '1' || occupiedVal === 'yes',
                size_x: parseInt(vals[colMap['size_x']]) || 1,
                size_y: parseInt(vals[colMap['size_y']]) || 1,
                size_z: parseInt(vals[colMap['size_z']]) || 1
            });
        }
        if (results.length > 0) {
            locationData.value = results;
            renderLocations(results);
        }
    };
    reader.readAsText(file);
}

onMounted(() => {
    initThree();
    locationData.value = generateMockData();
    renderLocations(locationData.value);
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    if (container.value) {
        container.value.addEventListener('pointerdown', onPointerDown);
        container.value.addEventListener('pointerup', onPointerUp);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (container.value) {
        container.value.removeEventListener('pointerdown', onPointerDown);
        container.value.removeEventListener('pointerup', onPointerUp);
    }
    clearAnchor();
    renderer?.dispose();
});
</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
}

.custom-tooltip {
    position: fixed;
    pointer-events: none;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    border-radius: 12px;
    color: white;
    z-index: 1000;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    min-width: 180px;
}
</style>
