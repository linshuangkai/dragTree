import mockjs from 'mockjs';

export default {
  'get|/api/tree': 
  {code: 200,
  message: 'success',
  data: 
	[{
	id: '1',
	label: 'My Data',
	children: [
		{
		id: '11',
		label: 'DeviceReach-ppid',
		parentId:'1',
		children: [
		{
		id: '111',
		label: 'AdultComposition',
		parentId:'11'
		},
		{
		id: '112',
		label: 'AdultComposition11',
		parentId:'11'
		},
		{
		id: '113',
		label: 'Age',
		parentId:'11'
		},
		{
		id: '114',
		label: 'Education',
		parentId:'11'
		},
		{
		id: '115',
		label: 'Gender',
		parentId:'11'
		},
		{
		id: '116',label: 'PresenceOfChild',parentId:'11'},],
		},]
		,},
		{id: '2',
		label: 'Analytics Environment Data',
		children: [{ id: '21', label: 'Ring ratio',parentId:'2' }],},
		{id: '3',
		label: 'Saved Audiences',
		children: [{ id: '31', label: 'average person',parentId:'3' }],},
		{id: '4',
		label: 'Lookalike Group',
		children: [{ id: '41', label: 'test',parentId:'4' }],},
	]
	},
  'get|/api/selectOpts': {
      code: 200,
      message: 'success',
      data: mockjs.mock({
      'list|4-9': [{ id: '@id', label: '@name', value: '@integer(1, 20)' }],
      })
  }
};
