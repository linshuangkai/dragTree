<template>
  <div style="padding:5px 5px;">
      <div class="condition-header">
          <div class="condition-header-left"><img style="transform: rotate(90deg);" :src="`${publicPath}img/tz.png`"/><span style="margin-left:20px;">{{conditionInfo.conditionName}}</span><span style="margin:0px 2px;">=</span><span style="font-weight:bold;">{{selectedLabel}}</span></div>
          <div><i :class="['header-btn','el-icon','el-icon-arrow-right',expanded ?'arrow-down':'']" @click="changeExpanded"></i> <i class="header-btn el-icon-close" style="margin-right:5px;" @click="delCondition"></i></div>
      </div>
      <transition name="condition-show">
        <div v-show="expanded">
            <div class="condition-body">
                <div class="item-path-div">{{conditionInfo.itemPath}}</div>
                <div>
                    <el-input style="width:50%;" v-model="searchValue">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <div class="selected-related"><el-button type="text" @click="clearAll">Clear All</el-button><span>{{selectedDesc}}</span></div>
                <div>
                    <el-checkbox-group v-model="checkList">
                        <el-row :gutter="20" >
                            <el-col v-for="item in conditionValuesShow" :key="item.id" :span="6">
								<div class="item-value-div"><el-checkbox :label="item.label"></el-checkbox>
								</div>
								</el-col>
                        </el-row>
                    </el-checkbox-group>
                </div>
            </div>
        </div>
      </transition>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'ItemCondition',
  props:{
      conditionInfo:{
          type:Object,
          default:()=>{
              return {}
          }
      },
      groupIndex:{
          type:Number,
          default:0
      },
      itemIndex:{
          type:Number,
          default:0
      }
  },
  data() {
    return {  
        publicPath: process.env.BASE_URL,
      searchValue:null,
      expanded:true,
      conditionValues:[{label:'ren',num:80},{label:'da',num:50},{label:'gh',num:200},{label:'ty',num:206},{label:'yt',num:95},{label:'wer',num:20},{label:'nh',num:96},{label:'yu',num:45},],
      checkList:[],
      treeNodeValues:[],
      conditionValuesShow:[]
    }
  },
  created(){
      this.initDom()
  },
  computed: {
      selectedDesc() {
          return this.checkList.length+' selected'
      },
      selectedLabel(){
          let descLabel=''
          this.checkList.forEach((item)=>{
              descLabel=descLabel+item+","
          })
          
          return descLabel.length>0?descLabel.substring(0,descLabel.length-1):''
      }
  },
  methods:{
      changeExpanded(){
          this.expanded=!this.expanded
      },
      //删除某个条件
      delCondition(){
        this.$emit(
          'delItem',
          this.groupIndex,
          this.itemIndex)
      },
      //清空所有选中
      clearAll(){
          this.checkList=[]
      },
      initDom(){
			axios.get("/api/selectOpts",{id:this.conditionInfo.treeId}).then(response => {
			if (response.data) {
				this.conditionValues = response.data.data.list
				this.conditionValuesShow = JSON.parse(JSON.stringify(this.conditionValues))
				console.log(response.data)
				}
			})
			axios.get("/parameter/query").then(response => {
			if (response.data) {
				console.log(response.data)
				}
			})
      }
  },
  watch: {
    //   conditionInfo: {
    //   handler(newValue, oldValue) {
    //     console.log(oldValue)
    //   this.conditionValues=[]
    //   if (newValue) {
    //     this.$nextTick(() => {
    //       //根据conditionInfo的name去查找对应值集合
    //         this.treeNodeValues.forEach((item)=>{
    //             if(item.city===newValue.conditionName){
    //                 this.conditionValues.push({
    //                     label:item.food,num:item.likes
    //                 })
    //             }
    //         })
    //     })
    //   }
    //   },
    //   immediate:  true
    // }
	searchValue:{
		handler(newValue) {
			this.conditionValuesShow=[]
			if(newValue === ''){
				this.conditionValuesShow = JSON.parse(JSON.stringify(this.conditionValues))
			}else {
				this.conditionValuesShow = this.conditionValues.filter(el=>
				el.label.indexOf(newValue)>-1)
			}
		},
		immediate:  true
	}
  }
}
</script>
<style>
.condition-header{
    display: flex;
    justify-content:space-between;
    align-items:center;
    height: 32px;
    border: 1px solid #DCDFE6;
    border-top-left-radius: 5px;
    border-top-right-radius:5px;
}
.condition-header-left{
    display: flex;
    align-items:center;
    font-size: 14px;
}
.header-btn{
    cursor: pointer;
}
i.arrow-down{
  transform: rotate(90deg);
}
.condition-body{
    border-left: 1px solid #DCDFE6;
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius:5px;
    padding:0px 15px 5px;
}
.item-path-div{
    height: 32px;
    line-height: 32px;
    font-size: 14px;
}
.selected-related .el-button--text{
  color:#67c23a;
  font-weight: bold;
}
.selected-related .el-button--text:hover{
    color:#67c23a;
}
.selected-related span{
    margin-left: 6px;
    font-size: 12px;
    font-weight: bold;
}
.item-value-div{
    display: flex;
    justify-content:space-between;
    align-items:center;
}
/* .el-checkbox__label{
    color:#cccccc;
} */
.item-value-div .el-checkbox__input.is-checked .el-checkbox__inner, .item-value-div .el-checkbox__input.is-indeterminate .el-checkbox__inner{
    background-color:#67c23a;
    border-color:#67c23a;
}
.item-value-div .el-checkbox__input.is-checked+.el-checkbox__label{
    color:#cccccc;
}
.item-value-div span{
    font-size: 12px;
}
.condition-show-enter-active,
.condition-show-leave-active {
  transition: opacity 0.5s;
}

.condition-show-enter-to,
.condition-show-leave-to {
  opacity: 0.3;
}
</style>