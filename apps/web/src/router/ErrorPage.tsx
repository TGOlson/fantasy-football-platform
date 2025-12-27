import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Stack, Title, Text, Button, Paper, Center } from '@mantine/core';

export function ErrorPage() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Not Found';
      message =
        error.statusText || 'The page you are looking for does not exist';
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || error.data;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Center mt={80}>
      <Paper withBorder p="xl" radius="md" maw={500} w="100%">
        <Stack gap="md" align="center">
          <Title order={2}>{title}</Title>
          <Text c="dimmed" ta="center">
            {message}
          </Text>
          <Button component={Link} to="/" variant="light">
            Go Home
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
