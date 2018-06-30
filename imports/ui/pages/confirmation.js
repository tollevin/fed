import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

// Template
import './confirmation.html';

// Components
import '../components/footer.js';

// Collections
// import { Orders } from '../../api/orders/orders.js';
import { DeliveryWindows } from '../../api/delivery/delivery-windows.js';

Template.Confirmation.onCreated(function confirmationOnCreated() {
  if (!Meteor.userId()) {
    FlowRouter.go('signin');
  } else {
    this.order = new ReactiveVar();
    this.autorun(()=> {
      const order = Session.get('orderId');
      this.order.set(order);
      this.subscribe('DeliveryWindows.single', Session.get('orderId').delivery_window_id);
    })
  };
});

Template.Confirmation.onRendered(function confirmationOnRendered() {
  // if they received a pack, prompt to rate
});

Template.Confirmation.helpers({
  orderStatus: ()=> {
    const order = Template.instance().order.get();
    switch (order.status) {
      case "custom-sub":
        return "Your order has been saved";
      case "created":
        if (order.subscriptions && order.subscriptions.length > 1) {
          return "You're subscribed!";
        } else {
          return " Your order has been received";
        };
    };
  },

  deliveryDay: ()=> {
    const order = Template.instance().order.get();
    const dw_id = order.delivery_window_id;
    const dw = DeliveryWindows.findOne({_id: dw_id});
    if (dw) {
      const deliveryDay = moment(dw.delivery_start_time).format('dddd, MMMM Do');
      if (order.subscriptions && order.subscriptions.length > 1) {
        return 'Starting ' + deliveryDay;
      } else {
        return 'for ' + deliveryDay;
      };
    };
  },

  recipient: ()=> {
    return Template.instance().order.get().recipient;
  },

  itemsTally: ()=> {
    var itemList = Template.instance().order.get().items;
    var itemTally = {};

    for (var i = itemList.length - 1; i >= 0; i--) {
      if (!itemTally[itemList[i].name]) {
        itemTally[itemList[i].name] = 1;
      } else {
        itemTally[itemList[i].name] += 1;
      };
    };
    
    var result = [];
    for (var key in itemTally) result.push({name:key,value:itemTally[key]});
    return result;
  },

  isPack: (item)=> {
    return item.name.split('-')[1] === 'Pack';
  },

  subitems: (item)=> {
    var orderItemList = Template.instance().order.get().items;
    var subItemList = [];
    var subItemTally = {};

    for (var i = orderItemList.length - 1; i >= 0; i--) {
      if (orderItemList[i].name === item.name) {
        subItemList = orderItemList[i].sub_items.items;
      };
    };

    for (var i = subItemList.length - 1; i >= 0; i--) {
      if (!subItemTally[subItemList[i].name]) {
        subItemTally[subItemList[i].name] = 1;
      } else {
        subItemTally[subItemList[i].name] += 1;
      };
    };
    
    var result = [];
    for (var key in subItemTally) result.push({name:key,value:subItemTally[key]});
    return result;
  },

  subtotal: ()=> {
    return Template.instance().order.get() && Template.instance().order.get().subtotal.toFixed(2);
  },

  deliveryFee: ()=> {
    const delivery_fee = Template.instance().order.get().delivery_fee;
    return delivery_fee && delivery_fee.toFixed(2);
  },

  discountTotal: ()=> {
    return Template.instance().order.get() && Template.instance().order.get().discount.value && Template.instance().order.get().discount.value.toFixed(2);
  },

  sales_tax: ()=> {
    return Template.instance().order.get() && Template.instance().order.get().sales_tax.toFixed(2);
  },

  total: ()=> {
    return Template.instance().order.get() && Template.instance().order.get().total.toFixed(2);
  },
});

Template.Confirmation.events({
  
});