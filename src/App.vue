<template>
  <div id="app" ref="app">
    <div class="Main">
      <header></header>
      <main>
        <section class="editor-wrapper">
          <div id="toolbar">
            <span class="ql-formats">
              <select class="ql-size">
                <option value="small"></option>
                <option selected></option>
                <option value="large"></option>
                <option value="huge"></option>
              </select>
            </span>
            <span class="ql-formats">
              <button class="ql-bold" type="button"></button>
              <button class="ql-italic" type="button"></button>
              <button class="ql-underline" type="button"></button>
              <button class="ql-strike" type="button"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-blockquote" type="button"></button>
              <button class="ql-code-block" type="button"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-list" type="button" value="ordered"></button>
              <button class="ql-list" type="button" value="bullet"></button>
            </span>
            <span class="ql-formats">
              <select class="ql-color">
                <option selected></option>
                <option v-for="color in colors" :value="color" :key="color"></option>
              </select>
              <select class="ql-background">
                <option selected></option>
                <option v-for="color in colors" :value="color" :key="color"></option>
              </select>
            </span>
            <span class="ql-formats">
              <select class="ql-align">
                <option selected></option>
                <option value="center"></option>
                <option value="right"></option>
                <option value="justify"></option>
              </select>
            </span>
            <span class="ql-formats">
              <button class="ql-link" type="button"></button>
              <button class="ql-image" type="button"></button>
              <button class="custom-background" type="button" @click="cboShow = true">
                <mu-icon value="style" color="#444" size="18"></mu-icon>
              </button>
            </span>
          </div>
          <div id="editor" ref="editor"></div>
        </section>
        <section class="btns">
          <mu-button color="#3f51b5" full-width @click="genPic">生成长图</mu-button>
        </section>
        <div :class="['custom-background-options', cboShow ? 'scaleIn' : '']">
          <ul class="colors-options">
            <li
              v-for="color in colors"
              :key="color"
              :class="{'color-selected': cboColor === color}"
              :style="{'background-color': color}"
              @click="selectColor(color)"
            ></li>
          </ul>
          <div class="colors-btns">
            <mu-button fab color="primary" @click="applyPaperColor">
              <mu-icon value="check"></mu-icon>
            </mu-button>
            <mu-button fab color="#fff" @click="cboShow = false">
              <mu-icon value="close" color="#444"></mu-icon>
            </mu-button>
          </div>
        </div>
      </main>
      <section class="settings" :style="{transform: `translateX(${settingsShow ? '0' : '100%'})`}">
        <div class="settings-icon" @click="toggleDrawer">
          <mu-icon :value="settingsShow ? 'close' : 'settings'" size="40" color="#fff"></mu-icon>
        </div>
        <div class="settings-container">
          <h3>边距调整</h3>
          <div>
            <span>上下边距</span>
            <input type="text">
          </div>
          <div>
            <span>左右边距</span>
            <input type="text">
          </div>
        </div>
      </section>
    </div>
    <section :class="['long-pic-wrapper', 'mask', picAttr.url ? 'scaleIn' : '']">
      <i class="material-icons close-mask" @click="resetPicAttr">clear</i>
      <div>
        <mu-button flat color="secondary" :href="picAttr.stream" :download="picAttr.download">
          <mu-icon left value="cloud_download"></mu-icon>
          下载长图
        </mu-button>
      </div>
      <div>
        <img class="long-pic" :src="picAttr.url" alt="" :style="{width: `${picAttr.width}px`, height: `${picAttr.height}px`}">
      </div>
    </section>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
export default {
  name: 'app',
  data () {
    return {
      picAttr: {
        width: 0,
        height: 0,
        url: '',
        stream: '',
        download: ''
      },
      settingsShow: false,
      cboShow: false,
      paperColor: '#fff',
      cboColor: null,
      colors: ['#ffffff', '#ecf0f1', '#95a5a6', '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c']
    }
  },
  mounted () {
    this.initEditor()
  },
  watch: {
    cboShow (newVal) {
      if (!newVal) {
        this.cboColor = null
      }
    }
  },
  methods: {
    initEditor () {
      const options = {
        theme: 'snow',
        bounds: document.body,
        debug: 'warn',
        modules: {
          toolbar: '#toolbar'
        },
        placeholder: '',
        readOnly: false
      }
      const editor = this.$refs.editor
      this.Quill = new Quill(editor, options)
    },
    genPic () {
      const shareContent = document.querySelector('.ql-editor')
      const width = shareContent.scrollWidth
      const height = shareContent.scrollHeight
      const ele = shareContent.cloneNode(true)
      ele.className += ' ql-container'
      ele.style.cssText += `
        width: ${width}px;
        height: ${height}px;
        position: absolute;
        top: 0;
        left: -100%;
        z-index: -1;
      `
      const { paddingLeft, paddingRight } = window.getComputedStyle(shareContent)
      const paddingHorizon = parseInt(paddingLeft) + parseInt(paddingRight)
      ele.querySelectorAll('img').forEach(node => {
        node.style.cssText = `max-width:${width - paddingHorizon}px`
      })
      this.$refs.app.appendChild(ele)
      const canvas = document.createElement('canvas') // 创建一个canvas节点
      const scale = 2 // 定义任意放大倍数 支持小数
      canvas.width = width * scale // 定义canvas 宽度 * 缩放
      canvas.height = height * scale // 定义canvas高度 *缩放
      canvas.getContext('2d').scale(scale, scale) // 获取context, 设置scale
      const opts = {
        scale: scale, // 添加的scale 参数
        canvas: canvas, // 自定义 canvas
        // logging: true, //日志开关，便于查看html2canvas的内部执行流程
        width: width, // dom 原始宽度
        height: height,
        useCORS: true // 【重要】开启跨域配置
      }
      html2canvas(ele, opts).then((canvas) => {
        const type = 'image/png'
        const url = canvas.toDataURL(type)
        this.picAttr = {
          width,
          height,
          url,
          stream: url.replace(type, 'image/octet-stream'),
          download: `pic-${this.formatDate(new Date())}.png`
        }
        // this.$refs.app.removeChild(ele)
      })
    },
    resetPicAttr () {
      this.picAttr = Object.assign(this.picAttr, {
        width: 0,
        height: 0,
        url: '',
        stream: '',
        download: ''
      })
    },
    toggleDrawer () {
      const oldVal = this.settingsShow
      this.settingsShow = !oldVal
    },
    selectColor (color) {
      this.cboColor = this.cboColor !== color ? color : null
    },
    applyPaperColor () {
      const fontColor = this.isDarkColor(this.cboColor) ? '#fff' : '#111'
      document.querySelector('.ql-editor').style.cssText = `background-color:${this.cboColor};color:${fontColor};`
      this.cboShow = false
    },
    formatDate (date) {
      return date.toISOString().split('T')[0]
    },
    isDarkColor (color) {
      const hex = color.slice(1)
      let value
      if (hex.length === 3) {
        value = hex.map(item => item + item)
      } else if (hex.length === 6) {
        value = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)]
      }
      const [r, g, b] = value.map(item => parseInt(item, 16))
      return r * 0.299 + g * 0.578 + b * 0.114 < 192
    }
  }
}
</script>

<style lang="scss">
#app {
  .Main {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    header {
      clear: both;
      position: relative;
      border: 4px solid #3f51b5;
    }
    main {
      position: relative;
      width: 440px;
      margin: 20px auto 0;
      .editor-wrapper {
        position: relative;
        .ql-toolbar {
          background-color: #fff;
        }
        #editor {
          background-color: #fff;
          width: 100%;
          height: 80vh;
        }
      }
      .btns {
        margin-top: 10px;
      }
      .custom-background-options {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        transform: scale(0);
        transform-origin: 50% 50%;
        background-color: #E0E0E0;
        .colors-options {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          li {
            flex: 0 0 33.3333%;
            height: 180px;
          }
        }
        .colors-btns {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 0;
          display: flex;
          justify-content: space-around;
        }
      }
    }
    .settings {
      position: absolute;
      width: 300px;
      height: 100%;
      top: 0;
      right: 0;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      transition: transform .5s cubic-bezier(0.165, 0.84, 0.44, 1);
      .settings-container {
        width: 100%;
        height: 100%;
        padding: 24px;
        background-color: #fff;
        border-top: 8px solid #3f51b5;
        box-sizing: border-box;
      }
      .settings-icon {
        position: absolute;
        top: 30%;
        left: -60px;
        padding: 10px;
        background: #3f51b5;
        cursor: pointer;
        font-size: 0;
        border-radius: 4px 0 0 4px;
        i{
          user-select: none;
        }
      }
    }
  }
  .mask {
    text-align: center;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 9999;
    background: #E8EAF6;
    transform: scale(0);
    transform-origin: 50% 50%;
    padding: 20px;
    min-height: 100%;
    box-sizing: border-box;
    .close-mask {
      position: absolute;
      top: 20px;
      right: 40px;
      color: #212121;
      font-size: 50px;
      cursor: pointer;
    }
  }
}

.scaleIn {
  transform: scale(1) !important;
  transition: transform .3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.color-selected {
  border: 4px solid #FFF9C4;
  box-sizing: border-box;
}

.slideInX {
  transform: translateX(0);
  transition: transform .5s cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>
