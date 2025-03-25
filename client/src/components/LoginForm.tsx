// see SignupForm.js for comments
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import Auth from "../utils/auth";
import type { User } from "../models/User";

import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/mutations";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
const LoginForm = ({}: { handleModalClose: () => void }) => {
  const [userFormData, setUserFormData] = useState<User>({
    username: "",
    email: "",
    password: "",
    savedBooks: [],
  });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [Login, { loading, error }] = useMutation(LOGIN);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log(`${userFormData.email} is trying to login...`);
    /*
    We have 'data' here because the value returned would be
    {
      "data": {
        "login": {
          "token": "some-jwt-token",
          "user": {
            "_id": "123",
            "username": "JohnDoe",
            "email": "john@example.com",
            "savedBooks": [],
            "bookCount": 0
           }
        }
      }
    }
    */
    try {
      const { data } = await Login({
        variables: {
          email: userFormData.email,
          password: userFormData.password,
        },
      });

      console.log(`LoginForm ${JSON.stringify(data)}`);

      if (!data || !data.login) {
        throw new Error("Login failed!");
      }

      const { token } = data.login;
      Auth.login(token);
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({
      username: "",
      email: "",
      password: "",
      savedBooks: [],
    });
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <Alert variant="danger">{error.message}</Alert>}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant="danger"
        >
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your email"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email || ""}
            required
          />
          <Form.Control.Feedback type="invalid">
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password || ""}
            required
          />
          <Form.Control.Feedback type="invalid">
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
