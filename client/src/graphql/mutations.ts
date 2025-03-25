import { gql } from "@apollo/client";

/*  On the server-side typeDefs.ts
    createUser(username: String!, email:String!, password:String!): Auth
    type Auth {
      token: ID!
      user: User
    }
 */
export const CREATE_USER = gql`
  mutation createUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

/*  On the server-side typeDefs.ts
    login(email: String!, password: String!): Auth
    type Auth {
      token: ID!
      user: User
    }
 */
export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
        savedBooks {
          bookId
          title
          description
          authors
          image
          link
        }
        bookCount
      }
    }
  }
`;
/*  On the server-side typeDefs.ts
    saveBook(bookId:String!, title:String!, description: String, authors:[String]!, image:String, link:String): User
*/
export const SAVE_BOOK = gql`
  mutation saveBook(
    $bookId: String!
    $title: String!
    $description: String
    $authors: [String]!
    $image: String
    $link: String
  ) {
    saveBook(
      bookId: $bookId
      title: $title
      description: $description
      authors: $authors
      image: $image
      link: $link
    ) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        description
        authors
        image
        link
      }
      bookCount
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation deleteBook($bookId: String!) {
    deleteBook(bookId: $bookId) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        description
        authors
        image
        link
      }
      bookCount
    }
  }
`;
