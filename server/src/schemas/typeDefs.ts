const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]!
    bookCount: Int!
  }

  type Book {
    _id: ID!
    bookId: String!
    title: String!
    description: String
    image: String
    link: String
    authors: [String]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    createUser(username: String!, email:String!, password:String!): Auth
    saveBook(bookId:String!, title:String!, description: String, authors:[String]!, image:String, link:String): User
    deleteBook(bookId: String!): User
  }
`;

export default typeDefs;
