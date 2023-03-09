// parse content string to HTML
import katex from 'katex'
import 'katex/dist/katex.min.css'

function parseMath (s, regex, displayMode) {
  let m
  while (m = s.match(regex)) {
    const res = katex.renderToString(m[1], { throwOnError: false, displayMode })
    s = s.replace(m[0], res)
  }
  return s
}

function parseCode (s) {
  let m
  while (m = s.match(/\`\`\`([\S\s]*?)\n([\S\s]*?)\n\`\`\`/)) {
    const res = `<pre class="p-2 bg-gray-700 text-white"><code class="language-${m[1]}">${m[2]}</code></pre>`
    s = s.replace(m[0], res)
  }
  while (m = s.match(/\`(.*?)\`/)) {
    const res = `<code>${m[1]}</code>`
    s = s.replace(m[0], res)
  }
  return s
}

export default function (content, breakLine = true) {
  let s = content
  s = parseCode(s)
  if (breakLine) s = s.replaceAll('\n', '<br>')
  s = parseMath(s, /\$\$([\S\s]*?)\$\$/, true)
  s = parseMath(s, /\$([\S\s]*?)\$/, false)
  s = parseMath(s, /\\\[([\S\s]*?)\\\]/, true)
  s = parseMath(s, /\\\(([\S\s]*?)\\\)/, false)
  return s
}
