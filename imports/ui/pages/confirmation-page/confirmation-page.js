import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { moment } from 'meteor/momentjs:moment';

// Components
import '/imports/ui/components/footer/footer.js';

// Collections
import DeliveryWindows from '/imports//api/delivery/delivery-windows.js';

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
      default:
        return undefined;
    }
  },

  deliveryDay: () => {
    const order = Template.instance().order.get();
    const dwId = order.delivery_window_id;
    const dw = DeliveryWindows.findOne({ _id: dwId });
    if (!dw) { return undefined; }
    const deliveryDay = moment(dw.delivery_start_time).format('dddd, MMMM Do');
    if (order.subscriptions && order.subscriptions.length > 1) {
      return `Starting ${deliveryDay}`;
    }
    return `for ${deliveryDay}`;
  },

  recipient: () => Template.instance().order.get().recipient,

  itemsTally: () => {
    const itemList = Template.instance().order.get().items;
    const itemTally = {};

    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      itemTally[itemList[i].name] = (itemTally[itemList[i].name] || 0) + 1;
    }

    return Object.entries(itemTally)
      .map(([name, value]) => ({ name, value }));
  },

  isPack: item => item.name.split('-')[1] === 'Pack',

  subitems: (item) => {
    const orderItemList = Template.instance().order.get().items;
    let subItemList = [];
    const subItemTally = {};

    for (let i = orderItemList.length - 1; i >= 0; i -= 1) {
      if (orderItemList[i].name === item.name) {
        subItemList = orderItemList[i].sub_items.items;
      }
    }

    for (let i = subItemList.length - 1; i >= 0; i -= 1) {
      subItemTally[subItemList[i].name] = (subItemTally[subItemList[i].name] || 0) + 1;
    }

    return Object.entries(subItemTally)
      .map(([name, value]) => ({ name, value }));
  },

  subtotal: () => Template.instance().order.get()
    && Template.instance().order.get().subtotal.toFixed(2),

  deliveryFee: () => {
    const deliveryFee = Template.instance().order.get().delivery_fee;
    return deliveryFee && deliveryFee.toFixed(2);
  },

  discountTotal: () => Template.instance().order.get()
    && Template.instance().order.get().discount.value
    && Template.instance().order.get().discount.value.toFixed(2),

  sales_tax: () => Template.instance().order.get()
    && Template.instance().order.get().sales_tax.toFixed(2),

  total: () => Template.instance().order.get()
    && Template.instance().order.get().total.toFixed(2),
});
