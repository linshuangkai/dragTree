<template>
  <ul class="ul-wrapper">
    <li v-for="(item, idx) in list" :key="idx">
      <div
        :ref="'moveBlock_' + item.id"
        style="position:absolute;top:0px;left:0px;height:0px;width:0px;background:#f4f6fc;text-align:center;z-index: 9999;font-size:12px;"
      >
      </div>
      <div class="tree-node" @click="updateExpand(item)">
        <div>
          <i
            :style="{ opacity: item.children ? 1 : 0 }"
            :class="[
              'el-icon',
              'el-icon-arrow-right',
              item.expanded ? 'caret-down' : ''
            ]"
          ></i>
        </div>
        <div class="tree-folder-div" v-show="item.children">
          <img :src="`${publicPath}img/folder.png`"/>
          <span class="haschild-label">{{ item.label }}</span>
        </div>
        <div
          v-treedrag="{
            belongDiv: 'conditionTreeDiv',
            setMoveBlock: setMoveBlock,
            initMoveBlock: initMoveBlock,
            getInitMoveBlock: getInitMoveBlock,
            getScrollDistance: getScrollDistance,
            findAppropriatePosition: findAppropriatePosition,
            setAppropriatePosition: setAppropriatePosition
          }"
          v-show="!item.children"
          :id="item.id"
           class="tree-file-div"
        >
			
          <img style="width:1.25rem;height: 1.25rem;" :src="`${publicPath}img/tuodong.png`"/>
          <img style="margin-left:5px;width:1.25rem;height: 1.25rem;" :src="`${publicPath}img/team-fill.png`"/>
          <span style="margin-left:5px;font-size:12px;">{{ item.label }}</span>
        </div>
      </div>
      <transition name="tree-show">
        <ItemTree :style="getStyle(item)"
          v-show="item.expanded"
          v-if="item.children"
          :list="item.children"
          @addCondition="addCondition(arguments)"
        ></ItemTree>
      </transition>
    </li>
  </ul>
</template>
<script>
import { getElPosition } from '@/util/dragAndDropFunc.js'
export default {
  name: 'ItemTree',
  props: {
    list: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dataList: [],
      layOutParent: null,
      publicPath: process.env.BASE_URL
    }
  },
  directives: {
    treedrag: {
      bind: function(el, binding, vnode) {
          console.log(vnode)
        el.onmousedown = (e) => {
          e.preventDefault();
          // 获取鼠标点击元素的文本内容
          const elContent = el.innerText
          // 获取鼠标点击元素的id，不同的belongDiv，对应的id组成不一样
          const elId = el.id
          console.log(el)
          // 是否允许拖动标识
          let permitDrag = true
          // 当前元素相对整个页面(除浏览器头部的位置)
          const eleX = getElPosition(el).left
          const eleY = getElPosition(el).top
          // 鼠标点击元素所属的div
          const belongDiv = binding.value.belongDiv
          // 所属div的滚动偏移量
          const scrollDistance = binding.value.getScrollDistance(belongDiv)
          // 鼠标相对整个页面(除浏览器头部的位置)，是e.clientX、e.clientY
          // 鼠标与当前元素之间的位置差，是disX、disY
          const disX = e.clientX - (eleX - scrollDistance.scrollX)
          const disY = e.clientY - (eleY - scrollDistance.scrollY)
          // 获取可拖动模块DIV的原始位置相对于整个页面(除浏览器头部的位置)
          const moveBlock = binding.value.getInitMoveBlock(elId)
          const moveBlockX = moveBlock.moveBlockX
          const moveBlockY = moveBlock.moveBlockY
          // 设定拖拽模块的位置，使拖拽模块的位置，定位到鼠标点击的元素位置。（拖拽模块的top、left属性，是相对于最近一个父亲定位元素的距离）
          binding.value.setMoveBlock(
            eleX - moveBlockX - scrollDistance.scrollX,
            eleY - moveBlockY - scrollDistance.scrollY,
            elContent,
            el.offsetWidth+20,
            el.offsetHeight,
            'move',
            elId,
            'down'
          )
          document.onmousemove = (e) => {
            if (permitDrag) {
              // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
              const event = e || window.event

              let left = event.clientX - disX
              let top = event.clientY - disY
              // 限制左边距
              if (left <= moveBlockX) {
                left = moveBlockX
              }
              // 限制上边距
              if (top < moveBlockY) {
                top = moveBlockY
              }
              // 限制右边距
              if (left > document.body.offsetWidth - el.offsetWidth) {
                left = document.body.offsetWidth - el.offsetWidth
              }
              // 限制下边距
              if (top > document.body.offsetHeight - el.offsetHeight) {
                top = document.body.offsetHeight - el.offsetHeight
              }
              // 鼠标移动过程中，实时改变拖拽模块的位置，实现拖动效果。（拖拽模块的top、left属性，是相对于最近一个父亲定位元素的距离）
              binding.value.setMoveBlock(
                left - moveBlockX,
                top - moveBlockY,
                elContent,
                null,
                null,
                null,
                elId,
                null,
                'move'
              )
              // 寻找符合要求的检测项位置，即是拿当前鼠标光标的位置跟布局div中的检测项位置进行匹配。（此处是用鼠标光标的位置去对比匹配，而不是拖拽模块的位置）
              binding.value.findAppropriatePosition(
                event.clientX,
                event.clientY,
                belongDiv
              )
            }
          }
          document.onmouseup = (e) => {
            if (permitDrag) {
              const event = e || window.event
              // 鼠标放开后，进行布局
              binding.value.setAppropriatePosition(
                event.clientX,
                event.clientY,
                elId
              )
              // 布局完成后，对拖拽模块进行初始化，使其回到默认初始位置
              binding.value.initMoveBlock(elId)
              permitDrag = false
              document.onmousemove = null
              document.onmouseup = null
            }
          }
        
        }
      }
    }
  },
  created() {
    // this.list.forEach((item) => {
    //   this.$set(item, 'expanded', true)
    //   return item
    // })
  },
  methods: {
	ttfct(item){
		if(item.children&&item.children.length&&item.expanded){
			let num = 0
				var refct = function(e){
					num = num + e.length
					e.forEach((el)=>{
						if(el.children&&el.children.length&&el.expanded){
							refct(el.children)
						}
					})
				}
				refct(item.children)
			return {
				height:num*1.875+'rem',                 
			}
		} else {
			return {
				height:1.875+'rem',                 
			}
		}
		
	},
    getStyle(item){
		setTimeout(()=>{
			return this.ttfct(item)
		},300)  
		
    },
    updateExpand(item) {
		console.log(item)
		item.expanded = !item.expanded
    },
    // 获取可拖动影子块，相对于整个页面（除浏览器头部坐标）
    getInitMoveBlock(elId) {
      const moveBlockRef = 'moveBlock_' + elId
      return {
        moveBlockX: getElPosition(this.$refs[moveBlockRef][0]).left,
        moveBlockY: getElPosition(this.$refs[moveBlockRef][0]).top
      }
    },
    // 初始化可拖动影子块的样式
    initMoveBlock(elId) {
      const moveBlockRef = 'moveBlock_' + elId
      this.$refs[moveBlockRef][0].style.top = '0px'
      this.$refs[moveBlockRef][0].style.left = '0px'
      this.$refs[moveBlockRef][0].style.width = '0px'
      this.$refs[moveBlockRef][0].style.height = '0px'
      this.$refs[moveBlockRef][0].style.lineHeight = '0px'
      this.$refs[moveBlockRef][0].style.border = '0px dashed #409eff'
      this.$refs[moveBlockRef][0].innerHTML = ''
      this.$refs[moveBlockRef][0].style.cursor = ''
    },
    // 设置可拖动影子块的样式
    setMoveBlock(x, y, content, width, height, cursor, elId,source) {
        let moveImg
        let personsImg
        let spanDesc
        if(source==='down'){
            //添加拖拽图片 
            moveImg = document.createElement("img")
            moveImg.setAttribute('src', this.publicPath+'img/tz.png')
            moveImg.style.transform='rotate(90deg)'

            //添加人像图片 
            personsImg = document.createElement("img")
            personsImg.setAttribute('src', this.publicPath+'img/persons.png')
            personsImg.style.marginLeft='5px'

            //添加描述span
            spanDesc=document.createElement("span")
            spanDesc.innerText = content
            spanDesc.style.marginLeft='5px'
            spanDesc.style.fontSize='12px'
        }
        
        const moveBlockRef = 'moveBlock_' + elId
        this.$refs[moveBlockRef][0].style.top = y + 'px'
        this.$refs[moveBlockRef][0].style.left = x + 'px'
		this.$refs[moveBlockRef][0].style.textAlign = 'left'
        //this.$refs[moveBlockRef][0].innerText = content
        this.$refs[moveBlockRef][0].style.border = '1px dashed #409eff'
        if (width != null) {
            this.$refs[moveBlockRef][0].style.width = width + 'px'
        }
        if (height != null) {
            this.$refs[moveBlockRef][0].style.height = height + 'px'
            this.$refs[moveBlockRef][0].style.lineHeight = height + 'px'
        }
        if (cursor != null) {
            this.$refs[moveBlockRef][0].style.cursor = cursor
        }
        if(source==='down'){
            this.$refs[moveBlockRef][0].appendChild(moveImg)
            this.$refs[moveBlockRef][0].appendChild(personsImg)
            this.$refs[moveBlockRef][0].appendChild(spanDesc)
        }
    },
    // 获取div滚动偏移量，div出现滚动条时，滚动条滚动之后会有位置偏移，滚动条不滚动，偏移为0，无滚动条时，偏移为0
    getScrollDistance(belongDiv) {
      let scrollPosition
      this.getLayOutRefs(this)
      if (belongDiv === 'conditionTreeDiv') {
        scrollPosition = {
          scrollX: this.layOutParent.$refs.conditionTreeDiv.scrollLeft,
          scrollY: this.layOutParent.$refs.conditionTreeDiv.scrollTop
        }
      } else if (belongDiv === 'conditionGroupDiv') {
        scrollPosition = {
          scrollX: this.layOutParent.$refs.conditionGroupDiv.scrollLeft,
          scrollY: this.layOutParent.$refs.conditionGroupDiv.scrollTop
        }
      }
      return scrollPosition
    },
    // 根据鼠标光标的位置，查找能够进行放置块的区域
    findAppropriatePosition(x, y) {
        this.getLayOutRefs(this)
      const conditionGroupEle = this.layOutParent.$refs.conditionGroupDiv
      // 先判断是否在计算条件区域，若在，则继续进行后续判断
      const conditionGroupElePosition = getElPosition(conditionGroupEle)
      if (
        x > conditionGroupElePosition.left &&
        x < conditionGroupElePosition.left + conditionGroupEle.offsetWidth &&
        y > conditionGroupElePosition.top &&
        y < conditionGroupElePosition.top + conditionGroupEle.offsetHeight
      ) {
        // 判断下面计算条件区域是否存在分组，若不存在直接新增一条，若存在，则进行后续判断
        const pageRefs = this.layOutParent.$refs
        for (const key in pageRefs) {
			
          if (key.split('_')[0] === 'realRroupDiv') {
            if (pageRefs[key].length > 0) {
              // 获取排某个分组的相对整个页面(除浏览器头部的位置)
              const realRroupElePosition = getElPosition(pageRefs[key][0])
              // 获取计算条件区域滚动偏移量，div出现滚动条时，滚动条滚动之后会有位置偏移，滚动条不滚动，偏移为0，无滚动条时，偏移为0
              const conditionGroupEleScrollPosition = this.getScrollDistance(
                'conditionGroupDiv'
              )
              if (
                x >
                  realRroupElePosition.left -
                    conditionGroupEleScrollPosition.scrollX &&
                x <
                  realRroupElePosition.left -
                    conditionGroupEleScrollPosition.scrollX +
                    pageRefs[key][0].offsetWidth &&
                y >
                  realRroupElePosition.top -
                    conditionGroupEleScrollPosition.scrollY &&
                y <
                  realRroupElePosition.top -
                    conditionGroupEleScrollPosition.scrollY +
                    pageRefs[key][0].offsetHeight
              ) {
                pageRefs[key][0].style.border = 'medium solid #67c23a'
              } else {
                pageRefs[key][0].style.border = ''
              }
            }
          }
        }
      }
    },
    // 进行位置调整x,y鼠标横纵坐标，elId树节点的id
    setAppropriatePosition(x, y, elId) {
        this.getLayOutRefs(this)
      const conditionGroupEle = this.layOutParent.$refs.conditionGroupDiv
      // 先判断是否在计算条件区域，若在，则继续进行后续判断
      const conditionGroupElePosition = getElPosition(conditionGroupEle)
      if (
        x > conditionGroupElePosition.left &&
        x < conditionGroupElePosition.left + conditionGroupEle.offsetWidth &&
        y > conditionGroupElePosition.top &&
        y < conditionGroupElePosition.top + conditionGroupEle.offsetHeight
      ) {
        // 判断下面计算条件区域是否存在分组，若不存在直接新增一条，若存在，则进行后续判断
        const pageRefs = this.layOutParent.$refs
        let hasGroupFlag = false
        let inGroupFlag=false
        let i=0
        let j=0
        for (const key in pageRefs) {
          // 若存在分组，则需判断分组内是几个条件，若是1个则直接加入分组，若存在两个，则新建分组，单独成组
          if (key.split('_')[0] === 'realRroupDiv') {
            
            i++
            if (pageRefs[key].length > 0) {
              // 获取排某个分组的相对整个页面(除浏览器头部的位置)
              const realRroupElePosition = getElPosition(pageRefs[key][0])
              // 获取计算条件区域滚动偏移量，div出现滚动条时，滚动条滚动之后会有位置偏移，滚动条不滚动，偏移为0，无滚动条时，偏移为0
              const conditionGroupEleScrollPosition = this.getScrollDistance(
                'conditionGroupDiv'
              )
              if (
                x >
                  realRroupElePosition.left -
                    conditionGroupEleScrollPosition.scrollX &&
                x <
                  realRroupElePosition.left -
                    conditionGroupEleScrollPosition.scrollX +
                    pageRefs[key][0].offsetWidth &&
                y >
                  realRroupElePosition.top -
                    conditionGroupEleScrollPosition.scrollY &&
                y <
                  realRroupElePosition.top -
                    conditionGroupEleScrollPosition.scrollY +
                    pageRefs[key][0].offsetHeight
              ) {
                  //标记鼠标定位在某个分组
                  inGroupFlag=true
                // groupList的下标
                const groupIndex = key.split('_')[1]
                // 绑定事件addCondition，在item中回调刷新计算条件区域
                //鼠标定位在某个分组，需判断某个分组是否有两个条件，若有则在区域内最后添加一个分组，没有则直接在组内追加
                this.$emit(
          'addCondition',
          '1',
          elId,
          groupIndex)
              }
            }else{
                j++
            }
          }
        }
        if(i===0 ||(i!=0 && i===j)){
            hasGroupFlag=false
        }else{
            hasGroupFlag=true
        }
        // 不存在分组时，默认直接添加第一个分组
        if (!hasGroupFlag) {
          this.$emit(
          'addCondition',
          '0',
          elId,
          '0')
        }
        //不在某个分组内，但是却在计算条件区域内，直接在区域内最后添加一个分组
        if(!inGroupFlag && hasGroupFlag){
            this.$emit(
          'addCondition',
          '2',
          elId,
          '0')
        }
      }
      
    },
    addCondition(args){
          this.$emit(
          'addCondition',
          args[0],
          args[1],args[2])
      },
    // 获取layout里的refs
    getLayOutRefs(ele) {
      const parent = ele.$parent
      const refs = ele.$parent.$refs
      let flag = true
      for (const key in refs) {
        if (key === 'conditionTreeDiv') {
          flag = false
        }
      }
      if (flag) {
        this.getLayOutRefs(parent)
      } else {
        this.layOutParent = parent
      }
    }
  }
}
</script>
<style>
ul {
  list-style-type: none;
}
.ul-wrapper{
    -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.ul-wrapper {
  background-color: white;
  user-select: none;
  color: #606266;
  font-size: 14px;
  padding-left: 16px;
}
.tree-node {
  display: flex;
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 1px solid #dcdfe6;
}

.ul-wrapper .tree-node:hover {
  background-color: #f5f7fa;
}

.tree-node i {
  transition: all 0.5s;
}

i.caret-down {
  transform: rotate(90deg);
}

/* .tree-show-enter-active, */
/* .tree-show-leave-active { */
  /* transition: opacity 0.5s; */
  /* transition: all 1s ease; */
/* } */
.tree-show-enter-active,
.tree-show-leave-active {
    transition: all 0.3s;
    /* 防止折叠时元素溢出 */
    overflow: hidden;
}

.tree-show-enter-from,
.tree-show-leave-to {
    height: 0px !important;
    opacity: 0;
}

/* .tree-show-enter-to,
.tree-show-leave-to {
  height: 0px !important;
  transition: all 1s ease;
} */
.haschild-label {
  font-weight: bold;
  margin-left:5px;
}
.tree-folder-div{
    display: flex;
    align-items:center;
    margin-left:5px;
}
.tree-file-div{
    display: flex;
    align-items:center;
	width: 100%;
}
.custom-folder {
  background: url('/src/assets/folder.png') center center no-repeat;
  background-size: cover;
  font-size: 14px;
}

.custom-folder:before {
  content: '文件';
  font-size: 14px;
  visibility: hidden;
}
</style>
