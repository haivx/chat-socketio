"use client";
import { startTransition, useActionState } from "react";
import { Form, Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import * as actions from "@/actions";

export default function LoginForm() {
  const [formState, action, isLoading] = useActionState(actions.signIn, {
    errors: {},
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className="min-h-screen bg-green-950 flex justify-center items-center">
      <Card className="w-96 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <Form onSubmit={handleSubmit}>
          <CardBody className="space-y-4">
            <div>
              <Input
                name="username"
                type="text"
                isRequired
                placeholder="Username"
                className="w-full border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <Input
                name="email"
                type="text"
                isRequired
                placeholder="Email"
                className="w-full border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full border border-gray-300 rounded-xl"
              />
            </div>

            {formState.errors._form ? (
              <div className="p-2 bg-red-200 border rounded border-red-400">
                {formState.errors._form}
              </div>
            ) : null}
            <Button
              isLoading={isLoading}
              type="submit"
              className="w-full bg-[#2d9a4d] text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </Button>
          </CardBody>
        </Form>
      </Card>
    </div>
  );
}
