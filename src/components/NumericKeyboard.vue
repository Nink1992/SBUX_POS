<template>
  <div class="kbd">
    <div class="grid">
      <button v-for="k in keys" :key="k.id" class="key" :data-variant="k.variant" @click="onPress(k)">
        {{ k.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type KeyDef = { id: string; label: string; value?: string; action?: "backspace" | "clear"; variant?: "clear" | "back" };

const props = withDefaults(
  defineProps<{
    modelValue: string;
    maxLen?: number;
  }>(),
  {
    maxLen: 11
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const keys = computed<KeyDef[]>(() => [
  { id: "1", label: "1", value: "1" },
  { id: "2", label: "2", value: "2" },
  { id: "3", label: "3", value: "3" },
  { id: "4", label: "4", value: "4" },
  { id: "5", label: "5", value: "5" },
  { id: "6", label: "6", value: "6" },
  { id: "7", label: "7", value: "7" },
  { id: "8", label: "8", value: "8" },
  { id: "9", label: "9", value: "9" },
  { id: "clear", label: "清除", action: "clear", variant: "clear" },
  { id: "0", label: "0", value: "0" },
  { id: "back", label: "←退格", action: "backspace", variant: "back" }
]);

function onPress(k: KeyDef) {
  const cur = props.modelValue ?? "";
  if (k.action === "clear") {
    emit("update:modelValue", "");
    return;
  }
  if (k.action === "backspace") {
    emit("update:modelValue", cur.slice(0, -1));
    return;
  }
  if (!k.value) return;
  if (cur.length >= props.maxLen) return;
  emit("update:modelValue", `${cur}${k.value}`.slice(0, props.maxLen));
}
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.key {
  min-height: 68px;
  border: none;
  border-radius: var(--radius-card);
  background: #f3f4f6;
  color: var(--fg);
  font-size: 20px;
  font-weight: 900;
}

.key[data-variant="clear"] {
  font-size: 16px;
  font-weight: 800;
}

.key[data-variant="back"] {
  font-size: 16px;
  font-weight: 800;
}
</style>
