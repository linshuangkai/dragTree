<template>
<div style="height: 100vh;">
  <div class="left-right-layout">
      <div  class="condition-tree-div">
          <div class="condition-tree-title">Name</div>
          <div ref="conditionTreeDiv" class="condition-tree-content">
            <item-tree :list="treeList" @addCondition="addCondition(arguments)"></item-tree>
          </div>
      </div>
      <div style="width:40px;">
      </div>
      <div class="condition-group-div">
          <div class="condition-group-title">Include members in these segments</div>
          <div ref="conditionGroupDiv" class="condition-group-content">
          <div class="group-div" v-for="(group,index) in groupList" :key="index" >
              <div v-show="group.groupLogicalValue!=null">
                  <el-select class="select-btn" v-model="group.groupLogicalValue">
                    <el-option
                    v-for="item in LogicalOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
              </div>
              <div :ref="'realRroupDiv_'+index" class="real-group-div">
                <div  v-for="(item,i) in group.itemList" :key="item.itemPath+'_'+i" >
                    <div  v-show="item.itemLogicalValue!=null">
                        <el-select class="select-btn" v-model="item.itemLogicalValue">
                            <el-option
                            v-for="item in LogicalOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <div @mouseenter="moveIn(item)">
                        <item-condition  :conditionInfo="item" :groupIndex="index" :itemIndex="i" @delItem="delItem(arguments)"></item-condition>
                    </div>
                </div>
              </div>
          </div> 
</div>
      </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import ItemTree from '@/components/itemtree/index.vue'
import ItemCondition from '@/components/itemcondition/index.vue'
export default {
  name: 'ItemLayout',
  components: {
      ItemTree,
    ItemCondition
  },
  data() {
    return {  
      treeList: [],
        groupList:[],
        LogicalOptions:[{label:'AND',value:'AND'},{label:'OR',value:'OR'}],
        layoutRefs:null,
        currTreeNode:null,
        currTreeNodePath:'',
		nowcode:''
    }
  },
  beforeMount() {
	axios.get("/api/tree").then(response => {
	if (response.data.code == 200) {
		this.treeList = response.data.data
		this.initArr(this.treeList)
		this.treeList = JSON.parse(JSON.stringify(this.treeList))
		// console.log(response.data)
		} else {
			console.log(response.data)
		}
	})
  },
  methods:{
	moveIn(item){
		this.nowcode = item.treeId
	},
	initArr(arr){
		var that = this
		arr.forEach((item)=>{
			item.expanded = true
			if(item.children){
				that.initArr(item.children)
			}
		})
	},
      //删除某个条件回调
      delItem(args){
          //分组下标
          let groupIndex=Number(args[0])
          //组内元素下标
          let itemIndex=Number(args[1])
          //如果是删的第一个分组内的元素，则需考虑是否让第二组的groupLogicalValue设为null
          //只有一个分组时
          if(this.groupList.length===1){
              //分组内只有一个元素时
              if(this.groupList[0].itemList.length===1){
                //置空this.groupList
                this.groupList=[]
              }else{
                  //分组内不止一个元素时
                  let currItemList=this.groupList[0].itemList
                  if(itemIndex===0){
                      //删第一个元素，则将第二个元素的itemLogicalValue设为null
                        currItemList[1].itemLogicalValue=null
                        currItemList.splice(itemIndex, 1)
                  }else{
                      //删第一个元素，直接删
                      currItemList.splice(itemIndex, 1)
                  }
              }
          }else{
              if(groupIndex===0){
                  //删的条件元素在第一个分组
                  let currItemList=this.groupList[groupIndex].itemList
                  if(currItemList.length===1){
                      //分组中，只有一个元素
                      //将第二个分组中的groupLogicalValue设为null
                      let nextGroup=this.groupList[groupIndex+1]
                      nextGroup.groupLogicalValue=null
                      this.groupList.splice(groupIndex, 1)
                  }else{
                      //分组中，不止有一个元素
                      if(itemIndex===0){
                          //删第一个元素，则将第二个元素的itemLogicalValue设为null
                        currItemList[1].itemLogicalValue=null
                        currItemList.splice(itemIndex, 1)
                      }else{
                          //删第一个元素，直接删
                        currItemList.splice(itemIndex, 1)
                      }
                  }
              }else{
                  //删的条件元素不在第一个分组
                    let currItemList=this.groupList[groupIndex].itemList
                    if(currItemList.length===1){
                        //分组中，只有一个元素，删除分组
                        this.groupList.splice(groupIndex, 1)
                        }else{
                            //分组中，不止有一个元素
                            if(itemIndex===0){
                          //删第一个元素，则将第二个元素的itemLogicalValue设为null
                                currItemList[1].itemLogicalValue=null
                                currItemList.splice(itemIndex, 1)
                            }else{
                                //删第一个元素，直接删
                                currItemList.splice(itemIndex, 1)
                            }
                        }
              }
          }
        this.$message.success('删除成功')
      },
      addCondition(args){
          //根据拖拽结果，渲染条件区域
          //是否在分组内
          let type=args[0]
          //树节点id
          let treeId=args[1]
          //条件分组groupList的下标
          let groupIndex=args[2]
          //根据树节点id，找到对应的树节点
          this.currTreeNodePath=''
          // this.iterationDataFindCurrFloor(this.treeList,Number(treeId))
          this.iterationDataFindCurrFloor(this.treeList,treeId)
          this.iterationDataFindParentFloorPath(this.treeList,this.currTreeNode.parentId)
          
          this.currTreeNodePath+=this.currTreeNode.label
          if(type==='0'){
              //不存在分组，直接在条件区域内新增分组
                this.groupList.push({itemList:[{treeId:treeId,itemPath:this.currTreeNodePath,itemLogicalValue:null,conditionName:this.currTreeNode.label}],groupLogicalValue:null})
          }else if(type==='1'){
              //根据groupIndex，判断组内有几个条件，若1个，在组内最后增加条件。若2个，直接在条件区域最后新增分组
                let currGroupItems=this.groupList[Number(groupIndex)].itemList
                // if(currGroupItems.length===1){
                    currGroupItems.push({treeId:treeId,itemPath:this.currTreeNodePath,itemLogicalValue:'AND',conditionName:this.currTreeNode.label})
                // }else{
                //     this.groupList.push({itemList:[{itemPath:this.currTreeNodePath,itemLogicalValue:null,conditionName:this.currTreeNode.label}],groupLogicalValue:'AND'})
                // }
          }else if(type==='2'){
                //存在分组，不在组内，直接在条件区域最后新增分组
                this.groupList.push({itemList:[{treeId:treeId,itemPath:this.currTreeNodePath,itemLogicalValue:null,conditionName:this.currTreeNode.label}],groupLogicalValue:'AND'})
          }
          this.$message.success('添加成功')
      },
      // 迭代找出当前id对应节点
    iterationDataFindCurrFloor(datas, id) {
      let flag = false
      for (let i = 0; i < datas.length; i++) {
        if (datas[i].id === id) {
          flag = true
          this.currTreeNode=datas[i]
        }
      }
      if (!flag){
        let da
        for (let j = 0; j < datas.length; j++) {
          da = datas[j]
          if (da.children != null && da.children && da.children.length > 0) {
            this.iterationDataFindCurrFloor(da.children, id)
          }
        }
      }
    },
     // 迭代找出当前id对应父节点的路径
     iterationDataFindParentFloorPath(datas, parentId) {
      let flag = false
      let parentNode
      for (let i = 0; i < datas.length; i++) {
        if (datas[i].id === parentId) {
          flag = true
          parentNode=datas[i]
          this.currTreeNodePath=parentNode.label+' / '+this.currTreeNodePath
        }
      }
      if (!flag){  
          let da
        for (let j = 0; j < datas.length; j++) {
          da = datas[j]
          if (da.children != null && da.children && da.children.length > 0) {
             this.iterationDataFindParentFloorPath(da.children, parentId)
          }
        }
      }else{
        if(parentNode.parentId){
            this.iterationDataFindParentFloorPath(this.treeList, parentNode.parentId)
        }
      }
    }
  }
}
</script>
<style>
.left-right-layout{
    height: 98%;
    display: flex;
    justify-content:space-around;
}

.condition-tree-div{
    width:49%;
    height: calc( 98% - 30px );
    margin-top: 30px;
    
}
.condition-tree-title{
    height:30px;
    line-height: 30px;
    padding-left: 15px;
    background: #f5f7fa;
    font-weight: bold;
}
.condition-tree-content{
    height: calc( 100% - 30px );
    overflow: auto;
}
.condition-group-div{
    width:49%;
    height: calc( 98% - 20px );
    padding:10px 20px;
    margin-top: 20px;
    
}
.condition-group-title{
    height:30px;
    line-height: 30px;
    padding-left: 15px;
    background: #f5f7fa;
    font-weight: bold;
}
.condition-group-content{
    background: #eefdee;
    height: calc( 100% - 30px );
    padding:10px 20px;
    overflow: auto;
}
.group-div{
    /*background: #fff;*/
}
.real-group-div{
    background: #fff;
    margin-top:5px ;
    margin-bottom:5px ;
    border-radius: 4px;
}
.select-btn{
    width: 65px;
    
}
.select-btn .el-input__inner{
    border-radius: 15px;
    background-color:#1989fa;
    color:#fff;
}
.select-btn .el-input--small .el-input__inner{
    padding-left: 5px;
    height: 24px;
    line-height: 24px;
}
.select-btn .el-input--small .el-input__icon{
    line-height: 24px;
}
.select-btn.el-select .el-input .el-select__caret{
   color:#fff;
}
</style>