<template>
  <div class="backdrop" @click.self="$emit('cancel')">
    <div class="modal card">
      <div class="head">
        <div class="title">{{ title }}</div>
        <div class="muted sub">{{ value.length }}/{{ maxLen }}</div>
      </div>
      <div class="body">
        <textarea v-model="value" class="input" :maxlength="maxLen" />
      </div>
      <div class="foot">
        <button class="btn" @click="$emit('cancel')">取消</button>
        <button class="btn btn-primary" @click="emit('confirm', value)">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  title: string;
  maxLen: number;
  initialValue: string;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "confirm", value: string): void;
}>();

const value = ref(props.initialValue);
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 14px;
}

.modal {
  width: min(720px, 100%);
  max-height: min(520px, 100%);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.head {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 800;
}

.sub {
  font-size: 12px;
}

.body {
  padding: 16px;
}

.input {
  width: 100%;
  height: 220px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 10px;
  font-size: 14px;
  resize: none;
}

.foot {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
