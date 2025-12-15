import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Alert } from '@mantine/core';
import { useAuth } from '@/lib/auth-context';
import { trpc } from '@/lib/trpc';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ name, email, password });
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
          Create an account
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            mb="md"
          />

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            mb="md"
          />

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            loading={registerMutation.isPending}
          >
            Create account
          </Button>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--mantine-color-violet-6)' }}>
            Sign in
          </Link>
        </Text>
      </Paper>
    </Container>
  );
}
