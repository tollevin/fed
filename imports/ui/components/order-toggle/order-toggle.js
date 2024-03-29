import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import { Orders } from '/imports/api/orders/orders.js';
import DeliveryWindows from '/imports/api/delivery/delivery-windows.js';

// Methods
import { toggleSkip } from '/imports/api/orders/methods.js';

// Template
import './order-toggle.html';

Template.Order_toggle.onCreated(function orderToggleOnCreated() {
  this.subscribe('DeliveryWindows.forMenu', this.data.menu_id);
  this.subscribe('single.order', this.data._id);

  this.delivery_window = new ReactiveVar();
  this.status = new ReactiveVar();

  this.autorun(() => {
    if (!this.subscriptionsReady()) { return; }

    const dw = DeliveryWindows.findOne({ _id: this.data.delivery_window_id });
    this.delivery_window.set(dw);

    const order = Orders.findOne({ _id: this.data._id });
    this.status.set(order.status);
  });
});

Template.Order_toggle.helpers({
  date: () => {
    const dw = Template.instance().delivery_window.get();
    if (!dw) { return undefined; }
    return moment(dw.delivery_start_time).format('dddd, MMM Do');
  },

  time: () => {
    const dw = Template.instance().delivery_window.get();
    if (!dw) { return undefined; }
    const start = moment(dw.delivery_start_time).format('ha');
    const end = moment(dw.delivery_end_time).format('ha');
    return `${start}-${end}`;
  },

  checked: () => ['skipped', 'canceled'].indexOf(Template.instance().status.get()) <= -1,
});

Template.Order_toggle.events({
  'click .switch, touchstart .switch'(event, templateInstance) {
    event.preventDefault();
    toggleSkip.call({ order_id: templateInstance.data._id });
  },
});
