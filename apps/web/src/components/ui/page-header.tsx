import { Breadcrumbs, Anchor, Title, Text, Group, Stack, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconChevronRight } from '@tabler/icons-react';

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badges?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badges,
}: PageHeaderProps) {
  return (
    <Stack gap="sm">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<IconChevronRight size={14} color="var(--mantine-color-gray-5)" />}
          styles={{
            separator: { marginLeft: 6, marginRight: 6 },
          }}
        >
          {breadcrumbs.map((item, index) =>
            item.to ? (
              <Anchor
                key={index}
                component={Link}
                to={item.to}
                size="sm"
                c="dimmed"
                fw={500}
                style={{
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {item.label}
              </Anchor>
            ) : (
              <Text key={index} size="sm" c="dimmed" fw={500}>
                {item.label}
              </Text>
            )
          )}
        </Breadcrumbs>
      )}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Group gap="md" align="center">
            <Title order={1} style={{ letterSpacing: '-0.03em' }}>
              {title}
            </Title>
            {badges}
          </Group>
          {subtitle && (
            <Text c="dimmed" mt={4} size="md">
              {subtitle}
            </Text>
          )}
        </Box>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
}
