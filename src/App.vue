<template>
  <div id="app" ref="app">
    <div class="Main">
      <header></header>
      <main :style="{width: screenWidth >= 440 ? '440px' : '100%'}">
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
          <mu-button color="#3f51b5" full-width @click="genPic" v-loading="loading" data-mu-loading-size="24">生成长图</mu-button>
        </section>
        <div :class="['custom-background-options', cboShow ? 'scaleIn' : '']">
          <ul class="colors-options">
            <li
              v-for="pattern in patterns.list"
              :key="pattern"
              :class="{'color-selected': pattern === cboColor}"
              :style="{'background-image': `url(/img/pattern/${pattern}.${patterns.suffix})`}"
              @click="selectBg(pattern)"
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
          <h2 style="text-align: center;">边距调整</h2>
          <mu-form :model="form" class="mu-demo-form" label-position="right" label-width="100">
            <mu-form-item prop="paddingVertical" label="上下边距">
              <mu-text-field v-model="form.paddingVertical"></mu-text-field>
            </mu-form-item>
            <mu-form-item prop="paddingHorizon" label="左右边距">
              <mu-text-field v-model="form.paddingHorizon"></mu-text-field>
            </mu-form-item>
            <mu-form-item>
              <mu-button color="#3f51b5" @click="saveConfig">保存设置</mu-button>
            </mu-form-item>
          </mu-form>
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
      screenWidth: window.screen.width,
      picAttr: {
        width: 0,
        height: 0,
        url: '',
        stream: '',
        download: ''
      },
      form: {
        paddingVertical: 12,
        paddingHorizon: 15
      },
      loading: false,
      settingsShow: false,
      cboShow: false,
      paperColor: '#fff',
      cboColor: null,
      colors: ['#ffffff', '#ecf0f1', '#95a5a6', '#1abc9c', '#2ecc71', '#3498db', '#9b59b6',
        '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#faeed7', '#e9eff5', '#e7f0e1', '#f2e4e9',
        '#f7f7f7', '#343434'],
      patterns: {
        suffix: 'png',
        list: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        dark: ['1', '9']
      }
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
      const ele = this.$refs.editor
      this.Quill = new Quill(ele, options)
      this.editor = document.querySelector('.ql-editor')
    },
    genPic () {
      this.loading = true
      const shareContent = this.editor
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
      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = width * scale
      canvas.height = height * scale
      canvas.getContext('2d').scale(scale, scale)
      const opts = {
        scale: scale,
        canvas: canvas,
        logging: false,
        width: width,
        height: height,
        useCORS: true
      }
      html2canvas(ele, opts).then((canvas) => {
        const type = 'image/png'
        const url = canvas.toDataURL(type)
        this.picAttr = {
          width,
          height,
          url,
          stream: url.replace(type, 'image/octet-stream'),
          download: `piiic-${this.formatDate(new Date())}.png`
        }
        this.$refs.app.removeChild(ele)
        this.loading = false
      }).catch(err => {
        this.loading = false
        console.error(err)
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
    selectBg (pattern) {
      this.cboColor = this.cboColor !== pattern ? pattern : null
    },
    applyPaperColor () {
      const { cboColor, patterns } = this
      const color = patterns.dark.includes(cboColor) ? '#ffffff' : '#111111'
      const ele = this.editor
      Object.entries({
        background: `url(/img/pattern/${cboColor}.png)`,
        color
      }).forEach(entry => ele.style.setProperty(entry[0], entry[1]))
      this.cboColor = null
      this.cboShow = false
    },
    saveConfig () {
      const { paddingVertical, paddingHorizon } = this.form
      const cssText = `${paddingVertical}px ${paddingHorizon}px`
      this.editor.style.setProperty('padding', cssText)
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
        background-color: #FAFAFA;
        overflow: hidden;
        .colors-options {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          li {
            flex: 0 0 33.333%;
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
  background-origin: border-box;
}

.slideInX {
  transform: translateX(0);
  transition: transform .5s cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>
