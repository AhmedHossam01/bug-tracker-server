"use strict";

/**
 *  ticket controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::ticket.ticket", ({ strapi }) => ({
  async create(ctx) {
    // on create ticket, default owner and assignee are added
    ctx.request.body.data.owner = ctx.state.user;
    ctx.request.body.data.assignee = ctx.state.user;

    return await super.create(ctx);
  },

  async find(ctx) {
    //   find all tickets that this member is assigned to or an owner of
    ctx.request.query.filters = {
      $or: [{ owner: ctx.state.user.id }, { assignee: ctx.state.user.id }],
    };

    return await super.find(ctx);
  },

  async update(ctx) {
    // only ticket owner or assignee can update the tickect
    const query = {
      filters: {
        id: ctx.params.id,
      },
    };

    const ticket = await super.find({ query });
    if (
      ctx.state.user.id === ticket.owner.id ||
      ctx.state.user.id === ticket.assignee.id
    ) {
      return await super.update(ctx);
    }

    return ctx.unauthorized("You can't update this entry");
  },

  async delete(ctx) {
    // only ticket owner can delete his ticket
    const query = {
      filters: {
        id: ctx.params.id,
      },
    };

    const ticket = await super.find({ query });
    if (ctx.state.user.id === ticket.owner.id) {
      return await super.delete(ctx);
    }

    return ctx.unauthorized("You can't update this entry");
  },
}));
