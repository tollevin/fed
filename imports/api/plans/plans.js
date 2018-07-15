import { Mongo } from 'meteor/mongo';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// SimpleSchema.debug = true;

class PlansCollection extends Mongo.Collection {
  insert(Plan, callback) {
    const ourPlan = Plan;
    ourPlan.created_at = ourPlan.created_at || new Date();
    const result = super.insert(ourPlan, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const Plans = this.find(selector).fetch();
    const result = super.remove(selector);
    return result;
  }
}

export const Plans = new PlansCollection('Plans');

// Deny all client-side updates since we will be using methods to manage this collection
Plans.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Plans.schema = new SimpleSchema({
  _id: {
    type: String,
    label: 'ID',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  // id: {
  //   type: String,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // object: {
  //   type: String,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // application_fee_percent: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // billing: {
  //   type: String,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   },
  //   autoValue: "charge_automatically",
  // },
  // billing_cycle_anchor: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // cancel_at_period_end: {
  //   type: Boolean,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  canceled_at: {
    type: Date,
    label: 'Canceled At',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  created_at: {
    type: Date,
    label: 'Created At',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  subscribed_at: {
    type: Date,
    label: 'Subscribed At',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  // current_period_end: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // current_period_start: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // user_id: {
  //   type: String,
  //   label: 'User ID',
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // days_until_due: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  percent_off: {
    type: Number,
    label: 'Discount Percent',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  // ended_at: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  item_id: {
    type: String,
    label: 'Item ID',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  item_name: {
    type: String,
    label: 'Item Name',
    optional: true,
  },
  // livemode: {
  //   type: Boolean,
  //   label: 'ID',
  //   optional: true,
  // },
  // metadata: {
  //   type: Object,
  //   label: 'ID',
  //   optional: true,
  //   blackbox: true,
  // },
  // plan: {
  //   type: Object,
  //   label: 'ID',
  //   optional: true,
  //   blackbox: true,
  // },
  quantity: {
    type: Number,
    label: 'Quantity',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  status: {
    type: String,
    label: 'Status',
    optional: true,
    autoform: {
      type: 'hidden',
    },
  },
  tax_percent: {
    type: Number,
    label: 'Tax Percent',
    decimal: true,
    defaultValue: 8.875,
  },
  price: {
    type: Number,
    label: 'Price',
    decimal: true,
  },
  // trial_end: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  // trial_start: {
  //   type: Number,
  //   label: 'ID',
  //   optional: true,
  //   autoform: {
  //     type: "hidden"
  //   }
  // },
  frequency: {
    type: Number,
    label: 'Frequency',
    optional: true,
  },
});

Plans.attachSchema(Plans.schema);

// This represents the keys from Plans objects that should be published
// to the client. If we add secret properties to Plan objects, don't list
// them here to keep them private to the server.
Plans.publicFields = {
  _id: 1,
  // id: 1,
  // object: 1,
  // application_fee_percent: 1,
  // billing: 1,
  // billing_cycle_anchor: 1,
  // cancel_at_period_end: 1,
  canceled_at: 1,
  created_at: 1,
  subscribed_at: 1,
  // current_period_end: 1,
  // current_period_start: 1,
  // user_id: 1,
  // days_until_due: 1,
  percent_off: 1,
  // ended_at: 1,
  item_id: 1,
  // livemode: 1,
  // metadata: 1,
  // plan: 1,
  quantity: 1,
  // start: 1,
  status: 1,
  tax_percent: 1,
  price: 1,
  // trial_end: 1,
  // trial_start: 1,
  frequency: 1,
};

Plans.helpers({

});
