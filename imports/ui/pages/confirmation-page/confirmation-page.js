import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

// Components
import '/imports/ui/components/footer/footer.js';

// Collections
import { DeliveryWindows } from '/imports//api/delivery/delivery-windows.js';

// Template
import './confirmation-page.less';
import './confirmation-page.html';

Template.Confirmation.onCreated(function confirmationOnCreated() {
  if (!Meteor.userId()) {
    FlowRouter.go('signin');
  } else {
    const order = Session.get('orderId');
    this.order = new ReactiveVar(order);

    this.autorun(() => {
      this.subscribe('DeliveryWindows.single', order.delivery_window_id);
    });
  }
});

Template.Confirmation.helpers({
  orderStatus: () => {
    const order = Template.instance().order.get();
    switch (order.status) {
      case 'custom-sub':
        return 'Your order has been saved';
      case 'created':
        if (order.subscriptions && order.subscriptions.length > 1) {
          return "You're subscribed!";
        }
        return ' Your order has been received';
    }
  },

  deliveryDay: () => {
    const order = Template.instance().order.get();
    const dw_id = order.delivery_window_id;
    const dw = DeliveryWindows.findOne({ _id: dw_id });
    if (dw) {
      const deliveryDay = moment(dw.delivery_start_time).format('dddd, MMMM Do');
      if (order.subscriptions && order.subscriptions.length > 1) {
        return `Starting ${deliveryDay}`;
      }
      return `for ${deliveryDay}`;
    }
  },

  recipient: () => Template.instance().order.get().recipient,

  itemsTally: () => {
    const itemList = Template.instance().order.get().items;
    const itemTally = {};

    for (let i = itemList.length - 1; i >= 0; i--) {
      if (!itemTally[itemList[i].name]) {
        itemTally[itemList[i].name] = 1;
      } else {
        itemTally[itemList[i].name] += 1;
      }
    }

    const result = [];
    for (const key in itemTally) result.push({ name: key, value: itemTally[key] });
    return result;
  },

  isPack: item => item.name.split('-')[1] === 'Pack',

  subitems: (item) => {
    const orderItemList = Template.instance().order.get().items;
    let subItemList = [];
    const subItemTally = {};

    for (var i = orderItemList.length - 1; i >= 0; i--) {
      if (orderItemList[i].name === item.name) {
        subItemList = orderItemList[i].sub_items.items;
      }
    }

    for (var i = subItemList.length - 1; i >= 0; i--) {
      if (!subItemTally[subItemList[i].name]) {
        subItemTally[subItemList[i].name] = 1;
      } else {
        subItemTally[subItemList[i].name] += 1;
      }
    }

    const result = [];
    for (const key in subItemTally) result.push({ name: key, value: subItemTally[key] });
    return result;
  },

  subtotal: () => Template.instance().order.get() && Template.instance().order.get().subtotal.toFixed(2),

  deliveryFee: () => {
    const delivery_fee = Template.instance().order.get().delivery_fee;
    return delivery_fee && delivery_fee.toFixed(2);
  },

  discountTotal: () => Template.instance().order.get() && Template.instance().order.get().discount.value && Template.instance().order.get().discount.value.toFixed(2),

  sales_tax: () => Template.instance().order.get() && Template.instance().order.get().sales_tax.toFixed(2),

  total: () => Template.instance().order.get() && Template.instance().order.get().total.toFixed(2),
});
