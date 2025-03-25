import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import Auth from "../utils/auth";
import type { User } from "../models/User";

import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../graphql/mutations";

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
const SignupForm = ({}: { handleModalClose: () => void }) => {
  // set initial form state
  const [userFormData, setUserFormData] = useState<User>({
    username: "",
    email: "",
    password: "",
    savedBooks: [],
  });
  // set state for form validation
  const [validated] = useState(false);
  // set state for alert
  const [showAlert, setShowAlert] = useState(false);
  const [CreateUser, { loading, error }] = useMutation(CREATE_USER);

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

    try {
      /*
      This would be a successful result
      {
        "data": {
          "createUser": {
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
      console.log(`${userFormData.email} is trying to signup...`);

      const { data } = await CreateUser({
        variables: {
          username: userFormData.username,
          email: userFormData.email,
          password: userFormData.password,
        },
      });

      if (!data || !data.createUser) {
        throw new Error("Create user failed!");
      }

      const { token } = data.createUser;
      Auth.login(token);

      console.log("From SignupForm token stored in the localstorage");
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
      {/* This is needed for the validation functionality above */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* show alert if server response is bad */}
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant="danger"
        >
          Something went wrong with your signup!
        </Alert>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="username">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your username"
            name="username"
            onChange={handleInputChange}
            value={userFormData.username || ""}
            required
          />
          <Form.Control.Feedback type="invalid">
            Username is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
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
          disabled={
            loading || // Prevent submission while mutation is running
            !(
              userFormData.username &&
              userFormData.email &&
              userFormData.password
            )
          }
          type="submit"
          variant="success"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>

        {error && <p style={{ color: "red" }}>{error.message}</p>}
      </Form>
    </>
  );
};

export default SignupForm;
