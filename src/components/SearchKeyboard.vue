<template>
  <div class="kbd">
    <div class="row row-num">
      <button v-for="k in numKeys" :key="k" class="key" @click="emitChar(k)">{{ k }}</button>
    </div>

    <div class="row row-q">
      <button v-for="k in qKeys" :key="k" class="key" @click="emitChar(k)">{{ k }}</button>
    </div>

    <div class="row row-a">
      <button v-for="k in aKeys" :key="k" class="key" @click="emitChar(k)">{{ k }}</button>
      <button class="key key-back" aria-label="退格" @click="backspace">⌫</button>
    </div>

    <div class="row row-z">
      <button class="key key-fn" @click="noop">拼音</button>
      <button v-for="k in zKeys" :key="k" class="key" @click="emitChar(k)">{{ k }}</button>
      <button class="key key-fn" @click="clear">清空</button>
      <button class="key key-fn" @click="emit('close')">收起</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    maxLen?: number;
  }>(),
  { maxLen: 32 }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "close"): void;
}>();

const numKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const qKeys = "QWERTYUIOP".split("");
const aKeys = "ASDFGHJKL".split("");
const zKeys = "ZXCVBNM".split("");

function emitChar(ch: string) {
  const cur = props.modelValue ?? "";
  if (cur.length >= props.maxLen) return;
  emit("update:modelValue", `${cur}${ch}`.slice(0, props.maxLen));
}

function backspace() {
  const cur = props.modelValue ?? "";
  emit("update:modelValue", cur.slice(0, -1));
}

function clear() {
  emit("update:modelValue", "");
}

function noop() {}
</script>

<style scoped>
.kbd {
  width: 100%;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 12px;
  display: grid;
  gap: 12px;
}

.row {
  display: grid;
  gap: 12px;
}

.row-num {
  grid-template-columns: repeat(10, minmax(0, 1fr));
}

.row-q {
  grid-template-columns: repeat(10, minmax(0, 1fr));
}

.row-a {
  grid-template-columns: repeat(10, minmax(0, 1fr));
}

.row-z {
  grid-template-columns: repeat(10, minmax(0, 1fr));
}

.key {
  min-height: 68px;
  border: none;
  border-radius: var(--radius-card);
  background: #f3f4f6;
  font-size: 20px;
  font-weight: 900;
  color: var(--fg);
}

.key-fn {
  font-size: 16px;
  font-weight: 800;
}

.key-back {
  font-size: 18px;
  font-weight: 900;
}
</style>
