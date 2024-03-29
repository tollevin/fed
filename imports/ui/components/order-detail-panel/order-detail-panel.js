import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { moment } from 'meteor/momentjs:moment';
import { toNewYorkTimezone } from '/imports/ui/lib/time';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import { Orders } from '/imports/api/orders/orders.js';
import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

// Methods
import { toggleSkip } from '/imports/api/orders/methods.js';

// Template
import './order-detail-panel.html';

Template.Order_detail_panel.onCreated(function orderDetailPanelOnCreated() {
  this.subscribe('DeliveryWindows.forMenu', this.data.menu_id);
  this.subscribe('single.order', this.data._id);

  this.delivery_window = new ReactiveVar();
  this.status = new ReactiveVar();


  this.autorun(() => {
    if (this.subscriptionsReady()) {
      const dw = DeliveryWindows.findOne({ _id: this.data.delivery_window_id });
      this.delivery_window.set(dw);

      const order = Orders.findOne({});
      this.status.set(order.status);
    }
  });
});

Template.Order_detail_panel.helpers({
  date: () => {
    const dw = Template.instance().delivery_window.get();
    if (!dw) return undefined;
    return moment(dw.delivery_start_time).format('dddd, MMM Do');
  },

  time: () => {
    const dw = Template.instance().delivery_window.get();
    if (!dw) { return undefined; }
    const start = moment(dw.delivery_start_time).format('ha');
    const end = moment(dw.delivery_end_time).format('ha');
    return `${start}-${end}`;
  },

  active: () => ['skipped', 'canceled'].indexOf(Template.instance().status.get()) <= -1,

  locked: () => {
    const timestamp = toNewYorkTimezone(moment());
    return (timestamp.day() < 4 || (timestamp.day() === 0 && timestamp.hour() < 12)) && 'locked';
  },

  status: () => {
    switch (Template.instance().status.get()) {
      case 'created':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'pending-sub':
        return 'Pending';
      case 'skipped':
        return 'Skipped';
      default:
        return undefined;
    }
  },

  itemsTally: () => {
    const itemList = Template.currentData().items;
    const itemTally = {};

    for (let i = itemList.length - 1; i >= 0; i -= 1) {
      if (!itemTally[itemList[i].name]) {
        itemTally[itemList[i].name] = 1;
      } else {
        itemTally[itemList[i].name] += 1;
      }
    }

    return Object.entries(itemTally).map(([name, value]) => ({ name, value }));
  },

  isPack: item => item.name.split('-')[1] === 'Pack',

  subitems: (item) => {
    const orderItemList = Template.currentData().items;
    let subItemList = [];
    const subItemTally = {};

    for (let i = orderItemList.length - 1; i >= 0; i -= 1) {
      if (orderItemList[i].name === item.name) {
        subItemList = orderItemList[i].sub_items.items;
      }
    }

    for (let i = subItemList.length - 1; i >= 0; i -= 1) {
      if (!subItemTally[subItemList[i].name]) {
        subItemTally[subItemList[i].name] = 1;
      } else {
        subItemTally[subItemList[i].name] += 1;
      }
    }

    return Object.entries(subItemTally).map(([name, value]) => ({ name, value }));
  },
});

Template.Order_detail_panel.events({
  'click .switch'(event) {
    event.preventDefault();

    const timestamp = toNewYorkTimezone(moment());
    let able = false;

    if ((timestamp.day() === 0)) {
      if (timestamp.hour() > 12) {
        able = true;
      }
    } else if (timestamp.day() < 4) {
      able = true;
    }

    if (able) {
      const order = Orders.findOne({});
      const data = {
        order_id: order._id,
      };
      toggleSkip.call(data);
    }
  },

  'click .edit-order'(event) {
    event.preventDefault();

    Session.set('overlay', 'packEditor');
  },
});
