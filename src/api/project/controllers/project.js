"use strict";

/**
 *  project controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::project.project", ({ strapi }) => ({
  async find(ctx) {
    const query = {
      filters: {
        members: { id: ctx.state.user.id },
      },
    };

    const projects = await super.find({ query });

    return projects;
  },

  async create(ctx) {
    ctx.request.body.data.owner = ctx.state.user;
    ctx.request.body.data.members = [ctx.state.user];

    return await super.create(ctx);
  },

  async update(ctx) {
    const query = {
      filters: {
        id: ctx.params.id,
        members: { id: ctx.state.user.id },
      },
    };
    const project = await super.find({ query });

    if (!project.data || !project.data.length) {
      return ctx.unauthorized("You can't update this entry");
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const query = {
      filters: {
        id: ctx.params.id,
        owner: { id: ctx.state.user.id },
      },
    };
    const project = await super.find({ query: query });

    if (!project.data || !project.data.length) {
      return ctx.unauthorized("You can't update this entry");
    }

    return await super.delete(ctx);
  },
}));
