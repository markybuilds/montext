import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070f);
scene.fog = new THREE.Fog(0x05070f, 20, 110);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
let cameraAngle = Math.PI / 3;
const cameraOffset = new THREE.Vector3();

const ambient = new THREE.HemisphereLight(0x3259ff, 0x040404, 0.7);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(30, 60, 20);
sun.castShadow = true;
scene.add(sun);

// Terrain
const groundGeometry = new THREE.PlaneGeometry(140, 140, 40, 40);
groundGeometry.rotateX(-Math.PI / 2);
const heights = groundGeometry.attributes.position;
for (let i = 0; i < heights.count; i++) {
  const x = heights.getX(i);
  const z = heights.getZ(i);
  const y = Math.sin(x * 0.15) * 0.6 + Math.cos(z * 0.1) * 0.4;
  heights.setY(i, y);
}
heights.needsUpdate = true;
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1d2837,
  roughness: 0.9,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
scene.add(ground);

function addScenery() {
  const rockGeo = new THREE.DodecahedronGeometry(0.8, 0);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x51596b,
    roughness: 0.8,
  });
  for (let i = 0; i < 30; i++) {
    const rock = new THREE.Mesh(rockGeo, rockMat.clone());
    rock.scale.setScalar(0.4 + Math.random());
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 35;
    rock.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
    rock.castShadow = true;
    scene.add(rock);
  }

  const obeliskGeo = new THREE.CylinderGeometry(0.8, 1.4, 7, 5);
  const obeliskMat = new THREE.MeshStandardMaterial({
    color: 0x7d8bff,
    emissive: 0x090d3f,
  });
  const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
  obelisk.position.set(-6, 3.5, -6);
  obelisk.castShadow = true;
  scene.add(obelisk);
}
addScenery();

class InputController {
  constructor() {
    this.pressed = new Set();
    window.addEventListener("keydown", (event) => {
      this.pressed.add(event.code);
    });
    window.addEventListener("keyup", (event) => {
      this.pressed.delete(event.code);
    });
  }
  isDown(code) {
    return this.pressed.has(code);
  }
}

const input = new InputController();

class Player {
  constructor() {
    const body = new THREE.CapsuleGeometry(0.7, 0.8, 8, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6ed3ff,
      emissive: 0x082052,
    });
    this.mesh = new THREE.Mesh(body, mat);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 1.4, 6);
    this.maxHealth = 100;
    this.health = 100;
    this.maxStamina = 100;
    this.stamina = 100;
    this.speed = 6.5;
    this.sprintMultiplier = 1.6;
    this.staminaDrain = 25;
    this.staminaRegen = 18;
    this.attackCooldown = 0;
    this.attackRate = 0.8;
    this.attackRange = 2.4;
    this.damage = 30;
    scene.add(this.mesh);
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  canAttack() {
    return this.attackCooldown <= 0;
  }

  update(delta) {
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    const staminaRecovery = this.staminaRegen * delta;
    this.stamina = Math.min(this.maxStamina, this.stamina + staminaRecovery);
  }
}

class PatrolEnemy {
  constructor(pathPoints) {
    const geo = new THREE.ConeGeometry(0.8, 2.6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff5a5f,
      emissive: 0x250101,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.position.copy(pathPoints[0]);
    this.path = pathPoints;
    this.pathIndex = 0;
    this.speed = 3.2;
    this.health = 90;
    this.alive = true;
    this.damage = 12;
    this.attackTimer = 0;
    scene.add(this.mesh);
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
      this.mesh.material.emissive.setHex(0x020202);
      this.mesh.material.color.setHex(0x222222);
    }
  }

  update(delta, player) {
    if (!this.alive) return;
    const playerPos = player.mesh.position;
    const enemyPos = this.mesh.position;
    const dir = new THREE.Vector3();
    const distance = enemyPos.distanceTo(playerPos);
    if (distance < 10) {
      dir.copy(playerPos).sub(enemyPos);
    } else {
      const target = this.path[this.pathIndex];
      dir.copy(target).sub(enemyPos);
      if (dir.length() < 0.4) {
        this.pathIndex = (this.pathIndex + 1) % this.path.length;
      }
    }
    dir.y = 0;
    if (dir.lengthSq() > 0.001) {
      dir.normalize();
      enemyPos.addScaledVector(dir, delta * this.speed);
      this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    }

    this.attackTimer -= delta;
    if (distance < 1.4 && this.attackTimer <= 0) {
      player.takeDamage(this.damage);
      this.attackTimer = 1.2;
    }
  }
}

class Crystal {
  constructor(position) {
    const geo = new THREE.ConeGeometry(0.4, 1.8, 5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x7dffe4,
      emissive: 0x1c4b3c,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.9;
    this.mesh.castShadow = true;
    this.collected = false;
    scene.add(this.mesh);
  }

  collect() {
    this.collected = true;
    scene.remove(this.mesh);
  }
}

class Seer {
  constructor(position) {
    const geo = new THREE.CylinderGeometry(0.6, 0.6, 2.4, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc3afff,
      emissive: 0x2b1969,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
  }

  isPlayerClose(player) {
    return this.mesh.position.distanceTo(player.mesh.position) < 3;
  }
}

const player = new Player();
const enemyPath = [
  new THREE.Vector3(10, 0.3, -5),
  new THREE.Vector3(14, 0.3, 6),
  new THREE.Vector3(6, 0.3, 12),
  new THREE.Vector3(2, 0.3, 2),
];
const guardian = new PatrolEnemy(enemyPath);
const crystals = [
  new Crystal(new THREE.Vector3(-4, 0.3, 10)),
  new Crystal(new THREE.Vector3(8, 0.3, -12)),
  new Crystal(new THREE.Vector3(-14, 0.3, -4)),
];
const seer = new Seer(new THREE.Vector3(-6, 0.3, -6));

const questState = {
  stage: "approach",
  shardsCollected: 0,
  completed: false,
};

const hud = {
  health: document.getElementById("health"),
  stamina: document.getElementById("stamina"),
  quest: document.getElementById("quest"),
  objective: document.getElementById("objective"),
};

function updateHUD() {
  hud.health.textContent = `Health: ${Math.round(player.health)}`;
  hud.stamina.textContent = `Stamina: ${Math.round(player.stamina)}`;
  hud.quest.textContent = `Quest: ${questState.completed ? "Courier of echoes" : "Astral shards"}`;
  const stageText = {
    approach: "Objective: Approach the Seer",
    collect: `Objective: Collect shards (${questState.shardsCollected}/3)` ,
    defeat: guardian.alive ? "Objective: Defeat the guardian" : "Objective: Return to the Seer",
    return: "Objective: Return to the Seer",
    complete: "Objective: Quest complete!",
  };
  hud.objective.textContent = stageText[questState.stage];
}

function updateQuest(delta) {
  if (questState.completed) return;
  if (questState.stage === "approach" && seer.isPlayerClose(player)) {
    questState.stage = "collect";
  }

  if (questState.stage === "collect") {
    for (const crystal of crystals) {
      if (crystal.collected) continue;
      const dist = crystal.mesh.position.distanceTo(player.mesh.position);
      if (dist < 1.5) {
        crystal.collect();
        questState.shardsCollected += 1;
      }
    }
    if (questState.shardsCollected >= crystals.length) {
      questState.stage = "defeat";
    }
  }

  if (questState.stage === "defeat" && !guardian.alive) {
    questState.stage = "return";
  }

  if (questState.stage === "return" && seer.isPlayerClose(player)) {
    questState.stage = "complete";
    questState.completed = true;
    player.heal(50);
  }
}

function handlePlayerMovement(delta) {
  const forward = new THREE.Vector3(Math.sin(cameraAngle), 0, Math.cos(cameraAngle));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const dir = new THREE.Vector3();

  const isSprinting = input.isDown("ShiftLeft") || input.isDown("ShiftRight");
  const sprintAllowed = isSprinting && player.stamina > 5;

  if (input.isDown("KeyW")) dir.add(forward);
  if (input.isDown("KeyS")) dir.sub(forward);
  if (input.isDown("KeyA")) dir.sub(right);
  if (input.isDown("KeyD")) dir.add(right);

  if (dir.lengthSq() > 0.001) {
    dir.normalize();
    const speed = player.speed * (sprintAllowed ? player.sprintMultiplier : 1);
    player.mesh.position.addScaledVector(dir, delta * speed);
    player.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    if (sprintAllowed) {
      player.stamina = Math.max(0, player.stamina - player.staminaDrain * delta);
    }
  }
}

function updateCamera(delta) {
  if (input.isDown("KeyQ")) {
    cameraAngle += delta * 1.8;
  }
  if (input.isDown("KeyE")) {
    cameraAngle -= delta * 1.8;
  }
  const target = player.mesh.position.clone();
  cameraOffset.set(
    Math.sin(cameraAngle) * 12,
    7,
    Math.cos(cameraAngle) * 12
  );
  camera.position.copy(target).add(cameraOffset);
  camera.lookAt(target.x, target.y + 1.2, target.z);
}

function handleAttack(enemies) {
  if (!input.isDown("Space")) return;
  if (!player.canAttack()) return;
  player.attackCooldown = player.attackRate;
  const attackDir = new THREE.Vector3(
    Math.sin(player.mesh.rotation.y),
    0,
    Math.cos(player.mesh.rotation.y)
  );
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const toEnemy = new THREE.Vector3().subVectors(
      enemy.mesh.position,
      player.mesh.position
    );
    toEnemy.y = 0;
    if (toEnemy.length() <= player.attackRange) {
      const alignment = attackDir.dot(toEnemy.clone().normalize());
      if (alignment > 0.2) {
        enemy.takeDamage(player.damage);
      }
    }
  }
}

function confinePlayer() {
  const pos = player.mesh.position;
  const radius = 65;
  const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
  if (dist > radius) {
    pos.multiplyScalar((radius - 0.5) / dist);
  }
  pos.y = Math.max(pos.y, 0.6);
}

let lastTime = performance.now();
function animate() {
  const now = performance.now();
  const delta = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  player.update(delta);
  handlePlayerMovement(delta);
  confinePlayer();
  updateCamera(delta);
  guardian.update(delta, player);
  handleAttack([guardian]);
  updateQuest(delta);
  updateHUD();

  if (!questState.completed && player.health <= 0) {
    questState.stage = "complete";
    questState.completed = true;
    hud.objective.textContent = "Objective: You fell, but the world remembers.";
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
