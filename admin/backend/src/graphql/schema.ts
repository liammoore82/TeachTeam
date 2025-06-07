import gql from "graphql-tag";

export const typeDefs = gql`
  type Pet {
    pet_id: ID!
    name: String!
    profiles: [Profile!]
  }

  type Profile {
    profile_id: ID!
    email: String!
    first_name: String!
    last_name: String!
    mobile: String
    street: String
    city: String
    state: String
    postcode: String
    pets: [Pet!]
  }

  type Query {
    profiles: [Profile!]!
    profile(id: ID!): Profile
    pets: [Pet!]!
    pet(id: ID!): Pet
  }

  type Mutation {
    createProfile(
      email: String!
      first_name: String!
      last_name: String!
      mobile: String
      street: String
      city: String
      state: String
      postcode: String
    ): Profile!

    updateProfile(
      id: ID!
      email: String
      first_name: String
      last_name: String
      mobile: String
      street: String
      city: String
      state: String
      postcode: String
    ): Profile!

    deleteProfile(id: ID!): Boolean!

    createPet(name: String!): Pet!
    updatePet(id: ID!, name: String!): Pet!
    deletePet(id: ID!): Boolean!

    addPetToProfile(profileId: ID!, petId: ID!): Profile!
    removePetFromProfile(profileId: ID!, petId: ID!): Profile!
  }
`;
