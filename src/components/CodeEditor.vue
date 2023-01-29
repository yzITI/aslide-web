<script setup>
import monaco from '../utils/codeEditorWorker.js'
import { debounce } from '../utils/utils.js'
import { onMounted, onUnmounted, watch } from 'vue'
const props = defineProps(['modelValue', 'language', 'readOnly'])
const emits = defineEmits(['update:modelValue'])

let editorEl = $ref(), editor = null

watch(() => props.modelValue, v => {
  if (!editor) return
  if (v !== editor.getValue()) editor.setValue(v)
})

watch(() => props.readOnly, v => {
  if (!editor) return
  editor.updateOptions({ readOnly: v })
})

onMounted(() => {
  editor = monaco.editor.create(editorEl, {
    value: props.modelValue || '',
    language: props.language || 'html',
    theme: 'vs',
    lineNumbersMinChars: 2,
    tabSize: 2,
    readOnly: props.readOnly,
    minimap: { enabled: false }
  })
  editor.onDidChangeModelContent = debounce(() => {
    const v = editor.getValue()
    if (v !== props.modelValue) emits('update:modelValue', v)
  })
})

onUnmounted(() => {
  if (editor) editor.dispose()
})

if (!window.onresize) window.onresize = () => {
  monaco.editor.getEditors().forEach(e => e.layout())
}
</script>

<template>
  <div ref="editorEl"></div>
</template>
