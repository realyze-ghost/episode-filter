'use strict';

const _ = require('lodash');
const Joi = require('joi');

// Joi schema describing required fields.
const itemSchema = Joi.object().keys({
  drm: Joi.boolean(),
  episodeCount: Joi.number(),
  image: Joi.object().keys({showImage: Joi.string()}),
  slug: Joi.string(),
  title: Joi.string()
});

module.exports = {

  filterEpisodes: {
    method: 'POST',
    path: '/',
    config: {
      description: 'Returns filtered episodes.',
      notes: 'Only return item with `DRM: true` and `episodeCount >0`.'
    },
    handler: (request, reply) => {
      const result = _.chain(request.payload.payload)

        // Reject invalid items.
        .reject(item => {
          const obj = Joi.validate(item, itemSchema, {
            allowUnknown: true,
            presence: 'required'
          });
          return !!obj.error;
        })

        .filter(item => item.drm && item.episodeCount > 0)

        .map(item => {
          return {
            image: item.image.showImage,
            slug: item.slug,
            title: item.title
          };
        })
        .value();

      return reply({response: result});
    }
  }
};

