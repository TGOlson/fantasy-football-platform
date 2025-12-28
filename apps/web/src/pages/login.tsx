import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Alert,
} from '@mantine/core';
import { useAuth } from '@/providers/auth-provider';
import { graphqlClient } from '@/lib/graphql-client';
import { LoginDocument } from '@/gql/graphql';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (variables: { email: string; password: string }) => {
      return graphqlClient.request(LoginDocument, variables);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginMutation.mutateAsync({ email, password });
      login(data.login.token, data.login.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        Fantasy Platform
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Custom scoring, your way
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} size="h3" mb="lg">
          Sign in
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="md"
          />

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <Button type="submit" fullWidth loading={loginMutation.isPending}>
            Sign in
          </Button>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--mantine-color-violet-6)' }}
          >
            Sign up
          </Link>
        </Text>
      </Paper>
    </Container>
  );
}
