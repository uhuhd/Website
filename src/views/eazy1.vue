<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";

// 常量定义
const ROWS = 6;
const COLS = 6;
const BLOCK_SIZE = 50;
const COOLDOWN = 1000;

// 响应式数据
const isFlipped = ref(false);
const boardRef = ref(null);
const flipButtonRef = ref(null);

// 创建单个瓦片
const createTile = (row, col) => {
  const tile = document.createElement("div");
  tile.className = "tile"; // 修复拼写错误: title → tile

  const bgPosition = `${col * 20}% ${row * 20}%`;

  tile.innerHTML = `
    <div class="tile-face tile-front" style="background-position: ${bgPosition}"></div>
    <div class="tile-face tile-back" style="background-position: ${bgPosition}"></div>
  `;

  return tile;
};

// 创建游戏板
const createBoard = () => {
  if (!boardRef.value) return;

  boardRef.value.innerHTML = ""; // 清空现有内容

  for (let i = 0; i < ROWS; i++) {
    const row = document.createElement("div");
    row.className = "row";

    for (let j = 0; j < COLS; j++) {
      row.appendChild(createTile(i, j));
    }

    boardRef.value.appendChild(row);
  }
};

// 初始化瓦片动画
const initializeTileAnimation = () => {
  const tiles = document.querySelectorAll(".tile");
  if (!tiles.length) return;

  tiles.forEach((tile, index) => {
    let lastEnterTime = 0;

    tile.addEventListener("mouseenter", () => {
      const currentTime = Date.now();

      if (currentTime - lastEnterTime > COOLDOWN) {
        lastEnterTime = currentTime;
        animateTile(tile, calculateTiltY(index));
      }
    });
  });

  // 使用 ref 获取按钮
  if (flipButtonRef.value) {
    flipButtonRef.value.addEventListener("click", () => flipAllTiles(tiles));
  }
};

// 计算倾斜角度
const calculateTiltY = (index) => {
  const mod = index % 6;
  const tiltMap = {
    0: -40,
    1: -20,
    2: -10,
    4: 20,
    5: 40,
    default: 10,
  };

  return tiltMap[mod] ?? tiltMap.default;
};

// 动画单个瓦片
const animateTile = (tile, tiltY) => {
  gsap.killTweensOf(tile); // 清除现有动画

  gsap
    .timeline()
    .set(tile, {
      rotateX: isFlipped.value ? 180 : 0,
      rotateY: 0,
    })
    .to(tile, {
      rotateX: isFlipped.value ? 450 : 270,
      rotateY: tiltY,
      duration: 0.5,
      ease: "power2.out",
    })
    .to(
      tile,
      {
        rotateX: isFlipped.value ? 540 : 360,
        rotateY: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.25"
    );
};

// 翻转所有瓦片
const flipAllTiles = (tiles) => {
  isFlipped.value = !isFlipped.value;

  gsap.killTweensOf(tiles); // 清除现有动画

  gsap.to(tiles, {
    rotateX: isFlipped.value ? 180 : 0,
    duration: 1,
    stagger: {
      amount: 0.5,
      from: "random",
    },
    ease: "power2.inOut",
  });
};

// 组件挂载
onMounted(() => {
  createBoard();

  const ctx = gsap.context(() => {
    initializeTileAnimation();
  }, boardRef.value?.parentElement); // 使用父元素作为上下文

  return () => {
    ctx.revert(); // 清理GSAP上下文
    flipButtonRef.value?.removeEventListener("click", flipAllTiles); // 清理事件监听
  };
});
</script>

<template>
  <div>
    <nav>
      <a href="#" target="_blank">Codegrid</a>
      <button ref="flipButtonRef">Flip Tiles</button>
    </nav>
    <section ref="boardRef" class="board"></section>
    <div class="blocks-container">
      <div class="blocks"></div>
    </div>
  </div>
</template>

<style scoped>
/* 优化后的CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2em;
  z-index: 10;
  pointer-events: none;

  a,
  button {
    pointer-events: all;
  }

  a {
    color: #fff;
    text-decoration: none;
    text-transform: uppercase;
    font-family: "MOSKO MAPPA";
    font-size: 28px;
  }

  button {
    border: none;
    outline: none;
    color: #fff;
    background-color: #000;
    border-radius: 0.25em;
    padding: 0.65em 1em 0.25em 1em;
    text-transform: uppercase;
    font-family: "MOSKO MAPPA";
    font-size: 24px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #222;
    }
  }
}

.board {
  width: 100vw;
  height: 100vh;
  padding: 0.25em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  perspective: 1000px;
  background-color: #000;
  position: relative;
  z-index: 1;

  .row {
    flex: 1;
    display: flex;
    gap: 0.25em;
  }

  .tile {
    flex: 1;
    position: relative;
    transform-style: preserve-3d;
    cursor: pointer;

    .tile-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 0.25em;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-size: 600% 600%;
        background-position: inherit;
        clip-path: inset(0 round 0.25em);
      }
    }

    .tile-front {
      background-color: darkslategray;

      &::before {
        background-image: url("./assets/front.png");
      }
    }

    .tile-back {
      background-color: darkslateblue;
      transform: rotateX(180deg);

      &::before {
        background-image: url("./assets/back.png");
      }
    }
  }
}

.blocks-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;

  .blocks {
    width: 105vw;
    height: 100vh;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    overflow: hidden;

    .block {
      width: 50px;
      height: 50px;
      border: 0.5px solid transparent;
      transition: border-color 0.3s ease;

      &.highlight {
        border-color: #fff;
      }
    }
  }
}
</style>
