<template>
	<div>
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
				<div>
					<!-- <div @mouseenter="moveIn(item)"> -->
					<item-condition  :conditionInfo="item" :groupIndex="index" :itemIndex="i" @delItem="delItem(arguments)"></item-condition>
				</div>
			</div>
			</div>
		</div> 
	</div>
	
</template>

<script>
	import ItemCondition from '@/components/itemcondition/index.vue'
	export default {
	name: 'ItemLayout',
	props: {
		groupList: {
			type: Array,
			default: () => {
			return []
			}
		}
	},
	data(){
		return {
			LogicalOptions:[{label:'AND',value:'AND'},{label:'OR',value:'OR'}],
		}
	},
	components: {
		ItemCondition,
	},
	}
</script>

<style>
	
</style>
