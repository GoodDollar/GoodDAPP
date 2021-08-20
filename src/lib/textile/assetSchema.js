export const AssetSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Asset',
  description: 'An IPFS storage schema',
  type: 'object',
  properties: {
    _id: {
      description: 'CID hash',
      type: 'string',
    },
    mime: {
      type: 'string',
      default: 'application/octet-stream',
    },
    size: {
      type: 'number',
      default: 0,
    },
    binary: {
      type: 'boolean',
      default: true,
    },
    dataUrl: {
      description: 'File data as data url string',
      type: 'string',
    },
  },
  required: ['_id', 'mime', 'size', 'binary', 'dataUrl'],
}
