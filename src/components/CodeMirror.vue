<script setup>
import { onMounted, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { html } from '@codemirror/lang-html'
import { debounce } from '../utils/utils.js'
const props = defineProps(['modelValue', 'language', 'readOnly'])
const emits = defineEmits(['update:modelValue'])

let el = $ref(), editor = null

const update = debounce(() => {
  const v = editor?.state?.doc?.toString()
  if (!v) return
    console.log(v)
  if (v !== props.modelValue) emits('update:modelValue', v)
})
const inputListener = EditorView.updateListener.of(v => {
  if (!v.docChanged) return
  update()
})

onMounted(() => {
  editor = new EditorView({
    doc: props.modelValue || '',
    extensions: [basicSetup, html(), inputListener],
    parent: el
  })
})

watch(() => props.modelValue, v => {
  if (!editor) return
  if (v !== editor.state.doc) editor.dispatch({ newDoc: v })
})
</script>

<template>
  <div ref="el"></div>
</template>
