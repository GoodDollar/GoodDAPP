export const ProfilesSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Profiles',
  description: 'An user profiles local cache schema',
  type: 'object',
  properties: {
    _id: {
      description: 'Profile wallet address',
      type: 'string',
    },
    fullName: {
      description: 'Full name',
      type: 'string',
    },
    smallAvatar: {
      description: 'Small avatar asset CID',
      type: 'string',
    },
    lastUpdated: {
      description: 'Datetime of the last sync',
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['_id', 'lastUpdated'],
}
