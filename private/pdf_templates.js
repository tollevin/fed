var dd = {
	content: [
		{
			image: 'sampleImage.jpg',
			width: 150,
			height: 150,
		},
		{text: 'Packing Slip', style: 'header'},
		{text: 'for {{name}}', style: 'subheader'},
		{text: '{{pack}} Pack', style: 'pack-name'},
		{
			columns: [
				{
					text: 'Dishes', style: 'title',
					ul: [
						'item 1',
						'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Malit profecta versatur nomine ocurreret multavit',
					]
				},
				{
					text: 'Snacks', style: 'title',
					ul: [
						'item 1',
						'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Malit profecta versatur nomine ocurreret multavit',
					]
				}
			]
		},
	],
	styles: {
		header: {
			fontSize: 18,
			bold: true,
			alignment: 'right',
			margin: [0,190,0,80]		
		},
		subheader: {
			fontSize: 14
		},
		superMargin: {
			margin: [20, 0, 40, 0],
			fontSize: 15,
		}
	}
};