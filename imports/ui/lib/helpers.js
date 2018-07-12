// Meteor method wrapper for async
export const callWithPromise = (method, myParameters) => new Promise((resolve, reject) => {
  // Anything called with callWithPromise must have only one args object
  Meteor.call(method, myParameters, (err, res) => {
    if (err) {
      reject(err);
    }
    resolve(res);
  });
});

// String Functions
export const minString = (str) => {
  const string = str.replace(/\s+/g, '');
  return string.toLowerCase();
};

// Array Functions
export const countInArray = (array, what) => array.filter(item => item == what).length;

// Cart Functions
export const cartSlots = () => {
  let newPack = {
  	dishes: ['', '', '', '', '', ''],
    snacks: [''],
    price: 8500,
    description: 'Fed 6-Pack',
  };
  switch (Session.get('PackSelected')) {
    case '6-Pack':
      newPack = {
      	dishes: ['', '', '', '', '', ''],
        snacks: [''],
        price: 8500,
        description: 'Fed 6-Pack',
      };
      break;
    case '8-Pack':
      newPack = {
      	dishes: ['', '', '', '', '', '', '', ''],
        snacks: [''],
        price: 11000,
        description: 'Fed 8-Pack',
      };
      break;
    case '10-Pack':
      newPack = {
      	dishes: ['', '', '', '', '', '', '', '', '', ''],
        snacks: ['', ''],
        price: 13500,
        description: 'Fed 10-Pack',
      };
      break;
    case '12-Pack':
      newPack = {
      	dishes: ['', '', '', '', '', '', '', '', '', '', '', ''],
        snacks: ['', ''],
        price: 15900,
        description: 'Fed 12-Pack',
      };
    	break;
  }
  // Set the template for order data. Could replace with orderId
  Session.set('pack', newPack);
};
