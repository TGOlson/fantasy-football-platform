# Web App TODOs

## ✅ Completed (Milestone 4)

- ✅ Migrated from Tailwind + shadcn to Mantine
- ✅ Set up Mantine theme with Linear-inspired colors
- ✅ Built Login/Register pages with Mantine forms
- ✅ Built Dashboard with stat cards
- ✅ Built Leagues list page
- ✅ Built Players page with DataTable (search, filter, sort)
- ✅ Set up AppShell layout with responsive sidebar
- ✅ Integrated tRPC client with auth headers
- ✅ Auth context with JWT token management
- ✅ Protected routes

## 🔨 Next Up (Milestone 5)

### League Detail Page
- [ ] Create `/leagues/:id` route
- [ ] Display league info (name, season, teams)
- [ ] Show scoring rules summary
- [ ] List teams in league
- [ ] Add "Join League" functionality

### Team Management
- [ ] Create team detail page
- [ ] Show team roster
- [ ] Add roster management UI (when roster schema exists)

### UI Polish
- [ ] Add loading skeletons (Mantine Skeleton component)
- [ ] Better empty states with illustrations
- [ ] Add error boundaries
- [ ] Toast notifications for mutations (success/error)

## 📝 Future Enhancements

### Advanced Player Table Features
- [ ] Add sortable columns (Mantine DataTable supports this)
- [ ] Add pagination for large player lists
- [ ] Add row selection for roster management
- [ ] Add player stats columns (when stats exist)

### Mantine Components to Explore
- [ ] `Modal` - For dialogs (add player, create league)
- [ ] `Tabs` - For league pages (roster, matchup, standings)
- [ ] `NumberInput` - For scoring config
- [ ] `ActionIcon` - For icon buttons
- [ ] `Menu` - For dropdown actions
- [ ] `Skeleton` - For loading states
- [ ] `Badge` - Already using, but can expand (player status: Q, O, BYE)

### Performance
- [ ] Add proper loading states everywhere
- [ ] Optimize re-renders with React.memo if needed
- [ ] Lazy load routes with React.lazy

### Mobile
- [ ] Test on mobile devices
- [ ] Ensure AppShell collapses sidebar properly
- [ ] Touch-friendly interactions

## 📚 Documentation

See:
- `docs/tech-stack.md` - Overview of all frontend tech
- `docs/api-spec.md` - tRPC API endpoints and usage
