import { User } from "../models/index.js";
import { UserDocument } from "../models/User.js";
import { signToken, AuthenticationError } from "../utils/auth.js";

interface Context {
  user?: UserDocument;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface CreateUserArgs {
  username: string;
  email: string;
  password: string;
}

interface SaveBookArgs {
  bookId: string;
  title: string;
  description: string;
  image: string;
  link: string;
  authors: string[];
}

interface DeleteBookArgs {
  bookId: string;
}

const resolvers = {
  Query: {
    me: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<UserDocument | null> => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      return await User.findById(context.user._id).populate("savedBooks");
    },
  },

  Mutation: {
    login: async (
      _parent: any,
      { email, password }: LoginArgs
    ): Promise<{ token: string; user: UserDocument }> => {
      const user = await User.findOne({ email });
      if (!user) {
        throw AuthenticationError;
      }

      const is_password_correct = await user.isCorrectPassword(password);
      if (!is_password_correct) {
        throw new AuthenticationError("Not authenticated");
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    createUser: async (
      _parent: any,
      { username, email, password }: CreateUserArgs
    ): Promise<{ token: string; user: UserDocument }> => {
      console.log(
        `username: ${username}, email: ${email}, password: ${password}`
      );

      try {
        const user = await User.create({ username, email, password });

        console.log("user created is: ", JSON.stringify(user));
        const token = signToken(user.username, user.email, user._id);
        console.log("token is: ", token);
        return { token, user };
      } catch (error) {
        console.log(error);
        throw new Error("Unable to create user");
      }
    },

    saveBook: async (
      _parent: unknown,
      { bookId, title, authors, description, link, image }: SaveBookArgs,
      context: Context
    ): Promise<UserDocument | null> => {
      console.log(`Resolver.saveBook... ${JSON.stringify(context.user)}`);

      if (!context.user) {
        throw new AuthenticationError("You must be logged in to save a book.");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: {
              savedBooks: { bookId, title, authors, description, link, image },
            },
          },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error("User not found.");
        }

        return updatedUser;
      } catch (error) {
        console.log("Error savinga book!");
        throw new Error("Failed to save a book");
      }
    },

    deleteBook: async (
      _parent: unknown,
      { bookId }: DeleteBookArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to delete a book."
        );
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

        return updatedUser;
      } catch (error) {
        console.error("Error deleting a book ", error);
        throw new Error("Failed to delete book");
      }
    },
  },
};

export default resolvers;
