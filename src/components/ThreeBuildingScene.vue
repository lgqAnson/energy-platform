<template>
  <!-- Three.js 渲染容器 -->
  <div ref="container" class="three-container" />
</template>

<script setup lang="ts">
/**
 * ==============================================================================
 * ThreeBuildingScene.vue
 * ==============================================================================
 * 基于 Three.js 的 3D 园区场景组件
 * 
 * 功能说明：
 *   - 使用 Three.js 创建可交互的 3D 建筑群场景
 *   - 包含建筑物、绿色屋顶、道路、车辆、树木等元素
 *   - 支持鼠标旋转、缩放、平移查看场景
 *   - 包含环境光、方向光及阴影效果
 * 
 * 使用方式：
 *   <ThreeBuildingScene />
 * 
 * 依赖：
 *   - three
 *   - @types/three
 * ==============================================================================
 */

import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ============================================
// 响应式引用与状态变量
// ============================================

/** DOM 容器引用，Three.js 渲染器将挂载到此元素上 */
const container = ref<HTMLDivElement>()

/** Three.js 场景对象，用于管理所有 3D 对象 */
let scene: THREE.Scene

/** 透视相机，定义观察视角 */
let camera: THREE.PerspectiveCamera

/** WebGL 渲染器，负责将场景渲染到画布 */
let renderer: THREE.WebGLRenderer

/** 轨道控制器，支持鼠标交互（旋转、缩放、平移） */
let controls: OrbitControls

/** 动画帧请求 ID，用于取消动画循环 */
let animationId: number

/** 需要每帧更新的动画对象列表 */
const animatedObjects: { update: (time: number) => void }[] = []

/** 全局时钟，用于计算动画时间 */
const clock = new THREE.Clock()

// ============================================
// 场景初始化
// ============================================

/**
 * 初始化 Three.js 场景
 * 执行流程：创建场景→相机→渲染器→控制器→光照→地面→道路→建筑→储能→光伏→充电桩→绿化→路灯→围栏→云朵→车辆→动画
 */
function init() {
  if (!container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight

  // ---------- 1. 创建场景 ----------
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a2a3a)
  scene.fog = new THREE.FogExp2(0x1a2a3a, 0.0015)

  // ---------- 2. 创建透视相机 ----------
  camera = new THREE.PerspectiveCamera(50, w / h, 1, 3000)
  camera.position.set(350, 220, 350)
  camera.lookAt(0, 10, 0)

  // ---------- 3. 创建 WebGL 渲染器 ----------
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  container.value.appendChild(renderer.domElement)

  // ---------- 4. 配置轨道控制器 ----------
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2.05
  controls.minDistance = 80
  controls.maxDistance = 900
  controls.target.set(0, 10, 0)

  // ---------- 5. 添加光照系统 ----------
  const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a4a2a, 0.5)
  scene.add(hemiLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2)
  dirLight.position.set(300, 500, 200)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 4096
  dirLight.shadow.mapSize.height = 4096
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 1500
  const d = 500
  dirLight.shadow.camera.left = -d
  dirLight.shadow.camera.right = d
  dirLight.shadow.camera.top = d
  dirLight.shadow.camera.bottom = -d
  dirLight.shadow.bias = -0.0005
  scene.add(dirLight)
  const fillLight = new THREE.DirectionalLight(0xaaccff, 0.3)
  fillLight.position.set(-200, 150, -200)
  scene.add(fillLight)

  // ---------- 6. 创建地面 ----------
  createGround()

  // ---------- 7. 创建道路网 ----------
  createRoadNetwork()

  // ---------- 8. 创建主控制楼 ----------
  createMainBuilding(0, -60, 0)

  // ---------- 9. 创建储能集装箱阵列 ----------
  createEnergyStorageArea(-180, 20)
  createEnergyStorageArea(180, 20)

  // ---------- 10. 创建光伏板阵列 ----------
  createSolarPanelArea(0, -220)
  createSolarPanelArea(0, 180)

  // ---------- 11. 创建充电桩区 ----------
  createChargingStationArea(120, 140)

  // ---------- 12. 创建绿化 ----------
  createVegetation()

  // ---------- 13. 创建路灯 ----------
  createStreetLights()

  // ---------- 14. 创建围栏 ----------
  createFence()

  // ---------- 15. 创建云朵 ----------
  createClouds()

  // ---------- 16. 创建车辆并添加动画 ----------
  createAnimatedCars()

  // ---------- 17. 启动动画循环 ----------
  animate()
}

// ============================================
// 地面创建
// ============================================
function createGround() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#4a7c3f'; ctx.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 50000; i++) {
    const x = Math.random() * 1024, y = Math.random() * 1024
    const g = 80 + Math.random() * 60
    ctx.fillStyle = `rgb(${g * 0.4}, ${g}, ${g * 0.3})`
    ctx.fillRect(x, y, 2, 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

// ============================================
// 道路网创建
// ============================================
function createRoadNetwork() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 })
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(1200, 50), roadMat)
  mainRoad.rotation.x = -Math.PI / 2
  mainRoad.position.set(0, 0.05, 80)
  mainRoad.receiveShadow = true
  scene.add(mainRoad)

  const vertRoad1 = new THREE.Mesh(new THREE.PlaneGeometry(50, 800), roadMat)
  vertRoad1.rotation.x = -Math.PI / 2
  vertRoad1.position.set(-100, 0.05, 0)
  vertRoad1.receiveShadow = true
  scene.add(vertRoad1)

  const vertRoad2 = new THREE.Mesh(new THREE.PlaneGeometry(50, 800), roadMat)
  vertRoad2.rotation.x = -Math.PI / 2
  vertRoad2.position.set(100, 0.05, 0)
  vertRoad2.receiveShadow = true
  scene.add(vertRoad2)

  for (let i = -550; i < 550; i += 40) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(20, 2), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(i, 0.1, 80)
    scene.add(line)
  }
  for (let i = -350; i < 350; i += 40) {
    const line1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 20), lineMat)
    line1.rotation.x = -Math.PI / 2
    line1.position.set(-100, 0.1, i)
    scene.add(line1)
    const line2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 20), lineMat)
    line2.rotation.x = -Math.PI / 2
    line2.position.set(100, 0.1, i)
    scene.add(line2)
  }
  // 斑马线
  for (let i = -4; i <= 4; i++) {
    const s1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.5), lineMat)
    s1.rotation.x = -Math.PI / 2
    s1.position.set(-100 + i * 5.5, 0.1, 80)
    scene.add(s1)
    const s2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.5), lineMat)
    s2.rotation.x = -Math.PI / 2
    s2.position.set(100 + i * 5.5, 0.1, 80)
    scene.add(s2)
  }
}

// ============================================
// 主控制楼创建
// ============================================
function createMainBuilding(x: number, z: number, rotationY = 0) {
  const group = new THREE.Group()

  // 底座
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(120, 8, 80),
    new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 })
  )
  base.position.y = 4; base.castShadow = true; base.receiveShadow = true
  group.add(base)

  // 主楼体
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(100, 45, 60),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.5 })
  )
  body.position.y = 8 + 22.5; body.castShadow = true; body.receiveShadow = true
  group.add(body)

  // 玻璃幕墙
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(102, 40, 62),
    new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.6 })
  )
  glass.position.y = 8 + 22.5
  group.add(glass)

  // 窗框
  const frameMat = new THREE.MeshBasicMaterial({ color: 0xcccccc })
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const fh = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 0.5), frameMat)
      fh.position.set(-37.5 + col * 15, 15 + row * 10, 31.5)
      group.add(fh)
      const fv = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 0.5), frameMat)
      fv.position.set(-30 + col * 15, 19 + row * 10, 31.5)
      group.add(fv)
    }
  }

  // 入口雨棚
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(30, 1, 15),
    new THREE.MeshStandardMaterial({ color: 0x2c5aa0, roughness: 0.4 })
  )
  canopy.position.set(0, 18, 38); canopy.castShadow = true
  group.add(canopy)

  // 入口门
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(10, 8, 1),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 })
  )
  door.position.set(0, 12, 31)
  group.add(door)

  // 屋顶绿色植被
  const roofGreen = new THREE.Mesh(
    new THREE.BoxGeometry(95, 2, 55),
    new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.9 })
  )
  roofGreen.position.y = 8 + 45 + 1
  group.add(roofGreen)

  // 屋顶设备
  const equip = new THREE.Mesh(
    new THREE.BoxGeometry(20, 6, 15),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 })
  )
  equip.position.set(20, 8 + 45 + 5, -10); equip.castShadow = true
  group.add(equip)
  const equip2 = new THREE.Mesh(new THREE.BoxGeometry(15, 4, 10), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 }))
  equip2.position.set(-25, 8 + 45 + 4, 5); equip2.castShadow = true
  group.add(equip2)

  // 屋顶标识
  const signCanvas = document.createElement('canvas')
  signCanvas.width = 256; signCanvas.height = 64
  const sctx = signCanvas.getContext('2d')!
  sctx.fillStyle = '#0a4a8a'; sctx.fillRect(0, 0, 256, 64)
  sctx.fillStyle = '#4fc3f7'; sctx.font = 'bold 28px Arial'
  sctx.textAlign = 'center'; sctx.textBaseline = 'middle'
  sctx.fillText('储能电站', 128, 32)
  const signTex = new THREE.CanvasTexture(signCanvas)
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 6),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  )
  sign.position.set(0, 8 + 45 + 6, 28)
  sign.rotation.x = -Math.PI / 6
  group.add(sign)

  // 底部蓝色灯带
  const lightStrip = new THREE.Mesh(
    new THREE.BoxGeometry(102, 0.5, 62),
    new THREE.MeshBasicMaterial({ color: 0x02A7F0 })
  )
  lightStrip.position.y = 8 + 0.5
  group.add(lightStrip)

  group.position.set(x, 0, z)
  group.rotation.y = rotationY
  scene.add(group)
}

// ============================================
// 储能集装箱区创建
// ============================================
function createEnergyStorageArea(centerX: number, centerZ: number) {
  const gapX = 45, gapZ = 30
  // 水泥硬化区
  const concrete = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 140),
    new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.95 })
  )
  concrete.rotation.x = -Math.PI / 2
  concrete.position.set(centerX, 0.02, centerZ)
  concrete.receiveShadow = true
  scene.add(concrete)

  // 黄色警戒线
  const cautionMat = new THREE.MeshBasicMaterial({ color: 0xf0c040 })
  const cb1 = new THREE.Mesh(new THREE.PlaneGeometry(200, 2), cautionMat)
  cb1.rotation.x = -Math.PI / 2; cb1.position.set(centerX, 0.03, centerZ + 70)
  scene.add(cb1)
  const cb2 = new THREE.Mesh(new THREE.PlaneGeometry(200, 2), cautionMat)
  cb2.rotation.x = -Math.PI / 2; cb2.position.set(centerX, 0.03, centerZ - 70)
  scene.add(cb2)

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const x = centerX - 67.5 + col * gapX
      const z = centerZ - 30 + row * gapZ
      createEnergyContainer(x, z)
    }
  }
  createTransformer(centerX, centerZ + 85)
}

function createEnergyContainer(x: number, z: number) {
  const group = new THREE.Group()
  const w = 35, h = 18, d = 12

  // 集装箱主体
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.5, metalness: 0.3 })
  )
  body.position.y = h / 2 + 2; body.castShadow = true; body.receiveShadow = true
  group.add(body)

  // 底部支架
  const legMat = new THREE.MeshStandardMaterial({ color: 0x444444 })
  const legGeo = new THREE.BoxGeometry(4, 2, 4)
  const legPositions = [[-w / 2 + 5, 1, -d / 2 + 3], [w / 2 - 5, 1, -d / 2 + 3], [-w / 2 + 5, 1, d / 2 - 3], [w / 2 - 5, 1, d / 2 - 3]]
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat)
    leg.position.set(pos[0], pos[1], pos[2]); leg.castShadow = true
    group.add(leg)
  })

  // 散热格栅
  const grillMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
  for (let i = 0; i < 5; i++) {
    const grill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 2, 0.5), grillMat)
    grill.position.set(0, 6 + i * 3, d / 2 + 0.3)
    group.add(grill)
    const grillBack = grill.clone()
    grillBack.position.z = -d / 2 - 0.3
    group.add(grillBack)
  }

  // 舱门
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.8, h * 0.7, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.4 })
  )
  door.position.set(0, h / 2 + 2, d / 2 + 0.3)
  group.add(door)

  // 状态指示灯
  const lightGeo = new THREE.SphereGeometry(1, 8, 8)
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const light = new THREE.Mesh(lightGeo, lightMat)
  light.position.set(0, h + 2 + 2, 0)
  group.add(light)

  animatedObjects.push({
    update: (time: number) => {
      const intensity = (Math.sin(time * 3) + 1) * 0.5 + 0.3
      lightMat.color.setRGB(0, intensity, 0)
    }
  })

  // 侧面标识
  const labelCanvas = document.createElement('canvas')
  labelCanvas.width = 256; labelCanvas.height = 32
  const lctx = labelCanvas.getContext('2d')!
  lctx.fillStyle = '#0a4a8a'; lctx.fillRect(0, 0, 256, 32)
  lctx.fillStyle = '#ffffff'; lctx.font = '16px Arial'
  lctx.textAlign = 'center'; lctx.textBaseline = 'middle'
  lctx.fillText('ENERGY STORAGE', 128, 16)
  const labelTex = new THREE.CanvasTexture(labelCanvas)
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.6, 3),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
  )
  label.position.set(0, h / 2 + 5, d / 2 + 0.6)
  group.add(label)

  group.position.set(x, 0, z)
  scene.add(group)
}

function createTransformer(x: number, z: number) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(20, 15, 15),
    new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.6, metalness: 0.5 })
  )
  body.position.y = 7.5; body.castShadow = true
  group.add(body)

  const finMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.6, metalness: 0.5 })
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(1, 12, 12), finMat)
    fin.position.set(-8 + i * 2.3, 7.5, 0)
    group.add(fin)
  }

  const bushingMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 })
  for (let i = 0; i < 3; i++) {
    const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 6, 8), bushingMat)
    bushing.position.set(-5 + i * 5, 15 + 3, 0)
    group.add(bushing)
  }

  // 警示标识
  const wCanvas = document.createElement('canvas')
  wCanvas.width = 64; wCanvas.height = 64
  const wctx = wCanvas.getContext('2d')!
  wctx.fillStyle = '#ffcc00'; wctx.fillRect(0, 0, 64, 64)
  wctx.strokeStyle = '#000000'; wctx.lineWidth = 3
  wctx.beginPath(); wctx.moveTo(32, 8); wctx.lineTo(56, 50); wctx.lineTo(8, 50); wctx.closePath(); wctx.stroke()
  wctx.fillStyle = '#000000'; wctx.font = 'bold 24px Arial'
  wctx.textAlign = 'center'; wctx.textBaseline = 'middle'
  wctx.fillText('!', 32, 36)
  const wTex = new THREE.CanvasTexture(wCanvas)
  const warning = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: wTex, transparent: true }))
  warning.position.set(10.5, 10, 0); warning.rotation.y = Math.PI / 2
  group.add(warning)

  group.position.set(x, 0, z)
  scene.add(group)
}

// ============================================
// 光伏板区创建
// ============================================
function createSolarPanelArea(centerX: number, centerZ: number) {
  // 硬化地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 160),
    new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.95 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(centerX, 0.02, centerZ)
  ground.receiveShadow = true
  scene.add(ground)

  const panelMat = new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.2, metalness: 0.7 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.4 })
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.5 })

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const group = new THREE.Group()
      const x = centerX - 105 + col * 30
      const z = centerZ - 45 + row * 30

      // 支架
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 10, 8), poleMat)
      pole.position.y = 5; pole.castShadow = true
      group.add(pole)

      // 斜撑
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.5, 12, 0.5), poleMat)
      brace.position.set(0, 6, 0)
      brace.rotation.x = -Math.PI / 6
      group.add(brace)

      // 光伏面板
      const panel = new THREE.Mesh(new THREE.BoxGeometry(24, 0.3, 14), panelMat)
      panel.position.set(0, 11, 0)
      panel.rotation.x = -Math.PI / 6
      panel.castShadow = true; panel.receiveShadow = true
      group.add(panel)

      // 边框
      const frame = new THREE.Mesh(new THREE.BoxGeometry(25, 0.4, 15), frameMat)
      frame.position.set(0, 10.9, 0)
      frame.rotation.x = -Math.PI / 6
      group.add(frame)

      group.position.set(x, 0, z)
      scene.add(group)
    }
  }
}

// ============================================
// 充电桩区创建
// ============================================
function createChargingStationArea(centerX: number, centerZ: number) {
  // 沥青地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 100),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(centerX, 0.03, centerZ)
  ground.receiveShadow = true
  scene.add(ground)

  // 车位线
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(2, 80), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(centerX - 30 + i * 30, 0.04, centerZ)
    scene.add(line)
  }
  const hLine = new THREE.Mesh(new THREE.PlaneGeometry(100, 2), lineMat)
  hLine.rotation.x = -Math.PI / 2
  hLine.position.set(centerX, 0.04, centerZ + 35)
  scene.add(hLine)

  // 充电桩
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group()
    const x = centerX - 30 + i * 30

    // 桩体
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4, 14, 3),
      new THREE.MeshStandardMaterial({ color: 0x2c5aa0, roughness: 0.4, metalness: 0.3 })
    )
    body.position.y = 7; body.castShadow = true
    group.add(body)

    // 屏幕
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(3, 4, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    )
    screen.position.set(0, 10, 1.6)
    group.add(screen)

    // 顶部指示灯
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    )
    light.position.set(0, 14.5, 0)
    group.add(light)

    animatedObjects.push({
      update: (time: number) => {
        const intensity = (Math.sin(time * 3 + i) + 1) * 0.5 + 0.3
        ;(light.material as THREE.MeshBasicMaterial).color.setRGB(0, intensity, 0)
      }
    })

    group.position.set(x, 0, centerZ + 45)
    scene.add(group)
  }

  // 遮阳棚
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(130, 1, 40),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 })
  )
  canopy.position.set(centerX, 18, centerZ + 20)
  canopy.castShadow = true
  scene.add(canopy)

  // 棚柱
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, metalness: 0.4 })
  for (let i = 0; i < 4; i++) {
    const px = centerX - 55 + i * 36.6
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 18, 8), pillarMat)
    pillar.position.set(px, 9, centerZ + 5)
    pillar.castShadow = true
    scene.add(pillar)
    const pillar2 = pillar.clone()
    pillar2.position.set(px, 9, centerZ + 35)
    scene.add(pillar2)
  }
}

// ============================================
// 绿化创建
// ============================================
function createVegetation() {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 })
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6e32, roughness: 0.9 })
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9 })

  const treePositions = [
    [-280, -180], [-260, -190], [-240, -170],
    [280, -180], [260, -190], [240, -170],
    [-280, 200], [-260, 210], [-240, 190],
    [280, 200], [260, 210], [240, 190],
    [-50, -280], [0, -290], [50, -280],
    [-50, 250], [0, 260], [50, 250],
    [-400, 0], [-420, 20], [-400, 40],
    [400, 0], [420, 20], [400, 40]
  ]

  treePositions.forEach(([x, z]) => {
    const group = new THREE.Group()
    // 树干
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 10, 8), trunkMat)
    trunk.position.y = 5; trunk.castShadow = true
    group.add(trunk)
    // 树冠
    const crown = new THREE.Mesh(new THREE.SphereGeometry(7, 8, 8), leafMat)
    crown.position.y = 13; crown.castShadow = true
    group.add(crown)
    group.position.set(x, 0, z)
    scene.add(group)
  })

  // 灌木丛
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 900
    const z = (Math.random() - 0.5) * 700
    // 避开道路和建筑区域
    if (Math.abs(x) < 80 && Math.abs(z) < 100) continue
    const bush = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 2, 6, 6), bushMat)
    bush.position.set(x, 2, z); bush.castShadow = true
    scene.add(bush)
  }
}

// ============================================
// 路灯创建
// ============================================
function createStreetLights() {
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.5 })
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff5cc })

  const positions: [number, number][] = [
    [-100, 120], [-100, 40], [-100, -40], [-100, -120],
    [100, 120], [100, 40], [100, -40], [100, -120],
    [-300, 80], [-200, 80], [0, 80], [200, 80], [300, 80],
    [-300, -80], [-200, -80], [0, -80], [200, -80], [300, -80]
  ]

  positions.forEach(([x, z]) => {
    const group = new THREE.Group()
    // 灯杆
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 18, 8), poleMat)
    pole.position.y = 9; pole.castShadow = true
    group.add(pole)
    // 灯臂
    const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.8), poleMat)
    arm.position.set(2.5, 17, 0)
    group.add(arm)
    // 灯罩
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1.5), lampMat)
    lamp.position.set(5, 16.5, 0)
    group.add(lamp)
    // 点光源
    const pointLight = new THREE.PointLight(0xfff5cc, 0.5, 60)
    pointLight.position.set(5, 15, 0)
    group.add(pointLight)

    group.position.set(x, 0, z)
    scene.add(group)
  })
}

// ============================================
// 围栏创建
// ============================================
function createFence() {
  const postMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6, metalness: 0.5 })
  const railMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.4 })

  const bounds = { minX: -550, maxX: 550, minZ: -350, maxZ: 350 }
  const postInterval = 40

  // 立柱
  for (let x = bounds.minX; x <= bounds.maxX; x += postInterval) {
    const post1 = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 2), postMat)
    post1.position.set(x, 6, bounds.minZ); post1.castShadow = true
    scene.add(post1)
    const post2 = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 2), postMat)
    post2.position.set(x, 6, bounds.maxZ); post2.castShadow = true
    scene.add(post2)
  }
  for (let z = bounds.minZ + postInterval; z < bounds.maxZ; z += postInterval) {
    const post1 = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 2), postMat)
    post1.position.set(bounds.minX, 6, z); post1.castShadow = true
    scene.add(post1)
    const post2 = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 2), postMat)
    post2.position.set(bounds.maxX, 6, z); post2.castShadow = true
    scene.add(post2)
  }

  // 横杆
  const railGeo = new THREE.BoxGeometry(bounds.maxX - bounds.minX, 1, 0.8)
  const rail1 = new THREE.Mesh(railGeo, railMat)
  rail1.position.set(0, 9, bounds.minZ)
  scene.add(rail1)
  const rail2 = new THREE.Mesh(railGeo, railMat)
  rail2.position.set(0, 9, bounds.maxZ)
  scene.add(rail2)

  const railGeoZ = new THREE.BoxGeometry(0.8, 1, bounds.maxZ - bounds.minZ)
  const rail3 = new THREE.Mesh(railGeoZ, railMat)
  rail3.position.set(bounds.minX, 9, 0)
  scene.add(rail3)
  const rail4 = new THREE.Mesh(railGeoZ, railMat)
  rail4.position.set(bounds.maxX, 9, 0)
  scene.add(rail4)
}

// ============================================
// 云朵创建
// ============================================
function createClouds() {
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.8 })

  const cloudConfigs = [
    { x: -200, y: 180, z: -200, scale: 1.2 },
    { x: 150, y: 200, z: -250, scale: 1.5 },
    { x: 300, y: 170, z: 100, scale: 1.0 },
    { x: -300, y: 190, z: 150, scale: 1.3 },
    { x: 0, y: 220, z: -300, scale: 1.4 },
    { x: -100, y: 175, z: 250, scale: 0.9 }
  ]

  cloudConfigs.forEach(config => {
    const group = new THREE.Group()
    for (let i = 0; i < 5; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(15 + Math.random() * 10, 8, 8),
        cloudMat
      )
      sphere.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      )
      group.add(sphere)
    }
    group.position.set(config.x, config.y, config.z)
    group.scale.setScalar(config.scale)
    scene.add(group)
  })
}

// ============================================
// 车辆动画创建
// ============================================
function createAnimatedCars() {
  const carColors = [0xff4444, 0x4488ff, 0xffffff, 0x333333, 0xffaa00]

  for (let i = 0; i < 4; i++) {
    const group = new THREE.Group()
    const color = carColors[i % carColors.length]

    // 车身
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(14, 5, 7),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 })
    )
    body.position.y = 4; body.castShadow = true
    group.add(body)

    // 车顶
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(8, 3, 6),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 })
    )
    roof.position.y = 7.5
    group.add(roof)

    // 车轮
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
    const wheelGeo = new THREE.CylinderGeometry(1.5, 1.5, 1, 12)
    const wheelPositions: [number, number, number][] = [
      [-4, 1.5, 3.8], [4, 1.5, 3.8], [-4, 1.5, -3.8], [4, 1.5, -3.8]
    ]
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(wx, wy, wz); wheel.castShadow = true
      group.add(wheel)
    })

    // 车灯
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc })
    const headLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 1.5), headLightMat)
    headLight.position.set(7, 4, 2)
    group.add(headLight)
    const headLight2 = headLight.clone()
    headLight2.position.set(7, 4, -2)
    group.add(headLight2)

    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 1.5), tailLightMat)
    tailLight.position.set(-7, 4, 2)
    group.add(tailLight)
    const tailLight2 = tailLight.clone()
    tailLight2.position.set(-7, 4, -2)
    group.add(tailLight2)

    // 初始位置
    const startX = -400 + i * 200
    const laneZ = 75 + (i % 2) * 10
    const speed = 20 + Math.random() * 30
    group.position.set(startX, 0, laneZ)
    group.rotation.y = 0
    scene.add(group)

    animatedObjects.push({
      update: (time: number) => {
        let nx = startX + time * speed
        while (nx > 500) nx -= 1000
        group.position.x = nx
      }
    })
  }
}

// ============================================
// 动画与事件处理
// ============================================

/**
 * 动画循环函数
 *
 * 使用 requestAnimationFrame 实现平滑的动画循环，每帧：
 *   1. 计算全局时间
 *   2. 更新所有注册动画对象
 *   3. 更新控制器状态（处理阻尼效果）
 *   4. 渲染场景
 */
function animate() {
  animationId = requestAnimationFrame(animate)
  const time = clock.getElapsedTime()
  // 更新所有动画对象（指示灯、车辆等）
  animatedObjects.forEach(obj => obj.update(time))
  controls.update()           // 更新控制器（必须每帧调用以启用阻尼效果）
  renderer.render(scene, camera)
}

/**
 * 窗口大小变化处理函数
 * 
 * 当容器尺寸变化时，更新相机的宽高比和渲染器的尺寸，
 * 确保场景不会变形。
 */
function onResize() {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  // 更新相机宽高比
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  // 更新渲染器尺寸
  renderer.setSize(w, h)
}

// ============================================
// 生命周期钩子
// ============================================

/**
 * 组件挂载完成后初始化 Three.js 场景
 */
onMounted(() => {
  init()
  // 监听窗口大小变化事件
  window.addEventListener('resize', onResize)
  if(renderer){

      renderer.domElement.addEventListener('click', function(event) {
        // 处理点击事件，例如选中物体或触发动画等
        console.log(event,'event')
    });
  }
})

/**
 * 组件卸载前清理资源
 * 
 * 清理内容：
 *   - 移除窗口大小监听
 *   - 取消动画循环
 *   - 释放渲染器资源
 *   - 从 DOM 中移除 canvas 元素
 */
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    // 安全地从 DOM 中移除 canvas
    if (container.value && renderer.domElement.parentNode === container.value) {
      container.value.removeChild(renderer.domElement)
    }
  }
})
</script>

<style scoped>
/**
 * 3D 场景容器样式
 * 
 * 占满父容器宽高，圆角处理，隐藏溢出内容
 */
.three-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>
