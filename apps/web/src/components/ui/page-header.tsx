import { Breadcrumbs, Anchor, Title, Text, Group, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

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
    <Stack gap="xs">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator="/">
          {breadcrumbs.map((item, index) =>
            item.to ? (
              <Anchor
                key={index}
                component={Link}
                to={item.to}
                size="sm"
                c="dimmed"
              >
                {item.label}
              </Anchor>
            ) : (
              <Text key={index} size="sm" c="dimmed">
                {item.label}
              </Text>
            )
          )}
        </Breadcrumbs>
      )}
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="sm">
            <Title order={1}>{title}</Title>
            {badges}
          </Group>
          {subtitle && <Text c="dimmed">{subtitle}</Text>}
        </Stack>
        {actions && <Group gap="xs">{actions}</Group>}
      </Group>
    </Stack>
  );
}
