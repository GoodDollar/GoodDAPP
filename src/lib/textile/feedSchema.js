export const FeedItemSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'FeedItem',
  description: 'A feed item schema',
  type: 'object',
  properties: {
    _id: {
      description: 'Field to contain ulid-based instance id',
      type: 'string',
    },
    status: {
      type: 'string',
      default: 'pending',
    },
    otplStatus: {
      type: 'string',
      default: '',
    },
    type: {
      description: 'item type',
      type: 'string',
    },
    date: {
      description: 'item update date',
      format: 'date-time',
      type: 'string',
    },
    createdDate: {
      description: 'item creation date',
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['_id', 'id', 'type', 'date', 'createdDate', 'status'],
}
